/**
 * Constellation — orchestrates data → graph → layout → views → interaction.
 *
 *   Data (data/portfolio.js)
 *     → Relationship (lib/graph.js)
 *       → Algorithm / Spatial configuration (lib/graphLayout.js)
 *         → Interaction (this file)
 *           → Observation (the user)
 *
 * Interaction model
 *   idle        nodes only; project labels readable, attribute labels faint
 *   hover       connected nodes lift, everything else dims, dotted preview
 *   select      solid hairlines are drawn from the focal node outward,
 *               one by one (strongest relation first); labels follow
 *   re-select   previous constellation retracts, the next one draws
 *   open        second activation of the selected project → detail page
 */

import { buildGraph } from "../lib/graph.js";
import { createLayout } from "../lib/graphLayout.js";
import { resolveConfig } from "../config.js";
import {
    createTextMeasurer, debounce, hasFinePointer, mulberry32, hashString,
    prefersReducedMotion, svgEl, waitForFonts,
} from "../lib/utils.js";
import { createNodeView } from "./Node.js";
import { createEdgeView } from "./Edge.js";
import { createProjectInfo } from "./ProjectInfo.js";
import { createCursor } from "./Cursor.js";

export async function mountConstellation(root, portfolio) {
    const stageEl = root.querySelector("[data-c-stage]");
    const svg = root.querySelector("[data-c-svg]");
    const panelEl = root.querySelector("[data-c-panel]");
    const figEl = root.querySelector("[data-c-fig]");
    if (!stageEl || !svg) throw new Error("[constellation] missing stage / svg elements");

    const reduceMotion = prefersReducedMotion();
    root.classList.toggle("is-reduced-motion", reduceMotion);

    /* ───────────── graph ───────────── */
    const graph = buildGraph(portfolio);
    for (const n of graph.nodes) n.labelText = n.label.toUpperCase();

    if (figEl) {
        figEl.textContent = `Fig. 01 — Relational map · ${graph.nodes.length} nodes · ${graph.edges.length} links`;
    }

    /* ───────────── config & metrics ───────────── */
    let cfg = resolveConfig(stageEl.clientWidth || window.innerWidth);
    const measure = createTextMeasurer();

    await waitForFonts([cfg.visual.project.labelFont, cfg.visual.attribute.labelFont]);

    function applyMetrics() {
        for (const n of graph.nodes) {
            const v = n.type === "project" ? cfg.visual.project : cfg.visual.attribute;
            n.r = v.r;
            n.labelGap = v.labelGap;
            n.labelH = v.labelH;
            n.labelW = measure(n.labelText, v.labelFont, v.letterSpacing);
        }
        root.style.setProperty("--c-draw-duration", `${cfg.motion.drawDuration}ms`);
        root.style.setProperty("--c-retract-duration", `${cfg.motion.retractDuration}ms`);
    }
    applyMetrics();

    /* ───────────── layout ───────────── */
    const layout = createLayout(graph, cfg);

    function stageSize() {
        const r = stageEl.getBoundingClientRect();
        return { width: Math.max(1, Math.round(r.width)), height: Math.max(1, Math.round(r.height)) };
    }

    function collectObstacles() {
        const s = stageEl.getBoundingClientRect();
        return [...root.querySelectorAll("[data-c-obstacle]")].map((el) => {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return null;
            return { x0: r.left - s.left, y0: r.top - s.top, x1: r.right - s.left, y1: r.bottom - s.top };
        });
    }

    let size = stageSize();
    svg.setAttribute("viewBox", `0 0 ${size.width} ${size.height}`);
    layout.setStage(size.width, size.height);
    layout.setObstacles(collectObstacles());
    layout.settle();

    /* ───────────── views ───────────── */
    const edgesLayer = svgEl("g", { class: "c-layer c-layer--edges" });
    const nodesLayer = svgEl("g", { class: "c-layer c-layer--nodes" });
    svg.append(edgesLayer, nodesLayer);

    const edgeViews = new Map();
    for (const e of layout.edges) {
        const view = createEdgeView(e);
        edgeViews.set(e.id, view);
        edgesLayer.append(view.el);
    }

    const nodeViews = new Map();
    // attributes first so projects render on top
    const ordered = [...graph.attributes, ...graph.projects];
    ordered.forEach((n, i) => {
        const view = createNodeView(n, cfg);
        view.el.style.setProperty("--c-in-delay", `${reduceMotion ? 0 : i * cfg.motion.appearStagger}ms`);
        nodeViews.set(n.id, view);
        nodesLayer.append(view.el);
    });

    /* ───────────── subtle drift (render-only, never touches layout) ───────────── */
    const driftRand = mulberry32(hashString("drift:" + graph.nodes.map((n) => n.id).join()));
    const drift = new Map();
    for (const n of graph.nodes) {
        const [p0, p1] = cfg.motion.drift.period;
        drift.set(n.id, {
            px: p0 + driftRand() * (p1 - p0),
            py: p0 + driftRand() * (p1 - p0),
            fx: driftRand() * Math.PI * 2,
            fy: driftRand() * Math.PI * 2,
        });
    }
    const driftOn = !reduceMotion && cfg.motion.drift.amplitude > 0;

    /* ───────────── state ───────────── */
    let selectedId = null;
    let hoveredId = null;
    let switching = false;

    const panel = panelEl
        ? createProjectInfo(panelEl, {
            graph,
            onSelect: (id) => select(id),
            onOpen: (id, e) => { e.preventDefault(); openProject(graph.byId.get(id)); },
        })
        : null;

    const cursor = hasFinePointer() ? createCursor(stageEl) : null;
    stageEl.classList.toggle("has-custom-cursor", !!cursor);

    function describe(n) {
        const sel = n.id === selectedId;
        if (n.type === "project") {
            const p = n.data;
            const base = `${p.title}, project, ${p.year ?? ""}`.trim();
            if (!sel) return `${base}. Select to reveal its attributes.`;
            return p.href ? `${base}. Selected. Activate again to open the project.` : `${base}. Selected.`;
        }
        return `${n.label}, attribute, shared by ${n.degree} project${n.degree === 1 ? "" : "s"}.${sel ? " Selected." : ""}`;
    }

    function applyState() {
        const sel = selectedId ? graph.byId.get(selectedId) : null;
        const hov = hoveredId ? graph.byId.get(hoveredId) : null;
        const selAdj = sel ? graph.adjacency.get(sel.id) : null;
        const hovAdj = hov ? graph.adjacency.get(hov.id) : null;

        root.dataset.mode = sel ? sel.type : "idle";
        stageEl.classList.toggle("has-selection", !!sel);
        stageEl.classList.toggle("has-hover", !!hov && hov.id !== sel?.id);

        // draw order: strongest relation first
        const lead = switching ? cfg.motion.retractDuration * 0.55 : 0;
        const stagger = reduceMotion ? 0 : cfg.motion.drawStagger;
        const edgeDelay = new Map();
        if (sel) {
            graph.neighborsOf(sel.id).forEach(({ edge }, i) => edgeDelay.set(edge.id, lead + i * stagger));
        }

        for (const n of graph.nodes) {
            const v = nodeViews.get(n.id);
            const isFocus = sel?.id === n.id;
            const isLinked = !!selAdj?.has(n.id);
            const isHoverFocus = hov?.id === n.id;
            const isHoverLinked = !!hovAdj?.has(n.id);
            v.setClass("is-focus", isFocus);
            v.setClass("is-linked", isLinked);
            v.setClass("is-hover-focus", isHoverFocus);
            v.setClass("is-hover-linked", isHoverLinked);
            v.setDelay(isLinked ? (edgeDelay.get(graph.edgeBetween(sel.id, n.id).id) ?? 0) + (reduceMotion ? 0 : cfg.motion.labelLag) : 0);
            v.setAria(describe(n), isFocus);
        }

        for (const e of layout.edges) {
            const v = edgeViews.get(e.id);
            const drawn = !!sel && (e.source === sel.id || e.target === sel.id);
            const preview = !drawn && !!hov && (e.source === hov.id || e.target === hov.id);
            if (drawn) v.setOrigin(sel.id);
            v.setDelay(drawn ? edgeDelay.get(e.id) ?? 0 : 0);
            v.setClass("is-drawn", drawn);
            v.setClass("is-preview", preview);
        }

        switching = false;
    }

    function select(id) {
        if (id === selectedId) return;
        switching = !!selectedId && !!id;
        selectedId = id;
        layout.setFocus(id);
        layout.reheat(cfg.sim.focusAlpha);
        applyState();
        const node = id ? graph.byId.get(id) : null;
        panel?.render(node ? { mode: node.type, node } : { mode: "idle" });
        updateCursorForHover();
        kick();
    }

    function openProject(node) {
        const p = node?.data;
        if (!p?.href) return;
        if (p.detailId) {
            try { localStorage.setItem("currentProjectId", p.detailId); } catch { /* private mode */ }
        }
        root.classList.add("is-leaving");
        setTimeout(() => { window.location.href = p.href; }, reduceMotion ? 0 : 260);
    }

    function activate(id) {
        const node = graph.byId.get(id);
        if (!node) return;
        if (selectedId === id) {
            if (node.type === "project") openProject(node);
            else select(null);
            return;
        }
        select(id);
    }

    function updateCursorForHover() {
        if (!cursor) return;
        if (!hoveredId) { cursor.setState("default"); return; }
        const n = graph.byId.get(hoveredId);
        if (n.id === selectedId && n.type === "project" && n.data.href) cursor.setState("action", "Open →");
        else cursor.setState("node");
    }

    function setHover(id) {
        if (id === hoveredId) return;
        hoveredId = id;
        applyState();
        updateCursorForHover();
    }

    /* ───────────── events ───────────── */
    const nodeFromEvent = (e) => e.target.closest?.(".c-node")?.dataset.id ?? null;
    const isHoverPointer = (e) => e.pointerType === "mouse" || e.pointerType === "pen" || e.pointerType === undefined;

    svg.addEventListener("pointerover", (e) => {
        if (!isHoverPointer(e)) return;
        const id = nodeFromEvent(e);
        if (id) setHover(id);
    });
    svg.addEventListener("pointerout", (e) => {
        if (!isHoverPointer(e)) return;
        const id = nodeFromEvent(e);
        const to = e.relatedTarget?.closest?.(".c-node")?.dataset.id ?? null;
        if (id && to !== id) setHover(null);
    });
    svg.addEventListener("click", (e) => {
        const id = nodeFromEvent(e);
        if (id) { e.preventDefault(); activate(id); }
        else if (selectedId) select(null);
    });
    svg.addEventListener("keydown", (e) => {
        const id = nodeFromEvent(e);
        if (!id) return;
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(id); }
    });
    svg.addEventListener("focusin", (e) => { const id = nodeFromEvent(e); if (id) setHover(id); });
    svg.addEventListener("focusout", (e) => { const id = nodeFromEvent(e); if (id) setHover(null); });
    const onDocKey = (e) => { if (e.key === "Escape" && selectedId) select(null); };
    document.addEventListener("keydown", onDocKey);

    /* ───────────── render loop ───────────── */
    let raf = 0;

    function frame(now) {
        raf = 0;
        const active = layout.isActive();
        if (active) layout.tick();

        const amp = driftOn ? cfg.motion.drift.amplitude : 0;
        for (const n of graph.nodes) {
            if (amp) {
                const d = drift.get(n.id);
                n.rx = n.x + Math.sin((now / d.px) * Math.PI * 2 + d.fx) * amp;
                n.ry = n.y + Math.cos((now / d.py) * Math.PI * 2 + d.fy) * amp;
            } else {
                n.rx = n.x; n.ry = n.y;
            }
            nodeViews.get(n.id).update(n.rx, n.ry);
        }
        for (const e of layout.edges) edgeViews.get(e.id).update(e.sourceNode, e.targetNode);

        if (active || driftOn) raf = requestAnimationFrame(frame);
    }

    function kick() { if (!raf) raf = requestAnimationFrame(frame); }

    /* ───────────── resize ───────────── */
    function relayout() {
        const next = stageSize();
        const widthChanged = next.width !== size.width;
        const heightChanged = Math.abs(next.height - size.height) > 100; // ignore mobile URL-bar jitter
        if (!widthChanged && !heightChanged) return;

        size = next;
        cfg = resolveConfig(size.width);
        applyMetrics();
        layout.setConfig(cfg);
        for (const v of nodeViews.values()) v.applyConfig(cfg);

        svg.setAttribute("viewBox", `0 0 ${size.width} ${size.height}`);
        layout.setStage(size.width, size.height);
        layout.setObstacles(collectObstacles());
        layout.reheat(cfg.sim.resizeAlpha);
        layout.run(120);
        layout.placeLabels();
        layout.run(40);
        kick();
    }
    const onResize = debounce(relayout, 160);
    window.addEventListener("resize", onResize);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
    ro?.observe(stageEl);

    /* ───────────── first paint ───────────── */
    frame(performance.now());
    applyState();
    panel?.render({ mode: "idle" });
    // Reveal: force a style flush so nodes transition from opacity 0, then
    // mark ready on a timer (rAF does not fire in background tabs). If the
    // page loaded in a hidden tab, wait until it is shown so the visitor
    // actually sees the staggered appearance.
    function reveal() {
        void root.offsetWidth;
        setTimeout(() => root.classList.add("is-ready"), 30);
        const revealMs = reduceMotion ? 0 : graph.nodes.length * cfg.motion.appearStagger + 1300;
        setTimeout(() => root.classList.add("is-settled"), revealMs);
    }
    if (document.hidden) {
        document.addEventListener("visibilitychange", function onShow() {
            if (document.hidden) return;
            document.removeEventListener("visibilitychange", onShow);
            reveal();
        });
    } else {
        reveal();
    }

    return {
        graph, layout, select, get selectedId() { return selectedId; },
        destroy() {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", onResize);
            document.removeEventListener("keydown", onDocKey);
            ro?.disconnect();
            cursor?.destroy();
        },
    };
}
