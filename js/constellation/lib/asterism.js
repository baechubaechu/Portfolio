/**
 * Per-project asterisms: a sparse figure among the project and its
 * attributes, closer to a real constellation than a hub-and-spoke.
 *
 * Authored in data/portfolio.js as:
 *   asterism: { stars: { [id]: [x, y] }, links: [[a, b], ...] }
 * Coordinates are relative (−1…1). The project is the anchor; on
 * select the layout eases members toward this shape.
 *
 * If a project has no asterism, a count-based template is used.
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

/**
 * @param {ReturnType<import('./graph.js').buildGraph>} graph
 * @param {object[]} projects  raw portfolio projects
 */
export function buildAsterisms(graph, projects) {
    /** @type {Map<string, object>} */
    const byProject = new Map();

    for (const p of projects) {
        const spec = normalizeSpec(p, p.asterism);
        const starIds = Object.keys(spec.stars);
        const memberIds = new Set(starIds);

        for (const rel of p.attributes ?? []) {
            if (!memberIds.has(rel.id)) {
                console.warn(`[constellation] "${p.id}" asterism is missing attribute "${rel.id}"`);
            }
        }

        const walk = orderFrom(p.id, spec.links);
        const edges = walk.map(([source, target]) => ({
            id: `ast:${p.id}:${source}--${target}`,
            source,
            target,
            weight: edgeWeight(p, source, target),
            kind: "asterism",
            projectId: p.id,
            sourceNode: graph.byId.get(source),
            targetNode: graph.byId.get(target),
        })).filter((e) => e.sourceNode && e.targetNode);

        const stars = starIds.map((id) => ({
            id,
            x: spec.stars[id][0],
            y: spec.stars[id][1],
            node: graph.byId.get(id),
        })).filter((s) => s.node);

        const delayIndex = new Map(edges.map((e, i) => [e.id, i]));

        byProject.set(p.id, { projectId: p.id, stars, edges, memberIds, delayIndex });
    }

    return {
        byProject,
        get(id) { return byProject.get(id) ?? null; },
    };
}
