import { defaults, HttpError, validateContact, validateConfig, themeCss, escapeHtml, csvCell } from './validation.mjs';

const DAY = 86400000;
const COOKIE = '__Host-fdp_session';
const UUID = /^[a-f0-9-]{36}$/;
const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra } });
const digest = async value => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))].map(x => x.toString(16).padStart(2, '0')).join('');
const token = () => [...crypto.getRandomValues(new Uint8Array(32))].map(x => x.toString(16).padStart(2, '0')).join('');
async function limitedBody(request, limit) {
  if (Number(request.headers.get('Content-Length')) > limit) throw new HttpError(413, 'Fichier ou formulaire trop volumineux.');
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks = []; let length = 0;
  while (true) {
    const next = await reader.read(); if (next.done) break;
    length += next.value.byteLength;
    if (length > limit) { await reader.cancel(); throw new HttpError(413, 'Fichier ou formulaire trop volumineux.'); }
    chunks.push(next.value);
  }
  const data = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { data.set(chunk, offset); offset += chunk.length; }
  return data;
}
async function readJson(request, limit = 20000) {
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) throw new HttpError(415, 'Format JSON attendu.');
  try { return JSON.parse(new TextDecoder().decode(await limitedBody(request, limit))); }
  catch (error) { if (error instanceof HttpError) throw error; throw new HttpError(400, 'Formulaire illisible.'); }
}
function security(response) {
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests");
  return new Response(response.body, { status: response.status, headers });
}
function imageHtml(item) { return `<img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt)}" width="${item.width}" height="${item.height}" loading="lazy" decoding="async">`; }
function rewritePage(response, config) {
  return new HTMLRewriter()
    .on('[data-contact-email]', { element(el) { el.setAttribute('href', 'mailto:' + config.contactEmail); } })
    .on('[data-email-text]', { element(el) { el.setInnerContent(config.contactEmail); } })
    .on('[data-copy]', { element(el) { const key = el.getAttribute('data-copy'); if (Object.hasOwn(config.texts, key)) el.setInnerContent(config.texts[key]); } })
    .on('[data-image]', { element(el) {
      const key = el.getAttribute('data-image'); const value = config.images[key]; if (!value) return;
      el.setAttribute('src', value.src); el.setAttribute('alt', key.startsWith('logo') ? '' : value.alt);
      el.setAttribute('width', String(value.width)); el.setAttribute('height', String(value.height));
      if (value.src !== defaults.config.images[key]?.src) { el.removeAttribute('srcset'); el.removeAttribute('sizes'); }
    } })
    .on('[data-clients]', { element(el) {
      el.setInnerContent(config.clients.map(item => `<span class="client${item.width / item.height > 1.7 ? ' client-croque' : ''}">${imageHtml(item)}</span>`).join(''), { html: true });
    } })
    .on('[data-gallery]', { element(el) {
      if (!config.gallery.length) return;
      el.removeAttribute('hidden');
      el.setInnerContent(`<h2>Sur le terrain.</h2><div class="gallery-grid">${config.gallery.map(item => `<figure>${imageHtml(item)}<figcaption>${escapeHtml(item.alt)}</figcaption></figure>`).join('')}</div>`, { html: true });
    } }).transform(response);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/media/')) {
        if (!['GET', 'HEAD'].includes(request.method)) {
          if (request.headers.get('Origin') !== url.origin || request.headers.get('Sec-Fetch-Site') === 'cross-site') throw new HttpError(403, 'Origine non autorisée.');
        }
        const store = env.SITE_STORE.get(env.SITE_STORE.idFromName('fille-de-pub'));
        return security(await store.fetch(request));
      }
      if (url.pathname === '/theme.css' || ['/', '/index.html', '/recrutement/', '/recrutement/index.html', '/confidentialite/', '/confidentialite/index.html'].includes(url.pathname)) {
        const store = env.SITE_STORE.get(env.SITE_STORE.idFromName('fille-de-pub'));
        let state={config:defaults.config};
        try {const response=await store.fetch(new Request('https://internal/api/content'));if(response.ok)state=await response.json();}catch(error){console.error('Public content fallback',error.name);}
        if (url.pathname === '/theme.css') return security(new Response(themeCss(state.config), { headers: { 'Content-Type': 'text/css; charset=utf-8', 'Cache-Control': 'no-cache' } }));
        const response = await env.ASSETS.fetch(request);
        const rewritten = rewritePage(response, state.config);
        const headers = new Headers(rewritten.headers); headers.set('Cache-Control', 'no-cache'); headers.delete('ETag');
        return security(new Response(rewritten.body, { status: rewritten.status, headers }));
      }
      if (url.pathname.startsWith('/admin')) {
        const response = await env.ASSETS.fetch(request); const headers = new Headers(response.headers);
        headers.set('X-Robots-Tag', 'noindex, nofollow'); headers.set('Cache-Control', 'no-store');
        return security(new Response(response.body, { status: response.status, headers }));
      }
      return env.ASSETS.fetch(request);
    } catch (error) {
      if (!(error instanceof HttpError)) console.error('FDP request failed', error.name);
      return security(json({ error: error instanceof HttpError ? error.message : 'Service temporairement indisponible. Merci de réessayer.' }, error.status || 503));
    }
  }
};

