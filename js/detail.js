document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    let projectId = urlParams.get('id');

    // Fallback to localStorage if the URL parameter was stripped by a server redirect
    if (!projectId) {
        projectId = localStorage.getItem('currentProjectId');
    }

    if (!projectId) {
        showError("Project not found.");
        return;
    }

    // Find the project in projectsData
    let project = null;
    for (const category in projectsData) {
        project = projectsData[category].find(p => p.id === projectId);
        if (project) break;
    }

    if (!project) {
        showError("Project ID '" + projectId + "' not found.");
        return;
    }

    renderModularProject(project);
});

function renderModularProject(project) {
    const container = document.getElementById('detail-card-container');
    if (!container) return;

    // Clear loading state
    container.innerHTML = '';

    if (!project.sections || project.sections.length === 0) {
        showError("This project has no detailed content blocks defined.");
        return;
    }

    project.sections.forEach((section, index) => {
        const sectionHTML = createSectionHTML(section, project, index);
        if (sectionHTML) {
            container.insertAdjacentHTML('beforeend', sectionHTML);
        }
    });

    // Final Footer Section (Always present)
    const footerHTML = `
        <footer class="project-footer fade-in-scroll">
            <div class="footer-content">
                <h3>Interested in the project?</h3>
                <div class="footer-actions">
                    <a href="mailto:jhp503@gmail.com" class="btn-primary">Ask More</a>
                    <a href="index.html" class="btn-secondary">Return to Overview</a>
                </div>
            </div>
        </footer>
    `;
    container.insertAdjacentHTML('beforeend', footerHTML);

    // Re-initialize scroll observer
    if (typeof setupObserver === 'function') {
        setupObserver();
    }

    // Initialize drag-to-scroll for plans gallery
    initDragToScroll();
}

function initDragToScroll() {
    const scrollers = document.querySelectorAll('.arch-plans-scroller');
    scrollers.forEach(slider => {
        // Clone the items to create a seamless infinite loop effect
        const items = Array.from(slider.children);
        items.forEach(item => {
            const clone = item.cloneNode(true);
            slider.appendChild(clone);
        });

        let isDown = false;
        let startX;
        let scrollLeft;
        let isHovered = false;
        let animationId;
        let dragMoved = false;

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.classList.add('active');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
            dragMoved = false;
            cancelAnimationFrame(animationId);
        });

        slider.addEventListener('mouseenter', () => {
            isHovered = true;
            cancelAnimationFrame(animationId);
        });

        slider.addEventListener('mouseleave', () => {
            isHovered = false;
            if (!isDown) startAutoScroll();
        });

        window.addEventListener('mouseup', () => {
            if (isDown) {
                isDown = false;
                slider.classList.remove('active');
                if (!isHovered) startAutoScroll();
            }
        });

        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX);
            slider.scrollLeft = scrollLeft - walk;
            if (Math.abs(walk) > 5) dragMoved = true;
        });

        // CRITICAL: Disable native browser drag-and-drop
        slider.addEventListener('dragstart', (e) => {
            e.preventDefault();
        });

        // Prevent click if we were dragging
        slider.addEventListener('click', (e) => {
            if (dragMoved) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);

        // Auto Scroll Logic
        function autoScroll() {
            if (!isDown && !isHovered) {
                slider.scrollLeft += 0.5; // Smooth scroll speed

                const halfWidth = slider.scrollWidth / 2;
                if (slider.scrollLeft >= halfWidth) {
                    slider.scrollLeft = 0; // Snap exactly to start for a perfect loop
                }
            }
            animationId = requestAnimationFrame(autoScroll);
        }

        function startAutoScroll() {
            cancelAnimationFrame(animationId);
            animationId = requestAnimationFrame(autoScroll);
        }

        // Start auto-scroll after layout is ready
        setTimeout(startAutoScroll, 500);
    });
}

