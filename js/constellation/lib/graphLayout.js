/**
 * Force-directed layout.
 *
 * Relationship → Algorithm → Spatial configuration.
 *
 * A small, dependency-free simulation with d3-force semantics
 * (alpha cooling, velocity decay, Verlet-style integration) and the
 * following forces, applied every tick in this order:
 *
 *   link       connected nodes attract; rest length & strength scale with weight
 *   charge     all nodes repel (projects push harder)
 *   spread     on non-square stages the cloud is eased along the long axis
 *   collide    node discs never overlap
 *   labels     label boxes are pushed apart (and away from other discs)
 *   obstacles  nodes stay out of UI keep-out rectangles (title, panel, legend)
 *   boundary   nodes + their labels stay inside the padded stage
 *   center     the whole cloud is gently pulled to the stage centre
 *
 * Positions are seeded deterministically from node ids, so the same
 * data yields the same map on every visit: the system exists before
 * it is visible.
 *
 * The layout mutates the node objects in place (x, y, vx, vy, side).
 * It never touches the DOM.
 */

import { clamp, hashString, mulberry32 } from "./utils.js";

/**
 * @param {import('./graph.js').buildGraph extends (...a:any)=>infer R ? R : never} graph
 * @param {object} config  resolved CONFIG (see config.js)
 */
