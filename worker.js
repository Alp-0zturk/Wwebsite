// Cloudflare Worker: serves the static site (via Workers Static Assets)
// and the /api/presence endpoint backed by a Durable Object.
//
// Only /api/* reaches this Worker (run_worker_first in wrangler.toml);
// every other path is served directly from static assets, unmetered.

export class Presence {
    constructor(state, env) {
        // In-memory is enough: every live tab heartbeats each 10s, which keeps
        // the object alive and repopulates it within one beat after an eviction.
        this.sessions = new Map();
    }

    async fetch(request) {
        const SESSION_TTL_MS = 30 * 1000;
        const MAX_SESSIONS = 10000;

        if (request.method === 'POST') {
            try {
                const data = await request.json();
                const id = typeof data.id === 'string' ? data.id.slice(0, 64) : null;
                if (id && (this.sessions.size < MAX_SESSIONS || this.sessions.has(id))) {
                    // Prefer Cloudflare's own geo (forwarded by the Worker);
                    // fall back to what the client sent.
                    let code = null;
                    let name = null;
                    const cfCountry = request.headers.get('X-Visitor-Country');
                    if (cfCountry && /^[A-Za-z]{2}$/.test(cfCountry)) {
                        code = cfCountry.toUpperCase();
                    } else if (data.country && typeof data.country.code === 'string' && /^[A-Za-z]{2}$/.test(data.country.code)) {
                        code = data.country.code.toUpperCase();
                        if (typeof data.country.name === 'string') name = data.country.name.slice(0, 60);
                    }
                    let country = null;
                    if (code) {
                        if (!name) {
                            try {
                                name = new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code;
                            } catch {
                                name = code;
                            }
                        }
                        country = { code, name };
                    }
                    this.sessions.set(id, { lastSeen: Date.now(), country });
                }
            } catch {
                // malformed heartbeat: ignore, still return the snapshot
            }
        } else if (request.method !== 'GET') {
            return new Response(null, { status: 405 });
        }

        const cutoff = Date.now() - SESSION_TTL_MS;
        for (const [id, s] of this.sessions) {
            if (s.lastSeen < cutoff) this.sessions.delete(id);
        }
        const countries = new Map();
        for (const s of this.sessions.values()) {
            if (s.country && !countries.has(s.country.code)) countries.set(s.country.code, s.country);
        }
        return Response.json(
            { count: this.sessions.size, countries: Array.from(countries.values()).slice(0, 12) },
            { headers: { 'Cache-Control': 'no-store' } }
        );
    }
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        if (url.pathname === '/api/presence') {
            const stub = env.PRESENCE.get(env.PRESENCE.idFromName('global'));
            // Pass Cloudflare's country for this visitor along to the object.
            const forwarded = new Request(request);
            const cfCountry = request.cf && request.cf.country;
            if (cfCountry) forwarded.headers.set('X-Visitor-Country', cfCountry);
            return stub.fetch(forwarded);
        }
        return env.ASSETS.fetch(request);
    },
};
