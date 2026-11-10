/**
 * Portfolio graph data.
 *
 * Through-line: Part and Beyond.
 * Scattered pieces gathered until they read as one form.
 *
 * This is the ONLY file you need to edit to add / remove / reconnect
 * projects and attributes. The graph, layout and UI are derived from it.
 *
 * ─ Attribute ───────────────────────────────────────────────
 *   id     unique slug, referenced by projects
 *   label  display name
 *
 * ─ Project ─────────────────────────────────────────────────
 *   id          unique slug (must not collide with an attribute id). Also the
 *               project id in js/projects.js and the ?id= of its detail page.
 *   title       display name (kept short: it is drawn on the map)
 *   domain      "school" | "other": which side of the sky the project
 *               settles on, matching the School Works / Other Works
 *               sections below (attributes gather in the band between)
 *   year        number
 *   category    short label shown in the info panel
 *   href        detail page URL. `null` → shown as "in progress" (no link)
 *   attributes  [{ id, weight }]  weight ∈ [0, 1]
 *               higher weight → shorter, stronger, more opaque link
 *   asterism    optional figure drawn on select:
 *               { stars: { [id]: [x, y] }, links: [[a, b], ...] }
 *               Coordinates are relative (−1…1). Include the project
 *               and every attribute; links are a sparse constellation
 *               (not a hub). Omitted → a count-based template is used.
 *   panelSlot   optional card corner: "top-left" | "top-right" |
 *               "bottom-left" | "bottom-right". Omitted → auto.
 *   featured    optional: a lead work. Drawn as a brighter, larger star
 *               with a larger name and a little more sky around it, so
 *               it is where the eye (and hand) goes first.
 *   bias        optional [fx, fy] (0…1 of the stage): pulls the project
 *               toward that spot on wide screens, to untangle neighbours.
 *   symbol      the figure drawn on the home sky when the project is looked at:
 *               { name, origin: [x, y], stars: [{ id, label, at: [x, y],
 *               side: "left"|"right"|"above"|"below", minor? }],
 *               links: [[a, b], ...] }. Coordinates are px at full size in
 *               the sketch frame; `origin` is where the project star sits and
 *               "@" names it in `links`. Optional `art: { src, box: [x, y, w, h] }`
 *               lays a faint line drawing under the stars, drawn in the same
 *               frame (box = the drawing's viewBox). The keywords come from the project
 *               itself, so figures never share stars across projects.
 *               `attributes` and `asterism` stay for the detail pages.
 *
 * Attributes are shared: every project that lists "parametric"
 * connects to the same single Parametric node. The asterism is a
 * per-project overlay: it does not add global graph edges.
 */

export const attributes = [
    { id: "parametric", label: "Parametric" },
    { id: "optimization", label: "Optimization" },
    { id: "ai", label: "AI" },
    { id: "code", label: "Code" },
    { id: "interaction", label: "Interaction" },
    { id: "phenomenology", label: "Phenomenology" },
    { id: "structure", label: "Structure" },
    { id: "research", label: "Research" },
    { id: "fabrication", label: "Fabrication" },
    { id: "physical-model", label: "Physical Model" },
];

