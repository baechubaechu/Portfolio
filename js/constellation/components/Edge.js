/**
 * Edge view: a relation drawn as two hairlines.
 *
 *   .c-edge__preview   dotted, fades in on hover ("the relation exists")
 *   .c-edge__line      solid, drawn from the focal node outward on select
 *
 * `pathLength="1"` normalises the stroke so the draw animation is a
 * plain CSS transition of stroke-dashoffset 1 → 0, independent of
 * the real pixel length.
 */

import { svgEl } from "../lib/utils.js";

export function createEdgeView(edge) {
    const el = svgEl("g", { class: "c-edge", "data-id": edge.id });
    el.style.setProperty("--c-w", edge.weight.toFixed(2));

    const preview = svgEl("line", { class: "c-edge__preview" });
    const line = svgEl("line", { class: "c-edge__line", pathLength: 1 });
    el.append(preview, line);

    let fromId = edge.source;

    return {
        edge,
        el,
        /** Which node the solid line is drawn *from*. */
        setOrigin(id) { fromId = id; },
        /** Position both lines. Direction follows the origin. */
        update(sourceNode, targetNode) {
            const a = fromId === sourceNode.id ? sourceNode : targetNode;
            const b = a === sourceNode ? targetNode : sourceNode;
            const x1 = a.rx.toFixed(2), y1 = a.ry.toFixed(2);
            const x2 = b.rx.toFixed(2), y2 = b.ry.toFixed(2);
            for (const l of [preview, line]) {
                l.setAttribute("x1", x1); l.setAttribute("y1", y1);
                l.setAttribute("x2", x2); l.setAttribute("y2", y2);
            }
        },
        setClass(name, on) { el.classList.toggle(name, !!on); },
        setDelay(ms) { el.style.setProperty("--c-delay", `${Math.max(0, ms | 0)}ms`); },
    };
}
