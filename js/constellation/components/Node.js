/**
 * Node view: one <g> per graph node (disc + optional ring + label).
 * Pure presentation — state is applied through CSS classes.
 */

import { svgEl } from "../lib/utils.js";

export function createNodeView(node, cfg) {
    const isProject = node.type === "project";
    let v = isProject ? cfg.visual.project : cfg.visual.attribute;

    const el = svgEl("g", {
        class: `c-node c-node--${node.type}`,
        "data-id": node.id,
        tabindex: 0,
        role: "button",
        "aria-pressed": "false",
    });

    // hit area (invisible, generous)
    const hit = svgEl("circle", { class: "c-node__hit", r: 16 });

    const ring = isProject
        ? svgEl("circle", { class: "c-node__ring", r: cfg.visual.ringR, pathLength: 1 })
        : svgEl("circle", { class: "c-node__ring", r: cfg.visual.ringR - 2, pathLength: 1 });

    const dot = svgEl("circle", { class: "c-node__dot", r: v.r });

    const label = svgEl("text", { class: "c-node__label" });
    label.textContent = node.labelText;

    el.append(hit, ring, dot, label);

    let side = null;

    function applySide(next) {
        if (next === side) return;
        side = next;
        const g = node.r + v.labelGap;
        const h = v.labelH;
        let x = 0, y = 0, anchor = "start";
        switch (side) {
            case "left": x = -g; anchor = "end"; break;
            case "above": y = -(g + h / 2); anchor = "middle"; break;
            case "below": y = g + h / 2; anchor = "middle"; break;
            default: x = g; anchor = "start";
        }
        label.setAttribute("x", x.toFixed(1));
        label.setAttribute("y", y.toFixed(1));
        label.setAttribute("text-anchor", anchor);
        el.dataset.side = side;
    }

    return {
        node,
        el,
        /** Re-read geometry after the config changed (e.g. compact ↔ desktop). */
        applyConfig(next) {
            v = isProject ? next.visual.project : next.visual.attribute;
            dot.setAttribute("r", v.r);
            ring.setAttribute("r", isProject ? next.visual.ringR : next.visual.ringR - 2);
            side = null; // force label offsets to be recomputed
        },
        /** Move the whole group. */
        update(x, y) {
            el.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
            applySide(node.side);
        },
        setClass(name, on) {
            el.classList.toggle(name, !!on);
        },
        setDelay(ms) {
            el.style.setProperty("--c-delay", `${Math.max(0, ms | 0)}ms`);
        },
        setAria(label, pressed) {
            el.setAttribute("aria-label", label);
            el.setAttribute("aria-pressed", pressed ? "true" : "false");
        },
    };
}
