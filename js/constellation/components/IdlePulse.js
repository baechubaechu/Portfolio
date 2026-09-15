/** Quiet, sequential project constellation hints; never changes selection/layout. */
export function createIdlePulse({ root, graph, nodeViews, edgeViews, asterisms, kick }) {
    const travelMs = 900;
    const staggerMs = 90;
    const arrivalMs = 650;
    const glowMs = 600;
    const restMs = 3000;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const projects = graph.projects.filter(p => graph.neighborsOf(p.id).length);
    let timer = 0, index = 0, ready = false, busy = false, visible = false, destroyed = false;
    const active = new Set();

    function clear() {
        clearTimeout(timer);
        for (const el of active) {
            el.classList.remove('is-idle-pulse');
            el.style.removeProperty('--c-pulse-delay');
        }
        active.clear();
    }

    function allowed() {
        return ready && !busy && visible && !document.hidden && !motion.matches && !destroyed && projects.length;
    }

    function mark(el, delay) {
        el.style.setProperty('--c-pulse-delay', `${delay}ms`);
        el.classList.add('is-idle-pulse');
        active.add(el);
    }

    function run() {
        if (!allowed()) return;
        const project = projects[index];
        index = (index + 1) % projects.length;
        const fig = asterisms?.get(project.id);
        const path = fig?.edges?.length
            ? fig.edges.map((edge) => ({
                edge,
                node: graph.byId.get(edge.target === project.id ? edge.source : edge.target),
            }))
            : graph.neighborsOf(project.id);
        mark(nodeViews.get(project.id).el, 0);
        path.forEach(({ node, edge }, i) => {
            const view = edgeViews.get(edge.id);
            if (!view) return;
            view.setOrigin(edge.source);
            mark(view.el, i * staggerMs);
            if (node) mark(nodeViews.get(node.id).el, i * staggerMs + arrivalMs);
        });
        kick();
        const duration = Math.max(0, path.length - 1) * staggerMs + Math.max(travelMs, arrivalMs + glowMs);
        timer = setTimeout(() => {
            clear();
            if (allowed()) timer = setTimeout(run, restMs);
        }, duration);
    }

    function reschedule() {
        clear();
        if (allowed()) timer = setTimeout(run, restMs);
    }

    root.style.setProperty('--c-pulse-travel', `${travelMs}ms`);
    root.style.setProperty('--c-pulse-glow', `${glowMs}ms`);
    const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        reschedule();
    });
    observer.observe(root);
    document.addEventListener('visibilitychange', reschedule);
    motion.addEventListener('change', reschedule);

    return {
        start() { ready = true; reschedule(); },
        setBusy(value) {
            if (busy === value) return;
            busy = value;
            reschedule();
        },
        destroy() {
            destroyed = true;
            clear();
            observer.disconnect();
            document.removeEventListener('visibilitychange', reschedule);
            motion.removeEventListener('change', reschedule);
        },
    };
}
