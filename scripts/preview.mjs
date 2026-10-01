import { readFile, writeFile } from 'node:fs/promises';
import { defaults, themeCss } from '../src/validation.mjs';
const base = new URL('../site/', import.meta.url);
let html = await readFile(new URL('index.html', base), 'utf8');
const css = await readFile(new URL('styles.css', base), 'utf8');
const scripts = await Promise.all(['app.js', 'typewriter.js'].map(p => readFile(new URL(p, base), 'utf8')));
html = html.replace(/<link\b[^>]*href="\/styles.css"[^>]*>/, `<style>${css}\n${themeCss(defaults.config)}</style>`)
  .replace(/<link\b[^>]*href="\/theme.css"[^>]*>/, '')
  .replace(/<script\b[^>]*src="\/(?:app|typewriter|forms).js"[^>]*><\/script>/g, '')
  .replace(/ srcset="[^"]+"/g, '').replace(/ sizes="[^"]+"/g, '');
for (const path of new Set([...html.matchAll(/(?:src|href)="(\/assets\/[^" ]+)"/g)].map(m => m[1]))) {
  const mime = path.endsWith('.svg') ? 'image/svg+xml' : path.endsWith('.webp') ? 'image/webp' : 'image/png';
  const bytes = await readFile(new URL(path.slice(1), base));
  html = html.replaceAll(`"${path}"`, `"data:${mime};base64,${bytes.toString('base64')}"`);
}
const previewNote = `document.querySelectorAll('[data-contact-form]').forEach(form=>{form.querySelector('[type=submit]').disabled=true;form.querySelector('.form-feedback').textContent='Aperçu visuel : ouvrez le site en ligne pour envoyer une demande.';form.addEventListener('submit',event=>event.preventDefault());});`;
html = html.replace('</body>', `<script>${scripts.join('\n')}\n${previewNote}</script></body>`);
const output = process.argv[2] || 'Fille_de_Pub_Apercu.html';
await writeFile(output, html);
console.log(`Aperçu visuel autonome créé : ${output}`);
