/**
 * Per-project asterisms: a sparse figure among the project and its
 * attributes, closer to a real constellation than a hub-and-spoke.
 *
 * Authored in data/portfolio.js as:
 *   asterism: { stars: { [id]: [x, y] }, links: [[a, b], ...] }
 * Coordinates are relative (−1…1). The project is the anchor.
 *
 * If a project has no asterism, a count-based template is used.
 *
 * In `geometric` mode the authored links are ignored and each figure is
 * read off the settled layout instead: shared attributes sit wherever the
 * whole sky puts them, so authored shapes rarely survive on screen, while
 * links picked from real positions stay short, open and uncrossed.
 */

function weightOf(project, id) {
    if (id === project.id) return 1;
    const rel = project.attributes?.find((a) => a.id === id);
    return Number.isFinite(rel?.weight) ? rel.weight : 0.5;
}

function edgeWeight(project, a, b) {
    const wa = weightOf(project, a);
    const wb = weightOf(project, b);
    if (a === project.id || b === project.id) return Math.max(wa, wb);
    return (wa + wb) * 0.42;
}

/** Fallback figures indexed by attribute count (vertex 0 = project). */
const TEMPLATES = {
    1: {
        pts: [[0, 0], [0.15, -0.9]],
        edges: [[0, 1]],
    },
    2: {
        pts: [[0, 0.15], [-0.85, -0.55], [0.9, -0.4]],
        edges: [[0, 1], [0, 2], [1, 2]],
    },
    3: {
        pts: [[-0.75, 0.05], [0, -1], [0.8, 0], [0, 0.95]],
        edges: [[0, 1], [1, 2], [0, 3], [2, 3]],
    },
    4: {
        pts: [[0.05, -0.2], [-1, -0.45], [-0.35, 0.55], [0.55, 0.5], [1, -0.4]],
        edges: [[1, 2], [2, 0], [0, 3], [3, 4]],
    },
    5: {
        pts: [[0, -0.75], [0.7, -0.75], [0, 0.05], [0.7, 0.05], [1.15, 0.5], [1.5, 1]],
        edges: [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [4, 5]],
    },
    6: {
        pts: [[0, -0.1], [-0.85, -1], [0.85, -0.9], [-0.7, 0.1], [0.7, 0.15], [0.15, 0.7], [0.2, 1.15]],
        edges: [[1, 3], [1, 0], [2, 0], [2, 4], [3, 0], [0, 4], [0, 5], [5, 6]],
    },
};

function templateFor(n) {
    if (TEMPLATES[n]) return TEMPLATES[n];
    const pts = [[0, 0]];
    const edges = [];
    for (let i = 0; i < n; i++) {
        const t = -Math.PI / 2 + (i / n) * Math.PI * 2;
        pts.push([Math.cos(t), Math.sin(t)]);
        edges.push([0, i + 1]);
        if (i > 0) edges.push([i, i + 1]);
    }
    if (n > 2) edges.push([n, 1]);
    return { pts, edges };
}

function fromTemplate(project) {
    const attrs = [...(project.attributes ?? [])].sort((a, b) => b.weight - a.weight);
    const { pts, edges } = templateFor(attrs.length);
    const ids = [project.id, ...attrs.map((a) => a.id)];
    const stars = {};
    ids.forEach((id, i) => { stars[id] = pts[i] ?? [0, 0]; });
    const links = edges
        .filter(([a, b]) => ids[a] && ids[b])
        .map(([a, b]) => [ids[a], ids[b]]);
    return { stars, links };
}

function normalizeSpec(project, spec) {
    if (!spec?.stars || !spec?.links) return fromTemplate(project);
    return spec;
}

