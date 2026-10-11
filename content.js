const SVG_ICON = `<svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M11 2a1 1 0 1 0-2 0v1H3a1 1 0 0 0 0 2h9.94a8.04 8.04 0 0 1-2.76 5.11l-.14.12-.2-.16a7.9 7.9 0 0 1-2.38-3.4 1 1 0 1 0-1.88.67 9.9 9.9 0 0 0 2.92 4.21l-3.15 2.69a1 1 0 0 0 1.3 1.52l3.4-2.91 1.31 1.08a1 1 0 1 0 1.28-1.53l-1.04-.87c1.9-1.68 3.1-4.02 3.35-6.53H17a1 1 0 1 0 0-2h-6V2Z"></path><path fill="currentColor" fill-rule="evenodd" d="M22.77 22H20.5l-.99-2.77H14.3L13.3 22h-2.27l4.72-12.42h2.3L22.77 22ZM16.9 11.87l-1.92 5.43h3.85l-1.93-5.43Z" clip-rule="evenodd"></path></svg>`;
const NITRO_SVG_ICON = (size = 24) => `<svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" fill="none" viewBox="0 0 24 24"><defs><linearGradient id="tr-nitro-grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:#b55eec;stop-opacity:1" /><stop offset="50%" style="stop-color:#ff73fa;stop-opacity:1" /><stop offset="100%" style="stop-color:#ffb0df;stop-opacity:1" /></linearGradient></defs><path fill="url(#tr-nitro-grad)" d="M11 2a1 1 0 1 0-2 0v1H3a1 1 0 0 0 0 2h9.94a8.04 8.04 0 0 1-2.76 5.11l-.14.12-.2-.16a7.9 7.9 0 0 1-2.38-3.4 1 1 0 1 0-1.88.67 9.9 9.9 0 0 0 2.92 4.21l-3.15 2.69a1 1 0 0 0 1.3 1.52l3.4-2.91 1.31 1.08a1 1 0 1 0 1.28-1.53l-1.04-.87c1.9-1.68 3.1-4.02 3.35-6.53H17a1 1 0 1 0 0-2h-6V2Z"></path><path fill="url(#tr-nitro-grad)" fill-rule="evenodd" d="M22.77 22H20.5l-.99-2.77H14.3L13.3 22h-2.27l4.72-12.42h2.3L22.77 22ZM16.9 11.87l-1.92 5.43h3.85l-1.93-5.43Z" clip-rule="evenodd"></path></svg>`;

let cls = {
    msgList: "messageListItem__5126c",
    msgContent: "messageContent_c19a55",
    ctxScroller: "scroller_c1e9c4",
    toolContainer: "buttonsInner__5126c"
};

function isContextValid() {
    return chrome.runtime && !!chrome.runtime.id;
}

let loadingBag = [];
function refreshLoadingBag() {
    const images = ["loading_1.png", "loading_2.png", "loading_3.png"];
    for (let i = images.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [images[i], images[j]] = [images[j], images[i]];
    }
    loadingBag = images;
}
refreshLoadingBag();

function getNextLoadingImage() {
    if (loadingBag.length === 0) refreshLoadingBag();
    const img = loadingBag.shift();
    if (loadingBag.length === 0) refreshLoadingBag();
    return img;
}

const loader = document.createElement('div');
loader.id = 'tr-loader';
loader.style = 'position: fixed; pointer-events: none; z-index: 9999; display: none; width: 40px; height: 40px;';

const loaderImg = document.createElement('img');
loaderImg.src = chrome.runtime.getURL(getNextLoadingImage());
loaderImg.style = 'width: 100%; height: 100%; animation: tr-spin 0.5s linear infinite;';
loader.appendChild(loaderImg);

const loaderError = document.createElement('div');
loaderError.style = 'position: absolute; top: 45px; left: 50%; transform: translateX(-50%); padding: 5px 10px; border-radius: 4px; background: rgba(255,0,0,0.9); color: white; font-size: 12px; white-space: nowrap; display: none;';
loader.appendChild(loaderError);

document.body.appendChild(loader);

const style = document.createElement('style');
style.innerText = `
@keyframes tr-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes tr-blink-red { 
    0%, 100% { background-color: rgba(255, 0, 0, 0.1); }
    50% { background-color: rgba(255, 0, 0, 0.4); }
}
@keyframes tr-nitro-gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}
@keyframes tr-pulse-nitro {
    0% { opacity: 0.4; }
    50% { opacity: 0.8; }
    100% { opacity: 0.4; }
}
.tr-alert-blink { animation: tr-blink-red 1s ease-in-out infinite; border-radius: 3px; }
.tr-translating {
    background: linear-gradient(90deg, rgba(181,94,236,0.5), rgba(255,115,250,0.5), rgba(255,176,223,0.5), rgba(255,115,250,0.5), rgba(181,94,236,0.5));
    background-size: 200% 100%;
    animation: tr-nitro-gradient 3s ease infinite, tr-pulse-nitro 1.5s ease-in-out infinite;
    border-radius: 4px;
    padding: 0 4px; 
    margin: 0 -2px;
    cursor: wait;
}
.tr-temp-selection { 
    background: linear-gradient(90deg, #b55eec, #ff73fa, #ffb0df, #ff73fa, #b55eec);
    background-size: 200% 100%;
    animation: tr-nitro-gradient 3s ease infinite;
    color: #fff !important;
    text-shadow: 0 1px 2px rgba(0,0,0,0.4);
    border-radius: 4px; 
    cursor: alias; 
    padding: 0 4px; 
    margin: 0 -2px;
}
.tr-translated-text {
    cursor: alias;
}
.tr-reverted-text {
    background-color: rgba(88, 101, 242, 0.2);
    border-radius: 3px;
    padding: 0 2px;
    margin: 0 -1px;
}
.tr-nitro-btn:hover {
    background: linear-gradient(90deg, #b55eec, #ff73fa, #ffb0df, #ff73fa, #b55eec) !important;
    background-size: 200% 100% !important;
    animation: tr-nitro-gradient 3s ease infinite !important;
}
.tr-nitro-btn path {
    fill: url(#tr-nitro-grad);
}
.tr-nitro-btn:hover path {
    fill: #fff !important;
}
`;
document.head.appendChild(style);

const trTooltip = document.createElement('div');
trTooltip.id = 'tr-tooltip-global';
trTooltip.style.cssText = `
    position: fixed; z-index: 999999; display: none; pointer-events: none;
    background: linear-gradient(var(--background-floating, #18191c), var(--background-floating, #18191c)) padding-box, 
                linear-gradient(90deg, #b55eec, #ff73fa, #ffb0df, #ff73fa, #b55eec) border-box;
    background-size: 200% 100%;
    animation: tr-nitro-gradient 3s ease infinite;
    color: #fff;
    padding: 10px 14px; border-radius: 8px; box-shadow: 0 8px 24px rgba(255, 115, 250, 0.2);
    border: 2px solid transparent; font-size: 14px; line-height: 1.5; font-weight: 500;
    max-width: 400px; white-space: pre-wrap; word-break: break-word;
`;
document.body.appendChild(trTooltip);

document.addEventListener('mouseover', (e) => {
    const target = e.target.closest?.('.tr-temp-selection');
    if (!target) return;
    trTooltip.textContent = target.innerText + '\n\n' + target.dataset.fullText;
    trTooltip.dir = 'auto';
    trTooltip.style.display = 'block';
    const rect = target.getBoundingClientRect();
    let top = rect.bottom + 8;
    let left = rect.left + rect.width / 2 - trTooltip.offsetWidth / 2;
    left = Math.max(10, Math.min(left, window.innerWidth - trTooltip.offsetWidth - 10));
    if (top + trTooltip.offsetHeight > window.innerHeight - 10) top = rect.top - trTooltip.offsetHeight - 8;
    trTooltip.style.top = top + 'px';
    trTooltip.style.left = left + 'px';
});

document.addEventListener('mouseout', (e) => {
    const target = e.target.closest?.('.tr-temp-selection');
    if (target && !(e.relatedTarget instanceof Node && target.contains(e.relatedTarget))) trTooltip.style.display = 'none';
});

let isLoading = false;
let lastActiveMessageId = null;
let ramCache = {};

// Credentials and persistent storage are owned exclusively by the service worker.
const shared = globalThis.DiscolatorShared;
let settings = { ...shared.DEFAULT_SETTINGS };
let settingsRevision = null;
let hasApiKey = false;
let stateRequest = null;
let stateDirty = false;
const nodeStates = new Map();
const originalTitles = new Map();

function runtimeRequest(payload) {
    return new Promise((resolve, reject) => {
        if (!isContextValid()) {
            reject(new Error('Extension reloaded. Refresh Discord to reconnect.'));
            return;
        }
        chrome.runtime.sendMessage(payload, response => {
            const runtimeError = chrome.runtime.lastError;
            if (runtimeError) return reject(new Error(runtimeError.message));
            if (!response?.success) {
                const error = new Error(response?.error || 'The extension service did not respond.');
                error.code = response?.code;
                return reject(error);
            }
            resolve(response);
        });
    });
}

function withObserverPaused(callback) {
    observer.disconnect();
    try { return callback(); }
    finally { observer.observe(document.body, { childList: true, subtree: true, characterData: true }); }
}

