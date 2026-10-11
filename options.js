'use strict';

(() => {
    const Shared = globalThis.DiscolatorShared;
    const $ = id => document.getElementById(id);
    const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
    const unsafeKeys = new Set(['__proto__', 'prototype', 'constructor']);
    let cacheData = {};
    let settings = null;
    let settingsDirty = false;
    let hasApiKey = false;
    let settingsBusy = false;
    let cacheBusy = false;
    let settingsRead = 0;
    let cacheRead = 0;
    let editing = null;
    let visibleEntries = [];
    let isDragging = false;
    let dragCheckValue = true;
    let dragStartIndex = -1;
    let dragCurrentIndex = -1;
    let originalStates = [];
    const selected = new Set();

    // Localize shared errors only on this page; keep provider details unchanged.
    const errorMessages = new Map([
        ['올바른 언어 코드를 입력하세요. 예: ko, en, ja, zh-Hant', 'Enter a valid language code, such as ko, en, ja, or zh-Hant.'],
        ['지원하지 않는 언어 코드 형식입니다.', 'Unsupported language code format.'],
        ['번역할 목표 언어를 지정하세요.', 'Specify a target language for translation.'],
        ['설정 형식이 올바르지 않습니다.', 'Invalid settings format.'],
        ['OpenRouter 모델 ID를 입력하세요. 예: google/gemini-3.1-flash-lite', 'Enter an OpenRouter model ID, such as google/gemini-3.1-flash-lite.'],
        ['언어 코드가 올바르지 않습니다.', 'Invalid language code.'],
        ['번역 데이터 형식이 올바르지 않습니다.', 'Invalid translation data format.'],
        ['수정 전 번역 데이터 형식이 올바르지 않습니다.', 'Invalid original translation data format.'],
        ['번역 데이터의 메시지 ID가 올바르지 않습니다.', 'The translation data contains an invalid message ID.'],
        ['언어별 번역 데이터 형식이 올바르지 않습니다.', 'Invalid format for translations grouped by language.'],
        ['번역 데이터의 언어가 올바르지 않습니다.', 'The translation data contains an invalid language.'],
        ['저장 공간이 부족하거나 데이터를 저장할 수 없습니다. 백업 후 캐시를 정리해 주세요.', 'Storage is full or data could not be saved. Back up your translations, then clear the cache.'],
        ['이 요청을 실행할 권한이 없습니다.', 'You do not have permission to perform this request.'],
        ['언어 설정을 확인해 주세요.', 'Check your language settings.'],
        ['API 키 형식을 확인해 주세요.', 'Check the API key format.'],
        ['API 키는 공백 없이 입력해 주세요.', 'Enter the API key without spaces.'],
        ['삭제할 메시지 목록이 올바르지 않습니다.', 'Invalid list of messages to delete.'],
        ['5MiB 이하의 번역 백업 파일을 선택해 주세요.', 'Select a translation backup file no larger than 5 MiB.'],
        ['지원하는 번역 백업 형식이 아닙니다.', 'Unsupported translation backup format.'],
        ['확장 프로그램 요청을 처리하지 못했습니다. 옵션과 저장 공간을 확인해 주세요.', 'Could not process the extension request. Check your settings and available storage.'],
        ['인증이 거부되었습니다. 옵션에서 저장된 키를 확인해 주세요. 키 확인이 성공한다면 아래 API의 별도 이용 권한을 확인하세요.', 'Authentication was rejected. Check your saved key in settings. If the key check succeeds, check access permissions for the API below.'],
        ['요청 접근이 거부되었습니다. 모델 이용 권한·계정 정책·지역 제한을 확인해 주세요. 403만으로 API 키 오류라고 단정할 수는 없습니다.', 'Access was denied. Check model access, account policies, and regional restrictions. A 403 response alone does not mean the API key is invalid.'],
        ['모델 ID, 요청 형식 또는 모델이 지원하는 기능을 확인해 주세요.', 'Check the model ID, request format, and features supported by the model.'],
        ['OpenRouter 잔액 또는 키의 사용 한도를 확인해 주세요.', 'Check your OpenRouter balance or the spending limit for this key.'],
        ['요청 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.', 'The request limit has been reached. Try again shortly.'],
        ['OpenRouter에서 요청한 모델이나 API를 사용할 수 없습니다.', 'The requested model or API is unavailable on OpenRouter.'],
        ['OpenRouter 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.', 'The OpenRouter request failed. Try again shortly.'],
        ['옵션에서 OpenRouter API 키를 저장해 주세요.', 'Save an OpenRouter API key in settings.'],
        ['응답 시간이 초과되었습니다. 다시 시도해 주세요.', 'The request timed out. Please try again.'],
        ['응답 시간이 초과되었습니다. 번역 범위를 줄이거나 다시 시도해 주세요.', 'The request timed out. Reduce the translation size or try again.'],
        ['OpenRouter에 연결할 수 없습니다. 네트워크 연결을 확인해 주세요.', 'Could not connect to OpenRouter. Check your network connection.'],
        ['OpenRouter 응답을 읽을 수 없습니다.', 'Could not read the OpenRouter response.'],
        ['API 키 확인 응답이 올바르지 않습니다.', 'Invalid API key verification response.'],
        ['실패 단계: API 키 확인', 'Failed stage: API key check'],
        ['실패 단계: 언어 감지', 'Failed stage: Language detection'],
        ['실패 단계: 번역', 'Failed stage: Translation'],
        ['HTTP 상태: 응답 없음 (네트워크 연결·프록시 확인)', 'HTTP status: No response (check your network connection or proxy)']
    ]);
    const diagnosticLabels = [
        ['모델: ', 'Model: '], ['HTTP 상태: ', 'HTTP status: '],
        ['제공자 오류 코드: ', 'Provider error code: '], ['제공자 설명: ', 'Provider message: '],
        ['제공자: ', 'Provider: '], ['요청 ID: ', 'Request ID: ']
    ];

    function englishError(message) {
        return message.split('\n').map(line => {
            if (errorMessages.has(line)) return errorMessages.get(line);
            const label = diagnosticLabels.find(([original]) => line.startsWith(original));
            return label ? label[1] + line.slice(label[0].length) : line;
        }).join('\n');
    }

    function status(id, message, error = false) {
        $(id).textContent = error ? englishError(message) : message;
        $(id).classList.toggle('error', error);
        if (id === 'settingsStatus') {
            $('settingsErrorActions').hidden = !error || !message;
            $('settingsErrorCopyStatus').textContent = '';
        }
    }

    async function copySettingsError() {
        const message = $('settingsStatus');
        try {
            await navigator.clipboard.writeText(message.textContent);
            $('settingsErrorCopyStatus').textContent = 'Error details copied.';
        } catch (_) {
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(message);
            selection?.removeAllRanges();
            selection?.addRange(range);
            $('settingsErrorCopyStatus').textContent = 'Automatic copying failed. Press Ctrl+C or ⌘C to copy the selected error details.';
        }
    }

    async function request(action, payload = {}) {
        let response;
        try {
            response = await chrome.runtime.sendMessage({ action, ...payload });
        } catch (_) {
            throw new Error('Could not connect to the extension. Reopen the settings page.');
        }
        if (!response?.success) throw new Error(response?.error || 'Could not process the request. Please try again.');
        return response;
    }

    function setSettingsBusy(value) {
        settingsBusy = value;
        $('settingsFields').disabled = value || !settings;
        updateKeyStatus();
    }

    function updateKeyStatus() {
        $('keyStatus').textContent = hasApiKey ? 'An API key is saved.' : 'No API key is saved.';
        $('checkKeyBtn').disabled = settingsBusy || !hasApiKey;
        $('deleteKeyBtn').disabled = settingsBusy || !hasApiKey;
    }

    function applySettings(result, force = false) {
        settings = result.settings;
        hasApiKey = Boolean(result.hasApiKey);
        if (!settingsDirty || force) {
            $('readingLanguage').value = settings.readingLanguage;
            $('writingLanguage').value = settings.writingLanguage;
            $('translationModel').value = settings.translationModel;
            if (force) $('apiKey').value = '';
            settingsDirty = false;
        }
        setSettingsBusy(settingsBusy);
    }

    async function loadSettings() {
        const read = ++settingsRead;
        try {
            const result = await request('settings.get');
            if (read !== settingsRead) return;
            applySettings(result);
        } catch (error) {
            status('settingsStatus', error.message, true);
        }
    }

    async function saveSettings(event) {
        event.preventDefault();
        if (settingsBusy) return;
        let next;
        try {
            next = Shared.normalizeSettings({
                ...settings,
                readingLanguage: Shared.normalizeLanguage($('readingLanguage').value.trim()),
                writingLanguage: Shared.normalizeLanguage($('writingLanguage').value.trim()),
                translationModel: $('translationModel').value.trim()
            });
        } catch (error) {
            status('settingsStatus', error.message, true);
            return;
        }
        const apiKey = $('apiKey').value.trim();
        setSettingsBusy(true);
        status('settingsStatus', 'Saving…');
        ++settingsRead;
        try {
            const result = await request('settings.save', { settings: next, ...(apiKey ? { apiKey } : {}) });
            ++settingsRead;
            applySettings(result, true);
            status('settingsStatus', 'Settings saved.');
        } catch (error) {
            status('settingsStatus', error.message, true);
        } finally {
            setSettingsBusy(false);
        }
    }

    async function checkKey() {
        if (settingsBusy || !hasApiKey) return;
        setSettingsBusy(true);
        status('settingsStatus', 'Checking saved key…');
        try {
            await request('key.check');
            status('settingsStatus', 'OpenRouter authentication succeeded with your saved key. Check model availability and account balance separately.');
        } catch (error) {
            status('settingsStatus', error.message, true);
        } finally {
            setSettingsBusy(false);
        }
    }

    async function deleteKey() {
        if (settingsBusy || !hasApiKey || !confirm('Delete the API key saved in this browser?')) return;
        setSettingsBusy(true);
        ++settingsRead;
        try {
            await request('key.delete');
            ++settingsRead;
            hasApiKey = false;
            $('apiKey').value = '';
            status('settingsStatus', 'Saved API key deleted.');
        } catch (error) {
            status('settingsStatus', error.message, true);
        } finally {
            setSettingsBusy(false);
        }
    }

    function entryKey(language, id) { return JSON.stringify([language, id]); }

    function allEntries() {
        return Object.entries(cacheData).flatMap(([language, entries]) =>
            Object.entries(entries).filter(([, data]) => data && Array.isArray(data.o) && Array.isArray(data.t) && [...data.o, ...data.t].every(part => typeof part === 'string')).map(([id, data]) => ({ language, id, data, key: entryKey(language, id) }))
        );
    }

    function updateCacheLanguages() {
        const current = $('cacheLanguage').value;
        $('cacheLanguage').replaceChildren(new Option('All languages', ''));
        for (const language of Object.keys(cacheData).sort()) {
            $('cacheLanguage').append(new Option(Shared.languageName(language), language));
        }
        if (Object.hasOwn(cacheData, current)) $('cacheLanguage').value = current;
    }

    async function loadCache() {
        const read = ++cacheRead;
        const result = await request('cache.list');
        if (read !== cacheRead) return;
        cacheData = result.cache || {};
        const bytes = Number(result.bytes) || 0;
        $('cacheSizeValue').textContent = bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(2)} MB` : `${(bytes / 1024).toFixed(2)} KB`;
        updateCacheLanguages();
        if (!editing) renderTable();
    }

    const icons = {
        edit: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19.2929 9.8299L19.9409 9.18278C21.353 7.77064 21.353 5.47197 19.9409 4.05892C18.5287 2.64678 16.2292 2.64678 14.817 4.05892L14.1699 4.70694L19.2929 9.8299ZM12.8962 5.97688L5.18469 13.6906L10.3085 18.813L18.0201 11.0992L12.8962 5.97688ZM4.11851 15.254L8.75044 19.886L3.48646 20.9001C3.13616 20.9678 2.82798 20.658 2.89694 20.3072L4.11851 15.254Z"></path></svg>',
        delete: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z"></path></svg>',
        revert: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#B9BBBE" d="M17.65,6.35 C16.2,4.9 14.21,4 12,4 C7.58,4 4.01,7.58 4.01,12 C4.01,16.42 7.58,20 12,20 C15.73,20 18.84,17.45 19.73,14 L17.65,14 C16.83,16.33 14.61,18 12,18 C8.69,18 6,15.31 6,12 C6,8.69 8.69,6 12,6 C13.66,6 15.14,6.69 16.22,7.78 L13,11 L20,11 L20,4 L17.65,6.35 L17.65,6.35 Z"/></svg>'
    };

    function actionButton(kind, title, handler) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `action-btn ${kind}-btn`;
        button.title = title;
        button.setAttribute('aria-label', title);
        button.innerHTML = icons[kind]; // Static, bundled SVG only.
        button.disabled = cacheBusy;
        button.addEventListener('click', event => { event.stopPropagation(); handler(); });
        return button;
    }

    async function copyText(text, label) {
        try {
            await navigator.clipboard.writeText(text);
            showToast(label);
        } catch (_) {
            status('cacheStatus', 'Could not copy the text. Check your browser clipboard permissions.', true);
        }
    }

    function renderTable() {
        if (editing) return;
        const search = $('searchInput').value.toLowerCase();
        const languageFilter = $('cacheLanguage').value;
        visibleEntries = allEntries().filter(({ language, data }) =>
            (!languageFilter || language === languageFilter) &&
            (!search || data.o.join(' ').toLowerCase().includes(search) || data.t.join(' ').toLowerCase().includes(search))
        ).sort((a, b) => b.data.ts - a.data.ts);
        selected.clear();
        isDragging = false;
        const checkboxes = [];
        const fragment = document.createDocumentFragment();
        for (const entry of visibleEntries) {
            const { language, id, data, key } = entry;
            const row = document.createElement('tr');
            const selectionCell = document.createElement('td');
            selectionCell.className = 'checkbox-cell';
            selectionCell.style.textAlign = 'center';
            const wrapper = document.createElement('div');
            wrapper.className = 'checkbox-wrapper';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'row-checkbox';
            checkbox.value = id;
            checkbox.disabled = cacheBusy;
            checkbox.setAttribute('aria-label', `Select ${Shared.languageName(language)} translation`);
            wrapper.append(checkbox);
            selectionCell.append(wrapper);
            const index = checkboxes.length;
            checkboxes.push(checkbox);
            const updateDragSelection = () => {
                const start = Math.min(dragStartIndex, dragCurrentIndex);
                const end = Math.max(dragStartIndex, dragCurrentIndex);
                checkboxes.forEach((item, position) => {
                    const checked = position >= start && position <= end ? dragCheckValue : originalStates[position];
                    if (item.checked !== checked) {
                        item.checked = checked;
                        item.dispatchEvent(new Event('change'));
                    }
                });
            };
            selectionCell.addEventListener('mousedown', event => {
                if (event.button !== 0 || cacheBusy) return;
                event.preventDefault();
                isDragging = true;
                dragCheckValue = !checkbox.checked;
                dragStartIndex = index;
                dragCurrentIndex = index;
                originalStates = checkboxes.map(item => item.checked);
                updateDragSelection();
            });
            selectionCell.addEventListener('mouseenter', () => {
                if (isDragging) { dragCurrentIndex = index; updateDragSelection(); }
            });
            checkbox.addEventListener('click', event => {
                // Mouse selection is handled by mousedown; keyboard activation remains native.
                if (event.detail) event.preventDefault();
            });
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) selected.add(key); else selected.delete(key);
                row.classList.toggle('selected', checkbox.checked);
                updateSelection();
            });

            const originalCell = document.createElement('td');
            originalCell.className = 'text-cell orig-text';
            originalCell.title = 'Click to copy';
            originalCell.dir = 'auto';
            originalCell.textContent = data.o.join(' ');
            originalCell.addEventListener('click', () => copyText(data.o.join(' '), 'Copied original text'));
            const translationCell = document.createElement('td');
            translationCell.className = 'text-cell trans-text';
            translationCell.title = `Click to copy. Double click to edit. (${Shared.languageName(language)})`;
            translationCell.dir = 'auto';
            const translation = document.createElement('span');
            translation.className = 'trans-content';
            translation.textContent = data.t.join(' ');
            translationCell.append(translation);
            translationCell.addEventListener('click', event => {
                if (editing?.key === key || event.target.closest('.revert-btn')) return;
                void copyText(data.t.join(' '), 'Copied translated text');
            });
            translationCell.addEventListener('dblclick', () => openEditor(entry, translationCell));
            const editable = data.t.length > 0 && data.o.length === data.t.length && (!data.ot || data.ot.length === data.o.length);
            if (data.ot) {
                const revert = document.createElement('span');
                revert.className = 'revert-btn';
                revert.title = 'Revert to original translation';
                revert.innerHTML = icons.revert;
                revert.addEventListener('click', event => { event.stopPropagation(); void revertEntry(entry); });
                translationCell.append(revert);
            }
            const dateCell = document.createElement('td');
            dateCell.className = 'timestamp';
            dateCell.textContent = new Date(data.ts).toLocaleString();
            const actionCell = document.createElement('td');
            actionCell.className = 'row-actions';
            const editButton = actionButton('edit', 'Edit', () => openEditor(entry, translationCell));
            editButton.disabled = cacheBusy || !editable;
            if (!editable) editButton.title = 'This translation uses an older format and cannot be edited. Translate it again in Discord.';
            actionCell.append(editButton, actionButton('delete', 'Delete', () => deleteEntries([entry])));
            row.append(selectionCell, originalCell, translationCell, dateCell, actionCell);
            fragment.append(row);
        }
        $('tableBody').replaceChildren(fragment);
        $('selectAllCheckbox').checked = false;
        updateSelection();
    }

    function updateSelection() {
        const count = selected.size;
        $('selectionActionBar').classList.toggle('visible', count > 0);
        $('selectedCountText').textContent = `${count}${count === 1 ? ' item selected' : ' items selected'}`;
        $('selectAllCheckbox').disabled = cacheBusy;
        $('bulkDeleteBtn').disabled = cacheBusy || !count;
    }

    function setCacheBusy(value) {
        cacheBusy = value;
        for (const id of ['exportBtn', 'importBtn', 'deleteOldBtn', 'deselectBtn']) $(id).disabled = value;
        for (const control of $('tableBody').querySelectorAll('button,input')) control.disabled = value;
        updateSelection();
    }

    async function mutateCache(action, message = '') {
        if (cacheBusy) return false;
        setCacheBusy(true);
        try {
            await action();
            await loadCache();
            status('cacheStatus', message);
            return true;
        } catch (error) {
            status('cacheStatus', error.message, true);
            try { await loadCache(); } catch (_) { /* Preserve the mutation failure. */ }
            return false;
        } finally {
            setCacheBusy(false);
        }
    }

    async function deleteEntries(entries, confirmBulk = false) {
        if (!entries.length || cacheBusy) return false;
        if (confirmBulk && !confirm(`Are you sure you want to delete ${entries.length} item(s)?`)) return false;
        const groups = new Map();
        for (const { language, id } of entries) {
            if (!groups.has(language)) groups.set(language, []);
            groups.get(language).push(id);
        }
        const deleted = await mutateCache(async () => {
            for (const [language, remove] of groups) await request('cache.patch', { language, remove });
        });
        if (deleted && confirmBulk) alert(`${entries.length} items deleted.`);
        return deleted;
    }

    async function deleteOldData() {
        const days = Number($('timeFilter').value);
        if (!days) return alert('Select a time frame to delete.');
        const cutoff = Date.now() - days * 86400000;
        const language = $('cacheLanguage').value;
        const entries = allEntries().filter(entry => (!language || entry.language === language) && entry.data.ts < cutoff);
        if (!entries.length) return alert('No old data found to delete.');
        if (await deleteEntries(entries)) alert(`${entries.length} items deleted.`);
    }

    function openEditor(entry, cell) {
        if (cacheBusy || editing || !entry.data.t.length || entry.data.o.length !== entry.data.t.length || (entry.data.ot && entry.data.ot.length !== entry.data.o.length)) return;
        editing = { ...entry, data: structuredClone(entry.data), cell };
        cell.replaceChildren();
        // Keep one input per existing segment: flattening these would lose Discord node boundaries.
        entry.data.t.forEach((text, index) => {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `translationSegment${index}`;
            input.className = 'edit-input';
            input.value = text;
            input.dir = 'auto';
            input.maxLength = 96000;
            input.setAttribute('aria-label', entry.data.t.length > 1 ? `Translation ${index + 1}` : 'Translation');
            input.addEventListener('keydown', event => {
                if (event.key === 'Enter') { event.preventDefault(); void saveEdit(); }
                if (event.key === 'Escape') { event.preventDefault(); closeEditor(); }
            });
            input.addEventListener('blur', () => {
                setTimeout(() => {
                    if (editing?.cell === cell && !cacheBusy && !cell.contains(document.activeElement)) closeEditor();
                }, 0);
            });
            cell.append(input);
        });
        cell.querySelector('input').focus();
    }

    function closeEditor() {
        if (cacheBusy) return;
        editing = null;
        renderTable();
    }

    async function saveEdit() {
        if (!editing || cacheBusy) return;
        const entry = editing;
        const translations = Array.from(entry.cell.querySelectorAll('input'), input => input.value.trim());
        if (translations.some((part, index) => !part && entry.data.t[index].trim()) || JSON.stringify(translations) === JSON.stringify(entry.data.t)) {
            closeEditor();
            return;
        }
        const updated = { ...entry.data, t: translations, ot: entry.data.ot || [...entry.data.t] };
        if (JSON.stringify(updated.t) === JSON.stringify(updated.ot)) delete updated.ot;
        setCacheBusy(true);
        try {
            await loadCache();
            const current = cacheData[entry.language]?.[entry.id];
            if (!current || JSON.stringify(current) !== JSON.stringify(entry.data)) {
                throw new Error('This translation was changed or deleted elsewhere. Press Esc to cancel editing, then reopen the latest translation.');
            }
            await request('cache.patch', { language: entry.language, upsert: { [entry.id]: updated } });
            editing = null;
            await loadCache();
            status('cacheStatus', '');
        } catch (error) {
            status('cacheStatus', error.message, true);
        } finally {
            setCacheBusy(false);
        }
    }

    async function revertEntry(entry) {
        if (cacheBusy || !entry.data.ot || !confirm('Revert to the original translation?')) return;
        const updated = { ...entry.data, t: [...entry.data.ot] };
        delete updated.ot;
        await mutateCache(() => request('cache.patch', { language: entry.language, upsert: { [entry.id]: updated } }));
    }

    async function exportJSON() {
        if (cacheBusy) return;
        setCacheBusy(true);
        try {
            await loadCache();
            const blob = new Blob([JSON.stringify({ schemaVersion: 2, translationCacheByLanguage: cacheData }, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `discord_translation_backup_${new Date().toISOString().slice(0, 10)}.json`;
            anchor.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error) {
            status('cacheStatus', error.message, true);
        } finally {
            setCacheBusy(false);
        }
    }

    function showToast(message) {
        let toast = $('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            Object.assign(toast.style, {
                position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
                backgroundColor: 'var(--brand)', color: 'white', padding: '12px 24px', borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: '1000', transition: 'opacity 0.3s'
            });
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.style.opacity = '1';
        clearTimeout(toast.timeout);
        toast.timeout = setTimeout(() => { toast.style.opacity = '0'; }, 2000);
    }

    function validateImport(data) {
        const object = value => value && typeof value === 'object' && !Array.isArray(value);
        if (!object(data)) throw new Error('This is not a valid translation backup JSON file.');
        let languageMaps;
        if (data.schemaVersion === 2 && object(data.translationCacheByLanguage)) {
            languageMaps = data.translationCacheByLanguage;
        } else if (data.schemaVersion === undefined && object(data.translationCache)) {
            languageMaps = { en: data.translationCache };
        } else {
            throw new Error('Unsupported backup format. Select a Discolator translation backup.');
        }
        let count = 0;
        for (const [language, entries] of Object.entries(languageMaps)) {
            if (unsafeKeys.has(language) || !object(entries)) throw new Error('The backup contains an invalid language list.');
            Shared.normalizeLanguage(language);
            for (const [id, entry] of Object.entries(entries)) {
                if (!id || id.length > 160 || unsafeKeys.has(id) || !object(entry)) throw new Error('The backup contains an invalid translation entry.');
                const validParts = parts => Array.isArray(parts) && parts.length <= 300 && parts.every(part => typeof part === 'string' && part.length <= 96000);
                if (!validParts(entry.o) || !validParts(entry.t) ||
                    !Number.isFinite(entry.ts) || entry.ts < 0 || entry.ts > 8640000000000000 ||
                    (entry.ot !== undefined && !validParts(entry.ot)) ||
                    (entry.r !== undefined && typeof entry.r !== 'boolean')) {
                    throw new Error('The backup contains invalid original text, translations, or timestamps.');
                }
                if (++count > 10000) throw new Error('You can import up to 10,000 translations at a time.');
            }
        }
        return count;
    }

    async function importJSON(event) {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file || cacheBusy) return;
        if (file.size > MAX_IMPORT_BYTES) return status('cacheStatus', 'Backup files must be 5 MB or smaller.', true);
        try {
            const data = JSON.parse(await file.text());
            validateImport(data);
            if (await mutateCache(() => request('cache.import', { data }))) alert('Data imported successfully!');
        } catch (error) {
            status('cacheStatus', error instanceof SyntaxError ? 'Could not read the JSON file. Check the file format.' : error.message, true);
        }
    }

    function initialize() {
        for (const { code, name } of Shared.supportedLanguages) $('languageList').append(new Option(name, code));
        $('settingsForm').addEventListener('input', () => { settingsDirty = true; status('settingsStatus', 'You have unsaved changes.'); });
        $('settingsForm').addEventListener('submit', saveSettings);
        $('checkKeyBtn').addEventListener('click', checkKey);
        $('deleteKeyBtn').addEventListener('click', deleteKey);
        $('copySettingsErrorBtn').addEventListener('click', copySettingsError);
        $('searchInput').addEventListener('input', renderTable);
        $('cacheLanguage').addEventListener('change', renderTable);
        $('deleteOldBtn').addEventListener('click', deleteOldData);
        $('bulkDeleteBtn').addEventListener('click', () => deleteEntries(visibleEntries.filter(entry => selected.has(entry.key)), true));
        $('deselectBtn').addEventListener('click', () => {
            $('selectAllCheckbox').checked = false;
            for (const checkbox of $('tableBody').querySelectorAll('.row-checkbox:checked')) {
                checkbox.checked = false;
                checkbox.dispatchEvent(new Event('change'));
            }
        });
        document.addEventListener('mouseup', () => { isDragging = false; });
        $('selectAllCheckbox').addEventListener('change', event => {
            for (const checkbox of $('tableBody').querySelectorAll('.row-checkbox')) {
                checkbox.checked = event.target.checked;
                checkbox.dispatchEvent(new Event('change'));
            }
        });
        $('exportBtn').addEventListener('click', exportJSON);
        $('importBtn').addEventListener('click', () => $('fileInput').click());
        $('fileInput').addEventListener('change', importJSON);
        chrome.runtime.onMessage.addListener(message => {
            if (message?.action === 'state.changed') {
                void loadSettings();
                void loadCache().catch(error => status('cacheStatus', error.message, true));
            }
        });
        void loadSettings();
        void loadCache().catch(error => status('cacheStatus', error.message, true));
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
    else initialize();
})();
