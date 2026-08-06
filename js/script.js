document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('viewfinder-home')) {
        initViewfinderHome();
    } else {
        // Legacy grids on pages that still use them (none on new home)
        if (typeof renderProjects === 'function' && document.getElementById('school-works-grid')) {
            renderProjects();
        }
    }

    initComputationalCanvas();
});

/* ---------- Viewfinder field ---------- */

const CATEGORY_LABELS = {
    schoolWorks: 'SCHOOL',
    competitions: 'COMPETITION',
    otherWorks: 'OTHER'
};

function collectProjects() {
    const list = [];
    const order = ['schoolWorks', 'competitions', 'otherWorks'];
    order.forEach(category => {
        const items = (typeof projectsData !== 'undefined' && projectsData[category]) || [];
        items.forEach(project => {
            list.push({ project, category });
        });
    });
    return list;
}

function initViewfinderHome() {
    const viewport = document.getElementById('vf-viewport');
    const world = document.getElementById('vf-world');
    const field = document.getElementById('vf-field');
    if (!viewport || !world || !field || typeof projectsData === 'undefined') return;

    const BOARD_W = 1080;
    const BOARD_H = 720;
    const CARD_W = 320;
    const CARD_H = 220;
    const GAP_X = 24;
    const GAP_Y = 20;
    const MIN_ZOOM = 0.35;
    const MAX_ZOOM = 2.5;
    const DRAG_THRESHOLD = 6;

    const HEX_SLOTS = [
        { c: 1, r: 0 }, { c: 3, r: 0 },
        { c: 0, r: 1 }, { c: 2, r: 1 }, { c: 4, r: 1 },
        { c: 1, r: 2 }, { c: 3, r: 2 }
    ];

    const cellW = (BOARD_W - GAP_X * 2) / 6;
    const cellH = (BOARD_H - GAP_Y * 2) / 3;

    field.style.width = `${BOARD_W}px`;
    field.style.height = `${BOARD_H}px`;

    const entries = collectProjects();
    const subjects = [];
    const focusName = document.getElementById('vf-focus-name');
    const hint = document.getElementById('vf-hint');

    entries.forEach((entry, index) => {
        const el = createSubjectElement(entry.project, entry.category, index);
        const slot = HEX_SLOTS[index] || { c: index % 6, r: Math.floor(index / 6) };
        const left = GAP_X + slot.c * cellW + (cellW * 2 - CARD_W) / 2;
        const top = GAP_Y + slot.r * cellH + (cellH - CARD_H) / 2;
        el.style.width = `${CARD_W}px`;
        el.style.height = `${CARD_H}px`;
        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
        el._pos = { x: left, y: top };
        field.appendChild(el);
        subjects.push(el);
    });

    const camera = { x: 0, y: 0, scale: 1 };
    const state = {
        index: -1,
        subjects,
        spaceDown: false,
        mode: null, // 'pan' | 'card'
        pointerId: null,
        startClient: { x: 0, y: 0 },
        moved: false,
        suppressClick: false,
        panOrigin: { x: 0, y: 0 },
        cardEl: null,
        cardOrigin: { x: 0, y: 0 },
        cardIndex: -1
    };

    if (hint && window.matchMedia('(hover: none)').matches) {
        hint.textContent = 'Drag canvas / cards · Pinch zoom';
    }

    function applyCamera() {
        world.style.transform = `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`;
    }

    function centerBoard() {
        const vr = viewport.getBoundingClientRect();
        camera.scale = Math.min(1, Math.min((vr.width - 80) / BOARD_W, (vr.height - 140) / BOARD_H));
        camera.scale = Math.max(MIN_ZOOM, camera.scale);
        camera.x = (vr.width - BOARD_W * camera.scale) / 2;
        camera.y = (vr.height - BOARD_H * camera.scale) / 2 + 12;
        applyCamera();
    }

    centerBoard();
    window.addEventListener('resize', centerBoard);

    function setFocus(nextIndex, { fromKeyboard } = {}) {
        if (nextIndex < 0 || nextIndex >= subjects.length) return;
        state.index = nextIndex;
        subjects.forEach((el, i) => {
            const focused = i === nextIndex;
            el.classList.toggle('is-focused', focused);
            el.classList.toggle('is-dimmed', !focused);
            if (focused) el.setAttribute('aria-current', 'true');
            else el.removeAttribute('aria-current');
            if (focused && fromKeyboard) el.focus({ preventScroll: true });
        });
        if (focusName) focusName.textContent = entries[nextIndex].project.title;
    }

    function clearFocus() {
        state.index = -1;
        subjects.forEach(el => {
            el.classList.remove('is-focused', 'is-dimmed');
            el.removeAttribute('aria-current');
        });
        if (focusName) focusName.textContent = '—';
    }

    function openProject(index) {
        const { project } = entries[index];
        try { localStorage.setItem('currentProjectId', project.id); } catch (_) { /* ignore */ }
        document.body.classList.add('is-zooming');
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.setTimeout(() => {
            window.location.href = detailUrlFor(project.id);
        }, reduce ? 0 : 280);
    }

    function onPointerMove(e) {
        if (state.pointerId !== e.pointerId || !state.mode) return;
        e.preventDefault();

        const dx = e.clientX - state.startClient.x;
        const dy = e.clientY - state.startClient.y;

        if (!state.moved && (dx * dx + dy * dy > DRAG_THRESHOLD * DRAG_THRESHOLD)) {
            state.moved = true;
            state.suppressClick = true;
            if (state.mode === 'card' && state.cardEl) {
                state.cardEl.classList.add('is-dragging');
                viewport.classList.add('is-dragging-card');
            }
        }

        if (!state.moved) return;

        if (state.mode === 'pan') {
            camera.x = state.panOrigin.x + dx;
            camera.y = state.panOrigin.y + dy;
            applyCamera();
            return;
        }

        if (state.mode === 'card' && state.cardEl) {
            const nx = state.cardOrigin.x + dx / camera.scale;
            const ny = state.cardOrigin.y + dy / camera.scale;
            state.cardEl._pos.x = nx;
            state.cardEl._pos.y = ny;
            state.cardEl.style.left = `${nx}px`;
            state.cardEl.style.top = `${ny}px`;
        }
    }

    function onPointerUp(e) {
        if (state.pointerId !== e.pointerId) return;
        const wasCard = state.mode === 'card';
        const cardIndex = state.cardIndex;
        const didMove = state.moved;

        if (state.cardEl) state.cardEl.classList.remove('is-dragging');
        viewport.classList.remove('is-panning', 'is-dragging-card');

        try {
            if (state.pointerId != null) viewport.releasePointerCapture(state.pointerId);
        } catch (_) { /* ignore */ }

        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        document.removeEventListener('pointercancel', onPointerUp);

        state.mode = null;
        state.pointerId = null;
        state.cardEl = null;
        state.cardIndex = -1;
        state.moved = false;

        // Only open on a clean click (no drag)
        if (wasCard && !didMove && cardIndex >= 0) {
            openProject(cardIndex);
        }
    }

    function startPointer(e, mode, card, cardIndex) {
        e.preventDefault();
        e.stopPropagation();

        state.mode = mode;
        state.pointerId = e.pointerId;
        state.startClient = { x: e.clientX, y: e.clientY };
        state.moved = false;
        state.suppressClick = false;

        if (mode === 'pan') {
            state.panOrigin = { x: camera.x, y: camera.y };
            viewport.classList.add('is-panning');
        } else if (mode === 'card' && card) {
            state.cardEl = card;
            state.cardIndex = cardIndex;
            state.cardOrigin = { x: card._pos.x, y: card._pos.y };
            setFocus(cardIndex);
        }

        try {
            viewport.setPointerCapture(e.pointerId);
        } catch (_) { /* ignore */ }

        document.addEventListener('pointermove', onPointerMove, { passive: false });
        document.addEventListener('pointerup', onPointerUp);
        document.addEventListener('pointercancel', onPointerUp);
    }

    // Block synthetic click after a drag (button/div safety)
    viewport.addEventListener('click', (e) => {
        if (!state.suppressClick) return;
        e.preventDefault();
        e.stopPropagation();
        state.suppressClick = false;
    }, true);

    viewport.addEventListener('pointerdown', (e) => {
        if (e.button === 1 || (e.button === 0 && state.spaceDown)) {
            startPointer(e, 'pan');
            return;
        }
        if (e.button !== 0 || state.spaceDown) return;

        const card = e.target.closest('.vf-subject');
        if (!card || !field.contains(card)) return;

        startPointer(e, 'card', card, Number(card.dataset.index));
    });

    window.addEventListener('keydown', (e) => {
        if (e.code !== 'Space' || e.repeat) return;
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
        e.preventDefault();
        state.spaceDown = true;
        viewport.classList.add('is-space');
    });

    window.addEventListener('keyup', (e) => {
        if (e.code !== 'Space') return;
        state.spaceDown = false;
        viewport.classList.remove('is-space');
        if (state.mode === 'pan') {
            // synthesize end
            onPointerUp({ pointerId: state.pointerId });
        }
    });

    viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        const vr = viewport.getBoundingClientRect();
        const mx = e.clientX - vr.left;
        const my = e.clientY - vr.top;
        const worldX = (mx - camera.x) / camera.scale;
        const worldY = (my - camera.y) / camera.scale;

        const intensity = e.ctrlKey ? 0.012 : 0.0018;
        const factor = Math.exp(-e.deltaY * intensity);
        const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, camera.scale * factor));

        camera.scale = next;
        camera.x = mx - worldX * next;
        camera.y = my - worldY * next;
        applyCamera();
    }, { passive: false });

    subjects.forEach((el, index) => {
        el.addEventListener('pointerenter', (e) => {
            if (e.pointerType === 'touch') return;
            if (state.mode) return;
            setFocus(index);
        });

        el.addEventListener('pointerleave', (e) => {
            if (state.mode) return;
            const toCard = e.relatedTarget && e.relatedTarget.closest
                ? e.relatedTarget.closest('.vf-subject')
                : null;
            if (toCard) return;
            clearFocus();
        });
    });

    field.addEventListener('pointerleave', (e) => {
        if (state.mode) return;
        if (!field.contains(e.relatedTarget)) clearFocus();
    });

    document.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
        if (state.spaceDown || state.mode) return;

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            const next = state.index < 0 ? 0 : (state.index + 1) % subjects.length;
            setFocus(next, { fromKeyboard: true });
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            const next = state.index < 0
                ? subjects.length - 1
                : (state.index - 1 + subjects.length) % subjects.length;
            setFocus(next, { fromKeyboard: true });
        } else if (e.key === 'Enter' && state.index >= 0) {
            e.preventDefault();
            openProject(state.index);
        } else if (e.key === 'Escape') {
            clearFocus();
            centerBoard();
        } else if (e.key === '0' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            centerBoard();
        }
    });
}

