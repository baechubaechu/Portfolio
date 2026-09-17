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
 *   look        the pointer turns the head on a celestial vault
 *   gaze        looking at a project draws its asterism in place
 *               and opens the detail card — nodes never rearrange
 *   dwell       hold gaze on a project ~4s → detail page
 *               (red arc covers the ring around the star)
 */

import { buildGraph } from "../lib/graph.js";
import { createLayout } from "../lib/graphLayout.js?v=2.3";
import { buildAsterisms } from "../lib/asterism.js?v=1.8";
import { resolveConfig } from "../config.js?v=3.2";
import { toSphere, project as projectSky, resolveCamera, createSkyDust } from "../lib/sky.js?v=2.8";
import {
    createTextMeasurer, debounce, hasFinePointer, mulberry32, hashString,
    prefersReducedMotion, svgEl, waitForFonts,
} from "../lib/utils.js?v=2.0";
import { createNodeView } from "./Node.js?v=3.0";
import { createEdgeView } from "./Edge.js?v=2.4";
import { createProjectInfo } from "./ProjectInfo.js?v=3.0";
import { createCursor } from "./Cursor.js?v=2.3";
import { createIdlePulse } from "./IdlePulse.js?v=1.8";

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
    const asterisms = buildAsterisms(graph, portfolio.projects);
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
    const dustLayer = svgEl("g", { class: "c-layer c-layer--dust", "aria-hidden": "true" });
    const edgesLayer = svgEl("g", { class: "c-layer c-layer--edges" });
    const nodesLayer = svgEl("g", { class: "c-layer c-layer--nodes" });
    const world = svgEl("g", { class: "c-world" });
    world.append(dustLayer, edgesLayer, nodesLayer);
    svg.append(world);

    const dustRand = mulberry32(hashString("dust:" + graph.nodes.map((n) => n.id).join()));
    const dust = createSkyDust(cfg.motion.camera.dust, dustRand);
    const dustDots = dust.map((s) => {
        const c = svgEl("circle", { class: "c-dust", r: s.r });
        dustLayer.append(c);
        return { star: s, el: c };
    });

    const edgeViews = new Map();
    const visualEdges = [...layout.edges];
    for (const fig of asterisms.byProject.values()) visualEdges.push(...fig.edges);
    for (const e of visualEdges) {
        const view = createEdgeView(e);
        if (e.kind === "asterism") view.el.classList.add("c-edge--asterism");
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
    let panelId = null;
    let overPanel = false;
    let switching = false;
    const idlePulse = createIdlePulse({ root, graph, nodeViews, edgeViews, asterisms, kick });

    const panel = panelEl
        ? createProjectInfo(panelEl, {
            graph,
            getStage: () => size,
            getAnchor: (id) => {
                const n = graph.byId.get(id);
                if (!n) return null;
                const fig = n.type === "project" ? asterisms.get(id) : null;
                const ids = fig ? [...fig.memberIds] : [id];
                let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
                for (const nid of ids) {
                    const m = graph.byId.get(nid);
                    const r = nodeAvoidRect(m);
                    if (!r) continue;
                    x0 = Math.min(x0, r.x0);
                    y0 = Math.min(y0, r.y0);
                    x1 = Math.max(x1, r.x1);
                    y1 = Math.max(y1, r.y1);
                }
                if (!Number.isFinite(x0)) return null;
                const pad = 26;
                return {
                    x0: x0 - pad, y0: y0 - pad, x1: x1 + pad, y1: y1 + pad,
                    ox: n.rx ?? (x0 + x1) / 2,
                    oy: n.ry ?? (y0 + y1) / 2,
                    width: size.width, height: size.height,
                };
            },
            onSelect: (id) => select(id),
            onOpen: (id, e) => {
                const node = graph.byId.get(id);
                if (node?.data?.detailId) {
                    try { localStorage.setItem("currentProjectId", node.data.detailId); } catch { /* private mode */ }
                }
                // Let the <a href> navigate natively. Do not preventDefault.
            },
        })
        : null;

    const cursor = hasFinePointer() ? createCursor(stageEl) : null;
    stageEl.classList.toggle("has-custom-cursor", !!cursor);

    function nodeAvoidRect(n) {
        if (!n || n.rVisible === false) return null;
        const x = n.rx, y = n.ry;
        if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
        const s = n.rScale ?? 1;
        const disc = 14 * s;
        let x0 = x - disc, y0 = y - disc, x1 = x + disc, y1 = y + disc;
        const lw = (n.labelW || 48) * Math.min(s, 1.15);
        const lh = (n.labelH || 13) * Math.min(s, 1.15);
        const gap = ((n.r || 4) + (n.labelGap || 8)) * s;
        switch (n.side) {
            case "left":
                x0 = Math.min(x0, x - gap - lw);
                y0 = Math.min(y0, y - lh / 2);
                y1 = Math.max(y1, y + lh / 2);
                break;
            case "above":
                y0 = Math.min(y0, y - gap - lh);
                x0 = Math.min(x0, x - lw / 2);
                x1 = Math.max(x1, x + lw / 2);
                break;
            case "below":
                y1 = Math.max(y1, y + gap + lh);
                x0 = Math.min(x0, x - lw / 2);
                x1 = Math.max(x1, x + lw / 2);
                break;
            default:
                x1 = Math.max(x1, x + gap + lw);
                y0 = Math.min(y0, y - lh / 2);
                y1 = Math.max(y1, y + lh / 2);
        }
        return { x0, y0, x1, y1 };
    }

    function describe(n) {
        const sel = n.id === selectedId;
        if (n.type === "project") {
            const p = n.data;
            const base = `${p.title}, project, ${p.year ?? ""}`.trim();
            if (!sel) return `${base}. Look to see its constellation.`;
            return p.href
                ? `${base}. Hold to open the project.`
                : `${base}. Looking at this project. In progress.`;
        }
        return `${n.label}, attribute, shared by ${n.degree} project${n.degree === 1 ? "" : "s"}.${sel ? " Selected." : ""}`;
    }

    function figureOf(id) {
        const n = id ? graph.byId.get(id) : null;
        return n?.type === "project" ? asterisms.get(id) : null;
    }

    function applyState() {
        idlePulse.setBusy(!!selectedId || !!hoveredId);
        const sel = selectedId ? graph.byId.get(selectedId) : null;
        const hov = hoveredId ? graph.byId.get(hoveredId) : null;
        const selFig = figureOf(sel?.id);
        const hovFig = figureOf(hov?.id);
        const selAdj = sel ? graph.adjacency.get(sel.id) : null;
        const hovAdj = hov ? graph.adjacency.get(hov.id) : null;
        const selMembers = selFig?.memberIds ?? null;
        const hovMembers = hovFig?.memberIds ?? null;

        root.dataset.mode = sel ? sel.type : "idle";
        stageEl.classList.toggle("has-selection", !!sel);
        stageEl.classList.toggle("has-hover", !!hov && hov.id !== sel?.id);

        const lead = switching ? cfg.motion.retractDuration * 0.55 : 0;
        const stagger = reduceMotion ? 0 : cfg.motion.drawStagger;
        const labelLag = reduceMotion ? 0 : cfg.motion.labelLag;
        const edgeDelay = new Map();
        if (selFig) {
            selFig.edges.forEach((e, i) => edgeDelay.set(e.id, lead + i * stagger));
        } else if (sel) {
            graph.neighborsOf(sel.id).forEach(({ edge }, i) => edgeDelay.set(edge.id, lead + i * stagger));
        }

        for (const n of graph.nodes) {
            const v = nodeViews.get(n.id);
            const isFocus = sel?.id === n.id;
            const isLinked = selMembers ? selMembers.has(n.id) && !isFocus : !!selAdj?.has(n.id);
            const isHoverFocus = hov?.id === n.id;
            const isHoverLinked = hovMembers ? hovMembers.has(n.id) && !isHoverFocus : !!hovAdj?.has(n.id);
            v.setClass("is-focus", isFocus);
            v.setClass("is-linked", isLinked);
            v.setClass("is-hover-focus", isHoverFocus);
            v.setClass("is-hover-linked", isHoverLinked);
            let delay = 0;
            if (isLinked && sel) {
                if (selFig) {
                    let best = Infinity;
                    for (const e of selFig.edges) {
                        if (e.source === n.id || e.target === n.id) {
                            best = Math.min(best, edgeDelay.get(e.id) ?? Infinity);
                        }
                    }
                    delay = (best === Infinity ? 0 : best) + labelLag;
                } else {
                    delay = (edgeDelay.get(graph.edgeBetween(sel.id, n.id)?.id) ?? 0) + labelLag;
                }
            }
            v.setDelay(delay);
            v.setAria(describe(n), isFocus);
        }

        for (const e of visualEdges) {
            const v = edgeViews.get(e.id);
            let drawn = false;
            let preview = false;
            if (e.kind === "asterism") {
                drawn = !!selFig && e.projectId === selFig.projectId;
                preview = !drawn && !!hovFig && e.projectId === hovFig.projectId;
                if (drawn || preview) v.setOrigin(e.source);
            } else if (sel?.type === "attribute") {
                drawn = e.source === sel.id || e.target === sel.id;
                if (drawn) v.setOrigin(sel.id);
                preview = !drawn && !!hov && hov.type === "attribute" && (e.source === hov.id || e.target === hov.id);
            } else {
                preview = !!hov && hov.type === "attribute" && (e.source === hov.id || e.target === hov.id);
            }
            v.setDelay(drawn ? edgeDelay.get(e.id) ?? 0 : 0);
            v.setClass("is-drawn", drawn);
            v.setClass("is-preview", preview);
        }

        switching = false;
    }

    function showPanel(node) {
        const next = node?.id ?? null;
        if (next === panelId) return;
        panelId = next;
        if (!node) panel?.render({ mode: "idle" });
        else panel?.render({ mode: node.type, node });
    }

    function select(id) {
        const node = id ? graph.byId.get(id) : null;
        hoveredId = id;
        selectedId = node ? id : null;
        switching = false;
        showPanel(node && (node.type === "project" || node.type === "attribute") ? node : null);
        applyState();
        updateCursorForHover();
        kick();
    }

    let dwellId = null;
    let dwellStart = 0;
    let opening = false;

    function dwellLockId() {
        try { return sessionStorage.getItem("c-dwell-lock"); } catch { return null; }
    }
    function setDwellLock(id) {
        try {
            if (id) {
                sessionStorage.setItem("c-dwell-lock", id);
                sessionStorage.setItem("c-dwell-lock-at", String(Date.now()));
            } else {
                sessionStorage.removeItem("c-dwell-lock");
                sessionStorage.removeItem("c-dwell-lock-at");
            }
        } catch { /* private mode */ }
    }
    /** Same-star lock only for a brief moment after returning from a detail page. */
    function dwellLocked(id) {
        try {
            const lock = sessionStorage.getItem("c-dwell-lock");
            if (!lock || lock !== id) return false;
            const at = Number(sessionStorage.getItem("c-dwell-lock-at") || 0);
            if (!at || Date.now() - at > 700) {
                setDwellLock(null);
                return false;
            }
            return true;
        } catch { return false; }
    }

    function resetDwell() {
        if (dwellId) nodeViews.get(dwellId)?.setDwell(0);
        dwellId = null;
        dwellStart = 0;
    }

    const WARP_GATHER_MS = 1100;
    const WARP_PREP_MS = 530;
    const WARP_BLOOM_MS = 1500;
    const WARP_STREAK_MS = 3600;
    const WARP_TOTAL_MS = WARP_GATHER_MS + WARP_PREP_MS + WARP_BLOOM_MS + WARP_STREAK_MS;

    let warpEl = null;
    let warpRaf = 0;
    let navTimer = 0;
    let leaveTimer = 0;
    let warpStartTimer = 0;
    let warpPrepTimer = 0;
    let warpLineTimer = 0;

    function ensureWarpOverlay() {
        if (warpEl) return warpEl;
        warpEl = document.createElement("div");
        warpEl.className = "c-warp";
        warpEl.setAttribute("aria-hidden", "true");
        const canvas = document.createElement("canvas");
        canvas.className = "c-warp__canvas";
        const flash = document.createElement("div");
        flash.className = "c-warp__flash";
        warpEl.append(canvas, flash);
        root.append(warpEl);
        return warpEl;
    }

    function stopWarpField() {
        cancelAnimationFrame(warpRaf);
        warpRaf = 0;
    }

    let bloomDots = [];

    function clearBloomStars() {
        for (const el of bloomDots) el.remove();
        bloomDots = [];
    }

    function spawnBloomStars(fx, fy) {
        clearBloomStars();
        const count = 1380;
        const rx = size.width * 0.78;
        const ry = size.height * 0.78;
        const fade = 420;
        const window = Math.max(0, WARP_BLOOM_MS - fade);
        const frag = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const el = svgEl("circle", { class: "c-dust c-dust--bloom" });
            let x, y;
            if (Math.random() < 0.6) {
                x = fx + (Math.random() * 2 - 1) * rx;
                y = fy + (Math.random() * 2 - 1) * ry;
            } else {
                const ang = Math.random() * Math.PI * 2;
                const rad = Math.random() ** 0.45;
                x = fx + Math.cos(ang) * rad * rx;
                y = fy + Math.sin(ang) * rad * ry;
            }
            el.setAttribute("cx", x.toFixed(1));
            el.setAttribute("cy", y.toFixed(1));
            el.setAttribute("r", (Math.random() < 0.16 ? 1.15 + Math.random() * 1.2 : 0.28 + Math.random() * 0.7).toFixed(2));
            el.style.setProperty("--c-bloom-delay", `${(WARP_PREP_MS + Math.random() * window).toFixed(0)}ms`);
            frag.append(el);
            bloomDots.push(el);
        }
        dustLayer.append(frag);
    }

    function abortOpen() {
        opening = false;
        clearTimeout(navTimer);
        clearTimeout(leaveTimer);
        clearTimeout(warpStartTimer);
        clearTimeout(warpPrepTimer);
        clearTimeout(warpLineTimer);
        navTimer = 0;
        leaveTimer = 0;
        warpStartTimer = 0;
        warpPrepTimer = 0;
        warpLineTimer = 0;
        stopWarpField();
        clearBloomStars();
        root.classList.remove("is-leaving", "is-departing", "is-warping", "is-warp-prep", "is-warp-lines");
        for (const v of nodeViews.values()) v.setClass("is-warp-focus", false);
        world.style.transition = "none";
        world.style.transform = "";
        world.style.opacity = "";
        if (warpEl) warpEl.style.opacity = "0";
        requestAnimationFrame(() => { world.style.transition = ""; });
        resetDwell();
    }

    function toOverlay(x, y) {
        const m = world.getCTM();
        const rootR = root.getBoundingClientRect();
        const svgR = svg.getBoundingClientRect();
        if (!m) return { x: x - rootR.left + svgR.left, y: y - rootR.top + svgR.top };
        return {
            x: m.a * x + m.c * y + m.e + svgR.left - rootR.left,
            y: m.b * x + m.d * y + m.f + svgR.top - rootR.top,
        };
    }

    function snapshotWarpSeeds(keepIds) {
        const keep = new Set(keepIds);
        const field = [];
        const cores = [];
        for (const n of graph.nodes) {
            if (n.rVisible === false) continue;
            const pt = toOverlay(n.rx, n.ry);
            if (keep.has(n.id)) cores.push(pt);
            else field.push(pt);
        }
        for (const { el } of dustDots) {
            const ox = Number(el.getAttribute("cx"));
            const oy = Number(el.getAttribute("cy"));
            const op = Number(el.getAttribute("opacity") || 0);
            if (!Number.isFinite(ox) || !Number.isFinite(oy) || op < 0.02) continue;
            field.push(toOverlay(ox, oy));
        }
        for (const el of bloomDots) {
            const ox = Number(el.getAttribute("cx"));
            const oy = Number(el.getAttribute("cy"));
            if (!Number.isFinite(ox) || !Number.isFinite(oy)) continue;
            field.push(toOverlay(ox, oy));
        }
        return { field, cores };
    }

    /**
     * Retro jump-to-lightspeed: each live star grows a hairline, then the
     * lines lengthen. Optical printer, not a particle pack.
     */
    function runWarpField(duration, seeds = { field: [] }) {
        const canvas = warpEl.querySelector("canvas");
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { alpha: true });
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const w = Math.max(1, root.clientWidth);
        const h = Math.max(1, root.clientHeight);
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const cx = w * 0.5;
        const cy = h * 0.5;
        const reach = Math.hypot(w, h);
        const stars = (seeds.field || []).map((s) => {
            const dx = s.x - cx;
            const dy = s.y - cy;
            return {
                ang: Math.atan2(dy, dx),
                r0: Math.max(2, Math.hypot(dx, dy)),
                born: -1,
            };
        });
        // Extra hairlines arrive in a late-biased drizzle so the field packs
        // instead of appearing all at once. Additive strokes then expose to white.
        const extras = Array.from({ length: 2100 }, () => ({
            ang: Math.random() * Math.PI * 2,
            r0: 6 + Math.random() ** 0.7 * reach * 0.8,
            born: 0.03 + Math.random() ** 0.5 * 0.86,
        }));
        const all = stars.concat(extras);

        const t0 = performance.now();
        const live = () => root.classList.contains("is-warping");

        const tick = (now) => {
            if (!live()) return;
            const p = Math.min(1, (now - t0) / duration);
            const grow = p < 0.16
                ? (p / 0.16) * 0.32
                : 0.32 + ((p - 0.16) / 0.84) ** 1.12 * 0.68;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.globalCompositeOperation = "source-over";
            ctx.globalAlpha = 1;
            ctx.clearRect(0, 0, w, h);

            ctx.strokeStyle = "#f7f7f7";
            ctx.lineCap = "butt";
            ctx.lineWidth = 1.3;
            ctx.globalCompositeOperation = "lighter";

            for (const s of all) {
                if (s.born >= 0 && p < s.born) continue;
                const local = s.born < 0
                    ? grow
                    : Math.min(1, (p - s.born) / 0.22);
                const g = local * local;
                const len = 1.2 + g * reach * 0.94;
                const slide = g * reach * 0.36;
                const rStar = s.r0 + slide * (0.2 + s.r0 / reach);
                const rTip = rStar + len;
                const cos = Math.cos(s.ang);
                const sin = Math.sin(s.ang);
                const base = s.born < 0 ? 0.2 + grow * 0.22 : 0.1 + local * 0.24;
                ctx.globalAlpha = base * (0.5 + p * 0.85);
                ctx.beginPath();
                ctx.moveTo(cx + cos * rStar, cy + sin * rStar);
                ctx.lineTo(cx + cos * rTip, cy + sin * rTip);
                ctx.stroke();
            }

            // Optical-printer exposure: packed lines milk the frame, then a cut.
            const wash = p < 0.2 ? 0 : ((p - 0.2) / 0.8) ** 1.5;
            const punch = p < 0.78 ? 0 : ((p - 0.78) / 0.22) ** 1.35;
            ctx.globalCompositeOperation = "source-over";
            ctx.globalAlpha = wash * 0.32 + punch * 0.68;
            ctx.fillStyle = "#f5f5f5";
            ctx.fillRect(0, 0, w, h);
            ctx.globalAlpha = 1;
            warpRaf = requestAnimationFrame(tick);
        };
        stopWarpField();
        warpRaf = requestAnimationFrame(tick);
    }
    /**
     * Lightspeed warp. Centre the figure, let it fall back to ordinary stars,
     * then streak. Returns total ms before navigation should fire.
     */
    function warpTo(node) {
        if (reduceMotion) return 0;
        ensureWarpOverlay();
        const fig = asterisms.get(node.id);
        const ids = fig ? [...fig.memberIds] : [node.id];
        let sx = 0, sy = 0, n = 0;
        for (const id of ids) {
            const m = graph.byId.get(id);
            if (!m || m.rVisible === false) continue;
            sx += m.rx; sy += m.ry; n++;
        }
        const fx = n ? sx / n : size.width / 2;
        const fy = n ? sy / n : size.height / 2;
        const cx = size.width / 2, cy = size.height / 2;

        world.style.transformOrigin = "0 0";
        world.style.transition = `transform ${WARP_GATHER_MS}ms var(--c-ease)`;
        world.style.transform =
            `translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px) scale(1.12) ` +
            `translate(${(-fx).toFixed(1)}px, ${(-fy).toFixed(1)}px)`;
        for (const id of ids) nodeViews.get(id)?.setClass("is-warp-focus", true);
        root.classList.add("is-departing");
        root.style.setProperty("--c-warp-prep", `${WARP_PREP_MS}ms`);
        root.style.setProperty("--c-warp-bloom", `${WARP_BLOOM_MS}ms`);
        root.style.setProperty("--c-warp-streak", `${WARP_STREAK_MS}ms`);
        if (warpEl) warpEl.style.opacity = "";

        warpStartTimer = setTimeout(() => {
            root.classList.add("is-warp-prep");
            spawnBloomStars(fx, fy);
            warpPrepTimer = setTimeout(() => {
                const seeds = snapshotWarpSeeds([]);
                root.classList.add("is-warping");
                runWarpField(WARP_STREAK_MS, seeds);
                warpLineTimer = setTimeout(() => {
                    root.classList.add("is-warp-lines");
                }, 520);
            }, Math.max(0, WARP_PREP_MS + WARP_BLOOM_MS - 180));
        }, WARP_GATHER_MS);

        return WARP_TOTAL_MS;
    }

    function openProject(node, { skipWarp = false } = {}) {
        const p = node?.data;
        if (!p?.href || opening) return;
        opening = true;
        setDwellLock(node.id);
        if (p.detailId) {
            try { localStorage.setItem("currentProjectId", p.detailId); } catch { /* private mode */ }
        }
        if (skipWarp) {
            window.location.href = p.href;
            return;
        }
        // The detail page picks this up to continue the figure without a restart.
        try { sessionStorage.setItem("c-arrive", node.id); } catch { /* private mode */ }

        const wait = warpTo(node);
        if (!wait) {
            root.classList.add("is-leaving");
            window.location.href = p.href;
            return;
        }
        leaveTimer = setTimeout(() => root.classList.add("is-leaving"), Math.max(0, wait - 160));
        navTimer = setTimeout(() => { window.location.href = p.href; }, wait);
    }

    function tickDwell(now) {
        const n = selectedId ? graph.byId.get(selectedId) : null;
        const holding = !overPanel && !opening
            && n?.type === "project" && n.data?.href
            && hoveredId === selectedId
            && !dwellLocked(n.id);
        if (!holding) {
            resetDwell();
            return;
        }
        if (dwellId !== n.id) {
            resetDwell();
            dwellId = n.id;
            dwellStart = now;
        }
        const dur = cfg.motion.dwellMs ?? 3000;
        const t = Math.min(1, (now - dwellStart) / dur);
        nodeViews.get(n.id)?.setDwell(t);
        if (t >= 1) openProject(n);
    }

    function activate(id, { openIfSelected = false } = {}) {
        const node = graph.byId.get(id);
        if (!node) return;
        if (selectedId === id && openIfSelected && node.type === "project") {
            openProject(node);
            return;
        }
        select(id);
    }

    function updateCursorForHover() {
        if (!cursor) return;
        if (!hoveredId) { cursor.setState("default"); return; }
        cursor.setState("node");
    }

    function setHover(id) {
        if (overPanel && !id) return;
        if (id === hoveredId) return;
        hoveredId = id;
        const n = id ? graph.byId.get(id) : null;
        if (n?.type === "project") {
            selectedId = id;
            showPanel(n);
        } else {
            selectedId = null;
            if (!overPanel) showPanel(null);
        }
        applyState();
        updateCursorForHover();
        kick();
    }

    /* ───────────── celestial look ───────────── */
    let yaw = 0, pitch = 0, yawT = 0, pitchT = 0;
    let pointerOn = false;

    function cameraCfg() {
        return resolveCamera(cfg, size);
    }

    function setLookTarget(nx, ny) {
        const cam = cameraCfg();
        if (reduceMotion) { yawT = 0; pitchT = 0; return; }
        yawT = (nx - 0.5) * 2 * cam.maxYaw;
        pitchT = (0.5 - ny) * 2 * cam.maxPitch;
    }

    function gazeFromPointer(px, py, e) {
        const onNode = e ? nodeFromEvent(e) : null;
        if (onNode) { setHover(onNode); return; }
        const cam = cameraCfg();
        let bestP = null, bestPD = cam.gazeRadius;
        for (const n of graph.projects) {
            if (n.rVisible === false) continue;
            const d = Math.hypot((n.rx ?? n.x) - px, (n.ry ?? n.y) - py);
            if (d < bestPD) { bestPD = d; bestP = n.id; }
        }
        if (bestP) { setHover(bestP); return; }
        let bestA = null, bestAD = cam.attributeRadius;
        for (const n of graph.attributes) {
            if (n.rVisible === false) continue;
            const d = Math.hypot((n.rx ?? n.x) - px, (n.ry ?? n.y) - py);
            if (d < bestAD) { bestAD = d; bestA = n.id; }
        }
        setHover(bestA);
    }

    function pointerToStage(e) {
        const r = stageEl.getBoundingClientRect();
        return {
            px: e.clientX - r.left,
            py: e.clientY - r.top,
            nx: r.width ? (e.clientX - r.left) / r.width : 0.5,
            ny: r.height ? (e.clientY - r.top) / r.height : 0.5,
        };
    }

    /* ───────────── events ───────────── */
    function nodeFromEvent(e) {
        const path = typeof e.composedPath === "function" ? e.composedPath() : [];
        for (const n of path) {
            if (n?.classList?.contains?.("c-node") && n.dataset?.id) return n.dataset.id;
        }
        return e.target.closest?.(".c-node")?.dataset.id ?? null;
    }
    const isHoverPointer = (e) => e.pointerType === "mouse" || e.pointerType === "pen" || e.pointerType === undefined;
    const stillInHero = (el) => !!(el && (el === root || root.contains(el)));

    function nearestNode(px, py, radius) {
        let best = null, bestD = radius;
        for (const n of graph.nodes) {
            if (n.rVisible === false) continue;
            const d = Math.hypot((n.rx ?? n.x) - px, (n.ry ?? n.y) - py);
            if (d < bestD) { bestD = d; best = n.id; }
        }
        return best;
    }

    function pickNode(e) {
        const fromDom = nodeFromEvent(e);
        if (fromDom) return fromDom;
        const { px, py } = pointerToStage(e);
        return nearestNode(px, py, cameraCfg().clickRadius ?? 28);
    }

    function releaseLook() {
        overPanel = false;
        pointerOn = false;
        yawT = 0;
        pitchT = 0;
        setHover(null);
        kick();
    }

    stageEl.addEventListener("pointermove", (e) => {
        if (!isHoverPointer(e) || opening) return;
        pointerOn = true;
        const { px, py, nx, ny } = pointerToStage(e);
        setLookTarget(nx, ny);
        gazeFromPointer(px, py, e);
        kick();
    }, { passive: true });

    // Keep the current look while the pointer is on the info panel
    // (the panel is a sibling of the stage, so leaving the stage used to
    // snap the vault back to center).
    stageEl.addEventListener("pointerleave", (e) => {
        if (stillInHero(e.relatedTarget)) return;
        requestAnimationFrame(() => {
            if (root.matches(":hover")) return;
            releaseLook();
        });
    });
    root.addEventListener("pointerleave", () => releaseLook());
    panelEl?.addEventListener("pointerenter", () => {
        overPanel = true;
        pointerOn = true;
        kick();
    });
    panelEl?.addEventListener("pointerleave", (e) => {
        overPanel = false;
        if (stillInHero(e.relatedTarget)) return;
        releaseLook();
    });

    // Touch / click still focuses a node. Project names skip the warp
    // (temporary, for iterating the detail arrival).
    stageEl.addEventListener("pointerdown", (e) => {
        if (e.button != null && e.button !== 0) return;
        const id = pickNode(e);
        if (!id) return;
        e.preventDefault();
        const node = graph.byId.get(id);
        if (e.target.closest?.(".c-node__label") && node?.type === "project" && node.data?.href) {
            openProject(node, { skipWarp: true });
            return;
        }
        setHover(id);
    });
    stageEl.addEventListener("click", (e) => {
        if (pickNode(e)) return;
        if (!hoveredId && selectedId) select(null);
    });
    svg.addEventListener("keydown", (e) => {
        const id = nodeFromEvent(e);
        if (!id) return;
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            activate(id, { openIfSelected: true });
        }
    });
    svg.addEventListener("focusin", (e) => { const id = nodeFromEvent(e); if (id) setHover(id); });
    const onDocKey = (e) => { if (e.key === "Escape") select(null); };
    document.addEventListener("keydown", onDocKey);

    /* ───────────── render loop ───────────── */
    let raf = 0;

    function frame(now) {
        raf = 0;
        // Departing: freeze the sky so the CSS glide is the only motion.
        if (opening) return;
        const active = layout.isActive();
        if (active) layout.tick();

        const amp = driftOn ? cfg.motion.drift.amplitude : 0;
        const cam = cameraCfg();
        const ease = reduceMotion ? 1 : (cam.ease ?? 0.1);
        yaw += (yawT - yaw) * ease;
        pitch += (pitchT - pitch) * ease;

        for (const n of graph.nodes) {
            let x = n.x, y = n.y;
            if (amp) {
                const d = drift.get(n.id);
                x += Math.sin((now / d.px) * Math.PI * 2 + d.fx) * amp;
                y += Math.cos((now / d.py) * Math.PI * 2 + d.fy) * amp;
            }
            const sph = toSphere({ ...n, x, y }, size, cam);
            const p = projectSky(sph.wx, sph.wy, sph.wz, yaw, pitch, cam, size);
            n.rx = p.x; n.ry = p.y; n.rVisible = p.visible;
            n.rScale = p.scale; n.rFade = p.fade; n.rDepth = p.depth;
            nodeViews.get(n.id).update(p.x, p.y, p.visible ? p.scale : 0.001, p.visible ? p.fade : 0);
        }

        const byDepth = [...graph.nodes].sort((a, b) => b.rDepth - a.rDepth);
        for (const n of byDepth) nodesLayer.append(nodeViews.get(n.id).el);

        for (const e of visualEdges) edgeViews.get(e.id).update(e.sourceNode, e.targetNode);

        for (const { star, el } of dustDots) {
            const p = projectSky(star.wx, star.wy, star.wz, yaw, pitch, cam, size);
            if (!p.visible) {
                el.setAttribute("opacity", "0");
                continue;
            }
            el.setAttribute("cx", p.x.toFixed(1));
            el.setAttribute("cy", p.y.toFixed(1));
            el.setAttribute("r", (star.r * p.scale).toFixed(2));
            const tw = 0.78 + 0.22 * Math.sin(now * 0.0012 * star.tws + star.tw);
            el.setAttribute("opacity", (star.o * p.fade * tw).toFixed(3));
        }

        if (panelId) panel?.place(graph.byId.get(panelId));

        tickDwell(now);

        const looking = Math.abs(yawT - yaw) > 0.0004 || Math.abs(pitchT - pitch) > 0.0004;
        if (active || driftOn || looking || pointerOn || dwellId) raf = requestAnimationFrame(frame);
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
        setTimeout(() => {
            root.classList.add("is-settled");
            idlePulse.start();
        }, revealMs);
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

    const onPageShow = (e) => {
        abortOpen();
        if (warpEl) warpEl.style.opacity = "";
        // Fresh load / refresh: do not keep a leftover lock from an earlier visit.
        // Back/forward cache: retimestamp so the star under the cursor does not
        // instantly complete a restored dwell, then expire after 700ms.
        if (e?.persisted) {
            const id = dwellLockId();
            if (id) setDwellLock(id);
        } else {
            setDwellLock(null);
        }
        try { sessionStorage.removeItem("c-skip-dwell"); } catch { /* private mode */ }
        kick();
    };
    const onPageHide = () => {
        abortOpen();
    };
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("pagehide", onPageHide);

    return {
        graph, layout, select, get selectedId() { return selectedId; },
        destroy() {
            idlePulse.destroy();
            stopWarpField();
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", onResize);
            window.removeEventListener("pageshow", onPageShow);
            window.removeEventListener("pagehide", onPageHide);
            document.removeEventListener("keydown", onDocKey);
            ro?.disconnect();
            cursor?.destroy();
        },
    };
}
