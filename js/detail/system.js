/**
 * Arrival system.
 *
 * Warp drops you into this project's own system: the project is the sun,
 * its real attributes are the planets. Orbits live on a plane and are
 * drawn in perspective (a slightly elevated look, not a floor-plan).
 */

import { portfolio } from "../constellation/data/portfolio.js?v=3.0";
import {
    svgEl, htmlEl, mulberry32, hashString, prefersReducedMotion, esc, clamp,
} from "../constellation/lib/utils.js?v=2.0";

const ELEV = 0.56;
const CAM_DIST = 3.12;
const DIST_TOC = 3.6;
const TOP_ELEV = 1.46;
const ORBIT_SAMPLES = 96;
const CLICK_PX = 7;
const SUN_GLOW = 2.2;
const CAM_OPEN_MS = 1340;
const CAM_CLOSE_MS = 1080;
const STORY_SPAN = 1080;
// Floor keeps the camera outside the widest orbit (r ≈ 1.72) at any elevation.
const ZOOM_MIN = 0.62;
const ZOOM_RATE = 0.0006;
const TOC_OFFSCREEN = 28;
const HILITE = 1.5;
const STORY_OPEN = 0.56;
const STORY_CLOSE = 0.4;
const DOCK_MAX = 1280;
const DOCK_EDGE = 28;

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function easeInOutSlow(t) {
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return t * t * t * (t * (t * 6 - 15) + 10);
}

function easeInOutCubic(t) {
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;
}

function lerpAngShort(a, b, t) {
    let d = (b - a) % (Math.PI * 2);
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    return a + d * t;
}

const SUN_LOOK = {
    "xtra-space": {
        lo: [120, 126, 146], hi: [240, 244, 255], glow: [226, 234, 255],
        cells: 260, spots: 4, grain: 0.2,
    },
    "little-forest": {
        lo: [74, 128, 74], hi: [214, 246, 196], glow: [190, 236, 168],
        cells: 220, spots: 3, grain: 0.22,
    },
    "class-ic": {
        lo: [150, 112, 84], hi: [250, 228, 204], glow: [246, 214, 180],
        cells: 240, spots: 4, grain: 0.2,
    },
    "student-driven-village": {
        lo: [96, 132, 176], hi: [222, 236, 255], glow: [198, 222, 255],
        cells: 280, spots: 3, grain: 0.22,
    },
    "kitch-fish": {
        lo: [168, 98, 42], hi: [255, 214, 148], glow: [255, 196, 118],
        cells: 170, spots: 7, grain: 0.26,
    },
    "emotional-architecture": {
        lo: [158, 72, 108], hi: [255, 206, 220], glow: [255, 176, 202],
        cells: 210, spots: 5, grain: 0.2,
    },
    sida: {
        lo: [70, 96, 150], hi: [210, 226, 255], glow: [170, 200, 255],
        cells: 190, spots: 3, grain: 0.16,
    },
    deary: {
        lo: [28, 118, 112], hi: [176, 248, 232], glow: [138, 240, 220],
        cells: 150, spots: 2, grain: 0.12,
    },
};

function sunLook(id) {
    if (SUN_LOOK[id]) return SUN_LOOK[id];
    const rand = mulberry32(hashString(id || "sun"));
    const hue = rand();
    const sat = 0.28 + rand() * 0.22;
    const rgb = (v) => {
        const a = hue * 6;
        const i = a | 0;
        const f = a - i;
        const p = v * (1 - sat);
        const q = v * (1 - f * sat);
        const t = v * (1 - (1 - f) * sat);
        const m = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i % 6];
        return [m[0] * 255, m[1] * 255, m[2] * 255].map((n) => Math.round(n));
    };
    const hi = rgb(0.92 + rand() * 0.06);
    const lo = rgb(0.38 + rand() * 0.12);
    return { lo, hi, glow: hi, cells: 200, spots: 4, grain: 0.18 };
}

function wrapU(du) {
    du -= Math.round(du);
    return du;
}

function buildSunTexture(seed, look) {
    const w = 256;
    const h = 128;
    const rand = mulberry32(seed);
    const lo = look.lo;
    const hi = look.hi;
    const grain = look.grain ?? 0.18;
    const nCells = look.cells ?? 240;
    const px = new Uint8ClampedArray(w * h * 4);
    const cells = [];
    for (let i = 0; i < nCells; i++) {
        cells.push({
            u: rand(),
            v: rand(),
            b: 0.78 + rand() * 0.22,
        });
    }
    const spots = [];
    const nSpots = look.spots ?? (3 + (rand() * 3 | 0));
    for (let i = 0; i < nSpots; i++) {
        spots.push({
            u: rand(),
            v: 0.32 + rand() * 0.36,
            ru: 0.014 + rand() * 0.028,
            rv: 0.022 + rand() * 0.038,
            k: 0.3 + rand() * 0.28,
        });
    }
    for (let y = 0; y < h; y++) {
        const v = y / h;
        const lat = (v - 0.5) * 2;
        for (let x = 0; x < w; x++) {
            const u = x / w;
            let best = 9;
            let second = 9;
            let bright = 0.9;
            for (const c of cells) {
                const du = wrapU(u - c.u);
                const dv = v - c.v;
                const d = du * du + dv * dv;
                if (d < best) {
                    second = best;
                    best = d;
                    bright = c.b;
                } else if (d < second) {
                    second = d;
                }
            }
            const edge = Math.min(1, Math.abs(Math.sqrt(best) - Math.sqrt(second)) * 20);
            let L = 0.7 + bright * 0.26 - edge * grain;
            L *= 1 - lat * lat * 0.05;
            for (const s of spots) {
                const du = wrapU(u - s.u) / s.ru;
                const dv = (v - s.v) / s.rv;
                const d = du * du + dv * dv;
                if (d < 1) L *= 1 - s.k * (1 - d) * (1 - d);
            }
            L = clamp(L, 0.48, 1);
            const t = (L - 0.48) / 0.52;
            const i = (y * w + x) * 4;
            px[i] = lo[0] + t * (hi[0] - lo[0]);
            px[i + 1] = lo[1] + t * (hi[1] - lo[1]);
            px[i + 2] = lo[2] + t * (hi[2] - lo[2]);
            px[i + 3] = 255;
        }
    }
    return { data: px, w, h, glow: look.glow ?? hi };
}

function sampleSun(tex, u, v, out) {
    const { data, w, h } = tex;
    u -= Math.floor(u);
    v = clamp(v, 0, 0.999);
    const x = u * w;
    const y = v * (h - 1);
    const x0 = x | 0;
    const y0 = y | 0;
    const x1 = (x0 + 1) % w;
    const y1 = Math.min(h - 1, y0 + 1);
    const fx = x - x0;
    const fy = y - y0;
    const i00 = (y0 * w + x0) * 4;
    const i10 = (y0 * w + x1) * 4;
    const i01 = (y1 * w + x0) * 4;
    const i11 = (y1 * w + x1) * 4;
    for (let c = 0; c < 3; c++) {
        const a = data[i00 + c] + (data[i10 + c] - data[i00 + c]) * fx;
        const b = data[i01 + c] + (data[i11 + c] - data[i01 + c]) * fx;
        out[c] = a + (b - a) * fy;
    }
    return out;
}