// Translate only leaf text nodes. Never replace an element's contents: Discord
// attaches links, mention behavior, formatting and other handlers to its children.
function getTranslatableElements(container) {
    const protectedSelector = '[id^="tr-"], script, style, svg, button, input, textarea, [contenteditable="true"], [class*="timestamp_"], [class*="mention"], [class*="emoji"], [aria-hidden="true"]';
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            if (!node.data.trim() || !node.parentElement) return NodeFilter.FILTER_REJECT;
            if (node.parentElement.closest(protectedSelector)) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
        }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    return nodes;
}

function sourceText(node) {
    const previous = nodeStates.get(node);
    if (previous && node.data === previous.display) return previous.original;
    if (previous) nodeStates.delete(node); // Discord edited this text after our render.
    return node.data;
}

function setTranslatedNode(node, original, translated) {
    // Keep boundary whitespace separating links/mentions and adjacent formatting.
    const leading = original.match(/^\s*/)[0];
    const trailing = original.match(/\s*$/)[0];
    let display = leading ? leading + translated.trimStart() : translated;
    if (trailing) display = display.trimEnd() + trailing;
    if (node.data !== display) node.data = display;
    nodeStates.set(node, { original, display });
}

function decorateMessage(nodes, reverted) {
    for (const element of new Set(nodes.map(node => node.parentElement))) {
        if (!element) continue;
        if (!originalTitles.has(element)) originalTitles.set(element, element.getAttribute('title'));
        element.title = originalTextContent(element);
        element.classList.toggle('tr-reverted-text', reverted);
        element.classList.remove('tr-alert-blink');
    }
}

function restoreNodes(container = document.body) {
    for (const [node, data] of nodeStates) {
        if (!node.isConnected) { nodeStates.delete(node); continue; }
        if (!container.contains(node)) continue;
        if (node.data === data.display) node.data = data.original;
        nodeStates.delete(node);
    }
    for (const [element, title] of originalTitles) {
        if (!element.isConnected) { originalTitles.delete(element); continue; }
        if (!container.contains(element)) continue;
        if (title === null) element.removeAttribute('title');
        else element.setAttribute('title', title);
        element.classList.remove('tr-reverted-text');
        originalTitles.delete(element);
    }
    container.querySelectorAll('[data-translated], [data-reverted]').forEach(el => {
        delete el.dataset.translated;
        delete el.dataset.reverted;
        el.classList.remove('tr-reverted-text');
    });
}

function messageNodes(item) {
    return Array.from(item.querySelectorAll('.' + cls.msgContent.split(' ')[0]))
        .flatMap(getTranslatableElements);
}

function originalTextContent(element) {
    return Array.from(element.childNodes, child => child.nodeType === Node.TEXT_NODE
        ? sourceText(child) : child.nodeName === 'BR' ? '\n' : originalTextContent(child)).join('');
}

function compatibleCache(item, data, nodes = messageNodes(item)) {
    if (!Array.isArray(data?.o) || !Array.isArray(data?.t)) return null;
    if (data.o.length === nodes.length && data.t.length === nodes.length
        && nodes.every((node, index) => sourceText(node) === data.o[index])) return data;

    // Original caches used span/code segments, including nested spans. Restore
    // only exact mappings; never guess translated word/formatting boundaries.
    const elements = Array.from(item.querySelectorAll('.' + cls.msgContent.split(' ')[0]))
        .flatMap(content => Array.from(content.querySelectorAll('span, code')).filter(element =>
            !(element.tagName === 'CODE' && element.querySelector('span')) && !element.closest('[class*="timestamp_"]')));
    if (!elements.length || elements.length !== data.o.length || data.o.length !== data.t.length
        || elements.some((element, index) => originalTextContent(element) !== data.o[index])) return null;
    const mapped = new Map();
    for (const element of elements.filter(element => !elements.some(parent => parent !== element && parent.contains(element)))) {
        const index = elements.indexOf(element);
        const groupNodes = nodes.filter(node => element.contains(node));
        if (!groupNodes.length) return null;
        const partsFor = text => {
            if (typeof text !== 'string') return null;
            if (groupNodes.length === 1 && sourceText(groupNodes[0]) === data.o[index]) return [text];
            const lines = [[]];
            const collect = parent => {
                for (const child of parent.childNodes) {
                    if (child.nodeType === Node.TEXT_NODE) lines.at(-1).push(child);
                    else if (child.nodeName === 'BR') lines.push([]);
                    else collect(child);
                }
            };
            collect(element);
            const parts = text.split('\n');
            if (parts.length !== groupNodes.length || lines.length !== groupNodes.length
                || lines.some((line, part) => line.length !== 1 || line[0] !== groupNodes[part])) return null;
            return parts;
        };
        const translated = partsFor(data.t[index]);
        const previous = data.ot ? partsFor(data.ot[index]) : null;
        if (!translated || (data.ot && !previous)) return null;
        groupNodes.forEach((node, part) => mapped.set(node, { t: translated[part], ot: previous?.[part] }));
    }
    if (mapped.size !== nodes.length || nodes.some(node => !mapped.has(node))) return null;
    return { ...data, o: nodes.map(sourceText), t: nodes.map(node => mapped.get(node).t),
        ...(data.ot ? { ot: nodes.map(node => mapped.get(node).ot) } : {}) };
}

function captureNodes(root, nodes) {
    return { root, selector: getUniqueSelector(root), nodes, originals: nodes.map(sourceText) };
}

function snapshotMatches(snapshot) {
    let root = snapshot.root;
    if (!root.isConnected) {
        try { root = document.querySelector(snapshot.selector); } catch (_) { return false; }
    }
    if (!root?.isConnected) return false;
    const currentNodes = root.matches('.' + cls.msgList.split(' ')[0]) ? messageNodes(root) : getTranslatableElements(root);
    if (currentNodes.length !== snapshot.originals.length
        || currentNodes.some((node, index) => sourceText(node) !== snapshot.originals[index])) return false;
    // Discord remounts reply previews while requests are in flight. As in the
    // original renderer, matching source text can receive the completed result.
    snapshot.root = root;
    snapshot.nodes = currentNodes;
    return true;
}

function requestIsCurrent(request, response) {
    return request.revision === settingsRevision
        && response.revision === request.revision
        && response.targetLanguage === request.targetLanguage
        && request.targetLanguage === (request.kind === 'write' ? settings.writingLanguage : settings.readingLanguage);
}

function reportWarnings(response) {
    if (Array.isArray(response.warnings) && response.warnings.length) {
        const details = Array.isArray(response.warningDetails)
            ? response.warningDetails.filter(detail => typeof detail === 'string' && detail.trim()) : [];
        const messages = response.warnings.map(warning => warning === 'DETECTION_UNAVAILABLE'
            ? '언어 감지에 실패하여 번역 모델의 자동 감지로 번역했습니다.' + (details.length ? ' 아래 오류 정보로 감지 모델의 문제를 확인할 수 있습니다.' : '')
            : '번역을 완료했지만 서비스 경고가 발생했습니다. 결과를 확인해 주세요.');
        showTranslationToast([...new Set([...messages, ...details])].join('\n\n'), details.length > 0);
    }
}

async function refreshState() {
    stateDirty = true;
    if (stateRequest) return stateRequest;
    stateRequest = (async () => {
        do {
            stateDirty = false;
            const state = await runtimeRequest({ action: 'state.get' });
            const previousLanguage = settings.readingLanguage;
            const previousRevision = settingsRevision;
            settings = shared.normalizeSettings(state.settings);
            settingsRevision = state.revision;
            hasApiKey = state.hasApiKey;
            cls = { ...cls, ...state.discordClasses };
            withObserverPaused(() => {
                restoreNodes();
                if (settings.readingLanguage !== previousLanguage) {
                    manualTranslations.clear();
                    document.querySelectorAll('.tr-temp-selection').forEach(el => {
                        el.classList.remove('tr-temp-selection');
                        delete el.dataset.fullText;
                    });
                    trTooltip.style.display = 'none';
                    document.querySelectorAll('[id^="tr-floating-res-"]').forEach(el => el.remove());
                }
                ramCache = state.cache || {};
            });
            if (previousRevision !== null && previousRevision !== settingsRevision) {
                document.getElementById('tr-write-popup-results')?.replaceChildren();
            }
            updateWriteLanguageLabel();
            applyCacheToVisible();
            applyManualTranslationsToDOM();
        } while (stateDirty);
    })();
    try { await stateRequest; }
    finally { stateRequest = null; }
}

async function ensureReady() {
    await refreshState();
    if (!hasApiKey) throw new Error('Set your OpenRouter API key in Discolator extension options, then try again.');
}

async function patchCache(language, upsert = {}, remove = []) {
    const response = await runtimeRequest({ action: 'cache.patch', language, upsert, remove });
    if (language === settings.readingLanguage) ramCache = response.cache || {};
    return response;
}

document.addEventListener('mousedown', (e) => {
    const foundElement = e.target.closest('.' + cls.msgList.split(' ')[0]);
    lastActiveMessageId = foundElement ? foundElement.id : null;
}, true);

document.addEventListener('contextmenu', (e) => {
    const foundElement = e.target.closest('.' + cls.msgList.split(' ')[0]);
    lastActiveMessageId = foundElement ? foundElement.id : null;
}, true);

let lastMouseX = 0;
let lastMouseY = 0;
let trHoverRafId = null;

document.addEventListener('mousemove', (e) => {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    if (isLoading && !trHoverRafId) {
        trHoverRafId = requestAnimationFrame(() => {
            if (isLoading) {
                loader.style.left = (lastMouseX - 20) + 'px';
                loader.style.top = (lastMouseY - 20) + 'px';
            }
            trHoverRafId = null;
        });
    }
});

