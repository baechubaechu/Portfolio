/** Small shared helpers. No DOM assumptions except where named. */

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** FNV-1a 32-bit hash → unsigned int. Used to seed deterministic layouts. */
export function hashString(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}

/** mulberry32 — tiny seeded PRNG returning [0, 1). */
export function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    !!window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const hasFinePointer = () =>
    typeof window !== "undefined" &&
    !!window.matchMedia &&
    window.matchMedia("(pointer: fine)").matches;

const SVG_NS = "http://www.w3.org/2000/svg";

/** Create an SVG element with attributes. */
export function svgEl(tag, attrs = {}) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) {
        if (v == null) continue;
        el.setAttribute(k, String(v));
    }
    return el;
}

/** Create an HTML element with class & attributes. */
export function htmlEl(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
        if (v == null) continue;
        if (k === "class") el.className = v;
        else if (k === "text") el.textContent = v;
        else el.setAttribute(k, String(v));
    }
    for (const c of children) if (c) el.append(c);
    return el;
}

/** Escape text for safe innerHTML interpolation. */
export function esc(str) {
    return String(str ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/**
 * Canvas-based text measurer. Letter-spacing is not part of canvas
 * metrics, so it is added manually (em * fontSize * (n - 1)).
 */
export function createTextMeasurer() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    return (text, font, letterSpacingEm = 0) => {
        ctx.font = font;
        const fontSize = parseFloat(font) || 10;
        const base = ctx.measureText(text).width;
        const extra = Math.max(0, text.length - 1) * letterSpacingEm * fontSize;
        return base + extra;
    };
}

/** Wait for the given fonts (or give up after `timeout` ms). */
export function waitForFonts(fonts, timeout = 1500) {
    if (!document.fonts?.load) return Promise.resolve();
    const loads = fonts.map((f) => document.fonts.load(f).catch(() => null));
    return Promise.race([
        Promise.all(loads),
        new Promise((r) => setTimeout(r, timeout)),
    ]);
}

export function debounce(fn, wait) {
    let t = 0;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
    };
}
