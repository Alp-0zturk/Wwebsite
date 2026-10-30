// Static file server + real-time presence API for the Wanderer site.
// No dependencies: runs with `node server.js` (Node 18+).

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 8080;

// A viewer counts as "live" if their tab sent a heartbeat in the last 30s
// (heartbeats arrive every 10s, so this tolerates two missed beats).
const SESSION_TTL_MS = 30 * 1000;
const MAX_SESSIONS = 10000;

// sessionId -> { lastSeen, country: { code, name } | null }
const sessions = new Map();

function prune() {
    const cutoff = Date.now() - SESSION_TTL_MS;
    for (const [id, s] of sessions) {
        if (s.lastSeen < cutoff) sessions.delete(id);
    }
}

function presenceSnapshot() {
    prune();
    const countries = new Map();
    for (const s of sessions.values()) {
        if (s.country && s.country.code && !countries.has(s.country.code)) {
            countries.set(s.country.code, s.country);
        }
    }
    return {
        count: sessions.size,
        countries: Array.from(countries.values()).slice(0, 12),
    };
}

function handlePresence(req, res) {
    if (req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
        return res.end(JSON.stringify(presenceSnapshot()));
    }
    if (req.method !== 'POST') {
        res.writeHead(405);
        return res.end();
    }
    let body = '';
    req.on('data', chunk => {
        body += chunk;
        if (body.length > 2048) req.destroy();
    });
    req.on('end', () => {
        try {
            const data = JSON.parse(body || '{}');
            const id = typeof data.id === 'string' ? data.id.slice(0, 64) : null;
            if (id && (sessions.size < MAX_SESSIONS || sessions.has(id))) {
                let country = null;
                if (data.country && typeof data.country.code === 'string' && /^[A-Za-z]{2}$/.test(data.country.code)) {
                    country = {
                        code: data.country.code.toUpperCase(),
                        name: typeof data.country.name === 'string' ? data.country.name.slice(0, 60) : data.country.code.toUpperCase(),
                    };
                }
                sessions.set(id, { lastSeen: Date.now(), country });
            }
        } catch {
            // malformed heartbeat: ignore, still return the snapshot
        }
        res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
        res.end(JSON.stringify(presenceSnapshot()));
    });
}

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
};

function serveStatic(req, res) {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    let filePath = path.normalize(path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath));
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        return res.end();
    }
    fs.stat(filePath, (err, stat) => {
        if (err || stat.isDirectory()) {
            res.writeHead(404);
            return res.end('Not found');
        }
        const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
        // Range support so Safari can stream the background video
        const range = req.headers.range && /bytes=(\d+)-(\d*)/.exec(req.headers.range);
        if (range) {
            const start = parseInt(range[1], 10);
            const end = range[2] ? parseInt(range[2], 10) : stat.size - 1;
            if (start >= stat.size || end >= stat.size || start > end) {
                res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` });
                return res.end();
            }
            res.writeHead(206, {
                'Content-Type': type,
                'Content-Range': `bytes ${start}-${end}/${stat.size}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': end - start + 1,
            });
            fs.createReadStream(filePath, { start, end }).pipe(res);
        } else {
            res.writeHead(200, { 'Content-Type': type, 'Content-Length': stat.size, 'Accept-Ranges': 'bytes' });
            fs.createReadStream(filePath).pipe(res);
        }
    });
}

http.createServer((req, res) => {
    if (req.url.split('?')[0] === '/api/presence') return handlePresence(req, res);
    serveStatic(req, res);
}).listen(PORT, () => {
    console.log(`Wanderer site listening on port ${PORT}`);
});
