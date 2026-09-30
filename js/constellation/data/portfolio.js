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
 *   bias        optional [fx, fy] (0…1 of the stage): pulls the project
 *               toward that spot on wide screens, to untangle neighbours.
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
        title: "X-tra Space",
        year: 2026,
        category: "Graduation project",
        href: "project-detail.html?id=xtra-space",
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
        title: "Student Driven Village",
        year: 2025,
        category: "School work",
        href: "project-detail.html?id=student-driven-village",
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
        title: "Emotional Architecture",
        year: 2026,
        category: "Interactive installation",
        href: "project-detail.html?id=emotional-architecture",
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
        bias: [0.62, 0.2],
        href: "project-detail.html?id=sida",
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
