// main.js - Entry point for the Node Workspace
import { NodeEngine } from './engine.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the engine
    const engine = new NodeEngine('workspace-container', 'workspace-transform', 'wire-canvas', 'node-canvas');

    // UI Event Listeners
    setupTopBar(engine);
    setupPalette(engine);
    setupPanels(engine);

    // Create initial default nodes (optional)
    engine.addNode('Category', 300, 300);
    engine.addNode('Skill', 300, 500);
    engine.addNode('Output', 800, 400);

    engine.updateLogic(); // initial run
});

function setupTopBar(engine) {
    document.getElementById('btn-reset-view').addEventListener('click', () => {
        engine.resetView();
    });
}

function setupPalette(engine) {
    const paletteItems = document.querySelectorAll('.palette-item');

    let draggedType = null;
    let dragGhost = null;

    paletteItems.forEach(item => {
        // Disable default HTML5 drag
        item.removeAttribute('draggable');

        item.addEventListener('mousedown', (e) => {
            draggedType = item.dataset.type;

            // Create a ghost element that follows the cursor
            dragGhost = item.cloneNode(true);
            dragGhost.style.position = 'fixed';
            dragGhost.style.pointerEvents = 'none'; // let mouse events pass through to body
            dragGhost.style.opacity = '0.8';
            dragGhost.style.zIndex = '10000';
            dragGhost.style.left = e.clientX + 'px';
            dragGhost.style.top = e.clientY + 'px';
            document.body.appendChild(dragGhost);

            // Prevent actual text selection during drag
            e.preventDefault();
        });
    });

    window.addEventListener('mousemove', (e) => {
        if (dragGhost) {
            dragGhost.style.left = (e.clientX + 5) + 'px'; // slight offset so it's not directly under cursor
            dragGhost.style.top = (e.clientY + 5) + 'px';
        }
    });

    window.addEventListener('mouseup', (e) => {
        if (draggedType && dragGhost) {
            // Drop successful!
            const point = engine.screenToCanvas(e.clientX, e.clientY);
            engine.addNode(draggedType, point.x, point.y);

            // Cleanup
            dragGhost.remove();
            dragGhost = null;
            draggedType = null;
        }
    });

    // Also support click to add
    paletteItems.forEach(item => {
        item.addEventListener('click', () => {
            const type = item.dataset.type;
            const viewCenter = engine.screenToCanvas(window.innerWidth / 2, window.innerHeight / 2);
            // offset slightly so they don't exactly stack entirely
            const randOffset = (Math.random() - 0.5) * 100;
            engine.addNode(type, viewCenter.x + randOffset, viewCenter.y + randOffset);
        });
    });
}

function setupPanels(engine) {
    document.getElementById('close-panel').addEventListener('click', () => {
        document.getElementById('projects-panel').classList.add('hidden');
    });
}
