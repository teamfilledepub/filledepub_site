import { readFile, writeFile } from 'node:fs/promises';
const base = new URL('../site/', import.meta.url);
let html = await readFile(new URL('index.html', base), 'utf8');
const css = await readFile(new URL('styles.css', base), 'utf8');
const js = await readFile(new URL('app.js', base), 'utf8');
const hero = (await readFile(new URL('assets/activation-960.webp', base))).toString('base64');
const favicon = (await readFile(new URL('assets/favicon.svg', base))).toString('base64');
html = html.replace('<link rel="stylesheet" href="styles.css">', `<style>${css}</style>`)
  .replace('<script src="app.js" defer></script>', '')
  .replace('href="assets/favicon.svg"', `href="data:image/svg+xml;base64,${favicon}"`)
  .replace('src="assets/activation-960.webp"', `src="data:image/webp;base64,${hero}"`)
  .replace(/ srcset="[^"]+"/, '')
  .replace(/ sizes="[^"]+"/, '')
  .replace('</body>', `<script>${js}</script></body>`);
const imageSources = [...new Set([...html.matchAll(/src="(assets\/[^"]+)"/g)].map(match => match[1]))];
for (const path of imageSources) {
  const mime = path.endsWith('.svg') ? 'image/svg+xml' : path.endsWith('.webp') ? 'image/webp' : 'image/png';
  const data = (await readFile(new URL(path, base))).toString('base64');
  html = html.replaceAll(`src="${path}"`, `src="data:${mime};base64,${data}"`);
}
const output = process.argv[2] || 'Fille_de_Pub_Apercu.html';
await writeFile(output, html);
console.log(`Aperçu autonome créé : ${output}`);
