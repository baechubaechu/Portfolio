/**
 * Info panel: a small floating card for the current selection.
 *
 *   idle       → hidden
 *   project    → title, year, attributes, "View project →"
 *   attribute  → name, list of projects that share it
 *
 * Positioned next to the selected node; flips side if it would overflow.
 */

import { esc } from "../lib/utils.js";

export function createProjectInfo(container, { graph, onSelect, onOpen, getAnchor }) {
    container.classList.add("c-panel");
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-hidden", "true");

    const inner = document.createElement("div");
    inner.className = "c-panel__inner";
    container.append(inner);

    container.addEventListener("click", (e) => {
        e.stopPropagation();
        const btn = e.target.closest("[data-select]");
        if (btn) {
            e.preventDefault();
            onSelect?.(btn.dataset.select);
            return;
        }
        const open = e.target.closest("[data-open]");
        if (open) {
            onOpen?.(open.dataset.open, e);
        }
    });

    const weightRow = (id, name, meta, weight) => `
        <li class="c-panel__row">
            <button type="button" class="c-panel__rowbtn" data-select="${esc(id)}">
                <span class="c-panel__name">${esc(name)}</span>
                ${meta ? `<span class="c-panel__meta">${esc(meta)}</span>` : ""}
                <span class="c-panel__bar" aria-hidden="true"><i style="--w:${weight.toFixed(2)}"></i></span>
                <span class="c-panel__num">${weight.toFixed(1)}</span>
            </button>
        </li>`;

    function renderProject(node) {
        const p = node.data;
        const rels = graph.neighborsOf(node.id);
        const href = p.href ?? null;
        const kicker = ["Project", p.year, p.category].filter(Boolean).join(" · ");
        return `
            <p class="c-panel__kicker">${esc(kicker)}</p>
            <h2 class="c-panel__title">${href
                ? `<a href="${esc(href)}" data-open="${esc(node.id)}">${esc(p.title)}</a>`
                : esc(p.title)}</h2>
            <ul class="c-panel__list" aria-label="Attributes">
                ${rels.map(({ node: a, edge }) => weightRow(a.id, a.label, null, edge.weight)).join("")}
            </ul>
            ${href
                ? `<a class="c-panel__cta" href="${esc(href)}" data-open="${esc(node.id)}">View project <span aria-hidden="true">→</span></a>`
                : `<span class="c-panel__cta c-panel__cta--muted">In progress</span>`}`;
    }

    function renderAttribute(node) {
        const rels = graph.neighborsOf(node.id);
        const n = rels.length;
        return `
            <p class="c-panel__kicker">Attribute · shared by ${n} project${n === 1 ? "" : "s"}</p>
            <h2 class="c-panel__title">${esc(node.label)}</h2>
            <ul class="c-panel__list" aria-label="Projects">
                ${rels.map(({ node: p, edge }) => weightRow(p.id, p.data.title, p.data.year, edge.weight)).join("")}
            </ul>`;
    }

    function place(node) {
        if (!node || !container.classList.contains("is-open")) return;
        const box = getAnchor?.(node.id);
        if (!box) return;

        const pad = 16;
        const gap = 14;
        const w = container.offsetWidth;
        const h = container.offsetHeight;
        if (!w || !h) return;

        const { x0, y0, x1, y1, width: sw, height: sh } = box;
        const cx = (x0 + x1) / 2;
        const cy = (y0 + y1) / 2;

        const candidates = [
            { x: x1 + gap, y: cy - h * 0.28 },
            { x: x0 - gap - w, y: cy - h * 0.28 },
            { x: cx - w * 0.45, y: y1 + gap },
            { x: cx - w * 0.45, y: y0 - gap - h },
        ];

        let best = candidates[0], bestScore = Infinity;
        for (const c of candidates) {
            const overflow =
                Math.max(0, pad - c.x) +
                Math.max(0, c.x + w - (sw - pad)) +
                Math.max(0, pad - c.y) +
                Math.max(0, c.y + h - (sh - pad));
            if (overflow < bestScore) {
                bestScore = overflow;
                best = c;
            }
        }

        const px = Math.min(Math.max(best.x, pad), Math.max(pad, sw - pad - w));
        const py = Math.min(Math.max(best.y, pad), Math.max(pad, sh - pad - h));
        container.style.left = `${px.toFixed(1)}px`;
        container.style.top = `${py.toFixed(1)}px`;
    }

    let token = 0;

    return {
        el: container,
        place,
        /** @param {{mode:'idle'|'project'|'attribute', node?:object}} state */
        render(state) {
            const open = state.mode === "project" || state.mode === "attribute";
            if (!open) {
                token += 1;
                inner.classList.remove("is-visible");
                container.classList.remove("is-open");
                container.setAttribute("aria-hidden", "true");
                container.dataset.mode = "idle";
                return;
            }

            const html = state.mode === "project" ? renderProject(state.node)
                : renderAttribute(state.node);
            const my = ++token;
            const wasOpen = container.classList.contains("is-open");
            inner.classList.remove("is-visible");
            container.classList.add("is-open");
            container.setAttribute("aria-hidden", "false");
            setTimeout(() => {
                if (my !== token) return;
                inner.innerHTML = html;
                container.dataset.mode = state.mode;
                void inner.offsetWidth;
                place(state.node);
                inner.classList.add("is-visible");
            }, wasOpen ? 90 : 0);
        },
    };
}
