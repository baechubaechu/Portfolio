/**
 * Arrival system — Abraxas prototype.
 *
 * Warp drops you into this project's own system: the project is the sun,
 * its real attributes are the planets. Orbits live on a plane and are
 * drawn in perspective (a slightly elevated look, not a floor-plan).
 */

import { portfolio } from "../constellation/data/portfolio.js?v=1.9";
import {
    svgEl, htmlEl, mulberry32, hashString, prefersReducedMotion, esc, clamp,
} from "../constellation/lib/utils.js?v=2.0";

const ELEV = 0.56;
const CAM_DIST = 3.12;
const DIST_READ = 1.52;
const ORBIT_SAMPLES = 96;
const CLICK_PX = 7;
const SUN_GLOW = 2.2;
const SUN_SPIN = 0.21;
const CAM_OPEN_MS = 1340;
const CAM_CLOSE_MS = 1080;

function easeInOutSlow(t) {
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return t * t * t * (t * (t * 6 - 15) + 10);
}

function wrapU(du) {
    du -= Math.round(du);
    return du;
}

function buildSunTexture(seed) {
    const w = 256;
    const h = 128;
    const rand = mulberry32(seed);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    const img = ctx.createImageData(w, h);
    const px = img.data;
    const cells = [];
    for (let i = 0; i < 240; i++) {
        cells.push({
            u: rand(),
            v: rand(),
            b: 0.78 + rand() * 0.22,
        });
    }
    const spots = [];
    const nSpots = 3 + (rand() * 3 | 0);
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
            let L = 0.7 + bright * 0.26 - edge * 0.18;
            L *= 1 - lat * lat * 0.05;
            for (const s of spots) {
                const du = wrapU(u - s.u) / s.ru;
                const dv = (v - s.v) / s.rv;
                const d = du * du + dv * dv;
                if (d < 1) L *= 1 - s.k * (1 - d) * (1 - d);
            }
            L = clamp(L, 0.48, 1);
            const i = (y * w + x) * 4;
            px[i] = 188 + L * 67;
            px[i + 1] = 184 + L * 68;
            px[i + 2] = 168 + L * 72;
            px[i + 3] = 255;
        }
    }
    ctx.putImageData(img, 0, 0);
    return { data: px, w, h };
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
                px[i] = 255 * g;
                px[i + 1] = 252 * g;
                px[i + 2] = 242 * g;
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

