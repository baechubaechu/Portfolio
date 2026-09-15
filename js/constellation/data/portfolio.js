/**
 * Portfolio graph data.
 *
 * This is the ONLY file you need to edit to add / remove / reconnect
 * projects and attributes. The graph, layout and UI are derived from it.
 *
 * ─ Attribute ───────────────────────────────────────────────
 *   id     unique slug, referenced by projects
 *   label  display name
 *
 * ─ Project ─────────────────────────────────────────────────
 *   id          unique slug (must not collide with an attribute id)
 *   title       display name (kept short: it is drawn on the map)
 *   year        number
 *   category    short label shown in the info panel
 *   href        detail page URL. `null` → shown as "in progress" (no link)
 *   detailId    optional: id inside js/projects.js (used for the
 *               localStorage fallback that project-detail.html expects)
 *   attributes  [{ id, weight }]  weight ∈ [0, 1]
 *               higher weight → shorter, stronger, more opaque link
 *   asterism    optional figure drawn on select:
 *               { stars: { [id]: [x, y] }, links: [[a, b], ...] }
 *               Coordinates are relative (−1…1). Include the project
 *               and every attribute; links are a sparse constellation
 *               (not a hub). Omitted → a count-based template is used.
 *   panelSlot   optional card corner: "top-left" | "top-right" |
 *               "bottom-left" | "bottom-right". Omitted → auto.
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
        title: "X-tra Space",
        year: 2026,
        category: "School work",
        href: null, // in progress — no detail page yet
        attributes: [
            { id: "parametric", weight: 0.9 },
            { id: "phenomenology", weight: 0.8 },
            { id: "research", weight: 0.7 },
            { id: "structure", weight: 0.6 },
            { id: "physical-model", weight: 0.5 },
        ],
        // Cassiopeia-like W, phenomenology as a northern spur
        asterism: {
            stars: {
                "physical-model": [-1.00, -0.35],
                "research": [-0.42, 0.52],
                "xtra-space": [0.06, -0.22],
                "parametric": [0.58, 0.48],
                "structure": [1.00, -0.38],
                "phenomenology": [-0.12, 1.00],
            },
            links: [
                ["physical-model", "research"],
                ["research", "xtra-space"],
                ["xtra-space", "parametric"],
                ["parametric", "structure"],
                ["research", "phenomenology"],
            ],
        },
    },
    {
        id: "student-driven-village",
        title: "Student Driven Village",
        year: 2025,
        category: "School work",
        detailId: "Student Driven Village",
        href: "project-detail.html?id=Student%20Driven%20Village",
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
        id: "parametric-pavilion",
        title: "Parametric Pavilion",
        year: 2024,
        category: "School work",
        detailId: "parametric-pavilion",
        href: "project-detail.html?id=parametric-pavilion",
        panelSlot: "top-left",
        attributes: [
            { id: "parametric", weight: 0.9 },
            { id: "optimization", weight: 0.8 },
            { id: "structure", weight: 0.7 },
            { id: "fabrication", weight: 0.6 },
            { id: "code", weight: 0.4 },
        ],
        // House / pavilion outline
        asterism: {
            stars: {
                "parametric-pavilion": [0.00, -1.00],
                "parametric": [-0.78, -0.22],
                "optimization": [0.78, -0.22],
                "structure": [-0.78, 0.52],
                "fabrication": [0.78, 0.52],
                "code": [0.00, 1.00],
            },
            links: [
                ["parametric-pavilion", "parametric"],
                ["parametric-pavilion", "optimization"],
                ["parametric", "structure"],
                ["optimization", "fabrication"],
                ["structure", "code"],
                ["fabrication", "code"],
            ],
        },
    },
    {
        id: "abraxas",
        title: "Abraxas",
        year: 2026,
        category: "Competition",
        detailId: "ABRAXAS",
        href: "project-detail.html?id=ABRAXAS",
        attributes: [
            { id: "phenomenology", weight: 0.9 },
            { id: "research", weight: 0.7 },
            { id: "ai", weight: 0.4 },
        ],
        // Lozenge — two pairs facing each other
        asterism: {
            stars: {
                "phenomenology": [0.00, -1.00],
                "abraxas": [-0.88, 0.02],
                "research": [0.88, 0.02],
                "ai": [0.00, 0.98],
            },
            links: [
                ["phenomenology", "abraxas"],
                ["phenomenology", "research"],
                ["abraxas", "ai"],
                ["research", "ai"],
            ],
        },
    },
    {
        id: "emotional-architecture",
        title: "Emotional Architecture",
        year: 2026,
        category: "Interactive installation",
        detailId: "emotional-architect",
        href: "project-detail.html?id=emotional-architect",
        attributes: [
            { id: "ai", weight: 0.9 },
            { id: "interaction", weight: 0.9 },
            { id: "code", weight: 0.8 },
            { id: "research", weight: 0.6 },
            { id: "parametric", weight: 0.5 },
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
        id: "deary",
        title: "Deary",
        year: 2026,
        category: "Personal project",
        detailId: "deary",
        href: "project-detail.html?id=deary",
        attributes: [
            { id: "code", weight: 0.9 },
            { id: "ai", weight: 0.8 },
            { id: "interaction", weight: 0.7 },
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
