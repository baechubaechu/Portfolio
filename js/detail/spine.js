/**
 * Narrative Spine — detail pages.
 *
 * The project's constellation arrives centred at the top of the page
 * (continuing the departure on the home sky). As the reader scrolls, the
 * figure folds into a vertical path on the left margin that threads the
 * sections already on the page. Every node is real:
 *
 *   project + attributes   data/portfolio.js (the same graph as the home)
 *   sections               the content blocks js/detail.js rendered
 *   section ↔ attribute    `spine: [...]` on a section in js/projects.js,
 *                          restricted to attributes the project really has
 *
 * Reading order on scroll: node → connecting lines → content.
 * Hovering a section's imagery lights its local constellation.
 */

import { portfolio } from "../constellation/data/portfolio.js?v=1.9";
import { svgEl, esc, clamp, prefersReducedMotion } from "../constellation/lib/utils.js?v=2.0";

const RAIL_X = 40;          // px from the container's left edge
const WIDE = 900;           // below this the spine is hidden, chips stay
const HOVER_SEL = "img, iframe, video, .code-block-container, .tech-badge, .booklet-card, .feature-item";

const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

function boot() {
    if (window.__detailProject) init(window.__detailProject);
    else document.addEventListener("detail:rendered", (e) => init(e.detail.project), { once: true });
}

