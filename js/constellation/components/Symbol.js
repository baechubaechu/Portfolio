/**
 * Project symbols: the figure a project draws around its own star when it
 * is looked at (data/portfolio.js → `symbol`).
 *
 * The home sky shows only the project stars. Looking at one lights its
 * keyword stars one hop at a time from the project outward, draws the lines
 * between them, then names them. Figures are anchored on the project star
 * and follow it as the vault turns; they never move the layout.
 *
 * Size follows the screen: a figure is fitted to a share of the stage
 * (config `symbol.fill`), so it reads as a constellation, not an icon.
 *
 * Placement: each figure is tried at that size and mirrored, then a little
 * smaller, and the first option that stays inside the stage (and covers the
 * fewest other projects) wins. It is chosen once per showing so the figure
 * does not flip while the sky turns.
 *
 * Art: like a planetarium chart, a figure may carry a faint line drawing
 * (`symbol.art`) laid under its stars in the same frame.
 */

import { svgEl } from "../lib/utils.js?v=2.0";

const LABEL_GAP = 7;
const STAR_R = 2.3;
const MINOR_R = 1.5;
const HIDE_MS = 520;

/** Reveal order: breadth-first from the project; loose parts follow in data order. */
function revealOrder(symbol) {
    const ids = ["@", ...symbol.stars.map((s) => s.id)];
    const adj = new Map(ids.map((id) => [id, []]));
    symbol.links.forEach(([a, b], i) => {
        adj.get(a)?.push({ to: b, i });
        adj.get(b)?.push({ to: a, i });
    });

    const starStep = new Map();
    const linkStep = new Map();
    const linkFrom = new Map();
    let step = 0;
    for (const root of ids) {
        if (starStep.has(root)) continue;
        starStep.set(root, step);
        const queue = [root];
        while (queue.length) {
            const id = queue.shift();
            for (const { to, i } of adj.get(id)) {
                if (linkStep.has(i)) continue;
                const s = starStep.get(id);
                linkStep.set(i, s);
                linkFrom.set(i, id);
                if (!starStep.has(to)) {
                    starStep.set(to, s + 1);
                    queue.push(to);
                }
            }
        }
        step = Math.max(...starStep.values()) + 1;
    }
    return { starStep, linkStep, linkFrom };
}

