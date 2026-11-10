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
        /** Lead works (`featured: true` in the data): a larger star and name. */
        featured: {
            r: 5.4,
            labelFont: '600 13px Inter, "Segoe UI", sans-serif',
            letterSpacing: 0.08, // em
            labelGap: 12,
            labelH: 16,
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

    /* ── Project symbols drawn on hover (components/Symbol.js) ── */
    symbol: {
        fill: [0.34, 0.46],    // a figure spans up to this share of the stage width / height
        minScale: 0.8,         // figures are authored in px; never smaller than this…
        maxScale: 2.4,         // …or larger than this
        labelFont: '400 11px "IBM Plex Mono", Consolas, monospace', // must match .c-symbol__label
        letterSpacing: 0.1,    // em
        pad: { top: 64, right: 18, bottom: 54, left: 18 }, // bottom clears the corner captions
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
            camera: {
            ease: 0.025,         // lerp per frame toward the look target
            gazeRadius: 88,      // px: looking at a project within this distance
            clickRadius: 36,     // px: click near a star still selects it
            attributeRadius: 28,
            fov: 1.08,           // radians — wide like a planetarium window
            maxYaw: 0.4,
            maxPitch: 0.3,
            spanX: 0.78,         // upper bound; actual span is fitted to the window
            spanY: 0.57,
            fitPad: 28,          // px of sky between the figure and the crop marks (when not 1:1)
            fitIdentity: true,   // draw the resting sky 1:1 with the layout; margins live in stage.padding
            rProject: 1,
            rAttribute: 1.14,
            near: 0.32,
            dust: 480,
            bandDust: 320,       // extra specks crowded along the zones band
            bandHaze: 22,        // soft glow blobs along the band
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
            featured: 1.6,        // lead works push harder, keeping some sky around them
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
        /**
         * Two fields split by a tilted band through the centre: school works
         * settle on one side, other works on the other, and the shared attributes
         * gather along the band like a milky way.
         *   tilt     band angle from vertical (rad)
         *   side     project offset from the band axis, × stage reach
         *   band     attribute pull toward the axis
         *   project  project pull toward its side
         */
        zones: {
            tilt: 0.34,
            side: 0.3,
            band: 0.26,
            project: 0.06,
        },
        /**
         * Placed sky (data `place`): scale runs left → right, building → code
         * top → bottom. `bandTilt` lays the milky way along the middle, where
         * building meets code. `marks` sets where the scale names sit (in
         * code units, beyond the code end) and how they are anchored.
         */
        place: {
            strength: 0.14,
            transpose: false,
            inset: [0.0, 0.03],
            bandTilt: Math.PI / 2,
            marks: { code: 1.04, anchor: "middle" },   // just under the last row, clear of the corner captions
            // Names face away from the milky way, so the band stays clear:
            // stars above it are named above, stars below it below.
            labelFacing: { axis: "y", toward: "out" },
        },
    },

    stage: {
        // Figures near an edge turn the sky to come into view, so the stars can use most of it.
        padding: { top: 84, right: 96, bottom: 84, left: 96 },
        labelPadding: { top: 72, right: 24, bottom: 56, left: 24 },
    },

    /* ── Overrides for narrow stages ── */
    compact: {
        visual: {
            project: { r: 3.2, labelFont: '500 10px Inter, "Segoe UI", sans-serif', labelGap: 7, labelH: 12 },
            featured: { r: 4.4, labelFont: '600 11px Inter, "Segoe UI", sans-serif', labelGap: 9, labelH: 13 },
            attribute: { r: 2.2, labelFont: '400 9px "IBM Plex Mono", Consolas, monospace', labelGap: 6, labelH: 11 },
            ringR: 9,
        },
        forces: {
            scale: { reference: [390, 700], min: 0.6, max: 1.4 },
            link: { distance: 147 },
            charge: { project: -480, attribute: -255, distanceMax: 520 },
            collide: { padding: 18 },
            labels: { padding: 8 },
            obstacles: { padding: 8 },
            boundary: { margin: 28, marginStrength: 0.03 },
            spread: { strength: 0.02 },
            // Tall stage: the band runs across, school works above and other works below.
            zones: { tilt: -1.28, side: 0.3 },
            // Tall stage: a quarter turn. Scale runs top → bottom, building → code
            // left → right, and the milky way stands upright between them.
            // Phones: names face inward, toward the upright band, so they never run off the narrow screen.
            place: { transpose: true, inset: [0.06, 0.03], bandTilt: 0, marks: { code: -0.1, anchor: "start" }, labelFacing: { axis: "x", toward: "in" } },
        },
        stage: {
            // Clear of the name plate and Contact above, and View all works below.
            padding: { top: 84, right: 16, bottom: 100, left: 16 },
            labelPadding: { top: 84, right: 12, bottom: 100, left: 12 },
        },
        symbol: {
            fill: [0.7, 0.32],
            minScale: 0.5,
            maxScale: 1.2,
            labelFont: '400 9px "IBM Plex Mono", Consolas, monospace',
            pad: { top: 72, right: 12, bottom: 84, left: 12 },
        },
        motion: {
            // spanY: the base cap (0.57) is tuned for wide screens; on a tall phone stage it
            // squeezed the figure into the middle 40% of the height. Let the window fit decide.
            camera: { maxYaw: 0.524, maxPitch: 0.524, gazeRadius: 64, attributeRadius: 24, dust: 160, bandDust: 200, bandHaze: 12 },
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

/** Node geometry & label metrics for a graph node. */
export function visualOf(node, cfg) {
    if (node.type !== "project") return cfg.visual.attribute;
    return node.data?.featured ? cfg.visual.featured : cfg.visual.project;
}

/** Resolve the config for a given stage width. */
export function resolveConfig(width) {
    const { compact, ...base } = CONFIG;
    return width < CONFIG.breakpoints.compact ? mergeConfig(base, compact) : base;
}
