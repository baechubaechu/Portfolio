/**
 * Entry point. Mounts the constellation onto `[data-constellation]`.
 *
 * To change what appears on the map, edit data/portfolio.js.
 * To tune the layout / motion, edit config.js.
 * To restyle, edit css/constellation.css.
 */

import { portfolio } from "./data/portfolio.js?v=3.0";
import { mountConstellation } from "./components/Constellation.js?v=5.30";

const root = document.querySelector("[data-constellation]");

if (root) {
    mountConstellation(root, portfolio)
        .then((api) => { window.__constellation = api; })
        .catch((err) => {
            console.error(err);
            root.classList.add("is-failed");
        });
}