function orderFrom(projectId, links) {
    /** @type {Map<string, string[]>} */
    const adj = new Map();
    const add = (a, b) => {
        if (!adj.has(a)) adj.set(a, []);
        adj.get(a).push(b);
    };
    for (const [a, b] of links) { add(a, b); add(b, a); }

    const dist = new Map([[projectId, 0]]);
    const queue = [projectId];
    const tree = [];
    const seenPair = new Set();

    while (queue.length) {
        const id = queue.shift();
        for (const nb of adj.get(id) ?? []) {
            const key = id < nb ? `${id}|${nb}` : `${nb}|${id}`;
            if (!dist.has(nb)) {
                dist.set(nb, dist.get(id) + 1);
                queue.push(nb);
                tree.push([id, nb]);
                seenPair.add(key);
            }
        }
    }

    const extra = [];
    for (const [a, b] of links) {
        const key = a < b ? `${a}|${b}` : `${b}|${a}`;
        if (seenPair.has(key)) continue;
        seenPair.add(key);
        const da = dist.get(a) ?? 99, db = dist.get(b) ?? 99;
        extra.push(da <= db ? [a, b] : [b, a]);
    }

    return [...tree, ...extra];
}

/* ───────────────────────── geometric figures ───────────────────────── */

/**
 * Tuning for figures read off the settled sky. Real asterisms are short
 * hops between near stars that bend at open angles, with at most one
 * closed loop (a bowl, a kite) and no hubs.
 */
const GEO = {
    minAngle: 0.44,    // rad (~25°): two lines leaving one star stay this far apart
    maxDegree: 3,      // lines per star in the preferred pass
    clearance: 10,     // px: a line may not graze a star it does not connect
    loopFactor: 1.3,   // closing line ≤ this × median figure line
    loopMinHops: 3,    // only close loops of four or more stars
};

function cross(ax, ay, bx, by, cx, cy) {
    return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}

/** Proper crossing of segments ab and cd (a shared endpoint is not a crossing). */
function segmentsCross(a, b, c, d) {
    if (a === c || a === d || b === c || b === d) return false;
    const d1 = cross(c.x, c.y, d.x, d.y, a.x, a.y);
    const d2 = cross(c.x, c.y, d.x, d.y, b.x, b.y);
    const d3 = cross(a.x, a.y, b.x, b.y, c.x, c.y);
    const d4 = cross(a.x, a.y, b.x, b.y, d.x, d.y);
    return d1 * d2 < 0 && d3 * d4 < 0;
}

/** Distance from p to the interior of segment ab (Infinity near the ends). */
function distToSegment(p, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const l2 = dx * dx + dy * dy || 1e-9;
    const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2;
    if (t <= 0.04 || t >= 0.96) return Infinity;
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

function angleBetween(o, a, b) {
    const ax = a.x - o.x, ay = a.y - o.y, bx = b.x - o.x, by = b.y - o.y;
    const c = (ax * bx + ay * by) / ((Math.hypot(ax, ay) * Math.hypot(bx, by)) || 1e-9);
    return Math.acos(Math.max(-1, Math.min(1, c)));
}

/**
 * Pick sparse, non-crossing links among `ids` from their current layout
 * positions: a Kruskal tree that prefers short, open, uncluttered lines,
 * plus at most one short line closing a loop.
 */
function geometricLinks(ids, graph) {
    const pts = ids.map((id) => graph.byId.get(id)).filter((n) => n && Number.isFinite(n.x));
    const pairs = [];
    for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
            pairs.push({ a: pts[i], b: pts[j], len: Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y) });
        }
    }
    pairs.sort((p, q) => p.len - q.len);

    const parent = new Map(pts.map((n) => [n, n]));
    const find = (n) => { while (parent.get(n) !== n) n = parent.get(n); return n; };
    const adj = new Map(pts.map((n) => [n, []]));
    const chosen = [];

    function fits({ a, b }, strict) {
        for (const e of chosen) if (segmentsCross(a, b, e.a, e.b)) return false;
        if (!strict) return true;
        if (adj.get(a).length >= GEO.maxDegree || adj.get(b).length >= GEO.maxDegree) return false;
        for (const c of adj.get(a)) if (angleBetween(a, b, c) < GEO.minAngle) return false;
        for (const c of adj.get(b)) if (angleBetween(b, a, c) < GEO.minAngle) return false;
        for (const n of graph.nodes) {
            if (n === a || n === b) continue;
            if (distToSegment(n, a, b) < GEO.clearance + (n.r ?? 0)) return false;
        }
        return true;
    }

    function take(p) {
        chosen.push(p);
        adj.get(p.a).push(p.b);
        adj.get(p.b).push(p.a);
    }

    // Strict pass first; the loose pass only guarantees the figure is connected.
    for (const strict of [true, false]) {
        for (const p of pairs) {
            if (chosen.length === pts.length - 1) break;
            const ra = find(p.a), rb = find(p.b);
            if (ra === rb || !fits(p, strict)) continue;
            parent.set(ra, rb);
            take(p);
        }
    }

    if (pts.length >= GEO.loopMinHops + 1 && chosen.length) {
        const lens = chosen.map((p) => p.len).sort((x, y) => x - y);
        const median = lens[Math.floor(lens.length / 2)];
        const hops = (from, to) => {
            const dist = new Map([[from, 0]]);
            const queue = [from];
            while (queue.length) {
                const n = queue.shift();
                if (n === to) return dist.get(n);
                for (const m of adj.get(n)) if (!dist.has(m)) { dist.set(m, dist.get(n) + 1); queue.push(m); }
            }
            return Infinity;
        };
        const loop = pairs.find((p) =>
            p.len <= median * GEO.loopFactor
            && !adj.get(p.a).includes(p.b)
            && hops(p.a, p.b) >= GEO.loopMinHops
            && fits(p, true));
        if (loop) take(loop);
    }

    return chosen.map(({ a, b }) => [a.id, b.id]);
}