export const projects = [
    {
        id: "xtra-space",
        domain: "school",
        featured: true,
        bias: [0.26, 0.52],
        title: "X-tra Space",
        year: 2026,
        category: "Graduation project",
        href: "project-detail.html?id=xtra-space",
        // A branching column under a ribbed roof: two flows meet at its foot, squeeze up the trunk, open at the fork, and reach the roof and the AI that runs it.
        symbol: {
            name: "The branching column",
            art: { src: "assets-web/constellations/xtra-space.svg", box: [0, 0, 300, 210] },
            origin: [150, 150],
            stars: [
                { id: "transfer", label: "Transfer", at: [70, 180], side: "left" },
                { id: "promenade", label: "Promenade", at: [230, 180], side: "right" },
                { id: "compression", label: "Compression", at: [150, 105], side: "right" },
                { id: "release", label: "Release", at: [150, 62], side: "right" },
                { id: "roof", label: "Rib roof", at: [75, 22], side: "above" },
                { id: "operator", label: "AI operator", at: [225, 22], side: "above" },
            ],
            links: [["@", "transfer"], ["@", "promenade"], ["@", "compression"], ["compression", "release"], ["release", "roof"], ["release", "operator"]],
        },
        attributes: [
            { id: "ai", weight: 0.9 },
            { id: "interaction", weight: 0.8 },
            { id: "research", weight: 0.7 },
            { id: "structure", weight: 0.6 },
            { id: "physical-model", weight: 0.6 },
            { id: "phenomenology", weight: 0.5 },
        ],
        // Cassiopeia-like W, phenomenology as a northern spur
        asterism: {
            stars: {
                "physical-model": [-1.00, -0.35],
                "research": [-0.42, 0.52],
                "xtra-space": [0.06, -0.22],
                "ai": [0.58, 0.48],
                "structure": [1.00, -0.38],
                "phenomenology": [-0.12, 1.00],
            },
            links: [
                ["physical-model", "research"],
                ["research", "xtra-space"],
                ["xtra-space", "ai"],
                ["ai", "structure"],
                ["research", "phenomenology"],
            ],
        },
    },
    {
        id: "student-driven-village",
        domain: "school",
        bias: [0.42, 0.93],
        title: "Student Driven Village",
        year: 2025,
        category: "School work",
        href: "project-detail.html?id=student-driven-village",
        // A gated complex opened by its students: from five schools, through the clubs, across the threshold into the shared hall.
        symbol: {
            name: "The open gate",
            art: { src: "assets-web/constellations/student-driven-village.svg", box: [0, 0, 300, 210] },
            origin: [150, 166],
            stars: [
                { id: "schools", label: "Five schools", at: [55, 120], side: "above" },
                { id: "clubs", label: "Student clubs", at: [100, 152], side: "left" },
                { id: "public", label: "Public level", at: [150, 36], side: "above" },
                { id: "hall", label: "Shared hall", at: [200, 152], side: "right" },
                { id: "corridor", label: "Widened corridor", at: [250, 110], side: "above" },
                { id: "stream", label: "Yangjae Stream", at: [240, 186], side: "below" },
            ],
            links: [["@", "clubs"], ["@", "hall"], ["@", "stream"], ["clubs", "schools"], ["clubs", "public"], ["public", "hall"], ["hall", "corridor"]],
        },
        attributes: [
            { id: "physical-model", weight: 0.9 },
            { id: "research", weight: 0.8 },
            { id: "phenomenology", weight: 0.6 },
            { id: "structure", weight: 0.5 },
            { id: "fabrication", weight: 0.4 },
        ],
        // Dipper: bowl of four, handle trailing off
        asterism: {
            stars: {
                "student-driven-village": [0.00, -0.72],
                "physical-model": [0.72, -0.70],
                "research": [0.00, 0.08],
                "structure": [0.72, 0.10],
                "phenomenology": [1.18, 0.52],
                "fabrication": [1.52, 1.00],
            },
            links: [
                ["student-driven-village", "physical-model"],
                ["student-driven-village", "research"],
                ["physical-model", "structure"],
                ["research", "structure"],
                ["structure", "phenomenology"],
                ["phenomenology", "fabrication"],
            ],
        },
    },
    {
        id: "kitch-fish",
        domain: "other",
        title: "Kitsch Fish",
        year: 2026,
        category: "Competition",
        href: "project-detail.html?id=kitch-fish",
        // A bamboo rod that lands sea glass and plastic instead of fish.
        symbol: {
            name: "The catch",
            art: { src: "assets-web/constellations/kitch-fish.svg", box: [30, 0, 260, 140] },
            origin: [165, 100],
            stars: [
                { id: "line", label: "Fishing line", at: [165, 22], side: "left" },
                { id: "bamboo", label: "Bamboo frame", at: [50, 110], side: "below" },
                { id: "glass", label: "Sea glass", at: [205, 82], side: "above" },
                { id: "plastic", label: "Plastic", at: [205, 118], side: "below" },
                { id: "tail", label: "", at: [240, 100], side: "right", minor: true },
                { id: "debris", label: "Debris", at: [265, 80], side: "right" },
                { id: "jeju", label: "Jeju", at: [265, 120], side: "right" },
            ],
            links: [["@", "line"], ["line", "bamboo"], ["@", "glass"], ["@", "plastic"], ["glass", "tail"], ["plastic", "tail"], ["tail", "debris"], ["tail", "jeju"]],
        },
        panelSlot: "top-left",
        attributes: [
            { id: "parametric", weight: 0.9 },
            { id: "fabrication", weight: 0.7 },
            { id: "structure", weight: 0.6 },
            { id: "optimization", weight: 0.5 },
            { id: "code", weight: 0.4 },
        ],
        // House / pavilion outline
        asterism: {
            stars: {
                "kitch-fish": [0.00, -1.00],
                "parametric": [-0.78, -0.22],
                "optimization": [0.78, -0.22],
                "structure": [-0.78, 0.52],
                "fabrication": [0.78, 0.52],
                "code": [0.00, 1.00],
            },
            links: [
                ["kitch-fish", "parametric"],
                ["kitch-fish", "optimization"],
                ["parametric", "structure"],
                ["optimization", "fabrication"],
                ["structure", "code"],
                ["fabrication", "code"],
            ],
        },
    },
    {
        id: "little-forest",
        domain: "school",
        title: "Little Forest",
        year: 2023,
        category: "School work",
        href: "project-detail.html?id=little-forest",
        // A little dog, after Canis Minor: the park's design rules sit on its head, ear, back, tail and paws.
        symbol: {
            name: "The little dog",
            art: { src: "assets-web/constellations/little-forest.svg", box: [0, 0, 300, 210] },
            origin: [160, 84],
            stars: [
                { id: "rounded", label: "Rounded edges", at: [115, 62], side: "left" },
                { id: "planters", label: "Planter edges", at: [135, 32], side: "above" },
                { id: "frame", label: "Kept frame", at: [240, 84], side: "right" },
                { id: "paths", label: "Looping paths", at: [275, 48], side: "above" },
                { id: "walk", label: "Long walk", at: [150, 172], side: "left" },
                { id: "runs", label: "Dog runs", at: [245, 172], side: "right" },
            ],
            links: [["@", "rounded"], ["rounded", "planters"], ["@", "frame"], ["frame", "paths"], ["@", "walk"], ["frame", "runs"]],
        },
        attributes: [
            { id: "research", weight: 0.8 },
            { id: "phenomenology", weight: 0.7 },
            { id: "physical-model", weight: 0.5 },
            { id: "structure", weight: 0.4 },
        ],
        // Short arc
        asterism: {
            stars: {
                "research": [-0.90, 0.30],
                "little-forest": [-0.20, -0.40],
                "phenomenology": [0.55, -0.10],
                "structure": [0.95, 0.70],
            },
            links: [
                ["research", "little-forest"],
                ["little-forest", "phenomenology"],
                ["phenomenology", "structure"],
            ],
        },
    },
    {
        id: "class-ic",
        domain: "school",
        title: "Class.IC",
        year: 2023,
        category: "School work",
        href: "project-detail.html?id=class-ic",
        // A craftsman's hammer stood up as the tower: workshops up the handle, the lounge at the neck, offices in the head.
        symbol: {
            name: "The hammer",
            art: { src: "assets-web/constellations/class-ic.svg", box: [0, 0, 300, 210] },
            origin: [150, 40],
            stars: [
                { id: "ic", label: "Inter-change", at: [150, 62], side: "left" },
                { id: "classes", label: "One-day class", at: [150, 100], side: "right" },
                { id: "studios", label: "Craft studios", at: [150, 140], side: "right" },
                { id: "waterway", label: "Waterway", at: [150, 182], side: "right" },
                { id: "office", label: "Shared office", at: [95, 40], side: "above" },
                { id: "claw", label: "", at: [205, 36], side: "above", minor: true },
                { id: "green", label: "Green fall", at: [228, 66], side: "right" },
            ],
            links: [["@", "ic"], ["ic", "classes"], ["classes", "studios"], ["studios", "waterway"], ["@", "office"], ["@", "claw"], ["claw", "green"]],
        },
        attributes: [
            { id: "structure", weight: 0.8 },
            { id: "research", weight: 0.7 },
            { id: "physical-model", weight: 0.5 },
        ],
        // Triangle with a tail
        asterism: {
            stars: {
                "class-ic": [0.00, -0.90],
                "structure": [-0.80, 0.30],
                "research": [0.80, 0.25],
                "physical-model": [0.10, 1.00],
            },
            links: [
                ["class-ic", "structure"],
                ["class-ic", "research"],
                ["structure", "research"],
                ["research", "physical-model"],
            ],
        },
    },
    {
        id: "emotional-architecture",
        domain: "other",
        featured: true,
        bias: [0.71, 0.29],
        title: "Emotional Architecture",
        year: 2026,
        category: "Interactive installation",
        href: "project-detail.html?id=emotional-architecture",
        // Two masks, comedy and tragedy: the face is read, and the reading inflates or erodes the space.
        symbol: {
            name: "The two masks",
            art: { src: "assets-web/constellations/emotional-architecture.svg", box: [0, 0, 300, 210] },
            origin: [150, 104],
            stars: [
                { id: "inflate", label: "Inflate", at: [100, 168], side: "below" },
                { id: "erode", label: "Erode", at: [205, 176], side: "below" },
                { id: "valence", label: "Valence & arousal", at: [70, 68], side: "above" },
                { id: "eeg", label: "EEG", at: [232, 72], side: "right" },
                { id: "face", label: "Face", at: [150, 28], side: "above" },
            ],
            links: [["@", "inflate"], ["@", "erode"], ["inflate", "valence"], ["erode", "eeg"], ["valence", "face"], ["face", "eeg"]],
        },
        attributes: [
            { id: "ai", weight: 0.9 },
            { id: "interaction", weight: 0.9 },
            { id: "code", weight: 0.8 },
            { id: "parametric", weight: 0.7 },
            { id: "research", weight: 0.6 },
            { id: "phenomenology", weight: 0.5 },
        ],
        // Orion-like: shoulders, belt, hanging sword
        asterism: {
            stars: {
                "ai": [-0.88, -1.00],
                "interaction": [0.88, -0.92],
                "emotional-architecture": [0.00, -0.12],
                "code": [-0.68, 0.08],
                "research": [0.70, 0.12],
                "phenomenology": [0.12, 0.68],
                "parametric": [0.18, 1.12],
            },
            links: [
                ["ai", "code"],
                ["ai", "emotional-architecture"],
                ["interaction", "emotional-architecture"],
                ["interaction", "research"],
                ["code", "emotional-architecture"],
                ["emotional-architecture", "research"],
                ["emotional-architecture", "phenomenology"],
                ["phenomenology", "parametric"],
            ],
        },
    },
    {
        id: "sida",
        domain: "other",
        title: "Sida",
        year: 2026,
        category: "AI tool · in progress",
        bias: [0.61, 0.09],
        href: "project-detail.html?id=sida",
        // A drafting lamp clamped to the table: it lights the facts on the desk and leaves the drawing to the designer.
        symbol: {
            name: "The desk lamp",
            art: { src: "assets-web/constellations/sida.svg", box: [0, 0, 300, 210] },
            origin: [190, 48],
            stars: [
                { id: "conductor", label: "Conductor", at: [90, 90], side: "left" },
                { id: "table", label: "Drafting table", at: [60, 180], side: "below" },
                { id: "model", label: "Cut model", at: [212, 128], side: "right" },
                { id: "ordinance", label: "Ordinance", at: [212, 176], side: "below" },
                { id: "site", label: "Site facts", at: [150, 176], side: "below" },
                { id: "citation", label: "Citation", at: [262, 170], side: "above" },
            ],
            links: [["@", "conductor"], ["conductor", "table"], ["@", "model"], ["model", "ordinance"], ["ordinance", "site"], ["ordinance", "citation"]],
        },
        attributes: [
            { id: "ai", weight: 0.95 },
            { id: "code", weight: 0.9 },
            { id: "research", weight: 0.7 },
            { id: "interaction", weight: 0.5 },
        ],
        // Arrow: a shaft of reasoning with a head
        asterism: {
            stars: {
                "research": [-1.00, 0.40],
                "sida": [-0.20, 0.05],
                "code": [0.55, -0.35],
                "ai": [0.95, 0.20],
                "interaction": [0.40, 0.80],
            },
            links: [
                ["research", "sida"],
                ["sida", "code"],
                ["code", "ai"],
                ["sida", "interaction"],
            ],
        },
    },
    {
        id: "deary",
        domain: "other",
        title: "Deary",
        year: 2026,
        category: "Personal project",
        bias: [0.86, 0.72],
        href: "project-detail.html?id=deary",
        // Questions and answers on one page, follow-ups and the entry on the other.
        symbol: {
            name: "The open book",
            art: { src: "assets-web/constellations/deary.svg", box: [30, 24, 240, 156] },
            origin: [150, 160],
            stars: [
                { id: "guard", label: "Guardrail", at: [150, 68], side: "above" },
                { id: "question", label: "Question", at: [55, 45], side: "above" },
                { id: "answer", label: "Answer", at: [55, 140], side: "below" },
                { id: "followup", label: "Follow-up", at: [245, 45], side: "above" },
                { id: "entry", label: "Entry", at: [245, 140], side: "below" },
            ],
            links: [["@", "guard"], ["guard", "question"], ["question", "answer"], ["answer", "@"], ["guard", "followup"], ["followup", "entry"], ["entry", "@"]],
        },
        attributes: [
            { id: "code", weight: 0.9 },
            { id: "ai", weight: 0.8 },
            { id: "interaction", weight: 0.8 },
        ],
        // Small kite
        asterism: {
            stars: {
                "code": [0.00, -1.00],
                "deary": [-0.78, 0.06],
                "ai": [0.78, 0.04],
                "interaction": [0.00, 0.98],
            },
            links: [
                ["code", "deary"],
                ["code", "ai"],
                ["deary", "interaction"],
                ["ai", "interaction"],
            ],
        },
    },
];

export const portfolio = { projects, attributes };
export default portfolio;
