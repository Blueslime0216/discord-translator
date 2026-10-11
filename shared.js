(function (root, factory) {
    const shared = factory();
    if (typeof module === 'object' && module.exports) module.exports = shared;
    else root.DiscolatorShared = shared;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    const DEFAULT_SETTINGS = Object.freeze({
        readingLanguage: 'en',
        writingLanguage: 'ko',
        translationModel: 'google/gemini-3.1-flash-lite'
    });
    const DETECTOR_MODEL = 'cloudflare/clef-flash';
    const codes = ['en', 'ko', 'ja', 'zh-Hans', 'zh-Hant', 'es', 'fr', 'de', 'pt',
        'pt-BR', 'it', 'ru', 'uk', 'ar', 'he', 'hi', 'bn', 'ur', 'fa', 'tr', 'vi',
        'th', 'id', 'ms', 'fil', 'nl', 'pl', 'cs', 'sk', 'ro', 'hu', 'el', 'sv',
        'da', 'nb', 'fi', 'is', 'et', 'lv', 'lt', 'bg', 'sr', 'hr', 'sl', 'bs',
        'mk', 'sq', 'ka', 'hy', 'az', 'kk', 'uz', 'mn', 'ne', 'si', 'ta', 'te',
        'kn', 'ml', 'mr', 'gu', 'pa', 'km', 'lo', 'my', 'sw', 'am', 'ha', 'yo',
        'zu', 'af', 'ca', 'eu', 'gl', 'cy', 'ga', 'mt', 'hy', 'be'];

    function normalizeLanguage(value) {
        if (typeof value !== 'string' || value.trim().length > 35) {
            throw new Error('올바른 언어 코드를 입력하세요. 예: ko, en, ja, zh-Hant');
        }
        const code = value.trim();
        if (!/^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8})*$/.test(code)) {
            throw new Error('올바른 언어 코드를 입력하세요. 예: ko, en, ja, zh-Hant');
        }
        let canonical;
        try { canonical = Intl.getCanonicalLocales(code)[0]; }
        catch (_) { throw new Error('지원하지 않는 언어 코드 형식입니다.'); }
        if (['und', 'mul', 'zxx'].includes(canonical.split('-')[0]) || /-(?:u|x)-/i.test(canonical)) {
            throw new Error('번역할 목표 언어를 지정하세요.');
        }
        return canonical;
    }

    function languageName(code) {
        const canonical = normalizeLanguage(code);
        try { return new Intl.DisplayNames(['en'], { type: 'language' }).of(canonical) || canonical; }
        catch (_) { return canonical; }
    }

    const supportedLanguages = Object.freeze([...new Set(codes)].map(code => Object.freeze({
        code, name: languageName(code)
    })));

    function normalizeSettings(value = {}) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            throw new Error('설정 형식이 올바르지 않습니다.');
        }
        const settings = { ...DEFAULT_SETTINGS };
        for (const key of ['readingLanguage', 'writingLanguage']) {
            if (value[key] !== undefined) settings[key] = normalizeLanguage(value[key]);
        }
        if (value.translationModel !== undefined) {
            if (typeof value.translationModel !== 'string' ||
                !/^[a-zA-Z0-9][a-zA-Z0-9._~:/-]{0,119}$/.test(value.translationModel.trim()) ||
                !value.translationModel.includes('/')) {
                throw new Error('OpenRouter 모델 ID를 입력하세요. 예: google/gemini-3.1-flash-lite');
            }
            settings.translationModel = value.translationModel.trim();
        }
        return settings;
    }

    return { DEFAULT_SETTINGS, DETECTOR_MODEL, supportedLanguages, normalizeLanguage,
        languageName, normalizeSettings };
});
