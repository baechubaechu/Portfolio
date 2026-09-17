/**
 * Celestial sphere: the 2D layout is a patch on the inner vault.
 * The camera sits at the origin and turns with the pointer (a head look).
 * Stars are projected with perspective so the rim recedes.
 */

function rotateY(x, y, z, a) {
    const c = Math.cos(a), s = Math.sin(a);
    return { x: x * c - z * s, y, z: x * s + z * c };
}

function rotateX(x, y, z, a) {
    const c = Math.cos(a), s = Math.sin(a);
    return { x, y: y * c - z * s, z: y * s + z * c };
}

/** Map a settled 2D layout point onto the vault. */
export function toSphere(n, stage, cam) {
    const u = (n.x / stage.width - 0.5) * 2;
    const v = (n.y / stage.height - 0.5) * 2;
    const lon = u * cam.spanX;
    const lat = -v * cam.spanY;
    const R = n.type === "project" ? cam.rProject : cam.rAttribute;
    const cl = Math.cos(lat);
    return {
        lon, lat, R,
        wx: Math.sin(lon) * cl * R,
        wy: Math.sin(lat) * R,
        wz: -Math.cos(lon) * cl * R,
    };
}

/**
 * Camera looks down −Z. `yaw` > 0 looks right (vault slides left).
 * `pitch` > 0 looks up (vault slides down). SVG Y is flipped.
 */
export function project(wx, wy, wz, yaw, pitch, cam, stage) {
    const a = rotateY(wx, wy, wz, -yaw);
    const b = rotateX(a.x, a.y, a.z, -pitch);
    const depth = -b.z;
    if (depth < cam.near) {
        return { visible: false, depth, x: 0, y: 0, scale: 0, fade: 0 };
    }
    const f = cam.focal;
    const rest = f / cam.rProject;
    const fade = Math.max(0, Math.min(1, (depth - cam.near) / (cam.rProject * 0.55)));
    return {
        visible: true,
        depth,
        x: stage.width / 2 + (b.x * f) / depth,
        y: stage.height / 2 - (b.y * f) / depth,
        scale: ((f / depth) / rest),
        fade,
    };
}

export function resolveCamera(cfg, stage) {
    const c = { ...cfg.motion.camera };
    const W = Math.max(1, stage.width);
    const H = Math.max(1, stage.height);
    const halfW = W * 0.5;
    const halfH = H * 0.5;
    c.focal = halfW / Math.tan(c.fov * 0.5);
    const pad = cfg.stage?.padding ?? { top: 48, right: 52, bottom: 48, left: 52 };
    // Fit the padded layout to the window so the figure stays wide,
    // with only a sliver of sky at the crop marks.
    const screenPad = c.fitPad ?? 28;
    const uEdge = Math.max(0.25, 1 - (pad.left + pad.right) / W);
    const vEdge = Math.max(0.25, 1 - (pad.top + pad.bottom) / H);
    const spanX = Math.atan(Math.max(0.12, (halfW - screenPad) / c.focal)) / uEdge;
    const spanY = Math.atan(Math.max(0.12, (halfH - screenPad) / c.focal)) / vEdge;
    const corner = Math.sqrt(Math.max(0.72, Math.cos(Math.min(spanX, 1.1))));
    c.spanX = Math.min(c.spanX ?? spanX, spanX);
    c.spanY = Math.min(c.spanY ?? spanY, spanY * corner);
    return c;
}

/** Faint distant dust on the vault — not interactive. */
export function createSkyDust(count, rand) {
    const stars = [];
    for (let i = 0; i < count; i++) {
        // Keep most specks in the planetarium window; a few sit wider for look-around.
        const wide = rand() < 0.22;
        const span = wide ? 1.35 : 0.72;
        const lon = (rand() - 0.5) * 2 * span;
        const lat = (rand() - 0.5) * 2 * span * 0.7;
        const R = 1.12 + rand() * 0.5;
        const cl = Math.cos(lat);
        const mag = rand() ** 2.2;
        stars.push({
            wx: Math.sin(lon) * cl * R,
            wy: Math.sin(lat) * R,
            wz: -Math.cos(lon) * cl * R,
            r: 0.42 + mag * 1.05,
            o: 0.16 + mag * 0.42,
            tw: rand() * Math.PI * 2,
            tws: 0.35 + rand() * 1.1,
        });
    }
    return stars;
}