function showLoader(text, isError = false) {
    try {
        isLoading = true;
        loader.style.left = (lastMouseX - 20) + 'px';
        loader.style.top = (lastMouseY - 20) + 'px';
        loader.style.display = 'block';
        if (isError) {
            loaderImg.style.display = 'none';
            loaderError.style.display = 'block';
            loaderError.innerText = text;
        } else {
            if (!chrome.runtime || !chrome.runtime.id) throw new Error("Extension context invalidated");
            loaderImg.src = chrome.runtime.getURL(getNextLoadingImage());
            loaderImg.style.display = 'block';
            loaderError.style.display = 'none';
        }
    } catch (err) {
        hideLoader();
        if (typeof showTranslationToast === 'function') {
            showTranslationToast("디스콜레이터 오류: 확장 프로그램 컨텍스트가 유효하지 않습니다. 페이지를 새로고침하세요.", true);
        }
        throw err;
    }
}

function hideLoader() {
    isLoading = false;
    loader.style.display = 'none';
    loaderImg.style.display = 'block';
    loaderError.style.display = 'none';
}

function showDiscordModal(title, text, confirmText, cancelText, onConfirm) {
    const modalId = 'tr-discord-modal';
    if (document.getElementById(modalId)) return;

    const overlay = document.createElement('div');
    overlay.id = modalId;
    overlay.style.cssText = `position: fixed; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; z-index: 9999;`;

    const backdrop = document.createElement('div');
    backdrop.style.cssText = `position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.85);`;
    backdrop.onclick = () => overlay.remove();

    const modal = document.createElement('div');
    modal.style.cssText = `position: relative; width: 440px; background: var(--background-primary, #36393f); border-radius: 4px; box-shadow: 0 0 0 1px rgba(32,34,37,.6), 0 2px 10px 0 rgba(0,0,0,.2); display: flex; flex-direction: column; overflow: hidden; animation: tr-modal-pop 0.15s ease-out;`;

    const content = document.createElement('div');
    content.style.cssText = `padding: 16px;`;

    const h2 = document.createElement('h2');
    h2.innerText = title;
    h2.style.cssText = `color: var(--header-primary, #fff); font-weight: 600; font-size: 20px; margin: 0 0 8px 0; font-family: inherit;`;

    const p = document.createElement('div');
    p.innerText = text;
    p.style.cssText = `color: var(--text-normal, #dcddde); font-size: 16px; line-height: 1.5;`;

    content.appendChild(h2);
    content.appendChild(p);

    const footer = document.createElement('div');
    footer.style.cssText = `padding: 16px; background: var(--background-secondary, #2f3136); display: flex; justify-content: flex-end; gap: 8px;`;

    const btnCancel = document.createElement('button');
    btnCancel.innerText = cancelText;
    btnCancel.style.cssText = `background: transparent; color: var(--text-normal, #dcddde); border: none; padding: 2px 16px; font-size: 14px; font-weight: 500; cursor: pointer; border-radius: 3px; height: 38px;`;
    btnCancel.onmouseover = () => btnCancel.style.textDecoration = 'underline';
    btnCancel.onmouseout = () => btnCancel.style.textDecoration = 'none';
    btnCancel.onclick = () => overlay.remove();

    const btnConfirm = document.createElement('button');
    btnConfirm.innerText = confirmText;
    btnConfirm.style.cssText = `background: var(--brand-experiment, #5865F2); color: #fff; border: none; padding: 2px 16px; font-size: 14px; font-weight: 500; cursor: pointer; border-radius: 3px; height: 38px; transition: background-color 0.17s ease;`;
    btnConfirm.onmouseover = () => btnConfirm.style.background = 'var(--brand-experiment-560, #4752c4)';
    btnConfirm.onmouseout = () => btnConfirm.style.background = 'var(--brand-experiment, #5865F2)';
    btnConfirm.onclick = () => { overlay.remove(); onConfirm(); };

    footer.appendChild(btnCancel);
    footer.appendChild(btnConfirm);
    modal.appendChild(content);
    modal.appendChild(footer);
    overlay.appendChild(backdrop);
    overlay.appendChild(modal);

    if (!document.getElementById('tr-modal-style')) {
        const style = document.createElement('style');
        style.id = 'tr-modal-style';
        style.innerText = `@keyframes tr-modal-pop { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }`;
        document.head.appendChild(style);
    }
    document.body.appendChild(overlay);
}

function showTranslationToast(text, isError = false) {
    let container = document.getElementById('tr-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'tr-toast-container';
        container.style.cssText = `position: fixed; top: 16px; right: 16px; z-index: 10000; display: flex; flex-direction: column; gap: 8px; max-width: calc(100vw - 32px); max-height: calc(100vh - 32px); overflow-y: auto; overscroll-behavior: contain; pointer-events: auto;`;
        document.body.appendChild(container);
    }

    const toastBg = isError ? '#321e24' : 'var(--background-floating, #18191c)';
    const toastBorder = isError ? '1px solid rgba(237, 66, 69, 0.5)' : '1px solid var(--border-subtle, rgba(255,255,255,0.05))';
    const barColor = isError ? '#ed4245' : 'var(--brand-experiment, #5865F2)';

    const toast = document.createElement('div');
    toast.className = isError ? 'tr-toast tr-toast-error' : 'tr-toast';
    toast.setAttribute('role', isError ? 'alert' : 'status');
    toast.style.cssText = `
        background-color: ${toastBg};
        color: var(--text-normal, #dcddde);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        padding: 12px 36px 12px 16px;
        position: relative;
        overflow: hidden;
        pointer-events: auto;
        font-size: 14px;
        font-family: inherit;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border: ${toastBorder};
        flex-shrink: 0;
        max-width: 560px;
        box-sizing: border-box;
    `;
    const message = document.createElement('div');
    message.className = 'tr-toast-message';
    message.textContent = text;
    message.style.cssText = 'white-space: pre-wrap; overflow-wrap: anywhere; user-select: text;';
    toast.appendChild(message);

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', '알림 닫기');
    closeBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"/></svg>`;
    closeBtn.style.cssText = `
        position: absolute; top: 10px; right: 8px; width: 20px; height: 20px;
        cursor: pointer; color: var(--text-muted, #949ba4);
        display: flex; align-items: center; justify-content: center;
        border-radius: 4px;
        border: 0; background: transparent; padding: 0;
    `;
    closeBtn.onmouseover = () => closeBtn.style.color = '#fff';
    closeBtn.onmouseout = () => closeBtn.style.color = 'var(--text-muted, #949ba4)';

    const barWrap = document.createElement('div');
    barWrap.style.cssText = `position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; background: rgba(255,255,255,0.1);`;
    const bar = document.createElement('div');
    bar.style.cssText = `width: 100%; height: 100%; background: ${barColor};`;
    barWrap.appendChild(bar);

    toast.appendChild(closeBtn);
    if (!isError) toast.appendChild(barWrap);
    if (isError) {
        const copyButton = document.createElement('button');
        copyButton.type = 'button';
        copyButton.className = 'tr-toast-copy';
        copyButton.textContent = '오류 정보 복사';
        copyButton.style.cssText = 'margin-top: 10px; padding: 6px 10px; border: 1px solid #80505a; border-radius: 4px; background: #452a32; color: #fff; cursor: pointer; font: inherit;';
        const copyStatus = document.createElement('div');
        copyStatus.className = 'tr-toast-copy-status';
        copyStatus.setAttribute('role', 'status');
        copyStatus.style.cssText = 'font-size: 12px; margin-top: 4px;';
        copyButton.onclick = async () => {
            try {
                await navigator.clipboard.writeText(message.textContent);
                copyStatus.textContent = '오류 정보를 복사했습니다.';
            } catch (_) {
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(message);
                selection?.removeAllRanges();
                selection?.addRange(range);
                copyStatus.textContent = '자동 복사에 실패했습니다. 선택된 오류 정보를 Ctrl+C 또는 ⌘C로 복사해 주세요.';
            }
        };
        toast.append(copyButton, copyStatus);
    }
    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
    });

    const duration = 8000;
    let isClosed = false;

    const closeToast = () => {
        if (isClosed) return;
        isClosed = true;
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    };

    closeBtn.onclick = closeToast;

    // API diagnostics stay visible until the user closes them.
    if (isError) return;

    requestAnimationFrame(() => {
        setTimeout(() => {
            bar.style.transition = `width ${duration}ms linear`;
            bar.style.width = '0%';
        }, 50);
    });

    setTimeout(closeToast, duration);
}

function extractChatData(startMsgId = null, forceTranslateTarget = false) {
    const listSelector = '.' + cls.msgList.split(' ')[0];
    let currentItem = startMsgId ? document.getElementById(startMsgId) : null;
    if (!currentItem) currentItem = Array.from(document.querySelectorAll(listSelector)).at(-1);
    const messages = [], context = [], snapshots = new Map();
    let length = 0;
    while (currentItem) {
        if (messages.length + context.length >= 60) break;
        const item = currentItem;
        currentItem = currentItem.previousElementSibling;
        if (!item.id || !item.matches(listSelector)) continue;
        const nodes = messageNodes(item);
        if (!nodes.length) continue;
        const snapshot = captureNodes(item, nodes);
        const blockLength = snapshot.originals.join('').length;
        if (length + blockLength > 3000 && messages.length + context.length) break;
        const block = { id: item.id, segments: snapshot.originals };
        const isTarget = !startMsgId ? !messages.length : item.id === startMsgId;
        // The clicked message and untranslated predecessors preserve the original
        // manual batch behavior; cached predecessors provide immutable context.
        const cachedOriginals = compatibleCache(item, ramCache[item.id], nodes)?.o;
        const cacheMatches = Array.isArray(cachedOriginals) && cachedOriginals.length === snapshot.originals.length
            && cachedOriginals.every((text, part) => text === snapshot.originals[part]);
        if (!isTarget && cacheMatches) context.unshift(block);
        else { messages.unshift(block); snapshots.set(item.id, snapshot); }
        length += blockLength;
    }
    return { messages, context, snapshots };
}

