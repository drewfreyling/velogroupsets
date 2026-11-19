import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';
import worker from '../apps/api/src/index.ts';
import { components, componentUrl, groupsets, groupsetUrl, manufacturers, manufacturerUrl } from '../apps/web/src/lib/catalogue.mjs';

const dist = new URL('../apps/web/dist/', import.meta.url);
const file = (path) => new URL(path.replace(/^\//, ''), dist);
const env = { ENVIRONMENT: 'test', RELEASE_SHA: '123', ASSETS: { fetch() { throw new Error('API must never fall through to static assets'); } } };
test('catalogue-only production denies community requests before accessing any binding', async () => {
  for (const flag of [undefined, 'false']) {
    const production={...env, ENVIRONMENT:'production', COMMUNITY_ENABLED:flag, UPLOADS_ENABLED:'true'};
    for(const binding of ['COMMUNITY_DB','UPLOADS','PHOTOS','EVIDENCE','IMAGES']){
      Object.defineProperty(production,binding,{get(){throw new Error('Disabled community binding accessed');}});
    }
    const config=await worker.fetch(new Request('https://velogroupsets.com/api/community/config'),production);
    assert.deepEqual(Object.fromEntries(Object.entries(await config.json()).filter(([key])=>['communityAvailable','signInAvailable','uploadsAvailable'].includes(key))),
      {communityAvailable:false,signInAvailable:false,uploadsAvailable:false});
    for(const [method,path] of [['GET','/api/session'],['GET','/api/auth/google/callback'],['POST','/api/auth/google/start'],['POST','/api/uploads'],['GET','/api/components/shimano-rd-r7000-gs/photos'],['GET','/api/photos/00000000-0000-4000-8000-000000000001/file'],['GET','/api/moderation']]){
      const response=await worker.fetch(new Request('https://velogroupsets.com'+path,{method}),production);
      assert.equal(response.status,404);assert.equal(response.headers.get('cache-control'),'no-store');
    }
    await worker.scheduled({},production,{waitUntil(){throw new Error('Disabled cleanup scheduled');}});
  }
});
test('health is read-only, uncached and identifies the release', async () => {
  const response = await worker.fetch(new Request('https://example.test/api/health'), env);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { status: 'ok', environment: 'test', release: '123' });
  const head = await worker.fetch(new Request('https://example.test/api/health', {method:'HEAD'}), env);
  assert.equal(await head.text(), '');
  const post = await worker.fetch(new Request('https://example.test/api/health', {method:'POST'}), env);
  assert.equal(post.status, 405);
  assert.equal(post.headers.get('allow'), 'GET, HEAD');
});
test('unknown APIs return JSON 404, never the application HTML', async () => {
  for (const path of ['/api','/api/comments','/api/uploads']) {
    const response = await worker.fetch(new Request('https://example.test'+path), env);
    assert.equal(response.status, 404);
    assert.match(response.headers.get('content-type'), /application\/json/);
  }
});
test('non-API requests delegate to static assets', async () => {
  const response = await worker.fetch(new Request('https://example.test/catalogue/'), {...env, ASSETS:{fetch:async()=>new Response('catalogue')}});
  assert.equal(await response.text(), 'catalogue');
});
test('every catalogue identity has a generated canonical detail page', () => {
  for (const [records,url] of [[manufacturers,manufacturerUrl],[groupsets,groupsetUrl],[components,componentUrl]]) {
    for (const record of records) {
      const html = readFileSync(file(url(record)+'index.html'),'utf8');
      assert.ok(html.includes(record.name));
      assert.ok(html.includes(url(record)));
    }
  }
  const index=JSON.parse(readFileSync(file('search-index.json'),'utf8'));
  assert.deepEqual(index.map(r=>r.id).sort(), components.map(r=>r.id).sort());
  for (const record of index) assert.ok(existsSync(file(record.url+'index.html')));
});
test('all generated local navigation and assets resolve', () => {
  function walk(dir) {
    for (const entry of readdirSync(dir,{withFileTypes:true})) {
      const path=join(dir,entry.name);
      if(entry.isDirectory()) walk(path);
      else if(entry.name.endsWith('.html')) {
        const html=readFileSync(path,'utf8');
        for(const match of html.matchAll(/(?:href|src)="(\/[^"?#]*)(?:[?#][^"]*)?"/g)) {
          const url=match[1];
          assert.ok(existsSync(file(url.endsWith('/')?url+'index.html':url)), `${path}: missing ${url}`);
        }
      }
    }
  }
  walk(fileURLToPath(dist));
});

// Parse the generated HTML rather than repeating a browser session per record.
// Keep these expected labels independent of the component template.
test('every rear derailleur page renders all four sourced or unknown limits and cage help', () => {
  function* elements(node) {
    if (node.tagName) yield node;
    for (const child of node.childNodes || []) yield* elements(child);
  }
  const text = node => node.nodeName === '#text' ? node.value : (node.childNodes || []).map(text).join('');
  const attribute = (node, name) => node.attrs?.find(attr => attr.name === name)?.value;
  const limits = [
    ['total_capacity_teeth', 'Total capacity'],
    ['maximum_sprocket_teeth', 'Largest sprocket'],
    ['minimum_sprocket_teeth', 'Smallest sprocket'],
    ['maximum_front_difference_teeth', 'Front chainring tooth difference'],
  ];
  for (const component of components.filter(part => part.type === 'rear-derailleur')) {
    const html = readFileSync(file(componentUrl(component)+'index.html'), 'utf8');
    const nodes = [...elements(parse(html))];
    const rows = nodes.filter(node => node.tagName === 'dl')
      .flatMap(node => node.childNodes.filter(child => child.tagName === 'div'));
    for (const [key, label] of limits) {
      const matches = rows.filter(row => row.childNodes.some(child => child.tagName === 'dt' && text(child).trim() === label));
      assert.equal(matches.length, 1, `${component.id}: exactly one ${label} row`);
      const values = matches[0].childNodes.filter(child => child.tagName === 'dd');
      assert.equal(values.length, 1, `${component.id}: exactly one ${label} definition`);
      const expected = component.specifications[key] == null ? 'Not yet sourced' : `${component.specifications[key]}T`;
      assert.equal(text(values[0]).trim(), expected, `${component.id}: ${label}`);
    }
    const buttons = nodes.filter(node => node.tagName === 'button' && attribute(node, 'aria-label') === 'Explain rear derailleur cage codes');
    assert.equal(buttons.length, 1, `${component.id}: exactly one cage-help button`);
  }
});
