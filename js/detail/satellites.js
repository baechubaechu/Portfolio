/**
 * Satellites.
 *
 * A chapter (planet) can carry `satellites`: deeper pages on one part of it (methods, rule
 * tables, code). The chapter itself stays short; each satellite opens in a panel over the
 * reading dock, with its own address (#<satellite id>) so it can be linked and the back
 * button closes it.
 *
 * The orrery is the "you are here" map: a small solar system in the top-left corner while
 * reading. Its camera follows the planet of the chapter on screen and, when a satellite is
 * open, closes in on that planet with its moons and frames the open one.
 */

const TILT = 0.42;          // orbit ellipse: y = sin · r · TILT
const OVERVIEW = 0.86;      // world radius that fits the box in overview
const ZOOM_PLANET = 2.3;
const ZOOM_MOON = 5.6;

export function mountSatellites(api) {
    const { project, planets, dock, blockHTML, esc, reduce, mobile } = api;
    const chapters = project.chapters ?? [];
    const satOf = new Map();       // satellite id → { sat, chapter, index, planetIndex }
    chapters.forEach((c, pi) => (c.satellites ?? []).forEach((s, si) =>
        satOf.set(s.id, { sat: s, chapter: c, index: si, planetIndex: pi })));

    // ------------------------------------------------------------ panel
    const panel = document.createElement("aside");
    panel.className = "sat-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-hidden", "true");
    panel.inert = true;
    document.body.append(panel);

    let openId = null;
    // Absolute, so a <base href> (review pages use one) cannot move the page.
    const here = () => location.pathname + location.search;
    let pushed = false;

    function placePanel() {
        if (mobile) return;
        panel.style.left = dock.style.left;
        panel.style.right = dock.style.right;
    }

    function panelHTML(id) {
        const { sat, chapter, index, planetIndex } = satOf.get(id);
        const sats = chapter.satellites;
        const n = String(planetIndex + 2).padStart(2, "0");
        const next = sats[index + 1];
        return `
            <div class="sat-panel__bar">
                <button type="button" class="sat-panel__back" data-sat-close>← ${esc(`${n}  ${chapter.label}`)}</button>
                <button type="button" class="sat-panel__close" data-sat-close aria-label="Close">×</button>
            </div>
            <section class="sys-dock__plate sat-panel__plate">
                <p class="sys-dock__kicker">${esc(`${n}  ·  ${chapter.label}  ·  satellite ${index + 1} / ${sats.length}`)}</p>
                <h2 class="sys-dock__title">${esc(sat.title || sat.label)}</h2>
                ${sat.lead ? `<p class="sys-dock__quote">${esc(sat.lead)}</p>` : ""}
                ${(sat.blocks ?? []).map(blockHTML).join("")}
                <nav class="sat-panel__foot">
                    <button type="button" class="sat-panel__foot-btn" data-sat-close>← Back to ${esc(chapter.label)}</button>
                    ${next ? `<button type="button" class="sat-panel__foot-btn sat-panel__foot-btn--next" data-sat="${esc(next.id)}">${esc(next.label)} →</button>` : ""}
                </nav>
            </section>`;
    }

    function show(id, { push = true } = {}) {
        if (!satOf.has(id)) return;
        placePanel();
        panel.innerHTML = panelHTML(id);
        panel.scrollTop = 0;
        const wasOpen = !!openId;
        openId = id;
        panel.inert = false;
        panel.setAttribute("aria-hidden", "false");
        panel.setAttribute("aria-label", satOf.get(id).sat.title || satOf.get(id).sat.label);
        panel.classList.add("is-open");
        document.body.classList.add("is-sat-open");
        if (push) {
            if (wasOpen && pushed) history.replaceState({ sat: id }, "", `${here()}#${id}`);
            else { history.pushState({ sat: id }, "", `${here()}#${id}`); pushed = true; }
        }
        panel.querySelector(".sat-panel__back")?.focus({ preventScroll: true });
        crumb();
    }

    function hide({ fromHistory = false } = {}) {
        if (!openId) return;
        const { chapter } = satOf.get(openId);
        openId = null;
        panel.classList.remove("is-open");
        panel.inert = true;
        panel.setAttribute("aria-hidden", "true");
        document.body.classList.remove("is-sat-open");
        if (!fromHistory) {
            if (pushed) { pushed = false; history.back(); }
            else history.replaceState(null, "", here());
        }
        dock.querySelector(`[data-sat-of="${chapter.id}"] .sat-moon`)?.focus({ preventScroll: true });
        crumb();
    }

    panel.addEventListener("click", (e) => {
        const go = e.target.closest("[data-sat]");
        if (go) { show(go.dataset.sat); return; }
        if (e.target.closest("[data-sat-close]")) hide();
    });
    dock.addEventListener("click", (e) => {
        const go = e.target.closest("[data-sat]");
        if (go) { e.stopPropagation(); show(go.dataset.sat); }
    });
    window.addEventListener("popstate", () => {
        const id = location.hash.slice(1);
        if (satOf.has(id)) { pushed = false; show(id, { push: false }); }
        else { pushed = false; hide({ fromHistory: true }); }
    });
    window.addEventListener("resize", placePanel);

    // Opened from a link: read the chapter first, then lift the satellite over it.
    const fromHash = decodeURIComponent(location.hash.slice(1));
    if (satOf.has(fromHash)) {
        api.readAt(satOf.get(fromHash).chapter.id);
        // Wait until the dock is open and has settled, so the panel does not fade in over it.
        const t0 = performance.now();
        const wait = () => {
            const ready = document.body.classList.contains("is-reading-sun") && dock.classList.contains("is-open");
            if (ready || performance.now() - t0 > 4000) setTimeout(() => show(fromHash, { push: false }), reduce ? 0 : 360);
            else requestAnimationFrame(wait);
        };
        wait();
    }

    // ------------------------------------------------------------ orrery
    const box = document.createElement("div");
    box.className = "sat-orrery";
    box.setAttribute("aria-hidden", "true");
    const canvas = document.createElement("canvas");
    canvas.className = "sat-orrery__canvas";
    const crumbEl = document.createElement("p");
    crumbEl.className = "sat-orrery__crumb";
    box.append(canvas);
    document.body.append(box);
    const crumbNav = document.createElement("nav");
    crumbNav.className = "sat-crumb";
    crumbNav.setAttribute("aria-label", "Where you are");
    crumbNav.append(crumbEl);
    document.body.append(crumbNav);
    const ctx = canvas.getContext("2d");

    const sunColor = getComputedStyle(document.querySelector(".sys") || document.body)
        .getPropertyValue("--sys-sun").trim() || "rgb(255, 214, 150)";
    const n = planets.length;
    const bodies = planets.map((p, i) => {
        const r = n <= 1 ? 0.6 : 0.3 + (0.86 - 0.3) * (i / (n - 1));
        const sats = chapters[i]?.satellites ?? [];
        return {
            id: p.id,
            label: p.label,
            r,
            ang0: i * 2.39996 + 0.6,
            w: 0.045 / r ** 1.5,
            moons: sats.map((s, k) => ({ id: s.id, label: s.label, ang0: k * (Math.PI * 2 / Math.max(1, sats.length)), r: 0.055 + k * 0.022 })),
        };
    });

    let W = 0, H = 0, dpr = 1;
    function size() {
        const rect = box.getBoundingClientRect();
        dpr = Math.min(2, window.devicePixelRatio || 1);
        W = rect.width; H = rect.height;
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
    }

    function layoutBox() {
        if (!mobile) {
            const left = parseFloat(dock.style.left) || 320;
            box.style.width = `${Math.max(180, Math.min(300, left - 56))}px`;
            crumbNav.style.width = box.style.width;
        }
        size();
    }
    window.addEventListener("resize", layoutBox);

    const cam = { x: 0, y: 0, s: 1 };
    let camReady = false;
    const t0 = performance.now();
    let last = t0;

    function planetPos(b, t) {
        const a = b.ang0 + (reduce ? 0 : t * b.w);
        return { x: Math.cos(a) * b.r, y: Math.sin(a) * b.r * TILT, a };
    }
    function moonPos(p, m, t) {
        const a = m.ang0 + (reduce ? 0 : t * 0.35);
        return { x: p.x + Math.cos(a) * m.r, y: p.y + Math.sin(a) * m.r * 0.62 };
    }

    function crumb() {
        const plate = api.getPlate();
        const pi = planets.findIndex((p) => p.id === plate);
        const parts = [`<button type="button" data-crumb="sun">${esc(project.title.toUpperCase())}</button>`];
        if (pi >= 0) parts.push(`<button type="button" data-crumb="${esc(plate)}">${esc(`${String(pi + 2).padStart(2, "0")} ${planets[pi].label}`)}</button>`);
        if (openId) parts.push(`<span>${esc(satOf.get(openId).sat.label)}</span>`);
        const html = parts.join('<i aria-hidden="true">›</i>');
        if (crumbEl.innerHTML !== html) crumbEl.innerHTML = html;
    }
    // The crumb follows the reading position on its own, not only while the orrery draws.
    dock.addEventListener("scroll", crumb, { passive: true });
    crumbNav.addEventListener("click", (e) => {
        const b = e.target.closest("[data-crumb]");
        if (!b) return;
        if (openId) hide();
        api.goPlate(b.dataset.crumb);
    });

    function draw(now) {
        const t = (now - t0) / 1000;
        const dt = Math.max(0, (now - last) / 1000); // unclamped: a throttled tab still catches up
        last = now;
        if (!W) layoutBox();
        const reading = document.body.classList.contains("is-reading-sun");
        if (!reading || !W) { requestAnimationFrame(draw); return; }

        const plate = openId ? satOf.get(openId).chapter.id : api.getPlate();
        const pi = bodies.findIndex((b) => b.id === plate);
        const base = Math.min(W / 2, H / TILT / 2 * 0.86) / OVERVIEW;
        let tx = 0, ty = 0, ts = base;
        let focusMoon = null;
        if (pi >= 0) {
            const p = planetPos(bodies[pi], t);
            tx = p.x; ty = p.y; ts = base * ZOOM_PLANET;
            if (openId) {
                focusMoon = bodies[pi].moons.find((m) => m.id === openId);
                const mp = focusMoon ? moonPos(p, focusMoon, t) : p;
                tx = (p.x + mp.x) / 2; ty = (p.y + mp.y) / 2; ts = base * ZOOM_MOON;
            }
        }
        const k = reduce || !camReady ? 1 : 1 - Math.exp(-dt / 0.38);
        cam.x += (tx - cam.x) * k;
        cam.y += (ty - cam.y) * k;
        cam.s *= Math.exp((Math.log(ts) - Math.log(cam.s)) * k);
        camReady = true;

        const X = (x) => W / 2 + (x - cam.x) * cam.s;
        const Y = (y) => H / 2 + (y - cam.y) * cam.s;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);

        // Sun
        const sx = X(0), sy = Y(0);
        const sr = Math.min(8, Math.max(3, 0.03 * cam.s));
        const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 3);
        glow.addColorStop(0, sunColor);
        glow.addColorStop(0.25, sunColor.replace("rgb(", "rgba(").replace(")", ", 0.35)"));
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(sx, sy, sr * 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = sunColor;
        ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();

        // Orbits and planets
        ctx.font = "500 10px 'DM Mono', monospace";
        ctx.textBaseline = "middle";
        bodies.forEach((b, i) => {
            const on = i === pi;
            ctx.strokeStyle = on ? "rgba(255,255,255,0.28)" : `rgba(255,255,255,${(0.1 * Math.min(1, 2 * base / cam.s)).toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(sx, sy, b.r * cam.s, b.r * TILT * cam.s, 0, 0, Math.PI * 2);
            ctx.stroke();
            const p = planetPos(b, t);
            const px = X(p.x), py = Y(p.y);
            const pr = on ? Math.min(6, Math.max(3.2, 0.012 * cam.s)) : 2;
            ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2);
            if (on) { ctx.fillStyle = "#f5f5f5"; ctx.fill(); }
            else { ctx.fillStyle = "#0a0a0a"; ctx.fill(); ctx.strokeStyle = "rgba(245,245,245,0.55)"; ctx.stroke(); }

            // Moons: drawn once the camera is close enough to tell them from the planet.
            const moonA = Math.min(1, Math.max(0, (cam.s / base - 1.6) / 1.4)) * (on ? 1 : 0.35);
            if (b.moons.length && moonA > 0.02) {
                for (const m of b.moons) {
                    const mp = moonPos(p, m, t);
                    const mOn = focusMoon === m;
                    ctx.strokeStyle = `rgba(255,255,255,${(0.14 * moonA).toFixed(3)})`;
                    ctx.beginPath();
                    ctx.ellipse(px, py, m.r * cam.s, m.r * 0.62 * cam.s, 0, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.fillStyle = mOn ? sunColor : `rgba(245,245,245,${(0.75 * moonA).toFixed(3)})`;
                    ctx.beginPath(); ctx.arc(X(mp.x), Y(mp.y), mOn ? 3.2 : 1.8, 0, Math.PI * 2); ctx.fill();
                    if (mOn && !mobile) {
                        ctx.fillStyle = "rgba(245,245,245,0.9)";
                        ctx.fillText(m.label.toUpperCase(), X(mp.x) + 8, Y(mp.y));
                    }
                }
            }
            if (on && !mobile && !focusMoon) {
                ctx.fillStyle = "rgba(245,245,245,0.9)";
                ctx.fillText(b.label, px + pr + 7, py);
            }
        });
        if (pi < 0 && !mobile) {
            ctx.fillStyle = "rgba(245,245,245,0.9)";
            ctx.fillText(project.title.toUpperCase(), sx + sr + 8, sy);
        }
        crumb();
        requestAnimationFrame(draw);
    }
    if (!mobile) requestAnimationFrame(draw); // mobile gets its own navigator later

    return {
        isOpen: () => !!openId,
        close: () => hide(),
        contains: (el) => panel.contains(el),
        orreryHeight: () => (mobile ? 0 : box.offsetHeight + crumbNav.offsetHeight + 28),
        relayout: () => { placePanel(); layoutBox(); },
    };
}

/** The moons listed under a chapter in the dock. */
export function moonsHTML(chapter, esc) {
    const sats = chapter.satellites ?? [];
    if (!sats.length) return "";
    return `<nav class="sat-moons" data-sat-of="${esc(chapter.id)}" aria-label="More on ${esc(chapter.label)}">
        <p class="sat-moons__label">Satellites · more on this chapter</p>
        ${sats.map((s) => `<button type="button" class="sat-moon" data-sat="${esc(s.id)}">
            <span class="sat-moon__dot" aria-hidden="true"></span>
            <span class="sat-moon__text"><span class="sat-moon__title">${esc(s.label)}</span>${s.teaser ? `<span class="sat-moon__teaser">${esc(s.teaser)}</span>` : ""}</span>
            <span class="sat-moon__go" aria-hidden="true">→</span>
        </button>`).join("")}
    </nav>`;
}