async function startTranslation(msgId = null, forceTranslateTarget = false) {
    if (isLoading) return;
    showLoader();
    try {
        await ensureReady();
        const { messages, context, snapshots } = extractChatData(msgId, forceTranslateTarget);
        if (!messages.length) { showTranslationToast('No translatable message text found.'); return; }
        const request = {
            action: 'translate', kind: 'chat', messages, context,
            targetLanguage: settings.readingLanguage, revision: settingsRevision,
            forceIds: forceTranslateTarget && msgId ? [msgId] : []
        };
        const response = await runtimeRequest(request);
        await refreshState();
        if (!requestIsCurrent(request, response)) {
            showTranslationToast('Settings changed. Please translate again.');
            return;
        }
        await applyTranslation(response.results, snapshots, request);
        reportWarnings(response);
    } catch (error) {
        showTranslationToast(error.message || 'Translation failed.', true);
    } finally { hideLoader(); }
}

async function applyTranslation(results, snapshots, request) {
    const upsert = {};
    let stale = false;
    for (const result of results) {
        const snapshot = snapshots.get(result.id);
        if (!snapshot || result.status !== 'translated') continue;
        if (!snapshotMatches(snapshot) || result.segments.length !== snapshot.nodes.length) {
            stale = true;
            snapshot.nodes.forEach(node => {
                if (node.isConnected) node.parentElement?.classList.add('tr-alert-blink');
            });
            continue;
        }
        upsert[result.id] = { o: [...snapshot.originals], t: result.segments, ts: Date.now() };
    }
    if (Object.keys(upsert).length) {
        await patchCache(request.targetLanguage, upsert);
        if (request.revision === settingsRevision && request.targetLanguage === settings.readingLanguage) applyCacheToVisible();
    } else {
        showTranslationToast(stale ? 'Message changed. Please translate again.' : 'No text needed translation into ' + shared.languageName(request.targetLanguage) + '.');
    }
}

function applyCacheToVisible() {
    if (!isContextValid()) return;
    const language = settings.readingLanguage;
    const remove = [];
    withObserverPaused(() => {
        for (const node of nodeStates.keys()) if (!node.isConnected) nodeStates.delete(node);
        for (const [id, data] of Object.entries(ramCache)) {
            const item = document.getElementById(id);
            if (!item || !Array.isArray(data?.o) || !Array.isArray(data?.t)
                || data.o.some(text => typeof text !== 'string') || data.t.some(text => typeof text !== 'string')) continue;
            const nodes = messageNodes(item);
            const compatible = compatibleCache(item, data, nodes);
            // A changed message or a legacy segmentation mismatch must never
            // replace the user's new text or destroy Discord's nested elements.
            if (!compatible && (nodes.length !== data.o.length || nodes.length !== data.t.length)) {
                restoreNodes(item);
                continue;
            }
            const changed = compatible ? [] : nodes.filter((node, index) => sourceText(node) !== data.o[index]);
            if (changed.length) {
                restoreNodes(item);
                changed.forEach(node => node.parentElement?.classList.add('tr-alert-blink'));
                delete ramCache[id];
                remove.push(id);
                continue;
            }
            nodes.forEach((node, index) => setTranslatedNode(node, compatible.o[index], data.r ? compatible.o[index] : compatible.t[index]));
            decorateMessage(nodes, data.r === true);
            item.querySelectorAll('.' + cls.msgContent.split(' ')[0]).forEach(div => {
                div.dataset.translated = 'true';
                if (data.r) div.dataset.reverted = 'true';
                else delete div.dataset.reverted;
            });
        }
    });
    if (remove.length) {
        showTranslationToast('Message mismatch detected. Translation purged.');
        patchCache(language, {}, remove).catch(error => showTranslationToast(error.message, true));
    }
}

document.addEventListener('keydown', async (e) => {
    if (e.altKey && e.code === 'KeyU') {
        const editItem = document.querySelector('#message-edit');
        const toolGroup = document.querySelector('[aria-label="Message Actions"]');
        const msgEl = document.querySelector('div[id^="message-content-"]');

        if (editItem && toolGroup && msgEl?.closest('li') && editItem.closest('[role="menu"]')?.parentElement) {
            const newCls = {
                msgContent: msgEl.className,
                msgList: msgEl.closest('li').className,
                ctxScroller: editItem.closest('[role="menu"]').parentElement.className,
                toolContainer: toolGroup.querySelector('div[class*="buttonsInner_"]')?.className || toolGroup.className
            };
            if (isContextValid()) {
                try {
                    await runtimeRequest({ action: 'classes.save', classes: newCls });
                    cls = { ...cls, ...newCls };
                    alert('CSS Classes Updated!');
                } catch (error) { showTranslationToast(error.message, true); }
            }
        }
    }

    if (e.altKey && e.code === 'KeyT') {
        e.preventDefault();
        e.stopPropagation();

        if (typeof isSelectionMode !== 'undefined' && isSelectionMode) {
            exitSelectionMode();
        } else {
            isSelectionMode = true;
            createSelectionFloatMenu();
        }
    }
});

let isSelectionMode = false;
let selectedElementsForTr = new Set();
let selectionHoverElement = null;

function createSelectionFloatMenu() {
    let menu = document.getElementById('tr-selection-float');
    if (!menu) {
        menu = document.createElement('div');
        menu.id = 'tr-selection-float';
        menu.style.cssText = `
            position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
            display: flex; align-items: center; gap: 12px;
            background-color: var(--background-floating, #18191c);
            padding: 12px 24px; border-radius: 8px; z-index: 100000;
            box-shadow: 0 8px 16px rgba(0,0,0,0.24);
            border: 1px solid var(--border-subtle, rgba(255,255,255,0.05));
            font-family: inherit; color: #fff;
        `;

        const countText = document.createElement('span');
        countText.id = 'tr-selection-count';
        countText.style.cssText = 'font-size: 14px; font-weight: 600; margin-right: 12px;';

        const cancelBtn = document.createElement('button');
        cancelBtn.innerText = 'Cancel';
        cancelBtn.style.cssText = `
            background: transparent; color: var(--text-normal, #dcddde); border: none; 
            padding: 2px 16px; font-size: 14px; font-weight: 500; cursor: pointer; 
            border-radius: 3px; height: 32px; transition: background-color 0.17s ease;
        `;
        cancelBtn.onmouseover = () => cancelBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        cancelBtn.onmouseout = () => cancelBtn.style.background = 'transparent';
        cancelBtn.onclick = exitSelectionMode;

        const startBtn = document.createElement('button');
        startBtn.innerText = 'Start Translation';
        startBtn.style.cssText = `
            background: var(--brand-experiment, #5865F2); color: #fff; border: none; 
            padding: 2px 16px; font-size: 14px; font-weight: 500; cursor: pointer; 
            border-radius: 3px; height: 32px; transition: background-color 0.17s ease;
        `;
        startBtn.onmouseover = () => startBtn.style.background = 'var(--brand-experiment-560, #4752c4)';
        startBtn.onmouseout = () => startBtn.style.background = 'var(--brand-experiment, #5865F2)';
        startBtn.onclick = executeSelectionTranslation;

        menu.appendChild(countText);
        menu.appendChild(cancelBtn);
        menu.appendChild(startBtn);
        document.body.appendChild(menu);
    }
    menu.style.display = 'flex';
    updateSelectionCount();
}

function updateSelectionCount() {
    const text = document.getElementById('tr-selection-count');
    if (text) text.innerText = `Selected: ${selectedElementsForTr.size}`;
}

function exitSelectionMode() {
    isSelectionMode = false;
    const menu = document.getElementById('tr-selection-float');
    if (menu) menu.style.display = 'none';

    selectedElementsForTr.forEach(el => {
        el.classList.remove('tr-sel-selected');
    });
    if (selectionHoverElement) selectionHoverElement.classList.remove('tr-sel-hover');
    selectedElementsForTr.clear();
    selectionHoverElement = null;
}

const selStyle = document.createElement('style');
selStyle.innerText = `
.tr-sel-hover { outline: 2px solid #5865F2 !important; outline-offset: -2px !important; cursor: pointer !important; }
.tr-sel-selected { background-color: rgba(88, 101, 242, 0.3) !important; outline: 2px solid #5865F2 !important; outline-offset: -2px !important; }
`;
document.head.appendChild(selStyle);