/**
 * @param {ReturnType<import('./graph.js').buildGraph>} graph
 * @param {object[]} projects  raw portfolio projects
 * @param {{ geometric?: boolean }} [options]
 *   geometric  derive links from the settled layout instead of the authored
 *              `links`; call `refresh()` whenever the layout moves
 */
export function buildAsterisms(graph, projects, { geometric = false } = {}) {
    /** @type {Map<string, object>} */
    const byProject = new Map();

    function fill(fig, p, spec) {
        const links = geometric ? geometricLinks([...fig.memberIds], graph) : spec.links;
        const walk = orderFrom(p.id, links);
        fig.edges = walk.map(([source, target]) => ({
            id: `ast:${p.id}:${source}--${target}`,
            source,
            target,
            weight: edgeWeight(p, source, target),
            kind: "asterism",
            projectId: p.id,
            sourceNode: graph.byId.get(source),
            targetNode: graph.byId.get(target),
        })).filter((e) => e.sourceNode && e.targetNode);
        fig.delayIndex = new Map(fig.edges.map((e, i) => [e.id, i]));
    }

    const specs = new Map();
    for (const p of projects) {
        const spec = normalizeSpec(p, p.asterism);
        const starIds = Object.keys(spec.stars);
        const memberIds = geometric
            ? new Set([p.id, ...(p.attributes ?? []).map((a) => a.id)])
            : new Set(starIds);

        for (const rel of p.attributes ?? []) {
            if (!geometric && !memberIds.has(rel.id)) {
                console.warn(`[constellation] "${p.id}" asterism is missing attribute "${rel.id}"`);
            }
        }

        const stars = starIds.map((id) => ({
            id,
            x: spec.stars[id][0],
            y: spec.stars[id][1],
            node: graph.byId.get(id),
        })).filter((s) => s.node);

        const fig = { projectId: p.id, stars, edges: [], memberIds, delayIndex: new Map() };
        fill(fig, p, spec);
        specs.set(p.id, { p, spec });
        byProject.set(p.id, fig);
    }

    return {
        byProject,
        get(id) { return byProject.get(id) ?? null; },
        /** Re-read links from the current layout (geometric mode only). */
        refresh() {
            if (!geometric) return;
            for (const [id, fig] of byProject) {
                const { p, spec } = specs.get(id);
                fill(fig, p, spec);
            }
        },
        /** Every asterism edge across all figures. */
        allEdges() {
            return [...byProject.values()].flatMap((fig) => fig.edges);
        },
    };
}
