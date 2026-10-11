/* Keys and API requests stay in the trusted extension service worker. */
if (typeof importScripts === 'function') importScripts('shared.js', 'service.js');
(function (root, factory) {
    const isNode = typeof module === 'object' && module.exports;
    const api = factory(isNode ? require('./shared.js') : root.DiscolatorShared, isNode ? require('./service.js') : root.DiscolatorService);
    if (isNode) module.exports = api;
    else api.install(root.chrome);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (shared, serviceModule) {
    'use strict';
    const CACHE_KEY = 'translationCacheV2';
    const KEY_NAME = 'openRouterApiKey';
    const BAD_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
    const contentActions = new Set(['state.get', 'translate', 'cache.patch', 'classes.save']);
    const optionsActions = new Set(['state.get', 'settings.get', 'settings.save', 'key.delete', 'key.check', 'cache.list', 'cache.patch', 'cache.import', 'classes.save']);
    const { ServiceError } = serviceModule;
    function fail(code, message) { throw new ServiceError(code, message); }
    function record(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
    function safeId(id) { return typeof id === 'string' && !!id && id.length <= 160 && !BAD_KEYS.has(id); }
    function normalizeLanguage(value) {
        try { return shared.normalizeLanguage(value); } catch (_) { fail('INVALID_REQUEST', '언어 코드가 올바르지 않습니다.'); }
    }
    function strings(value) { return Array.isArray(value) && value.length <= 300 && value.every(item => typeof item === 'string' && item.length <= 96000); }
    function entry(value, strict = true) {
        if (!record(value) || !strings(value.o) || !strings(value.t) || (strict && value.o.length !== value.t.length)) fail('INVALID_CACHE', '번역 데이터 형식이 올바르지 않습니다.');
        const clean = { o: [...value.o], t: [...value.t], ts: Number.isFinite(value.ts) ? value.ts : 0 };
        if (value.ot !== undefined) {
            if (!strings(value.ot) || (strict && value.ot.length !== value.o.length)) fail('INVALID_CACHE', '수정 전 번역 데이터 형식이 올바르지 않습니다.');
            clean.ot = [...value.ot];
        }
        if (value.r === true) clean.r = true;
        for (const field of ['hash', 'model']) if (typeof value[field] === 'string' && value[field].length < 256) clean[field] = value[field];
        return clean;
    }
    function flatCache(value, strict = true) {
        if (!record(value)) fail('INVALID_CACHE', '번역 데이터 형식이 올바르지 않습니다.');
        const output = {};
        for (const [id, item] of Object.entries(value)) {
            if (!safeId(id)) fail('INVALID_CACHE', '번역 데이터의 메시지 ID가 올바르지 않습니다.');
            output[id] = entry(item, strict);
        }
        return output;
    }
    function byLanguage(value, strict = true) {
        if (!record(value)) fail('INVALID_CACHE', '언어별 번역 데이터 형식이 올바르지 않습니다.');
        const output = {};
        for (const [code, items] of Object.entries(value)) {
            if (BAD_KEYS.has(code)) fail('INVALID_CACHE', '번역 데이터의 언어가 올바르지 않습니다.');
            const lang = normalizeLanguage(code);
            output[lang] = { ...(output[lang] || {}), ...flatCache(items, strict) };
        }
        return output;
    }
    function createBackground({ chromeApi, service = serviceModule.createService() }) {
        let queue = Promise.resolve();
        let ready;
        function mutate(operation) {
            const pending = queue.then(operation);
            queue = pending.catch(() => {});
            return pending;
        }
        async function store(values) {
            try { await chromeApi.storage.local.set(values); }
            catch (_) { fail('STORAGE', '저장 공간이 부족하거나 데이터를 저장할 수 없습니다. 백업 후 캐시를 정리해 주세요.'); }
        }
        async function initialize() {
            // Calling this before any read prevents content scripts from obtaining keys.
            await chromeApi.storage.local.setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' });
            const stored = await chromeApi.storage.local.get(['settings', 'settingsRevision', CACHE_KEY, 'translationCache', 'cacheSchemaVersion']);
            const update = {};
            let settings;
            try { settings = shared.normalizeSettings(stored.settings); }
            catch (_) { settings = { ...shared.DEFAULT_SETTINGS }; }
            if (JSON.stringify(settings) !== JSON.stringify(stored.settings)) update.settings = settings;
            if (!Number.isSafeInteger(stored.settingsRevision) || stored.settingsRevision < 0) update.settingsRevision = 0;
            const hasLegacy = record(stored.translationCache);
            // A worker can stop between the durable V2 write and legacy cleanup.
            // Reconcile again whenever the legacy copy exists: the schema marker
            // alone is not proof that a complete, readable V2 cache is present.
            if (stored.cacheSchemaVersion !== 2 || !record(stored[CACHE_KEY]) || hasLegacy) {
                const cache = record(stored[CACHE_KEY]) ? stored[CACHE_KEY] : {};
                const existingEnglish = record(cache.en) ? cache.en : {};
                const legacy = hasLegacy ? stored.translationCache : {};
                const recoverableEnglish = Object.fromEntries(Object.entries(existingEnglish).filter(([id, item]) => {
                    if (!Object.hasOwn(legacy, id)) return true;
                    try { entry(item, false); return true; }
                    catch (_) { return false; } // Recover this ID from its legacy copy.
                }));
                // Preserve all original records, including old mismatched segment arrays.
                // Rendering clients skip incompatible records; options can export/delete them.
                update[CACHE_KEY] = { ...cache, en: { ...legacy, ...recoverableEnglish } };
                update.cacheSchemaVersion = 2;
            }
            if (Object.keys(update).length) await store(update);
            // Remove the duplicate only after the migrated data has been persisted.
            // An unrecognizable legacy value stays available for manual recovery.
            if (hasLegacy) await chromeApi.storage.local.remove('translationCache');
        }
        ready = initialize();
        // Rejections are still returned through handleMessage; avoid an unhandled promise
        // when the worker starts before a caller sends the first request.
        ready.catch(() => {});
        function senderType(sender) {
            if (!sender || sender.id !== chromeApi.runtime.id || typeof sender.url !== 'string') return null;
            try {
                const url = new URL(sender.url);
                const options = new URL(chromeApi.runtime.getURL('options.html'));
                if (url.protocol === options.protocol && url.host === options.host && url.pathname === options.pathname) return 'options';
                if (sender.tab && url.protocol === 'https:' && (url.hostname === 'discord.com' || url.hostname.endsWith('.discord.com'))) return 'content';
            } catch (_) { /* Not a permitted extension/document URL. */ }
            return null;
        }
        async function broadcast() {
            const message = { action: 'state.changed' };
            // Runtime messages reach extension pages; tab messages reach isolated scripts.
            try { await chromeApi.runtime.sendMessage(message); } catch (_) { /* No options page open. */ }
            try {
                const tabs = await chromeApi.tabs.query({ url: ['https://discord.com/*', 'https://*.discord.com/*'] });
                await Promise.all(tabs.map(async tab => { try { await chromeApi.tabs.sendMessage(tab.id, message); } catch (_) { /* Tab navigated or no script. */ } }));
            } catch (_) { /* Tab discovery unavailable during worker teardown. */ }
        }
        async function snapshot() {
            await queue;
            const stored = await chromeApi.storage.local.get(['settings', 'settingsRevision', KEY_NAME, CACHE_KEY, 'discordClasses']);
            return { settings: shared.normalizeSettings(stored.settings), revision: stored.settingsRevision || 0, hasApiKey: typeof stored[KEY_NAME] === 'string' && !!stored[KEY_NAME].trim(), cache: stored[CACHE_KEY] || {}, discordClasses: stored.discordClasses || {} };
        }
        async function handleMessage(request, sender) {
            try {
                const type = senderType(sender);
                if (!record(request) || !type || !(type === 'options' ? optionsActions : contentActions).has(request.action)) fail('FORBIDDEN', '이 요청을 실행할 권한이 없습니다.');
                await ready;
                switch (request.action) {
                    case 'state.get': {
                        const state = await snapshot();
                        return { success: true, ...state, cache: state.cache[state.settings.readingLanguage] || {} };
                    }
                    case 'settings.get': {
                        const { settings, revision, hasApiKey } = await snapshot();
                        return { success: true, settings, revision, hasApiKey };
                    }
                    case 'settings.save': {
                        if (!record(request.settings)) fail('INVALID_REQUEST', '설정 형식이 올바르지 않습니다.');
                        const result = await mutate(async () => {
                            const old = await chromeApi.storage.local.get(['settings', 'settingsRevision', KEY_NAME]);
                            let settings;
                            try { settings = shared.normalizeSettings({ ...old.settings, ...request.settings }); }
                            catch (_) { fail('INVALID_REQUEST', '언어 설정을 확인해 주세요.'); }
                            const update = { settings, settingsRevision: (old.settingsRevision || 0) + 1 };
                            if (request.apiKey !== undefined && typeof request.apiKey !== 'string') fail('INVALID_KEY', 'API 키 형식을 확인해 주세요.');
                            if (request.apiKey?.trim()) {
                                const key = request.apiKey.trim();
                                if (key.length > 512 || /\s/.test(key)) fail('INVALID_KEY', 'API 키는 공백 없이 입력해 주세요.');
                                update[KEY_NAME] = key;
                            }
                            await store(update);
                            return { success: true, settings, revision: update.settingsRevision, hasApiKey: !!(update[KEY_NAME] || old[KEY_NAME]) };
                        });
                        void broadcast(); return result;
                    }
                    case 'key.delete': {
                        const result = await mutate(async () => {
                            const old = await chromeApi.storage.local.get(['settingsRevision', 'settings']);
                            const revision = (old.settingsRevision || 0) + 1;
                            // A single storage write makes removal and revision atomic.
                            await store({ [KEY_NAME]: '', settingsRevision: revision });
                            return { success: true, settings: shared.normalizeSettings(old.settings), revision, hasApiKey: false };
                        });
                        void broadcast(); return result;
                    }
                    case 'key.check': {
                        await queue;
                        const old = await chromeApi.storage.local.get(KEY_NAME);
                        return { success: true, ...await service.checkKey(old[KEY_NAME]) };
                    }
                    case 'cache.list': {
                        const state = await snapshot();
                        const bytes = await chromeApi.storage.local.getBytesInUse(CACHE_KEY);
                        return { success: true, cache: state.cache, bytes };
                    }
                    case 'cache.patch': {
                        const lang = normalizeLanguage(request.language);
                        const upsert = flatCache(request.upsert || {});
                        const remove = request.remove || [];
                        if (!Array.isArray(remove) || remove.some(id => !safeId(id))) fail('INVALID_CACHE', '삭제할 메시지 목록이 올바르지 않습니다.');
                        const result = await mutate(async () => {
                            const old = await chromeApi.storage.local.get(CACHE_KEY);
                            const all = old[CACHE_KEY] || {};
                            const cache = { ...(all[lang] || {}), ...upsert };
                            for (const id of remove) delete cache[id];
                            await store({ [CACHE_KEY]: { ...all, [lang]: cache } });
                            return { success: true, cache };
                        });
                        void broadcast(); return result;
                    }
                    case 'cache.import': {
                        if (!record(request.data) || new TextEncoder().encode(JSON.stringify(request.data)).length > 5 * 1024 * 1024) fail('INVALID_CACHE', '5MiB 이하의 번역 백업 파일을 선택해 주세요.');
                        let imported;
                        if (request.data.schemaVersion === 2) imported = byLanguage(request.data.translationCacheByLanguage, false);
                        else if (request.data.translationCache) imported = { en: flatCache(request.data.translationCache, false) };
                        else fail('INVALID_CACHE', '지원하는 번역 백업 형식이 아닙니다.');
                        const result = await mutate(async () => {
                            const old = await chromeApi.storage.local.get(CACHE_KEY);
                            const all = { ...(old[CACHE_KEY] || {}) };
                            for (const [lang, records] of Object.entries(imported)) all[lang] = { ...(all[lang] || {}), ...records };
                            await store({ [CACHE_KEY]: all });
                            return { success: true, cache: all };
                        });
                        void broadcast(); return result;
                    }
                    case 'classes.save': {
                        if (!record(request.classes)) fail('INVALID_REQUEST', 'Discord 요소 설정이 올바르지 않습니다.');
                        const classes = {};
                        for (const [key, value] of Object.entries(request.classes)) {
                            if (BAD_KEYS.has(key) || key.length > 80 || typeof value !== 'string' || value.length > 500) fail('INVALID_REQUEST', 'Discord 요소 설정이 올바르지 않습니다.');
                            classes[key] = value;
                        }
                        await mutate(() => store({ discordClasses: classes }));
                        void broadcast(); return { success: true };
                    }
                    case 'translate': {
                        await queue;
                        const old = await chromeApi.storage.local.get(['settings', 'settingsRevision', KEY_NAME]);
                        const revision = old.settingsRevision || 0;
                        const result = await service.translate(request, { apiKey: old[KEY_NAME], settings: shared.normalizeSettings(old.settings), revision });
                        await queue;
                        const current = await chromeApi.storage.local.get('settingsRevision');
                        if ((current.settingsRevision || 0) !== revision) fail('STALE_SETTINGS', '번역 중 설정이 변경되어 결과를 적용하지 않았습니다. 다시 시도해 주세요.');
                        return { success: true, ...result };
                    }
                }
                fail('INVALID_REQUEST', '지원하지 않는 요청입니다.');
            } catch (error) {
                if (error instanceof ServiceError) return { success: false, error: error.message, code: error.code,
                    ...(error.diagnostics ? { diagnostics: error.diagnostics } : {}) };
                // Browser/provider exceptions can contain sensitive input. Never forward them.
                return { success: false, error: '확장 프로그램 요청을 처리하지 못했습니다. 옵션과 저장 공간을 확인해 주세요.', code: 'INTERNAL' };
            }
        }
        return { handleMessage, ready, snapshot };
    }
    function install(chromeApi) {
        const app = createBackground({ chromeApi });
        chromeApi.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request?.action === 'state.changed') return false;
            app.handleMessage(request, sender).then(sendResponse);
            return true;
        });
        return app;
    }
    return { createBackground, install };
});