function lookBasis(azim, elev) {
    const ce = Math.cos(elev), se = Math.sin(elev);
    const ca = Math.cos(azim), sa = Math.sin(azim);
    const camX = sa * ce;
    const camY = se;
    const camZ = ca * ce;
    let fx = -camX, fy = -camY, fz = -camZ;
    const fl = Math.hypot(fx, fy, fz) || 1;
    fx /= fl; fy /= fl; fz /= fl;
    let rx = -fz, ry = 0, rz = fx;
    const rl = Math.hypot(rx, ry, rz) || 1;
    rx /= rl; ry /= rl; rz /= rl;
    const ux = ry * fz - rz * fy;
    const uy = rz * fx - rx * fz;
    const uz = rx * fy - ry * fx;
    return { fx, fy, fz, rx, ry, rz, ux, uy, uz };
}

/**
 * Per-size sun geometry. The glow ring never changes and the disc normals and limb
 * darkening only depend on the canvas size, so they are computed once per size;
 * each frame then only re-shades the disc pixels.
 */
function sunRaster(n, tex) {
    const img = new ImageData(n, n);
    const px = img.data;
    const cx = (n - 1) * 0.5;
    const disc = n / (2 * SUN_GLOW);
    const inv = 1 / disc;
    const glow = tex.glow || [255, 252, 242];
    const idx = [], nxs = [], nys = [], nzs = [], limbs = [];
    for (let y = 0; y < n; y++) {
        const ny = (y - cx) * inv;
        for (let x = 0; x < n; x++) {
            const nx = (x - cx) * inv;
            const rr = nx * nx + ny * ny;
            const i = (y * n + x) * 4;
            if (rr > 1) {
                const g = Math.exp(-(Math.sqrt(rr) - 1) * 2.5) * 0.28;
                px[i] = glow[0] * g;
                px[i + 1] = glow[1] * g;
                px[i + 2] = glow[2] * g;
                px[i + 3] = 255 * g;
                continue;
            }
            const nz = Math.sqrt(1 - rr);
            idx.push(i);
            nxs.push(nx);
            nys.push(ny);
            nzs.push(nz);
            limbs.push(0.7 + 0.3 * Math.pow(nz, 0.65));
            px[i + 3] = 255;
        }
    }
    return {
        n, img,
        idx: Int32Array.from(idx),
        nx: Float64Array.from(nxs),
        ny: Float64Array.from(nys),
        nz: Float64Array.from(nzs),
        limb: Float64Array.from(limbs),
        col: [0, 0, 0],
    };
}

function paintSun(ctx, raster, tex, spin, azim, elev) {
    const px = raster.img.data;
    const { idx, nx: NX, ny: NY, nz: NZ, limb: LIMB, col } = raster;
    const { fx, fy, fz, rx, ry, rz, ux, uy, uz } = lookBasis(azim, elev);
    const tx = -fx, ty = -fy, tz = -fz;
    const cs = Math.cos(-spin);
    const ss = Math.sin(-spin);
    const TAU = Math.PI * 2;
    for (let k = 0; k < idx.length; k++) {
        const nx = NX[k], ny = NY[k], nz = NZ[k];
        const wx = nx * rx - ny * ux + nz * tx;
        const wy = nx * ry - ny * uy + nz * ty;
        const wz = nx * rz - ny * uz + nz * tz;
        const lx = wx * cs + wz * ss;
        const lz = -wx * ss + wz * cs;
        const lon = Math.atan2(lx, lz);
        const lat = Math.asin(clamp(wy, -1, 1));
        sampleSun(tex, lon / TAU + 0.5, 0.5 - lat / Math.PI, col);
        const limb = LIMB[k];
        const i = idx[k];
        px[i] = Math.min(255, col[0] * limb);
        px[i + 1] = Math.min(255, col[1] * limb);
        px[i + 2] = Math.min(255, col[2] * limb);
    }
    ctx.putImageData(raster.img, 0, 0);
}

/** Write an attribute / style only when its value changes (the frame loop repeats most of them). */
const written = new WeakMap();
function lastWrites(el) {
    let c = written.get(el);
    if (!c) written.set(el, (c = new Map()));
    return c;
}
function setAttr(el, name, value) {
    const c = lastWrites(el);
    if (c.get(name) === value) return;
    c.set(name, value);
    el.setAttribute(name, value);
}
function setStyle(el, prop, value) {
    const c = lastWrites(el);
    const key = "style:" + prop;
    if (c.get(key) === value) return;
    c.set(key, value);
    el.style.setProperty(prop, value);
}

function lastParagraph(text) {
    const parts = String(text ?? "").split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
    return parts.at(-1) || "";
}

function plain(text) {
    return String(text ?? "").replace(/<br\s*\/?>/gi, " / ").replace(/<[^>]+>/g, "");
}

function firstImage(section) {
    if (!section) return "";
    if (section.image) return section.image;
    if (section.media?.url && section.media.type !== "video") return section.media.url;
    const bag = section.plans || section.images || section.screenshots;
    const first = bag?.[0];
    if (!first) return "";
    return typeof first === "string" ? first : (first.url || "");
}

