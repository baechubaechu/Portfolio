const projectsData = {
    schoolWorks: [
        {
            id: "xtra-space",
            title: "X-tra Space",
            description: "A graduation project that re-layers Geumjeong Station's transfer hub so fast and slow flows cross, with an AI operating layer that runs light, sound and display by situation.",
            thumbnail: "assets/XS-thumbnail.jpg",
            tags: ["Rhino", "Transit Hub", "Next.js", "FastAPI", "ESP32", "MediaPipe", "Coding Agents"],
            kind: "Architecture",
            thesis: "Geumjeong Station is a transfer hub people only pass through. X-tra Space stacks transfer, promenade, urban and auxiliary circulation layers so they cross, and the crossings become new public space. An AI operating layer then manages that space, switching light, sound and display modes from what it senses, and a working version ran live at the graduation show.",
            githubLink: "https://github.com/baechubaechu/Spatial-Environment-Agent",
            sections: [
                { type: "hero-meta", subtitle: "Transfer and promenade, fast and slow, moving and staying. Where they cross, an extra space appears.", category: "Architecture / Graduation Project", role: "Designer · Developer (solo)", timeline: "2025.09 - 2026.06" },
                { type: "arch-panel", image: "assets/XS-cover.jpg" }
            ],
            chapters: [
                {
                    id: "site",
                    label: "Site",
                    title: "A station people only pass through",
                    lead: "Geumjeong Station is transfer infrastructure planned for speed, and it cuts the city and its green axis in two.",
                    blocks: [
                        { kind: "text", body: "Modern stations are planned around fast movement, clear guidance and transfer efficiency. In the process the station becomes a pass-through device. People rarely stop, notice the space, or stay. I chose a transfer hub because it is the most everyday and most functional public space there is." },
                        { kind: "text", body: "I compared bed-town stations served by GTX and three or more lines: Daegok, Bupyeong and Geumjeong. Geumjeong, in Gunpo, a bed town that depends on Seoul and Anyang, had the most severance: the rail corridor splits the city, and Sanbon Stream, covered in 1995, is cut along with it. The project builds on the plan to reopen the stream." },
                        { kind: "image", url: "assets/XS-site.jpg", caption: "Site diagram. The rail corridor splits the city into two edges; street views from either side." },
                        { kind: "image", url: "assets/XS-site-axis.jpg", caption: "Green axis within 1 to 3 km. Hills in green, streams in blue; the red dashed line is the covered section of Sanbon Stream meeting the station." },
                        { kind: "image", url: "assets/XS-site-context.jpg", caption: "Site model with street photos, historical aerials, and a collage of the transfer environment around the station." }
                    ]
                },
                {
                    id: "layers",
                    label: "Layers",
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
                        { kind: "image", url: "assets/XS-plan.jpg", caption: "Second floor plan. 1 Transit layer, 2 Walking layer, 3 X-tra Space, 4 Exit, 5 Platform, 6 Concourse, 7 Cafe/Lounge, 8 Observatory deck, 9 Bicycle storage, 10 Station operations, 11 Restroom, 12 Service." },
                        { kind: "image", url: "assets/XS-long-section.jpg", caption: "Long section along the tracks. Transfer below, the walking level and planted deck above, under one roof." }
                    ]
                },
                {
                    id: "crossing",
                    label: "Crossing",
                    title: "Designing the crossing",
                    lead: "Awareness needs contrast, so the design places contrasting conditions right next to each other.",
                    blocks: [
                        { kind: "text", body: "Senses are always there, but in a familiar, uniform space we stop noticing them. They only become conscious through change. X-tra Space is made by crossing things that are usually kept apart: transfer and promenade, fast and slow, moving and staying, efficiency and sensation, and a fixed building with an atmosphere that responds." },
                        { kind: "rules", items: [
                            ["Low ceiling / narrow passage", "Compression: tension and focus"],
                            ["Height change / crossing flows", "Transition: curiosity and alertness"],
                            ["Void / diffuse light", "Expansion: relief and lingering"]
                        ] },
                        { kind: "list", items: [
                            "Compression: tighten section and width before a crossing.",
                            "Crossing: let the transfer and walking layers meet at a height change.",
                            "Release: open into a void with diffuse light where people can stay."
                        ] },
                        { kind: "gallery", images: [
                            { url: "assets/XS-section1.jpg", caption: "Section 1: the X-tra Space above the tracks." },
                            { url: "assets/XS-section2.jpg", caption: "Section 2: the station body, transfer below and the walking level above." }
                        ] }
                    ]
                },
                {
                    id: "structure",
                    label: "Structure",
                    title: "Suspension structure and panels",
                    lead: "The roof is hung rather than propped, so the space under it stays open for the crossing layers.",
                    blocks: [
                        { kind: "text", body: "The structural idea is a suspension structure with panels. Cables hang from masts and pick up the roof edge, so the long span over the tracks needs fewer supports inside the space. The roof surface is broken into panels between the cable lines." },
                        { kind: "image", url: "assets/XS-structure.jpg", caption: "Structure study: cables fanning from masts to the curved roof edge, with the roof divided into panels." },
                        { kind: "text", body: "In the June design the canopy is carried on branching columns with a ribbed roof, and a louvered panel facade lines the edge of the walking layer." },
                        { kind: "image", url: "assets/XS-panels.jpg", caption: "Louver panel study along the walking layer (June)." },
                        { kind: "list", items: [
                            "Model spec planned at the April review:",
                            "Base: white foamex. Roads: grey foamex and laser-cut paper.",
                            "Stream: clear acrylic with film. Rails: stainless wire.",
                            "Platforms, columns, cores: white 3D print. Main roof: semi-transparent acrylic with foamex."
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
                        { kind: "image", url: "assets/XS-monitor-states.jpg", caption: "Four of the ten pre-rendered states of the same interior, varying light level, colour temperature and occupancy. The monitor picks one from the live head count, sound level and current scene." }
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
                        { kind: "image", url: "assets/XS-ui.jpg", caption: "Monitor page, re-run on a laptop after the show with no camera attached. Mode, crowd, noise and flow status on top; the live camera view on the left; the space response render on the right." },
                        { kind: "links", items: [
                            { label: "Source code on GitHub", url: "https://github.com/baechubaechu/Spatial-Environment-Agent" }
                        ] }
                    ]
                },
                {
                    id: "exhibition",
                    label: "Exhibition",
                    title: "What ran at the show, and what didn't",
                    lead: "The graduation show was the test: real visitors, real noise, running all day.",
                    blocks: [
                        { kind: "text", body: "At the show, input from the tablet and the camera changed the space on the monitor right away. The monitor showed the transformed space image and a related diagram, and the NeoPixel lights in the model switched to the same scene." },
                        { kind: "image", url: "assets/XS-booth.jpg", caption: "Booth layout study from the June review: panels, a monitor, the site and section models, and a tablet on each table." },
                        { kind: "list", items: [
                            "Ran: tablet, camera, monitor and ESP32 lights linked through one laptop server.",
                            "Not installed: speakers. Each scene defines a sound track and volume, but the speaker output was not set up at the show.",
                            "Changed: Google Vision was turned off for the show, so only local MediaPipe face detection was used.",
                            "Fixed in the last week before and during the show: false face detections, camera recovery after idle, and slowdowns during long unattended runs."
                        ] },
                        { kind: "note", body: "Limits: this is a booth-scale demonstration, not a station. The thresholds (for example 65 dB, 4 people) were tuned for a small booth, and the images are pre-rendered states chosen by rules, not generated live. Scaling to a real station would need many sensors, zones and a proper operations layer." }
                    ]
                }
            ]
        },
        {
            id: "Student Driven Village",
            title: "Student Driven Village",
            description: "A Multi-layered Residential Complex Mediated by Student Initiatives.",
            thumbnail: "assets/4-1 thumbnail.png",
            tags: ["Rhino", "D5 Render"],
            kind: "Architecture",
            thesis: "Gwacheon's Jugong reconstruction is bringing in more families with school-age children, but the new complexes stay gated. We proposed a housing complex that uses those students as the link: club rooms and large shared halls for five nearby schools, set under the housing and open to residents too. Midway we saw that the halls had created a new boundary next to private homes, and we reorganized the scheme around a semi-public layer between them.",
            chapters: [
                {
                    id: "context",
                    label: "Context",
                    lead: "Reconstruction brings more students to Gwacheon, but the new complexes stay closed to their neighbours.",
                    blocks: [
                        { kind: "text", body: "The site is a Gwacheon Jugong apartment complex under reconstruction, next to the Yangjae stream. Gwacheon's new complexes respond to the old gated-community problem with more ground-floor openings, but more entrances did not remove the invisible boundary between residents and outsiders. We expect that boundary to get stronger as more complexes are rebuilt." },
                        { kind: "list", items: [
                            "Over the last three years of city data, the number of schools grew by about two a year as reconstruction finished, against the overall trend.",
                            "The 2035 Gwacheon master plan expects about 140,000 residents and 56,000 households, close to double today's household count.",
                            "The city's population cap went from 77,000 (2010) to 97,000 (2020) to 140,000 (2035).",
                            "Taking 3–4 person households as households with children, Gwacheon's share is clearly higher than both the national and the Seoul figures."
                        ] },
                        { kind: "image", url: "assets/SDV-schools.jpg", caption: "Five schools within 500 m of the site (about a 10-minute walk), inside the walking catchment set in the GH brief." }
                    ]
                },
                {
                    id: "program",
                    label: "Program",
                    lead: "Give students from different schools a reason to meet: room for the clubs they already belong to.",
                    blocks: [
                        { kind: "text", body: "Our starting question was simple: if students had a place to do what they like together, would they share hobbies and time even with friends from other schools? We surveyed the clubs of the five nearby schools and grouped them into four themes. Each theme gets club rooms plus a large hall where students can show what they practise or make. Relationships between students can extend to their siblings and parents." },
                        { kind: "rules", items: [
                            ["Performance (band, dance, theatre, orchestra, vocal)", "Performance hall and stage; residents use it for small concerts and film screenings"],
                            ["Sports (football, basketball, badminton, jump rope)", "Indoor and outdoor sports centre; residents use it for community sports programs"],
                            ["Making (architecture class, crafts, photography)", "Exhibition gallery; residents use it for art activities and a village archive"],
                            ["Nature and life (gardening, eco volunteering, dog club, cooking)", "Urban garden; residents use it as an intergenerational community garden"]
                        ] },
                        { kind: "text", body: "Halls at this scale could not be kept for students only, around the clock. They were planned from the start to be shared with the people who live there." },
                        { kind: "image", url: "assets/SDV-program.jpg", caption: "School clubs grouped into four themes, each tied to a large hall and to a resident use." }
                    ]
                },
                {
                    id: "boundary",
                    label: "Boundary",
                    lead: "The halls meant to blur the boundary ended up creating a new one, so we reorganized the scheme.",
                    blocks: [
                        { kind: "text", body: "Once the halls were combined with the housing, we saw a problem. A strong, fully open hall sat directly against very private homes. We wanted to blur boundaries, but two very different kinds of space placed side by side had made another boundary." },
                        { kind: "steps", items: [
                            "Mid-April: we introduced a public / semi-public / semi-private / private layering. Critique asked for a floor where semi-public meets public, and a clearer relationship between semi-public space and housing.",
                            "Late April: breaking boundaries and adding semi-private zones started to contradict each other, so we set the semi-private idea aside for a while.",
                            "Late May: we revised and fixed the program and concept.",
                            "Early June: we developed semi-public spaces for each building and fixed the in-between spaces for each housing type."
                        ] },
                        { kind: "text", body: "In the final scheme the halls (exhibition hall, gym, open restaurant, performance hall) sit on a sunken street that can be reached from both the stream and the ground level. Each hall is extended outward into an outdoor exhibition, sports or busking space. Above each hall is a smaller semi-public 'intermediate space': a resident art school, sports centre or culture centre whose terrace uses the hall's roof. Housing sits on top of that. The intermediate layer is where students, residents and visitors share the same activity, and it separates the hall from the homes instead of pressing them together." },
                        { kind: "gallery", images: [
                            { url: "assets/SDV-layers.jpg", caption: "Section diagram: outdoor, public hall, semi-public intermediate space, private housing." },
                            { url: "assets/SDV-halls.jpg", caption: "Placement of the large halls." },
                            { url: "assets/SDV-intermediate.jpg", caption: "Placement of the intermediate spaces above the halls." }
                        ] }
                    ]
                },
                {
                    id: "drawings",
                    label: "Drawings",
                    lead: "Blurring the boundary vertically, between residents and outsiders, and horizontally, among residents.",
                    blocks: [
                        { kind: "text", body: "Vertically, a sunken passage at stream level lets people enter from the Yangjae stream without crossing the six-lane road. Community masses on the north and south lead people down into it, and a community hub and retail draw them in from ground level. Existing five-storey wall-structure blocks are kept and converted to retail by adding columns and slabs in front of the stair cores. Horizontally, the corridor is widened differently for three household types: a lowered pocket space that parents can watch from a second living room (families), small shared rooms on several levels (young one- and two-person households), and linked slabs with voids and terraces so neighbours stay in sight of each other (older residents)." },
                        { kind: "gallery", images: [
                            { url: "assets/4-1siteplan.png", caption: "Site plan" },
                            { url: "assets/4-1basementfloorplan.png", caption: "Basement floor plan: sunken street and halls" },
                            { url: "assets/4-1firstfloorplan.png", caption: "1st floor plan" },
                            { url: "assets/4-1fourthfloorplan.png", caption: "4th floor plan" },
                            { url: "assets/4-1typicalfloorplan.png", caption: "Typical housing floor plan" }
                        ] },
                        { kind: "gallery", images: [
                            { url: "assets/4-1sectionperspective1.png", caption: "Section perspective" },
                            { url: "assets/4-1sectionperspective2.png", caption: "Section perspective" },
                            { url: "assets/4-1sectionperspective3.png", caption: "Section perspective" }
                        ] },
                        { kind: "gallery", images: [
                            { url: "assets/4-1render1.png", caption: "Street and bridge view" },
                            { url: "assets/4-1render2.png", caption: "Ground-level plaza" },
                            { url: "assets/4-1render3.png", caption: "Entrance from the street" },
                            { url: "assets/4-1render4.png", caption: "View from across the stream" }
                        ] }
                    ]
                },
                {
                    id: "model",
                    label: "Model",
                    lead: "A site model for the whole complex and cut models showing how the corridors open up.",
                    blocks: [
                        { kind: "text", body: "The site model shows the new housing next to the kept blocks and the stream edge. The cut models open the housing masses to show the widened corridors and in-between spaces." },
                        { kind: "gallery", images: [
                            { url: "assets/4-1model1.jpg", caption: "Site model, 1:500" },
                            { url: "assets/4-1model2.jpg" },
                            { url: "assets/4-1model3.jpg" },
                            { url: "assets/4-1model4.jpg" },
                            { url: "assets/4-1model5.jpg" },
                            { url: "assets/4-1model6.jpg" },
                            { url: "assets/4-1model7.jpg", caption: "Housing mass seen from above" },
                            { url: "assets/4-1model8.jpg", caption: "Cut model showing the interior" }
                        ] }
                    ]
                }
            ],
            sections: [
                {
                    type: "hero-meta",
                    subtitle: "Gwacheon, a village changed by students: a neighbourhood platform built around student clubs",
                    category: "Architecture / Studio",
                    role: "Designer (2-person team)",
                    timeline: "2025.03 - 2025.06"
                },
                {
                    type: "arch-concept",
                    spine: ["research", "phenomenology"],
                    leadText: "Student as a Social Medium for Intergenerational Harmony",
                    description: "This project addresses the social isolation inherent in Gated Communities of reconstructed apartment complexes in Gwacheon. We propose a new Open Community platform that utilizes the city’s high density of students as a primary social medium.",
                    image: "assets/4-1concept.png"
                },
                {
                    type: "arch-plans",
                    spine: ["structure"],
                    columns: 2,
                    plans: [
                        { url: "assets/4-1siteplan.png", title: "Site Plan" },
                        { url: "assets/4-1firstfloorplan.png", title: "1st Floor Plan" },
                        { url: "assets/4-1fourthfloorplan.png", title: "4th Floor Plan" },
                        { url: "assets/4-1basementfloorplan.png", title: "Basement Floor Plan" },
                        { url: "assets/4-1typicalfloorplan.png", title: "Typical Floor Plan" },
                        { url: "assets/4-1sectionperspective1.png", title: "Detail Section" },
                        { url: "assets/4-1sectionperspective2.png", title: "Detail Section" },
                        { url: "assets/4-1sectionperspective3.png", title: "Detail Section" },
                    ]
                },
                {
                    type: "arch-renders",
                    columns: 2,
                    images: [
                        { url: "assets/4-1render1.png", title: "OVERALL VIEW" },
                        { url: "assets/4-1render2.png", title: "ENTRANCE PERSPECTIVE" },
                        { url: "assets/4-1render3.png", title: "INTERIOR ATRIUM" },
                        { url: "assets/4-1render4.png", title: "NIGHT VISUALIZATION" }
                    ]
                },
                {
                    type: "arch-models",
                    spine: ["physical-model", "fabrication"],
                    columns: 2,
                    images: [
                        { url: "assets/4-1model1.jpg", title: "SITE MODEL 1:500" },
                        { url: "assets/4-1model2.jpg", title: "EXPLODED AXONOMETRIC MODEL" },
                        { url: "assets/4-1model3.jpg", title: "EXPLODED AXONOMETRIC MODEL" },
                        { url: "assets/4-1model4.jpg", title: "EXPLODED AXONOMETRIC MODEL" },
                        { url: "assets/4-1model5.jpg", title: "EXPLODED AXONOMETRIC MODEL" },
                        { url: "assets/4-1model6.jpg", title: "EXPLODED AXONOMETRIC MODEL" },
                        { url: "assets/4-1model7.jpg", title: "EXPLODED AXONOMETRIC MODEL" },
                        { url: "assets/4-1model8.jpg", title: "EXPLODED AXONOMETRIC MODEL" },
                    ]
                }
            ]
        },
        {
            id: "little-forest",
            title: "Little Forest",
            description: "A remodel of the closed Seongsu Technical High School into a pet theme park, a small jungle in the city.",
            thumbnail: "assets/LF-thumbnail.jpg",
            tags: ["Rhino", "AutoCAD", "D5 Render", "QGIS", "Photoshop", "InDesign"],
            kind: "Architecture",
            thesis: "Seongsu Technical High School closed as student numbers fell. Little Forest turns it into a pet theme park for residents who want hands-on programs and for young visitors drawn to Seongsu. Rounded edges, winding paths that always connect, and planters instead of railings let pets and people walk the whole site safely.",
            sections: [
                { type: "hero-meta", subtitle: "A small jungle in the city", category: "Architecture / Studio", role: "Designer", timeline: "2023.09 - 2023.12" },
                { type: "arch-panel", image: "assets/LF-panel.jpg" }
            ],
            chapters: [
                {
                    id: "site",
                    label: "Site",
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
                        ] },
                        { kind: "image", url: "assets/LF-site.jpg", caption: "Site and surroundings" }
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
                        { kind: "gallery", images: [
                            { url: "assets/LF-market.jpg", caption: "Pet market data and existing pet theme parks in Korea" },
                            { url: "assets/LF-program.jpg", caption: "Program diagram: with pets above the line, without pets below" }
                        ] }
                    ]
                },
                {
                    id: "moves",
                    label: "Design Moves",
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
                        { kind: "image", url: "assets/LF-mass.jpg", caption: "Before and after: mass orientation and the route in from the main road" },
                        { kind: "gallery", images: [
                            { url: "assets/LF-concept.jpg", caption: "Rounded terraces and parks" },
                            { url: "assets/LF-path.jpg", caption: "A walking path lined with planters" },
                            { url: "assets/LF-detail.jpg", caption: "Section detail, 1:50: planter boxes form the terrace edge; roof walkway and roof planting" }
                        ] }
                    ]
                },
                {
                    id: "reuse",
                    label: "Reuse",
                    lead: "Remove what blocks the park, keep what can carry the new program.",
                    blocks: [
                        { kind: "text", body: "The demolition plan sorts the existing school into two kinds of removal: parts demolished entirely, and parts where only columns and walls come out. The long block on the northeast edge stays and holds the rehabilitation, care and hotel floors; a new curved wing adds the shop, counselling and education rooms." },
                        { kind: "image", url: "assets/LF-demolition.jpg", caption: "Demolition plan: hatched = demolished entirely, orange = columns and walls removed" },
                        { kind: "note", body: "The drawings mark what is removed. They do not say how the kept structure is strengthened." }
                    ]
                },
                {
                    id: "drawings",
                    label: "Drawings & Model",
                    lead: "Parks at ground level, a care and hotel wing above, green edges throughout.",
                    blocks: [
                        { kind: "text", body: "The ground floor holds the exhibition, lockers and showers, a pool, pet showers, a greenhouse garden, a shop, a café, and separate large- and small-dog runs. The second floor has rehabilitation, recovery, emergency, CT, clinic and surgery rooms, grooming and counselling. Hotel rooms sit above, agility is on the top floor, and parking and a water tank are below ground." },
                        { kind: "image", url: "assets/LF-plan-1f.jpg", caption: "Ground floor plan" },
                        { kind: "image", url: "assets/LF-section.jpg", caption: "Section perspective" },
                        { kind: "gallery", images: [
                            { url: "assets/LF-model-1.jpg", caption: "Model from above" },
                            { url: "assets/LF-model-2.jpg", caption: "Stacked planted terraces" },
                            { url: "assets/LF-model-3.jpg", caption: "Terrace edge close-up" }
                        ] }
                    ]
                }
            ]
        },
        {
            id: "class-ic",
            title: "Class.IC",
            description: "A shared office in Euljiro that gathers the district's scattered craft workshops into one tower, with one-day classes and lounges between them.",
            thumbnail: "assets/CI-thumbnail.jpg",
            tags: ["Rhino", "AutoCAD", "D5 Render", "Photoshop", "InDesign"],
            kind: "Architecture",
            thesis: "Redevelopment in Euljiro is replacing its workshop streets with office blocks. Class.IC keeps the workshops by stacking them in one building: craft studios and one-day classes on the lower floors, a shared office above, and lounges where shop owners, office workers and class visitors meet. The name joins one-day Class with IC (Inter-Change, 나들목).",
            sections: [
                { type: "hero-meta", subtitle: "Euljiro's workshop streets, stacked into one building", category: "Architecture / Studio", role: "Designer", timeline: "2023.03 - 2023.06" },
                { type: "arch-panel", image: "assets/CI-panel.jpg" }
            ],
            chapters: [
                {
                    id: "context",
                    label: "Context",
                    lead: "A historic craft district that is being rebuilt as offices.",
                    blocks: [
                        { kind: "text", body: "The site is in Euljiro 3-ga, one minute from Euljiro 3-ga Station (Lines 2 and 3), with Sewoon Sangga to the east and Cheonggyecheon to the north. Since the late Joseon period the area grew into themed streets for tiles, tools, printing, ceramics, glass, wood and metal work." },
                        { kind: "text", body: "Office redevelopment is moving in from the west. The site sits inside an urban environment improvement district, so the nearby workshops and the Nogari alley to the north are expected to disappear. There is no green space within 500 m. Restoring an old waterway that once crossed the site earns FAR relief, and the project uses that waterway as the base of its green strategy." },
                        { kind: "rules", items: [
                            ["Location", "65-13 Euljiro 3-ga, Jung-gu, Seoul"],
                            ["Zoning", "General commercial zone, fire prevention district, historic downtown (inside the four gates), redevelopment district"],
                            ["Site area", "about 2,940 ㎡ (building area 1,660 ㎡)"],
                            ["Coverage", "60% max; 69% for the podium (up to 5 floors / 20 m)"],
                            ["FAR", "600% base, 780% allowed, 1,004% upper limit with incentives"],
                            ["Scale", "B5 / 17F, about 70 m, GFA about 23,000 ㎡, reinforced concrete"]
                        ] },
                        { kind: "image", url: "assets/CI-site.jpg", caption: "Land use and redevelopment districts around the site, the old waterway, and the lack of green space within 500 m" }
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
                        ] },
                        { kind: "image", url: "assets/CI-mass-flow.jpg", caption: "Mass process and the one-day class route through the six workshop floors" },
                        { kind: "image", url: "assets/CI-plans.jpg", caption: "1F, 5F and 16F plans with the class circulation diagram" }
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
                            { url: "assets/CI-concept.jpg", caption: "Split floor on the lower levels, vertical lounge on the office levels" },
                            { url: "assets/CI-section.jpg", caption: "Section A–A′: split-level workshops and lounges up to about +38 m, offices above" },
                            { url: "assets/CI-interior.jpg", caption: "Office floor beside the Green Fall" }
                        ] }
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
                            { url: "assets/CI-barrier-free.jpg", caption: "Barrier-free plan, ground floor" },
                            { url: "assets/CI-egress.jpg", caption: "Horizontal and vertical evacuation plans" }
                        ] }
                    ]
                },
                {
                    id: "form",
                    label: "Form & Model",
                    lead: "Each stacked block wears the material of a workshop street.",
                    blocks: [
                        { kind: "text", body: "The facade uses wood, metal and glass to stand for the workshop streets the building gathers. The masses are stacked and shifted by program, which leaves planted terraces between them." },
                        { kind: "image", url: "assets/CI-elevation.jpg", caption: "Elevation" },
                        { kind: "gallery", images: [
                            { url: "assets/CI-model-1.jpg", caption: "Model in its urban context" },
                            { url: "assets/CI-model-2.jpg", caption: "Louvred facade and planted terrace" },
                            { url: "assets/CI-model-3.jpg", caption: "Stacked masses from above" }
                        ] }
                    ]
                }
            ]
        }
    ],
    competitions: [
        {
            id: "sangsangblue",
            title: "Kitsch Fish",
            description: "A 3.6 m competition pavilion for Jeju where sea glass and plastic pieces hang like a school of fish from a frame of bamboo poles, and an honest look at what its 2023 placement logic never checked.",
            thumbnail: "assets/KF-thumbnail.jpg",
            tags: ["Rhino", "Grasshopper"],
            kind: "Pavilion",
            thesis: "Kitsch Fish is a 2023 competition pavilion about marine debris off Jeju: you look for fish and find garbage. Bamboo poles act as fishing rods, and pieces of sea glass and plastic hang on fishing line where the fish should be. The 2023 Grasshopper definitions placed and hung those pieces but never checked spacing, clearance or load, and this page records exactly what they left unchecked.",
            sections: [
                {
                    type: "hero-meta",
                    subtitle: "Fishing for garbage instead of fish",
                    category: "Pavilion / Competition",
                    role: "Designer (3-person team)",
                    timeline: "2023.05"
                },
                {
                    type: "arch-competition-info",
                    year: "2023",
                    team: "Team 곡란 (Goklan): 김기태 (Suwon Univ.), 최하영 (Seoul Institute of the Arts), 박지훈 (Hongik Univ.)",
                    location: "Tamna Cultural Plaza, Jeju"
                },
                {
                    type: "arch-panel",
                    image: "assets/KF-plan.jpg"
                }
            ],
            chapters: [
                {
                    id: "problem",
                    label: "Problem",
                    lead: "Where there should be fish, there is garbage.",
                    blocks: [
                        { kind: "text", body: "The brief asked for a pavilion of up to 3.6 × 3.6 × 3.6 m at Tamna Cultural Plaza in Jeju City, carrying a message about protecting Jeju's sea. It also asked for the joint materials at each structural part and the installation method, all in an A3 PDF of no more than 10 pages." },
                        { kind: "text", body: "Our idea: go fishing and catch garbage. Bamboo poles lean in like fishing rods, and pieces of debris hang from them on fishing line where a school of fish should be. From a distance it reads as fish; up close it is sea glass and plastic." },
                        { kind: "rules", items: [
                            ["Bamboo, plastic-coated (Ø40 × 3200 mm)", "Poles, used as the fishing rods"],
                            ["Sea glass (about Ø60 × 40 mm)", "Fish pieces"],
                            ["Ground plastic granules (5–15 mm)", "Fish pieces"],
                            ["Fishing line", "Hangs the pieces from the frame"]
                        ] },
                        { kind: "gallery", images: [
                            { url: "assets/KF-thumbnail.jpg", caption: "Cover render at Tamna Cultural Plaza" },
                            { url: "assets/KF-process.jpg", caption: "Design process: poles, debris caught on them, adjusting type, size and count, forming a fish" },
                            { url: "assets/KF-materials.jpg", caption: "Main materials" }
                        ] }
                    ]
                },
                {
                    id: "original",
                    label: "Original Definition",
                    lead: "Two small 2023 Grasshopper files: one scatters pieces in a volume, the other hangs them from the ceiling plane.",
                    blocks: [
                        { kind: "text", body: "The first, smaller file fills a box region with random points (Populate 3D, 200 points, fixed seed), scales the cloud toward the box centre (factor 0.6), and puts a placeholder sphere on each point. A Collision One|Many component then reports whether one referenced object hits any of the spheres. It only reports; nothing is moved when there is a hit." },
                        { kind: "text", body: "The second file starts from 125 pieces referenced from Rhino. For each piece it takes the area centroid and draws a vertical line up to a referenced ceiling surface (Line SDL, then Line | Plane). The line from the centroid to that intersection is the hanging line, shown as a thin pipe. A template object is copied onto every centroid (Pufferfish Move To Point) and offset in X and Y. Each copy is then rotated about the vertical axis by angles from a Discover 'Continuous' parameter (250 values between 0° and 360°) and previewed with a transparent material (Human)." },
                        { kind: "code", filename: "unnamed.gh (component graph, transcribed)", language: "text", code: "Brep (125 referenced pieces) -> Area -> centroid C\nLine SDL(start C, dir +Z, fixed length) -> Line | Plane(ceiling Brep) -> hang point H\nLine(C, H) -> Pipe(small radius)                 # fishing line\nMove To Point(template, from own centroid, to C) -> Move(+X), Move(+Y) -> Merge\nRotate 3D(angle = Discover Continuous 0..360 deg, center = centroid, axis = Z)\n-> Custom Preview Materials(colour, transparency 0.2)", caption: "Read from the saved file. The two files share no link, and neither contains a script component." },
                        { kind: "image", url: "assets/KF-aerial.jpg", caption: "Rendered result: the cloud of pieces under the grid at the top of the poles." }
                    ]
                },
                {
                    id: "limits",
                    label: "Limits",
                    lead: "The 2023 logic placed and hung pieces, but it did not check whether the result could be built.",
                    blocks: [
                        { kind: "list", items: [
                            "In the saved files, pieces were never checked against each other. The only collision test compared one object with the spheres, and it only reported the result.",
                            "Hanging points came from projecting straight up to a plane, so they land wherever the centroid is, not on the grid nodes or poles that would carry them.",
                            "Line length, load per hanging point, and clear height above visitors were not computed anywhere in the files.",
                            "Placement depended on a random seed and hand-set sliders. There was no record of why one layout was chosen over another."
                        ] },
                        { kind: "text", body: "Three questions follow from this: do any two pieces clash, does every line end on a real support, and is the head height underneath clear?" },
                        { kind: "note", body: "Next: rebuilding the placement logic so these three questions become explicit rules checked in code (planned, 2026)." },
                        { kind: "image", url: "assets/KF-detail.jpg", caption: "Joint details from the entry: pole to concrete footing, and fishing line to pole." }
                    ]
                }
            ]
        }
    ],
    otherWorks: [
        {
            id: "sida",
            title: "Sida",
            description: "A CLI where twelve narrow AI experts help an architect reason through a design, from site reading to review, without designing the building for them.",
            thumbnail: "assets/SIDA-flow.jpg",
            tags: ["Python", "LLM", "RAG", "Rhino MCP"],
            githubLink: "https://github.com/baechubaechu/Sida",
            kind: "Code · In progress",
            thesis: "Most AI tools in architecture generate one thing at a time: an image, a text, a summary. Design is not one generation task. Sida (시다, the Korean word for a studio assistant) splits design reasoning into twelve narrow experts coordinated by a Conductor. It keeps a project memory the designer approves, answers regulation questions only from retrieved text, and can model in Rhino. It is a working v0.1 prototype and still in development.",
            sections: [
                {
                    type: "hero-meta",
                    subtitle: "An assistant for design reasoning, not a designer",
                    category: "AI Tool / CLI Platform",
                    role: "Developer (solo)",
                    timeline: "2026.07 - in progress"
                },
                {
                    type: "arch-panel",
                    image: "assets/SIDA-flow.jpg"
                }
            ],
            chapters: [
                {
                    id: "problem",
                    label: "Problem",
                    lead: "How can an LLM support design reasoning without pretending to design the building?",
                    blocks: [
                        { kind: "text", body: "A studio project is not a single prompt. It means reading the site, sorting constraints, testing an intention, taking critique and deciding what to draw. A general chatbot mixes all of that into one answer and happily invents numbers and precedents." },
                        { kind: "text", body: "Sida treats the model as a set of narrow lenses instead of one generator. Its output is structured Markdown that clarifies site issues, program demands, regulation agenda, the concept's claims, open problems and what to represent. It is never a finished design." },
                        { kind: "rules", items: [
                            ["Does", "Reads the brief, asks focused questions, runs one expert at a time, keeps decisions and open questions in a project file"],
                            ["Does not", "Draw the building, fix numbers it has not retrieved, or claim that AI designed the project"]
                        ] }
                    ]
                },
                {
                    id: "experts",
                    label: "Experts",
                    lead: "Twelve independent lenses, each with declared inputs and things it must not do.",
                    blocks: [
                        { kind: "rules", items: [
                            ["site_reader", "How systems meet and cut each other on the site; no program or form proposals"],
                            ["program_analyst", "Users, rhythms, adjacency, public–private gradient; no invented areas"],
                            ["regulation_checker", "Governing codes and what to verify; numbers are never stated as fact"],
                            ["precedent_scout", "3–6 precedents matched to the problem, each with a lesson and a caution"],
                            ["concept_framer", "Turns the designer's intent into a testable one-line concept"],
                            ["constraint_mapper", "Hard / soft constraints, priorities and tensions, with their source lens"],
                            ["synthesizer", "Where experts agree or conflict, and which decisions are due now"],
                            ["spatial_reviewer", "Tests the described circulation, section and thresholds; no alternative design"],
                            ["systems_advisor", "Structure, envelope, services and egress trade-offs; no sizing"],
                            ["design_critic", "Jury-style critique against the core problem"],
                            ["representation_planner", "Drawings and diagrams that prove the concept and test its weak points"],
                            ["presentation_editor", "Review story, portfolio structure, likely questions"]
                        ] },
                        { kind: "text", body: "Every expert output ends with a Handoff section naming who should look next. That is how the lenses connect without a fixed pipeline. Adding an expert takes one prompt file and one entry in config.yaml; the Conductor's list and the project's status table are generated from it." }
                    ]
                },
                {
                    id: "conductor",
                    label: "Conductor",
                    lead: "Design is not linear, so the entry point depends on what drives the project.",
                    blocks: [
                        { kind: "rules", items: [
                            ["Primary Driver: site", "Start with site_reader"],
                            ["idea", "Start with concept_framer"],
                            ["program", "Start with program_analyst"],
                            ["regulation", "Start with regulation_checker"],
                            ["review / competition", "Start with synthesizer or presentation_editor"],
                            ["3+ experts done, or two disagree", "Suggest synthesizer"],
                            ["Brief or direction changed", "Name the completed experts that are now stale"]
                        ] },
                        { kind: "text", body: "The Conductor talks like a colleague and ends every reply with exactly one machine-readable action. It never runs more than one expert per reply and prefers asking one focused question over calling an expert, which keeps cost down." },
                        { kind: "code", filename: "agents/00_conductor.md", language: "action block", code: "```action\n{\"type\": \"run\", \"agent\": \"site_reader\"}\n```\n\n# other actions\n{\"type\": \"none\"}                          # question or advice\n{\"type\": \"read\", \"module\": \"site_reader\"}  # open a finished output\n{\"type\": \"exit\"}" },
                        { kind: "rules", items: [
                            ["site_driven", "site → program → regulation → constraints → concept → critic"],
                            ["idea_driven", "concept → precedent → site → program → spatial → critic"],
                            ["review_prep", "synthesizer → critic → representation → presentation"]
                        ] }
                    ]
                },
                {
                    id: "memory",
                    label: "Project Memory",
                    lead: "The Conductor reads a short project file instead of the whole chat, and the designer approves every change to it.",
                    blocks: [
                        { kind: "text", body: "After each expert runs, Sida proposes a patch to project_state.md: the Module Status row, the meta lines, and only the sections that expert informs. The designer sees a diff and chooses to apply, skip, or apply and edit. The previous version is kept." },
                        { kind: "code", filename: "project_state.md update (from the README)", language: "diff", code: "[state] site_reader 결과로 project_state.md 갱신안을 만드는 중 ...\n--- project_state.md\n+++ proposed\n-| site_reader | pending | |\n+| site_reader | done | 남북 레벨 차 6m가 동선의 핵심 제약 |\n...\n이 갱신을 적용할까요? [Y = 적용 / n = 건너뛰기 / e = 적용 후 에디터로 열기]:" },
                        { kind: "text", body: "The sample project is the Geumjeong Station brief from my graduation project, X-tra Space. Its state file holds the core problem, confirmed decisions with dates, open questions, tensions, missing information and the next focus." }
                    ]
                },
                {
                    id: "law",
                    label: "Regulation Search",
                    lead: "Numbers and article text are stated only when they appear in retrieved passages.",
                    blocks: [
                        { kind: "steps", items: [
                            "Build a retrieval query from the brief, the project state and the expert's inputs.",
                            "Retrieve passages from a RAG server over HTTP, or from local Markdown excerpts offline.",
                            "Give the model the passages as RETRIEVED KNOWLEDGE with their source paths.",
                            "Answer with citations; anything not retrieved is marked as something to verify."
                        ] },
                        { kind: "rules", items: [
                            ["Only partly retrieved", "Quote what is there and say the item or number is missing from this search"],
                            ["Not found", "Never claim the provision does not exist; point to where to look next"],
                            ["Scope", "Not legal advice, and no design proposals"]
                        ] }
                    ]
                },
                {
                    id: "rhino",
                    label: "Rhino Modeling",
                    lead: "A separate assistant turns a clear modeling request into safe Rhino operations through MCP.",
                    blocks: [
                        { kind: "text", body: "The modeler works in rounds. Each turn returns one JSON block with a short message for the designer and up to three tool calls from an allowed list (for example get_context, run_python, run_command). It reads the document before editing, names objects and layers, and assumes millimetres." },
                        { kind: "code", filename: "agents/71_rhino_modeler.md", language: "rhino block", code: "```rhino\n{\n  \"say\": \"one or two sentences for the user\",\n  \"done\": false,\n  \"calls\": [\n    {\"tool\": \"get_context\", \"args\": {}}\n  ]\n}\n```" },
                        { kind: "list", items: [
                            "Never deletes the whole document or closes the Rhino slot unless asked.",
                            "Does not invent site or code facts; design judgement is left to the designer.",
                            "Stops after a set number of rounds."
                        ] }
                    ]
                },
                {
                    id: "verification",
                    label: "Verification",
                    lead: "About 170 offline tests run the whole app against a mock model, with no network.",
                    blocks: [
                        { kind: "text", body: "A mock provider runs the full app without any model, so the Conductor's action parsing, sessions, slash commands, state updates, retrieval, law search and the Rhino modeler loop are all tested offline. The Conductor can also run on a local model through Ollama while the experts stay on a cloud model." },
                        { kind: "techs", items: [
                            { name: "Python" }, { name: "OpenRouter", note: "experts" }, { name: "Ollama", note: "local Conductor" },
                            { name: "RAG", note: "HTTP / local files" }, { name: "Rhino MCP" }, { name: "pytest · ruff" }
                        ] },
                        { kind: "note", body: "In progress — v0.1 CLI prototype. It does not read drawings or images yet, regulation and precedent outputs still have to be checked by the designer, and the regulation corpus is still being filled." }
                    ]
                }
            ]
        },
        {
            id: "deary",
            title: "Deary",
            description: "An AI-assisted diary app powered by Gemini. Guided questions turn your day into a reflective diary entry.",
            thumbnail: "assets/deary_logo.png",
            tags: ["Figma", "Cursor", "Vibe Coding"],
            githubLink: "https://github.com/baechubaechu/Deary",
            visitLink: "https://deary1.pages.dev/",
            kind: "Code",
            thesis: "A blank page is the hardest part of keeping a diary. Deary replaces it with a short interview: it asks concrete questions about today, digs one level deeper only when an answer is thin, checks that there is enough to write from, and then writes the entry strictly from what you said.",
            chapters: [
                {
                    id: "problem",
                    label: "Problem",
                    lead: "People want a record of their day. The empty page stops them.",
                    blocks: [
                        { kind: "text", body: "Open-ended prompts like \"How was your day?\" get one-line answers, and a one-line answer makes a flat diary. The problem is not writing; it is recalling specific moments on demand." },
                        { kind: "text", body: "So the product question became: what should an interviewer ask, when should it push further, and when should it stop, so that the final entry is both vivid and true?" },
                        { kind: "image", url: "assets/deary0.png", caption: "Home screen" }
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
                        { kind: "image", url: "assets/deary2.jpg", caption: "Daily questions" }
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
                    id: "system",
                    label: "System",
                    lead: "Designed in Figma, built with a coding agent.",
                    blocks: [
                        { kind: "techs", items: [
                            { name: "React 18", note: "UI" },
                            { name: "TypeScript", note: "93%" },
                            { name: "Vite" },
                            { name: "Supabase", note: "Edge Functions · Auth · KV" },
                            { name: "Gemini 2.5 Flash", note: "JSON mode" },
                            { name: "Tailwind v4" },
                            { name: "Cloudflare Pages" },
                            { name: "Cursor", note: "coding agent" }
                        ] },
                        { kind: "text", body: "The API key lives only in the Edge Function environment; the client never sees it. Built solo from Figma design to deployment in February 2026." }
                    ]
                },
                {
                    id: "interface",
                    label: "Interface",
                    lead: "Question, answer, entry.",
                    blocks: [
                        { kind: "gallery", images: [
                            { url: "assets/deary0.png", caption: "Home" },
                            { url: "assets/deary2.jpg", caption: "Daily questions" },
                            { url: "assets/deary1.jpg", caption: "Generated diary entry" }
                        ] },
                        { kind: "links", items: [
                            { label: "Promo video", url: "https://www.youtube.com/watch?v=GRwoxY0-ZwM" },
                            { label: "Live", url: "https://deary1.pages.dev/" },
                            { label: "GitHub", url: "https://github.com/baechubaechu/Deary" }
                        ] }
                    ]
                }
            ],
            sections: [
                {
                    type: "hero-meta",
                    subtitle: "Dear Day, Daily You.",
                    category: "Personal Project",
                    role: "UI/UX Designer<br>Developer",
                    timeline: "2026.02~"
                },
                {
                    type: "dev-tech-stack",
                    spine: ["code", "ai"],
                    label: "TECH STACK",
                    techs: [
                        { name: "TypeScript", note: "93.2% of codebase" },
                        { name: "React 18", note: "Frontend" },
                        { name: "Vite", note: "Build Tool" },
                        { name: "Supabase", note: "BaaS" },
                        { name: "Gemini 2.5 Flash", note: "AI Core" },
                        { name: "Tailwind CSS v4", note: "Styling" },
                        { name: "Radix UI", note: "Component Primitives" },
                        { name: "Lucide React", note: "Icons" },
                        { name: "CloudFlare", note: "Deployment" }
                    ]
                },
                {
                    type: "split-content",
                    spine: ["interaction"],
                    title: "The Vision",
                    leadText: "Making journaling effortless.",
                    description: "Deary is an AI-assisted diary app that helps you reflect on your day through warm, guided questions generated by Gemini. Instead of staring at a blank page, Deary asks you questions — then turns your answers into a coherent, reflective diary entry. The goal was to remove the friction between experience and expression.",
                    media: { type: "image", url: "assets/deary_logo.png" },
                    booklets: [
                        {
                            title: "Project Booklet",
                            url: "assets/placeholder.pdf",
                            thumbnail: "assets/deary_logo.png"
                        }
                    ]
                },
                {
                    type: "dev-code-preview",
                    spine: ["code", "ai"],
                    label: "CODE PREVIEW",
                    filename: "ai.ts",
                    language: "TypeScript (Supabase Edge Function)",
                    caption: "Gemini is given structured rules to ensure the diary reads naturally — no hallucination, diary-style wording, and fact-based writing",
                    code: `// System prompt passed to Gemini 2.5 Flash
const prompt =
  "You are an 'honest recorder' who summarizes the user's day.\\n\\n" +
  "[Rules]\\n" +
  "1. Style: Use past tense. (e.g., ate, was happy, felt tired)\\n" +
  "2. Fact-based: Never invent info the user didn't mention.\\n" +
  "3. Simple: Use easy words. No abstract or academic phrases.\\n" +
  "4. Flow: Connect answers in a natural time order.\\n" +
  "5. Emotion: Reflect feelings and experiences vividly.\\n\\n" +
  "User answers:\\n" + answersText + "\\n\\nWrite the diary body only:";

// Call Gemini 2.5 Flash via Supabase Edge Function
const response = await fetch(GEMINI_API_URL + "?key=" + GEMINI_API_KEY, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 2000 },
  }),
});

const data = await response.json();
return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";`
                },
                {
                    type: "dev-frontend-gallery",
                    spine: ["interaction"],
                    label: "INTERFACE",
                    screenshots: [
                        { url: "assets/deary0.png", caption: "Home screen" },
                        { url: "assets/deary2.jpg", caption: "Daily questions" },
                        { url: "assets/deary1.jpg", caption: "Generated diary entry" }
                    ]
                },
                {
                    type: "dev-video",
                    label: "VIDEO",
                    url: "https://www.youtube.com/watch?v=GRwoxY0-ZwM",
                    caption: "Promo video for Deary"
                }
            ]
        }
        ,
        {
            id: "emotional-architect",
            title: "Emotional Architecture (with A.I.)",
            description: "Can A.I. understand human emotions? A computational experiment that converts real-time facial expressions and public EEG emotion data into living 3D geometry and AI-rendered architectural space.",
            thumbnail: "assets/EAthumbnail.png",
            tags: ["Three.js", "Google Vision API", "Python", "Grasshopper", "Stable Diffusion"],
            githubLink: "https://github.com/baechubaechu/emotion_sphere",
            visitLink: "https://emotion-sphere.vercel.app",
            kind: "Code",
            thesis: "If AI reads emotion as probability vectors, can those vectors become architecture? A webcam feeds a live pipeline where facial emotion drives a Three.js sphere in the browser, while positive and negative EEG samples from a public Kaggle dataset drive a Rhino script that inflates or erodes a corridor. Exhibited at Culture Stockpile Base, Seoul, January 2026.",
            chapters: [
                {
                    id: "question",
                    label: "Question",
                    lead: "Can code capture the warmth of a smile? If so, how do we observe it?",
                    blocks: [
                        { kind: "text", body: "Neuroarchitecture leans on visual hierarchy; architectural phenomenology tends to prescribe the mood a space should create. Both decide the emotion for the visitor." },
                        { kind: "text", body: "This experiment reverses the direction: measure the visitor first, then let the measurement shape the space. The rule is 'form follows data'." },
                        { kind: "image", url: "assets/EAconcept.png" }
                    ]
                },
                {
                    id: "pipeline",
                    label: "Pipeline",
                    lead: "Input → analysis → translation → form.",
                    blocks: [
                        { kind: "steps", items: [
                            "Input: live webcam frames on a tablet, plus positive / negative EEG samples from a public Kaggle emotion dataset.",
                            "Analysis: Google Vision API returns emotion likelihoods (joy, sorrow, anger, surprise), head pose and face box. Latency under 100 ms.",
                            "Translation: a Python/Flask server on Google Cloud Run normalises the raw values and returns them as JSON.",
                            "Form: Three.js deforms a particle sphere in real time; Rhino + Python turns the dataset's EEG sequences into corridor geometry; ComfyUI renders the atmosphere.",
                            "Archive: every frame and its vector are stored in Google Cloud Storage for later study."
                        ] },
                        { kind: "techs", items: [
                            { name: "Google Vision API" }, { name: "Kaggle EEG dataset", note: "EEG" },
                            { name: "Python · Flask" }, { name: "Three.js" },
                            { name: "Rhino · Python 3" }, { name: "ComfyUI" }, { name: "GCS" }
                        ] },
                        { kind: "rules", items: [
                            ["First prototype · Rhino", "Before any web version: local DeepFace (RetinaFace) watching an image folder and writing JSON for Grasshopper. Softmax at temperature 0.85, a 50% confidence cutoff, entropy as an uncertainty score, plus tension and openness indices."],
                            ["Exhibited version · Web", "Moved to the browser: Google Vision behind a Flask API, called frame by frame, so the loop runs live instead of file by file."]
                        ] },
                        { kind: "note", body: "The sphere front end was prototyped in parallel with two models (GPT and Gemini versions kept side by side) before merging." }
                    ]
                },
                {
                    id: "mapping",
                    label: "Mapping Rules",
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
                    label: "Algorithm",
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
                            { url: "assets/EApositive.jpg", caption: "Positive: inflation" },
                            { url: "assets/EAnegative.png", caption: "Negative: erosion" }
                        ] }
                    ]
                },
                {
                    id: "rendering",
                    label: "AI Rendering",
                    lead: "The mesh fixes the form; the model only dresses it.",
                    blocks: [
                        { kind: "text", body: "The Rhino viewport capture goes into a ComfyUI workflow with ControlNet, so the generated image keeps the computed geometry. Positive and negative spaces get separate prompt sets for ceiling, wall and floor." },
                        { kind: "image", url: "assets/EAcomfy.png", caption: "ComfyUI workflow" },
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
                            { url: "assets/EApic4.jpg" }, { url: "assets/EApic1.jpg" },
                            { url: "assets/EApic3.jpg" }, { url: "assets/EApic2.jpg" }
                        ] },
                        { kind: "links", items: [
                            { label: "Booklet", url: "assets/emotional_architect_booklet.pdf" },
                            { label: "Live sphere", url: "https://emotion-sphere.vercel.app" },
                            { label: "GitHub", url: "https://github.com/baechubaechu/emotion_sphere" }
                        ] }
                    ]
                }
            ],
            sections: [
                {
                    type: "hero-meta",
                    subtitle: "Form follows Data.",
                    category: "Computational Side Project / Interactive Installation",
                    role: "Developer<br>Computational Designer",
                    timeline: "January 2026"
                },
                {
                    type: "dev-tech-stack",
                    spine: ["ai", "code", "parametric"],
                    label: "TECH STACK",
                    techs: [
                        { name: "Google Vision API", note: "Emotion Detection" },
                        { name: "Kaggle EEG dataset", note: "Neural Signals" },
                        { name: "Python & Flask", note: "Data Processing" },
                        { name: "Three.js", note: "Live 3D Sphere" },
                        { name: "Rhino & Grasshopper", note: "Spatial Geometry" },
                        { name: "ComfyUI", note: "AI Image Pipeline" },
                        { name: "Google Cloud Storage", note: "Emotion Archive" }
                    ]
                },
                {
                    type: "split-content",
                    spine: ["research", "phenomenology", "interaction"],
                    title: "The Concept",
                    leadText: "The lost dimension of emotion.",
                    description: "In a digital society where genuine emotional expression is flattened by social media, this project asks: can a machine not only detect but spatialize human emotion? Visitors stand before a webcam — their facial expressions are captured in real time and converted into geometric deformation of a 3D sphere, while EEG emotion data from a public dataset shapes corridor spaces that are rendered into architectural atmospheres.",
                    media: { type: "image", url: "assets/EAconcept.png" },
                    booklets: [
                        {
                            title: "Project Booklet",
                            url: "assets/emotional_architect_booklet.pdf",
                            thumbnail: ""
                        }
                    ]
                },
                {
                    type: "dev-code-preview",
                    spine: ["code", "ai"],
                    label: "CODE PREVIEW",
                    filename: "emotion_sphere / index.html",
                    language: "JavaScript — Three.js",
                    caption: "The emotion score from Google Vision API drives real-time vertex displacement on the Three.js sphere",
                    code: `// Emotion score (0.0–1.0) received from Python/Flask backend
// via real-time WebSocket — maps facial expression to geometry

function deformSphere(emotionScore) {
  const positions = geometry.attributes.position;
  const baseRadius = SPHERE_BASE_RADIUS;

  for (let i = 0; i < positions.count; i++) {
    const v = new THREE.Vector3();
    v.fromBufferAttribute(positions, i).normalize();

    // Simplex noise layered with emotion intensity
    const turbulence = noise3D(
      v.x + clock.elapsedTime * 0.3,
      v.y + clock.elapsedTime * 0.3,
      v.z + clock.elapsedTime * 0.3
    );

    // "Form follows Data" — emotion sculpts the surface
    const r = baseRadius + turbulence * emotionScore * 0.4;
    positions.setXYZ(i, v.x * r, v.y * r, v.z * r);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
}`
                },
                {
                    type: "dev-frontend-gallery",
                    spine: ["interaction"],
                    label: "INTERFACE",
                    screenshots: [
                        { url: "assets/EAscreen1.jpg" },
                        { url: "assets/EAscreen1.jpg" },
                        { url: "assets/EAscreen1.jpg" },
                    ]
                },
                {
                    type: "dev-exhibition",
                    spine: ["interaction"],
                    label: "EXHIBITION & DOCUMENT",
                    photos: [
                        { url: "assets/EApic4.jpg" },
                        { url: "assets/EApic1.jpg" },
                        { url: "assets/EApic3.jpg" },
                        { url: "assets/EApic2.jpg" }
                    ],
                    booklets: []
                }
            ]
        }
    ]
};