document.addEventListener('mouseover', (e) => {
    if (typeof isSelectionMode !== 'undefined' && isSelectionMode) {
        let target = e.target;
        if (target.matches('html, body') || target.closest('[id^="tr-"]')) return;
        if (target.closest('[contenteditable="true"]') || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

        if (selectionHoverElement) selectionHoverElement.classList.remove('tr-sel-hover');
        selectionHoverElement = target;
        selectionHoverElement.classList.add('tr-sel-hover');
    }
});

document.addEventListener('mouseout', (e) => {
    if (typeof isSelectionMode !== 'undefined' && isSelectionMode && selectionHoverElement === e.target) {
        selectionHoverElement.classList.remove('tr-sel-hover');
        selectionHoverElement = null;
    }
});

document.addEventListener('click', (e) => {
    if (typeof isSelectionMode !== 'undefined' && isSelectionMode) {
        let target = e.target;
        if (target.matches('html, body') || target.closest('[id^="tr-"]')) return;
        if (target.closest('[contenteditable="true"]') || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

        e.preventDefault();
        e.stopPropagation();

        if (selectedElementsForTr.has(target)) {
            selectedElementsForTr.delete(target);
            target.classList.remove('tr-sel-selected');
        } else {
            selectedElementsForTr.add(target);
            target.classList.add('tr-sel-selected');
        }
        updateSelectionCount();
    }
}, true);

let manualTranslations = new Map();
let activeTranslatingSelectors = new Set();

function getUniqueSelector(el) {
    let path = [];
    while (el && el.nodeType === Node.ELEMENT_NODE && el.tagName !== 'BODY' && el.tagName !== 'HTML') {
        if (el.id) {
            path.unshift('#' + CSS.escape(el.id));
            break;
        }
        let nth = 1;
        let sib = el;
        while ((sib = sib.previousElementSibling)) {
            nth++;
        }
        let selector = el.tagName.toLowerCase();
        selector += `:nth-child(${nth})`;
        path.unshift(selector);
        el = el.parentElement;
    }
    return path.join(" > ");
}

function applyManualTranslationsToDOM() {
    withObserverPaused(() => {
        for (const [selector, data] of manualTranslations) {
            if (data.language !== settings.readingLanguage) continue;
            let el;
            try { el = document.querySelector(selector); } catch { continue; }
            if (!el) continue;
            const nodes = getTranslatableElements(el);
            if (nodes.length !== data.originals.length
                || nodes.some((node, index) => sourceText(node) !== data.originals[index])) {
                restoreNodes(el);
                el.classList.remove('tr-temp-selection');
                delete el.dataset.fullText;
                manualTranslations.delete(selector);
                continue;
            }
            nodes.forEach((node, index) => setTranslatedNode(node, data.originals[index], data.translated[index]));
            el.dataset.fullText = originalTextContent(el);
            el.classList.add('tr-temp-selection');
        }
        for (const selector of activeTranslatingSelectors) {
            try {
                document.querySelectorAll(selector).forEach(el => {
                    if (!el.classList.contains('tr-temp-selection')) el.classList.add('tr-translating');
                });
            } catch (_) { /* A selected element was removed. */ }
        }
    });
}

async function executeSelectionTranslation() {
    if (isLoading || selectedElementsForTr.size === 0) return;
    // If both parent and child were selected, process the parent just once.
    const selected = Array.from(selectedElementsForTr).filter(el =>
        !Array.from(selectedElementsForTr).some(other => other !== el && other.contains(el)));
    exitSelectionMode();
    showLoader();
    const activeItems = [];
    try {
        await ensureReady();
        const messages = [], snapshots = new Map();
        selected.forEach((el, index) => {
            const nodes = getTranslatableElements(el);
            if (!nodes.length) return;
            const id = 'sel-' + index;
            const snapshot = captureNodes(el, nodes);
            snapshots.set(id, snapshot);
            messages.push({ id, segments: snapshot.originals });
            const selector = getUniqueSelector(el);
            activeItems.push({ el, selector });
            activeTranslatingSelectors.add(selector);
            el.classList.add('tr-translating');
        });
        if (!messages.length) { showTranslationToast('No translatable text selected.'); return; }
        if (messages.length > 60) throw new Error('Select no more than 60 elements at a time.');
        const request = { action: 'translate', kind: 'selection', messages, context: [], forceIds: [],
            targetLanguage: settings.readingLanguage, revision: settingsRevision };
        const response = await runtimeRequest(request);
        await refreshState();
        if (!requestIsCurrent(request, response)) { showTranslationToast('Settings changed. Please translate again.'); return; }
        let count = 0;
        for (const result of response.results) {
            const snapshot = snapshots.get(result.id);
            if (result.status !== 'translated' || !snapshot || !snapshotMatches(snapshot)
                || result.segments.length !== snapshot.nodes.length) continue;
            manualTranslations.set(getUniqueSelector(snapshot.root), {
                originals: snapshot.originals, translated: result.segments, language: request.targetLanguage
            });
            count++;
        }
        applyManualTranslationsToDOM();
        showTranslationToast(count ? 'Selected text translated.' : 'No selected text needed translation, or the selection changed.');
        reportWarnings(response);
    } catch (error) { showTranslationToast(error.message || 'Selection translation failed.', true); }
    finally {
        activeItems.forEach(({ el, selector }) => {
            activeTranslatingSelectors.delete(selector);
            el.classList.remove('tr-translating');
            try { document.querySelectorAll(selector).forEach(current => current.classList.remove('tr-translating')); } catch (_) {}
        });
        hideLoader();
    }
}

function injectContextMenu(menu) {
    if (menu.dataset.trInjected === "true") return;
    if (menu.querySelector('#custom-tr-ctx')) return;

    if (!lastActiveMessageId) {
        return;
    }

    const targetMsgId = lastActiveMessageId;
    const msgElement = document.getElementById(targetMsgId);
    if (!msgElement) return;

    const contentDivs = msgElement.querySelectorAll('.' + cls.msgContent.split(' ')[0]);
    if (!contentDivs || contentDivs.length === 0) return;

    const isTranslated = Array.from(contentDivs).some(div => div.dataset.translated === "true");
    if (!isTranslated) return;

    const isReverted = Array.from(contentDivs).some(div => div.dataset.reverted === "true");

    const closeContext = () => {
        const ctxMenu = document.querySelector('.' + cls.ctxScroller.split(' ')[0]);
        if (ctxMenu) {
            const menuContainer = ctxMenu.closest('[role="dialog"]') || ctxMenu.parentElement;
            if (menuContainer) menuContainer.style.display = 'none';
        }
    };

    const onHoverItem = () => {
        const focusedItems = menu.querySelectorAll('[class*="focused_"]');
        focusedItems.forEach(el => {
            const focusedClass = Array.from(el.classList).find(c => c.startsWith('focused_'));
            if (focusedClass) el.classList.remove(focusedClass);
        });
    };

    const itemRevert = document.createElement('div');
    itemRevert.id = 'custom-tr-ctx';
    itemRevert.className = 'item_c1e9c4 labelContainer_c1e9c4 colorDefault_c1e9c4';
    itemRevert.setAttribute('role', 'menuitem');
    itemRevert.setAttribute('tabindex', '-1');

    const labelText = isReverted ? 'Translate to ' + shared.languageName(settings.readingLanguage) : "Revert to Original";
    itemRevert.innerHTML = `<div class="label_c1e9c4">${labelText}</div><div class="iconContainer_c1e9c4">${SVG_ICON}</div>`;
    itemRevert.onmouseenter = onHoverItem;

    itemRevert.onclick = async (e) => {
        e.stopPropagation();
        const language = settings.readingLanguage;
        const data = ramCache[targetMsgId];
        try {
            if (data) {
                await patchCache(language, { [targetMsgId]: { ...data, r: !isReverted } });
                if (language === settings.readingLanguage) applyCacheToVisible();
            }
        } catch (error) { showTranslationToast(error.message, true); }
        closeContext();
    };

    const itemDelete = document.createElement('div');
    itemDelete.id = 'custom-tr-delete';
    itemDelete.className = 'item_c1e9c4 labelContainer_c1e9c4 colorDanger_c1e9c4 colorDefault_c1e9c4';
    itemDelete.setAttribute('role', 'menuitem');
    itemDelete.setAttribute('tabindex', '-1');

    const TRASH_SVG = `<svg class="icon_c1e9c4" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M14.25 1c.41 0 .75.34.75.75V3h5.25c.41 0 .75.34.75.75v.5c0 .41-.34.75-.75.75H3.75A.75.75 0 0 1 3 4.25v-.5c0-.41.34-.75.75-.75H9V1.75c0-.41.34-.75.75-.75h4.5Z"></path><path fill="currentColor" fill-rule="evenodd" d="M5.06 7a1 1 0 0 0-1 1.06l.76 12.13a3 3 0 0 0 3 2.81h8.36a3 3 0 0 0 3-2.81l.75-12.13a1 1 0 0 0-1-1.06H5.07ZM11 12a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0v-6Zm3-1a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Z" clip-rule="evenodd"></path></svg>`;

    itemDelete.innerHTML = `<div class="label_c1e9c4">Delete Translation Data</div><div class="iconContainer_c1e9c4">${TRASH_SVG}</div>`;
    itemDelete.onmouseenter = onHoverItem;

    itemDelete.onclick = async (e) => {
        e.stopPropagation();
        const language = settings.readingLanguage;
        try {
            await patchCache(language, {}, [targetMsgId]);
            if (language === settings.readingLanguage) withObserverPaused(() => restoreNodes(msgElement));
            showTranslationToast('Translation deleted.');
        } catch (error) { showTranslationToast(error.message, true); }
        closeContext();
    };

    const separator = document.createElement('div');
    separator.className = 'separator_c1e9c4';
    separator.setAttribute('role', 'separator');
    separator.style.cssText = '--custom-menu-separator-margin: 8px;';

    const group = document.createElement('div');
    group.setAttribute('role', 'group');
    group.appendChild(itemRevert);
    group.appendChild(itemDelete);

    const deleteGroup = Array.from(menu.querySelectorAll('[role="group"]')).find(g => g.querySelector('[id*="-delete"]'));
    if (deleteGroup) {
        let insertBeforeNode = deleteGroup;
        while (insertBeforeNode.parentElement !== menu && insertBeforeNode.parentElement) insertBeforeNode = insertBeforeNode.parentElement;
        if (insertBeforeNode.previousElementSibling?.getAttribute('role') === 'separator') {
            insertBeforeNode = insertBeforeNode.previousElementSibling;
        }
        menu.insertBefore(separator, insertBeforeNode);
        menu.insertBefore(group, insertBeforeNode);
    } else {
        menu.appendChild(separator);
        menu.appendChild(group);
    }
    menu.dataset.trInjected = 'true';
}

function injectToolMenu(inner) {
    if (inner.dataset.trInjected === "true") return;
    if (inner.querySelector('#custom-tr-tool')) return;

    const targetEl = inner.querySelector('[aria-label="More"]');
    if (!targetEl) return;
    inner.dataset.trInjected = "true";

    const targetSpan = targetEl.closest('span') || targetEl;

    const btn = document.createElement('span');
    btn.id = 'custom-tr-tool';
    btn.innerHTML = `
        <div class="hoverBarButton_f84418 button_f7ecac tr-nitro-btn" aria-label="Translate" role="button" tabindex="0">
            <div class="icon_f84418 buttonContent_f84418">${NITRO_SVG_ICON(24)}</div>
        </div>`;
    btn.onclick = (e) => {
        e.stopPropagation();

        const foundElement = btn.closest('.' + cls.msgList.split(' ')[0]);

        if (!foundElement) {
            alert("Error: Could not find the selected message block within 20 parent steps.");
            return;
        }

        const msgId = foundElement.id;
        const contentDivs = foundElement.querySelectorAll('.' + cls.msgContent.split(' ')[0]);
        const isTranslated = Array.from(contentDivs).some(div => div.dataset.translated === "true");

        if (isTranslated) {
            showDiscordModal(
                "Translate Again?",
                "This message has already been translated. Would you like to translate it again?",
                "Translate Again",
                "Cancel",
                () => startTranslation(msgId, true)
            );
        } else {
            startTranslation(msgId, false);
        }
    };
    inner.insertBefore(btn, targetSpan);
}

let observerTimer = null;
let floatingModalIdx = 0;
function showFloatingResult(text) {
    const modalId = `tr-floating-res-${floatingModalIdx++}`;

    const floatBox = document.createElement('div');
    floatBox.id = modalId;
    floatBox.style.cssText = `
        position: fixed; top: 20%; left: 20%; width: 300px; 
        background: linear-gradient(var(--background-floating, #18191c), var(--background-floating, #18191c)) padding-box, 
                    linear-gradient(90deg, #b55eec, #ff73fa, #ffb0df, #ff73fa, #b55eec) border-box;
        border: 2px solid transparent; border-radius: 8px; 
        box-shadow: 0 8px 24px rgba(255, 115, 250, 0.2); 
        color: var(--text-normal, #dcddde); z-index: 9999999; 
        display: flex; flex-direction: column; font-family: inherit; font-size: 14px;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
        padding: 8px 12px; background: rgba(0,0,0,0.2); 
        border-bottom: 1px solid rgba(255,255,255,0.05); 
        display: flex; justify-content: space-between; align-items: center; 
        cursor: grab; user-select: none;
        border-top-left-radius: 6px; border-top-right-radius: 6px;
    `;

    const title = document.createElement('strong');
    title.innerText = "Translation Result";
    title.style.color = "#fff";

    const closeBtn = document.createElement('div');
    closeBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"/></svg>`;
    closeBtn.style.cssText = 'cursor: pointer; color: var(--text-muted, #949ba4); display: flex; align-items: center; justify-content: center;';
    closeBtn.onclick = () => floatBox.remove();
    closeBtn.onmouseenter = () => closeBtn.style.color = '#fff';
    closeBtn.onmouseleave = () => closeBtn.style.color = 'var(--text-muted, #949ba4)';

    header.appendChild(title);
    header.appendChild(closeBtn);

    const content = document.createElement('div');
    content.style.cssText = 'padding: 12px; white-space: pre-wrap; word-break: break-word; max-height: 400px; overflow-y: auto;';
    content.textContent = text;
    content.dir = 'auto';

    floatBox.appendChild(header);
    floatBox.appendChild(content);
    document.body.appendChild(floatBox);

    let isDragging = false;
    let dragStartX = 0, dragStartY = 0;
    let initX = 0, initY = 0;

    const onMouseMove = (e) => {
        if (!isDragging) return;
        floatBox.style.left = `${initX + (e.clientX - dragStartX)}px`;
        floatBox.style.top = `${initY + (e.clientY - dragStartY)}px`;
    };

    const onMouseUp = () => {
        if (isDragging) {
            isDragging = false;
            header.style.cursor = 'grab';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    };

    header.onmousedown = (e) => {
        if (e.target === closeBtn || closeBtn.contains(e.target)) return;
        isDragging = true;
        header.style.cursor = 'grabbing';
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        const rect = floatBox.getBoundingClientRect();
        initX = rect.left;
        initY = rect.top;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };
}

function startImagePolygonSelection(targetImg) {
    if (isLoading || document.getElementById('tr-poly-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'tr-poly-overlay';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 9999999; cursor: crosshair; background: rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center;';

    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth / 2;
    canvas.height = window.innerHeight / 2;
    canvas.style.cssText = 'width: 100vw; height: 100vh; position: absolute; top:0; left:0;';

    overlay.oncontextmenu = e => e.preventDefault();

    overlay.appendChild(canvas);
    document.body.appendChild(overlay);

    const ctx = canvas.getContext('2d');
    let points = [];
    let mousePos = null;
    let closed = false;

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }

            if (closed) {
                ctx.lineTo(points[0].x, points[0].y);
                ctx.fillStyle = 'rgba(88, 101, 242, 0.3)';
                ctx.fill();
            } else if (mousePos) {
                ctx.lineTo(mousePos.x, mousePos.y);
            }

            ctx.lineWidth = 2;
            ctx.strokeStyle = '#5865F2';
            ctx.stroke();

            points.forEach((p, idx) => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = (idx === 0) ? '#ffb0df' : '#b55eec';
                ctx.fill();
            });

            if (!closed && points.length > 2 && mousePos) {
                const dist = Math.hypot(points[0].x - mousePos.x, points[0].y - mousePos.y);
                if (dist < 15) {
                    ctx.beginPath();
                    ctx.arc(points[0].x, points[0].y, 8, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.fill();
                }
            }
        }
    }

    const onMouseUp = (e) => {
        if (closed) return;
        e.stopPropagation(); e.preventDefault();

        if (e.button === 2) {
            points.pop();
            draw();
            return;
        }

        if (e.button !== 0) return;

        const x = e.clientX / 2;
        const y = e.clientY / 2;

        if (points.length > 2) {
            const dist = Math.hypot(points[0].x - x, points[0].y - y);
            if (dist < 15) {
                closed = true;
                document.removeEventListener('keydown', onKeyDown);
                draw();
                setTimeout(() => processPolygonTranslation(points, targetImg, overlay), 300);
                return;
            }
        }
        points.push({ x, y });
        mousePos = { x, y };
        draw();
    };

    const onMouseMove = (e) => {
        if (closed) return;
        mousePos = { x: e.clientX / 2, y: e.clientY / 2 };
        draw();
    };

    const onKeyDown = (e) => {
        if (e.code === 'Escape') {
            document.removeEventListener('keydown', onKeyDown);
            overlay.remove();
        }
        if (e.ctrlKey && e.code === 'KeyZ') {
            if (!closed && points.length > 0) {
                points.pop();
                draw();
            }
        }
    };

    overlay.addEventListener('mouseup', onMouseUp);
    overlay.addEventListener('mousemove', onMouseMove);
    document.addEventListener('keydown', onKeyDown);
}

async function processPolygonTranslation(points, imgElement, overlay) {
    if (points.length < 3 || isLoading) { overlay.remove(); return; }

    const rect = imgElement.getBoundingClientRect();
    if (!rect.width || !rect.height || !imgElement.naturalWidth || !imgElement.naturalHeight) {
        overlay.remove();
        showTranslationToast('The image is not loaded yet.', true);
        return;
    }
    const scaleX = imgElement.naturalWidth / rect.width;
    const scaleY = imgElement.naturalHeight / rect.height;

    const imgPoints = points.map(pt => ({
        x: ((pt.x * 2) - rect.left) * scaleX,
        y: ((pt.y * 2) - rect.top) * scaleY
    }));

    overlay.remove();
    showLoader("Fetching image...");

    let imageBlob;
    let request;
    const originalImageUrl = imgElement.src;
    try {
        await ensureReady();
        request = { action: 'translate', kind: 'image', targetLanguage: settings.readingLanguage, revision: settingsRevision };
        const response = await fetch(originalImageUrl);
        if (!response.ok) throw new Error('Image request failed.');
        imageBlob = await response.blob();
    } catch (e) {
        hideLoader();
        showTranslationToast(e.message || "Failed to fetch image data. It may be blocked by CORS.", true);
        return;
    }

    try {
        const imgBitmap = await createImageBitmap(imageBlob);

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        imgPoints.forEach(p => {
            if (p.x < minX) minX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.x > maxX) maxX = p.x;
            if (p.y > maxY) maxY = p.y;
        });

        minX = Math.max(0, Math.floor(minX));
        minY = Math.max(0, Math.floor(minY));
        maxX = Math.min(imgBitmap.width, Math.ceil(maxX));
        maxY = Math.min(imgBitmap.height, Math.ceil(maxY));

        let boxWidth = maxX - minX;
        let boxHeight = maxY - minY;

        if (boxWidth <= 0 || boxHeight <= 0) {
            imgBitmap.close();
            hideLoader();
            showTranslationToast("Selected area is too small or outside the image.");
            return;
        }

        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = boxWidth;
        cropCanvas.height = boxHeight;
        const cx = cropCanvas.getContext('2d');

        cx.fillStyle = 'black';
        cx.fillRect(0, 0, boxWidth, boxHeight);

        cx.beginPath();
        cx.moveTo(imgPoints[0].x - minX, imgPoints[0].y - minY);
        for (let i = 1; i < imgPoints.length; i++) {
            cx.lineTo(imgPoints[i].x - minX, imgPoints[i].y - minY);
        }
        cx.closePath();
        cx.clip();

        cx.drawImage(imgBitmap, -minX, -minY);

        imgBitmap.close();
        let finalCanvas = cropCanvas;
        if (Math.max(boxWidth, boxHeight) > 1024) {
            const ratio = 1024 / Math.max(boxWidth, boxHeight);
            const resCanvas = document.createElement('canvas');
            resCanvas.width = Math.max(1, Math.floor(boxWidth * ratio));
            resCanvas.height = Math.max(1, Math.floor(boxHeight * ratio));
            const resCx = resCanvas.getContext('2d');
            resCx.drawImage(cropCanvas, 0, 0, resCanvas.width, resCanvas.height);
            finalCanvas = resCanvas;
        }

        const base64Img = finalCanvas.toDataURL("image/jpeg", 0.95);
        showLoader("Translating image...");

        request.imageUrl = base64Img;
        const response = await runtimeRequest(request);
        await refreshState();
        if (requestIsCurrent(request, response) && imgElement.src === originalImageUrl) {
            showFloatingResult('Original:\n' + response.original + '\n\n' + shared.languageName(request.targetLanguage) + ':\n' + response.text);
            reportWarnings(response);
        } else showTranslationToast('Image or settings changed. Please translate again.');

    } catch (e) {
        hideLoader();
        showTranslationToast("Image Processing Error: " + e.message, true);
    } finally { hideLoader(); }
}

function injectImageActionMenu() {
    const actionMenus = document.querySelectorAll('div[class*="actionButtons_"]:not([data-tr-img-injected="true"])');
    actionMenus.forEach(menu => {
        if (menu.querySelector('#custom-tr-img-btn')) return;

        const spans = Array.from(menu.children);
        let moreBtnSpan = null;
        for (let i = spans.length - 1; i >= 0; i--) {
            const btn = spans[i].querySelector('button');
            if (btn) {
                moreBtnSpan = spans[i];
                break;
            }
        }

        if (!moreBtnSpan) return;
        menu.dataset.trImgInjected = "true";

        const btnWrap = document.createElement('span');
        btnWrap.id = 'custom-tr-img-btn';
        btnWrap.innerHTML = `<button data-mana-component="button" role="button" class="button_a22cb0 sm_a22cb0 icon-only_a22cb0 tr-nitro-btn" type="button" aria-label="Translate Image">
            <div class="buttonChildrenWrapper_a22cb0">
                <div class="buttonChildren_a22cb0">${NITRO_SVG_ICON(16)}</div>
            </div>
        </button>`;

        btnWrap.onclick = (e) => {
            e.stopPropagation();
            const modal = menu.closest('[class*="carouselModal_"]') || document.querySelector('[class*="carouselModal_"]');
            const mediaArea = modal ? modal.querySelector('div[class*="mediaArea_"]') : document.querySelector('div[class*="mediaArea_"]');

            if (!mediaArea) {
                alert("Cannot find image area.");
                return;
            }
            const activeImg = mediaArea.querySelector('img');
            if (!activeImg) {
                alert("Cannot find image in media area.");
                return;
            }
            startImagePolygonSelection(activeImg);
        };

        menu.insertBefore(btnWrap, moreBtnSpan);
    });
}

let writePopup = null;
let writePopupHasWarning = false;

function injectWriteTranslationButton() {
    const buttonContainers = document.querySelectorAll('div[class*="buttons_"]:not([data-tr-write-injected="true"])');
    buttonContainers.forEach(container => {
        if (!container.closest('[class*="channelTextArea_"]')) return;

        container.dataset.trWriteInjected = "true";

        const btnWrap = document.createElement('div');
        btnWrap.className = 'buttonContainer__74017';
        btnWrap.style.display = 'flex';
        btnWrap.style.alignItems = 'center';

        btnWrap.innerHTML = `
            <div class="button__74017 button__24af7 tr-nitro-btn" aria-label="Translate your message" role="button" tabindex="0">
                <div class="buttonWrapper__24af7" style="display: flex; align-items: center; justify-content: center; height: 100%;">
                    ${NITRO_SVG_ICON(20)}
                </div>
            </div>`;

        btnWrap.onclick = (e) => {
            e.stopPropagation();
            toggleWriteTranslationPopup(btnWrap);
        };

        const emojiBtn = Array.from(container.children).find(c => c.querySelector('[aria-label="Add Emoji"]') || c.innerHTML.includes('Add Emoji'));
        if (emojiBtn) {
            container.insertBefore(btnWrap, emojiBtn);
        } else {
            container.appendChild(btnWrap);
        }
    });
}

function toggleWriteTranslationPopup(btnElement) {
    if (!writePopup) {
        writePopup = document.createElement('div');
        writePopup.id = 'tr-write-popup';
        writePopup.style.cssText = `position: absolute; width: 480px; max-height: 70vh; background: var(--background-secondary, #2f3136); border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.24); z-index: 10000; border: 1px solid var(--border-subtle, rgba(255,255,255,0.05)); display: none; flex-direction: column; overflow: hidden;`;

        writePopup.innerHTML = `
          <style>
              #tr-write-popup *::-webkit-scrollbar { width: 8px; height: 8px; }
              #tr-write-popup *::-webkit-scrollbar-thumb { background-color: var(--scrollbar-thin-thumb, #202225); border-radius: 4px; }
              #tr-write-popup *::-webkit-scrollbar-track { background-color: transparent; }
          </style>
          <div style="padding: 12px 16px; background: var(--background-tertiary, #202225); border-bottom: 1px solid var(--background-modifier-accent, rgba(255,255,255,0.06)); display: flex; justify-content: space-between; align-items: center; cursor: move; user-select: none;" id="tr-write-popup-header">
             <strong style="color: #fff; font-size: 15px; display:flex; align-items:center; gap:8px;">${NITRO_SVG_ICON(18)} <span id="tr-write-language-label">Write Translation</span></strong>
             <svg id="tr-write-popup-close" style="cursor: pointer; color: var(--interactive-normal, #b9bbbe); transition: color 0.15s ease;" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"/></svg>
          </div>
          <div style="padding: 16px; display: flex; flex-direction: column; gap: 12px; flex: 1; overflow-y: auto;">
             <textarea id="tr-write-popup-input" style="width: 100%; min-height: 80px; max-height: 200px; background: var(--channeltextarea-background, #40444b); border: none; border-radius: 8px; color: var(--text-normal, #dcddde); padding: 12px; resize: vertical; font-family: inherit; font-size: 15px; outline: none; box-sizing: border-box; line-height: 1.4;" placeholder="Enter text in any language..."></textarea>
             <button id="tr-write-popup-start" style="background: var(--brand-experiment, #5865F2); color: #fff; border: none; padding: 10px 16px; border-radius: 4px; font-weight: 600; font-size: 14px; cursor: pointer; transition: background 0.17s ease;">Translate</button>
             <div id="tr-write-popup-results" style="display: flex; flex-direction: column; gap: 12px; flex: 1; overflow-y: auto; padding-top: 4px;">
             </div>
          </div>
          <div id="tr-write-popup-resizer" style="position: absolute; right: 0; bottom: 0; width: 16px; height: 16px; cursor: se-resize; display: flex; align-items: flex-end; justify-content: flex-end; padding: 2px;">
             <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M10 0V10H0L10 0Z" fill="var(--interactive-muted, #4f545c)"/></svg>
          </div>
       `;

        document.body.appendChild(writePopup);

        document.getElementById('tr-write-popup-close').onclick = () => {
            writePopup.style.display = 'none';
        };
        document.getElementById('tr-write-popup-close').onmouseenter = (e) => e.target.style.color = '#dcddde';
        document.getElementById('tr-write-popup-close').onmouseleave = (e) => e.target.style.color = 'var(--interactive-normal, #b9bbbe)';

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && writePopup.style.display !== 'none') {
                writePopup.style.display = 'none';
            }
        });

        document.addEventListener('mousedown', (e) => {
            if (writePopup.style.display !== 'none') {
                if (!writePopup.contains(e.target) && !e.target.closest('[data-tr-write-injected="true"]')) {
                    writePopup.style.display = 'none';
                }
            }
        });

        const header = document.getElementById('tr-write-popup-header');
        let isDragging = false;
        let dragStart = { x: 0, y: 0 }, initPos = { x: 0, y: 0 };

        header.onmousedown = (e) => {
            if (e.target.closest('#tr-write-popup-close')) return;
            isDragging = true;
            dragStart = { x: e.clientX, y: e.clientY };
            const rect = writePopup.getBoundingClientRect();
            initPos = { x: rect.left, y: rect.top };
            document.addEventListener('mousemove', onDragMove);
            document.addEventListener('mouseup', onDragUp);
        };
        const onDragMove = (e) => {
            if (isDragging) {
                writePopup.style.left = (initPos.x + (e.clientX - dragStart.x)) + 'px';
                writePopup.style.top = (initPos.y + (e.clientY - dragStart.y)) + 'px';
                writePopup.style.bottom = 'auto';
                writePopup.style.right = 'auto';
            }
        };
        const onDragUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', onDragMove);
            document.removeEventListener('mouseup', onDragUp);
        };

        const resizer = document.getElementById('tr-write-popup-resizer');
        let isResizing = false;
        let resizeStart = { x: 0, y: 0 }, initSize = { w: 0, h: 0 };

        resizer.onmousedown = (e) => {
            e.preventDefault();
            isResizing = true;
            resizeStart = { x: e.clientX, y: e.clientY };
            initSize = { w: writePopup.offsetWidth, h: writePopup.offsetHeight };
            document.addEventListener('mousemove', onResizeMove);
            document.addEventListener('mouseup', onResizeUp);
            writePopup.style.maxHeight = 'none';
        };
        const onResizeMove = (e) => {
            if (isResizing) {
                writePopup.style.width = Math.max(350, initSize.w + (e.clientX - resizeStart.x)) + 'px';
                writePopup.style.height = Math.max(350, initSize.h + (e.clientY - resizeStart.y)) + 'px';
            }
        };
        const onResizeUp = () => {
            isResizing = false;
            document.removeEventListener('mousemove', onResizeMove);
            document.removeEventListener('mouseup', onResizeUp);
        };

        const startBtn = document.getElementById('tr-write-popup-start');
        startBtn.onclick = performWriteTranslation;
        startBtn.onmouseenter = (e) => e.target.style.background = 'var(--brand-experiment-560, #4752C4)';
        startBtn.onmouseleave = (e) => e.target.style.background = 'var(--brand-experiment, #5865F2)';
    }

    updateWriteLanguageLabel();
    if (writePopup.style.display === 'none') {
        const inputEl = document.getElementById('tr-write-popup-input');
        const slateEditor = document.querySelector('[data-slate-editor="true"]');
        if (slateEditor) {
            inputEl.value = slateEditor.innerText.trim();
        }
        writePopupHasWarning = false;

        const rect = btnElement.getBoundingClientRect();
        writePopup.style.display = 'flex';
        writePopup.style.bottom = (window.innerHeight - rect.top + 10) + 'px';
        writePopup.style.right = Math.max(10, window.innerWidth - rect.right - 100) + 'px';
        writePopup.style.left = 'auto';
        writePopup.style.top = 'auto';
    } else {
        writePopup.style.display = 'none';
    }
}

