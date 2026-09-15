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
    c.focal = (stage.width * 0.5) / Math.tan(c.fov * 0.5);
    return c;
}

/** Faint distant dust on the vault — not interactive. */
export function createSkyDust(count, rand) {
    const stars = [];
    for (let i = 0; i < count; i++) {
        const lon = (rand() - 0.5) * 2.4;
        const lat = (rand() - 0.5) * 1.5;
        const R = 1.22 + rand() * 0.42;
        const cl = Math.cos(lat);
        stars.push({
            wx: Math.sin(lon) * cl * R,
            wy: Math.sin(lat) * R,
            wz: -Math.cos(lon) * cl * R,
            r: 0.28 + rand() * 0.7,
            o: 0.05 + rand() * 0.11,
        });
    }
    return stars;
}