export function createLayout(graph, config) {
    const nodes = graph.nodes;
    const edges = graph.edges.map((e) => ({
        ...e,
        sourceNode: graph.byId.get(e.source),
        targetNode: graph.byId.get(e.target),
    }));

    let cfg = config;
    let stage = { width: 1, height: 1 };
    let obstacles = [];
    let focusId = null;
    let k = 1; // stage-size scale factor (see config.forces.scale)

    let alpha = 1;
    let alphaTarget = 0;

    const seed = hashString(nodes.map((n) => n.id).join("|"));
    const rand = mulberry32(seed);

    /* ───────────────────────── geometry helpers ───────────────────────── */

    const pad = () => cfg.stage.padding;

    function updateScale() {
        const s = cfg.forces.scale;
        if (!s) { k = 1; return; }
        const [rw, rh] = s.reference;
        k = clamp((stage.width * stage.height) / (rw * rh), s.min, s.max);
    }

    /** Axis-aligned box of a node's label, in stage coordinates. */
    function labelRect(n, x = n.x, y = n.y) {
        const w = n.labelW ?? 0;
        const h = n.labelH ?? 0;
        const g = (n.labelGap ?? 0) + n.r;
        switch (n.side) {
            case "left": return { x0: x - g - w, y0: y - h / 2, x1: x - g, y1: y + h / 2 };
            case "above": return { x0: x - w / 2, y0: y - g - h, x1: x + w / 2, y1: y - g };
            case "below": return { x0: x - w / 2, y0: y + g, x1: x + w / 2, y1: y + g + h };
            default: return { x0: x + g, y0: y - h / 2, x1: x + g + w, y1: y + h / 2 };
        }
    }

    function discRect(n, x = n.x, y = n.y) {
        return { x0: x - n.r, y0: y - n.r, x1: x + n.r, y1: y + n.r };
    }

    function unionRect(a, b) {
        return { x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1) };
    }

    function inflate(r, p) {
        return { x0: r.x0 - p, y0: r.y0 - p, x1: r.x1 + p, y1: r.y1 + p };
    }

    /** Overlap vector between two rects (positive = overlapping). */
    function overlap(a, b) {
        const ox = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
        const oy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
        return ox > 0 && oy > 0 ? { ox, oy } : null;
    }

    const cx = (r) => (r.x0 + r.x1) / 2;
    const cy = (r) => (r.y0 + r.y1) / 2;

    /* ───────────────────────── seeding ───────────────────────── */

    function seedPositions() {
        const W = stage.width, H = stage.height;
        const projects = nodes.filter((n) => n.type === "project");
        const attrs = nodes.filter((n) => n.type === "attribute");
        const rot = rand() * Math.PI * 2;

        // Projects sit on an ellipse; the shared attributes fall inward
        // towards the centroid of the projects that use them.
        projects.forEach((n, i) => {
            const t = rot + (i / Math.max(1, projects.length)) * Math.PI * 2;
            n.x = W / 2 + Math.cos(t) * W * 0.3;
            n.y = H / 2 + Math.sin(t) * H * 0.3;
            n.vx = 0; n.vy = 0;
        });

        attrs.forEach((n) => {
            const ns = graph.neighborsOf(n.id);
            let x = W / 2, y = H / 2;
            if (ns.length) {
                let sx = 0, sy = 0, sw = 0;
                for (const { node, edge } of ns) { sx += node.x * edge.weight; sy += node.y * edge.weight; sw += edge.weight; }
                x = sx / sw; y = sy / sw;
            }
            n.x = x + (rand() - 0.5) * W * 0.12;
            n.y = y + (rand() - 0.5) * H * 0.16;
            n.vx = 0; n.vy = 0;
        });

        // labels lean inward until the placer runs, so long labels never
        // push their nodes against the far wall during prewarm
        for (const n of nodes) n.side = n.x < W / 2 ? "right" : "left";
    }

    /* ───────────────────────── forces ───────────────────────── */

    function forceLink(a) {
        const f = cfg.forces.link;
        const base = f.distance * Math.sqrt(k);
        for (const e of edges) {
            const s = e.sourceNode, t = e.targetNode;
            let rest = base * (1.3 - f.weightDistanceScale * e.weight);
            let strength = f.strength * (0.55 + f.weightStrengthScale * e.weight) / Math.min(s.degree, t.degree);
            if (focusId && (s.id === focusId || t.id === focusId)) {
                rest *= f.focusDistanceScale;
                strength *= f.focusStrengthScale;
            }
            let dx = t.x + t.vx - s.x - s.vx;
            let dy = t.y + t.vy - s.y - s.vy;
            let l = Math.hypot(dx, dy) || 1e-6;
            l = ((l - rest) / l) * a * strength;
            dx *= l; dy *= l;
            const bias = s.degree / (s.degree + t.degree);
            t.vx -= dx * bias; t.vy -= dy * bias;
            s.vx += dx * (1 - bias); s.vy += dy * (1 - bias);
        }
    }

    function forceCharge(a) {
        const f = cfg.forces.charge;
        const min2 = f.distanceMin * f.distanceMin;
        const max2 = f.distanceMax * f.distanceMax * k;
        const qp = f.project * k, qa = f.attribute * k;
        for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i];
            const sn = n.type === "project" ? qp : qa;
            for (let j = i + 1; j < nodes.length; j++) {
                const m = nodes[j];
                const sm = m.type === "project" ? qp : qa;
                let dx = m.x - n.x, dy = m.y - n.y;
                let d2 = dx * dx + dy * dy;
                if (d2 > max2) continue;
                if (d2 < 1e-6) { dx = (rand() - 0.5) * 1e-3; dy = (rand() - 0.5) * 1e-3; d2 = dx * dx + dy * dy; }
                if (d2 < min2) d2 = Math.sqrt(d2 * min2);
                // strength is negative → repulsion
                n.vx += dx * (sm * a) / d2; n.vy += dy * (sm * a) / d2;
                m.vx -= dx * (sn * a) / d2; m.vy -= dy * (sn * a) / d2;
            }
        }
    }

    function forceCollide() {
        const f = cfg.forces.collide;
        for (let k = 0; k < f.iterations; k++) {
            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];
                const ri = n.r + f.padding;
                const xi = n.x + n.vx, yi = n.y + n.vy;
                for (let j = i + 1; j < nodes.length; j++) {
                    const m = nodes[j];
                    const rj = m.r + f.padding;
                    const r = ri + rj;
                    let dx = xi - (m.x + m.vx), dy = yi - (m.y + m.vy);
                    let l = dx * dx + dy * dy;
                    if (l >= r * r) continue;
                    if (l < 1e-6) { dx = (rand() - 0.5) * 1e-3; dy = (rand() - 0.5) * 1e-3; l = dx * dx + dy * dy; }
                    l = Math.sqrt(l);
                    const push = ((r - l) / l) * f.strength;
                    dx *= push; dy *= push;
                    const share = (rj * rj) / (ri * ri + rj * rj);
                    n.vx += dx * share; n.vy += dy * share;
                    m.vx -= dx * (1 - share); m.vy -= dy * (1 - share);
                }
            }
        }
    }

    /** Push two nodes apart along the axis of least overlap between two rects. */
    function separate(n, m, ra, rb, strength) {
        const o = overlap(ra, rb);
        if (!o) return;
        if (o.ox < o.oy) {
            const dir = cx(rb) >= cx(ra) ? 1 : -1;
            const push = o.ox * strength * 0.5;
            n.vx -= dir * push; m.vx += dir * push;
        } else {
            const dir = cy(rb) >= cy(ra) ? 1 : -1;
            const push = o.oy * strength * 0.5;
            n.vy -= dir * push; m.vy += dir * push;
        }
    }

    function forceLabels() {
        const f = cfg.forces.labels;
        const boxes = nodes.map((n) => {
            const x = n.x + n.vx, y = n.y + n.vy;
            return { label: inflate(labelRect(n, x, y), f.padding), disc: inflate(discRect(n, x, y), f.padding) };
        });
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const n = nodes[i], m = nodes[j];
                separate(n, m, boxes[i].label, boxes[j].label, f.strength);
                separate(n, m, boxes[i].label, boxes[j].disc, f.strength);
                separate(n, m, boxes[i].disc, boxes[j].label, f.strength);
            }
        }
    }

    function forceObstacles() {
        if (!obstacles.length) return;
        const f = cfg.forces.obstacles;
        for (const n of nodes) {
            const x = n.x + n.vx, y = n.y + n.vy;
            const box = inflate(unionRect(discRect(n, x, y), labelRect(n, x, y)), f.padding);
            for (const ob of obstacles) {
                const o = overlap(box, ob);
                if (!o) continue;
                if (o.ox < o.oy) n.vx += (cx(box) >= cx(ob) ? 1 : -1) * o.ox * f.strength;
                else n.vy += (cy(box) >= cy(ob) ? 1 : -1) * o.oy * f.strength;
            }
        }
    }

    function forceBoundary() {
        const f = cfg.forces.boundary;
        const p = pad();
        const W = stage.width, H = stage.height;
        const m = f.margin ?? 0, ms = f.marginStrength ?? 0;
        for (const n of nodes) {
            const x = n.x + n.vx, y = n.y + n.vy;
            const box = unionRect(discRect(n, x, y), labelRect(n, x, y));
            // hard wall at the padding
            if (box.x0 < p.left) n.vx += (p.left - box.x0) * f.strength;
            if (box.x1 > W - p.right) n.vx -= (box.x1 - (W - p.right)) * f.strength;
            if (box.y0 < p.top) n.vy += (p.top - box.y0) * f.strength;
            if (box.y1 > H - p.bottom) n.vy -= (box.y1 - (H - p.bottom)) * f.strength;
            // soft cushion just inside the wall (quadratic ramp)
            if (m > 0) {
                const l = box.x0 - p.left, r = (W - p.right) - box.x1;
                const t = box.y0 - p.top, b = (H - p.bottom) - box.y1;
                if (l < m && l > 0) n.vx += ((m - l) / m) ** 2 * m * ms;
                if (r < m && r > 0) n.vx -= ((m - r) / m) ** 2 * m * ms;
                if (t < m && t > 0) n.vy += ((m - t) / m) ** 2 * m * ms;
                if (b < m && b > 0) n.vy -= ((m - b) / m) ** 2 * m * ms;
            }
        }
    }

    function forceSpread(a) {
        const f = cfg.forces.spread;
        if (!f) return;
        const W = stage.width, H = stage.height;
        const aspect = W / H;
        const kx = Math.max(0, aspect - 1) * f.strength * a;
        const ky = Math.max(0, 1 / aspect - 1) * f.strength * a;
        if (!kx && !ky) return;
        const c = freeCenter();
        for (const n of nodes) {
            n.vx += (n.x - c.x) * kx;
            n.vy += (n.y - c.y) * ky;
        }
    }

    /**
     * Centre of the *free* area: the padded stage minus any obstacle that
     * spans most of a side (e.g. the full-width panel on phones). Narrow
     * obstacles (desktop title / panel / legend) do not shift the centre.
     */
    function freeCenter() {
        const p = pad();
        let x0 = p.left, y0 = p.top, x1 = stage.width - p.right, y1 = stage.height - p.bottom;
        for (const ob of obstacles) {
            const wide = (ob.x1 - ob.x0) > stage.width * 0.6;
            const tall = (ob.y1 - ob.y0) > stage.height * 0.6;
            if (wide) {
                if (cy(ob) < stage.height / 2) y0 = Math.max(y0, ob.y1);
                else y1 = Math.min(y1, ob.y0);
            }
            if (tall) {
                if (cx(ob) < stage.width / 2) x0 = Math.max(x0, ob.x1);
                else x1 = Math.min(x1, ob.x0);
            }
        }
        return { x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
    }

    function forceCenter() {
        const k = cfg.forces.center.strength;
        const c = freeCenter();
        let sx = 0, sy = 0;
        for (const n of nodes) { sx += n.x; sy += n.y; }
        const dx = (sx / nodes.length - c.x) * k;
        const dy = (sy / nodes.length - c.y) * k;
        for (const n of nodes) { n.x -= dx; n.y -= dy; }
    }

    /* ───────────────────────── integration ───────────────────────── */

    function tick() {
        const { alphaDecay, velocityDecay } = cfg.sim;
        alpha += (alphaTarget - alpha) * alphaDecay;

        forceLink(alpha);
        forceCharge(alpha);
        forceSpread(alpha);
        forceCollide();
        forceLabels();
        forceObstacles();
        forceBoundary();
        forceCenter();

        const p = pad();
        const W = stage.width, H = stage.height;
        for (const n of nodes) {
            if (n.fx != null) { n.x = n.fx; n.vx = 0; } else { n.vx *= velocityDecay; n.x += n.vx; }
            if (n.fy != null) { n.y = n.fy; n.vy = 0; } else { n.vy *= velocityDecay; n.y += n.vy; }
            // hard safety clamp for the disc itself
            n.x = clamp(n.x, p.left + n.r, W - p.right - n.r);
            n.y = clamp(n.y, p.top + n.r, H - p.bottom - n.r);
        }
        return alpha;
    }

    function run(ticks) {
        for (let i = 0; i < ticks && alpha > cfg.sim.alphaMin; i++) tick();
    }

    /* ───────────────────────── label placement ───────────────────────── */

    /**
     * Choose a side for each label so that incident edges do not run
     * through the text and the label stays inside the stage.
     * Called once after the layout settles (not every tick), so labels
     * never flip while the user is looking at them.
     */
    function placeLabels() {
        const p = pad();
        const W = stage.width, H = stage.height;
        const sides = cfg.visual.labelSides;
        const sideAngle = { right: 0, below: Math.PI / 2, left: Math.PI, above: -Math.PI / 2 };
        const c = freeCenter();

        for (const n of nodes) {
            const incident = graph.neighborsOf(n.id).map(({ node }) => Math.atan2(node.y - n.y, node.x - n.x));
            let best = sides[0], bestScore = Infinity;
            sides.forEach((side, idx) => {
                n.side = side;
                const r = labelRect(n);
                let score = idx * 0.35; // preference order
                // stage overflow
                score += Math.max(0, p.left - r.x0) + Math.max(0, r.x1 - (W - p.right));
                score += Math.max(0, p.top - r.y0) + Math.max(0, r.y1 - (H - p.bottom));
                // lean inward: a label that reaches away from the centre costs a little
                score += Math.max(0, (Math.abs(cx(r) - c.x) - Math.abs(n.x - c.x)) / W) * 3;
                // incident edges crossing the label direction
                for (const a of incident) {
                    let d = Math.abs(a - sideAngle[side]);
                    d = Math.min(d, Math.PI * 2 - d);
                    if (d < Math.PI / 3) score += (Math.PI / 3 - d) * 40;
                }
                // overlap with other nodes' labels / discs at current positions
                for (const m of nodes) {
                    if (m === n) continue;
                    if (overlap(r, labelRect(m))) score += 30;
                    if (overlap(r, discRect(m))) score += 30;
                }
                for (const ob of obstacles) if (overlap(r, ob)) score += 40;
                if (score < bestScore) { bestScore = score; best = side; }
            });
            n.side = best;
        }
    }

    /* ───────────────────────── public API ───────────────────────── */

    return {
        nodes,
        edges,

        get alpha() { return alpha; },
        isActive() { return alpha > cfg.sim.alphaMin; },

        setConfig(next) { cfg = next; updateScale(); },

        /** Set stage size. Existing positions are scaled proportionally. */
        setStage(width, height) {
            const first = stage.width <= 1;
            const sx = width / stage.width, sy = height / stage.height;
            stage = { width, height };
            updateScale();
            if (first) {
                seedPositions();
            } else {
                for (const n of nodes) { n.x *= sx; n.y *= sy; n.vx = 0; n.vy = 0; }
            }
        },

        /** Keep-out rectangles {x0,y0,x1,y1} in stage coordinates. */
        setObstacles(rects) { obstacles = rects.filter(Boolean); },

        /** Node whose incident edges should contract (or null). */
        setFocus(id) { focusId = id; },

        reheat(value) { alpha = Math.max(alpha, value); },
        setAlphaTarget(v) { alphaTarget = v; },

        tick,
        run,
        placeLabels,

        /**
         * Full cold start. Labels are placed several times while the
         * simulation cools, so their footprint shapes the layout instead
         * of being fitted afterwards.
         */
        settle() {
            alpha = 1;
            const total = cfg.sim.prewarmTicks;
            run(Math.round(total * 0.3)); placeLabels();
            run(Math.round(total * 0.3)); placeLabels();
            run(total - Math.round(total * 0.6)); placeLabels();
            alpha = Math.max(alpha, 0.3);
            run(140);
            placeLabels();
            alpha = Math.max(alpha, 0.05);
            run(60);
        },
    };
}
