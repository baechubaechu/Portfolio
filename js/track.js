/**
 * Anonymous visit tracking → /api/track → Supabase `visit_events`.
 *
 * Records which page was viewed (and from where), how long it stayed visible,
 * links that leave the site, the device, and whether this browser has been
 * here before. No mouse movement, no scroll, no IP. Region is added on the
 * server from the hosting edge.
 *
 * Off on localhost and for automated browsers. Visiting any page with
 * ?notrack=1 switches it off in that browser (use ?notrack=0 to undo), so
 * your own visits stay out of the numbers.
 */
(function () {
    "use strict";

    var ENDPOINT = "/api/track";
    var STORE = "pf-trk";
    var OPT_OUT = "pf-notrack";
    var SESSION_GAP = 30 * 60 * 1000; // a new visit after 30 min without activity

    var host = location.hostname;
    if (host === "localhost" || host === "127.0.0.1" || host === "[::1]" || /\.localhost$/.test(host)) return;
    if (navigator.webdriver) return;

    var params = new URLSearchParams(location.search);
    try {
        if (params.get("notrack") === "1") localStorage.setItem(OPT_OUT, "1");
        if (params.get("notrack") === "0") localStorage.removeItem(OPT_OUT);
        if (localStorage.getItem(OPT_OUT) === "1") return;
    } catch (e) { /* storage blocked: track without memory */ }

    function uuid() {
        if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0;
            return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
        });
    }

    function load() {
        try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; }
    }
    function save(s) {
        try { localStorage.setItem(STORE, JSON.stringify(s)); } catch (e) { /* ignore */ }
    }

    /* ── visitor & visit ── */
    var now = Date.now();
    var s = load();
    var firstEver = !s.visitor_id;
    if (firstEver) s.visitor_id = uuid();

    var daysSinceLast = null;
    if (!s.session_id || !s.session_last || now - s.session_last > SESSION_GAP) {
        if (s.session_last) daysSinceLast = Math.floor((now - s.session_last) / 86400000);
        s.visits = (s.visits || 0) + 1;
        s.session_id = uuid();
        s.page_index = 0;
        s.last_path = null;
    }
    var prevPath = s.last_path || null;
    var path = location.pathname.replace(/\/index\.html$/, "/");
    s.page_index = (s.page_index || 0) + 1;
    s.last_path = path + (location.search.replace(/[?&]notrack=[01]/, "") || "");
    s.session_last = now;
    save(s);

    /* ── page ── */
    var projectId = null;
    if (/project-detail\.html$/.test(location.pathname)) projectId = params.get("id");
    else {
        var m = location.pathname.match(/\/projects\/([^/]+)\.html$/);
        if (m) projectId = m[1];
    }

    var refHost = null;
    var referrer = document.referrer || null;
    if (referrer) {
        try { refHost = new URL(referrer).hostname; } catch (e) { /* ignore */ }
        if (refHost === host) { referrer = null; refHost = null; } // internal hops live in prev_path
    }

    var mqDark = window.matchMedia && matchMedia("(prefers-color-scheme: dark)");
    var mqMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)");
    var tz = null;
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { /* ignore */ }

    var base = {
        visitor_id: s.visitor_id,
        session_id: s.session_id,
        visit_number: s.visits,
        path: path,
        project_id: projectId,
        page_index: s.page_index,
    };

    function send(extra) {
        var payload = JSON.stringify(Object.assign({}, base, extra));
        // text/plain keeps sendBeacon free of CORS preflight; the server parses it.
        var blob = new Blob([payload], { type: "text/plain;charset=UTF-8" });
        if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, blob)) return;
        try { fetch(ENDPOINT, { method: "POST", body: payload, keepalive: true, headers: { "Content-Type": "text/plain" } }); } catch (e) { /* ignore */ }
    }

    send({
        event: "pageview",
        page_title: document.title,
        prev_path: prevPath,
        days_since_last_visit: daysSinceLast,
        referrer: referrer,
        referrer_host: refHost,
        utm_source: params.get("utm_source"),
        utm_medium: params.get("utm_medium"),
        utm_campaign: params.get("utm_campaign"),
        utm_content: params.get("utm_content"),
        utm_term: params.get("utm_term"),
        screen_w: screen.width,
        screen_h: screen.height,
        viewport_w: innerWidth,
        viewport_h: innerHeight,
        pixel_ratio: window.devicePixelRatio || 1,
        touch: navigator.maxTouchPoints > 0,
        language: navigator.language || null,
        timezone: tz,
        color_scheme: mqDark ? (mqDark.matches ? "dark" : "light") : null,
        reduced_motion: mqMotion ? mqMotion.matches : null,
    });

    /* ── dwell: only time the page is actually visible ── */
    var visibleSince = document.visibilityState === "visible" ? performance.now() : null;
    var pending = 0;

    function flush() {
        if (visibleSince != null) {
            pending += performance.now() - visibleSince;
            visibleSince = null;
        }
        if (pending >= 1000) {
            send({ event: "engagement", duration_ms: Math.round(pending) });
            var st = load();
            if (st.session_id === s.session_id) { st.session_last = Date.now(); save(st); }
        }
        pending = 0;
    }

    document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "hidden") flush();
        else visibleSince = performance.now();
    });
    addEventListener("pagehide", flush);

    /* ── links that leave the site ── */
    document.addEventListener("click", function (e) {
        var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
        if (!a) return;
        var url;
        try { url = new URL(a.href, location.href); } catch (err) { return; }
        var leaves = url.protocol === "mailto:" || url.protocol === "tel:" || url.hostname !== host;
        var file = /\.(pdf|zip|docx?|pptx?)$/i.test(url.pathname);
        if (!leaves && !file) return;
        send({ event: "outbound", target: url.protocol === "mailto:" ? "mailto:" + url.pathname : url.href });
    }, true);
})();
