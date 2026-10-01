import defaults from './content-defaults.json' with { type: 'json' };

export { defaults };
const legacyHeroSources = new Set(['/assets/activation-640.webp', '/assets/activation-960.webp', '/assets/activation-1536.webp']);
export function resolveConfig(stored = {}) {
  const base = structuredClone(defaults.config);
  const config = { ...base, ...stored, texts: { ...base.texts, ...stored.texts }, images: { ...base.images, ...stored.images } };
  // Upgrade only the supplied stock image; preserve any image uploaded by the owner.
  if (legacyHeroSources.has(config.images.hero?.src)) config.images.hero = { ...config.images.hero, src: base.images.hero.src };
  return config;
}
export const fonts = {
  arial: 'Arial, Helvetica, sans-serif',
  trebuchet: '"Trebuchet MS", Arial, sans-serif',
  verdana: 'Verdana, Geneva, sans-serif',
  georgia: 'Georgia, "Times New Roman", serif',
  system: 'system-ui, -apple-system, "Segoe UI", sans-serif',
};
export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const plain = (value, max, label, required = false) => {
  if (value === undefined && !required) return '';
  if (typeof value !== 'string') throw new HttpError(400, `${label} invalide.`);
  const text = value.trim();
  if ((required && !text) || text.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text)) throw new HttpError(400, `${label} invalide ou trop long.`);
  return text;
};
export function validateContact(body) {
  if (!body || typeof body !== 'object' || !['demande', 'candidature'].includes(body.type)) throw new HttpError(400, 'Type de demande invalide.');
  if (body.consent !== true) throw new HttpError(400, 'Votre accord est nécessaire pour enregistrer ces informations.');
  if (!/^[a-f0-9-]{36}$/i.test(body.idempotencyKey || '')) throw new HttpError(400, 'Rechargez la page avant de réessayer.');
  const data = { type: body.type, name: plain(body.name, 100, 'Nom et prénom', true), email: plain(body.email, 160, 'E-mail', true).toLowerCase() };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) throw new HttpError(400, 'Adresse e-mail invalide.');
  if (body.type === 'candidature') {
    data.phone = plain(body.phone, 30, 'Téléphone', true);
    if (!/^[+()\d .-]{6,30}$/.test(data.phone) || (data.phone.match(/\d/g)||[]).length<6) throw new HttpError(400, 'Téléphone invalide.');
    data.city = plain(body.city, 100, 'Ville', true);
    data.profile = plain(body.profile, 100, 'Profil', true);
    // Accept a form left open before volume 3 without retaining the obsolete label.
    if (['Freelance', 'Animateur / animatrice indépendant·e'].includes(data.profile)) data.profile = 'Indépendant';
    if (!['Indépendant', 'Étudiant·e', 'Missions ponctuelles', 'Autre profil'].includes(data.profile)) throw new HttpError(400, 'Choisissez un profil dans la liste.');
    data.availability = plain(body.availability, 800, 'Disponibilités', true);
    data.mobility = plain(body.mobility, 200, 'Zones de déplacement');
    data.experience = plain(body.experience, 2000, 'Présentation');
  } else {
    data.company = plain(body.company, 120, 'Entreprise');
    data.location = plain(body.location, 120, 'Lieu');
    data.date = plain(body.date, 10, 'Date');
    if (data.date && (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || Number.isNaN(Date.parse(data.date)) || new Date(data.date).toISOString().slice(0, 10) !== data.date)) throw new HttpError(400, 'Date invalide.');
    data.project = plain(body.project, 3000, 'Projet', true);
  }
  data.consentVersion = '2026-10-01';
  return data;
}
const staticSources = new Set([...Object.values(defaults.config.images).map(i => i.src), ...defaults.config.clients.map(i => i.src), ...legacyHeroSources]);
export function validateConfig(input) {
  if (!input || typeof input !== 'object' || !input.texts || !input.theme || !input.images) throw new HttpError(400, 'Configuration incomplète.');
  const contactEmail=plain(input.contactEmail ?? defaults.config.contactEmail,160,'E-mail de contact',true);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail))throw new HttpError(400,'E-mail de contact invalide.');
  const config = { texts: {}, theme: {}, images: {}, clients: [], gallery: [], contactEmail };
  for (const field of defaults.fields) config.texts[field.key] = plain(input.texts[field.key] ?? defaults.config.texts[field.key], field.maxLength, field.label, true);
  for (const key of ['yellow', 'ink', 'pink', 'blue', 'muted', 'white']) {
    if (!/^#[a-f\d]{6}$/i.test(input.theme[key] || '')) throw new HttpError(400, 'Une couleur doit être au format #RRGGBB.');
    config.theme[key] = input.theme[key];
  }
  for (const key of ['bodyFont', 'headingFont']) {
    if (!Object.hasOwn(fonts, input.theme[key])) throw new HttpError(400, 'Typographie invalide.');
    config.theme[key] = input.theme[key];
  }
  const image = item => {
    if (!item || typeof item.src !== 'string' || !(staticSources.has(item.src) || /^\/media\/[a-f0-9-]{36}$/.test(item.src))) throw new HttpError(400, 'Choisissez une image de la médiathèque.');
    return { src: item.src, alt: plain(item.alt, 250, 'Description de l’image', true), width: Number.isInteger(item.width) && item.width > 0 && item.width <= 10000 ? item.width : 1200, height: Number.isInteger(item.height) && item.height > 0 && item.height <= 10000 ? item.height : 800 };
  };
  const images = resolveConfig(input).images;
  for (const key of Object.keys(defaults.config.images)) config.images[key] = image(images[key]);
  for (const [key, limit] of [['clients', 36], ['gallery', 30]]) {
    if (!Array.isArray(input[key]) || input[key].length > limit) throw new HttpError(400, `Nombre d’images trop élevé (${limit} maximum).`);
    config[key] = input[key].map(image);
  }
  return config;
}
export function themeCss(config) {
  const t = config.theme;
  return `:root{${['yellow', 'ink', 'pink', 'blue', 'muted', 'white'].map(k => `--${k}:${t[k]}`).join(';')};--font-body:${fonts[t.bodyFont]};--font-heading:${fonts[t.headingFont]}}`;
}
export const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export function csvCell(value) {
  let text = String(value ?? '');
  if (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
