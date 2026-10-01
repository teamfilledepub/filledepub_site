import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { build } from 'esbuild';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { defaults, validateConfig, csvCell } from '../src/validation.mjs';

const origin = 'https://fdp.test';
const password = 'local-only-test-credential-2026';
const candidate = () => ({type:'candidature',idempotencyKey:crypto.randomUUID(),name:'Profil de test',email:'test@example.invalid',phone:'+590 690 00 00 00',city:'Ville de test',profile:'Freelance',availability:'Week-end',experience:'Données fictives',consent:true});

test('Contact storage, authentication, publication and image isolation', async t => {
  await mkdir(resolve('.wrangler'), {recursive:true});
  const directory = await mkdtemp(resolve('.wrangler/test-')); 
  const bundle = join(directory,'worker.mjs');
  await build({entryPoints:[resolve('src/worker.mjs')],outfile:bundle,bundle:true,format:'esm',platform:'browser'});
  const options = secret => convertV4MiniflareOptions({
    modules:true,scriptPath:bundle,compatibilityDate:'2026-09-26',
    durableObjects:{SITE_STORE:{className:'SiteStore',useSQLite:true}},
    resourcePersistencePath:join(directory,'data'),bindings:secret?{ADMIN_PASSWORD:secret}:{},
    serviceBindings:{ASSETS:async request=>{
      const url=new URL(request.url);const path=url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname;
      try{return new Response(await readFile(resolve('site','.'+path)),{headers:{'Content-Type':path.endsWith('.html')?'text/html':'text/plain'}});}catch{return new Response('Not found',{status:404});}
    }}});
  let mf = new Miniflare(options(password));
  const request = (path, method='GET', body, cookie, extra={}) => mf.dispatchFetch(origin+path,{method,headers:{Origin:origin,'Content-Type':'application/json','CF-Connecting-IP':'192.0.2.12',...(cookie?{Cookie:cookie}:{}),...extra},...(body!==undefined?{body:typeof body==='string'||body instanceof Uint8Array?body:JSON.stringify(body)}:{})});
  let cookie, config, contactId, savedKey;
  try {
    await t.test('Private endpoints reject an anonymous visitor and cross-origin writes',async()=>{
      assert.equal((await request('/api/admin/contacts')).status,401);
      assert.equal((await request('/api/admin/contacts/export')).status,401);
      assert.equal((await request('/api/admin/site','PUT',{})).status,401);
      assert.equal((await request('/api/admin/login','POST',{password},null,{Origin:'https://other.test'})).status,403);
    });
    await t.test('Forms validate consent, required values, size and recruitment profile',async()=>{
      assert.equal((await request('/api/contacts','POST',{...candidate(),consent:false})).status,400);
      assert.equal((await request('/api/contacts','POST',{...candidate(),name:' '})).status,400);
      assert.equal((await request('/api/contacts','POST',{...candidate(),profile:'<script>'})).status,400);
      assert.equal((await request('/api/contacts','POST','x'.repeat(21000))).status,413);
    });
    await t.test('Candidate persistence is idempotent and contact data never enter the public API',async()=>{
      const body=candidate();savedKey=body.idempotencyKey;
      assert.equal((await request('/api/contacts','POST',body)).status,201);
      assert.equal((await request('/api/contacts','POST',body)).status,200);
      const publicText=await (await request('/api/content')).text();assert.ok(!publicText.includes(body.email));
    });
    await t.test('Login issues a protected cookie, and a forged cookie does not authorize access',async()=>{
      assert.equal((await request('/api/admin/login','POST',{password:'wrong'})).status,401);
      const r=await request('/api/admin/login','POST',{password});assert.equal(r.status,200);
      const setCookie=r.headers.get('Set-Cookie');for(const flag of ['HttpOnly','Secure','SameSite=Strict','Max-Age=3600'])assert.ok(setCookie.includes(flag));
      cookie=setCookie.split(';')[0];
      assert.equal((await request('/api/admin/state','GET',undefined,'__Host-fdp_session='+'a'.repeat(64))).status,401);
      const state=await(await request('/api/admin/state','GET',undefined,cookie)).json();
      assert.equal(state.totals.find(t=>t.kind==='candidature').count,1);config=state.config;
    });
    await t.test('Published text is HTML-escaped and stale editors cannot overwrite a later publication',async()=>{
      const key=defaults.fields.find(f=>f.defaultValue==='VOS ANIMATIONS').key;
      config.texts[key]='<img src=x onerror=alert(1)> Test';
      const r=await request('/api/admin/site','PUT',{revision:0,config},cookie);assert.equal(r.status,200);
      assert.equal((await request('/api/admin/site','PUT',{revision:0,config},cookie)).status,409);
      const page=await (await request('/')).text();assert.ok(page.includes('&lt;img src=x onerror=alert(1)&gt; Test'));assert.ok(!page.includes('<img src=x onerror'));
      const malicious=structuredClone(config);malicious.theme.yellow='red;}body{display:none';
      assert.equal((await request('/api/admin/site','PUT',{revision:1,config:malicious},cookie)).status,400);
      assert.match((await request('/')).headers.get('Content-Security-Policy'),/script-src 'self'/);
    });
    await t.test('Uploads accept raster images, refuse SVG and cannot reference outside URLs',async()=>{
      assert.equal((await request('/api/admin/media','POST',new TextEncoder().encode('<svg><script>alert(1)</script></svg>'),cookie,{'Content-Type':'image/svg+xml'})).status,415);
      const png=new Uint8Array(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO/a1ioAAAAASUVORK5CYII=','base64'));
      const uploaded=await request('/api/admin/media?name=test.png','POST',png,cookie,{'Content-Type':'image/png'});assert.equal(uploaded.status,201);
      const image=await uploaded.json();const fetched=await request(image.src);assert.equal(fetched.headers.get('Content-Type'),'image/png');assert.equal((await fetched.arrayBuffer()).byteLength,png.length);
      const malicious=structuredClone(config);malicious.images.hero.src='https://tracker.example/image.png';assert.throws(()=>validateConfig(malicious));
      malicious.images.hero.src='/media/00000000-0000-0000-0000-000000000000';assert.equal((await request('/api/admin/site','PUT',{revision:1,config:malicious},cookie)).status,400);
    });
    await t.test('CSV export includes contacts and neutralizes spreadsheet formulas',async()=>{
      const body={type:'demande',idempotencyKey:crypto.randomUUID(),name:'=HYPERLINK("bad")',email:'lead@example.invalid',project:'Projet fictif',consent:true};
      assert.equal((await request('/api/contacts','POST',body)).status,201);
      const csv=await (await request('/api/admin/contacts/export','GET',undefined,cookie)).text();assert.ok(csv.includes("'=HYPERLINK"));assert.ok(csv.includes('test@example.invalid'));assert.ok(csv.includes('lead@example.invalid'));
      const filtered=await(await request('/api/admin/contacts?type=candidature','GET',undefined,cookie)).json();assert.equal(filtered.contacts.length,1);contactId=filtered.contacts[0].id;
      assert.equal(csvCell('+590123'),'"\'+590123"');
    });
    await t.test('Contact changes and deletion are authenticated',async()=>{
      assert.equal((await request('/api/admin/contacts/'+contactId,'PATCH',{status:'contacté'},cookie)).status,200);
      assert.equal((await request('/api/admin/contacts/'+contactId,'DELETE')).status,401);
      assert.equal((await request('/api/admin/contacts/'+contactId,'DELETE',undefined,cookie)).status,200);
      const list=await(await request('/api/admin/contacts?type=candidature','GET',undefined,cookie)).json();assert.equal(list.contacts.length,0);
    });
    await t.test('Persistence survives Worker restarts, credential rotation revokes sessions, missing secret fails closed',async()=>{
      await mf.dispose();mf=new Miniflare(options(password+'-rotated'));
      assert.equal((await request('/api/admin/state','GET',undefined,cookie)).status,401);
      assert.equal((await(await request('/api/content')).json()).revision,1);
      await mf.dispose();mf=new Miniflare(options());
      assert.equal((await request('/api/admin/state')).status,503);
      assert.equal((await request('/api/admin/login','POST',{password})).status,503);
      assert.equal((await(await request('/api/health')).json()).adminConfigured,false);
    });
    await t.test('Repeated public submissions are limited without disclosing previous data',async()=>{
      let limited=false;
      for(let i=0;i<6;i++){const r=await request('/api/contacts','POST',candidate(),undefined,{'CF-Connecting-IP':'192.0.2.44'});if(r.status===429)limited=true;}
      assert.ok(limited);
    });
  } finally { await mf.dispose();await rm(directory,{recursive:true,force:true}); }
});