function init(project) {
    const main = document.getElementById("detail-card-container");
    if (!main || main.dataset.spine) return;
    main.dataset.spine = "on";

    const cproj = portfolio.projects.find((q) => q.detailId === project.id || q.id === project.id) ?? null;
    const attrOf = new Map(portfolio.attributes.map((a) => [a.id, a]));
    const has = (id) => !!cproj?.attributes.some((a) => a.id === id);
    const weightOf = (id) => cproj?.attributes.find((a) => a.id === id)?.weight ?? 0.5;
    const reduce = prefersReducedMotion();

    /* ── sections → spine nodes ─────────────────────────────────────── */
    const header = main.querySelector(":scope > .project-header");
    const headLabel = header?.querySelector("h1") ?? header;

    const sections = [...main.querySelectorAll(":scope > .detail-section")].map((el) => {
        const idx = Number(el.dataset.sectionIndex);
        const data = project.sections?.[idx] ?? {};
        const attrs = (data.spine ?? []).filter((id) => attrOf.has(id) && has(id));
        const labelEl = el.querySelector(".arch-label, h2") ?? el;
        return { el, data, attrs, labelEl, chips: [], y: 0 };
    });

    // Local constellation chips: attribute name + relation weight (real data).
    for (const s of sections) {
        if (!s.attrs.length) continue;
        const local = document.createElement("div");
        local.className = "spine-local";
        local.setAttribute("aria-label", "Attributes this section draws on");
        for (const id of s.attrs) {
            const chip = document.createElement("span");
            chip.className = "spine-chip";
            chip.dataset.attr = id;
            chip.innerHTML =
                `<i class="spine-chip__dot" aria-hidden="true"></i>` +
                `<span class="spine-chip__name">${esc(attrOf.get(id).label)}</span>` +
                `<span class="spine-chip__bar" aria-hidden="true"><b style="--w:${weightOf(id).toFixed(2)}"></b></span>`;
            local.append(chip);
            s.chips.push({ id, el: chip, dot: chip.firstElementChild, x: 0, y: 0 });
        }
        s.labelEl.insertAdjacentElement("afterend", local);
    }

    if (reduce || window.innerWidth < WIDE) {
        main.classList.add("spine-static");
        // Still sequence the chips with the content.
        const io = new IntersectionObserver((entries) => {
            for (const e of entries) if (e.isIntersecting) e.target.classList.add("is-reached");
        }, { threshold: 0.12 });
        sections.forEach((s) => io.observe(s.el));
        return;
    }

    /* ── arrival stage (only when the project is on the home sky) ──── */
    let arrival = null;
    let continuing = false;
    if (cproj) {
        try {
            continuing = sessionStorage.getItem("c-arrive") === cproj.id;
            sessionStorage.removeItem("c-arrive");
        } catch { /* private mode */ }
        arrival = document.createElement("div");
        arrival.className = "spine-arrival" + (continuing ? " is-continuing" : "");
        arrival.setAttribute("aria-hidden", "true");
        arrival.innerHTML = `<span class="spine-arrival__hint">Scroll — the figure becomes the story</span>`;
        main.prepend(arrival);
    }

    /* ── svg overlay ────────────────────────────────────────────────── */
    const svg = svgEl("svg", { class: "spine-svg", "aria-hidden": "true" });
    const gA = svgEl("g", { class: "spine-alinks" });
    const gRail = svgEl("g", { class: "spine-rail" });
    const gBr = svgEl("g", { class: "spine-branches" });
    const gNodes = svgEl("g", { class: "spine-nodes" });
    const gStars = svgEl("g", { class: "spine-stars" });
    svg.append(gA, gRail, gBr, gNodes, gStars);
    main.append(svg);

    const railTrack = svgEl("path", { class: "spine-rail__track" });
    const railPath = svgEl("path", { class: "spine-rail__path", pathLength: 1 });
    gRail.append(railTrack, railPath);

    const headRing = svgEl("circle", { class: "spine-head__ring", r: 11 });
    gNodes.append(headRing);

    for (const s of sections) {
        s.node = svgEl("g", { class: "spine-node" });
        s.node.append(svgEl("circle", { r: 3.4 }));
        gNodes.append(s.node);

        s.branch = svgEl("g", { class: "spine-branchset" });
        s.chips.forEach((c, i) => {
            c.line = svgEl("line", { class: "spine-branch", pathLength: 1 });
            c.line.style.setProperty("--w", weightOf(c.id).toFixed(2));
            c.line.style.setProperty("--d", `${180 + i * 110}ms`);
            c.pulse = svgEl("line", { class: "spine-pulse", pathLength: 1 });
            c.pulse.style.setProperty("--d", `${i * 220}ms`);
            c.echo = svgEl("circle", { class: "spine-echo", r: 2.6 });
            c.echo.style.setProperty("--d", `${520 + i * 110}ms`);
            s.branch.append(c.line, c.pulse, c.echo);
        });
        gBr.append(s.branch);
    }

    /* ── stars: the project and its attributes ──────────────────────── */
    const stars = [];
    const alinks = [];
    if (cproj) {
        const spec = cproj.asterism;
        const ids = [cproj.id, ...cproj.attributes.map((a) => a.id)];
        ids.forEach((id, i) => {
            const isProject = id === cproj.id;
            let ax = 0, ay = 0;
            if (spec?.stars?.[id]) {
                [ax, ay] = spec.stars[id];
            } else if (!isProject) {
                const t = -Math.PI / 2 + ((i - 1) / Math.max(1, ids.length - 1)) * Math.PI * 2;
                ax = Math.cos(t); ay = Math.sin(t);
            }
            const g = svgEl("g", { class: `spine-star spine-star--${isProject ? "project" : "attribute"}` });
            g.style.setProperty("--d", `${continuing ? 0 : i * 70}ms`);
            const dot = svgEl("circle", { r: isProject ? 3.6 : 2.4 });
            const label = svgEl("text", { x: isProject ? 12 : 9, y: 0 });
            label.textContent = (isProject ? cproj.title : attrOf.get(id)?.label ?? id).toUpperCase();
            g.append(dot, label);
            gStars.append(g);

            // Every star folds into the head of the spine; attributes then
            // re-emerge beside the sections that cite them (echo circles).
            stars.push({ id, isProject, ax, ay, g, label, x: 0, y: 0 });
        });
        for (const [a, b] of spec?.links ?? []) {
            const sa = stars.find((s) => s.id === a), sb = stars.find((s) => s.id === b);
            if (!sa || !sb) continue;
            const line = svgEl("line", {});
            const w = (a === cproj.id || b === cproj.id)
                ? Math.max(weightOf(a), weightOf(b))
                : (weightOf(a) + weightOf(b)) * 0.42;
            line.style.setProperty("--w", w.toFixed(2));
            gA.append(line);
            alinks.push({ a: sa, b: sb, line });
        }
    }

    /* ── geometry ──────────────────────────────────────────────────── */
    let W = 0, H = 0, mainTop = 0, headY = 0, lastY = 0;
    let arrivalH = 0, ax0 = 0, ay0 = 0, aR = 0;

    function measure() {
        const cr = main.getBoundingClientRect();
        W = cr.width; H = main.offsetHeight;
        mainTop = cr.top + window.scrollY;
        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        svg.setAttribute("width", W);
        svg.setAttribute("height", H);
        const rel = (el) => {
            const r = el.getBoundingClientRect();
            return { x: r.left - cr.left, y: r.top - cr.top, w: r.width, h: r.height };
        };

        if (headLabel) {
            let oy = 0;
            const tf = header ? getComputedStyle(header).transform : "none";
            if (tf && tf !== "none") {
                try { oy = new DOMMatrix(tf).m42; } catch { /* ignore */ }
            }
            const r = rel(headLabel);
            headY = r.y + r.h / 2 - oy;
        } else {
            headY = 40;
        }
        for (const s of sections) {
            // Sections may still carry the reveal transform (translateY);
            // measure where they will rest, not where they are mid-flight.
            let ox = 0, oy = 0;
            const tf = getComputedStyle(s.el).transform;
            if (tf && tf !== "none") {
                try { const m = new DOMMatrix(tf); ox = m.m41; oy = m.m42; } catch { /* ignore */ }
            }
            const r = rel(s.labelEl);
            s.y = r.y + r.h / 2 - oy;
            for (const c of s.chips) {
                const d = rel(c.dot);
                c.x = d.x + d.w / 2 - ox;
                c.y = d.y + d.h / 2 - oy;
            }
        }
        lastY = sections.length ? sections[sections.length - 1].y : headY;

        if (arrival) {
            const r = rel(arrival);
            arrivalH = r.h;
            ax0 = W / 2;
            ay0 = r.y + r.h * 0.46;
            aR = Math.min(W * 0.26, r.h * 0.3);
        }

        railTrack.setAttribute("d", `M ${RAIL_X} ${headY} V ${lastY}`);
        railPath.setAttribute("d", `M ${RAIL_X} ${headY} V ${lastY}`);
        headRing.setAttribute("cx", RAIL_X);
        headRing.setAttribute("cy", headY);
        for (const s of sections) {
            s.node.setAttribute("transform", `translate(${RAIL_X} ${s.y.toFixed(1)})`);
            for (const c of s.chips) {
                for (const l of [c.line, c.pulse]) {
                    l.setAttribute("x1", RAIL_X); l.setAttribute("y1", s.y.toFixed(1));
                    l.setAttribute("x2", c.x.toFixed(1)); l.setAttribute("y2", c.y.toFixed(1));
                }
                c.echo.setAttribute("cx", c.x.toFixed(1));
                c.echo.setAttribute("cy", c.y.toFixed(1));
            }
        }
        update();
    }

    /* ── scroll-driven state ────────────────────────────────────────── */
    let active = null;

    function update() {
        const sy = window.scrollY;
        const vh = window.innerHeight;
        const t = arrival ? smooth(clamp(sy / Math.max(1, arrivalH * 0.82), 0, 1)) : 1;
        const reach = sy + vh * 0.62 - mainTop;

        // Rail: drawn down to where the reader is.
        const drawn = clamp((reach - headY) / Math.max(1, lastY - headY), 0, 1);
        railPath.style.strokeDashoffset = (1 - drawn).toFixed(4);
        gRail.style.opacity = t.toFixed(3);
        headRing.style.opacity = (0.55 * t).toFixed(3);

        for (const s of sections) {
            const reached = t > 0.6 && reach >= s.y - 8;
            s.el.classList.toggle("is-reached", reached);
            s.node.classList.toggle("is-reached", reached);
            s.branch.classList.toggle("is-reached", reached);
        }
        gNodes.style.opacity = t.toFixed(3);
        gBr.style.opacity = t.toFixed(3);

        // Stars glide from the asterism to their place on the spine.
        for (const st of stars) {
            const fromX = ax0 + st.ax * aR;
            const fromY = ay0 + st.ay * aR * 0.9;
            st.x = lerp(fromX, RAIL_X, t);
            st.y = lerp(fromY, headY, t);
            st.g.setAttribute("transform", `translate(${st.x.toFixed(1)} ${st.y.toFixed(1)})`);
            st.g.style.opacity = st.isProject ? "1" : clamp(1.15 - t * 1.3, 0, 1).toFixed(3);
            st.label.style.opacity = clamp(1 - t * 1.6, 0, 1).toFixed(3);
        }
        for (const l of alinks) {
            l.line.setAttribute("x1", l.a.x.toFixed(1)); l.line.setAttribute("y1", l.a.y.toFixed(1));
            l.line.setAttribute("x2", l.b.x.toFixed(1)); l.line.setAttribute("y2", l.b.y.toFixed(1));
        }
        gA.style.opacity = (1 - t).toFixed(3);
        if (arrival) arrival.style.setProperty("--t", t.toFixed(3));
    }

    /* ── hover: light the section's local constellation ─────────────── */
    function setActive(s) {
        if (active === s) return;
        if (active) {
            active.el.classList.remove("is-active");
            active.node.classList.remove("is-active");
            active.branch.classList.remove("is-active");
        }
        active = s;
        if (s) {
            s.el.classList.add("is-active");
            s.node.classList.add("is-active");
            s.branch.classList.add("is-active");
        }
    }
    for (const s of sections) {
        s.el.addEventListener("pointerover", (e) => {
            if (e.target.closest?.(HOVER_SEL) || e.target.closest?.(".spine-local")) setActive(s);
        });
        s.el.addEventListener("pointerleave", () => { if (active === s) setActive(null); });
        s.el.addEventListener("focusin", () => setActive(s));
        s.el.addEventListener("focusout", (e) => {
            if (!s.el.contains(e.relatedTarget)) { if (active === s) setActive(null); }
        });
    }

    /* ── wiring ─────────────────────────────────────────────────────── */
    let raf = 0;
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    if (typeof ResizeObserver !== "undefined") {
        let pending = 0;
        new ResizeObserver(() => {
            clearTimeout(pending);
            pending = setTimeout(measure, 60);
        }).observe(main);
    }
    for (const img of main.querySelectorAll("img")) {
        if (!img.complete) img.addEventListener("load", measure, { once: true });
    }
    if (document.fonts?.ready) document.fonts.ready.then(measure);

    measure();
    requestAnimationFrame(() => main.classList.add("spine-ready"));
}

boot();
