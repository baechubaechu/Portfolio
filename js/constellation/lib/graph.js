/**
 * Graph model: turns the portfolio data into nodes / edges / adjacency.
 *
 * Data → Relationship. Nothing here knows about pixels or the DOM.
 */

import { clamp } from "./utils.js";

/**
 * @typedef {{ id: string, type: 'project'|'attribute', label: string, data: object, degree: number }} GraphNode
 * @typedef {{ id: string, source: string, target: string, weight: number }} GraphEdge
 */

export function buildGraph({ projects = [], attributes = [] }) {
    /** @type {Map<string, GraphNode>} */
    const byId = new Map();
    /** @type {GraphNode[]} */
    const nodes = [];
    /** @type {GraphEdge[]} */
    const edges = [];
    /** @type {Map<string, Map<string, GraphEdge>>} nodeId → (neighbourId → edge) */
    const adjacency = new Map();

    const addNode = (node) => {
        if (byId.has(node.id)) {
            console.warn(`[constellation] duplicate node id "${node.id}" — skipped`);
            return;
        }
        byId.set(node.id, node);
        nodes.push(node);
        adjacency.set(node.id, new Map());
    };

    for (const a of attributes) {
        addNode({ id: a.id, type: "attribute", label: a.label, data: a, degree: 0 });
    }
    for (const p of projects) {
        addNode({ id: p.id, type: "project", label: p.title, data: p, degree: 0 });
    }

    for (const p of projects) {
        for (const rel of p.attributes ?? []) {
            const target = byId.get(rel.id);
            if (!target || target.type !== "attribute") {
                console.warn(`[constellation] "${p.id}" references unknown attribute "${rel.id}" — skipped`);
                continue;
            }
            if (adjacency.get(p.id).has(rel.id)) continue; // duplicate relation
            const edge = {
                id: `${p.id}--${rel.id}`,
                source: p.id,
                target: rel.id,
                weight: clamp(Number.isFinite(rel.weight) ? rel.weight : 0.5, 0, 1),
            };
            edges.push(edge);
            adjacency.get(p.id).set(rel.id, edge);
            adjacency.get(rel.id).set(p.id, edge);
        }
    }

    for (const n of nodes) n.degree = adjacency.get(n.id).size;

    const orphans = nodes.filter((n) => n.degree === 0);
    if (orphans.length) {
        console.warn(`[constellation] unconnected nodes: ${orphans.map((n) => n.id).join(", ")}`);
    }

    return {
        nodes,
        edges,
        adjacency,
        byId,
        projects: nodes.filter((n) => n.type === "project"),
        attributes: nodes.filter((n) => n.type === "attribute"),
        /** Neighbours of a node, strongest relation first. */
        neighborsOf(id) {
            const m = adjacency.get(id);
            if (!m) return [];
            return [...m.entries()]
                .map(([nid, edge]) => ({ node: byId.get(nid), edge }))
                .sort((a, b) => b.edge.weight - a.edge.weight);
        },
        /** Edge between two node ids, if any. */
        edgeBetween(a, b) {
            return adjacency.get(a)?.get(b) ?? null;
        },
    };
}