function createSubjectElement(project, category, index) {
    const el = document.createElement('div');
    el.className = 'vf-subject';
    el.dataset.index = String(index);
    el.dataset.id = project.id;
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', `${project.title}, ${CATEGORY_LABELS[category] || category}`);

    const media = document.createElement('div');
    media.className = 'vf-subject-media';

    const thumb = project.thumbnail && project.thumbnail.trim();
    if (thumb) {
        const img = document.createElement('img');
        img.src = thumb;
        img.alt = '';
        img.draggable = false;
        img.loading = index < 4 ? 'eager' : 'lazy';
        img.decoding = 'async';
        img.addEventListener('error', () => {
            img.remove();
            media.classList.add('is-fallback');
            media.dataset.fallback = project.title;
        });
        media.appendChild(img);
    } else {
        media.classList.add('is-fallback');
        media.dataset.fallback = project.title;
    }

    const info = document.createElement('div');
    info.className = 'vf-card-info';
    info.innerHTML = `
        <span class="vf-subject-label">${escapeHtml(CATEGORY_LABELS[category] || category)}</span>
        <span class="vf-subject-title">${escapeHtml(project.title)}</span>
        <span class="vf-subject-desc">${escapeHtml(project.description || '')}</span>
        <div class="vf-subject-tags">${(project.tags || []).map(tag =>
            `<span class="tag">${escapeHtml(tag)}</span>`
        ).join('')}</div>
    `;

    media.appendChild(info);
    el.appendChild(media);
    return el;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function detailUrlFor(id) {
    const enc = encodeURIComponent(id);
    // Hash keeps the id when clean-URL servers drop query strings
    return `project-detail.html?id=${enc}#${enc}`;
}

/* ---------- Canvas (shared) ---------- */

function initComputationalCanvas() {
    const canvas = document.getElementById('computational-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let nodes = [];
    const isHome = document.body.classList.contains('viewfinder-home');

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 150);
    });
    resize();

    class Node {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * (isHome ? 0.15 : 0.3);
            this.vy = (Math.random() - 0.5) * (isHome ? 0.15 : 0.3);
            this.radius = 1.5;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(156, 163, 175, 0.7)';
            ctx.fill();
        }
    }

    const nodeDensity = isHome ? 18000 : 12000;
    const maxNodes = isHome ? 60 : 120;
    const numNodes = Math.min(Math.floor((window.innerWidth * window.innerHeight) / nodeDensity), maxNodes);

    for (let i = 0; i < numNodes; i++) {
        nodes.push(new Node());
    }

    let mouse = { x: null, y: null };
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    let animating = true;
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && !animating) {
            animating = true;
            requestAnimationFrame(animate);
        } else if (document.hidden) {
            animating = false;
        }
    });

    function animate() {
        if (!animating) return;
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < nodes.length; i++) {
            nodes[i].update();
            nodes[i].draw();

            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const distSq = dx * dx + dy * dy;

                if (distSq < 14400) {
                    const distance = Math.sqrt(distSq);
                    ctx.beginPath();
                    const opacity = (1 - distance / 120) * (isHome ? 0.12 : 0.2);
                    ctx.strokeStyle = `rgba(55, 65, 81, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }

            if (mouse.x && mouse.y && !isHome) {
                const dx = nodes[i].x - mouse.x;
                const dy = nodes[i].y - mouse.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < 14400) {
                    const distance = Math.sqrt(distSq);
                    ctx.beginPath();
                    const mouseOpacity = 1 - distance / 120;
                    ctx.strokeStyle = `rgba(37, 99, 235, ${mouseOpacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                    nodes[i].x -= dx * 0.005;
                    nodes[i].y -= dy * 0.005;
                }
            }
        }

        requestAnimationFrame(animate);
    }

    animate();
}