function createSectionHTML(section, project, index) {
    const animationClass = "fade-in-scroll";

    switch (section.type) {
        case 'hero-meta':
            return `
                <header class="project-header fade-in">
                    <div class="project-title-group">
                        <span class="mono-tag">// ARCHIVE_ID: ${project.id.toUpperCase()}</span>
                        <h1>${project.title}</h1>
                        <p class="project-subtitle">${section.subtitle || ''}</p>
                    </div>
                    <div class="project-meta-grid">
                        <div class="meta-item"><h4>Category</h4><p>${section.category || '-'}</p></div>
                        <div class="meta-item"><h4>Role</h4><p>${section.role || '-'}</p></div>
                        <div class="meta-item"><h4>Timeline</h4><p>${section.timeline || '-'}</p></div>
                        <div class="meta-item">
                            <h4>Execution</h4>
                            <div class="meta-links">
                                ${project.visitLink ? `<a href="${project.visitLink}" target="_blank">Visit Project</a>` : ''}
                                ${project.githubLink ? `<a href="${project.githubLink}" target="_blank">Repository</a>` : ''}
                                ${!project.visitLink && !project.githubLink ? '<p class="mono-text">Internal Archive</p>' : ''}
                            </div>
                        </div>
                    </div>
                </header>
            `;

        case 'split-content':
            let mediaHTML = '';
            if (section.media && section.media.url) {
                if (section.media.type === 'video') {
                    mediaHTML = `<div class="video-mockup"><div class="video-container"><iframe src="${section.media.url}" frameborder="0" allowfullscreen></iframe></div></div>`;
                } else {
                    mediaHTML = `<div class="image-mockup"><img src="${section.media.url}" alt="${section.title}"></div>`;
                }
            }
            const splitBooklets = (section.booklets || []).map(book => `
                <a class="booklet-card split-booklet" href="${book.url}" target="_blank">
                    <div class="booklet-cover">
                        ${book.thumbnail ? `<img src="${book.thumbnail}" alt="${book.title || 'Booklet'}">` : '<div class="booklet-placeholder">📄</div>'}
                    </div>
                    <div class="booklet-info">
                        <span class="booklet-title">${book.title || 'View Document'}</span>
                        <span class="booklet-cta">Open ↗</span>
                    </div>
                </a>
            `).join('');
            return `
                <section class="detail-section ${animationClass}">
                    ${section.title ? `<h2>${section.title}</h2>` : ''}
                    <div class="detail-grid">
                        <div class="detail-text">
                            <p class="lead-text">${section.leadText || ''}</p>
                            <p>${section.description || ''}</p>
                            ${splitBooklets ? `<div class="split-booklet-row">${splitBooklets}</div>` : ''}
                        </div>
                        <div class="detail-visual">
                            ${mediaHTML}
                        </div>
                    </div>
                </section>
            `;

        case 'features-list':
            const itemsHTML = section.items.map((item, idx) => `
                <div class="feature-item">
                    <span class="mono-num">${(idx + 1).toString().padStart(2, '0')}.</span>
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                </div>
            `).join('');
            return `
                <section class="detail-section ${animationClass}">
                    <h2>${section.title || 'Core Experience'}</h2>
                    <div class="features-list">
                        ${itemsHTML}
                    </div>
                </section>
            `;

        case 'image-grid':
            const gridImages = section.images.map(img => `<div class="grid-img-item"><img src="${img}" alt="Gallery image"></div>`).join('');
            return `
                <section class="detail-section ${animationClass}">
                    ${section.title ? `<h2>${section.title}</h2>` : ''}
                    <div class="detail-grid-modular cols-${section.columns || 2}">
                        ${gridImages}
                    </div>
                </section>
            `;

        case 'arch-competition-info':
            return `
                <section class="detail-section arch-section ${animationClass}">
                    <span class="arch-label">COMPETITION INFO</span>
                    <div class="competition-info-grid">
                        <div class="info-item">
                            <span class="info-label">ORGANIZER</span>
                            <span class="info-value">${section.organizer || '-'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">YEAR</span>
                            <span class="info-value">${section.year || '-'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">TEAM</span>
                            <span class="info-value">${section.team || 'Solo Project'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">LOCATION</span>
                            <span class="info-value">${section.location || '-'}</span>
                        </div>
                    </div>
                </section>
            `;

        case 'arch-concept':
            return `
                <section class="detail-section arch-section ${animationClass}">
                    <div class="arch-concept-grid">
                        <div class="arch-text">
                            <span class="arch-label">CONCEPT</span>
                            <p class="lead-text">${section.leadText || ''}</p>
                            <p>${section.description || ''}</p>
                        </div>
                        <div class="arch-visual">
                            <img src="${section.image}" alt="Concept Visual" class="zoom-image">
                        </div>
                    </div>
                </section>
            `;

        case 'arch-plans':
            if (!section.plans) return '';
            const planItems = section.plans.map(plan => {
                if (plan.url.toLowerCase().endsWith('.pdf')) {
                    return `
                        <div class="arch-plan-item arch-pdf-grid-item">
                            <div class="pdf-container">
                                <iframe src="${plan.url}" width="100%" height="500px" style="border:none; background: white;"></iframe>
                            </div>
                            <div class="plan-info">
                                ${plan.title ? `<h4 class="plan-title">${plan.title}</h4>` : ''}
                                <a href="${plan.url}" target="_blank" class="pdf-overlay-link">View Original PDF</a>
                            </div>
                        </div>
                    `;
                }
                return `
                    <div class="arch-plan-item">
                        <a href="${plan.url}" target="_blank" class="plan-image-link" title="Click to view full image">
                            <img src="${plan.url}" alt="${plan.title || 'Architectural Plan'}" class="zoom-image">
                        </a>
                        ${plan.title ? `<div class="plan-info"><h4 class="plan-title">${plan.title}</h4></div>` : ''}
                    </div>
                `;
            }).join('');

            return `
                <section class="detail-section arch-section ${animationClass}">
                    <span class="arch-label">${section.label || 'PLANS'}</span>
                    <div class="arch-plans-scroller-wrapper">
                        <div class="arch-plans-scroller">
                            ${planItems}
                        </div>
                        <div class="scroll-hint"><span>Hover to Pause, Drag to Scroll</span> &rarr;</div>
                    </div>
                </section>
            `;

        case 'arch-renders':
            if (!section.images) return '';
            const renderItems = section.images.map(img => {
                const url = typeof img === 'string' ? img : img.url;
                return `
                    <div class="arch-gallery-item">
                        <img src="${url}" alt="Visualization" class="gallery-image">
                    </div>
                `;
            }).join('');
            return `
                <section class="detail-section arch-section ${animationClass}">
                    <span class="arch-label">${section.label || 'VISUALIZATION'}</span>
                    <div class="arch-gallery-grid cols-${section.columns || 1}">
                        ${renderItems}
                    </div>
                </section>
            `;

        case 'arch-models':
            if (!section.images) return '';
            const modelItems = section.images.map(img => {
                const url = typeof img === 'string' ? img : img.url;
                return `
                    <div class="arch-gallery-item">
                        <img src="${url}" alt="Physical Model" class="gallery-image">
                    </div>
                `;
            }).join('');
            return `
                <section class="detail-section arch-section ${animationClass}">
                    <span class="arch-label">${section.label || 'PHYSICAL MODELS'}</span>
                    <div class="arch-gallery-grid cols-${section.columns || 2}">
                        ${modelItems}
                    </div>
                </section>
            `;

        case 'arch-pdf':
            return `
                <section class="detail-section arch-section ${animationClass}">
                    <span class="arch-label">DOCUMENTATION</span>
                    <div class="arch-pdf-view">
                        <iframe src="${section.url}" width="100%" height="800px" style="border: none; border-radius: 8px;"></iframe>
                        <div class="pdf-fallback-link">
                            <p>Can't see the PDF? <a href="${section.url}" target="_blank">View Original Document</a></p>
                        </div>
                    </div>
                </section>
            `;

        case 'arch-panel':
            return `
                <section class="detail-section arch-section ${animationClass}">
                    <span class="arch-label">FINAL PANEL</span>
                    <div class="arch-panel-view">
                        <img src="${section.image}" alt="Final Panel" class="zoom-image full-width">
                        <div class="view-hint-overlay">Zoom to View Details</div>
                    </div>
                </section>
            `;

        case 'technical-specs':
            const specsHTML = section.specs.map(spec => `
                <div class="spec-row">
                    <span class="spec-label">${spec.label}</span>
                    <span class="spec-value">${spec.value}</span>
                </div>
            `).join('');
            return `
                <section class="detail-section ${animationClass}">
                    <h2>${section.title || 'Technical Specs'}</h2>
                    <div class="technical-specs-grid">
                        ${specsHTML}
                    </div>
                </section>
            `;

        case 'text-full':
            return `
                <section class="detail-section ${animationClass}">
                    <div class="text-full-width">
                        ${section.title ? `<h2>${section.title}</h2>` : ''}
                        <div class="narrative-container collapsed">
                            <div class="narrative-body">${section.content}</div>
                        </div>
                        <button class="narrative-toggle" onclick="toggleNarrative(this)">Read More</button>
                    </div>
                </section>
            `;

        // --- DEV / OTHER WORKS SECTIONS ---

        case 'dev-video':
            // Convert a YouTube watch URL to embed URL if needed
            const rawUrl = section.url || '';
            const embedUrl = rawUrl.includes('watch?v=')
                ? rawUrl.replace('watch?v=', 'embed/')
                : rawUrl.includes('youtu.be/')
                    ? rawUrl.replace('youtu.be/', 'www.youtube.com/embed/')
                    : rawUrl;
            return `
                <section class="detail-section dev-section ${animationClass}">
                    <span class="arch-label">${section.label || 'VIDEO'}</span>
                    ${section.title ? `<h2 class="dev-video-title">${section.title}</h2>` : ''}
                    <div class="dev-video-wrapper">
                        <iframe
                            src="${embedUrl}?rel=0&modestbranding=1"
                            title="${section.title || 'Project Video'}"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen>
                        </iframe>
                    </div>
                    ${section.caption ? `<p class="code-caption">${section.caption}</p>` : ''}
                </section>
            `;

        case 'dev-tech-stack':
            const techItems = (section.techs || []).map(tech => `
                <div class="tech-badge">
                    <span class="tech-name">${tech.name}</span>
                    ${tech.note ? `<span class="tech-note">${tech.note}</span>` : ''}
                </div>
            `).join('');
            return `
                <section class="detail-section dev-section ${animationClass}">
                    <span class="arch-label">${section.label || 'TECH STACK'}</span>
                    <div class="tech-stack-grid">
                        ${techItems}
                    </div>
                </section>
            `;

        case 'dev-code-preview':
            const codeLines = (section.code || '').split('\n').map(line => {
                const esc = line
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');

                // Comments: handle entire rest of line
                if (/\/\//.test(esc)) {
                    const idx = esc.indexOf('//');
                    const pre = esc.slice(0, idx);
                    const cmt = esc.slice(idx);
                    return `<div class="code-line">${syntaxHighlight(pre)}<span class="cmt">${cmt}</span></div>`;
                }
                return `<div class="code-line">${syntaxHighlight(esc)}</div>`;
            }).join('');
            return `
                <section class="detail-section dev-section ${animationClass}">
                    <span class="arch-label">${section.label || 'CODE'}</span>
                    <div class="code-block-container">
                        <div class="code-block-header">
                            <div class="window-dots">
                                <span></span><span></span><span></span>
                            </div>
                            <span class="code-filename">${section.filename || 'snippet'}</span>
                            <span class="code-lang">${section.language || 'ts'}</span>
                        </div>
                        <pre class="code-block"><code>${codeLines}</code></pre>
                    </div>
                    ${section.caption ? `<p class="code-caption">${section.caption}</p>` : ''}
                </section>
            `;

        case 'dev-frontend-gallery':
            const screenshotItems = (section.screenshots || []).map(shot => {
                const url = typeof shot === 'string' ? shot : shot.url;
                const caption = typeof shot === 'object' ? shot.caption : '';
                return `
                    <div class="dev-screenshot-item">
                        <img src="${url}" alt="${caption || 'UI Screenshot'}">
                        ${caption ? `<p class="screenshot-caption">${caption}</p>` : ''}
                    </div>
                `;
            }).join('');
            return `
                <section class="detail-section dev-section ${animationClass}">
                    <span class="arch-label">${section.label || 'INTERFACE'}</span>
                    <div class="dev-screenshot-scroller-wrapper">
                        <div class="dev-screenshot-scroller arch-plans-scroller">
                            ${screenshotItems}
                        </div>
                    </div>
                    ${project.visitLink ? `<div style="text-align: center;"><a href="${project.visitLink}" target="_blank" class="dev-visit-gallery-btn">Visit Project ↗</a></div>` : ''}
                </section>
            `;

        case 'dev-exhibition':
            const exhibitionPhotos = (section.photos || []).map(photo => {
                const url = typeof photo === 'string' ? photo : photo.url;
                const caption = typeof photo === 'object' ? photo.caption : '';
                return `
                    <div class="exhibition-photo-item">
                        <img src="${url}" alt="${caption || 'Exhibition photo'}">
                        ${caption ? `<p class="exhibition-caption">${caption}</p>` : ''}
                    </div>
                `;
            }).join('');
            const bookletItems = (section.booklets || []).map(book => `
                <a class="booklet-card" href="${book.url}" target="_blank">
                    <div class="booklet-cover">
                        ${book.thumbnail ? `<img src="${book.thumbnail}" alt="${book.title || 'Booklet'}">` : '<div class="booklet-placeholder">📄</div>'}
                    </div>
                    <div class="booklet-info">
                        <span class="booklet-title">${book.title || 'View Document'}</span>
                        <span class="booklet-cta">Open ↗</span>
                    </div>
                </a>
            `).join('');
            return `
                <section class="detail-section dev-section ${animationClass}">
                    <span class="arch-label">${section.label || 'EXHIBITION'}</span>
                    <div class="dev-exhibition-grid">
                        ${exhibitionPhotos.length > 0 ? `<div class="exhibition-photos">${exhibitionPhotos}</div>` : ''}
                        ${bookletItems.length > 0 ? `<div class="exhibition-booklets">${bookletItems}</div>` : ''}
                    </div>
                </section>
            `;

        case 'dev-booklet':
            const bookletOnlyItems = (section.booklets || []).map(book => `
                <a class="booklet-card" href="${book.url}" target="_blank">
                    <div class="booklet-cover">
                        ${book.thumbnail ? `<img src="${book.thumbnail}" alt="${book.title || 'Booklet'}">` : '<div class="booklet-placeholder">📄</div>'}
                    </div>
                    <div class="booklet-info">
                        <span class="booklet-title">${book.title || 'View Document'}</span>
                        <span class="booklet-cta">Open ↗</span>
                    </div>
                </a>
            `).join('');
            return `
                <section class="detail-section dev-section ${animationClass}">
                    <span class="arch-label">${section.label || 'DOCUMENT'}</span>
                    ${section.description ? `<p class="dev-booklet-description">${section.description}</p>` : ''}
                    <div class="dev-booklet-row">
                        ${bookletOnlyItems}
                    </div>
                </section>
            `;

        default:
            return '';
    }
}

