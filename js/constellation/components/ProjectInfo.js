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

        const pad = 56;
        const padTop = 72;
        const gap = 20;
        const w = container.offsetWidth;
        const h = container.offsetHeight;
        if (!w || !h) return;

        const { x0, y0, x1, y1, width: sw, height: sh } = box;
        const ox = box.ox ?? (x0 + x1) / 2;
        const oy = box.oy ?? (y0 + y1) / 2;

        const clamp = (x, y) => ({
            x: Math.min(Math.max(x, pad), Math.max(pad, sw - pad - w)),
            y: Math.min(Math.max(y, padTop), Math.max(padTop, sh - pad - h)),
        });

        const slot = node.data?.panelSlot;
        if (slot === "top-left" || slot === "top-right" || slot === "bottom-left" || slot === "bottom-right") {
            const pinned = clamp(
                slot.endsWith("left") ? pad : sw - pad - w,
                slot.startsWith("top") ? padTop : sh - pad - h,
            );
            container.style.left = `${pinned.x.toFixed(1)}px`;
            container.style.top = `${pinned.y.toFixed(1)}px`;
            return;
        }

        const raw = [
            { x: x1 + gap, y: oy - h * 0.35 },
            { x: x1 + gap, y: y0 },
            { x: x1 + gap, y: y1 - h },
            { x: x0 - gap - w, y: oy - h * 0.35 },
            { x: x0 - gap - w, y: y0 },
            { x: x0 - gap - w, y: y1 - h },
            { x: ox - w * 0.5, y: y1 + gap },
            { x: ox - w * 0.5, y: y0 - gap - h },
            { x: pad, y: padTop },
            { x: sw - pad - w, y: padTop },
            { x: pad, y: sh - pad - h },
            { x: sw - pad - w, y: sh - pad - h },
            { x: pad, y: (sh - h) / 2 },
            { x: sw - pad - w, y: (sh - h) / 2 },
        ].map((c) => clamp(c.x, c.y));

        const overlapArea = (x, y) => {
            const oxv = Math.max(0, Math.min(x + w, x1) - Math.max(x, x0));
            const oyv = Math.max(0, Math.min(y + h, y1) - Math.max(y, y0));
            return oxv * oyv;
        };

        let best = raw[0], bestScore = Infinity;
        for (const c of raw) {
            const overlap = overlapArea(c.x, c.y);
            const d = Math.hypot(c.x + w * 0.5 - ox, c.y + h * 0.5 - oy);
            const score = overlap * 8 + d * 0.12;
            if (score < bestScore) {
                bestScore = score;
                best = c;
            }
        }

        container.style.left = `${best.x.toFixed(1)}px`;
        container.style.top = `${best.y.toFixed(1)}px`;
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