/* ---------- Legacy card grid (kept for any page still using grids) ---------- */

function renderProjects() {
    function createCard(project, category) {
        const isOtherWorks = category === 'otherWorks';
        const isCaseStudy = project.isCaseStudy;
        const hasThumbnail = project.thumbnail && project.thumbnail.trim() !== '';

        let imageContent = '';
        if (hasThumbnail) {
            imageContent = `<div class="card-image">
                <img src="${project.thumbnail}" alt="${project.title}" loading="lazy">
            </div>`;
        } else {
            imageContent = `<div class="card-image placeholder-img" data-text="${project.title}"></div>`;
        }

        const tagsHTML = (project.tags || []).map(tag => `<span class="tag">${tag}</span>`).join(' ');
        const detailUrl = `project-detail.html?id=${encodeURIComponent(project.id)}`;

        return `
            <div class="project-card fade-in-scroll ${isOtherWorks ? 'code-card' : ''}" style="position: relative;">
                <a href="${detailUrl}" onclick="localStorage.setItem('currentProjectId', '${project.id}');" style="position: absolute; inset: 0; z-index: 1; text-decoration: none;"></a>
                <div style="position: relative; z-index: 0; pointer-events: none;">${imageContent}</div>
                <div class="card-content" style="position: relative; z-index: 0; pointer-events: none;">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div class="tags">${tagsHTML}</div>
                </div>
            </div>
        `;
    }

    const schoolWorksGrid = document.getElementById('school-works-grid');
    if (schoolWorksGrid && projectsData.schoolWorks) {
        schoolWorksGrid.innerHTML = projectsData.schoolWorks.map(p => createCard(p, 'schoolWorks')).join('');
    }
    const competitionsGrid = document.getElementById('competitions-grid');
    if (competitionsGrid && projectsData.competitions) {
        competitionsGrid.innerHTML = projectsData.competitions.map(p => createCard(p, 'competitions')).join('');
    }
    const otherWorksGrid = document.getElementById('other-works-grid');
    if (otherWorksGrid && projectsData.otherWorks) {
        otherWorksGrid.innerHTML = projectsData.otherWorks.map(p => createCard(p, 'otherWorks')).join('');
    }
    setupObserver();
}

function setupObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.fade-in-scroll').forEach(el => observer.observe(el));
}
