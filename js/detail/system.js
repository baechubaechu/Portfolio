/**
 * Arrival system.
 *
 * Warp drops you into this project's own system: the project is the sun,
 * its real attributes are the planets. Orbits live on a plane and are
 * drawn in perspective (a slightly elevated look, not a floor-plan).
 */

import { portfolio } from "../constellation/data/portfolio.js?v=2.2";
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
const STORY_OPEN = 0.56;
const STORY_CLOSE = 0.4;

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

function planetLock(s, i) {
    return easeInOutCubic(clamp(s - 1 - i, 0, 1));
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
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    const img = ctx.createImageData(w, h);
    const px = img.data;
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
    ctx.putImageData(img, 0, 0);
    return { data: px, w, h, glow: look.glow ?? hi };
}

function sampleSun(tex, u, v) {
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
    const mix = (a, b, t) => a + (b - a) * t;
    return [
        mix(mix(data[i00], data[i10], fx), mix(data[i01], data[i11], fx), fy),
        mix(mix(data[i00 + 1], data[i10 + 1], fx), mix(data[i01 + 1], data[i11 + 1], fx), fy),
        mix(mix(data[i00 + 2], data[i10 + 2], fx), mix(data[i01 + 2], data[i11 + 2], fx), fy),
    ];
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

function paintSun(canvas, tex, spin, azim, elev) {
    const n = canvas.width;
    const ctx = canvas.getContext("2d", { alpha: true });
    const img = ctx.createImageData(n, n);
    const px = img.data;
    const cx = (n - 1) * 0.5;
    const disc = n / (2 * SUN_GLOW);
    const inv = 1 / disc;
    const { fx, fy, fz, rx, ry, rz, ux, uy, uz } = lookBasis(azim, elev);
    const tx = -fx, ty = -fy, tz = -fz;
    const cs = Math.cos(-spin);
    const ss = Math.sin(-spin);
    for (let y = 0; y < n; y++) {
        const ny = (y - cx) * inv;
        for (let x = 0; x < n; x++) {
            const nx = (x - cx) * inv;
            const rr = nx * nx + ny * ny;
            const i = (y * n + x) * 4;
            if (rr > 1) {
                const g = Math.exp(-(Math.sqrt(rr) - 1) * 2.5) * 0.28;
                const glow = tex.glow || [255, 252, 242];
                px[i] = glow[0] * g;
                px[i + 1] = glow[1] * g;
                px[i + 2] = glow[2] * g;
                px[i + 3] = 255 * g;
                continue;
            }
            const nz = Math.sqrt(1 - rr);
            const wx = nx * rx - ny * ux + nz * tx;
            const wy = nx * ry - ny * uy + nz * ty;
            const wz = nx * rz - ny * uz + nz * tz;
            const lx = wx * cs + wz * ss;
            const lz = -wx * ss + wz * cs;
            const lon = Math.atan2(lx, lz);
            const lat = Math.asin(clamp(wy, -1, 1));
            const col = sampleSun(tex, lon / (Math.PI * 2) + 0.5, 0.5 - lat / Math.PI);
            const limb = 0.7 + 0.3 * Math.pow(nz, 0.65);
            px[i] = Math.min(255, col[0] * limb);
            px[i + 1] = Math.min(255, col[1] * limb);
            px[i + 2] = Math.min(255, col[2] * limb);
            px[i + 3] = 255;
        }
    }
    ctx.putImageData(img, 0, 0);
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

function sunDossierHTML(project, total) {
    const sections = project.sections ?? [];
    const meta = sections.find((s) => s.type === "hero-meta") ?? {};
    const comp = sections.find((s) => s.type === "arch-competition-info") ?? {};
    const panel = sections.find((s) => s.type === "arch-panel") ?? {};
    const concept = sections.find((s) => s.type === "arch-concept") ?? {};
    const split = sections.find((s) => s.type === "split-content") ?? {};
    const gallery = sections.find((s) => s.type === "dev-frontend-gallery" || s.type === "arch-renders") ?? {};
    const narrative = sections.find((s) => s.type === "text-full") ?? {};
    const quote = meta.subtitle || split.leadText || "";
    const thesis = project.thesis || lastParagraph(narrative.content) || split.description || concept.description || project.description || "";
    const of = String(Math.max(1, total || 1)).padStart(2, "0");
    const kind = project.kind || "Project";
    const kindShown = String(meta.category || "").toLowerCase().startsWith(kind.toLowerCase()) ? null : kind;
    const kicker = [`01 / ${of}`, kindShown, meta.category, meta.timeline].filter(Boolean).join("  ·  ");
    const links = [
        project.githubLink && { label: "GitHub", url: project.githubLink },
        project.visitLink && { label: "Live", url: project.visitLink },
    ].filter(Boolean);
    const rows = [
        meta.role && ["Role", plain(meta.role)],
        comp.organizer && ["Organizer", comp.organizer],
        comp.team && ["Team", comp.team],
    ].filter(Boolean);
    const img = panel.image || firstImage(concept) || firstImage(split) || firstImage(gallery) || project.thumbnail || "";
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

function planetDossierHTML(project, planet, attr, idx, total) {
    const cited = (project.sections ?? []).filter((s) => (s.spine ?? []).includes(planet.id));
    const concept = cited.find((s) => s.type === "arch-concept");
    const pick = concept
        || cited.find((s) => s.description || s.leadText || s.content || s.caption || s.techs || firstImage(s))
        || {};
    const narrative = cited.find((s) => s.type === "text-full");
    const name = attr?.label || planet.label;
    const n = String((idx ?? 0) + 2).padStart(2, "0");
    const of = String(total || 2).padStart(2, "0");
    const kicker = `${n} / ${of}  ·  ${name}`;
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
            return `<p class="sys-dock__thesis">${esc(b.body)}</p>`;
        case "list":
            return `<ul class="sys-dock__list">${b.items.map((it) => `<li>${esc(it)}</li>`).join("")}</ul>`;
        case "steps":
            return `<ol class="sys-dock__list sys-dock__list--steps">${b.items.map((it) => `<li>${esc(it)}</li>`).join("")}</ol>`;
        case "rules":
            return `<dl class="sys-dock__rules">${b.items.map(([k, v]) =>
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
        case "gallery":
            return `<div class="sys-dock__gallery">${b.images.map((im) =>
                `<img src="${esc(im.url || im)}" alt="${esc(im.caption || "")}" loading="lazy">`).join("")}</div>`;
        case "links":
            return `<p class="sys-dock__links">${b.items.map((l) =>
                `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join("")}</p>`;
        case "note":
            return `<p class="sys-dock__note">${esc(b.body)}</p>`;
        default:
            return "";
    }
}

function chapterDossierHTML(chapter, idx, total) {
    const n = String(idx + 2).padStart(2, "0");
    const of = String(total || 2).padStart(2, "0");
    return `
        <p class="sys-dock__kicker">${esc(`${n} / ${of}  ·  ${chapter.label}`)}</p>
        <h2 class="sys-dock__title">${esc(String(chapter.title || chapter.label).toUpperCase())}</h2>
        ${chapter.lead ? `<p class="sys-dock__quote">${esc(chapter.lead)}</p>` : ""}
        ${(chapter.blocks ?? []).map(blockHTML).join("")}
    `;
}

window.__systemHref = (id) => {
    const q = portfolio.projects.find((p) => p.detailId === id || p.id === id);
    return q?.href || null;
};

function boot() {
    if (window.__detailProject) init(window.__detailProject);
    else document.addEventListener("detail:system", (e) => init(e.detail.project), { once: true });
}

function init(project) {
    if (document.querySelector("[data-system]")) return;
    const cproj = portfolio.projects.find((q) => q.detailId === project.id || q.id === project.id);
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
        dust.push({
            el,
            nx: rand() * 1.4 - 0.2,
            ny: rand() * 1.4 - 0.2,
            r: bright ? 0.5 + rand() * 0.65 : 0.22 + rand() ** 2 * 0.45,
            o: bright ? 0.38 + rand() * 0.32 : 0.14 + rand() * 0.24,
            tw: rand() * Math.PI * 2,
            tws: 0.2 + rand() * 0.65,
        });
    }

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
        if (li) li.style.transform = `translate(${(x - 14).toFixed(1)}px, ${(y - gap / 2).toFixed(1)}px)`;
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
    const storyMax = 1 + planets.length;
    dock.innerHTML = sunDossierHTML(project, storyMax);
    document.body.append(dock);
    const sunHTML = dock.innerHTML;
    const planetHTML = new Map(planets.map((p, i) => [
        p.id,
        chapters.length
            ? chapterDossierHTML(chapters[i], i, storyMax)
            : planetDossierHTML(project, p, attrOf.get(p.id), i, storyMax),
    ]));
    let plateId = "sun";
    let plateWant = "sun";
    let plateWait = 0;
    const ARRIVE = 0.88;
    const LEAVE = 0.45;

    function plateAt(s) {
        if (s <= 1 || !planets.length) return "sun";
        let id = "sun";
        for (let i = 0; i < planets.length; i++) {
            const lock = planetLock(s, i);
            const need = plateId === planets[i].id ? LEAVE : ARRIVE;
            if (lock >= need) id = planets[i].id;
        }
        return id;
    }

    function applyPlate(id) {
        if (id === plateId) return;
        plateId = id;
        plateWant = id;
        for (const b of chapBtns) b.classList.toggle("is-on", b.dataset.chap === id);
        dock.innerHTML = id === "sun" ? sunHTML : (planetHTML.get(id) || sunHTML);
        dock.scrollTop = 0;
        if (reduce || !dock.classList.contains("is-open")) return;
        dock.classList.remove("is-enter");
        void dock.offsetWidth;
        dock.classList.add("is-enter");
    }

    function showPlate(id, instant) {
        if (id === plateWant) return;
        plateWant = id;
        clearTimeout(plateWait);
        if (instant || reduce) {
            applyPlate(id);
            return;
        }
        plateWait = setTimeout(() => applyPlate(id), 200);
    }

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

    function project3(x, y, z) {
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
        const ux = ry * fz - rz * fy;
        const uy = rz * fx - rx * fz;
        const uz = rx * fy - ry * fx;
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

    // Radial blend from the projected orbit to a flat TOC circle of radius R around the sun.
    function orbitPath(r, sun, R, u) {
        let d = "";
        let first = true;
        for (let i = 0; i <= ORBIT_SAMPLES; i++) {
            const a = (i / ORBIT_SAMPLES) * Math.PI * 2;
            const p = project3(Math.cos(a) * r, 0, Math.sin(a) * r);
            if (!p) continue;
            const q = toward(p, sun, R, u);
            d += `${first ? "M" : "L"}${q.x.toFixed(1)} ${q.y.toFixed(1)} `;
            first = false;
        }
        return d + "Z";
    }

    function toward(p, sun, R, u) {
        const dx = p.x - sun.x;
        const dy = p.y - sun.y;
        const rho = lerp(Math.hypot(dx, dy), R, u);
        const th = Math.atan2(dy, dx);
        return { x: sun.x + Math.cos(th) * rho, y: sun.y + Math.sin(th) * rho };
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
        chapNav.style.setProperty("--toc-gap", `${toc.gap}px`);
        dock.style.left = W >= 720 ? `${Math.round(Math.max(300, toc.x + toc.n * toc.gap + 72))}px` : "";
        applyFraming();
    }

    // Top-view TOC: sun on the left, planet i parked on a circle of radius (i + 1) · gap.
    function tocGeom() {
        const split = W >= 720;
        const n = Math.max(1, planetEls.length);
        const top = split ? 140 : 100;
        const bottom = split ? H - 48 : H * 0.56 - 12;
        const gap = clamp((bottom - top) / n, 12, 44);
        return { x: split ? 64 : 40, y: top, gap, n };
    }

    let azim = 0;
    let elev = ELEV;
    let elevView = ELEV;
    let dist = CAM_DIST;
    let distTgt = CAM_DIST;
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

    function hitPlanet(cx, cy) {
        const s = stage.getBoundingClientRect();
        const px = cx - s.left;
        const py = cy - s.top;
        let best = -1;
        let bestD = 16;
        for (const [i, p] of planetEls.entries()) {
            if (p.sx == null) continue;
            const d = Math.hypot(px - p.sx, py - p.sy);
            if (d < bestD) { best = i; bestD = d; }
            const b = p.label.getBoundingClientRect();
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
            dist: lerp(CAM_DIST, DIST_TOC, sunU),
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
        sunLabel.textContent = tag(0) + cproj.title.toUpperCase();
        for (const [i, p] of planetEls.entries()) p.label.textContent = tag(i + 1) + p.label0;
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
        showPlate("sun", true);
        startCamTween(CAM_CLOSE_MS, 0);
        syncReading();
    }

    for (const btn of chapBtns) {
        btn.addEventListener("pointerdown", (e) => e.stopPropagation());
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = btn.dataset.chap;
            dismissGuide();
            if (id === "sun") {
                startCamTween(CAM_OPEN_MS, 1);
                syncReading();
            } else {
                goChapter(planets.findIndex((p) => p.id === id));
            }
        });
    }

    function goChapter(i) {
        if (i < 0) return;
        dismissGuide();
        startCamTween(CAM_OPEN_MS, 1 + i + 0.92);
        syncReading();
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
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && (reading || storyTgt > 0)) goSystem();
    });

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
        if (reading && dock.contains(e.target)) {
            const room = e.deltaY > 0
                ? dock.scrollHeight - dock.clientHeight - dock.scrollTop
                : dock.scrollTop;
            if (room > 1) return;
        }
        e.preventDefault();
        dismissGuide();
        camTween = null;
        const dy = e.deltaY;
        storyTgt = clamp(storyTgt + dy / STORY_SPAN, 0, storyMax);
        syncReading();
    }, { passive: false });

    const t0 = performance.now();
    let raf = 0;
    let lastFrame = t0;
    function frame(now) {
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
        const f = framing(story);
        const kCam = 1 - Math.exp(-dt / 0.16);
        viewX += (f.viewX - viewX) * kCam;
        viewY += (f.viewY - viewY) * kCam;
        dist += (f.dist - dist) * kCam;
        syncReading();
        if (reading) showPlate(plateAt(camTween && camTween.to > 1 ? camTween.to : story));

        const tocU = easeInOutCubic(readAmt);
        const toc = tocGeom();
        elevView = lerp(elev, TOP_ELEV, tocU);
        const sunP = project3(0, 0, 0);
        if (!sunP) { raf = requestAnimationFrame(frame); return; }

        const refS = focal / CAM_DIST;
        const bodyRSys = 16 * (sunP.s / Math.max(1e-6, refS));
        const bodyR = lerp(bodyRSys, 10, tocU);
        const css = bodyR * 2 * SUN_GLOW;
        const px = Math.round(clamp(
            css * Math.min(2, window.devicePixelRatio || 1),
            72 + 48 * readAmt,
            176,
        ));
        if (sunCanvas.width !== px) {
            sunCanvas.width = px;
            sunCanvas.height = px;
        }
        const spin = reduce ? 0.35 : -t * sunSpin;
        paintSun(sunCanvas, sunTex, spin, azim, elevView);
        sunG.setAttribute("transform", `translate(${sunP.x.toFixed(2)} ${sunP.y.toFixed(2)})`);
        sunFo.setAttribute("x", (-css / 2).toFixed(1));
        sunFo.setAttribute("y", (-css / 2).toFixed(1));
        sunFo.setAttribute("width", css.toFixed(1));
        sunFo.setAttribute("height", css.toFixed(1));
        sunLimb.setAttribute("r", bodyR.toFixed(2));
        sunHit.setAttribute("r", Math.max(22, bodyR + 12).toFixed(2));
        sunLabel.setAttribute("x", lerp(bodyR + 10, 24, tocU).toFixed(1));
        sunLabel.style.opacity = (clamp((tocU - 0.5) / 0.5, 0, 1) * (plateId === "sun" ? 1 : 0.62)).toFixed(3);
        titleEl.style.opacity = (1 - clamp(tocU / 0.5, 0, 1)).toFixed(3);
        const btnW = Math.max(118, bodyR * 2 + 88);
        const btnH = Math.max(36, bodyR * 2 + 10);
        sunBtn.style.width = `${btnW}px`;
        sunBtn.style.height = `${btnH}px`;
        sunBtn.style.transform = `translate(${(sunP.x - bodyR - 4).toFixed(1)}px, ${(sunP.y - btnH / 2).toFixed(1)}px)`;

        const bodies = [{ z: sunP.z, el: sunG }];
        let stackY = sunP.y;
        let stackOn = 0;
        placeRow(0, sunP.x, sunP.y, toc.gap);

        for (let i = 0; i < planetEls.length; i++) {
            const p = planetEls[i];
            const L = layout.get(p.id);
            if (!L) continue;
            const ang = p.ang0 + (reduce ? 0 : (now - t0) / L.period * Math.PI * 2);
            const pt = project3(Math.cos(ang) * L.orbitR, 0, Math.sin(ang) * L.orbitR);
            const R = (i + 1) * toc.gap;
            p.orbit.setAttribute("d", orbitPath(L.orbitR, sunP, R, tocU));
            if (!pt) continue;
            const lock = planetLock(story, i);
            // Parked at the top of its circle, then swept clockwise half a turn to the bottom.
            const thPark = -Math.PI / 2 + Math.PI * lock;
            const thFree = Math.atan2(pt.y - sunP.y, pt.x - sunP.x);
            const th = lerpAngShort(thFree, thPark, tocU);
            const rho = lerp(Math.hypot(pt.x - sunP.x, pt.y - sunP.y), R, tocU);
            const x = sunP.x + Math.cos(th) * rho;
            const y = sunP.y + Math.sin(th) * rho;
            const sc = lerp(Math.max(0.45, Math.min(1.7, pt.s * 0.42)), 1.15, tocU);
            const active = plateId === p.id;
            p.g.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
            p.dot.setAttribute("r", (p.rDot * (active ? 1.4 : 1) * sc).toFixed(2));
            p.g.classList.toggle("is-focus", active);
            p.g.classList.toggle("is-lock", lock > 0.55);
            // Parked planets stay hidden; each fades in as it starts down its orbit.
            const shown = easeInOutCubic(clamp(lock / 0.35, 0, 1));
            const tocDim = (active ? 1 : 0.78) * shown;
            p.g.style.opacity = lerp(pt.z > sunP.z ? 0.55 : 1, tocDim, tocU).toFixed(3);
            p.orbit.style.opacity = lerp(1, (active ? 0.3 : 0.1) * shown, tocU).toFixed(3);
            const labOn = (active ? 1 : 0.72) * shown;
            p.label.style.opacity = lerp(hoverIdx === i ? 1 : 0.35, labOn, tocU).toFixed(3);
            p.g.classList.toggle("is-hover", hoverIdx === i && tocU < 0.5);
            p.sx = x;
            p.sy = y;
            chapBtns[i + 1].parentElement.classList.toggle("is-hidden", shown < 0.5);
            p.label.setAttribute("x", lerp(12, 24, tocU).toFixed(1));
            p.label.setAttribute("y", "0");
            p.label.setAttribute("text-anchor", "start");
            if (lock > 0.8) stackY = Math.max(stackY, sunP.y + R);
            if (lock > 0.8) stackOn = Math.max(stackOn, lock);
            placeRow(i + 1, x, y, toc.gap);
            bodies.push({ z: lerp(pt.z, 0, tocU), el: p.g });
        }

        if (stackOn > 0.8) {
            stackLine.setAttribute("d", `M${sunP.x.toFixed(1)} ${sunP.y.toFixed(1)} L${sunP.x.toFixed(1)} ${stackY.toFixed(1)}`);
            stackLine.style.opacity = ((stackOn - 0.8) / 0.2).toFixed(3);
        } else {
            stackLine.style.opacity = "0";
        }

        bodies.sort((a, b) => b.z - a.z);
        for (const b of bodies) bodiesG.append(b.el);

        for (const d of dust) {
            const parx = azim * 26;
            const pary = (elev - ELEV) * -38;
            d.el.setAttribute("cx", (d.nx * W + parx).toFixed(1));
            d.el.setAttribute("cy", (d.ny * H + pary).toFixed(1));
            d.el.setAttribute("r", d.r.toFixed(2));
            const tw = 0.7 + 0.3 * Math.sin(t * d.tws + d.tw);
            d.el.setAttribute("opacity", (d.o * tw * (1 - 0.45 * readAmt)).toFixed(3));
        }
        raf = requestAnimationFrame(frame);
    }

    measure();
    window.addEventListener("resize", measure);
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
