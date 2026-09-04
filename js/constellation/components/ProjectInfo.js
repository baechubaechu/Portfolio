/**
 * Info panel: describes the current selection in plain typography.
 *
 *   idle       → short statement + how to read the map
 *   project    → title, year, weighted attribute list, "View project →"
 *   attribute  → name, list of projects that share it
 *
 * Rows are buttons that re-target the selection, so the panel is a
 * second way of walking the graph (and the only one for keyboard /
 * screen-reader users who prefer a list).
 */

import { esc } from "../lib/utils.js";

export function createProjectInfo(container, { graph, onSelect, onOpen }) {
    container.classList.add("c-panel");
    container.setAttribute("aria-live", "polite");

    const inner = document.createElement("div");
    inner.className = "c-panel__inner";
    container.append(inner);

    container.addEventListener("click", (e) => {
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

    const counts = () => {
        const p = graph.projects.length, a = graph.attributes.length;
        return `${p} project${p === 1 ? "" : "s"} · ${a} attribute${a === 1 ? "" : "s"}`;
    };

    const weightRow = (id, name, meta, weight) => `
        <li class="c-panel__row">
            <button type="button" class="c-panel__rowbtn" data-select="${esc(id)}">
                <span class="c-panel__name">${esc(name)}</span>
                ${meta ? `<span class="c-panel__meta">${esc(meta)}</span>` : ""}
                <span class="c-panel__bar" aria-hidden="true"><i style="--w:${weight.toFixed(2)}"></i></span>
                <span class="c-panel__num">${weight.toFixed(1)}</span>
            </button>
        </li>`;

    function renderIdle() {
        return `
            <p class="c-panel__kicker">Relational index — ${esc(counts())}</p>
            <p class="c-panel__lead">The system exists before it is visible.</p>
            <p class="c-panel__hint">Select a project to reveal its constellation.<br>Select an attribute to see what the projects share.</p>`;
    }

    function renderProject(node) {
        const p = node.data;
        const rels = graph.neighborsOf(node.id);
        const href = p.href ?? null;
        const kicker = ["Project", p.year, p.category].filter(Boolean).join(" · ");
        return `
            <p class="c-panel__kicker">${esc(kicker)}</p>
            <h2 class="c-panel__title">${esc(p.title)}</h2>
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

    let token = 0;

    return {
        el: container,
        /** @param {{mode:'idle'|'project'|'attribute', node?:object}} state */
        render(state) {
            const html = state.mode === "project" ? renderProject(state.node)
                : state.mode === "attribute" ? renderAttribute(state.node)
                    : renderIdle();
            const my = ++token;
            inner.classList.remove("is-visible");
            // swap content after a short fade so the panel never flashes
            setTimeout(() => {
                if (my !== token) return;
                inner.innerHTML = html;
                container.dataset.mode = state.mode;
                void inner.offsetWidth; // flush styles so the fade-in transitions
                inner.classList.add("is-visible");
            }, 140);
        },
    };
}