function sunDossierHTML(project) {
    const sections = project.sections ?? [];
    const meta = sections.find((s) => s.type === "hero-meta") ?? {};
    const comp = sections.find((s) => s.type === "arch-competition-info") ?? {};
    const panel = sections.find((s) => s.type === "arch-panel") ?? {};
    const concept = sections.find((s) => s.type === "arch-concept") ?? {};
    const split = sections.find((s) => s.type === "split-content") ?? {};
    const gallery = sections.find((s) => s.type === "dev-frontend-gallery" || s.type === "arch-renders") ?? {};
    const narrative = sections.find((s) => s.type === "text-full") ?? {};
    // Project-level fields first; the section lookups only cover older data.
    const quote = project.subtitle || meta.subtitle || split.leadText || "";
    const thesis = project.thesis || lastParagraph(narrative.content) || split.description || concept.description || project.description || "";
    const kind = project.kind || "Project";
    const category = project.category || meta.category || "";
    const timeline = project.timeline || meta.timeline || "";
    const kindShown = category.toLowerCase().startsWith(kind.toLowerCase()) ? null : kind;
    const kicker = ["01", kindShown, category, timeline].filter(Boolean).join("  ·  ");
    const links = [
        project.githubLink && { label: "GitHub", url: project.githubLink },
        project.visitLink && { label: "Live", url: project.visitLink },
        project.bookletLink && { label: "Booklet", url: project.bookletLink },
    ].filter(Boolean);
    const role = project.role || meta.role;
    const organizer = project.organizer || comp.organizer;
    const team = project.team || comp.team;
    const rows = [
        role && ["Role", plain(role)],
        organizer && ["Organizer", organizer],
        team && ["Team", team],
    ].filter(Boolean);
    const img = project.cover || panel.image || firstImage(concept) || firstImage(split) || firstImage(gallery) || project.thumbnail || "";
    return `
        <p class="sys-dock__kicker">${esc(kicker)}</p>
        <h2 class="sys-dock__title">${esc(project.title)}</h2>
        ${quote ? `<p class="sys-dock__quote">${esc(quote)}</p>` : ""}
        ${rows.length ? `<dl class="sys-dock__meta">${rows.map(([k, v]) =>
            `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>` : ""}
        ${img ? `<figure class="sys-dock__figure"><img src="${esc(img)}" alt="${esc(project.title)}"></figure>` : ""}
        ${thesis ? `<p class="sys-dock__thesis">${esc(thesis)}</p>` : ""}
        ${links.length ? blockHTML({ kind: "links", items: links }) : ""}
    `;
}

function planetDossierHTML(project, planet, attr, idx) {
    const cited = (project.sections ?? []).filter((s) => (s.spine ?? []).includes(planet.id));
    const concept = cited.find((s) => s.type === "arch-concept");
    const pick = concept
        || cited.find((s) => s.description || s.leadText || s.content || s.caption || s.techs || firstImage(s))
        || {};
    const narrative = cited.find((s) => s.type === "text-full");
    const name = attr?.label || planet.label;
    const n = String((idx ?? 0) + 2).padStart(2, "0");
    const kicker = `${n}  ·  ${name}`;
    const lead = pick.leadText || pick.title || pick.label || "";
    let thesis = pick.description || pick.caption || "";
    if (!thesis && pick.techs) {
        thesis = pick.techs.map((t) => t.note ? `${t.name} — ${t.note}` : t.name).join(" · ");
    }
    if (!thesis && narrative?.content) {
        const paras = String(narrative.content).split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
        const re = planet.id === "ai"
            ? /AI|Blender|Rhino|Photoshop|Gemini|Vision/i
            : new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        thesis = paras.find((p) => re.test(p)) || paras[0] || "";
    }
    const img = firstImage(pick) || firstImage(cited.find((s) => firstImage(s)));
    return `
        <p class="sys-dock__kicker">${esc(kicker)}</p>
        <h2 class="sys-dock__title">${esc(String(name).toUpperCase())}</h2>
        ${lead ? `<p class="sys-dock__quote">${esc(lead)}</p>` : ""}
        ${img ? `<figure class="sys-dock__figure"><img src="${esc(img)}" alt="${esc(name)}"></figure>` : ""}
        ${thesis ? `<p class="sys-dock__thesis">${esc(thesis)}</p>` : ""}
    `;
}

function blockHTML(b) {
    switch (b.kind) {
        case "text":
            return `<p class="sys-dock__thesis${b.strong ? " sys-dock__thesis--strong" : ""}">${esc(b.body)}</p>`;
        case "list":
            return `<ul class="sys-dock__list">${b.items.map((it) => `<li>${esc(it)}</li>`).join("")}</ul>`;
        case "steps":
            return `<ol class="sys-dock__list sys-dock__list--steps">${b.items.map((it) => `<li>${esc(it)}</li>`).join("")}</ol>`;
        case "rules":
            return `<dl class="sys-dock__rules${b.strong ? " sys-dock__rules--strong" : ""}">${b.items.map(([k, v]) =>
                `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>`;
        case "techs":
            return `<ul class="sys-dock__techs">${b.items.map((t) =>
                `<li><span>${esc(t.name)}</span>${t.note ? `<em>${esc(t.note)}</em>` : ""}</li>`).join("")}</ul>`;
        case "code":
            return `<figure class="sys-dock__code">
                ${b.filename ? `<figcaption>${esc(b.filename)}${b.language ? ` · ${esc(b.language)}` : ""}</figcaption>` : ""}
                <pre><code>${esc(b.code)}</code></pre>
                ${b.caption ? `<p>${esc(b.caption)}</p>` : ""}
            </figure>`;
        case "image":
            return `<figure class="sys-dock__figure"><img src="${esc(b.url)}" alt="${esc(b.caption || "")}" loading="lazy">${b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : ""}</figure>`;
        case "gallery": {
            const n = b.images.length;
            const perRow = n <= 3 ? n : n === 4 ? 2 : 3;
            const rows = [];
            for (let i = 0; i < n; i += perRow) rows.push(b.images.slice(i, i + perRow));
            return `<div class="sys-dock__gallery">${rows.map((row) => `<div class="sys-dock__row">${row.map((im) =>
                `<img src="${esc(im.url || im)}" alt="${esc(im.caption || "")}" loading="lazy">`).join("")}</div>`).join("")}</div>`;
        }
        case "links":
            return `<p class="sys-dock__links">${b.items.map((l) =>
                `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join("")}</p>`;
        case "note":
            return `<p class="sys-dock__note">${esc(b.body)}</p>`;
        default:
            return "";
    }
}

function chapterDossierHTML(chapter, idx) {
    const n = String(idx + 2).padStart(2, "0");
    return `
        <p class="sys-dock__kicker">${esc(`${n}  ·  ${chapter.label}`)}</p>
        <h2 class="sys-dock__title">${esc(String(chapter.title || chapter.label).toUpperCase())}</h2>
        ${chapter.lead ? `<p class="sys-dock__quote">${esc(chapter.lead)}</p>` : ""}
        ${(chapter.blocks ?? []).map(blockHTML).join("")}
    `;
}

// js/detail.js asks this before rendering: projects on the home sky open as a system.
window.__systemHref = (id) => portfolio.projects.find((p) => p.id === id)?.href || null;

function boot() {
    if (window.__detailProject) init(window.__detailProject);
    else document.addEventListener("detail:system", (e) => init(e.detail.project), { once: true });
}

function init(project) {
    if (document.querySelector("[data-system]")) return;
    const cproj = portfolio.projects.find((q) => q.id === project.id);
    if (!cproj) return;

    const attrOf = new Map(portfolio.attributes.map((a) => [a.id, a]));
    const reduce = prefersReducedMotion();

    const chapters = project.chapters ?? [];
    const planets = chapters.length ? chapters.map((c, i, all) => ({
        id: c.id,
        label: c.label.toUpperCase(),
        weight: 1 - (i / Math.max(1, all.length - 1)) * 0.9,
        ang0: i * 2.39996,
        rDot: 2.6,
    })) : [...(cproj.attributes ?? [])]
        .sort((a, b) => b.weight - a.weight)
        .map((rel) => {
            const spec = cproj.asterism?.stars?.[rel.id];
            const ang0 = spec ? Math.atan2(spec[1], spec[0]) : 0;
            return {
                id: rel.id,
                label: (attrOf.get(rel.id)?.label ?? rel.id).toUpperCase(),
                weight: rel.weight,
                ang0,
                rDot: 2.1 + rel.weight * 1.1,
            };
        });

    let arriving = false;
    try {
        arriving = sessionStorage.getItem("c-arrive") === cproj.id;
        sessionStorage.removeItem("c-arrive");
    } catch { /* private mode */ }

    const stage = htmlEl("section", {
        class: "sys",
        "data-system": "",
        "data-sun": cproj.id,
        "aria-label": `${cproj.title} system`,
    });
    const svg = svgEl("svg", { class: "sys__svg", xmlns: "http://www.w3.org/2000/svg" });
    const dustG = svgEl("g", { class: "sys__dust" });
    const world = svgEl("g", { class: "sys__world" });
    const orbitsG = svgEl("g", { class: "sys__orbits" });
    const bodiesG = svgEl("g", { class: "sys__bodies" });
    world.append(orbitsG, bodiesG);
    const stackLine = svgEl("path", { class: "sys__stack" });
    world.append(stackLine);
    svg.append(dustG, world);

    const dust = [];
    const rand = mulberry32(hashString(cproj.id));
    for (let i = 0; i < 280; i++) {
        const bright = i < 36;
        const el = svgEl("circle", { class: bright ? "sys__speck sys__speck--hot" : "sys__speck" });
        dustG.append(el);
        const d = {
            el,
            nx: rand() * 1.4 - 0.2,
            ny: rand() * 1.4 - 0.2,
            r: bright ? 0.5 + rand() * 0.65 : 0.22 + rand() ** 2 * 0.45,
            o: bright ? 0.38 + rand() * 0.32 : 0.14 + rand() * 0.24,
            tw: rand() * Math.PI * 2,
            tws: 0.2 + rand() * 0.65,
        };
        dust.push(d);
    }
    let dustKey = "";

    const planetEls = [];
    for (const p of planets) {
        const orbit = svgEl("path", { class: "sys__orbit" });
        const g = svgEl("g", { class: "sys__planet" });
        const dot = svgEl("circle", { class: "sys__planet-dot" });
        const label = svgEl("text", { class: "sys__planet-label", y: 0 });
        label.textContent = p.label;
        g.append(dot, label);
        orbitsG.append(orbit);
        bodiesG.append(g);
        planetEls.push({ ...p, orbit, g, dot, label, label0: p.label });
    }

    const look = sunLook(cproj.id);
    const sunSpin = 0.14 + (hashString(cproj.id) % 97) / 420;
    const sunTex = buildSunTexture(hashString(cproj.id), look);
    stage.style.setProperty("--sys-sun", `rgb(${look.hi[0]}, ${look.hi[1]}, ${look.hi[2]})`);
    stage.style.setProperty("--sys-sun-glow", `rgb(${look.glow[0]}, ${look.glow[1]}, ${look.glow[2]})`);
    const sunG = svgEl("g", { class: "sys__sun" });
    const sunHit = svgEl("circle", { class: "sys__sun-hit", r: 22 });
    const sunFo = svgEl("foreignObject", {
        class: "sys__sun-fo",
        x: "-40",
        y: "-40",
        width: "80",
        height: "80",
    });
    const sunWrap = document.createElement("div");
    sunWrap.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
    sunWrap.className = "sys__sun-wrap";
    const sunCanvas = document.createElement("canvas");
    sunCanvas.className = "sys__sun-tex";
    sunCanvas.width = 128;
    sunCanvas.height = 128;
    sunWrap.append(sunCanvas);
    const sunCtx = sunCanvas.getContext("2d", { alpha: true });
    let sunRas = null;
    let sunKey = "";
    sunFo.append(sunWrap);
    const sunLimb = svgEl("circle", { class: "sys__sun-limb", r: 13 });
    sunLimb.style.stroke = `rgba(${look.hi[0]},${look.hi[1]},${look.hi[2]},0.42)`;
    const sunLabel = svgEl("text", { class: "sys__sun-label", x: 16, y: 0 });
    sunLabel.textContent = cproj.title.toUpperCase();
    sunG.setAttribute("aria-hidden", "true");
    sunG.append(sunHit, sunFo, sunLimb, sunLabel);
    bodiesG.append(sunG);

    const veil = htmlEl("div", { class: "sys__veil", "aria-hidden": "true" });
    const sunBtn = htmlEl("button", {
        type: "button",
        class: "sys__sun-btn",
        "aria-label": `${cproj.title}, open dossier`,
        "aria-expanded": "false",
    });
    if (arriving && !reduce) {
        document.body.classList.add("is-arriving");
        veil.classList.add("is-on");
    }
    const backBtn = htmlEl("button", {
        type: "button",
        class: "sys__back",
        "aria-label": "Return to system",
        "aria-hidden": "true",
        tabindex: "-1",
        text: "← System",
    });
    const hint = htmlEl("div", {
        class: "sys-scroll",
        role: "note",
        "aria-label": "Scroll to read",
    });
    hint.innerHTML = `<span class="sys-scroll__mouse" aria-hidden="true"><span class="sys-scroll__wheel"></span></span>`;
    const chapNav = htmlEl("ol", { class: "sys-chaps", "aria-label": "Chapters" });
    const chapBtns = [];
    const chapItems = [
        { id: "sun", label: cproj.title.toUpperCase() },
        ...planets.map((p) => ({ id: p.id, label: p.label })),
    ];
    for (const [i, c] of chapItems.entries()) {
        const li = htmlEl("li", { class: "sys-chaps__li" });
        const btn = htmlEl("button", {
            type: "button",
            class: "sys-chaps__item",
            "data-chap": c.id,
            text: `${String(i + 1).padStart(2, "0")}  ${c.label}`,
        });
        li.append(btn);
        chapNav.append(li);
        chapBtns.push(btn);
    }
    chapBtns[0]?.classList.add("is-on");
    function placeRow(k, x, y, gap) {
        const li = chapBtns[k]?.parentElement;
        if (li) setStyle(li, "transform", `translate(${(x - 14).toFixed(1)}px, ${(y - gap / 2).toFixed(1)}px)`);
    }
    chapNav.style.setProperty("--n", String(chapItems.length));
    chapNav.dataset.n = String(chapItems.length);
    const titleEl = htmlEl("h1", { class: "sys__title", text: cproj.title });
    stage.append(svg, veil, titleEl, sunBtn, backBtn, chapNav, hint);
    document.body.append(stage);

    const dock = htmlEl("aside", {
        class: "sys-dock",
        "aria-label": `${cproj.title} dossier`,
        "aria-hidden": "true",
    });
    dock.inert = true;
    // Story runs 0 → 1 (free system → TOC); the chapters themselves are one continuous scroll.
    const storyMax = 1;
    const plateHTML = (id, body) => `<section class="sys-dock__plate" data-plate="${esc(id)}">${body}</section>`;
    dock.innerHTML = [
        plateHTML("sun", sunDossierHTML(project)),
        ...planets.map((p, i) => plateHTML(p.id, chapters.length
            ? chapterDossierHTML(chapters[i], i)
            : planetDossierHTML(project, p, attrOf.get(p.id), i))),
    ].join("");
    document.body.append(dock);
    // Gallery rows split their width by each image's aspect ratio, so every image in a row
    // shares one height and the row fills the column without cropping.
    const fitRowImage = (img) => {
        if (img.naturalWidth && img.naturalHeight) {
            img.style.setProperty("--ar", (img.naturalWidth / img.naturalHeight).toFixed(4));
        }
    };
    dock.addEventListener("load", (e) => {
        if (e.target.matches?.(".sys-dock__row img")) fitRowImage(e.target);
    }, true);
    for (const img of dock.querySelectorAll(".sys-dock__row img")) if (img.complete) fitRowImage(img);
    const plateEls = [...dock.querySelectorAll("[data-plate]")];
    let plateId = "sun";
    let pendingPlate = null;

    function setPlate(id) {
        if (id === plateId) return;
        plateId = id;
        for (const b of chapBtns) b.classList.toggle("is-on", b.dataset.chap === id);
    }

    // The chapter whose top has passed a line 30% down the dock; the last one once the end is reached.
    function plateFromScroll() {
        if (dock.scrollTop + dock.clientHeight >= dock.scrollHeight - 2) return plateEls.at(-1).dataset.plate;
        const line = dock.scrollTop + dock.clientHeight * 0.3;
        let id = "sun";
        for (const el of plateEls) if (el.offsetTop <= line) id = el.dataset.plate;
        return id;
    }

    function scrollToPlate(id, smooth) {
        const el = plateEls.find((p) => p.dataset.plate === id);
        const top = el && id !== "sun" ? el.offsetTop - parseFloat(getComputedStyle(dock).paddingTop) : 0;
        dock.scrollTo({ top, behavior: smooth && !reduce ? "smooth" : "auto" });
        setPlate(id);
    }

    dock.addEventListener("scroll", () => { if (reading) setPlate(plateFromScroll()); }, { passive: true });

    let reading = false;
    let readAmt = 0;
    let story = 0;
    let storyTgt = 0;
    let viewX = 0.5;
    let viewXTgt = 0.5;
    let viewY = 0.5;
    let viewYTgt = 0.5;
    let camTween = null;

    let W = 0, H = 0, focal = 1;
    const layout = new Map();

    // Camera basis, recomputed only when the camera moves (project3 runs ~800× a frame).
    const cam = { elev: NaN, azim: NaN, dist: NaN };
    function camBasis() {
        if (cam.elev === elevView && cam.azim === azim && cam.dist === dist) return cam;
        const ce = Math.cos(elevView), se = Math.sin(elevView);
        const ca = Math.cos(azim), sa = Math.sin(azim);
        const camX = sa * ce * dist;
        const camY = se * dist;
        const camZ = ca * ce * dist;
        let fx = -camX, fy = -camY, fz = -camZ;
        const fl = Math.hypot(fx, fy, fz) || 1;
        fx /= fl; fy /= fl; fz /= fl;
        let rx = -fz, ry = 0, rz = fx;
        const rl = Math.hypot(rx, ry, rz) || 1;
        rx /= rl; ry /= rl; rz /= rl;
        Object.assign(cam, {
            elev: elevView, azim, dist, camX, camY, camZ, fx, fy, fz, rx, ry, rz,
            ux: ry * fz - rz * fy,
            uy: rz * fx - rx * fz,
            uz: rx * fy - ry * fx,
        });
        return cam;
    }

    function project3(x, y, z) {
        const { camX, camY, camZ, fx, fy, fz, rx, ry, rz, ux, uy, uz } = camBasis();
        const vx = x - camX, vy = y - camY, vz = z - camZ;
        const sx = vx * rx + vy * ry + vz * rz;
        const sy = vx * ux + vy * uy + vz * uz;
        const sz = vx * fx + vy * fy + vz * fz;
        if (sz < 0.1) return null;
        return {
            x: W * viewX + (sx * focal) / sz,
            y: H * viewY - (sy * focal) / sz,
            s: focal / sz,
            z: sz,
        };
    }

    // Point-wise blend from the projected orbit to a flat TOC circle of radius R around the sun.
    // Matching by orbit parameter (not screen angle) keeps every in-between shape an ellipse.
    function orbitPath(r, sun, R, u) {
        let d = "";
        let first = true;
        for (let i = 0; i <= ORBIT_SAMPLES; i++) {
            const a = (i / ORBIT_SAMPLES) * Math.PI * 2;
            const p = project3(Math.cos(a) * r, 0, Math.sin(a) * r);
            if (!p) continue;
            const psi = a + azim;
            const q = {
                x: lerp(p.x, sun.x + Math.cos(psi) * R, u),
                y: lerp(p.y, sun.y + Math.sin(psi) * R, u),
            };
            d += `${first ? "M" : "L"}${q.x.toFixed(1)} ${q.y.toFixed(1)} `;
            first = false;
        }
        return d + "Z";
    }

    const textCtx = document.createElement("canvas").getContext("2d");
    let sunLabelFit = cproj.title.toUpperCase();
    // Width of a TOC label as drawn in reading mode: 12px mono with 0.1em tracking.
    function readingLabelW(text) {
        textCtx.font = `400 12px ${getComputedStyle(planetEls[0]?.label ?? sunLabel).fontFamily}`;
        return textCtx.measureText(text).width + text.length * 1.2;
    }
    function fitLabel(text, prefix, maxW) {
        if (readingLabelW(prefix + text) <= maxW) return text;
        let s = text;
        while (s.length > 1 && readingLabelW(`${prefix}${s}…`) > maxW) s = s.slice(0, -1);
        return `${s.trimEnd()}…`;
    }

    function measure() {
        W = stage.clientWidth || window.innerWidth;
        H = stage.clientHeight || window.innerHeight;
        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        focal = Math.min(W, H) * 0.78;
        const n = planetEls.length;
        const crowded = clamp((n - 4) / 3, 0, 1);
        const r0 = lerp(0.78, 0.56, crowded);
        const r1 = lerp(1.72, 1.14, crowded);
        for (const [i, p] of planetEls.entries()) {
            const byWeight = r0 + (r1 - r0) * (0.1 + (1 - p.weight) * 0.9);
            const t = n <= 1 ? 0 : i / (n - 1);
            const byIndex = r0 + (r1 - r0) * t;
            const orbitR = lerp(byWeight, byIndex, crowded);
            const period = 90000 * (orbitR / Math.max(0.4, r0)) ** 1.5;
            layout.set(p.id, { orbitR, period });
        }
        const toc = tocGeom();
        setStyle(chapNav, "--toc-gap", `${toc.gap}px`);
        if (W >= 720) {
            // Past DOCK_MAX the box stops growing and centres in the space right of the TOC,
            // so wide screens don't leave an empty strip inside it.
            // Keep the box clear of the widest reading label; the focused planet is drawn at HILITE
            // scale. Past 42% of the width the box stops yielding and long labels get an ellipsis.
            const prefix = "00\u2003";
            const sunX = 24;
            const planetX = 24 * HILITE;
            let need = toc.x + sunX + readingLabelW(prefix + cproj.title.toUpperCase());
            for (const p of planetEls) need = Math.max(need, toc.x + planetX + readingLabelW(prefix + p.label0) * HILITE);
            const left0 = Math.max(300, toc.x + toc.n * toc.gap + 72, Math.min(need + 32, W * 0.42));
            const room = left0 - 32 - toc.x;
            sunLabelFit = fitLabel(cproj.title.toUpperCase(), prefix, room - sunX);
            for (const p of planetEls) p.labelFit = fitLabel(p.label0, prefix, (room - planetX) / HILITE);
            if (reading) numberLabels(true);
            const avail = W - left0 - DOCK_EDGE;
            const width = Math.min(avail, DOCK_MAX);
            const left = Math.round(left0 + (avail - width) / 2);
            dock.style.left = `${left}px`;
            dock.style.right = `${Math.round(W - left - width)}px`;
        } else {
            dock.style.left = "";
            dock.style.right = "";
            sunLabelFit = cproj.title.toUpperCase();
            for (const p of planetEls) p.labelFit = null;
            if (reading) numberLabels(true);
        }
        applyFraming();
    }

    // Top-view TOC: sun on the left, planet i on a circle of radius (i + 1) · unit.
    // `gap` is the fully zoomed-out spacing, used only to place the dock.
    function tocGeom() {
        const split = W >= 720;
        const n = Math.max(1, planetEls.length);
        const top = split ? 140 : 100;
        const bottom = split ? H - 48 : H * 0.56 - 12;
        const gap = clamp((bottom - top) / n, 12, 44);
        return { x: split ? 64 : 40, y: top, floor: split ? H : H * 0.56, gap, n };
    }

    // Unit radius spacing every chapter down the column, with one empty slot left below the floor.
    function tocUnit(toc) {
        return (toc.floor + TOC_OFFSCREEN - toc.y) / (toc.n + 1);
    }

    let azim = 0;
    let elev = ELEV;
    let elevView = ELEV;
    let dist = CAM_DIST;
    let distTgt = CAM_DIST;
    let zoom = 1;
    let zoomTgt = 1;
    let guiding = true;
    function dismissGuide() {
        if (!guiding) return;
        guiding = false;
        stage.classList.remove("is-awaiting");
    }
    function offerGuide() {
        if (!guiding || reading) return;
        stage.classList.add("is-awaiting");
    }
    let dragging = false;
    let dragPx = 0;
    let lastX = 0;
    let lastY = 0;

    let hoverIdx = -1;
    stage.addEventListener("pointerleave", () => { hoverIdx = -1; });

    // Label boxes are read at most once per frame, not once per pointermove per planet.
    let frameNo = 0;
    let rectsAt = -1;
    let labelRects = [];
    function hitPlanet(cx, cy) {
        if (rectsAt !== frameNo) {
            labelRects = planetEls.map((p) => p.label.getBoundingClientRect());
            rectsAt = frameNo;
        }
        const s = stage.getBoundingClientRect();
        const px = cx - s.left;
        const py = cy - s.top;
        let best = -1;
        let bestD = 16;
        for (const [i, p] of planetEls.entries()) {
            if (p.sx == null) continue;
            const d = Math.hypot(px - p.sx, py - p.sy);
            if (d < bestD) { best = i; bestD = d; }
            const b = labelRects[i];
            if (best !== i && cx >= b.left - 4 && cx <= b.right + 4 && cy >= b.top - 4 && cy <= b.bottom + 4) {
                best = i;
                bestD = 0;
            }
        }
        return best;
    }

    function hitSun(cx, cy) {
        const b = sunBtn.getBoundingClientRect();
        return cx >= b.left && cx <= b.right && cy >= b.top && cy <= b.bottom;
    }

    function framing(s) {
        const sunU = easeInOutCubic(clamp(s, 0, 1));
        const toc = tocGeom();
        return {
            viewX: lerp(0.5, toc.x / Math.max(1, W), sunU),
            viewY: lerp(0.5, toc.y / Math.max(1, H), sunU),
            dist: lerp(CAM_DIST * zoom, DIST_TOC, sunU),
        };
    }

    function applyFraming() {
        const f = framing(story);
        viewXTgt = f.viewX;
        viewYTgt = f.viewY;
        distTgt = f.dist;
        if (reduce) {
            viewX = viewXTgt;
            viewY = viewYTgt;
            dist = distTgt;
            readAmt = clamp(story, 0, 1);
        }
    }

    function startCamTween(ms, to) {
        storyTgt = to;
        const span = Math.abs(to - story);
        const dur = ms * clamp(0.7 + span * 0.35, 0.7, 2.1);
        if (reduce) {
            camTween = null;
            story = to;
            applyFraming();
            syncReading();
            return;
        }
        camTween = {
            t0: performance.now(),
            dur,
            from: story,
            to,
        };
    }

    function syncReading() {
        if (storyTgt >= STORY_OPEN && !reading) openSun();
        else if (storyTgt <= STORY_CLOSE && reading) closeSun();
    }

    function numberLabels(on) {
        const tag = (i) => (on ? `${String(i + 1).padStart(2, "0")}\u2003` : "");
        sunLabel.textContent = tag(0) + (on ? sunLabelFit : cproj.title.toUpperCase());
        for (const [i, p] of planetEls.entries()) p.label.textContent = tag(i + 1) + (on ? p.labelFit ?? p.label0 : p.label0);
    }

    function openSun() {
        if (reading) return;
        reading = true;
        numberLabels(true);
        dock.inert = false;
        dock.setAttribute("aria-hidden", "false");
        sunBtn.setAttribute("aria-expanded", "true");
        dock.classList.add("is-open");
        stage.classList.add("is-reading");
        document.body.classList.add("is-reading-sun");
        sunG.classList.add("is-focus");
        backBtn.setAttribute("aria-hidden", "false");
        backBtn.tabIndex = 0;
        scrollToPlate(pendingPlate || "sun", false);
        pendingPlate = null;
        if (reduce) {
            dock.style.opacity = "1";
            dock.style.visibility = "visible";
            dock.style.transform = "none";
            dock.style.pointerEvents = "auto";
        }
    }

    function closeSun() {
        if (!reading) return;
        reading = false;
        numberLabels(false);
        dock.scrollTop = 0;
        dock.classList.remove("is-open");
        stage.classList.remove("is-reading", "is-over-sun");
        document.body.classList.remove("is-reading-sun");
        sunG.classList.remove("is-focus");
        sunBtn.setAttribute("aria-expanded", "false");
        dock.inert = true;
        dock.setAttribute("aria-hidden", "true");
        backBtn.setAttribute("aria-hidden", "true");
        backBtn.tabIndex = -1;
        if (reduce) {
            dock.style.opacity = "";
            dock.style.visibility = "";
            dock.style.transform = "";
            dock.style.pointerEvents = "";
        }
        if (guiding) offerGuide();
    }

    function goRead() {
        startCamTween(CAM_OPEN_MS, 1);
        syncReading();
    }

    function goSystem() {
        dock.scrollTop = 0;
        setPlate("sun");
        startCamTween(CAM_CLOSE_MS * 1.3, 0);
        syncReading();
    }

    for (const btn of chapBtns) {
        btn.addEventListener("pointerdown", (e) => e.stopPropagation());
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            dismissGuide();
            goPlate(btn.dataset.chap);
        });
    }

    // Inside the TOC a chapter is a scroll target; from the free system it opens the TOC there.
    function goPlate(id) {
        if (reading) {
            scrollToPlate(id, true);
            return;
        }
        pendingPlate = id;
        startCamTween(CAM_OPEN_MS, 1);
        syncReading();
    }

    function goChapter(i) {
        if (i < 0) return;
        dismissGuide();
        goPlate(planets[i].id);
    }

    dock.addEventListener("pointerdown", (e) => e.stopPropagation());
    backBtn.addEventListener("pointerdown", (e) => e.stopPropagation());
    backBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        goSystem();
    });
    sunBtn.addEventListener("pointerdown", (e) => e.stopPropagation());
    sunBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (storyTgt < 1) goRead();
    });
    const lightbox = htmlEl("div", {
        class: "sys-lightbox", role: "dialog", "aria-modal": "true", "aria-label": "Image viewer", hidden: "",
    });
    lightbox.innerHTML = `<button type="button" class="sys-lightbox__btn sys-lightbox__close" aria-label="Close">×</button>
        <button type="button" class="sys-lightbox__btn sys-lightbox__prev" aria-label="Previous image">‹</button>
        <figure class="sys-lightbox__fig"><img alt=""><figcaption></figcaption></figure>
        <button type="button" class="sys-lightbox__btn sys-lightbox__next" aria-label="Next image">›</button>
        <p class="sys-lightbox__count"></p>`;
    document.body.appendChild(lightbox);
    const lbImg = lightbox.querySelector("img");
    const lbCap = lightbox.querySelector("figcaption");
    const lbCount = lightbox.querySelector(".sys-lightbox__count");
    let lbList = [];
    let lbIdx = -1;
    const lbOpen = () => lbIdx >= 0;
    function lbShow(i) {
        lbIdx = (i + lbList.length) % lbList.length;
        const img = lbList[lbIdx];
        lbImg.src = img.currentSrc || img.src;
        lbImg.alt = img.alt;
        lbCap.textContent = img.closest("figure")?.querySelector("figcaption")?.textContent || img.alt || "";
        lbCount.textContent = lbList.length > 1 ? `${lbIdx + 1} / ${lbList.length}` : "";
        lightbox.classList.toggle("is-single", lbList.length < 2);
    }
    function lbClose() {
        lbIdx = -1;
        lightbox.hidden = true;
        lbImg.removeAttribute("src");
    }
    dock.addEventListener("click", (e) => {
        const img = e.target.closest?.("img");
        if (!img || !dock.contains(img)) return;
        lbList = [...dock.querySelectorAll("img")];
        lightbox.hidden = false;
        lbShow(lbList.indexOf(img));
        lightbox.querySelector(".sys-lightbox__close").focus({ preventScroll: true });
    });
    lightbox.addEventListener("click", (e) => {
        if (e.target.closest(".sys-lightbox__prev")) lbShow(lbIdx - 1);
        else if (e.target.closest(".sys-lightbox__next")) lbShow(lbIdx + 1);
        else if (!e.target.closest(".sys-lightbox__fig img")) lbClose();
    });

    // Capture phase, so the page-level "Escape goes home" handler sees defaultPrevented.
    document.addEventListener("keydown", (e) => {
        if (lbOpen()) {
            if (e.key === "Escape") lbClose();
            else if (e.key === "ArrowLeft") lbShow(lbIdx - 1);
            else if (e.key === "ArrowRight") lbShow(lbIdx + 1);
            else return;
            e.preventDefault();
            return;
        }
        if (e.key === "Escape" && (reading || storyTgt > 0)) {
            e.preventDefault();
            goSystem();
        }
    }, true);

    stage.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        if (e.target.closest?.(".sys-dock")) return;
        dragging = true;
        dragPx = 0;
        lastX = e.clientX;
        lastY = e.clientY;
        try { stage.setPointerCapture(e.pointerId); } catch { /* capture optional */ }
    });
    stage.addEventListener("pointermove", (e) => {
        if (!dragging) {
            hoverIdx = storyTgt < STORY_OPEN ? hitPlanet(e.clientX, e.clientY) : -1;
            stage.classList.toggle("is-over-sun", storyTgt < STORY_OPEN
                && (hoverIdx >= 0 || hitSun(e.clientX, e.clientY)));
            return;
        }
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        dragPx += Math.hypot(dx, dy);
        lastX = e.clientX;
        lastY = e.clientY;
        if (dragPx < CLICK_PX) return;
        stage.classList.add("is-orbiting");
        azim -= (dx / Math.max(1, W)) * Math.PI * 2.1;
        elev = clamp(elev + (dy / Math.max(1, H)) * Math.PI, 0.08, 1.48);
    });
    const endDrag = (e) => {
        if (!dragging) return;
        dragging = false;
        stage.classList.remove("is-orbiting");
        try { stage.releasePointerCapture(e.pointerId); } catch { /* already released */ }
        if (dragPx < CLICK_PX && storyTgt < STORY_OPEN) {
            const i = hitPlanet(e.clientX, e.clientY);
            if (i >= 0) goChapter(i);
            else if (hitSun(e.clientX, e.clientY)) goRead();
        }
    };
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);
    window.addEventListener("wheel", (e) => {
        if (e.ctrlKey) return;
        if (lbOpen()) {
            e.preventDefault();
            return;
        }
        const dy = e.deltaY * (e.deltaMode === 1 ? 16 : 1);
        // Reading: the wheel scrolls the dossier anywhere on the page; pulling past its top
        // (or pushing back while the TOC is still opening) drives the camera instead.
        if (reading && !(dy < 0 && dock.scrollTop <= 0) && !(dy > 0 && storyTgt < 1)) {
            if (dock.contains(e.target)) return;
            e.preventDefault();
            dock.scrollTop += dy;
            return;
        }
        e.preventDefault();
        dismissGuide();
        if (storyTgt <= 0 && !camTween && (dy < 0 || zoomTgt < 1 || zoom < 0.99)) {
            zoomTgt = clamp(zoomTgt * Math.exp(dy * ZOOM_RATE), ZOOM_MIN, 1);
            return;
        }
        camTween = null;
        storyTgt = clamp(storyTgt + dy / STORY_SPAN, 0, storyMax);
        syncReading();
    }, { passive: false });

    const t0 = performance.now();
    let raf = 0;
    let lastFrame = t0;
    let bodyOrder = [];
    function frame(now) {
        frameNo++;
        const t = (now - t0) / 1000;
        const dt = Math.min(0.05, (now - lastFrame) / 1000);
        lastFrame = now;
        if (camTween) {
            const u = easeInOutSlow((now - camTween.t0) / camTween.dur);
            story = lerp(camTween.from, camTween.to, u);
            storyTgt = camTween.to;
            if (u >= 1) {
                story = camTween.to;
                camTween = null;
            }
        } else if (reduce) {
            story = storyTgt;
        } else if (Math.abs(storyTgt - story) > 0.0008) {
            story += (storyTgt - story) * (1 - Math.exp(-dt / 0.22));
        } else {
            story = storyTgt;
        }
        readAmt = clamp(story, 0, 1);
        if (storyTgt > 0) zoomTgt = 1;
        zoom = reduce ? zoomTgt : zoom + (zoomTgt - zoom) * (1 - Math.exp(-dt / 0.18));
        const f = framing(story);
        const kCam = 1 - Math.exp(-dt / 0.16);
        viewX += (f.viewX - viewX) * kCam;
        viewY += (f.viewY - viewY) * kCam;
        dist += (f.dist - dist) * kCam;
        syncReading();

        const tocU = easeInOutCubic(readAmt);
        const toc = tocGeom();
        elevView = lerp(elev, TOP_ELEV, tocU);
        const sunP = project3(0, 0, 0);
        if (!sunP) { raf = requestAnimationFrame(frame); return; }

        const unit = tocUnit(toc);
        const rowH = Math.min(unit, 56);
        setStyle(chapNav, "--toc-gap", `${rowH.toFixed(1)}px`);

        const refS = focal / CAM_DIST;
        const bodyRSys = 16 * (sunP.s / Math.max(1e-6, refS));
        const bodyR = lerp(bodyRSys, 10, tocU);
        const css = bodyR * 2 * SUN_GLOW;
        const px = Math.round(clamp(
            css * Math.min(2, window.devicePixelRatio || 1),
            72 + 48 * readAmt,
            264,
        ));
        if (sunCanvas.width !== px) {
            sunCanvas.width = px;
            sunCanvas.height = px;
        }
        const spin = reduce ? 0.35 : -t * sunSpin;
        if (!sunRas || sunRas.n !== px) sunRas = sunRaster(px, sunTex);
        const nextSunKey = `${px}|${spin}|${azim}|${elevView}`;
        if (nextSunKey !== sunKey) {
            sunKey = nextSunKey;
            paintSun(sunCtx, sunRas, sunTex, spin, azim, elevView);
        }
        setAttr(sunG, "transform", `translate(${sunP.x.toFixed(2)} ${sunP.y.toFixed(2)})`);
        setAttr(sunFo, "x", (-css / 2).toFixed(1));
        setAttr(sunFo, "y", (-css / 2).toFixed(1));
        setAttr(sunFo, "width", css.toFixed(1));
        setAttr(sunFo, "height", css.toFixed(1));
        setAttr(sunLimb, "r", bodyR.toFixed(2));
        setAttr(sunHit, "r", Math.max(22, bodyR + 12).toFixed(2));
        setAttr(sunLabel, "x", (bodyR + lerp(10, 14, tocU)).toFixed(1));
        setStyle(sunLabel, "opacity", (clamp((tocU - 0.5) / 0.5, 0, 1) * (plateId === "sun" ? 1 : 0.62)).toFixed(3));
        setStyle(titleEl, "opacity", (1 - clamp(tocU / 0.5, 0, 1)).toFixed(3));
        const btnW = Math.max(118, bodyR * 2 + 88);
        const btnH = Math.max(36, bodyR * 2 + 10);
        setStyle(sunBtn, "width", `${btnW}px`);
        setStyle(sunBtn, "height", `${btnH}px`);
        setStyle(sunBtn, "transform", `translate(${(sunP.x - bodyR - 4).toFixed(1)}px, ${(sunP.y - btnH / 2).toFixed(1)}px)`);

        const bodies = [{ z: sunP.z, el: sunG }];
        let stackY = sunP.y;
        placeRow(0, sunP.x, sunP.y, rowH);

        for (let i = 0; i < planetEls.length; i++) {
            const p = planetEls[i];
            const L = layout.get(p.id);
            if (!L) continue;
            const ang = p.ang0 + (reduce ? 0 : (now - t0) / L.period * Math.PI * 2);
            const pt = project3(Math.cos(ang) * L.orbitR, 0, Math.sin(ang) * L.orbitR);
            const R = (i + 1) * unit;
            // The ellipse only changes with the camera, the sun or the TOC blend.
            const orbitKey = `${cam.elev}|${cam.azim}|${cam.dist}|${W}|${H}|${viewX}|${viewY}|${focal}|${L.orbitR}|${R}|${tocU}`;
            if (orbitKey !== p.orbitKey) {
                p.orbitKey = orbitKey;
                setAttr(p.orbit, "d", orbitPath(L.orbitR, sunP, R, tocU));
            }
            if (!pt) continue;
            // The whole system lines up at once: every planet settles at the bottom of its circle.
            const thFree = Math.atan2(pt.y - sunP.y, pt.x - sunP.x);
            const th = lerpAngShort(thFree, Math.PI / 2, tocU);
            const rho = lerp(Math.hypot(pt.x - sunP.x, pt.y - sunP.y), R, tocU);
            const x = sunP.x + Math.cos(th) * rho;
            const y = sunP.y + Math.sin(th) * rho;
            const sc = lerp(Math.max(0.45, Math.min(1.7, pt.s * 0.42)), 1.15, tocU);
            const active = reading && plateId === p.id;
            p.hl = (p.hl || 0) + ((active ? 1 : 0) - (p.hl || 0)) * (reduce ? 1 : kCam);
            const grow = 1 + (HILITE - 1) * p.hl * tocU;
            setAttr(p.g, "transform", `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${grow.toFixed(3)})`);
            setAttr(p.dot, "r", (p.rDot * sc).toFixed(2));
            p.g.classList.toggle("is-focus", active);
            p.g.classList.toggle("is-lock", tocU > 0.55);
            setStyle(p.g, "opacity", lerp(pt.z > sunP.z ? 0.55 : 1, 1, tocU).toFixed(3));
            setStyle(p.dot, "opacity", lerp(1, lerp(0.7, 1, p.hl), tocU).toFixed(3));
            setStyle(p.orbit, "opacity", lerp(1, lerp(0.1, 0.3, p.hl), tocU).toFixed(3));
            setStyle(p.label, "opacity", lerp(hoverIdx === i ? 1 : 0.35, lerp(0.8, 1, p.hl), tocU).toFixed(3));
            p.g.classList.toggle("is-hover", hoverIdx === i && tocU < 0.5);
            p.sx = x;
            p.sy = y;
            setAttr(p.label, "x", lerp(12, 24, tocU).toFixed(1));
            setAttr(p.label, "y", "0");
            setAttr(p.label, "text-anchor", "start");
            stackY = Math.max(stackY, sunP.y + R);
            placeRow(i + 1, x, y, rowH);
            bodies.push({ z: lerp(pt.z, 0, tocU), el: p.g });
        }

        if (reading && tocU > 0.8) {
            setAttr(stackLine, "d", `M${sunP.x.toFixed(1)} ${sunP.y.toFixed(1)} L${sunP.x.toFixed(1)} ${stackY.toFixed(1)}`);
            setStyle(stackLine, "opacity", ((tocU - 0.8) / 0.2).toFixed(3));
        } else {
            setStyle(stackLine, "opacity", "0");
        }

        // Re-stack by depth only when the order actually changes.
        bodies.sort((a, b) => b.z - a.z);
        if (bodies.length !== bodyOrder.length || bodies.some((b, i) => b.el !== bodyOrder[i])) {
            bodyOrder = bodies.map((b) => b.el);
            for (const el of bodyOrder) bodiesG.append(el);
        }

        // Dust positions follow the camera only while it is dragged; the twinkle runs every frame.
        const parx = azim * 26;
        const pary = (elev - ELEV) * -38;
        const nextDustKey = `${parx}|${pary}|${W}|${H}`;
        const dustMoved = nextDustKey !== dustKey;
        dustKey = nextDustKey;
        for (const d of dust) {
            if (dustMoved) {
                d.el.setAttribute("cx", (d.nx * W + parx).toFixed(1));
                d.el.setAttribute("cy", (d.ny * H + pary).toFixed(1));
                if (!d.sized) {
                    d.el.setAttribute("r", d.r.toFixed(2));
                    d.sized = true;
                }
            }
            const tw = 0.7 + 0.3 * Math.sin(t * d.tws + d.tw);
            d.el.setAttribute("opacity", (d.o * tw * (1 - 0.45 * readAmt)).toFixed(3));
        }
        raf = requestAnimationFrame(frame);
    }

    measure();
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    raf = requestAnimationFrame(frame);

    if (arriving && !reduce) {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                document.body.classList.add("is-system-settled");
                document.documentElement.classList.remove("is-warp-arrive");
            });
        });
        setTimeout(offerGuide, 1500);
    } else {
        document.body.classList.add("is-system-settled");
        document.documentElement.classList.remove("is-warp-arrive");
        setTimeout(offerGuide, reduce ? 0 : 700);
    }
}

boot();
