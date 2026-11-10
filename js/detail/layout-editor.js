import { projects } from '../constellation/data/portfolio.js?v=3.12';

// Keep the editing session when moving between project detail pages.
const editorSessionKey = 'portfolio-layout-editor-active';
let editingSession = new URLSearchParams(location.search).get('debug') === 'layout';
try {
    if (editingSession) sessionStorage.setItem(editorSessionKey,'1');
    else editingSession = sessionStorage.getItem(editorSessionKey) === '1';
} catch { /* explicit debug URLs also work without storage */ }
if (editingSession) {
    const editorUrl = new URL(location.href);
    editorUrl.searchParams.set('debug','layout');
    window.history.replaceState(window.history.state,'',editorUrl);
    const sheet = document.createElement('link');
    sheet.rel = 'stylesheet';
    sheet.href = 'css/layout-editor.css?v=2.0';
    document.head.append(sheet);
    const project = new URLSearchParams(location.search).get('id') || 'project';
    const storageKey = `portfolio-layout-editor:${project}:v1`;
    let edits = {};
    try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
        if (saved && typeof saved === 'object' && !Array.isArray(saved)) edits = saved;
    } catch { /* storage optional */ }
    for (const value of Object.values(edits)) {
        if (value && typeof value === 'object') { delete value.x; delete value.y; }
    }
    const panel = document.createElement('aside');
    panel.className = 'le-panel';
    panel.setAttribute('aria-label', '레이아웃 편집기');
    panel.innerHTML = `
        <header><h2>레이아웃 편집기</h2><button data-action="hide">숨기기</button></header>
        <label class="le-row">프로젝트<select data-project aria-label="편집할 프로젝트"></select></label>
        <p class="le-help">박스를 잡아 위아래로 드래그하세요.<br>가로 위치는 본문 왼쪽에 고정됩니다.</p>
        <label class="le-row">드래그 방식<select data-mode><option value="spacing">위아래 간격</option><option value="order">순서 변경</option></select></label>
        <label class="le-row">조절 대상<select data-scope><option value="box">선택 박스</option><option value="section">현재 섹션</option><option value="page">본문 전체</option></select></label>
        <p class="le-name" data-name>본문 박스를 선택하세요.</p><div data-fields></div>
        <div class="le-actions"><button data-action="up" disabled>↑ 위로</button><button data-action="down" disabled>↓ 아래로</button><button data-action="guides" aria-pressed="true">외곽선 끄기</button><button data-action="toggle" aria-pressed="true">편집 끄기</button></div>
        <div class="le-actions"><button data-action="undo">실행 취소</button><button data-action="redo">다시 실행</button><button data-action="reset">선택 초기화</button><button data-action="reset-all">전체 초기화</button><button data-action="export">변경값 내보내기</button><button data-action="exit">편집 모드 종료</button></div>
        <p class="le-help">Ctrl+Z 취소 · Ctrl+Shift+Z 다시 실행<br>브라우저에 임시 저장 · 원본 파일 반영 전</p><p class="le-status" role="status">준비됨</p>`;
    const launcher = document.createElement('button');
    launcher.className = 'le-launcher';
    launcher.textContent = '레이아웃 편집기 열기';
    launcher.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    const dropLine = document.createElement('div');
    dropLine.className = 'le-drop-line';
    dropLine.hidden = true;
    document.body.append(panel, launcher, dropLine);
    const fieldHost = panel.querySelector('[data-fields]');
    const scopeInput = panel.querySelector('[data-scope]');
    const modeInput = panel.querySelector('[data-mode]');
    const projectInput = panel.querySelector('[data-project]');
    for (const item of projects.filter(item => item.href)) {
        const option = document.createElement('option');
        option.value = item.id; option.textContent = item.title;
        projectInput.append(option);
    }
    projectInput.value = project;
    projectInput.addEventListener('change', () => {
        commitField();
        const nextUrl = new URL(location.href);
        nextUrl.searchParams.set('id',projectInput.value);
        nextUrl.searchParams.set('debug','layout');
        nextUrl.hash = '';
        location.assign(nextUrl);
    });
    scopeInput.setAttribute('aria-label', '조절 대상');
    modeInput.setAttribute('aria-label', '드래그 방식');
    const targets = new Map(), plates = new Map(), membership = new Map();
    const history = [], future = [];
    let selected = null, dock = null, enabled = true, panelHidden = false, guides = true;
    let drag = null, fieldEdit = null, suppressClick = false, scrollFrame = 0;
    const textSelector = '.sys-dock__kicker,.sys-dock__title,.sys-dock__quote,.sys-dock__subhead,.sys-dock__thesis,.sys-dock__note,.sys-dock__list,.sys-dock__meta,.sys-dock__rules';
    const fieldSpecs = {
        box: [['fontSize','글씨 크기',8,100,0.5],['lineHeight','줄 높이',10,180,0.5],['width','박스 너비 (%)',10,100,1],['marginTop','위 간격',0,600,1],['marginBottom','아래 간격',0,600,1]],
        section: [['maxWidth','본문 최대 너비',280,2400,10],['minHeight','섹션 최소 높이',0,2400,10],['marginTop','이전 섹션과 간격',0,600,1],['paddingTop','섹션 위 여백',0,600,1],['paddingBottom','섹션 아래 여백',0,600,1]],
        page: [['paddingTop','본문 위 여백',0,300,1],['paddingBottom','본문 아래 여백',0,300,1],['paddingLeft','본문 왼쪽 여백',0,300,1],['paddingRight','본문 오른쪽 여백',0,300,1]]
    };
    const status = message => { panel.querySelector('[role=status]').textContent = message; };
    const active = () => enabled && !panelHidden;
    function save() {
        try { localStorage.setItem(storageKey, JSON.stringify(edits)); status('브라우저에 저장됨'); }
        catch { status('저장 공간을 사용할 수 없습니다. 내보내기를 사용하세요.'); }
    }
    function checkpoint(snapshot = JSON.stringify(edits)) {
        history.push(snapshot);
        if (history.length > 80) history.shift();
        future.length = 0;
    }
    function register(el, key, kind) {
        const properties = fieldSpecs[kind].map(spec => spec[0]);
        if (kind === 'box') properties.push('maxWidth','boxSizing');
        const original = new Map(properties.map(prop => {
            const cssName = prop.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
            return [cssName, {value:el.style.getPropertyValue(cssName),priority:el.style.getPropertyPriority(cssName)}];
        }));
        targets.set(key, {el, kind, original});
        el.dataset.layoutKey = key;
        if (kind === 'box') el.classList.add('le-target');
        apply(key);
    }
    function apply(key) {
        const target = targets.get(key);
        if (!target) return;
        const {el, kind, original} = target;
        // Restore only properties owned by the editor. The system controls dock
        // position and opening opacity independently, including after a resize.
        for (const [prop, saved] of original) {
            if (saved.value) el.style.setProperty(prop,saved.value,saved.priority);
            else el.style.removeProperty(prop);
        }
        const values = edits[key] || {};
        for (const [prop, , min, max] of fieldSpecs[kind]) {
            if (!Number.isFinite(values[prop])) continue;
            el.style[prop] = `${Math.max(min, Math.min(max, values[prop]))}${prop === 'width' ? '%' : 'px'}`;
            if (prop === 'width') { el.style.maxWidth = 'none'; el.style.boxSizing = 'border-box'; }
        }
    }
    function currentOrder(id) {
        const defaults = plates.get(id).groups.map(group => group.id), saved = edits.__order?.[id];
        return Array.isArray(saved) && saved.length === defaults.length && new Set(saved).size === defaults.length && saved.every(key => defaults.includes(key)) ? [...saved] : defaults;
    }
    function applyOrder(id) {
        const record = plates.get(id);
        const nodes = [...record.fixed, ...currentOrder(id).flatMap(key => record.groups.find(group => group.id === key).nodes)];
        if (nodes.some((el, index) => record.el.children[index] !== el)) record.el.append(...nodes);
    }
    function scan() {
        const foundDock = document.querySelector('.sys-dock');
        if (foundDock && !dock) { dock = foundDock; register(dock, '@page', 'page'); }
        document.querySelectorAll('.sys-dock__plate').forEach(plate => {
            const id = plate.dataset.plate;
            if (plates.has(id)) return;
            const record = {el:plate, fixed:[], groups:[]};
            plates.set(id, record);
            register(plate, `@section:${id}`, 'section');
            // Retain text IDs so earlier font and spacing edits still match.
            plate.querySelectorAll(textSelector).forEach((el, index) => register(el, `${id}:${index}:${el.classList[0]}`, 'box'));
            let group = null, extraIndex = 0;
            for (const el of plate.children) {
                if (!el.dataset.layoutKey) register(el, `${id}:extra:${extraIndex++}:${el.classList[0]}`, 'box');
                if (el.matches('.sys-dock__kicker,.sys-dock__title,.sys-dock__quote,.sys-dock__meta')) { record.fixed.push(el); continue; }
                if (!group || el.matches('.sys-dock__subhead') || !group.hasHeading) {
                    group = {id:String(record.groups.length), plate:id, nodes:[], hasHeading:el.matches('.sys-dock__subhead')};
                    record.groups.push(group);
                }
                group.nodes.push(el); membership.set(el, group);
                for (const child of el.querySelectorAll(textSelector)) membership.set(child, group);
            }
            applyOrder(id);
        });
        if (dock) observer.disconnect();
    }
    function scopeTarget() {
        if (scopeInput.value === 'page') return targets.get('@page');
        if (scopeInput.value === 'section') {
            const plate = selected?.closest('.sys-dock__plate');
            return plate && targets.get(`@section:${plate.dataset.plate}`);
        }
        return selected && targets.get(selected.dataset.layoutKey);
    }
    function syncButtons() {
        const group = selected && membership.get(selected), order = group ? currentOrder(group.plate) : [];
        const index = group ? order.indexOf(group.id) : -1;
        panel.querySelector('[data-action=up]').disabled = !active() || index <= 0;
        panel.querySelector('[data-action=down]').disabled = !active() || index < 0 || index >= order.length - 1;
        panel.querySelector('[data-action=undo]').disabled = !history.length;
        panel.querySelector('[data-action=redo]').disabled = !future.length;
    }
    function renderFields() {
        commitField();
        const target = scopeTarget(), name = panel.querySelector('[data-name]');
        fieldHost.replaceChildren();
        if (!target) { name.textContent = '본문 박스를 선택하세요.'; syncButtons(); return; }
        const {el, kind} = target, computed = getComputedStyle(el);
        name.textContent = kind === 'page' ? '본문 전체 · 안쪽 여백' : kind === 'section' ? `${el.querySelector('.sys-dock__title')?.textContent || ''} · 섹션 여백` : el.textContent.trim().slice(0,70) || '이미지 / 콘텐츠 박스';
        for (const [prop, label, min, max, step] of fieldSpecs[kind]) {
            if (kind === 'box' && (prop === 'fontSize' || prop === 'lineHeight') && el.matches('figure,.sys-dock__gallery')) continue;
            const row = document.createElement('label'); row.className = 'le-row';
            row.textContent = label + (prop === 'width' ? '' : ' (px)');
            const input = document.createElement('input');
            Object.assign(input, {type:'number', min, max, step}); input.dataset.prop = prop;
            let value = parseFloat(computed[prop]);
            if (prop === 'width') {
                const parent = getComputedStyle(el.parentElement);
                const parentWidth = el.parentElement.clientWidth - parseFloat(parent.paddingLeft) - parseFloat(parent.paddingRight);
                value = el.getBoundingClientRect().width / Math.max(1,parentWidth) * 100;
            }
            if (prop === 'lineHeight' && !Number.isFinite(value)) value = parseFloat(computed.fontSize) * 1.5;
            if (prop === 'minHeight' && computed.minHeight.endsWith('%')) {
                const parent = getComputedStyle(el.parentElement);
                value = value / 100 * (el.parentElement.clientHeight - parseFloat(parent.paddingTop) - parseFloat(parent.paddingBottom));
            }
            input.value = Number.isFinite(value) ? Math.round(value * 10) / 10 : ''; input.placeholder = '자동';
            row.append(input); fieldHost.append(row);
        }
        syncButtons();
    }
    function select(el) {
        selected?.classList.remove('le-selected'); selected = el; selected.classList.add('le-selected');
        scopeInput.value = 'box'; renderFields();
    }
    function restore() {
        for (const key of targets.keys()) apply(key);
        for (const id of plates.keys()) applyOrder(id);
        renderFields(); save();
    }
    function undo(redo = false) {
        commitField();
        finishDrag(true);
        const source = redo ? future : history;
        if (!source.length) return;
        (redo ? history : future).push(JSON.stringify(edits)); edits = JSON.parse(source.pop()); restore();
    }
    function moveGroup(group, nextOrder) {
        edits.__order = {...edits.__order, [group.plate]:nextOrder}; applyOrder(group.plate);
    }
    function syncMode() {
        document.body.classList.toggle('le-editing', active());
        document.body.classList.toggle('le-spacing-mode', modeInput.value === 'spacing');
        document.body.classList.toggle('is-layout-debug', guides && !panelHidden);
        document.body.classList.toggle('le-hide-guides', !guides || panelHidden);
        selected?.classList.toggle('le-selected', active());
        for (const [action, on, off, value] of [['guides','외곽선 끄기','외곽선 켜기',guides],['toggle','편집 끄기','편집 켜기',enabled]]) {
            const button = panel.querySelector(`[data-action=${action}]`);
            button.textContent = value ? on : off; button.setAttribute('aria-pressed',String(value));
        }
        syncButtons();
    }
    function setHidden(hidden) {
        finishDrag(true); panelHidden = hidden; panel.hidden = hidden; launcher.hidden = !hidden;
        launcher.setAttribute('aria-expanded',String(!hidden)); syncMode();
        if (hidden) launcher.focus(); else panel.querySelector('[data-action=hide]').focus();
    }
    // Change document flow, not absolute coordinates: following boxes stay attached.
    document.addEventListener('pointerdown', event => {
        if (!active() || event.button !== 0 || panel.contains(event.target)) return;
        const el = event.target.closest('.le-target');
        if (!el) return;
        event.preventDefault(); event.stopImmediatePropagation(); select(el);
        const group = membership.get(el);
        if (modeInput.value === 'order' && !group) { status('제목·리드문·기본 정보는 순서가 고정됩니다. 간격은 조절할 수 있어요.'); return; }
        const previous = el.previousElementSibling;
        const margin = parseFloat(getComputedStyle(el).marginTop) || 0;
        const previousMargin = previous ? parseFloat(getComputedStyle(previous).marginBottom) || 0 : 0;
        drag = {el, group, mode:modeInput.value, pointerId:event.pointerId, startY:event.clientY, y:event.clientY, margin:Math.max(margin,previousMargin), snapshot:JSON.stringify(edits), moved:false};
        el.setPointerCapture(event.pointerId);
    }, true);
    function showInsertion() {
        if (!drag?.moved || drag.mode !== 'order') return;
        const {group, y} = drag, record = plates.get(group.plate);
        const others = currentOrder(group.plate).filter(id => id !== group.id);
        const before = others.find(id => {
            const nodes = record.groups.find(g => g.id === id).nodes;
            return y < (nodes[0].getBoundingClientRect().top + nodes.at(-1).getBoundingClientRect().bottom) / 2;
        });
        const index = before == null ? others.length : others.indexOf(before);
        drag.order = [...others.slice(0,index),group.id,...others.slice(index)];
        const anchor = record.groups.find(g => g.id === (before ?? others.at(-1)));
        if (!anchor) return;
        const rect = record.el.getBoundingClientRect();
        const top = before == null ? anchor.nodes.at(-1).getBoundingClientRect().bottom : anchor.nodes[0].getBoundingClientRect().top;
        dropLine.hidden = false;
        Object.assign(dropLine.style, {left:`${rect.left}px`,top:`${top}px`,width:`${rect.width}px`});
    }
    function autoScroll() {
        if (!drag?.moved || drag.mode !== 'order') return;
        const rect = dock.getBoundingClientRect();
        if (drag.y < rect.top + 50) dock.scrollTop -= 12;
        else if (drag.y > rect.bottom - 50) dock.scrollTop += 12;
        showInsertion(); scrollFrame = requestAnimationFrame(autoScroll);
    }
    document.addEventListener('pointermove', event => {
        if (!drag || event.pointerId !== drag.pointerId) return;
        const delta = event.clientY - drag.startY;
        if (!drag.moved && Math.abs(delta) < 4) return;
        event.preventDefault(); event.stopImmediatePropagation();
        if (!drag.moved) {
            drag.moved = true; document.body.classList.add('le-dragging');
            if (drag.mode === 'order') { for (const node of drag.group.nodes) node.classList.add('le-moving'); autoScroll(); }
        }
        drag.y = event.clientY;
        if (drag.mode === 'spacing') {
            const key = drag.el.dataset.layoutKey;
            edits[key] = {...edits[key],marginTop:Math.max(0,Math.min(600,Math.round(drag.margin + delta)))};
            apply(key);
            const input = fieldHost.querySelector('[data-prop=marginTop]');
            if (input) input.value = edits[key].marginTop;
            status(`위 간격 ${edits[key].marginTop}px · 왼쪽 정렬 유지`);
        } else showInsertion();
    }, true);
    function finishDrag(cancel = false) {
        if (!drag) return;
        const current = drag; drag = null; cancelAnimationFrame(scrollFrame);
        document.body.classList.remove('le-dragging');
        for (const node of current.group?.nodes || []) node.classList.remove('le-moving');
        dropLine.hidden = true;
        if (current.el.hasPointerCapture(current.pointerId)) current.el.releasePointerCapture(current.pointerId);
        if (!current.moved) return;
        suppressClick = true; setTimeout(() => { suppressClick = false; },0);
        if (cancel) { edits = JSON.parse(current.snapshot); restore(); return; }
        if (current.mode === 'order' && current.order) moveGroup(current.group,current.order);
        if (JSON.stringify(edits) !== current.snapshot) { checkpoint(current.snapshot); save(); }
        renderFields();
    }
    document.addEventListener('pointerup', () => finishDrag(), true);
    document.addEventListener('pointercancel', () => finishDrag(true), true);
    window.addEventListener('blur', () => finishDrag(true));
    document.addEventListener('click', event => {
        if (suppressClick || (active() && event.target.closest('.sys-dock .le-target'))) { event.preventDefault(); event.stopImmediatePropagation(); }
    }, true);
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && drag) { event.preventDefault(); event.stopImmediatePropagation(); finishDrag(true); return; }
        if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'z' || event.altKey) return;
        if (event.target.closest('textarea,[contenteditable=true],input:not([type=number])')) return;
        if (panel.contains(document.activeElement)) document.activeElement.blur();
        event.preventDefault(); event.stopImmediatePropagation(); undo(event.shiftKey);
    }, true);
    function commitField() {
        if (!fieldEdit) return;
        const snapshot = fieldEdit.snapshot;
        fieldEdit = null;
        if (JSON.stringify(edits) !== snapshot) { checkpoint(snapshot); save(); syncButtons(); }
    }
    function updateField(event) {
        const input = event.target, target = scopeTarget();
        if (!target || !input.dataset.prop) return;
        const key = target.el.dataset.layoutKey;
        const [prop, , min, max] = fieldSpecs[target.kind].find(spec => spec[0] === input.dataset.prop);
        if (input.value !== '' && !Number.isFinite(Number(input.value))) return;
        if (fieldEdit && fieldEdit.input !== input) commitField();
        if (!fieldEdit) fieldEdit = {input,snapshot:JSON.stringify(edits)};
        edits[key] = {...edits[key]};
        if (input.value === '') delete edits[key][prop]; else edits[key][prop] = Math.max(min,Math.min(max,Number(input.value)));
        apply(key);
        status('미리보기 적용 중');
    }
    fieldHost.addEventListener('input', updateField);
    fieldHost.addEventListener('change', event => { updateField(event); commitField(); });
    fieldHost.addEventListener('focusout', commitField);
    panel.addEventListener('wheel', event => event.stopPropagation());
    panel.addEventListener('pointerdown', event => event.stopPropagation());
    scopeInput.addEventListener('change', renderFields);
    modeInput.addEventListener('change', syncMode);
    launcher.addEventListener('click', () => setHidden(false));
    panel.addEventListener('click', event => {
        const action = event.target.closest('[data-action]')?.dataset.action;
        if (!action) return;
        commitField();
        if (action === 'exit') {
            try { sessionStorage.removeItem(editorSessionKey); } catch { /* storage optional */ }
            const url = new URL(location.href);
            url.searchParams.delete('debug');
            location.assign(url);
            return;
        }
        if (action === 'hide') { setHidden(true); return; }
        if (action === 'guides') { guides = !guides; syncMode(); return; }
        if (action === 'toggle') { enabled = !enabled; syncMode(); return; }
        if (action === 'undo' || action === 'redo') { undo(action === 'redo'); return; }
        if (action === 'export') {
            const blob = new Blob([JSON.stringify({project,edits},null,2)], {type:'application/json'}), url = URL.createObjectURL(blob);
            const link = document.createElement('a'); link.href = url; link.download = `${project}-layout.json`; link.click();
            setTimeout(() => URL.revokeObjectURL(url),1000); status('변경값 파일 다운로드 완료'); return;
        }
        if (action === 'up' || action === 'down') {
            const group = selected && membership.get(selected);
            if (!active() || !group) return;
            const order = currentOrder(group.plate), index = order.indexOf(group.id), next = index + (action === 'up' ? -1 : 1);
            if (next < 0 || next >= order.length) return;
            checkpoint(); [order[index],order[next]] = [order[next],order[index]];
            moveGroup(group,order); renderFields(); save(); return;
        }
        if (action === 'reset-all') { checkpoint(); edits = {}; restore(); }
        else if (action === 'reset') {
            const target = scopeTarget();
            if (!target) return;
            checkpoint(); delete edits[target.el.dataset.layoutKey]; restore();
        }
    });
    const observer = new MutationObserver(scan);
    observer.observe(document.body, {childList:true,subtree:true});
    scan(); syncMode();
}
