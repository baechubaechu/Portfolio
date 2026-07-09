/**
 * node-canvas.js
 * Grasshopper-inspired SVG bezier wire system for the GH theme.
 * Draws animated bezier wires connecting the hero node to section groups.
 */
(function () {
    'use strict';

    // Only run on pages with gh-theme
    if (!document.body.classList.contains('gh-theme')) return;

    var svgEl = null;
    var mainEl = null;

    /* ── Init ─────────────────────────────────────────────── */
    function init() {
        mainEl = document.querySelector('main');
        if (!mainEl) return;

        // Ensure main is a positioning context for the SVG
        mainEl.style.position = 'relative';

        // Create SVG overlay
        svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgEl.id = 'gh-wire-svg';
        svgEl.style.cssText = [
            'position:absolute',
            'top:0',
            'left:0',
            'width:100%',
            'pointer-events:none',
            'z-index:0',
            'overflow:visible'
        ].join(';');

        mainEl.insertBefore(svgEl, mainEl.firstChild);

        // Inject CSS keyframes once
        injectKeyframes();

        // Wait for dynamic project cards to render before drawing
        setTimeout(drawAllWires, 700);

        // Redraw on resize
        var resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(drawAllWires, 250);
        });
    }

    /* ── Position helper ───────────────────────────────────── */
    // Returns coordinates relative to main's top-left corner
    function pos(el) {
        if (!el) return null;
        var er = el.getBoundingClientRect();
        var mr = mainEl.getBoundingClientRect();
        return {
            top:    er.top  - mr.top  + window.scrollY,
            bottom: er.bottom - mr.top + window.scrollY,
            left:   er.left - mr.left,
            right:  er.right - mr.left,
            cx:     er.left - mr.left + er.width  / 2,
            cy:     er.top  - mr.top  + window.scrollY + er.height / 2,
            w:      er.width,
            h:      er.height
        };
    }

    /* ── Bezier path ───────────────────────────────────────── */
    function bezierPath(x1, y1, x2, y2) {
        var tension = Math.max(Math.abs(x2 - x1) * 0.42, 60);
        return (
            'M' + x1 + ',' + y1 +
            ' C' + (x1 + tension) + ',' + y1 +
            ' '  + (x2 - tension) + ',' + y2 +
            ' '  + x2 + ',' + y2
        );
    }

    /* ── Wire element ──────────────────────────────────────── */
    function makeWire(d, color, delay, opacity, width) {
        opacity = opacity !== undefined ? opacity : 0.62;
        width   = width   !== undefined ? width   : 1.5;

        var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        // Soft glow behind wire
        var glow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        glow.setAttribute('d', d);
        glow.setAttribute('stroke', color);
        glow.setAttribute('stroke-width', String(width + 4));
        glow.setAttribute('fill', 'none');
        glow.setAttribute('opacity', '0.07');

        // Main wire
        var wire = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        wire.setAttribute('d', d);
        wire.setAttribute('stroke', color);
        wire.setAttribute('stroke-width', String(width));
        wire.setAttribute('fill', 'none');
        wire.setAttribute('opacity', String(opacity));
        wire.setAttribute('stroke-linecap', 'round');

        // Draw-in animation
        var dashLen = 4000;
        wire.style.strokeDasharray  = dashLen;
        wire.style.strokeDashoffset = dashLen;
        wire.style.animation = 'gh-wire-draw 1.4s cubic-bezier(0.4,0,0.2,1) ' + delay + 's forwards';

        g.appendChild(glow);
        g.appendChild(wire);
        return g;
    }

    /* ── Port dot at wire endpoint ─────────────────────────── */
    function makeDot(x, y, color, delay) {
        var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', x);
        c.setAttribute('cy', y);
        c.setAttribute('r', '3.5');
        c.setAttribute('fill', 'none');
        c.setAttribute('stroke', color);
        c.setAttribute('stroke-width', '1.5');
        c.setAttribute('opacity', '0');
        c.style.animation = 'gh-dot-appear 0.3s ease ' + (delay + 1.3) + 's forwards';
        return c;
    }

    /* ── Main draw function ────────────────────────────────── */
    function drawAllWires() {
        if (!svgEl || !mainEl) return;
        svgEl.innerHTML = '';

        // Update SVG height to match scrollable content
        var totalH = mainEl.scrollHeight;
        svgEl.setAttribute('height', totalH);

        var hero    = document.querySelector('.gh-hero-node');
        var groups  = [
            { sel: '.gh-group--school', color: 'rgba(255,140,0,0.65)',   delay: 0.1  },
            { sel: '.gh-group--comp',   color: 'rgba(167,130,200,0.65)', delay: 0.35 },
            { sel: '.gh-group--code',   color: 'rgba(80,185,170,0.65)',  delay: 0.60 }
        ];
        var contactCard = document.querySelector('.contact-section .contact-card');

        if (!hero) return;
        var hp = pos(hero);
        if (!hp) return;

        // Output Y positions staggered around the hero center
        var offsets = [-35, 0, 35];

        groups.forEach(function (grp, i) {
            var el = document.querySelector(grp.sel);
            if (!el) return;
            var gp = pos(el);
            if (!gp) return;

            var x1 = hp.right;
            var y1 = hp.cy + offsets[i];
            var x2 = gp.left;
            var y2 = gp.top + 40;

            var d = bezierPath(x1, y1, x2, y2);
            svgEl.appendChild(makeWire(d, grp.color, grp.delay));
            svgEl.appendChild(makeDot(x1, y1, grp.color, grp.delay));
            svgEl.appendChild(makeDot(x2, y2, grp.color, grp.delay));
        });

        // Wire from code group to contact terminal node
        var codeGrp = document.querySelector('.gh-group--code');
        if (codeGrp && contactCard) {
            var cgp = pos(codeGrp);
            var ccp = pos(contactCard);
            if (cgp && ccp) {
                var dcc = bezierPath(cgp.right, cgp.cy, ccp.left, ccp.cy);
                svgEl.appendChild(makeWire(dcc, 'rgba(111,168,200,0.45)', 1.0, 0.45, 1));
                svgEl.appendChild(makeDot(cgp.right, cgp.cy, 'rgba(111,168,200,0.7)', 1.0));
                svgEl.appendChild(makeDot(ccp.left,  ccp.cy, 'rgba(111,168,200,0.7)', 1.0));
            }
        }
    }

    /* ── CSS keyframes injected once ──────────────────────── */
    function injectKeyframes() {
        if (document.getElementById('gh-wire-keyframes')) return;
        var s = document.createElement('style');
        s.id = 'gh-wire-keyframes';
        s.textContent =
            '@keyframes gh-wire-draw{to{stroke-dashoffset:0}}' +
            '@keyframes gh-dot-appear{to{opacity:0.9}}';
        document.head.appendChild(s);
    }

    /* ── Boot ─────────────────────────────────────────────── */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
