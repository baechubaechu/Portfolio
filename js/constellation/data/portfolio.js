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
 *
 * Attributes are shared: every project that lists "parametric"
 * connects to the same single Parametric node.
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
    },
    {
        id: "parametric-pavilion",
        title: "Parametric Pavilion",
        year: 2024,
        category: "School work",
        detailId: "parametric-pavilion",
        href: "project-detail.html?id=parametric-pavilion",
        attributes: [
            { id: "parametric", weight: 0.9 },
            { id: "optimization", weight: 0.8 },
            { id: "structure", weight: 0.7 },
            { id: "fabrication", weight: 0.6 },
            { id: "code", weight: 0.4 },
        ],
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
    },
];

export const portfolio = { projects, attributes };
export default portfolio;