export class SiteStore {
  constructor(ctx, env) {
    this.ctx = ctx; this.env = env; this.sql = ctx.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS site_state (id INTEGER PRIMARY KEY, revision INTEGER NOT NULL, config TEXT NOT NULL, updated_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS contacts (id INTEGER PRIMARY KEY AUTOINCREMENT, request_key TEXT UNIQUE NOT NULL, kind TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'nouveau', data TEXT NOT NULL);
      CREATE INDEX IF NOT EXISTS contacts_expiry ON contacts(expires_at);
      CREATE INDEX IF NOT EXISTS contacts_kind ON contacts(kind,id);
      CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY, name TEXT NOT NULL, mime TEXT NOT NULL, size INTEGER NOT NULL, created_at INTEGER NOT NULL, bytes BLOB NOT NULL);
      CREATE TABLE IF NOT EXISTS sessions (hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL, credential TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS private_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);`);
    this.sql.exec('INSERT OR IGNORE INTO private_meta (key,value) VALUES (?,?)', 'rate_salt', token());
  }
  state() {
    const row = this.sql.exec('SELECT revision,config,updated_at FROM site_state WHERE id=1').toArray()[0];
    if (!row) return { revision: 0, updatedAt: null, config: structuredClone(defaults.config) };
    const stored = JSON.parse(row.config);
    // New copy keys added by a later deployment receive their checked-in defaults.
    return { revision: row.revision, updatedAt: row.updated_at, config: { ...defaults.config, ...stored, texts: { ...defaults.config.texts, ...stored.texts } } };
  }
  clean() {
    const now = Date.now();
    this.sql.exec('DELETE FROM contacts WHERE expires_at <= ?', now);
    this.sql.exec('DELETE FROM sessions WHERE expires_at <= ?', now);
    this.sql.exec('DELETE FROM rate_limits WHERE expires_at <= ?', now);
  }
  async schedule() { if (!(await this.ctx.storage.getAlarm())) await this.ctx.storage.setAlarm(Date.now() + DAY); }
  async alarm() { this.clean(); await this.ctx.storage.setAlarm(Date.now() + DAY); }
  rate(key, limit, duration) {
    const now = Date.now();
    const row = this.sql.exec('SELECT count,expires_at FROM rate_limits WHERE key=?', key).toArray()[0];
    if (row && row.expires_at > now && row.count >= limit) throw new HttpError(429, 'Trop de tentatives. Réessayez un peu plus tard.');
    if (!row || row.expires_at <= now) this.sql.exec('INSERT INTO rate_limits VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET count=excluded.count,expires_at=excluded.expires_at', key, 1, now + duration);
    else this.sql.exec('UPDATE rate_limits SET count=count+1 WHERE key=?', key);
  }
  async ipKey(request) {
    const salt = this.sql.exec('SELECT value FROM private_meta WHERE key=?', 'rate_salt').one().value;
    return digest(salt + ':' + new Date().toISOString().slice(0, 10) + ':' + (request.headers.get('CF-Connecting-IP') || 'unknown'));
  }
  configured() { return typeof this.env.ADMIN_PASSWORD === 'string' && this.env.ADMIN_PASSWORD.length >= 16; }
  async requireAdmin(request) {
    if (!this.configured()) throw new HttpError(503, 'Administration à activer : définissez le secret ADMIN_PASSWORD dans Cloudflare (16 caractères minimum).');
    const cookie = request.headers.get('Cookie') || '';
    const raw = cookie.split(';').map(s => s.trim()).find(s => s.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1);
    if (!raw || !/^[a-f0-9]{64}$/.test(raw)) throw new HttpError(401, 'Connectez-vous pour continuer.');
    const hash = await digest(raw);
    const row = this.sql.exec('SELECT expires_at,credential FROM sessions WHERE hash=?', hash).toArray()[0];
    if (!row || row.expires_at <= Date.now() || row.credential !== await digest(this.env.ADMIN_PASSWORD)) throw new HttpError(401, 'Votre session a expiré. Reconnectez-vous.');
    return hash;
  }
  async fetch(request) {
    const url = new URL(request.url); const path = url.pathname; const method = request.method;
    try {
      if (path === '/api/content' && method === 'GET') return json(this.state());
      if (path === '/api/health' && method === 'GET') return json({ ok: true, storage: 'ready', adminConfigured: this.configured() });
      if (path.startsWith('/media/') && ['GET', 'HEAD'].includes(method)) {
        const id = path.slice(7); if (!UUID.test(id)) throw new HttpError(404, 'Image introuvable.');
        const row = this.sql.exec('SELECT bytes,mime FROM media WHERE id=?', id).toArray()[0];
        if (!row) throw new HttpError(404, 'Image introuvable.');
        return new Response(method === 'HEAD' ? null : row.bytes, { headers: { 'Content-Type': row.mime, 'Cache-Control': 'public, max-age=86400', 'X-Content-Type-Options': 'nosniff' } });
      }
      if (path === '/api/contacts' && method === 'POST') {
        const body = await readJson(request); if (body.website) return json({ ok: true }, 201);
        const data = validateContact(body);
        const existing = this.sql.exec('SELECT id FROM contacts WHERE request_key=?', body.idempotencyKey).toArray()[0];
        if (existing) return json({ ok: true }, 200);
        this.clean();
        const ip = await this.ipKey(request);
        this.rate('contact:' + ip, 5, 15 * 60000); this.rate('contact-day:' + ip, 20, DAY); this.rate('contact-global', 300, DAY);
        if (this.sql.exec('SELECT count(*) AS n FROM contacts').one().n >= 10000) throw new HttpError(503, 'Le formulaire est temporairement indisponible. Écrivez à allo@filledepub.com.');
        const expires = new Date(); expires.setUTCFullYear(expires.getUTCFullYear() + 1);
        this.sql.exec('INSERT OR IGNORE INTO contacts(request_key,kind,created_at,expires_at,data) VALUES(?,?,?,?,?)', body.idempotencyKey, data.type, Date.now(), expires.getTime(), JSON.stringify(data));
        await this.schedule(); return json({ ok: true }, 201);
      }
      if (path === '/api/admin/login' && method === 'POST') {
        if (!this.configured()) throw new HttpError(503, 'Administration à activer : définissez le secret ADMIN_PASSWORD dans Cloudflare (16 caractères minimum).');
        this.clean(); await this.schedule();
        this.rate('login:' + await this.ipKey(request), 8, 15 * 60000); this.rate('login-global', 300, 3600000);
        const body = await readJson(request, 4096);
        const a = await digest(typeof body.password === 'string' ? body.password : ''); const b = await digest(this.env.ADMIN_PASSWORD);
        let difference = 0; for (let i = 0; i < a.length; i++) difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
        if (difference) throw new HttpError(401, 'Mot de passe incorrect.');
        const session = token();
        this.sql.exec('INSERT INTO sessions VALUES(?,?,?)', await digest(session), Date.now() + 3600000, b);
        return json({ ok: true }, 200, { 'Set-Cookie': `${COOKIE}=${session}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=3600` });
      }
      if (!path.startsWith('/api/admin/')) throw new HttpError(404, 'Page introuvable.');
      const sessionHash = await this.requireAdmin(request);
      this.clean();
      if (path === '/api/admin/logout' && method === 'POST') {
        this.sql.exec('DELETE FROM sessions WHERE hash=?', sessionHash);
        return json({ ok: true }, 200, { 'Set-Cookie': `${COOKIE}=; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=0` });
      }
      if (path === '/api/admin/state' && method === 'GET') return json({ ...this.state(), fields: defaults.fields, totals: this.sql.exec('SELECT kind,count(*) AS count FROM contacts GROUP BY kind').toArray(), media: this.sql.exec('SELECT id,name,mime,size,created_at FROM media ORDER BY created_at DESC').toArray() });
      if (path === '/api/admin/site' && method === 'PUT') {
        const body = await readJson(request, 250000); const config = validateConfig(body.config);
        if (body.revision !== this.state().revision) throw new HttpError(409, 'Le site a été modifié dans une autre fenêtre. Rechargez avant de publier.');
        for (const item of [...Object.values(config.images), ...config.clients, ...config.gallery]) {
          if (item.src.startsWith('/media/') && !this.sql.exec('SELECT id FROM media WHERE id=?', item.src.slice(7)).toArray().length) throw new HttpError(400, 'Une image sélectionnée n’existe plus.');
        }
        const revision = body.revision + 1;
        this.sql.exec('INSERT INTO site_state VALUES(1,?,?,?) ON CONFLICT(id) DO UPDATE SET revision=excluded.revision,config=excluded.config,updated_at=excluded.updated_at', revision, JSON.stringify(config), Date.now());
        return json({ ok: true, revision });
      }
      if (path === '/api/admin/media' && method === 'POST') {
        const bytes = await limitedBody(request, 1024 * 1024);
        let mime;
        if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) mime = 'image/jpeg';
        else if ([137,80,78,71,13,10,26,10].every((x, i) => bytes[i] === x)) mime = 'image/png';
        else if (new TextDecoder().decode(bytes.slice(0,4)) === 'RIFF' && new TextDecoder().decode(bytes.slice(8,12)) === 'WEBP') mime = 'image/webp';
        if (!mime || bytes.length < 32) throw new HttpError(415, 'Utilisez une image JPEG, PNG ou WebP.');
        const total = this.sql.exec('SELECT coalesce(sum(size),0) AS n FROM media').one().n;
        if (total + bytes.length > 100 * 1024 * 1024) throw new HttpError(413, 'La médiathèque a atteint sa limite de 100 Mo.');
        const id = crypto.randomUUID();
        const name = String(url.searchParams.get('name') || 'Image').slice(0, 150);
        this.sql.exec('INSERT INTO media VALUES(?,?,?,?,?,?)', id, name, mime, bytes.length, Date.now(), bytes.buffer);
        return json({ id, src: '/media/' + id, name, mime, size: bytes.length }, 201);
      }
      if (path === '/api/admin/contacts' && method === 'GET') {
        const kind = ['demande', 'candidature'].includes(url.searchParams.get('type')) ? url.searchParams.get('type') : '';
        const cursor = Number(url.searchParams.get('before')) || 2147483647;
        const rows = this.sql.exec('SELECT id,kind,created_at,status,data FROM contacts WHERE id<? AND (?=\'\' OR kind=?) ORDER BY id DESC LIMIT 51', cursor, kind, kind).toArray();
        return json({ contacts: rows.slice(0,50).map(r => ({ ...r, data: JSON.parse(r.data) })), next: rows.length > 50 ? rows[49].id : null });
      }
      if (path === '/api/admin/contacts/export' && method === 'GET') {
        const kind = ['demande', 'candidature'].includes(url.searchParams.get('type')) ? url.searchParams.get('type') : '';
        const rows = this.sql.exec('SELECT id,kind,created_at,status,data FROM contacts WHERE (?=\'\' OR kind=?) ORDER BY id DESC', kind, kind).toArray();
        const fields = ['name','email','phone','company','city','profile','availability','mobility','experience','location','date','project','consentVersion'];
        const header = ['Référence','Type','Date de réception','Statut','Nom et prénom','E-mail','Téléphone','Entreprise','Ville','Profil','Disponibilités','Zones de déplacement','Présentation','Lieu de l’animation','Date envisagée','Projet','Version du consentement'];
        const csv = '\uFEFF' + [header, ...rows.map(r => { const d = JSON.parse(r.data); return [r.id,r.kind,new Date(r.created_at).toISOString(),r.status,...fields.map(k => d[k] || '')]; })].map(row => row.map(csvCell).join(';')).join('\r\n');
        return new Response(csv, { headers: { 'Content-Type':'text/csv; charset=utf-8', 'Content-Disposition':'attachment; filename="fille-de-pub-contacts.csv"', 'Cache-Control':'no-store' } });
      }
      const contactMatch = path.match(/^\/api\/admin\/contacts\/(\d+)$/);
      if (contactMatch && method === 'PATCH') {
        const body = await readJson(request, 1000);
        if (!['nouveau','contacté','archivé'].includes(body.status)) throw new HttpError(400, 'Statut invalide.');
        this.sql.exec('UPDATE contacts SET status=? WHERE id=?', body.status, Number(contactMatch[1]));
        return json({ ok:true });
      }
      if (contactMatch && method === 'DELETE') {
        this.sql.exec('DELETE FROM contacts WHERE id=?', Number(contactMatch[1])); return json({ ok:true });
      }
      throw new HttpError(404, 'Page introuvable.');
    } catch (error) {
      if (!(error instanceof HttpError)) console.error('FDP storage failed', error.name);
      return json({ error: error instanceof HttpError ? error.message : 'Service temporairement indisponible.' }, error.status || 503);
    }
  }
}
