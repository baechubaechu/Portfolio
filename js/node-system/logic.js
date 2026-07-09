// logic.js - Evaluates node tree to filter portfolio projects

export function evaluateConnections(nodes, connections) {
    if (!window.projectsData) {
        console.warn('projectsData not found! Make sure projects.js is loaded.');
        return;
    }

    // Find the Output node(s)
    const outputNodes = nodes.filter(n => n.type === 'Output');
    if (outputNodes.length === 0) {
        hidePanel();
        return;
    }

    // Combine conditions from all nodes connected to any Output node
    let activeTags = [];
    let activeCategories = [];

    outputNodes.forEach(outNode => {
        // Find what is connected to this output node
        const inConnections = connections.filter(c => c.toNode === outNode);

        inConnections.forEach(c => {
            const sourceType = c.fromNode.type;
            const sourceValue = c.fromNode.value;

            if (sourceType === 'Skill' && sourceValue) {
                activeTags.push(sourceValue.toLowerCase());
            } else if (sourceType === 'Category' && sourceValue) {
                activeCategories.push(sourceValue.toLowerCase());
            }
        });
    });

    // If nothing connected
    if (activeTags.length === 0 && activeCategories.length === 0) {
        hidePanel(true);
        return;
    }

    // Flatten projectsData since it's an object with categories
    let allProjects = [];
    if (window.projectsData) {
        Object.values(window.projectsData).forEach(arr => {
            if (Array.isArray(arr)) {
                allProjects = allProjects.concat(arr);
            }
        });
    }

    // Filter projects based on collected criteria
    const filteredProjects = allProjects.filter(proj => {
        let matchTags = true;
        let matchCategory = true;

        if (activeTags.length > 0) {
            // Must have ALL selected tags (AND logic within tools) OR check if it includes ANY?
            // Let's do ANY for broader results or ALL for strict. Let's do ALL.
            const projTags = proj.tags.map(t => t.toLowerCase());
            matchTags = activeTags.every(tag => {
                // simple substring match or exact match
                return projTags.some(pt => pt.includes(tag) || tag.includes(pt));
            });
        }

        if (activeCategories.length > 0) {
            // ANY category is fine
            const projCategory = (proj.category || (proj.sections && proj.sections[0] && proj.sections[0].category) || "").toLowerCase();
            matchCategory = activeCategories.some(cat => {
                return projCategory.includes(cat) || cat.includes(projCategory);
            });
        }

        return matchTags && matchCategory;
    });

    renderProjectsPanel(filteredProjects);
}

function hidePanel(showEmpty = false) {
    const list = document.getElementById('projects-list');
    const panel = document.getElementById('projects-panel');
    const badge = document.getElementById('project-count');

    if (showEmpty) {
        panel.classList.remove('hidden');
        badge.innerText = '0';
        list.innerHTML = `
            <div class="empty-state">
                No filters applied. Connect a Category or Tool node to see results.
            </div>
        `;
    } else {
        panel.classList.add('hidden');
    }
}

function renderProjectsPanel(projects) {
    const panel = document.getElementById('projects-panel');
    const list = document.getElementById('projects-list');
    const badge = document.getElementById('project-count');

    panel.classList.remove('hidden');
    badge.innerText = projects.length;

    if (projects.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                No projects matched these criteria. <br>Try changing the connections!
            </div>
        `;
        return;
    }

    let html = '';
    projects.forEach((proj, idx) => {
        html += `
            <a href="project-detail.html?id=${proj.id}" class="project-card-mini" style="animation-delay: ${idx * 0.05}s">
                <img src="${proj.thumbnail}" alt="${proj.title}" class="card-mini-img">
                <div class="card-mini-content">
                    <h4>${proj.title}</h4>
                    <p>${proj.year} · ${proj.location}</p>
                    <div class="card-mini-tags">
                        ${proj.tags.slice(0, 3).map(tag => `<span class="card-mini-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </a>
        `;
    });

    list.innerHTML = html;
}
