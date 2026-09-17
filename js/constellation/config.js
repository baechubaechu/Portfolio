/**
 * Design & algorithm parameters for the constellation.
 *
 * Visual tokens that are purely CSS (colours, opacities, durations)
 * live in css/constellation.css. Everything that the layout algorithm
 * or the renderer needs as a number lives here.
 *
 * `compact` is deep-merged over the base config when the stage is
 * narrower than `breakpoints.compact` (phones).
 */

export const CONFIG = {
    breakpoints: {
        compact: 720,
    },

    /* ── Node geometry & label metrics (must match the CSS fonts) ── */
    visual: {
        project: {
            r: 3.6,
            labelFont: '500 11px Inter, "Segoe UI", sans-serif',
            letterSpacing: 0.09, // em
            labelGap: 9,
            labelH: 13,
        },
        attribute: {
            r: 2.4,
            labelFont: '400 10px "IBM Plex Mono", Consolas, monospace',
            letterSpacing: 0.1, // em
            labelGap: 8,
            labelH: 12,
        },
        ringR: 11, // hairline ring drawn around the selected node
        /**
         * Label placement candidates, in order of preference.
         * The placer picks the first side that is not crossed by an
         * incident edge and does not overflow the stage.
         */
        labelSides: ["right", "left", "below", "above"],
    },

    /* ── Motion (ms / px). CSS reads the durations via custom props. ── */
    motion: {
        drawDuration: 760,
        drawStagger: 95,
        labelLag: 340,      // label fades in this long after its edge starts drawing
        retractDuration: 420,
        drift: {
            amplitude: 1.4,   // px — resting nodes breathe this much
            period: [11000, 17000],
        },
            appearStagger: 38,  // initial reveal, per node
            dwellMs: 3000,      // hold gaze on a project to open its page
            camera: {
            ease: 0.05,          // lerp per frame toward the look target
            gazeRadius: 88,      // px: looking at a project within this distance
            clickRadius: 36,     // px: click near a star still selects it
            attributeRadius: 28,
            fov: 1.08,           // radians — wide like a planetarium window
            maxYaw: 0.4,
            maxPitch: 0.3,
            spanX: 0.78,         // upper bound; actual span is fitted to the window
            spanY: 0.57,
            fitPad: 28,          // px of sky between the figure and the crop marks
            rProject: 1,
            rAttribute: 1.14,
            near: 0.32,
            dust: 480,
        },
    },

    /* ── Simulation schedule (d3-force semantics) ── */
    sim: {
        alphaMin: 0.001,
        alphaDecay: 0.0228,   // ≈ 300 ticks to cool from 1 → alphaMin
        velocityDecay: 0.55,  // higher = more damping = calmer
        prewarmTicks: 360,    // run synchronously before the first paint
        focusAlpha: 0.09,     // unused while the map stays still on gaze
        resizeAlpha: 0.45,
    },

    /* ── Forces ── */
    forces: {
        /**
         * Forces are tuned for a reference stage; on other sizes they are
         * scaled by k = stageArea / referenceArea (clamped). Link rest
         * lengths scale by √k, charges by k, so the cloud fills the stage
         * on a 4K monitor and a phone alike.
         */
        scale: {
            reference: [1280, 700],
            min: 0.35,
            max: 2.6,
        },
        link: {
            distance: 345,            // base rest length (px) at reference size
            weightDistanceScale: 0.6, // rest = distance * (1.3 - scale * weight)
            strength: 0.9,            // multiplied by 1 / min(degree)
            weightStrengthScale: 0.9, // strength *= 0.55 + scale * weight
            focusDistanceScale: 0.86, // incident edges of the selected node contract
            focusStrengthScale: 1.7,
        },
        charge: {
            project: -1950,
            attribute: -1080,
            distanceMin: 12,
            distanceMax: 840,
        },
        collide: {
            padding: 24,  // added to node radius
            strength: 0.8,
            iterations: 2,
        },
        labels: {
            padding: 8,   // px around each label box
            strength: 0.55,
        },
        obstacles: {
            padding: 14,  // keep-out margin around optional UI rects inside the stage
            strength: 0.7,
        },
        boundary: {
            strength: 0.7,
            margin: 70,        // soft zone inside the padding where nodes start to ease away
            marginStrength: 0.02,
        },
        center: {
            strength: 0.035,
        },
        /**
         * Aspect-aware spread: on wide stages nodes are eased outward
         * along x (on tall stages along y) so the cloud follows the
         * stage's proportions instead of forming a circle. Zero on a
         * square stage.
         */
        spread: {
            strength: 0.028,
        },
    },

    stage: {
        padding: { top: 48, right: 52, bottom: 48, left: 52 },
    },

    /* ── Overrides for narrow stages ── */
    compact: {
        visual: {
            project: { r: 3.2, labelFont: '500 10px Inter, "Segoe UI", sans-serif', labelGap: 7, labelH: 12 },
            attribute: { r: 2.2, labelFont: '400 9px "IBM Plex Mono", Consolas, monospace', labelGap: 6, labelH: 11 },
            ringR: 9,
        },
        forces: {
            scale: { reference: [390, 700], min: 0.6, max: 1.4 },
            link: { distance: 147 },
            charge: { project: -480, attribute: -255, distanceMax: 360 },
            collide: { padding: 14 },
            labels: { padding: 5 },
            obstacles: { padding: 8 },
            boundary: { margin: 28, marginStrength: 0.03 },
            spread: { strength: 0.012 },
        },
        stage: {
            padding: { top: 20, right: 18, bottom: 16, left: 18 },
        },
        motion: {
            camera: { maxYaw: 0.32, maxPitch: 0.24, gazeRadius: 64, attributeRadius: 24, dust: 160 },
        },
    },
};

/** Deep-merge `patch` over `base` (plain objects only). */
export function mergeConfig(base, patch) {
    if (!patch) return base;
    const out = Array.isArray(base) ? [...base] : { ...base };
    for (const key of Object.keys(patch)) {
        const b = base?.[key];
        const p = patch[key];
        out[key] = (b && p && typeof b === "object" && typeof p === "object" && !Array.isArray(p))
            ? mergeConfig(b, p)
            : p;
    }
    return out;
}

/** Resolve the config for a given stage width. */
export function resolveConfig(width) {
    const { compact, ...base } = CONFIG;
    return width < CONFIG.breakpoints.compact ? mergeConfig(base, compact) : base;
}
