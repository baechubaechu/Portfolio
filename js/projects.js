/**
 * Project content for the cards (index.html) and the detail pages (project-detail.html).
 *
 *   id           slug, the same as the project's id in js/constellation/data/portfolio.js
 *                and the ?id= of its detail page
 *   aliases      optional older ids that still resolve (old links keep working)
 *   title, description, thumbnail, tags     home cards
 *   kind, thesis, subtitle, category, role, timeline, team, organizer, cover
 *                the opening plate of the detail page
 *   chapters     the detail page body: [{ id, label, title, lead, blocks: [...] }]
 *   sections     legacy block list, only rendered for a project that is not on the home sky
 */
const projectsData = {
    schoolWorks: [
        {
            id: "xtra-space",
            title: "X-tra Space",
            description: "A graduation project that re-layers Geumjeong Station's transfer hub so fast and slow flows cross, with an AI operating layer that runs light, sound and display by situation.",
            thumbnail: "assets-web/XS-thumbnail.webp",
            tags: ["Transit Hub Remodel", "Geumjeong Station, Gunpo", "Stacked Circulation Layers", "Sanbon Stream Reopening", "AI-Operated Space", "Graduation Project"],
            kind: "Architecture",
            thesis: "Geumjeong Station is a transfer hub people only pass through. X-tra Space stacks transfer, promenade, urban and auxiliary circulation layers so they cross, and the crossings become new public space. An AI operating layer then manages that space, switching light, sound and display modes from what it senses, and a working version ran live at the graduation show.",
            githubLink: "https://github.com/baechubaechu/Spatial-Environment-Agent",
            subtitle: "Transfer and promenade, fast and slow, moving and staying. Where they cross, an extra space appears.",
            category: "Architecture / Graduation Project",
            role: "Designer · Developer (solo)",
            timeline: "2025.09 - 2026.06",
            cover: "assets-web/XS-cover.webp",
            chapters: [
                {
                    id: "site",
                    label: "Context",
                    title: "A station people only pass through",
                    lead: "Geumjeong Station is transfer infrastructure planned for speed, and it cuts the city and its green axis in two.",
                    blocks: [
                        { kind: "heading", body: "The station as a pass-through device" },
                        { kind: "text", body: "Modern stations are planned around fast movement, clear guidance and transfer efficiency. In the process the station becomes a pass-through device." },
                        { kind: "text", body: "People rarely stop, notice the space, or stay. I chose a transfer hub because it is the most everyday and most functional public space there is." },
                        { kind: "heading", body: "Why Geumjeong" },
                        { kind: "text", body: "I compared bed-town stations served by GTX and three or more lines: Daegok, Bupyeong and Geumjeong." },
                        { kind: "text", body: "Geumjeong, in Gunpo, a bed town that depends on Seoul and Anyang, had the most severance: the rail corridor splits the city, and Sanbon Stream, covered in 1995, is cut along with it. The project builds on the plan to reopen the stream." },
                        { kind: "rules", items: [
                            ["Location", "Geumjeong Station, Gunpo, Gyeonggi-do"],
                            ["Lines", "Seoul Subway Lines 1 and 4, with GTX-C planned"],
                            ["Compared with", "Daegok and Bupyeong, two other bed-town hubs with GTX and three or more lines"],
                            ["Severance", "The rail corridor splits the city; Sanbon Stream, covered in 1995, is cut with it"],
                            ["Given plan", "Reopening Sanbon Stream"]
                        ] },
                        { kind: "gallery", images: [
                            { url: "assets-web/XS-site.webp", caption: "Site diagram. The rail corridor splits the city into two edges; street views from either side." },
                            { url: "assets-web/XS-site-axis.webp", caption: "Green axis within 1 to 3 km. Hills in green, streams in blue; the red dashed line is the covered section of Sanbon Stream meeting the station." }
                        ] },
                        { kind: "image", url: "assets-web/XS-site-context.webp", caption: "Site model with street photos, historical aerials, and a collage of the transfer environment around the station." }
                    ]
                },
                {
                    id: "crossing",
                    label: "Concept",
                    title: "Designing the crossing",
                    lead: "Awareness needs contrast, so the design places contrasting conditions right next to each other.",
                    blocks: [
                        { kind: "text", body: "Senses are always there, but in a familiar, uniform space we stop noticing them. They only become conscious through change. X-tra Space is made by crossing things that are usually kept apart: transfer and promenade, fast and slow, moving and staying, efficiency and sensation, and a fixed building with an atmosphere that responds." },
                        { kind: "image", url: "assets-web/XS-flow.webp", caption: "Flows that are usually kept apart, crossing" },
                        { kind: "rules", items: [
                            ["Low ceiling / narrow passage", "Compression: tension and focus"],
                            ["Height change / crossing flows", "Transition: curiosity and alertness"],
                            ["Void / diffuse light", "Expansion: relief and lingering"]
                        ] },
                        { kind: "list", items: [
                            "Compression: tighten section and width before a crossing.",
                            "Crossing: let the transfer and walking layers meet at a height change.",
                            "Release: open into a void with diffuse light where people can stay."
                        ] }
                    ]
                },
                {
                    id: "layers",
                    label: "Program",
                    title: "Four circulation layers",
                    lead: "The station is rebuilt as stacked layers with different speeds and purposes.",
                    blocks: [
                        { kind: "rules", items: [
                            ["Transfer layer", "Fast movement, transfers, platform connections"],
                            ["Promenade layer", "Walking, detours, connection to the stream"],
                            ["Urban layer", "Links to the city, service space"],
                            ["Auxiliary circulation layer", "Shapes the sense of space, varies the floor levels"],
                            ["X-tra Space", "Sensory transition, where the layers overlap"]
                        ] },
                        { kind: "text", body: "The massing splits the station into two levels: 1F Transfer and 2F Extra. In the final second-floor plan, the transit layer and the walking layer run side by side, and X-tra Space sits at the points where they meet." },
                        { kind: "image", url: "assets-web/XS-plan.webp", caption: "Second floor plan. 1 Transit layer, 2 Walking layer, 3 X-tra Space, 4 Exit, 5 Platform, 6 Concourse, 7 Cafe/Lounge, 8 Observatory deck, 9 Bicycle storage, 10 Station operations, 11 Restroom, 12 Service." },
                        { kind: "image", url: "assets-web/XS-long-section.webp", caption: "Long section along the tracks. Transfer below, the walking level and planted deck above, under one roof." },
                        { kind: "gallery", images: [
                            { url: "assets-web/XS-section1.webp", caption: "Section 1: the X-tra Space above the tracks." },
                            { url: "assets-web/XS-section2.webp", caption: "Section 2: the station body, transfer below and the walking level above." }
                        ] },
                        { kind: "text", body: "X-tra Space is where the layers overlap. Above the tracks, the transfer layer and the walking layer meet at a change in height: people moving fast to their trains pass people walking slowly toward the stream. The section tightens before each crossing and opens after it into a void with diffuse light under the roof, so a space built for passing through gains places to notice the surroundings and stay." }
                    ]
                },
                {
                    id: "structure",
                    label: "Roof Algorithm",
                    title: "A roof drawn by the flows",
                    lead: "Four vaulted roof bands follow the flows underneath and cross where they cross, generated in Grasshopper from two edge curves each.",
                    blocks: [
                        { kind: "text", body: "The roof is not modelled by hand. Each of its four bands is defined only by two edge curves drawn along a flow in plan. A Grasshopper definition turns every pair into a vaulted band with ribs, so when a flow moves, its band is regenerated with it. Where the transfer and walking flows swap sides, the bands cross over each other, and the roof above shows the same crossing as the plan below." },
                        { kind: "image", url: "assets-web/XS-roof-plan.webp", caption: "Roof plan generated by the definition: four bands crossing at both ends of the station." },
                        { kind: "steps", items: [
                            "Edges: two curves per band, drawn along the transfer or walking flow it covers.",
                            "Stations: Tween Curve fills 50 curves between the edges, and lines across the band mark stations along its length.",
                            "Arches: at each station the midpoint is lifted by the roof curvature (2,000 to 3,000 mm) and Arc 3Pt draws an arch through the two edge points and the lifted midpoint.",
                            "Vault: the arches are lofted into one surface, offset for thickness and closed into a solid band.",
                            "Panels: the band is split into panels and lifted 400 mm, leaving slits for light between them.",
                            "Ribs: 50 mm rib profiles are placed every 1,000 mm on perpendicular frames and lofted under the vault."
                        ] },
                        { kind: "image", url: "assets-web/XS-roof-arches.webp", caption: "View along the tracks: each band is an arch of its own curvature, and the bands pass over one another at the crossings." },
                        { kind: "text", body: "The columns come from the same file. Twenty-one columns stand on a 12,000 mm grid; each rises 10,767 mm through the first floor, meets a 400 mm box girder, and continues as a 300 mm-radius pipe that branches into 160 mm pipes to pick up the roof." },
                        { kind: "rules", items: [
                            ["Roof curvature", "2,000 to 3,000 mm rise, set per band"],
                            ["Ribs", "50 mm profile every 1,000 mm"],
                            ["Panel lift", "400 mm"],
                            ["Columns", "21 on a 12,000 mm grid, 10,767 mm to the box girder"],
                            ["Branches", "2F pipe r 300 mm, 8,000 mm long, branching into r 160 mm pipes"]
                        ] }
                    ]
                },
                {
                    id: "ai-operator",
                    label: "AI Operator",
                    title: "AI as the space manager",
                    lead: "The building stays fixed; an operating layer changes the atmosphere to match the situation.",
                    blocks: [
                        { kind: "text", body: "The AI layer is not a feature added to the station. It is the operator of the space. It reads the situation, picks an operating mode, and adjusts light, sound, colour temperature, media and information density. The same architecture can then act as a clear transfer space at rush hour and a slow promenade when it is quiet." },
                        { kind: "rules", items: [
                            ["Crowded", "Transfer mode: bright, clear white light"],
                            ["Quiet", "Promenade mode: softer, slower, warmer light"],
                            ["Night", "Safe but calm: low brightness"],
                            ["Rain", "Sound and illuminance adjusted differently"],
                            ["Event", "X-tra Space activated more strongly"]
                        ] },
                        { kind: "code", filename: "config/auto_strategy.yaml", language: "yaml", caption: "Rules are checked top to bottom and the first match wins. Thresholds were tuned for a small booth.", code: `version: 2
        rules:
          - id: auto_loud
            scene_id: dense_flux
            reason: auto:loud
            decibel_min: 65
          - id: auto_many_people
            scene_id: dense_flux
            reason: auto:crowd
            people_min: 4
          - id: auto_stressed
            scene_id: night_reflect
            reason: auto:stressed
            emotion_in: [stressed]
          # ... calm / neutral rules ...
          - id: auto_default
            match_all: true
            scene_id: calm_gallery
            reason: auto:default` },
                        { kind: "rules", items: [
                            ["dense_flux", "5100 K, 450 ms transition. Crowded, energetic."],
                            ["calm_gallery", "4200 K, 900 ms transition. Calm default."],
                            ["critical_focus", "5900 K, 600 ms transition. Focus on the section and diagrams."],
                            ["night_reflect", "2900 K, 1400 ms transition. Low, warm."]
                        ] },
                        { kind: "image", url: "assets-web/XS-monitor-states.webp", caption: "Four of the ten pre-rendered states of the same interior, varying light level, colour temperature and occupancy. The monitor picks one from the live head count, sound level and current scene." }
                    ]
                },
                {
                    id: "live-system",
                    label: "Live System",
                    title: "A working operating layer",
                    lead: "For the show I built a small real-time version: sense, decide, act, in one room.",
                    blocks: [
                        { kind: "text", body: "I built the system by directing coding agents: I defined the architecture, the event contract, the rules and the scenes, and tested it on site. I did not hand-write the code. The key result is that one laptop server kept a tablet page, the exhibition monitor, a camera and ESP32 NeoPixel lights in sync in real time." },
                        { kind: "steps", items: [
                            "Sense: the camera counts faces locally with MediaPipe and the microphone gives a sound level in dB. Visitors can also touch pins on the tablet floor plan.",
                            "Publish: inputs go onto a Next.js event bus as sensor.state or scene.execute events (60 s TTL; a service counts as stale after 20 s without a heartbeat).",
                            "Decide: a FastAPI scene engine applies the first matching rule and picks a scene. A manual override returns to automatic mode after a timeout.",
                            "Act: the ESP32 boards receive the scene's light settings (push: POST /light/scene, or pull: GET /device/light/next), and the monitor switches to the matching space image and diagram."
                        ] },
                        { kind: "techs", items: [
                            { name: "Next.js", note: "Event bus API, tablet floor plan page, monitor page" },
                            { name: "FastAPI", note: "Event polling, scene engine, light and display drivers" },
                            { name: "ESP32 + NeoPixel", note: "Scene lighting in the models, push or pull mode" },
                            { name: "MediaPipe", note: "Face detection in the browser, no cloud call" },
                            { name: "YAML config", note: "auto_strategy.yaml rules, scenes.yaml per-scene light, sound and display" }
                        ] },
                        { kind: "image", url: "assets-web/XS-ui.webp", caption: "Monitor page, re-run on a laptop after the show with no camera attached. Mode, crowd, noise and flow status on top; the live camera view on the left; the space response render on the right." },
                        { kind: "links", items: [
                            { label: "Source code on GitHub", url: "https://github.com/baechubaechu/Spatial-Environment-Agent" }
                        ] }
                    ]
                },
                {
                    id: "exhibition",
                    label: "Photos",
                    lead: "The booth at the graduation show.",
                    blocks: [
                        { kind: "image", url: "assets-web/XS-booth-wide.webp", caption: "The booth: panels, the live monitor with its camera, the site and section models, and the tablet" },
                        { kind: "gallery", images: [
                            { url: "assets-web/XS-photo-3.webp", caption: "Tablet input" },
                            { url: "assets-web/XS-photo-4.webp", caption: "Live monitor over the section model" }
                        ] },
                        { kind: "gallery", images: [
                            { url: "assets-web/XS-photo-6.webp", caption: "Section model" },
                            { url: "assets-web/XS-photo-7.webp", caption: "Roof vaults on branching columns" },
                            { url: "assets-web/XS-photo-8.webp", caption: "Roof ribs, close up" }
                        ] }
                    ]
                }
            ]
        },
        {
            id: "student-driven-village",
            aliases: ["Student Driven Village"],
            title: "Student Driven Village",
            description: "A Multi-layered Residential Complex Mediated by Student Initiatives.",
            thumbnail: "assets-web/4-1 thumbnail.webp",
            tags: ["Housing Complex", "Gwacheon Jugong Reconstruction", "Shared Halls for 5 Schools", "Semi-public Layer", "Yangjae Stream"],
            kind: "Architecture",
            thesis: "Gwacheon's Jugong reconstruction is bringing in more families with school-age children, but the new complexes stay gated. We proposed a housing complex that uses those students as the link: club rooms and large shared halls for five nearby schools, set under the housing and open to residents too. Midway we saw that the halls had created a new boundary next to private homes, and we reorganized the scheme around a semi-public layer between them.",
            subtitle: "Gwacheon, a village changed by students: a neighbourhood platform built around student clubs",
            category: "Architecture / Studio",
            role: "Designer (2-person team)",
            timeline: "2025.03 - 2025.06",
            cover: "assets-web/4-1 thumbnail.webp",
            chapters: [
                {
                    id: "context",
                    label: "Context",
                    lead: "Reconstruction brings more students to Gwacheon, but the new complexes stay closed to their neighbours.",
                    blocks: [
                        { kind: "text", body: "The site is a Gwacheon Jugong apartment complex under reconstruction, next to the Yangjae stream. Gwacheon's new complexes respond to the old gated-community problem with more ground-floor openings, but more entrances did not remove the invisible boundary between residents and outsiders. We expect that boundary to get stronger as more complexes are rebuilt." },
                        { kind: "rules", items: [
                            ["Brief", "2025 GH Space Welfare Youth Competition (studio-linked): space welfare for apartment complexes in a hyper-local era"],
                            ["Site", "A Gwacheon Jugong complex under reconstruction, beside the Yangjae Stream, Gwacheon, Gyeonggi-do"],
                            ["Reconstruction", "Three rounds since 2002, still under way"],
                            ["Schools within 500 m", "Gwacheon Elem. 724 students · Gwanmun Elem. 618 · Cheonggye Elem. 939 · Gwacheon Middle 911 · Gwacheon High 572"]
                        ] },
                        { kind: "list", items: [
                            "Over the last three years of city data, the number of schools grew by about two a year as reconstruction finished, against the overall trend.",
                            "The 2035 Gwacheon master plan expects about 140,000 residents and 56,000 households, close to double today's household count.",
                            "The city's population cap went from 77,000 (2010) to 97,000 (2020) to 140,000 (2035).",
                            "Taking 3–4 person households as households with children, Gwacheon's share is clearly higher than both the national and the Seoul figures."
                        ] },
                        { kind: "image", url: "assets-web/SDV-schools.webp", caption: "Five schools within 500 m of the site (about a 10-minute walk), inside the walking catchment set in the GH brief." }
                    ]
                },
                {
                    id: "concept",
                    label: "Concept",
                    lead: "Students as the medium: blurring the boundary through the children who already cross it every day.",
                    blocks: [
                        { kind: "text", body: "Gated complexes isolate their residents from the neighbourhood, and more entrances have not changed that. Gwacheon, though, has an unusually high share of students, and students already move between complexes, schools and streets. We proposed an open community platform that uses them as the social medium. A relationship between two students extends to their siblings and parents, so a place where students meet becomes a place where families and generations meet." },
                        { kind: "rules", items: [
                            ["Vertical blurring", "Between residents and outsiders: a shared public level that both can reach"],
                            ["Horizontal blurring", "Among residents: corridors widened into shared space for each household type"]
                        ] },
                        { kind: "image", url: "assets-web/SDV-concept.webp", caption: "Ties among students widen to their brothers, sisters and parents" }
                    ]
                },
                {
                    id: "program",
                    label: "Program",
                    lead: "Give students from different schools a reason to meet: room for the clubs they already belong to.",
                    blocks: [
                        { kind: "text", body: "Our starting question was simple: if students had a place to do what they like together, would they share hobbies and time even with friends from other schools? We surveyed the clubs of the five nearby schools and grouped them into four themes. Each theme gets club rooms plus a large hall where students can show what they practise or make." },
                        { kind: "rules", items: [
                            ["Performance (band, dance, theatre, orchestra, vocal)", "Performance hall and stage; residents use it for small concerts and film screenings"],
                            ["Sports (football, basketball, badminton, jump rope)", "Indoor and outdoor sports centre; residents use it for community sports programs"],
                            ["Making (architecture class, crafts, photography)", "Exhibition gallery; residents use it for art activities and a village archive"],
                            ["Nature and life (gardening, eco volunteering, dog club, cooking)", "Urban garden; residents use it as an intergenerational community garden"]
                        ] },
                        { kind: "text", body: "Halls at this scale could not be kept for students only, around the clock. They were planned from the start to be shared with the people who live there." },
                        { kind: "gallery", images: [
                            { url: "assets-web/SDV-program.webp", caption: "School clubs grouped into four themes, each tied to a large hall and to a resident use." },
                            { url: "assets-web/SDV-layers.webp", caption: "Section diagram: outdoor, public hall, semi-public intermediate space, private housing." }
                        ] }
                    ]
                },
                {
                    id: "layout",
                    label: "Site Layout",
                    lead: "The halls meant to blur the boundary ended up creating a new one, so the layout was rebuilt in layers.",
                    blocks: [
                        { kind: "text", body: "Once the halls were combined with the housing, a fully open hall sat directly against very private homes, and two very different kinds of space side by side made another boundary. The site layout was developed step by step to put a semi-public layer between them." },
                        { kind: "steps", items: [
                            "Sunken passage: a route at basement level links the Yangjae stream to the far side of the site without crossing the road.",
                            "Community masses on the north and south ends lead people down into the sunken passage.",
                            "Masses on the ground level draw people in from the streets on both sides.",
                            "Large halls (exhibition hall, gym, open restaurant, performance hall) are placed along the sunken street.",
                            "A smaller semi-public intermediate space sits on each hall, using the hall's roof as its terrace.",
                            "Housing goes on top, kept apart from the halls by the intermediate layer."
                        ] },
                        { kind: "gallery", images: [
                            { url: "assets-web/SDV-layout-1.webp", caption: "Sunken passage" },
                            { url: "assets-web/SDV-layout-2.webp", caption: "Community masses leading into the sunken passage" },
                            { url: "assets-web/SDV-layout-3.webp", caption: "Entrances from the ground level" }
                        ] },
                        { kind: "gallery", images: [
                            { url: "assets-web/SDV-layout-4.webp", caption: "Large halls" },
                            { url: "assets-web/SDV-layout-5.webp", caption: "Intermediate spaces" },
                            { url: "assets-web/SDV-layout-6.webp", caption: "Housing" }
                        ] }
                    ]
                },
                {
                    id: "units",
                    label: "Housing Units",
                    lead: "Blurring the boundary among residents: the corridor is widened differently for each household type.",
                    blocks: [
                        { kind: "text", body: "Families: the second living room and kitchen of each unit open onto the corridor, and a lowered pocket space in the corridor in front of them becomes a play area that parents can watch from inside." },
                        { kind: "gallery", images: [
                            { url: "assets-web/SDV-family-plan.webp", caption: "Family housing plan: living room and kitchen facing the pocket space" },
                            { url: "assets-web/SDV-family-section.webp", caption: "Family housing section" }
                        ] },
                        { kind: "text", body: "Young one- and two-person households: they need several small rooms more than one large one, so a shared kitchen, shared office, multipurpose room and party room are hung between the two wings on different levels." },
                        { kind: "gallery", images: [
                            { url: "assets-web/SDV-youth-plan.webp", caption: "Youth housing plan: shared rooms between the two wings" },
                            { url: "assets-web/SDV-youth-section.webp", caption: "Youth housing section" }
                        ] },
                        { kind: "text", body: "Older residents: demand will grow with an ageing society, and older residents look after one another best when they see each other often. Units ring a shared yard that works as a senior centre, with a long terrace in front, and the slabs are linked around voids so neighbours stay in sight across floors." },
                        { kind: "gallery", images: [
                            { url: "assets-web/SDV-senior-plan.webp", caption: "Senior housing plan: units around the shared yard and terrace" },
                            { url: "assets-web/SDV-senior-section.webp", caption: "Senior housing section" }
                        ] }
                    ]
                },
                {
                    id: "drawings",
                    label: "Drawings",
                    lead: "Blurring the boundary vertically, between residents and outsiders.",
                    blocks: [
                        { kind: "text", body: "A sunken passage at stream level lets people enter from the Yangjae stream without crossing the six-lane road. Community masses on the north and south lead people down into it, and a community hub and retail draw them in from ground level. Existing five-storey wall-structure blocks are kept and converted to retail by adding columns and slabs in front of the stair cores." },
                        { kind: "gallery", images: [
                            { url: "assets-web/4-1siteplan.webp", caption: "Site plan" },
                            { url: "assets-web/4-1basementfloorplan.webp", caption: "Basement floor plan: sunken street and halls" },
                            { url: "assets-web/4-1firstfloorplan.webp", caption: "1st floor plan" },
                            { url: "assets-web/4-1fourthfloorplan.webp", caption: "4th floor plan" },
                            { url: "assets-web/4-1typicalfloorplan.webp", caption: "Typical housing floor plan" }
                        ] }
                    ]
                },
                {
                    id: "model",
                    label: "Render&Model",
                    lead: "Renders of the finished complex, a site model for the whole scheme and cut models showing how the corridors open up.",
                    blocks: [
                        { kind: "gallery", images: [
                            { url: "assets-web/4-1render1.webp", caption: "Street and bridge view" },
                            { url: "assets-web/4-1render2.webp", caption: "Ground-level plaza" },
                            { url: "assets-web/4-1render3.webp", caption: "Entrance from the street" },
                            { url: "assets-web/4-1render4.webp", caption: "View from across the stream" }
                        ] },
                        { kind: "text", body: "The site model shows the new housing next to the kept blocks and the stream edge. The cut models open the housing masses to show the widened corridors and in-between spaces." },
                        { kind: "gallery", images: [
                            { url: "assets-web/4-1model1.webp", caption: "Site model, 1:500" },
                            { url: "assets-web/4-1model2.webp" },
                            { url: "assets-web/4-1model3.webp" },
                            { url: "assets-web/4-1model4.webp" },
                            { url: "assets-web/4-1model5.webp" },
                            { url: "assets-web/4-1model6.webp" },
                            { url: "assets-web/4-1model7.webp", caption: "Housing mass seen from above" },
                            { url: "assets-web/4-1model8.webp", caption: "Cut model showing the interior" }
                        ] }
                    ]
                }
            ]
        },
        {
            id: "little-forest",
            title: "Little Forest",
            description: "A remodel of the closed Seongsu Technical High School into a pet theme park, a small jungle in the city.",
            thumbnail: "assets-web/LF-thumbnail.webp",
            tags: ["Closed School Remodel", "Pet Theme Park", "Seongsu-dong, Seoul", "Site 13,800 ㎡", "Rounded Terraces"],
            kind: "Architecture",
            thesis: "Seongsu Technical High School closed as student numbers fell. Little Forest turns it into a pet theme park for residents who want hands-on programs and for young visitors drawn to Seongsu. Rounded edges, winding paths that always connect, and planters instead of railings let pets and people walk the whole site safely.",
            subtitle: "A small jungle in the city",
            category: "Architecture / Studio",
            role: "Designer",
            timeline: "2023.09 - 2023.12",
            cover: "assets-web/LF-cover.webp",
            chapters: [
                {
                    id: "site",
                    label: "Context",
                    lead: "A closed technical high school in one of Seoul's busiest trend districts.",
                    blocks: [
                        { kind: "text", body: "School closures caused by low birth rates are no longer only a rural problem. Seongsu Technical High School closed after enrolment fell and applicants moved to specialised high schools. The brief was to reuse a closed school as a productive local space." },
                        { kind: "text", body: "Seongsu is a hot place: restaurants and cafés keep opening along its commercial streets, Seoul Forest and the Han River are close, and gentrification is under way. A Seoul Institute study (2016) recommends giving residents chances to experience the new workshops and cafés." },
                        { kind: "rules", items: [
                            ["Location", "333-128 Seongsu-dong 2-ga, Seongdong-gu, Seoul"],
                            ["Zoning", "Semi-industrial zone, Type 1 district unit plan area"],
                            ["Existing use", "High school"],
                            ["Site area", "13,800 ㎡"],
                            ["Coverage / FAR", "60% / 400%"],
                            ["Parking", "62 required, 80 planned"]
                        ] }
                    ]
                },
                {
                    id: "moves",
                    label: "Concept",
                    lead: "Six decisions for a site shared by pets and people.",
                    blocks: [
                        { kind: "rules", items: [
                            ["No sharp corners", "Masses, terraces and paths are rounded so pets can move safely"],
                            ["Paths that connect", "Winding paths meet and continue in every direction, so no route ends in a dead end and each visitor explores in their own way"],
                            ["Long routes", "The walk is kept long so the landscape keeps changing along it"],
                            ["Face the residents", "The old school opened to the northwest; the new mass turns toward the neighbourhood"],
                            ["Planters, not railings", "Terrace edges are planter boxes, so every walk runs beside greenery"],
                            ["Reuse the school", "Keep part of the existing building and remove the rest (see Reuse)"]
                        ] },
                        { kind: "image", url: "assets-web/LF-mass.webp", caption: "Before and after: mass orientation and the route in from the main road" },
                        { kind: "gallery", images: [
                            { url: "assets-web/LF-concept.webp", caption: "Rounded terraces and parks" },
                            { url: "assets-web/LF-jungle.webp", caption: "A small jungle in the city" }
                        ] }
                    ]
                },
                {
                    id: "program",
                    label: "Program",
                    lead: "Something to do for residents, something new for visitors.",
                    blocks: [
                        { kind: "text", body: "Residents need hands-on experiences; young visitors follow trends. Pets serve both. Seongdong-gu already has many pet-friendly restaurants and cafés but no pet hotel, and none of Korea's pet theme parks is in Seoul." },
                        { kind: "rules", items: [
                            ["Pet households", "5.52 million at the end of 2022; 12.62 million people live with pets"],
                            ["Capital region", "25.9% of all households keep pets"],
                            ["Pet industry", "Grows 14.5% a year on average"],
                            ["Seoul", "No pet theme park"]
                        ] },
                        { kind: "list", items: [
                            "With pets: play (large- and small-dog runs, agility, pool, bathing, walking paths), education (training, behaviour classes), hotel (rooms, café and restaurant), care (animal hospital and rehabilitation, grooming, counselling, shop).",
                            "Without pets: exhibition, community rooms, multipurpose hall, offices, parking."
                        ] },
                        { kind: "image", url: "assets-web/LF-program.webp", caption: "Program diagram: with pets above the line, without pets below" }
                    ]
                },
                {
                    id: "reuse",
                    label: "Reuse",
                    lead: "Remove what blocks the park, keep what can carry the new program.",
                    blocks: [
                        { kind: "text", body: "The demolition plan sorts the existing school into two kinds of removal: parts demolished entirely, and parts where only columns and walls come out. The long block on the northeast edge stays and holds the rehabilitation, care and hotel floors; a new curved wing adds the shop, counselling and education rooms." },
                        { kind: "image", url: "assets-web/LF-demolition.webp", caption: "Demolition plan: hatched = demolished entirely, orange = columns and walls removed" },
                        { kind: "note", body: "The drawings mark what is removed. They do not say how the kept structure is strengthened." }
                    ]
                },
                {
                    id: "drawings",
                    label: "Drawings",
                    lead: "Parks at ground level, a care and hotel wing above, green edges throughout.",
                    blocks: [
                        { kind: "text", body: "The ground floor holds the exhibition, lockers and showers, a pool, pet showers, a greenhouse garden, a shop, a café, and separate large- and small-dog runs. The second floor has rehabilitation, recovery, emergency, CT, clinic and surgery rooms, grooming and counselling. Hotel rooms sit above, agility is on the top floor, and parking and a water tank are below ground." },
                        { kind: "gallery", images: [
                            { url: "assets-web/LF-plan-1f.webp", caption: "Ground floor plan" },
                            { url: "assets-web/LF-plan-2f.webp", caption: "2nd floor plan" },
                            { url: "assets-web/LF-plan-3f.webp", caption: "3rd floor plan" }
                        ] },
                        { kind: "gallery", images: [
                            { url: "assets-web/LF-plan-4f.webp", caption: "4th floor plan" },
                            { url: "assets-web/LF-plan-5f.webp", caption: "5th floor plan" },
                            { url: "assets-web/LF-plan-roof.webp", caption: "Roof plan" }
                        ] },
                        { kind: "gallery", images: [
                            { url: "assets-web/LF-section-drawing.webp", caption: "Section, 1:200" },
                            { url: "assets-web/LF-section-detail.webp", caption: "Section detail, 1:50: planter boxes form the terrace edge" }
                        ] }
                    ]
                },
                {
                    id: "model",
                    label: "Render&Model",
                    lead: "The terraces from the lawn and the street, and a model of the planted edges.",
                    blocks: [
                        { kind: "gallery", images: [
                            { url: "assets-web/LF-render-snow.webp", caption: "From the lawn in winter" },
                            { url: "assets-web/LF-render-street.webp", caption: "From the street" }
                        ] },
                        { kind: "gallery", images: [
                            { url: "assets-web/LF-elevation-south.webp", caption: "South elevation" },
                            { url: "assets-web/LF-elevation-right.webp", caption: "Side elevation" }
                        ] },
                        { kind: "gallery", images: [
                            { url: "assets-web/LF-model-4.webp" },
                            { url: "assets-web/LF-model-1.webp", caption: "Model from above" },
                            { url: "assets-web/LF-model-6.webp" }
                        ] },
                        { kind: "gallery", images: [
                            { url: "assets-web/LF-model-2.webp", caption: "Stacked planted terraces" },
                            { url: "assets-web/LF-model-5.webp" },
                            { url: "assets-web/LF-model-3.webp", caption: "Terrace edge close-up" },
                            { url: "assets-web/LF-model-7.webp" }
                        ] }
                    ]
                }
            ]
        },
        {
            id: "class-ic",
            title: "Class.IC",
            description: "A shared office in Euljiro that gathers the district's scattered craft workshops into one tower, with one-day classes and lounges between them.",
            thumbnail: "assets-web/CI-thumbnail.webp",
            tags: ["Shared Office Tower", "Euljiro Craft Workshops", "B5 / 17F", "GFA 23,000 ㎡", "One-day Classes"],
            kind: "Architecture",
            thesis: "Redevelopment in Euljiro is replacing its workshop streets with office blocks. Class.IC keeps the workshops by stacking them in one building: craft studios and one-day classes on the lower floors, a shared office above, and lounges where shop owners, office workers and class visitors meet. The name joins one-day Class with IC (Inter-Change, 나들목).",
            subtitle: "Euljiro's workshop streets, stacked into one building",
            category: "Architecture / Studio",
            role: "Designer",
            timeline: "2023.03 - 2023.06",
            cover: "assets-web/CI-cover.webp",
            chapters: [
                {
                    id: "context",
                    label: "Context",
                    lead: "A historic craft district that is being rebuilt as offices.",
                    blocks: [
                        { kind: "text", body: "The site is in Euljiro 3-ga, one minute from Euljiro 3-ga Station (Lines 2 and 3), with Sewoon Sangga to the east and Cheonggyecheon to the north. Since the late Joseon period the area grew into themed streets for tiles, tools, printing, ceramics, glass, wood and metal work." },
                        { kind: "text", body: "Office redevelopment is moving in from the west. The site sits inside an urban environment improvement district, so the nearby workshops and the Nogari alley to the north are expected to disappear. There is no green space within 500 m." },
                        { kind: "text", body: "An old waterway, Ijeondongcheon (이전동천), once ran across the site toward Cheonggyecheon. Restoring it earns FAR relief, and the project takes it as the base of its green strategy: the Green Fall and the riverside section both start from this line." },
                        { kind: "image", url: "assets-web/CI-waterway.webp", width: "55%", caption: "Ijeondongcheon, the old waterway (green line) running through the site (dark box)" },
                        { kind: "rules", items: [
                            ["Location", "65-13 Euljiro 3-ga, Jung-gu, Seoul"],
                            ["Zoning", "General commercial zone, fire prevention district, historic downtown (inside the four gates), redevelopment district"],
                            ["Site area", "about 2,940 ㎡ (building area 1,660 ㎡)"],
                            ["Coverage", "60% max; 69% for the podium (up to 5 floors / 20 m)"],
                            ["FAR", "600% base, 780% allowed, 1,004% upper limit with incentives"],
                            ["Scale", "B5 / 17F, about 70 m, GFA about 23,000 ㎡, reinforced concrete"]
                        ] }
                    ]
                },
                {
                    id: "concept",
                    label: "Concept",
                    lead: "What Euljiro needs is cultural succession: a building that carries the district's craft forward as its symbol.",
                    blocks: [
                        { kind: "text", body: "The name splits CLASSIC, the classic of Euljiro, into two parts. CLASS is the one-day class, where the workshops teach their craft to visitors. IC is the Inter-Change (나들목), the lounges and rest spaces where workshop owners, class visitors and office workers cross paths." },
                        { kind: "rules", items: [
                            ["CLASSIC", "Classic of Euljiro: the craft studios, and nature brought back along the old waterway"],
                            ["CLASS", "One-day Class: classrooms and meeting rooms"],
                            ["IC", "Inter-Change: lounges and rest"]
                        ] },
                        { kind: "image", url: "assets-web/CI-classic.webp", width: "75%", caption: "CLASSIC splits into CLASS and IC" },
                        { kind: "image", url: "assets-web/CI-mass.webp", width: "75%", caption: "Mass diagram: mass and core, Green Fall, separate, program and openings, material" }
                    ]
                },
                {
                    id: "program",
                    label: "Program",
                    lead: "Workshops below, a shared office above, lounges in between.",
                    blocks: [
                        { kind: "text", body: "After working from home, office workers value flexible hours, a horizontal atmosphere, private corners and room for activities outside work. Most companies cannot build their own building, and tenants rarely have budget for open amenity space, so a shared office with communal space in an area that already has infrastructure fits the demand. The workshops being pushed out by redevelopment fill the lower floors." },
                        { kind: "rules", items: [
                            ["Class", "One-day classes run by the relocated workshops: ceramics, woodwork, lighting, glass, metal, sewing"],
                            ["Development", "Public meeting rooms for reading, painting, dance, music, film, parties and photography"],
                            ["IC (Inter-Change)", "Public lounge and terraces linking the workshops to the office floors"],
                            ["Office", "Shared office on the upper floors"]
                        ] }
                    ]
                },
                {
                    id: "section",
                    label: "Section",
                    lead: "The old waterway read as a riverside: rest below, work above.",
                    blocks: [
                        { kind: "text", body: "A riverbank sits lower than the street. Taking that image from the old waterway, the section gives rest and work spaces a vertical order instead of putting them side by side." },
                        { kind: "list", items: [
                            "Lower floors: split (skip) floors put lounges and exchange space on the lower 'river' level and workshops and class rooms on the higher 'bank' level, half a floor apart.",
                            "A water-themed wayfinding line leads visitors up through the class floors.",
                            "Office floors: vertical lounges set between floors so different companies meet.",
                            "Green Fall: a vertical green zone runs through the whole building and airs the large floor plates.",
                            "Below ground: exhibition on B1, parking on B2 to B5."
                        ] },
                        { kind: "gallery", images: [
                            { url: "assets-web/CI-concept.webp", caption: "Split floor on the lower levels, vertical lounge on the office levels" },
                            { url: "assets-web/CI-interior.webp", caption: "Office floor beside the Green Fall" }
                        ] },
                        { kind: "image", url: "assets-web/CI-section.webp", caption: "Section A–A′: split-level workshops and lounges up to about +38 m, offices above" }
                    ]
                },
                {
                    id: "systems",
                    label: "Systems",
                    lead: "Parking, access and egress, checked against the code.",
                    blocks: [
                        { kind: "rules", items: [
                            ["Parking", "1 space per 100 ㎡ of facility area: 230 required, 231 planned"],
                            ["Accessible parking", "Bays 3.3 × 5.0 m"],
                            ["Main entrance", "No level change; approach ≥1.2 m wide, non-slip, with handrails, braille signs and tactile blocks to the core"],
                            ["Corridors", "All ≥1.5 m clear, no steps or obstacles"],
                            ["Elevators", "Accessible cars with a 1.4 × 1.4 m clear space in front; braille blocks under the buttons"],
                            ["Stairs", "≥1.2 m clear width; a landing every 1.8 m of rise; treads ≥28 cm, risers ≤18 cm"],
                            ["Toilets", "Accessible toilets for men and women with grab bars and level floors, on an accessible route"],
                            ["Egress", "Two special evacuation stairs and an emergency elevator; floors split into fire compartments"],
                            ["Escape route", "Room → corridor → vestibule → stair → evacuation floor → outside; refuge space on the roof"]
                        ] },
                        { kind: "note", body: "For an office building, every barrier-free item in the checklist is mandatory except the reception desk, which is recommended." },
                        { kind: "gallery", images: [
                            { url: "assets-web/CI-barrier-free.webp", caption: "Barrier-free plan, ground floor" },
                            { url: "assets-web/CI-egress.webp", caption: "Horizontal and vertical evacuation plans" }
                        ] }
                    ]
                },
                {
                    id: "form",
                    label: "Model",
                    blocks: [
                        { kind: "gallery", images: [
                            { url: "assets-web/CI-model-1.webp", caption: "Model in its urban context" },
                            { url: "assets-web/CI-model-2.webp", caption: "Louvred facade and planted terrace" },
                            { url: "assets-web/CI-model-3.webp", caption: "Stacked masses from above" },
                            { url: "assets-web/CI-model-4.webp", caption: "Front view in the Euljiro block" },
                            { url: "assets-web/CI-model-5.webp", caption: "Planted terrace between the stacked blocks" },
                            { url: "assets-web/CI-model-6.webp", caption: "Stacked blocks from above" }
                        ] }
                    ]
                }
            ]
        }
    ],
    competitions: [
        {
            id: "kitch-fish",
            aliases: ["sangsangblue"],
            title: "Kitsch Fish",
            description: "A 3.6 m competition pavilion for Jeju where sea glass and plastic pieces hang like a school of fish from a frame of bamboo poles, and an honest look at what its 2023 placement logic never checked.",
            thumbnail: "assets-web/KF-thumbnail.webp",
            tags: ["Competition Pavilion", "Jeju Marine Debris", "3.6 m", "Bamboo Frame", "Sea Glass"],
            kind: "Pavilion",
            thesis: "Kitsch Fish is a 2023 competition pavilion about marine debris off Jeju: you look for fish and find garbage. Bamboo poles act as fishing rods, and pieces of sea glass and plastic hang on fishing line where the fish should be. The 2023 Grasshopper definition hung those pieces but never checked spacing, clearance or load, and this page records exactly what they left unchecked.",
            subtitle: "Fishing for garbage instead of fish",
            category: "Pavilion / Competition",
            role: "Team Leader (3-person team)",
            timeline: "2023.05",
            team: "Team 곡란 (Goklan): 김기태 (Suwon Univ.), 최하영 (Seoul Institute of the Arts), 박지훈 (Hongik Univ.)",
            cover: "assets-web/KF-thumbnail.webp",
            chapters: [
                {
                    id: "problem",
                    label: "Problem",
                    lead: "Where there should be fish, there is garbage.",
                    blocks: [
                        { kind: "text", body: "The brief asked for a pavilion of up to 3.6 × 3.6 × 3.6 m at Tamna Cultural Plaza in Jeju City, carrying a message about protecting Jeju's sea. It also asked for the joint materials at each structural part and the installation method, all in an A3 PDF of no more than 10 pages." },
                        { kind: "text", body: "Korea collected 138,362 t of marine debris in 2020. Coastal debris alone more than doubled in two years, from 48,000 t in 2018 to 112,000 t in 2020, and debris washed in by heavy rain and typhoons tripled over the same period. Jeju's own sea has yielded more than 20,000 t a year since 2021, at a collection cost of about 10 billion won a year, and it does not go down however much is picked up." },
                        { kind: "rules", items: [
                            ["Coastal debris", "111,592 t"],
                            ["Seabed debris", "18,212 t"],
                            ["Floating debris", "8,558 t"],
                            ["Total, 2020", "138,362 t"]
                        ] },
                        { kind: "image", url: "assets-web/KF-background.webp", caption: "Background board: the sea that should hold fish, meeting a shore of garbage." }
                    ]
                },
                {
                    id: "idea",
                    label: "Design Idea",
                    lead: "Go fishing, and catch garbage.",
                    blocks: [
                        { kind: "text", body: "The pavilion turns the act of fishing into the message. Bamboo poles lean in like fishing rods, and pieces of debris hang from them on fishing line where a school of fish should be. From a distance it reads as fish; up close it is sea glass and plastic." },
                        { kind: "image", url: "assets-web/KF-idea.webp", caption: "The catch is garbage, and the garbage becomes the fish: sea glass stands in for scales." },
                        { kind: "steps", items: [
                            "Rods: the fishing rod is abstracted into plastic-coated bamboo poles.",
                            "Catch: marine debris is hung on the poles, as if caught on the line.",
                            "Tuning: the type, size and number of pieces are adjusted.",
                            "School: the pieces are arranged until their cloud reads as a fish."
                        ] },
                        { kind: "image", url: "assets-web/KF-process.webp", caption: "Design process board, from poles to a fish made of debris." },
                        { kind: "rules", items: [
                            ["Bamboo, plastic-coated (Ø40 × 3200 mm)", "The fishing rods. Bamboo is used in fishing and aquaculture gear."],
                            ["Sea glass (about Ø60 × 40 mm)", "Fish pieces. Glass broken and worn smooth by the sea, which takes about a million years to break down."],
                            ["Ground plastic granules (5–15 mm)", "Fish pieces. Plastic ground into grains, about 500 years to break down."],
                            ["Fishing line", "Hangs the pieces from the frame. Transparent, about 600 years to break down."]
                        ] },
                        { kind: "image", url: "assets-web/KF-materials.webp", caption: "Main materials board." }
                    ]
                },
                {
                    id: "plan",
                    label: "Plan & Detail",
                    lead: "Poles lean in from a 3.6 m square to a grid overhead, and the school hangs beneath it.",
                    blocks: [
                        { kind: "text", body: "The base is a 3,600 × 3,600 mm platform. The poles stand 3,200 mm tall on 360 mm footings around its edge and lean inward to a lattice about 3,400 mm across at the top. The debris cloud hangs from that lattice over the middle of the platform, while loungers ring the edge so visitors can sit or lie under the school and look up." },
                        { kind: "image", url: "assets-web/KF-plan.webp", caption: "Section and plan (mm): poles lean in to the top grid; the cloud of pieces hangs over the open centre." },
                        { kind: "rules", items: [
                            ["Pole to ground", "Each bamboo pole sits in a socket cast into a round concrete footing."],
                            ["Line to pole", "Fishing line is tied to the pole and drops straight down to the pieces."]
                        ] },
                        { kind: "image", url: "assets-web/KF-detail.webp", caption: "Joint details from the entry: pole to concrete footing, and fishing line to pole." },
                        { kind: "image", url: "assets-web/KF-aerial.webp", caption: "Modeling: the pavilion on Tamna Cultural Plaza." }
                    ]
                },
                {
                    id: "original",
                    label: "Original Definition",
                    lead: "A small 2023 Grasshopper file that hangs the pieces from the ceiling plane.",
                    blocks: [
                        { kind: "text", body: "The file starts from 125 pieces referenced from Rhino. For each piece it takes the area centroid and draws a vertical line up to a referenced ceiling surface (Line SDL, then Line | Plane). The line from the centroid to that intersection is the hanging line, shown as a thin pipe. A template object is copied onto every centroid (Pufferfish Move To Point) and offset in X and Y. Each copy is then rotated about the vertical axis by angles from a Discover 'Continuous' parameter (250 values between 0° and 360°) and previewed with a transparent material (Human)." },
                        { kind: "code", filename: "unnamed.gh (component graph, transcribed)", language: "text", code: "Brep (125 referenced pieces) -> Area -> centroid C\nLine SDL(start C, dir +Z, fixed length) -> Line | Plane(ceiling Brep) -> hang point H\nLine(C, H) -> Pipe(small radius)                 # fishing line\nMove To Point(template, from own centroid, to C) -> Move(+X), Move(+Y) -> Merge\nRotate 3D(angle = Discover Continuous 0..360 deg, center = centroid, axis = Z)\n-> Custom Preview Materials(colour, transparency 0.2)", caption: "Read from the saved file. It contains no script component." }
                    ]
                },
                {
                    id: "limits",
                    label: "Limits",
                    lead: "The 2023 logic placed and hung pieces, but it did not check whether the result could be built.",
                    blocks: [
                        { kind: "list", items: [
                            "Pieces were never checked against each other, so two pieces could overlap without anything flagging it.",
                            "Hanging points came from projecting straight up to a plane, so they land wherever the centroid is, not on the grid nodes or poles that would carry them.",
                            "Line length, load per hanging point, and clear height above visitors were not computed anywhere in the file.",
                            "Placement depended on a random seed and hand-set sliders. There was no record of why one layout was chosen over another."
                        ] },
                        { kind: "text", body: "Three questions follow from this: do any two pieces clash, does every line end on a real support, and is the head height underneath clear?" },
                        { kind: "note", body: "Next: rebuilding the placement logic so these three questions become explicit rules checked in code (planned, 2026)." }
                    ]
                }
            ]
        }
    ],
    otherWorks: [
        {
            id: "sida",
            title: "Sida",
            description: "A local web app that helps architecture students through early design: site facts from government records, ten AI experts around a drafting table, and a site model ready for the laser cutter. It does not design the building for them.",
            thumbnail: "assets-web/SIDA-board.webp",
            tags: ["AI Design Assistant", "Site Facts From Public Records", "10 Expert Agents", "Drafting Table · 3D", "Local Web App · v0.2"],
            githubLink: "https://github.com/baechubaechu/Sida",
            visitLink: "https://sida-kr.duckdns.org",
            kind: "Code · In progress",
            thesis: "Early design in studio starts with a week of collecting: the lot, the zoning, the ordinance, the buildings around it. A general chatbot will answer all of that fluently and get the numbers wrong. Sida (시다, the word Korean architecture schools use for a junior who assists) starts from one site address. It pulls the lot, zoning and legal limits from government records, shows every figure next to the line of law it was read from, and seats ten narrow AI experts around a drafting table where the designer sketches, tests massing and asks questions. What began in July 2026 as a command-line prototype is now a local web app in closed testing (v0.2).",
            subtitle: "An assistant for early design that brings the evidence, not the answer",
            category: "AI Tool / Local Web App",
            role: "Lead developer (team project)",
            timeline: "2026.07 - in progress",
            cover: "assets-web/SIDA-board.webp",
            chapters: [
                {
                    id: "problem",
                    label: "Problem",
                    lead: "A student needs facts about the site and a second opinion on the design. Today's AI tools blur the two.",
                    blocks: [
                        { kind: "text", strong: true, body: "Sida keeps three things apart: what public records say, what an AI reads into them, and what the designer decides." },
                        { kind: "text", body: "A studio project begins with the site: lot area, zoning, coverage and floor area limits, the local ordinance, roads, existing buildings. Each lives in a different government service, and students collect them by hand. Ask a general chatbot instead and it blends site, program and regulation into one confident answer, with code numbers and precedents it has made up." },
                        { kind: "text", body: "The first version of Sida (v0.1, July 2026) was a terminal chat that routed questions to expert prompts. It kept the reasoning organised, but every number still had to be checked by the designer, and nothing could be drawn. The rebuild set out to fix both." },
                        { kind: "rules", items: [
                            ["Numbers are never invented", "Site figures come from government records. Ordinance figures are read by fixed rules. Anything that could not be confirmed stays marked as unconfirmed."],
                            ["Evidence travels with the number", "Each figure is shown with the line of text and the article number it was read from."],
                            ["The designer designs", "What the AI writes is material to review and choose from. It never lands on the drafting table as the answer."]
                        ] }
                    ]
                },
                {
                    id: "site-facts",
                    label: "Site Facts",
                    lead: "Type an address, or click a lot on the cadastral map, and the site sheet fills in from public records.",
                    blocks: [
                        { kind: "steps", items: [
                            "Find the lot: pick province, city and district from lists and type the lot number, paste an address, or click the cadastral map. Several lots can be merged into one site.",
                            "Look it up: lot boundary, land category, area and zoning from V-World, and the existing buildings from the national building register.",
                            "Attach the limits: the statutory building coverage and floor area ratio for that zone, from a table checked against the statute and dated.",
                            "Fetch the ordinance: every article of the municipality's ordinance that deals with coverage or floor area, in full.",
                            "Save it to the project as site_facts.json, which the site sheet, the experts and the 3D view all read."
                        ] },
                        { kind: "rules", items: [
                            ["A record could not be fetched", "The site is still saved, and that item reads 'unconfirmed'. No estimate is filled in."],
                            ["A typo in the address", "Not corrected silently. The designer is asked to search again."],
                            ["Public API keys", "A relay server in Korea holds them. Each tester gets a personal Sida key, approved by hand, limited to 3,000 calls a day. The relay stores no addresses or search terms."]
                        ] },
                        { kind: "text", body: "The Site Reader expert then writes in three separate parts: facts with their source, interpretation with the facts it rests on, and what is still unconfirmed." }
                    ]
                },
                {
                    id: "ordinance",
                    label: "Ordinance Figures",
                    lead: "Ordinance numbers are read by rule, not by a model, and always shown with the sentence they came from.",
                    blocks: [
                        { kind: "text", body: "National law gives a range for each zone; the municipal ordinance fixes the actual figure, sometimes in running text and sometimes in an appended table inside an HWP file. Sida parses the article or the table row for the site's zone with fixed rules. If the text does not resolve to one figure, or the figure falls outside the statutory range, Sida gives no number and shows the text instead." },
                        { kind: "rules", items: [
                            ["Base article", "The row for this site's zone, with the figure and the quoted line"],
                            ["Districts and special areas", "Articles for landscape districts, growth management areas and the like, passed on only when they apply to this lot"],
                            ["Relaxations and tightening", "Listed by title. The designer marks which ones the expert should read in full, and hides the irrelevant ones"]
                        ] },
                        { kind: "text", body: "The screen shows every article. The Regulation Checker receives only the parts that concern this lot, so it is not tempted to apply a relaxation that does not belong. For Sejong-ro 1 in Seoul that cut the ordinance text from about 12,000 characters to 2,900." },
                        { kind: "note", body: "Law search goes to the Korea Ministry of Government Legislation's search service with short queries built from the site facts. The expert's output is a list of things to verify against the original text, not a ruling." }
                    ]
                },
                {
                    id: "experts",
                    label: "Experts",
                    lead: "Ten independent lenses, each with declared inputs and things it must not do. Seven are in regular use, three are on hold.",
                    blocks: [
                        { kind: "rules", items: [
                            ["Site Reader", "Facts, interpretation and unknowns kept apart; how systems meet and cut each other on the site. No program or form proposals, no estimated figures"],
                            ["Program Analyst", "Users and rhythms, adjacency, the public–private gradient. No invented areas"],
                            ["Regulation Checker", "Governing laws and a table of what to verify and where. Never states a figure as settled"],
                            ["Precedent Scout", "3–6 precedents matched to the problem, each with a lesson and a caution"],
                            ["Design Critic", "Jury-style critique against the core problem"],
                            ["Representation Planner", "Which diagrams prove the concept, in what order; recommends the physical site model from values the code computed"],
                            ["Presentation Editor", "Review story, portfolio structure, likely questions"],
                            ["On hold", "Concept Framer, Spatial Reviewer, Systems Advisor. They run when the designer asks by name, but the Conductor does not suggest them"]
                        ] },
                        { kind: "text", body: "The first roster was a fixed pipeline of five, then twelve experts. Design does not run in one order, so each expert became a lens that can run alone and says what it is missing. Two of the twelve, the constraint mapper and the synthesizer, were removed in October: sorting conditions and conflicts is the Conductor's job, in conversation." },
                        { kind: "text", body: "Every output ends with a Handoff section naming who should look next. Adding an expert takes one prompt file and one entry in config.yaml; the Conductor's list and the project's status table are generated from it." }
                    ]
                },
                {
                    id: "conductor",
                    label: "Conductor",
                    lead: "One colleague in the chat who decides which expert to call, and keeps conditions, conflicts and open decisions in order.",
                    blocks: [
                        { kind: "text", body: "The Conductor picks the entry point from what drives the project (site, idea, program or regulation) and from where the designer is actually stuck. It calls experts through function calls, never more than one per reply, and prefers asking one focused question over running anything." },
                        { kind: "code", filename: "sida/conductor.py", language: "tools", code: "run_expert(agent, address?)      # run one expert now; its document is saved and shown back\nread_expert_output(agent)        # open a finished document when the summary is too thin\nread_board(paper)                # open a massing scheme, note or tracing on the drafting table\npropose_paper(kind, title, ...)  # put a scheme or note in the AI section, never on the table", caption: "The four tools the Conductor has." },
                        { kind: "rules", items: [
                            ["Conditions", "Hard (legal, physical, given by the brief) or soft (intentions), each with its source"],
                            ["Conflicts", "Where two experts' outputs pull against each other, naming both"],
                            ["Decisions due now", "The options, what each costs, and which outputs it rests on"],
                            ["Stale views", "Outputs that predate a change in the brief or direction"]
                        ] },
                        { kind: "text", body: "Instead of the whole chat, the Conductor reads a short project_state.md: decisions, open questions, expert status and the next focus. After an expert runs, Sida proposes an update to that file and shows it section by section. The designer applies or skips it, and the previous version is kept. A decision is settled only when the designer confirms it." }
                    ]
                },
                {
                    id: "table",
                    label: "Drafting Table",
                    lead: "The centre of the screen is a table of papers on the site drawing, in plan and in 3D.",
                    blocks: [
                        { kind: "image", url: "assets-web/SIDA-board.webp", caption: "The workspace: the Conductor on the left, the drafting table with a massing scheme among the surrounding buildings in the middle, and layers, experts and properties on the right. Below, a command line takes either a command or a question." },
                        { kind: "rules", items: [
                            ["Site", "The lot drawn from the cadastral boundary. Always on the table"],
                            ["Massing scheme", "Up to 20 blocks with width, depth, floors and rotation, edited with a gumball and push–pull tools"],
                            ["Note · Tracing paper · Photo", "Text, pen strokes over the site, and images or PDF pages"],
                            ["Expert result", "Arrives in a separate AI section when an expert finishes"]
                        ] },
                        { kind: "text", body: "The designer selects papers and sends them along with a question, and can see exactly what text the model receives. What the AI makes, such as an alternative massing scheme, is placed in the AI section beside the table. It reaches the table only if the designer moves it there, and a changed scheme never overwrites the original." },
                        { kind: "text", body: "Thoughts worth keeping go on the idea board. Every expert and the Conductor read those ideas on every call, but have no tool to add, edit or delete them. If an idea conflicts with a finding, they are told to say which and why." }
                    ]
                },
                {
                    id: "model",
                    label: "Surroundings & Model",
                    lead: "The same site data becomes a 3D context, a CAD file and the cutting sheets for a physical model.",
                    blocks: [
                        { kind: "steps", items: [
                            "Context: terrain, contours, roads, pavements, water, neighbouring buildings and lots within 100, 200 or 300 m of the site, built from public map data.",
                            "Check in the city: the massing scheme can be stood on V-World's 3D map, with nearby buildings hidden or shown as a white model.",
                            "Export: the table goes out as DXF for CAD or 3dm for Rhino, in metres, with the surroundings on their own layer.",
                            "Site model: the ground is sliced into contour layers at sheet thickness × scale (3 mm at 1:500 is 1.5 m), buildings are stacked from the same sheets, and the pieces are nested onto the designer's sheet size as DXF, PDF and SVG."
                        ] },
                        { kind: "rules", items: [
                            ["Building height unknown", "Only the footprint is engraved. No height is made up"],
                            ["Height estimated from floors", "Marked as estimated in the piece list and coloured differently in the assembly drawing"],
                            ["Not a survey", "The 3D context carries its sources, their dates and a disclaimer on screen"]
                        ] },
                        { kind: "text", body: "The Representation Planner recommends a sheet, scale and thickness for the model, but only from combinations the code has already computed. One click sets the model up as recommended." }
                    ]
                },
                {
                    id: "build",
                    label: "How It Was Built",
                    lead: "A solo terminal prototype became a team web app in three months, mostly by pairing with coding agents.",
                    blocks: [
                        { kind: "rules", items: [
                            ["Jul 2026", "First CLI prototype: a Conductor and a fixed line of expert prompts"],
                            ["Sep", "Combinable expert roster, automatic project-state updates, a local model option"],
                            ["Early Oct", "Session core separated from the terminal; site facts from government APIs; ordinance figures by rule"],
                            ["Mid Oct", "JSON API for sessions, settings and law search. The terminal CLI was deleted, and a teammate's Figma mock-up was wired to the API as the new screen"],
                            ["Late Oct – Nov", "Drafting table, massing editing, idea board, 3D surroundings, DXF/3dm export, laser-cut model, relay server and landing page"]
                        ] },
                        { kind: "text", body: "The app has three layers: core functions that never print or prompt, a JSON API over them, and a screen in plain HTML, CSS and JavaScript with no build step. Code that serves one expert lives in that expert's own folder and plugs into the core through a hooks file, so a new capability does not touch the shared core. Projects are stored as readable files on the user's own PC, not on a server." },
                        { kind: "text", body: "Most of the code was written with AI coding agents, several at a time, so the repository is set up for that. One rules file tells every agent how to work here. Changes go through pull requests that merge automatically once lint and tests pass, with no human approval, which makes the tests the safety net: every feature or fix has to arrive with its own." },
                        { kind: "techs", items: [
                            { name: "Python · FastAPI" }, { name: "Vanilla JS · Three.js · Leaflet", note: "no build step" },
                            { name: "OpenRouter · ChatGPT sign-in · Ollama", note: "model per role" },
                            { name: "V-World · data.go.kr · law.go.kr", note: "public records" },
                            { name: "pytest · ruff · GitHub Actions" }
                        ] }
                    ]
                },
                {
                    id: "verification",
                    label: "Verification",
                    lead: "More than 650 Python tests and about 150 for the screen's logic run offline, with no model and no network.",
                    blocks: [
                        { kind: "list", items: [
                            "Model calls are replaced by a mock provider, and government APIs by recorded responses, so the whole app runs in tests without a key.",
                            "CI runs lint and tests on Python 3.10 and 3.12 for every pull request; about 100 have been merged this way.",
                            "Some rules are enforced by tests: the shared core may not import an expert's folder, and screen code may not use browser storage.",
                            "A bug fix starts with a test that reproduces the bug. One example: an ordinance figure with a decimal was once read as the wrong whole number, and that case is now held in place by a test."
                        ] },
                        { kind: "note", body: "In progress — v0.2, in closed testing with a small group. Regulation and precedent outputs are lists to verify, not confirmed facts. Experts read text, site data and the table's papers, but not drawings as images. Rhino modeling through MCP worked in the CLI and is not yet connected to the web app; for now the table exports a 3dm file instead." }
                    ]
                }
            ]
        },
        {
            id: "deary",
            title: "Deary",
            description: "An AI-assisted diary app powered by Gemini. Guided questions turn your day into a reflective diary entry.",
            thumbnail: "assets-web/deary_logo.webp",
            tags: ["AI Diary App", "Guided Interview", "Writes Only From Your Answers", "Live Web App"],
            githubLink: "https://github.com/baechubaechu/Deary",
            visitLink: "https://deary1.pages.dev/",
            coverVideo: "https://www.youtube.com/watch?v=GRwoxY0-ZwM",
            kind: "Code",
            thesis: "A blank page is the hardest part of keeping a diary. Deary replaces it with a short interview: it asks concrete questions about today, digs one level deeper only when an answer is thin, checks that there is enough to write from, and then writes the entry strictly from what you said.",
            subtitle: "Dear Day, Daily You.",
            category: "Personal Project",
            role: "UI/UX Designer / Developer",
            timeline: "2026.02~",
            cover: "assets-web/deary_logo.webp",
            chapters: [
                {
                    id: "problem",
                    label: "Problem",
                    lead: "People want a record of their day. The empty page stops them.",
                    blocks: [
                        { kind: "text", body: "Open-ended prompts like \"How was your day?\" get one-line answers, and a one-line answer makes a flat diary. The problem is not writing; it is recalling specific moments on demand." },
                        { kind: "text", body: "So the product question became: what should an interviewer ask, when should it push further, and when should it stop, so that the final entry is both vivid and true?" },
                        { kind: "image", url: "assets-web/deary0.webp", caption: "Home screen" }
                    ]
                },
                {
                    id: "pipeline",
                    label: "Pipeline",
                    lead: "Five model calls, each with one job and its own temperature.",
                    blocks: [
                        { kind: "rules", items: [
                            ["1  generateNextQuestion", "Pick the next question from a themed pool. temp 0.9, JSON output"],
                            ["2  analyzeAnswerForFollowup", "Decide whether this answer needs one follow-up. temp 0.7, JSON"],
                            ["3  reviewAnswersBeforeDiary", "Check the whole set is rich enough to write from. temp 0.7, JSON"],
                            ["4  generateDiary", "Write the entry from the answers only. temp 0.7"],
                            ["5  extractUserProfile", "Update a long-term profile for better questions next time. temp 0.3, JSON"]
                        ] },
                        { kind: "note", body: "Creative steps run warm; judging and extraction run cold. Every JSON step has a deterministic fallback, so an API failure never blocks the user." }
                    ]
                },
                {
                    id: "rules",
                    label: "Question Rules",
                    lead: "An interviewer, not a chatbot.",
                    blocks: [
                        { kind: "rules", items: [
                            ["Pool", "5 themes (morning, highlight, food, work/school, relationships) × 5 questions, in Korean and English"],
                            ["First question", "Always from the morning theme, never a feelings question"],
                            ["Coverage", "Prefer the least-covered theme; vary themes"],
                            ["No repeats", "A generated question that matches any asked question is rejected and replaced by an unasked pool question"],
                            ["Stop", "End after 4+ questions once the main themes are covered"]
                        ] },
                        { kind: "image", url: "assets-web/deary2.webp", caption: "Daily questions" }
                    ]
                },
                {
                    id: "followup",
                    label: "Follow-up Logic",
                    lead: "Dig one level deeper, only when it helps.",
                    blocks: [
                        { kind: "steps", items: [
                            "\"I don't know\" / \"not sure\" → stop and move to the next theme.",
                            "Under 10 characters → a fixed, gentle prompt (no model call).",
                            "Under 50 characters, or facts without reflection → one follow-up that must reference a specific person, place or object from the answer.",
                            "Forbidden: generic \"tell me more\" and direct \"how did you feel?\" questions."
                        ] },
                        { kind: "code", filename: "ai.ts · analyzeAnswerForFollowup (condensed)", language: "TypeScript", code: `const dontKnow = language === "ko"
  ? ["모르겠", "잘 모르겠", "말하기 어려"]
  : ["don't know", "not sure", "can't say"];
if (dontKnow.some((p) => answerLower.includes(p))) {
  return { needsFollowup: false };        // respect the user, move on
}
if (answerLength < 10) {
  return { needsFollowup: true,           // cheap path, no model call
           followupQuestion: GENTLE_PROMPT[language] };
}
// otherwise ask Gemini, with the rules above in the prompt` }
                    ]
                },
                {
                    id: "guardrails",
                    label: "Guardrails",
                    lead: "The diary may only contain what the user said.",
                    blocks: [
                        { kind: "code", filename: "ai.ts · generateDiary", language: "Prompt", code: `You are an 'honest recorder' who summarizes the user's day.

[Rules]
1. Style: past tense. (ate, was happy, felt tired)
2. Fact-based: never invent place, weather or people
   the user didn't mention. (No hallucination)
3. Simple: easy words, no abstract phrases.
4. Flow: connect answers in natural time order.
5. Emotion: reflect the user's feelings vividly.` },
                        { kind: "rules", items: [
                            ["Review gate", "2 or fewer answers, all under 10 characters, or feelings without events → ask one more question before writing"],
                            ["Profile memory", "A hobby or interest is stored only after 2+ mentions; lists are merged, never overwritten"]
                        ] }
                    ]
                },
                {
                    id: "interface",
                    label: "Interface",
                    lead: "Question, answer, entry.",
                    blocks: [
                        { kind: "gallery", images: [
                            { url: "assets-web/deary0.webp", caption: "Home" },
                            { url: "assets-web/deary2.webp", caption: "Daily questions" },
                            { url: "assets-web/deary1.webp", caption: "Generated diary entry" }
                        ] },
                        { kind: "links", items: [
                            { label: "Promo video", url: "https://www.youtube.com/watch?v=GRwoxY0-ZwM" },
                            { label: "Live", url: "https://deary1.pages.dev/" },
                            { label: "GitHub", url: "https://github.com/baechubaechu/Deary" }
                        ] }
                    ]
                }
            ]
        },
        {
            id: "emotional-architecture",
            aliases: ["emotional-architect"],
            title: "Emotional Architecture (with A.I.)",
            description: "Can A.I. understand human emotions? A computational experiment that converts real-time facial expressions and public EEG emotion data into living 3D geometry and AI-rendered architectural space.",
            thumbnail: "assets-web/EAthumbnail.webp",
            tags: ["Emotion → Geometry", "Live Facial Expression", "EEG-driven Corridor", "Exhibited 2026, Seoul"],
            githubLink: "https://github.com/baechubaechu/emotion_sphere",
            visitLink: "https://emotion-sphere.vercel.app",
            bookletLink: "booklet.html",
            kind: "Code",
            thesis: "If AI reads emotion as probability vectors, can those vectors become architecture? A webcam feeds a live pipeline where facial emotion drives a Three.js sphere in the browser, while positive and negative EEG samples from a public Kaggle dataset drive a Rhino script that inflates or erodes a corridor. Exhibited at Culture Stockpile Base, Seoul, January 2026.",
            subtitle: "Form follows Data.",
            category: "Computational Side Project / Interactive Installation",
            role: "Developer / Computational Designer",
            timeline: "January 2026",
            cover: "assets-web/EAcover.webp",
            chapters: [
                {
                    id: "question",
                    label: "Question",
                    lead: "How far can AI read a human emotion, and can a space built from that reading still feel like it?",
                    blocks: [
                        { kind: "text", body: "Architecture usually decides the emotion for the visitor, and AI emotion tools stop at a label and a probability. This project joins the two: it reads the visitor first and lets that reading shape the space. Form follows data." },
                        { kind: "rules", strong: true, items: [
                            ["Reading", "Does the AI understand the emotion, or only imitate its surface?"],
                            ["Translation", "Does the space built from that reading still meet the emotion it came from?"]
                        ] },
                        { kind: "note", body: "Both stay open. The exhibition put them in front of visitors rather than answering them." }
                    ]
                },
                {
                    id: "pipeline",
                    label: "Pipeline",
                    lead: "Two linked experiments, one pipeline each: first read the emotion, then build with it.",
                    blocks: [
                        { kind: "text", body: "The first experiment asks what the AI actually sees when it reads a face. It showed that the model handles emotion as probability vectors, not as feelings. The second takes those vectors as a building material and maps them onto the scale, light and texture of a corridor." },
                        { kind: "text", strong: true, body: "01 · Emotional Sphere: reading emotion live" },
                        { kind: "steps", items: [
                            "Input: a webcam on a tablet captures the visitor's face frame by frame.",
                            "Analysis: Google Vision API detects facial landmarks and returns emotion likelihoods (joy, sorrow, anger, surprise), head pose and the face box.",
                            "Translation: a Python/Flask server normalises the raw values and streams them as JSON, under 100 ms per frame.",
                            "Visualisation: Three.js renders a particle sphere whose vertex displacement follows emotional intensity.",
                            "Archive: each original frame and its vector are saved to Google Cloud Storage."
                        ] },
                        { kind: "techs", items: [
                            { name: "Google Vision API" }, { name: "Python · Flask" }, { name: "Three.js" }, { name: "GCS" }
                        ] },
                        { kind: "text", strong: true, body: "02 · Emotional Space: building with the reading" },
                        { kind: "steps", items: [
                            "Input: positive and negative samples from a public Kaggle EEG emotion dataset; selected frequency bands seed the geometry.",
                            "Script: Python reads the EEG float values and maps them to geometric parameters.",
                            "Geometry: Rhino 8 displaces the corridor mesh, split into wall, ceiling and floor elements.",
                            "AI render: ComfyUI (Z-Image Turbo) with ControlNet adds photoreal textures without changing the computed form.",
                            "Combine: the separately rendered elements are composited in Photoshop."
                        ] },
                        { kind: "techs", items: [
                            { name: "Kaggle EEG dataset" }, { name: "Rhino 8 · Python 3" }, { name: "ComfyUI · ControlNet" }, { name: "Photoshop" }
                        ] }
                    ]
                },
                {
                    id: "mapping",
                    label: "Sphere Mapping Rules",
                    lead: "Turning labels into numbers the geometry can use.",
                    blocks: [
                        { kind: "rules", items: [
                            ["likelihood_to_score()", "VERY_UNLIKELY 0.0 · UNLIKELY 0.2 · POSSIBLE 0.5 · LIKELY 0.8 · VERY_LIKELY 1.0"],
                            ["Valence", "joy − sorrow"],
                            ["Arousal", "surprise + anger"],
                            ["normalize_angle()", "Head pan / tilt / roll in degrees → a vector in −1.0 … 1.0"],
                            ["Sphere", "Emotion score scales simplex-noise displacement of every vertex"],
                            ["Corridor", "Corridor length is a timeline: position along X picks the EEG sample that deforms that slice"]
                        ] },
                        { kind: "code", filename: "emotion_sphere / index.html", language: "JavaScript · Three.js", code: `function deformSphere(emotionScore) {
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(pos, i).normalize();
    const n = noise3D(v.x + t * 0.3, v.y + t * 0.3, v.z + t * 0.3);
    const r = BASE_R + n * emotionScore * 0.4;   // form follows data
    pos.setXYZ(i, v.x * r, v.y * r, v.z * r);
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
}` }
                    ]
                },
                {
                    id: "divergence",
                    label: "Space Algorithm",
                    lead: "One framework, two opposite operations on the same corridor mesh.",
                    blocks: [
                        { kind: "rules", items: [
                            ["Positive · inflate", "Pt + Normal × |EEG| × breath × height² ·⁵ — a sine 'breath' along the corridor, the ceiling rises most, the floor stays walkable"],
                            ["Negative · erode", "Pt + Normal × |EEG| × noise(−1…1) — high-frequency random displacement corrodes walls and ceiling"],
                            ["Walkability", "Vertices below 5 units move at 10% in both cases"]
                        ] },
                        { kind: "code", filename: "GH python3 · Positive Emotion Space", language: "Python · RhinoCommon", code: `for i in range(vertices.Count):
    pt = vertices.Point3dAt(i)
    t = min(max(pt.X / corridor_length, 0), 0.99)     # X axis = time
    eeg = abs(pos_data[int(t * (len(pos_data) - 1))])

    breath   = math.sin(pt.X * wave_frequency) * 0.5 + 0.5
    vertical = (pt.Z / corridor_height) ** 2.5        # cathedral effect
    d = eeg * (breath + 0.2) * (vertical + 0.1) * inflation_scale
    if pt.Z < 5.0:
        d *= 0.1                                      # keep the floor walkable

    vertices.SetVertex(i, pt + Rhino.Geometry.Vector3d(normals[i]) * d)` },
                        { kind: "gallery", images: [
                            { url: "assets-web/EApositive.webp", caption: "Positive: inflation" },
                            { url: "assets-web/EAnegative.webp", caption: "Negative: erosion" }
                        ] }
                    ]
                },
                {
                    id: "rendering",
                    label: "AI Rendering",
                    lead: "The mesh fixes the form; the model only dresses it.",
                    blocks: [
                        { kind: "text", body: "The Rhino viewport capture goes into a ComfyUI workflow with ControlNet, so the generated image keeps the computed geometry. Positive and negative spaces get separate prompt sets for ceiling, wall and floor." },
                        { kind: "image", url: "assets-web/EAcomfy.webp", caption: "ComfyUI workflow" },
                        { kind: "note", body: "Negative prompt ends with: \"don't change the other part from the original picture.\"" }
                    ]
                },
                {
                    id: "exhibition",
                    label: "Exhibition",
                    lead: "Culture Stockpile Base, Seoul · January 2026.",
                    blocks: [
                        { kind: "text", body: "Visitors made faces at a tablet, watched the sphere react, and read the corridor results in a 16-page booklet. Collected data was disclosed and kept for further research." },
                        { kind: "gallery", images: [
                            { url: "assets-web/EApic4.webp" }, { url: "assets-web/EApic1.webp" },
                            { url: "assets-web/EApic3.webp" }, { url: "assets-web/EApic2.webp" }
                        ] },
                        { kind: "links", items: [
                            { label: "Booklet", url: "booklet.html" },
                            { label: "Live sphere", url: "https://emotion-sphere.vercel.app" },
                            { label: "GitHub", url: "https://github.com/baechubaechu/emotion_sphere" }
                        ] }
                    ]
                }
            ]
        }
    ]
};
