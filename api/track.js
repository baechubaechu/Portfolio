/**
 * Visit tracking endpoint (Vercel Function): POST /api/track
 *
 * The browser (js/track.js) sends one small JSON event. This function adds
 * the visitor's region from Vercel's edge headers, parses the user agent into
 * device / OS / browser, and inserts one row into Supabase `visit_events`.
 *
 * The IP address is never read or stored. The Supabase publishable key is
 * public by design; the table only accepts inserts from it (RLS), so nobody
 * can read the data back with it.
 */

const SUPABASE_URL = "https://qeaezxbkcwghlwcwqkfv.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_66zyp50GeZcuG041jeHoQg_U_S-hAli";

const EVENTS = new Set(["pageview", "engagement", "outbound"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|pingdom|monitor|curl|wget|python|axios/i;

const str = (v, max = 200) => (typeof v === "string" && v.length ? v.slice(0, max) : null);
const int = (v, min = 0, max = 1e9) => (Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : null);
const bool = (v) => (typeof v === "boolean" ? v : null);

function header(req, name) {
    const v = req.headers[name];
    if (!v) return null;
    const s = Array.isArray(v) ? v[0] : v;
    try { return decodeURIComponent(s); } catch { return s; }
}

function parseAgent(ua = "") {
    const os =
        /Windows/i.test(ua) ? "Windows" :
        /iPhone|iPad|iPod/i.test(ua) ? "iOS" :
        /Mac OS X|Macintosh/i.test(ua) ? "macOS" :
        /Android/i.test(ua) ? "Android" :
        /CrOS/i.test(ua) ? "ChromeOS" :
        /Linux/i.test(ua) ? "Linux" : "Other";
    const browser =
        /Edg\//i.test(ua) ? "Edge" :
        /OPR\/|Opera/i.test(ua) ? "Opera" :
        /SamsungBrowser/i.test(ua) ? "Samsung Internet" :
        /KAKAOTALK/i.test(ua) ? "KakaoTalk" :
        /NAVER/i.test(ua) ? "Naver" :
        /Whale/i.test(ua) ? "Whale" :
        /Firefox|FxiOS/i.test(ua) ? "Firefox" :
        /Chrome|CriOS/i.test(ua) ? "Chrome" :
        /Safari/i.test(ua) ? "Safari" : "Other";
    const device =
        /iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)) ? "tablet" :
        /Mobi|iPhone|iPod|Android/i.test(ua) ? "mobile" : "desktop";
    return { os, browser, device };
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).end();
    }

    // sendBeacon posts text/plain, so the body may arrive unparsed.
    let body = req.body;
    if (typeof body === "string") {
        if (body.length > 8000) return res.status(413).end();
        try { body = JSON.parse(body); } catch { return res.status(400).end(); }
    }
    if (!body || typeof body !== "object") return res.status(400).end();

    const ua = req.headers["user-agent"] || "";
    if (BOT.test(ua)) return res.status(204).end();
    if (!EVENTS.has(body.event) || !UUID.test(body.visitor_id || "") || !UUID.test(body.session_id || "")) {
        return res.status(400).end();
    }

    const agent = parseAgent(ua);
    const row = {
        visitor_id: body.visitor_id,
        session_id: body.session_id,
        visit_number: int(body.visit_number, 1, 1e6),
        days_since_last_visit: int(body.days_since_last_visit, 0, 1e5),

        event: body.event,
        path: str(body.path, 300),
        project_id: str(body.project_id, 120),
        page_title: str(body.page_title, 200),
        prev_path: str(body.prev_path, 300),
        page_index: int(body.page_index, 1, 1e4),
        duration_ms: body.event === "engagement" ? int(body.duration_ms, 0, 6 * 3600 * 1000) : null,
        target: body.event === "outbound" ? str(body.target, 300) : null,

        referrer: str(body.referrer, 500),
        referrer_host: str(body.referrer_host, 200),
        utm_source: str(body.utm_source, 120),
        utm_medium: str(body.utm_medium, 120),
        utm_campaign: str(body.utm_campaign, 120),
        utm_content: str(body.utm_content, 120),
        utm_term: str(body.utm_term, 120),

        device_type: agent.device,
        os: agent.os,
        browser: agent.browser,
        screen_w: int(body.screen_w, 0, 20000),
        screen_h: int(body.screen_h, 0, 20000),
        viewport_w: int(body.viewport_w, 0, 20000),
        viewport_h: int(body.viewport_h, 0, 20000),
        pixel_ratio: Number.isFinite(body.pixel_ratio) ? Math.min(10, Math.max(0, body.pixel_ratio)) : null,
        touch: bool(body.touch),
        language: str(body.language, 40),
        timezone: str(body.timezone, 60),
        color_scheme: body.color_scheme === "dark" || body.color_scheme === "light" ? body.color_scheme : null,
        reduced_motion: bool(body.reduced_motion),

        country: header(req, "x-vercel-ip-country"),
        region: header(req, "x-vercel-ip-country-region"),
        city: header(req, "x-vercel-ip-city"),
    };

    try {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/visit_events`, {
            method: "POST",
            headers: {
                apikey: SUPABASE_KEY,
                "Content-Type": "application/json",
                Prefer: "return=minimal",
            },
            body: JSON.stringify(row),
        });
        if (!r.ok) {
            console.error("[track] supabase", r.status, await r.text());
            return res.status(502).end();
        }
    } catch (e) {
        console.error("[track] supabase unreachable", e);
        return res.status(502).end();
    }
    return res.status(204).end();
}
