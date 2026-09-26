import { cp, mkdir, rm, stat } from 'node:fs/promises';
await stat(new URL('../site/assets/activation.png', import.meta.url));
await rm(new URL('../dist/', import.meta.url), { recursive: true, force: true });
await mkdir(new URL('../dist/', import.meta.url), { recursive: true });
await cp(new URL('../site/', import.meta.url), new URL('../dist/', import.meta.url), { recursive: true });
console.log('Fille de Pub : site prêt dans dist/.');