export function createSymbols({ layer, graph, measure, getStage, getConfig, getAvoid }) {
    /** @type {Map<string, object>} */
    const views = new Map();
    let currentId = null;
    const fading = new Map(); // id → timer

    function labelFont() {
        const c = getConfig();
        return c.symbol?.labelFont ?? '400 10px "IBM Plex Mono", Consolas, monospace';
    }

    function build(node) {
        const symbol = node.data?.symbol;
        if (!symbol?.stars?.length) return null;
        const g = svgEl("g", { class: "c-symbol", "data-project": node.id, "aria-hidden": "true" });
        const lines = svgEl("g", { class: "c-symbol__lines" });
        const stars = svgEl("g", { class: "c-symbol__stars" });
        const labels = svgEl("g", { class: "c-symbol__labels" });

        const [ox, oy] = symbol.origin ?? [0, 0];

        // Authored size of the figure (stars and the project), for fitting it to the screen.
        const xs = [ox, ...symbol.stars.map((s) => s.at[0])];
        const ys = [oy, ...symbol.stars.map((s) => s.at[1])];
        // A narrow figure (the hammer) is fitted as if it were as wide as the others, so it is not blown up.
        const size = { w: Math.max(200, Math.max(...xs) - Math.min(...xs)), h: Math.max(150, Math.max(...ys) - Math.min(...ys)) };

        let art = null;
        if (symbol.art?.src && symbol.art.box) {
            const [ax, ay, aw, ah] = symbol.art.box;
            const frame = svgEl("g", { class: "c-symbol__art" });
            const img = svgEl("image", { href: symbol.art.src, x: ax, y: ay, width: aw, height: ah, preserveAspectRatio: "none" });
            frame.append(img);
            g.append(frame);
            art = { frame, ox, oy };
        }
        g.append(lines, stars, labels);
        const { starStep, linkStep, linkFrom } = revealOrder(symbol);
        const font = labelFont();
        const ls = getConfig().symbol?.letterSpacing ?? 0.1;

        const pts = new Map([["@", { dx: 0, dy: 0, node: true }]]);
        const starViews = symbol.stars.map((s) => {
            const pt = { dx: s.at[0] - ox, dy: s.at[1] - oy };
            pts.set(s.id, pt);
            const dot = svgEl("circle", {
                class: `c-symbol__star${s.minor ? " c-symbol__star--minor" : ""}`,
                r: s.minor ? MINOR_R : STAR_R,
            });
            dot.style.setProperty("--step", String(starStep.get(s.id) ?? 0));
            stars.append(dot);
            let text = null, w = 0;
            if (s.label) {
                text = svgEl("text", { class: "c-symbol__label" });
                text.textContent = s.label;
                text.style.setProperty("--step", String(starStep.get(s.id) ?? 0));
                labels.append(text);
                w = measure(s.label.toUpperCase(), font, ls);
            }
            return { s, pt, dot, text, w };
        });

        const lineViews = symbol.links.map(([a, b], i) => {
            // Draw away from the star the reveal reaches first.
            const from = linkFrom.get(i) === b ? b : a;
            const to = from === a ? b : a;
            const el = svgEl("line", { class: "c-symbol__line", pathLength: 1 });
            el.style.setProperty("--step", String(linkStep.get(i) ?? 0));
            lines.append(el);
            return { el, a: pts.get(from), b: pts.get(to) };
        }).filter((l) => l.a && l.b);

        const steps = Math.max(0, ...starStep.values());
        g.style.setProperty("--steps", String(steps));
        layer.append(g);
        return { node, g, starViews, lineViews, art, size, place: { k: 1, flip: 1 } };
    }

    function viewOf(id) {
        if (views.has(id)) return views.get(id);
        const node = graph.byId.get(id);
        const v = node ? build(node) : null;
        views.set(id, v);
        return v;
    }

    const OPPOSITE = { left: "right", right: "left", above: "below", below: "above" };

    /** Authored side, mirrored with the figure. */
    function preferredSide(sv, flip) {
        const side = sv.s.side ?? "right";
        return flip < 0 && (side === "left" || side === "right") ? OPPOSITE[side] : side;
    }

    /** Label box for a star at (x, y) on `side`, in screen px. */
    function labelBox(sv, x, y, side) {
        const h = 12;
        const g = LABEL_GAP;
        switch (side) {
            case "left": return { side, x0: x - g - sv.w, x1: x - g, y0: y - h / 2, y1: y + h / 2 };
            case "above": return { side, x0: x - sv.w / 2, x1: x + sv.w / 2, y0: y - g - h, y1: y - g };
            case "below": return { side, x0: x - sv.w / 2, x1: x + sv.w / 2, y0: y + g, y1: y + g + h };
            default: return { side, x0: x + g, x1: x + g + sv.w, y0: y - h / 2, y1: y + h / 2 };
        }
    }

    const overlaps = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
    const overflowOf = (b, stage, pad) =>
        Math.max(0, pad.left - b.x0) + Math.max(0, b.x1 - (stage.width - pad.right))
        + Math.max(0, pad.top - b.y0) + Math.max(0, b.y1 - (stage.height - pad.bottom));

    /**
     * Pick each label's side once per placement: the authored side unless it
     * would run off the stage or onto a label already placed, then the
     * opposite side, then the other axis.
     */
    function assignSides(v, cx, cy, k, flip, stage, pad) {
        // Other projects' stars and names count as taken too.
        const taken = [{ x0: cx - 7, y0: cy - 7, x1: cx + 7, y1: cy + 7 }, ...(getAvoid?.(v.node.id) ?? [])];
        for (const sv of v.starViews) {
            const x = cx + sv.pt.dx * k * flip, y = cy + sv.pt.dy * k;
            taken.push({ x0: x - 4, y0: y - 4, x1: x + 4, y1: y + 4 });
        }
        const sides = new Map();
        let clash = 0, over = 0;
        for (const sv of v.starViews) {
            if (!sv.text) continue;
            const x = cx + sv.pt.dx * k * flip, y = cy + sv.pt.dy * k;
            const pref = preferredSide(sv, flip);
            const tries = pref === "left" || pref === "right"
                ? [pref, OPPOSITE[pref], "above", "below"]
                : [pref, OPPOSITE[pref], "right", "left"];
            let best = null;
            tries.forEach((side, i) => {
                const b = labelBox(sv, x, y, side);
                const hits = taken.filter((t) => overlaps(t, b)).length;
                const o = overflowOf(b, stage, pad);
                const cost = hits * 400 + o * 10 + i * 3;
                if (!best || cost < best.cost) best = { cost, side, b, hits, o };
            });
            sides.set(sv, best.side);
            taken.push(best.b);
            clash += best.hits;
            over += best.o;
        }
        return { sides, clash, over };
    }

    function extent(v, cx, cy, k, flip, sides = v.place.sides) {
        let x0 = cx - 8, y0 = cy - 8, x1 = cx + 8, y1 = cy + 8;
        for (const sv of v.starViews) {
            const x = cx + sv.pt.dx * k * flip;
            const y = cy + sv.pt.dy * k;
            x0 = Math.min(x0, x - 4); x1 = Math.max(x1, x + 4);
            y0 = Math.min(y0, y - 4); y1 = Math.max(y1, y + 4);
            if (sv.text) {
                const b = labelBox(sv, x, y, sides?.get(sv) ?? preferredSide(sv, flip));
                x0 = Math.min(x0, b.x0); x1 = Math.max(x1, b.x1);
                y0 = Math.min(y0, b.y0); y1 = Math.max(y1, b.y1);
            }
        }
        return { x0, y0, x1, y1 };
    }

    function choosePlacement(v) {
        const n = v.node;
        const stage = getStage();
        const c = getConfig().symbol ?? {};
        // Fit the figure to a share of the stage; labels ride on top of that.
        const fill = c.fill ?? [0.32, 0.44];
        const fit = Math.min(stage.width * fill[0] / v.size.w, stage.height * fill[1] / v.size.h);
        const base = Math.min(c.maxScale ?? 2.2, Math.max(c.minScale ?? 0.6, fit));
        const pad = c.pad ?? { top: 64, right: 18, bottom: 18, left: 18 };
        const cx = n.rx, cy = n.ry;
        let best = null;
        let order = 0;
        for (const shrink of [1, 0.86, 0.74, 0.62, 0.52]) {
            for (const flip of [1, -1]) {
                const k = base * shrink;
                const { sides, clash } = assignSides(v, cx, cy, k, flip, stage, pad);
                const b = extent(v, cx, cy, k, flip, sides);
                const over = overflowOf(b, stage, pad);
                let covered = 0;
                for (const m of graph.projects) {
                    if (m === n || m.rVisible === false) continue;
                    if (m.rx > b.x0 && m.rx < b.x1 && m.ry > b.y0 && m.ry < b.y1) covered++;
                }
                const score = over * 10 + clash * 400 + covered * 24 + order * 6;
                if (!best || score < best.score) best = { score, k, flip, sides };
                order++;
            }
        }
        v.place = { k: best.k, flip: best.flip, sides: best.sides };
    }

    function position(v) {
        const n = v.node;
        if (!Number.isFinite(n.rx)) return;
        const { k, flip } = v.place;
        const s = Math.min(1.15, Math.max(0.85, n.rScale ?? 1));
        const kk = k * s;
        const at = (pt) => [n.rx + pt.dx * kk * flip, n.ry + pt.dy * kk];
        for (const sv of v.starViews) {
            const [x, y] = at(sv.pt);
            sv.dot.setAttribute("cx", x.toFixed(1));
            sv.dot.setAttribute("cy", y.toFixed(1));
            if (sv.text) {
                const b = labelBox(sv, x, y, v.place.sides?.get(sv) ?? preferredSide(sv, flip));
                const anchor = b.side === "left" ? "end" : b.side === "right" ? "start" : "middle";
                const tx = b.side === "left" ? b.x1 : b.side === "right" ? b.x0 : x;
                sv.text.setAttribute("x", tx.toFixed(1));
                sv.text.setAttribute("y", ((b.y0 + b.y1) / 2).toFixed(1));
                sv.text.setAttribute("text-anchor", anchor);
            }
        }
        if (v.art) {
            v.art.frame.setAttribute("transform",
                `translate(${n.rx.toFixed(1)} ${n.ry.toFixed(1)}) scale(${(kk * flip).toFixed(4)} ${kk.toFixed(4)}) `
                + `translate(${-v.art.ox} ${-v.art.oy})`);
        }
        for (const l of v.lineViews) {
            const [x1, y1] = at(l.a);
            const [x2, y2] = at(l.b);
            l.el.setAttribute("x1", x1.toFixed(1));
            l.el.setAttribute("y1", y1.toFixed(1));
            l.el.setAttribute("x2", x2.toFixed(1));
            l.el.setAttribute("y2", y2.toFixed(1));
        }
    }

    function show(id) {
        if (id === currentId) return;
        if (currentId) {
            const prev = views.get(currentId);
            if (prev) {
                prev.g.classList.remove("is-on");
                clearTimeout(fading.get(currentId));
                const leaving = currentId;
                fading.set(leaving, setTimeout(() => {
                    fading.delete(leaving);
                    if (leaving !== currentId) prev.g.classList.remove("is-placed");
                }, HIDE_MS));
            }
        }
        currentId = id && viewOf(id) ? id : null;
        if (!currentId) return;
        const v = views.get(currentId);
        clearTimeout(fading.get(currentId));
        fading.delete(currentId);
        choosePlacement(v);
        position(v);
        v.g.classList.add("is-placed");
        // Next frame, so the lines start from zero length.
        void v.g.getBoundingClientRect();
        v.g.classList.add("is-on");
    }

    return {
        show,
        get current() { return currentId; },
        /** Keep shown (and fading) figures on their stars. */
        update() {
            if (currentId) position(views.get(currentId));
            for (const id of fading.keys()) {
                const v = views.get(id);
                if (v) position(v);
            }
        },
        /** Screen box of a project's figure as currently placed (null if it has none). */
        bbox(id) {
            const v = viewOf(id);
            if (!v || !Number.isFinite(v.node.rx)) return null;
            if (id !== currentId) choosePlacement(v);
            const s = Math.min(1.15, Math.max(0.85, v.node.rScale ?? 1));
            return extent(v, v.node.rx, v.node.ry, v.place.k * s, v.place.flip);
        },
        /**
         * Screen shift that would bring the shown figure fully inside the stage
         * ({ dx, dy } in px, 0 when it already fits). The sky turns by this much,
         * so a figure near the edge is looked at rather than cut off.
         */
        nudge(id) {
            if (!id || id !== currentId) return { dx: 0, dy: 0 };
            const b = this.bbox(id);
            if (!b) return { dx: 0, dy: 0 };
            const stage = getStage();
            const pad = getConfig().symbol?.pad ?? { top: 64, right: 18, bottom: 18, left: 18 };
            const axis = (lo, hi, min, max) => {
                const need = Math.max(0, min - lo) - Math.max(0, hi - max);
                // Too big for the stage either way: centre it.
                if (hi - lo > max - min) return (min + max) / 2 - (lo + hi) / 2;
                return need;
            };
            return {
                dx: axis(b.x0, b.x1, pad.left, stage.width - pad.right),
                dy: axis(b.y0, b.y1, pad.top, stage.height - pad.bottom),
            };
        },
        /** Whether a stage point sits on a project's shown figure (with some slack). */
        contains(id, x, y, slack = 18) {
            if (id !== currentId) return false;
            const b = this.bbox(id);
            return !!b && x > b.x0 - slack && x < b.x1 + slack && y > b.y0 - slack && y < b.y1 + slack;
        },
        /** Keyword labels, for screen readers. */
        keywords(id) {
            const sym = graph.byId.get(id)?.data?.symbol;
            return sym ? sym.stars.map((s) => s.label).filter(Boolean) : [];
        },
        relayout() {
            for (const [, v] of views) v?.g.remove();
            views.clear();
            const keep = currentId;
            currentId = null;
            if (keep) show(keep);
        },
    };
}