// Syntax highlighter helper — runs outside the switch to avoid re-declaration issues
function syntaxHighlight(text) {
    const KW = /\b(const|let|var|function|return|async|await|if|else|for|while|class|import|export|from|default|new|this|null|undefined|true|false|type|interface|extends)\b/g;
    const result = [];
    let i = 0;
    while (i < text.length) {
        // Check for string: single/double quote
        if (text[i] === '"' || text[i] === "'") {
            const q = text[i];
            let j = i + 1;
            while (j < text.length && text[j] !== q) j++;
            j++;
            result.push(`<span class="str">${text.slice(i, j)}</span>`);
            i = j;
            continue;
        }
        // Match keyword at current position
        KW.lastIndex = i;
        const m = KW.exec(text);
        if (m && m.index === i) {
            result.push(`<span class="kw">${m[0]}</span>`);
            i += m[0].length;
            continue;
        }
        result.push(text[i]);
        i++;
    }
    return result.join('');
}


function showError(message) {
    const container = document.getElementById('detail-card-container');
    if (container) {
        container.innerHTML = `
            <div style="padding: 10rem 0; text-align: center;">
                <h2 style="color: var(--accent);">Oops!</h2>
                <p class="mono-text">${message}</p>
                <a href="index.html" class="btn-primary" style="margin-top: 2rem;">Return Home</a>
            </div>
        `;
    }
}

// Global toggle for narrative expansion
window.toggleNarrative = function (btn) {
    const container = btn.previousElementSibling;
    const isCollapsed = container.classList.toggle('collapsed');
    btn.textContent = isCollapsed ? 'Read More' : 'Show Less';

    // Smooth scroll back to section top if closing
    if (isCollapsed) {
        container.closest('.detail-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};
