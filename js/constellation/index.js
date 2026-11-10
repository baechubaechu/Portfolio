/**
 * Entry point. Mounts the constellation onto `[data-constellation]`.
 *
 * To change what appears on the map, edit data/portfolio.js.
 * To tune the layout / motion, edit config.js.
 * To restyle, edit css/constellation.css.
 */

import { portfolio } from "./data/portfolio.js?v=3.17";
import { mountConstellation } from "./components/Constellation.js?v=5.72";

const root = document.querySelector("[data-constellation]");

// The home sky shows the projects alone; each draws its own keyword figure
// (`symbol`) when looked at. The shared attributes stay in the data for the
// detail pages.
/**
 * Scale marks sit evenly across the sky (an ordinal axis, so no column is left
 * empty), and projects sharing a mark are eased apart sideways in code order,
 * so two works of the same scale never stack on one line.
 */
function placeOnSky(projects, marks) {
    const EDGE = 0.07, SPREAD = 0.075;
    const at = new Map(marks.map((m, i) => [m.id, EDGE + (1 - 2 * EDGE) * (marks.length > 1 ? i / (marks.length - 1) : 0.5)]));
    const byBin = new Map();
    for (const p of projects) {
        if (!p.place || typeof p.place.scale === "number") continue;
        if (!byBin.has(p.place.scale)) byBin.set(p.place.scale, []);
        byBin.get(p.place.scale).push(p);
    }
    const scale = new Map();
    for (const [bin, list] of byBin) {
        list.sort((a, b) => a.place.code - b.place.code);
        list.forEach((p, i) => {
            const off = list.length > 1 ? (i / (list.length - 1) - 0.5) * 2 * SPREAD : 0;
            scale.set(p.id, Math.min(1, Math.max(0, (at.get(bin) ?? 0.5) + off)));
        });
    }
    return {
        projects: projects.map((p) => ({
            ...p,
            attributes: [],
            ...(p.place && typeof p.place.scale !== "number" ? { place: { ...p.place, scale: scale.get(p.id) } } : {}),
        })),
        scaleMarks: marks.map((m) => ({ ...m, at: at.get(m.id) })),
    };
}

const placed = placeOnSky([...portfolio.projects, ...(portfolio.author ? [portfolio.author] : [])], portfolio.scaleMarks ?? []);
const homeSky = {
    projects: placed.projects,
    attributes: [],
    scaleMarks: placed.scaleMarks,
};

if (root) {
    mountConstellation(root, homeSky)
        .then((api) => { window.__constellation = api; })
        .catch((err) => {
            console.error(err);
            root.classList.add("is-failed");
        });
}
