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

    const hitbox = svgEl("rect", { class: "c-node__hitbox" });
    const hit = svgEl("circle", { class: "c-node__hit", r: isProject ? 22 : 16 });

    const ring = isProject
        ? svgEl("circle", { class: "c-node__ring", r: cfg.visual.ringR, pathLength: 1 })
        : svgEl("circle", { class: "c-node__ring", r: cfg.visual.ringR - 2, pathLength: 1 });

    const dot = svgEl("circle", { class: "c-node__dot", r: v.r });

    const label = svgEl("text", { class: "c-node__label" });
    label.textContent = node.labelText;

    el.append(hitbox, hit, ring, dot, label);

    let side = null;

    function layoutHitbox() {
        const lw = node.labelW || 48;
        const lh = v.labelH;
        const gap = node.r + v.labelGap;
        const disc = isProject ? 18 : 14;
        let lx = gap, ly = -lh / 2;
        switch (side) {
            case "left": lx = -gap - lw; ly = -lh / 2; break;
            case "above": lx = -lw / 2; ly = -(gap + lh); break;
            case "below": lx = -lw / 2; ly = gap; break;
            default: lx = gap; ly = -lh / 2;
        }
        const padX = 8, padY = 10;
        const x0 = Math.min(-disc, lx) - padX;
        const y0 = Math.min(-disc, ly) - padY;
        const x1 = Math.max(disc, lx + lw) + padX;
        const y1 = Math.max(disc, ly + lh) + padY;
        hitbox.setAttribute("x", x0.toFixed(1));
        hitbox.setAttribute("y", y0.toFixed(1));
        hitbox.setAttribute("width", (x1 - x0).toFixed(1));
        hitbox.setAttribute("height", (y1 - y0).toFixed(1));
    }

    function applySide(next) {
        const g = node.r + v.labelGap;
        const h = v.labelH;
        let x = 0, y = 0, anchor = "start";
        switch (next) {
            case "left": x = -g; anchor = "end"; break;
            case "above": y = -(g + h / 2); anchor = "middle"; break;
            case "below": y = g + h / 2; anchor = "middle"; break;
            default: x = g; anchor = "start";
        }
        if (next !== side) {
            side = next;
            label.setAttribute("x", x.toFixed(1));
            label.setAttribute("y", y.toFixed(1));
            label.setAttribute("text-anchor", anchor);
            el.dataset.side = side;
        }
        layoutHitbox();
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
        /** Move the whole group. `scale` is perspective; `fade` is limb falloff. */
        update(x, y, scale = 1, fade = 1) {
            el.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${scale.toFixed(3)})`);
            el.style.setProperty("--c-depth", fade.toFixed(3));
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
