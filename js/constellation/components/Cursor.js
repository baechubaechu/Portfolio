/**
 * Custom cursor: a small crosshair that follows the pointer while it is
 * over the constellation stage. Only created for fine pointers (mouse /
 * trackpad); touch devices never see it.
 *
 * States (CSS classes on the element):
 *   is-visible   pointer is inside the hero
 *   is-node      hovering a node       → ring appears
 *   is-action    hovering a link / the selected project → ring + text
 *   is-down      pointer pressed
 */

export function createCursor(scope) {
    const el = document.createElement("div");
    el.className = "c-cursor";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = `<span class="c-cursor__ring"></span><span class="c-cursor__dot"></span><span class="c-cursor__label"></span>`;
    document.body.append(el);

    const labelEl = el.querySelector(".c-cursor__label");

    let x = -100, y = -100, raf = 0, visible = false;

    const paint = () => {
        raf = 0;
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const onMove = (e) => {
        x = e.clientX; y = e.clientY;
        const inside = scope.contains(e.target) || scope === e.target;
        if (inside !== visible) {
            visible = inside;
            el.classList.toggle("is-visible", visible);
        }
        if (visible) {
            // native links / buttons inside the hero also get the action state
            const actionable = e.target.closest?.("a, button, [data-open]");
            if (actionable && !e.target.closest(".c-node")) setState("action", actionable.dataset.cursorLabel ?? "");
            else if (!e.target.closest(".c-node")) setState("default");
        }
        if (!raf) raf = requestAnimationFrame(paint);
    };

    const onDown = () => el.classList.add("is-down");
    const onUp = () => el.classList.remove("is-down");
    const onLeave = () => { visible = false; el.classList.remove("is-visible"); };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);

    function setState(state, label = "") {
        el.classList.toggle("is-node", state === "node");
        el.classList.toggle("is-action", state === "action");
        labelEl.textContent = label;
        el.classList.toggle("has-label", !!label);
    }

    return {
        el,
        setState,
        destroy() {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerdown", onDown);
            window.removeEventListener("pointerup", onUp);
            document.removeEventListener("pointerleave", onLeave);
            window.removeEventListener("blur", onLeave);
            el.remove();
        },
    };
}
