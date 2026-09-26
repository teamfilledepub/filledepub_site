import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';

const source = new URL('../site/', import.meta.url);
const output = new URL('../dist/', import.meta.url);
const config = JSON.parse(await readFile(new URL('../site.config.json', import.meta.url), 'utf8'));
const url = new URL(process.env.PUBLIC_SITE_URL || config.url);
if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
  throw new Error('PUBLIC_SITE_URL doit être une origine HTTPS, sans chemin, identifiants ni paramètres.');
}
const indexSetting = process.env.PUBLIC_INDEXABLE ?? String(config.indexable);
if (!['true', 'false'].includes(indexSetting)) throw new Error('PUBLIC_INDEXABLE doit valoir true ou false.');
const indexable = indexSetting === 'true';
if (indexable && url.hostname.endsWith('.workers.dev')) {
  throw new Error('Renseigner le domaine définitif avant d’activer le référencement.');
}
const origin = url.origin;
await Promise.all(['activation-640.webp', 'activation-960.webp', 'activation-1536.webp', 'share-card.png'].map(name => stat(new URL(`assets/${name}`, source))));
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(source, output, { recursive: true, filter: path => !path.endsWith('/activation.png') });

let html = await readFile(new URL('index.html', source), 'utf8');
html = html.replaceAll('https://filledepub-site.l-losange.workers.dev', origin)
  .replace(/<meta name="robots" content="[^"]+">/, `<meta name="robots" content="${indexable ? 'index, follow' : 'noindex, follow'}">`);
if (indexable) html = html.replace('</head>', `  <link rel="canonical" href="${origin}/">\n</head>`);
await writeFile(new URL('index.html', output), html);

let headers = await readFile(new URL('_headers', source), 'utf8');
headers = headers.replace(/^  X-Robots-Tag:.*\n?/m, indexable ? '' : '  X-Robots-Tag: noindex, follow\n');
await writeFile(new URL('_headers', output), headers);
await writeFile(new URL('robots.txt', output), `User-agent: *\nAllow: /\n${indexable ? `\nSitemap: ${origin}/sitemap.xml\n` : ''}`);
if (indexable) {
  await writeFile(new URL('sitemap.xml', output), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url></urlset>\n`);
}
console.log(`Fille de Pub : site prêt dans dist/ (${indexable ? 'référencement activé' : 'version non indexée'}).`);
