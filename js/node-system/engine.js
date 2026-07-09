// engine.js - Handles Canvas Pan/Zoom, Nodes rendering, and Wire drawing
import { evaluateConnections } from './logic.js';

export class NodeEngine {
    constructor(containerId, transformId, svgId, nodeContainerId) {
        this.container = document.getElementById(containerId);
        this.transformEl = document.getElementById(transformId);
        this.svgEl = document.getElementById(svgId);
        this.nodeContainer = document.getElementById(nodeContainerId);

        // Core State
        this.nodes = [];
        this.connections = []; // { fromNode, fromPort, toNode, toPort }
        this.scale = 1;
        this.panX = 0;
        this.panY = 0;

        // Interaction State
        this.isPanning = false;
        this.startX = 0;
        this.startY = 0;

        this.isDraggingNode = false;
        this.activeNode = null;

        this.isDrawingWire = false;
        this.wireStartPort = null;
        this.wireStartNode = null;
        this.tempWire = null;

        this.initCanvasEvents();
    }

    /* ================= TRANSLATE / SCALE ================= */
    initCanvasEvents() {
        // Panning
        this.container.addEventListener('mousedown', (e) => {
            if (e.target === this.container || e.target.id === 'grid-bg') {
                this.isPanning = true;
                this.startX = e.clientX - this.panX;
                this.startY = e.clientY - this.panY;
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (this.isPanning) {
                this.panX = e.clientX - this.startX;
                this.panY = e.clientY - this.startY;
                this.updateTransform();
            } else if (this.isDraggingNode && this.activeNode) {
                // Drag Node
                const dx = (e.clientX - this.startX) / this.scale;
                const dy = (e.clientY - this.startY) / this.scale;
                this.activeNode.x += dx;
                this.activeNode.y += dy;
                this.startX = e.clientX;
                this.startY = e.clientY;
                this.renderNodePosition(this.activeNode);
                this.updateWires();
            } else if (this.isDrawingWire) {
                // Draw temp wire
                const mousePt = this.screenToCanvas(e.clientX, e.clientY);
                const startPt = this.getPortPosition(this.wireStartNode, this.wireStartPort);
                this.drawTempWire(startPt.x, startPt.y, mousePt.x, mousePt.y);
            }
        });

        window.addEventListener('mouseup', (e) => {
            this.isPanning = false;
            if (this.isDraggingNode) {
                this.isDraggingNode = false;
                this.activeNode = null;
            }
            if (this.isDrawingWire) {
                this.isDrawingWire = false;
                if (this.tempWire) {
                    this.tempWire.remove();
                    this.tempWire = null;
                }
                this.wireStartPort = null;
                this.wireStartNode = null;
            }
        });

        // Zooming
        this.container.addEventListener('wheel', (e) => {
            // e.preventDefault();
            const zoomSensitivity = 0.001;
            const delta = e.deltaY * -zoomSensitivity;

            // Calculate mouse position relative to container
            const rect = this.container.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Canvas coordinates before zoom
            const pt1 = this.screenToCanvas(e.clientX, e.clientY);

            // Apply zoom
            this.scale = Math.min(Math.max(0.2, this.scale + delta), 3);

            // Canvas coordinates after zoom
            // We want screen(mouseX, mouseY) to still point to pt1
            // panX + pt1.x * scale = mouseX => panX = mouseX - pt1.x * scale
            this.panX = mouseX - pt1.x * this.scale;
            this.panY = mouseY - pt1.y * this.scale;

            this.updateTransform();
        });
    }

    updateTransform() {
        this.transformEl.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
    }

    resetView() {
        this.panX = 0;
        this.panY = 0;
        this.scale = 1;
        this.updateTransform();
    }

    screenToCanvas(screenX, screenY) {
        const rect = this.container.getBoundingClientRect();
        return {
            x: (screenX - rect.left - this.panX) / this.scale,
            y: (screenY - rect.top - this.panY) / this.scale
        };
    }

    /* ================= NODES ================= */
    addNode(type, x, y) {
        const id = 'node_' + Date.now() + Math.floor(Math.random() * 100);
        const nodeData = { id, type, x, y, el: null, value: null };

        const el = document.createElement('div');
        el.className = `gh-node node-${type}`;
        el.id = id;

        let headerIcon = type;
        let contentHtml = '';
        let portsHtml = '';

        if (type === 'Category') {
            nodeData.value = 'Architecture';
            contentHtml = `
                <select class="node-select">
                    <option value="Architecture">Architecture</option>
                    <option value="Computation">Computation</option>
                    <option value="Algorithm">Algorithm</option>
                    <option value="Web">Web Dev</option>
                </select>
            `;
            portsHtml = `
                <div class="node-ports-out">
                    <div class="gh-port" data-portid="out" title="Output"></div>
                </div>
            `;
        } else if (type === 'Skill') {
            nodeData.value = 'Rhino';
            contentHtml = `
                <select class="node-select">
                    <option value="Rhino">Rhino</option>
                    <option value="Grasshopper">Grasshopper</option>
                    <option value="React">React</option>
                    <option value="Python">Python</option>
                    <option value="C#">C#</option>
                </select>
            `;
            portsHtml = `
                <div class="node-ports-out">
                    <div class="gh-port" data-portid="out" title="Output"></div>
                </div>
            `;
        } else if (type === 'Output') {
            contentHtml = `<span>Filter Projects</span>`;
            portsHtml = `
                <div class="node-ports-in">
                    <div class="gh-port" data-portid="in1" title="Input A"></div>
                    <div class="gh-port" data-portid="in2" title="Input B"></div>
                    <div class="gh-port" data-portid="in3" title="Input C"></div>
                </div>
            `;
        } else {
            // Default
            contentHtml = `<span>${type}</span>`;
            portsHtml = `
                <div class="node-ports-in"><div class="gh-port" data-portid="in"></div></div>
                <div class="node-ports-out"><div class="gh-port" data-portid="out"></div></div>
            `;
        }

        el.innerHTML = `
            <div class="node-header">
                <div><span class="type-icon ${type}"></span>${type}</div>
                <button class="node-btn-delete" title="Delete Node">×</button>
            </div>
            <div class="node-content">${contentHtml}</div>
            ${portsHtml}
        `;

        this.nodeContainer.appendChild(el);
        nodeData.el = el;
        this.nodes.push(nodeData);

        this.renderNodePosition(nodeData);

        // Events
        const header = el.querySelector('.node-header');
        header.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('node-btn-delete')) return;
            this.isDraggingNode = true;
            this.activeNode = nodeData;
            this.startX = e.clientX;
            this.startY = e.clientY;

            // Bring to front
            this.nodes.forEach(n => n.el.classList.remove('selected'));
            el.classList.add('selected');
        });

        // Delete button
        const delBtn = el.querySelector('.node-btn-delete');
        delBtn.addEventListener('click', () => {
            this.deleteNode(id);
        });

        // Select Change
        const select = el.querySelector('select');
        if (select) {
            select.addEventListener('change', (e) => {
                nodeData.value = e.target.value;
                this.updateLogic();
            });
        }

        // Setup Ports
        this.setupPorts(nodeData);
    }

    renderNodePosition(node) {
        node.el.style.left = `${node.x}px`;
        node.el.style.top = `${node.y}px`;
    }

    deleteNode(id) {
        // Remove connections
        this.connections = this.connections.filter(c => c.fromNode.id !== id && c.toNode.id !== id);
        this.updateWires();

        // Remove node DOM and array item
        const node = this.nodes.find(n => n.id === id);
        if (node) {
            node.el.remove();
            this.nodes = this.nodes.filter(n => n.id !== id);
        }
        this.updateLogic();
    }

    /* ================= PORTS & WIRES ================= */
    setupPorts(node) {
        const outPorts = node.el.querySelectorAll('.node-ports-out .gh-port');
        outPorts.forEach(port => {
            port.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                this.isDrawingWire = true;
                this.wireStartNode = node;
                this.wireStartPort = port;
            });
        });

        const inPorts = node.el.querySelectorAll('.node-ports-in .gh-port');
        inPorts.forEach(port => {
            port.addEventListener('mouseup', (e) => {
                e.stopPropagation();
                if (this.isDrawingWire && this.wireStartNode && this.wireStartNode !== node) {
                    // Make connection
                    this.addConnection(this.wireStartNode, this.wireStartPort, node, port);
                }
            });
            // Try to connect backwards if clicking input port
            port.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                // If there's an existing connection to this IN port, maybe disconnect it
                const existingConIdx = this.connections.findIndex(c => c.toNode === node && c.toPort === port);
                if (existingConIdx !== -1) {
                    const c = this.connections[existingConIdx];
                    this.connections.splice(existingConIdx, 1);
                    // Start drawing wire from the old source
                    this.isDrawingWire = true;
                    this.wireStartNode = c.fromNode;
                    this.wireStartPort = c.fromPort;
                    this.updateWires();
                    this.updateLogic();
                }
            });
        });
    }

    getPortPosition(node, portEl) {
        // relative to node-canvas (which has scale 1 internally, unscaled DOM)
        const nodeRect = node.el.getBoundingClientRect();
        const portRect = portEl.getBoundingClientRect();
        const containerRect = this.transformEl.getBoundingClientRect();

        return {
            x: (portRect.left + portRect.width / 2 - containerRect.left) / this.scale,
            y: (portRect.top + portRect.height / 2 - containerRect.top) / this.scale
        };
    }

    addConnection(fromNode, fromPort, toNode, toPort) {
        // Remove any existing connection to THIS input port
        this.connections = this.connections.filter(c => !(c.toNode === toNode && c.toPort === toPort));

        this.connections.push({ fromNode, fromPort, toNode, toPort });
        fromPort.classList.add('connected');
        toPort.classList.add('connected');

        this.updateWires();
        this.updateLogic();
    }

    updateWires() {
        this.svgEl.innerHTML = '';
        this.connections.forEach(c => {
            const p1 = this.getPortPosition(c.fromNode, c.fromPort);
            const p2 = this.getPortPosition(c.toNode, c.toPort);
            const d = this.getBezierPath(p1.x, p1.y, p2.x, p2.y);

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", d);
            path.setAttribute("class", "gh-wire");

            // Delete wire on click
            path.addEventListener('click', (e) => {
                e.preventDefault();
                this.removeConnection(c);
            });

            this.svgEl.appendChild(path);
        });
    }

    removeConnection(con) {
        this.connections = this.connections.filter(c => c !== con);
        con.fromPort.classList.remove('connected');
        con.toPort.classList.remove('connected');
        this.updateWires();
        this.updateLogic();
    }

    drawTempWire(x1, y1, x2, y2) {
        if (!this.tempWire) {
            this.tempWire = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this.tempWire.setAttribute("class", "gh-wire active");
            this.tempWire.style.pointerEvents = "none";
            this.svgEl.appendChild(this.tempWire);
        }
        this.tempWire.setAttribute("d", this.getBezierPath(x1, y1, x2, y2));
    }

    getBezierPath(x1, y1, x2, y2) {
        const dx = Math.abs(x2 - x1) * 0.5;
        return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
    }

    /* ================= LOGIC & OUTPUT ================= */
    updateLogic() {
        evaluateConnections(this.nodes, this.connections);
    }
}