function sunDossierHTML(project) {
    const sections = project.sections ?? [];
    const meta = sections.find((s) => s.type === "hero-meta") ?? {};
    const comp = sections.find((s) => s.type === "arch-competition-info") ?? {};
    const panel = sections.find((s) => s.type === "arch-panel") ?? {};
    const narrative = sections.find((s) => s.type === "text-full") ?? {};
    const quote = meta.subtitle || "";
    const thesis = lastParagraph(narrative.content) || project.description || "";
    const kicker = ["Project", meta.category, meta.timeline].filter(Boolean).join(" · ");
    const rows = [
        meta.role && ["Role", plain(meta.role)],
        comp.organizer && ["Organizer", comp.organizer],
        comp.team && ["Team", comp.team],
    ].filter(Boolean);
    const img = panel.image;
    return `
        <p class="sys-dock__kicker">${esc(kicker)}</p>
        <h2 class="sys-dock__title">${esc(project.title)}</h2>
        ${quote ? `<p class="sys-dock__quote">${esc(quote)}</p>` : ""}
        ${rows.length ? `<dl class="sys-dock__meta">${rows.map(([k, v]) =>
            `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>` : ""}
        ${img ? `<figure class="sys-dock__figure"><img src="${esc(img)}" alt="${esc(project.title)}"></figure>` : ""}
        ${thesis ? `<p class="sys-dock__thesis">${esc(thesis)}</p>` : ""}
    `;
}

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

    const planets = [...(cproj.attributes ?? [])]
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
        "aria-label": `${cproj.title} system`,
    });
    const svg = svgEl("svg", { class: "sys__svg", xmlns: "http://www.w3.org/2000/svg" });
    const dustG = svgEl("g", { class: "sys__dust" });
    const world = svgEl("g", { class: "sys__world" });
    const orbitsG = svgEl("g", { class: "sys__orbits" });
    const bodiesG = svgEl("g", { class: "sys__bodies" });
    world.append(orbitsG, bodiesG);
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
        planetEls.push({ ...p, orbit, g, dot, label });
    }

    const sunTex = buildSunTexture(hashString(cproj.id));
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
    const legend = htmlEl("p", { class: "sys-legend", role: "note" });
    legend.innerHTML = "<span>Drag to look</span><span>Scroll to approach</span><span>The sun to read</span>";
    stage.append(svg, veil, sunBtn, backBtn, legend);
    document.body.append(stage);

    const dock = htmlEl("aside", {
        class: "sys-dock",
        "aria-label": `${cproj.title} dossier`,
        "aria-hidden": "true",
    });
    dock.inert = true;
    dock.innerHTML = sunDossierHTML(project);
    document.body.append(dock);

    let reading = false;
    let readAmt = 0;
    let viewX = 0.5;
    let viewXTgt = 0.5;
    let viewY = 0.5;
    let viewYTgt = 0.5;
    let camTween = null;

    let W = 0, H = 0, focal = 1;
    const layout = new Map();

    function project3(x, y, z) {
        const ce = Math.cos(elev), se = Math.sin(elev);
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

    function orbitPath(r) {
        let d = "";
        for (let i = 0; i <= ORBIT_SAMPLES; i++) {
            const a = (i / ORBIT_SAMPLES) * Math.PI * 2;
            const p = project3(Math.cos(a) * r, 0, Math.sin(a) * r);
            if (!p) continue;
            d += `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
        }
        return d + "Z";
    }

    function measure() {
        W = stage.clientWidth || window.innerWidth;
        H = stage.clientHeight || window.innerHeight;
        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        focal = Math.min(W, H) * 0.78;
        const r0 = 0.78;
        const r1 = 1.72;
        for (const p of planetEls) {
            const orbitR = r0 + (r1 - r0) * (0.1 + (1 - p.weight) * 0.9);
            const period = 90000 * (orbitR / r0) ** 1.5;
            layout.set(p.id, { orbitR, period });
        }
        applyFraming();
    }

    let azim = 0;
    let elev = ELEV;
    let dist = CAM_DIST;
    let distTgt = CAM_DIST;
    let distUser = CAM_DIST;
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

    function hitSun(cx, cy) {
        const b = sunBtn.getBoundingClientRect();
        return cx >= b.left && cx <= b.right && cy >= b.top && cy <= b.bottom;
    }

    function applyFraming() {
        const split = W >= 720;
        if (reading) {
            viewXTgt = split ? 0.3 : 0.5;
            viewYTgt = split ? 0.47 : 0.3;
            distTgt = split ? DIST_READ : 1.85;
        } else {
            viewXTgt = 0.5;
            viewYTgt = 0.5;
            distTgt = distUser;
        }
        if (reduce) {
            viewX = viewXTgt;
            viewY = viewYTgt;
            dist = distTgt;
        }
    }

    function startCamTween(ms) {
        if (reduce) {
            camTween = null;
            readAmt = reading ? 1 : 0;
            viewX = viewXTgt;
            viewY = viewYTgt;
            dist = distTgt;
            return;
        }
        camTween = {
            t0: performance.now(),
            dur: ms,
            fromX: viewX,
            fromY: viewY,
            fromD: dist,
            fromR: readAmt,
            toR: reading ? 1 : 0,
        };
    }

    function openSun() {
        if (reading) return;
        reading = true;
        applyFraming();
        startCamTween(CAM_OPEN_MS);
        dismissGuide();
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
        backBtn.focus();
    }

    function closeSun() {
        if (!reading) return;
        reading = false;
        applyFraming();
        startCamTween(CAM_CLOSE_MS);
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
    }

    dock.addEventListener("pointerdown", (e) => e.stopPropagation());
    backBtn.addEventListener("pointerdown", (e) => e.stopPropagation());
    backBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        closeSun();
    });
    sunBtn.addEventListener("pointerdown", (e) => e.stopPropagation());
    sunBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!reading) openSun();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && reading) closeSun();
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
            stage.classList.toggle("is-over-sun", !reading && hitSun(e.clientX, e.clientY));
            return;
        }
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        dragPx += Math.hypot(dx, dy);
        lastX = e.clientX;
        lastY = e.clientY;
        if (dragPx < CLICK_PX) return;
        dismissGuide();
        stage.classList.add("is-orbiting");
        azim -= (dx / Math.max(1, W)) * Math.PI * 2.1;
        elev = clamp(elev + (dy / Math.max(1, H)) * Math.PI, 0.08, 1.48);
    });
    const endDrag = (e) => {
        if (!dragging) return;
        dragging = false;
        stage.classList.remove("is-orbiting");
        try { stage.releasePointerCapture(e.pointerId); } catch { /* already released */ }
        if (dragPx < CLICK_PX) {
            if (!reading && hitSun(e.clientX, e.clientY)) openSun();
        }
    };
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);
    stage.addEventListener("wheel", (e) => {
        if (reading) return;
        e.preventDefault();
        dismissGuide();
        dist = clamp(dist * Math.exp(e.deltaY * 0.00115), 1.45, 7.2);
        distUser = dist;
        distTgt = dist;
    }, { passive: false });

    const t0 = performance.now();
    let raf = 0;
    function frame(now) {
        const t = (now - t0) / 1000;
        if (camTween) {
            const u = easeInOutSlow((now - camTween.t0) / camTween.dur);
            viewX = camTween.fromX + (viewXTgt - camTween.fromX) * u;
            viewY = camTween.fromY + (viewYTgt - camTween.fromY) * u;
            dist = camTween.fromD + (distTgt - camTween.fromD) * u;
            readAmt = camTween.fromR + (camTween.toR - camTween.fromR) * u;
            if (u >= 1) {
                viewX = viewXTgt;
                viewY = viewYTgt;
                dist = distTgt;
                readAmt = camTween.toR;
                camTween = null;
            }
        } else {
            viewX += (viewXTgt - viewX) * 0.07;
            viewY += (viewYTgt - viewY) * 0.07;
            dist += (distTgt - dist) * 0.055;
            readAmt = reading ? 1 : 0;
        }

        const sunP = project3(0, 0, 0);
        if (!sunP) { raf = requestAnimationFrame(frame); return; }

        const refS = focal / CAM_DIST;
        const bodyRSys = 16 * (sunP.s / Math.max(1e-6, refS));
        const bodyRRead = clamp(sunP.s * 0.12, 26, 40);
        const bodyR = bodyRSys + (bodyRRead - bodyRSys) * readAmt;
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
        const spin = reduce ? 0.35 : -t * SUN_SPIN;
        paintSun(sunCanvas, sunTex, spin, azim, elev);
        sunG.setAttribute("transform", `translate(${sunP.x.toFixed(2)} ${sunP.y.toFixed(2)})`);
        sunFo.setAttribute("x", (-css / 2).toFixed(1));
        sunFo.setAttribute("y", (-css / 2).toFixed(1));
        sunFo.setAttribute("width", css.toFixed(1));
        sunFo.setAttribute("height", css.toFixed(1));
        sunLimb.setAttribute("r", bodyR.toFixed(2));
        sunHit.setAttribute("r", Math.max(22, bodyR + 12).toFixed(2));
        sunLabel.setAttribute("x", (bodyR + 10).toFixed(1));
        sunLabel.style.opacity = (1 - readAmt).toFixed(3);
        const btnW = Math.max(118, bodyR * 2 + 88);
        const btnH = Math.max(36, bodyR * 2 + 10);
        sunBtn.style.width = `${btnW}px`;
        sunBtn.style.height = `${btnH}px`;
        sunBtn.style.transform = `translate(${(sunP.x - bodyR - 4).toFixed(1)}px, ${(sunP.y - btnH / 2).toFixed(1)}px)`;

        const bodies = [{ z: sunP.z, el: sunG }];

        for (const p of planetEls) {
            const L = layout.get(p.id);
            if (!L) continue;
            const spin = reduce ? 0 : (now - t0) / L.period * Math.PI * 2;
            const ang = p.ang0 + spin;
            const wx = Math.cos(ang) * L.orbitR;
            const wz = Math.sin(ang) * L.orbitR;
            const pt = project3(wx, 0, wz);
            p.orbit.setAttribute("d", orbitPath(L.orbitR));
            if (!pt) continue;
            const sc = Math.max(0.45, Math.min(1.55, pt.s * 0.42));
            p.g.setAttribute("transform", `translate(${pt.x.toFixed(2)} ${pt.y.toFixed(2)})`);
            p.dot.setAttribute("r", (p.rDot * sc).toFixed(2));
            const dim = (pt.z > sunP.z ? 0.55 : 1) * (1 - 0.78 * readAmt);
            p.g.style.opacity = dim.toFixed(3);
            p.orbit.style.opacity = (1 - 0.78 * readAmt).toFixed(3);
            p.label.style.opacity = (1 - readAmt).toFixed(3);
            const outward = pt.x >= sunP.x;
            p.label.setAttribute("x", outward ? "10" : "-10");
            p.label.setAttribute("text-anchor", outward ? "start" : "end");
            bodies.push({ z: pt.z, el: p.g });
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