function updateWriteLanguageLabel() {
    const label = document.getElementById('tr-write-language-label');
    if (label) label.textContent = 'Write in ' + shared.languageName(settings.writingLanguage);
}

function getContextForWrite(limit = 600) {
    const items = Array.from(document.querySelectorAll('.' + cls.msgList.split(' ')[0]));
    let context = '';
    for (let index = items.length - 1; index >= 0; index--) {
        const text = messageNodes(items[index]).map(sourceText).join(' ').trim();
        if (!text.trim()) continue;
        const line = '- ' + text + '\n';
        if (context.length + line.length > limit) break;
        context = line + context;
    }
    return context.trim() || '(No previous chat context)';
}

let writeBusy = false;
async function performWriteTranslation() {
    if (writeBusy) return;
    const inputEl = document.getElementById('tr-write-popup-input');
    const resultsContainer = document.getElementById('tr-write-popup-results');
    const startBtn = document.getElementById('tr-write-popup-start');
    const text = inputEl.value.trim();
    if (!text) { showTranslationToast('Please enter text to translate.', true); return; }
    if (text.length > 1000 && !writePopupHasWarning) {
        alert('The text exceeds 1000 characters. It is recommended to split it into 2 parts.\nPlease confirm to proceed, or modify the text.');
        writePopupHasWarning = true;
        return;
    }
    writeBusy = true;
    startBtn.disabled = true;
    resultsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; gap: 16px;">
            <img src="${chrome.runtime.getURL(getNextLoadingImage())}" style="width: 48px; height: 48px; animation: tr-spin 1s linear infinite;" />
            <div style="color: var(--text-muted, #949ba4); font-size: 15px; font-weight: 500;">Translating into multiple versions...</div>
        </div>`;
    try {
        await ensureReady();
        const request = { action: 'translate', kind: 'write', text, context: getContextForWrite(600),
            targetLanguage: settings.writingLanguage, backLanguage: settings.readingLanguage, revision: settingsRevision };
        const response = await runtimeRequest(request);
        await refreshState();
        if (!requestIsCurrent(request, response) || inputEl.value.trim() !== text) {
            resultsContainer.textContent = 'Text or settings changed. Please translate again.';
            return;
        }
        renderWriteTranslationResults(response.variations, text);
        reportWarnings(response);
    } catch (error) {
        resultsContainer.textContent = error.message || 'Write translation failed.';
        showTranslationToast(error.message || 'Write translation failed.', true);
    } finally {
        writeBusy = false;
        startBtn.disabled = false;
    }
}

function renderWriteTranslationResults(variations, originalText) {
    const resultsContainer = document.getElementById('tr-write-popup-results');
    resultsContainer.innerHTML = '';

    if (variations.length === 0) {
        resultsContainer.innerHTML = `<div style="color: #ed4245; padding: 16px; text-align: center; border-radius: 8px; background: rgba(237, 66, 69, 0.1);">Failed to parse translations from LLM.</div>`;
        return;
    }

    variations.forEach(v => {
        const item = document.createElement('div');
        item.style.cssText = `background: var(--background-secondary-alt, #292b2f); border: 1px solid var(--border-subtle, rgba(255,255,255,0.05)); border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 10px; position: relative; transition: background 0.2s, box-shadow 0.2s; cursor: pointer;`;
        item.onmouseenter = () => {
            item.style.background = 'var(--background-modifier-hover, rgba(79,84,92,0.16))';
            item.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        };
        item.onmouseleave = () => {
            item.style.background = 'var(--background-secondary-alt, #292b2f)';
            item.style.boxShadow = 'none';
        };

        const header = document.createElement('div');
        header.style.cssText = `display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--background-modifier-accent, rgba(255,255,255,0.06)); padding-bottom: 6px; pointer-events: none;`;
        const name = document.createElement('strong');
        name.textContent = v.name;
        name.style.cssText = 'color: var(--header-primary, #fff); font-size: 14px;';
        const tags = document.createElement('span');
        tags.textContent = Array.isArray(v.tags) ? v.tags.join(' ') : v.tags;
        tags.style.cssText = 'color: var(--brand-experiment, #5865F2); font-size: 13px; font-weight: bold; background: rgba(88,101,242,0.1); padding: 2px 6px; border-radius: 4px;';
        header.append(name, tags);

        const engText = document.createElement('div');
        engText.style.cssText = `color: var(--text-normal, #dcddde); font-size: 15px; font-weight: 500; line-height: 1.5; white-space: pre-wrap; pointer-events: none;`;
        engText.textContent = v.backTranslation;
        engText.dir = 'auto';

        const korText = document.createElement('div');
        korText.style.cssText = `color: var(--text-muted, #949ba4); font-size: 13px; line-height: 1.4; white-space: pre-wrap; background: var(--background-tertiary, #202225); padding: 8px; border-radius: 6px; pointer-events: none;`;
        korText.textContent = v.text;
        korText.dir = 'auto';

        item.onclick = async () => {
            const quotedOriginal = originalText.split('\n').map(l => '> ' + l).join('\n');
            const finalText = `${v.text}\n\n${quotedOriginal}`;
            try {
                await navigator.clipboard.writeText(finalText);
                showTranslationToast("Copied to clipboard!");
            } catch (err) {
                showTranslationToast("Failed to copy to clipboard.", true);
            }
            document.getElementById('tr-write-popup').style.display = 'none';
        };

        item.appendChild(header);
        item.appendChild(engText);
        item.appendChild(korText);

        resultsContainer.appendChild(item);
    });
}



