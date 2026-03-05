document.addEventListener('DOMContentLoaded', () => {
    // Render projects dynamically FIRST
    renderProjects();

    // Initialize Computational Background Canvas
    initComputationalCanvas();
});


function initComputationalCanvas() {
    const canvas = document.getElementById('computational-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let nodes = [];

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    window.addEventListener('resize', resize);
    resize();

    // Node object representing logical points
    class Node {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            // Slow, deliberate movement fitting architecture vibes
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.radius = 1.5;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            // Lighter, less saturated gray
            ctx.fillStyle = 'rgba(156, 163, 175, 0.7)';
            ctx.fill();

            // Subtle glow for active nodes
            if (this.radius > 1.8) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius + 3, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(37, 99, 235, 0.08)';
                ctx.fill();
            }
        }
    }

    // Slightly higher density for more connections
    const nodeDensity = 12000;
    const numNodes = Math.min(Math.floor((window.innerWidth * window.innerHeight) / nodeDensity), 120);

    for (let i = 0; i < numNodes; i++) {
        nodes.push(new Node());
    }

    let mouse = { x: null, y: null };
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < nodes.length; i++) {
            nodes[i].update();
            nodes[i].draw();

            // Inter-node connections
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    ctx.beginPath();
                    // Original V1 base line opacity, matching V2 distance 120
                    const opacity = (1 - distance / 120) * 0.2;
                    ctx.strokeStyle = `rgba(55, 65, 81, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }

            // Connection and interaction from mouse
            if (mouse.x && mouse.y) {
                const dx = nodes[i].x - mouse.x;
                const dy = nodes[i].y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Match V2 exactly: distance 120
                if (distance < 120) {
                    ctx.beginPath();
                    // Blue tint for V1, but V2 opacity logic
                    const mouseOpacity = 1 - distance / 120;
                    ctx.strokeStyle = `rgba(37, 99, 235, ${mouseOpacity})`;
                    ctx.lineWidth = 0.5; // Match V2 line width
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();

                    // Match V2 tiny gravitational pull exactly (0.005)
                    nodes[i].x -= dx * 0.005;
                    nodes[i].y -= dy * 0.005;
                }
            }
        }

        requestAnimationFrame(animate);
    }

    animate();
}

function renderProjects() {
    function createCard(project, category) {
        const isOtherWorks = category === 'otherWorks';
        const isCaseStudy = project.isCaseStudy;

        let cardHTML = '';

        // Handle thumbnail or placeholder
        const hasThumbnail = project.thumbnail && project.thumbnail.trim() !== '';

        let imageContent = '';
        if (hasThumbnail) {
            if (isOtherWorks && isCaseStudy) {
                imageContent = `<div class="card-image code-visual" style="background: white; padding: 1rem; display: flex; align-items: center; justify-content: center;">
                                   <img src="${project.thumbnail}" alt="${project.title} Logo" style="max-width: 80%; max-height: 80%; object-fit: contain;" loading="lazy">
                                   <div class="view-hint">View Case Study →</div>
                                </div>`;
            } else {
                imageContent = `<div class="card-image">
                                   <img src="${project.thumbnail}" alt="${project.title}" loading="lazy">
                                </div>`;
            }
        } else {
            const defaultText = project.title;
            imageContent = `<div class="card-image placeholder-img" data-text="${defaultText}"></div>`;
        }

        // Tags
        const tagsHTML = project.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ');

        // Links for Other Works
        let linksHTML = '';
        if (isOtherWorks) {
            let primaryLink = '';
            if (isCaseStudy) {
                primaryLink = `<span class="link-btn">Case Study</span>`;
            } else if (project.visitLink) {
                primaryLink = `<a href="${project.visitLink}" target="_blank" class="link-btn">Live Site</a>`;
            }

            let githubLink = '';
            if (project.githubLink) {
                githubLink = `<a href="${project.githubLink}" target="_blank" class="link-btn secondary">GitHub</a>`;
            } else if (isCaseStudy) {
                githubLink = `<span class="link-btn secondary">GitHub</span>`;
            }

            linksHTML = `
                <div class="project-links">
                    ${primaryLink}
                    ${githubLink}
                </div>
            `;
        }

        // Use a standard <a> tag overlay to make the whole card clickable properly 
        // without JS, while allowing inner buttons to remain clickable by using z-index
        const detailUrl = `project-detail.html?id=${project.id}`;
        // Note: For Vercel/serve clean URLs, project-detail?id=... also works, but .html is safer locally

        cardHTML = `
            <div class="project-card fade-in-scroll ${isOtherWorks ? 'code-card' : ''}" style="position: relative;">
                <!-- Full card clickable link with localStorage fallback -->
                <a href="${detailUrl}" onclick="localStorage.setItem('currentProjectId', '${project.id}');" style="position: absolute; inset: 0; z-index: 1; text-decoration: none;"></a>
                
                <div style="position: relative; z-index: 0; pointer-events: none;">
                    ${imageContent}
                </div>
                
                <div class="card-content" style="position: relative; z-index: 0; pointer-events: none;">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div class="tags">
                        ${tagsHTML}
                    </div>
                </div>
                
                ${linksHTML ? `
                <div class="card-content" style="position: relative; z-index: 2; padding-top: 0;">
                    ${linksHTML}
                </div>
                ` : ''}
            </div>
        `;

        return cardHTML;
    }

    const schoolWorksGrid = document.getElementById('school-works-grid');
    if (schoolWorksGrid && projectsData.schoolWorks) {
        let html = '';
        projectsData.schoolWorks.forEach(p => html += createCard(p, 'schoolWorks'));
        schoolWorksGrid.innerHTML = html;
    }

    const competitionsGrid = document.getElementById('competitions-grid');
    if (competitionsGrid && projectsData.competitions) {
        let html = '';
        projectsData.competitions.forEach(p => html += createCard(p, 'competitions'));
        competitionsGrid.innerHTML = html;
    }

    const otherWorksGrid = document.getElementById('other-works-grid');
    if (otherWorksGrid && projectsData.otherWorks) {
        let html = '';
        projectsData.otherWorks.forEach(p => html += createCard(p, 'otherWorks'));
        otherWorksGrid.innerHTML = html;
    }

    // After rendering, set up observer for animations
    setupObserver();
}

function setupObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-scroll').forEach(element => {
        observer.observe(element);
    });
}


