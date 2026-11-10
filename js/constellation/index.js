/**
 * Entry point. Mounts the constellation onto `[data-constellation]`.
 *
 * To change what appears on the map, edit data/portfolio.js.
 * To tune the layout / motion, edit config.js.
 * To restyle, edit css/constellation.css.
 */

import { portfolio } from "./data/portfolio.js?v=3.11";
import { mountConstellation } from "./components/Constellation.js?v=5.59";

const root = document.querySelector("[data-constellation]");

// The home sky shows the projects alone; each draws its own keyword figure
// (`symbol`) when looked at. The shared attributes stay in the data for the
// detail pages.
const homeSky = {
    projects: portfolio.projects.map((p) => ({ ...p, attributes: [] })),
    attributes: [],
    scaleMarks: portfolio.scaleMarks,
};

if (root) {
    mountConstellation(root, homeSky)
        .then((api) => { window.__constellation = api; })
        .catch((err) => {
            console.error(err);
            root.classList.add("is-failed");
        });
}