function updatePageUI() {
        try {
            applyCacheToVisible();
        } catch (e) {
            showTranslationToast('Could not apply cached translation. Refresh Discord if this continues.', true);
        }

        const ctxMenu = document.querySelector('.' + cls.ctxScroller.split(' ')[0] + ':not([data-tr-injected="true"])');
        if (ctxMenu) injectContextMenu(ctxMenu);

        const toolMenus = document.querySelectorAll('.' + cls.toolContainer.split(' ')[0] + ':not([data-tr-injected="true"])');
        toolMenus.forEach(menu => injectToolMenu(menu));

        injectImageActionMenu();
        injectWriteTranslationButton();

        applyManualTranslationsToDOM();
}

const observer = new MutationObserver(() => {
    if (observerTimer) clearTimeout(observerTimer);
    observerTimer = setTimeout(updatePageUI, 150);
});

observer.observe(document.body, { childList: true, subtree: true, characterData: true });

chrome.runtime.onMessage.addListener(message => {
    if (message.action === 'state.changed') refreshState().catch(() => {});
});
refreshState().then(updatePageUI).catch(error => showTranslationToast(error.message, true));

window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('Extension context invalidated')) {
        if (typeof hideLoader === 'function') hideLoader();
        if (typeof showTranslationToast === 'function') {
            showTranslationToast("디스콜레이터 오류: 확장 프로그램 컨텍스트가 유효하지 않습니다. 페이지를 새로고침 해주세요.", true);
        }
    }
});
