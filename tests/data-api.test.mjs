import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import SwaggerParser from '@apidevtools/swagger-parser';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import worker from '../apps/api/src/index.ts';
import specification from '../apps/api/openapi.json' with {type:'json'};
import schema from '../data/schemas/catalogue.schema.json' with {type:'json'};
import typeSchema from '../data/schemas/component-type.schema.json' with {type:'json'};
import {makeOpenApi} from '../apps/api/openapi.mjs';
import {manufacturers,groupsets,components} from '../apps/web/src/lib/catalogue.mjs';
const env={ENVIRONMENT:'test',RELEASE_SHA:'test-release',ASSETS:{fetch(){throw Error('Public API must not access static pages or community storage');}}};
const call=(path='/api/v1',init={},context,bindings=env)=>worker.fetch(new Request('https://example.test'+path,init),bindings,context);
const ajv=new Ajv2020({strict:false,allErrors:true,allowUnionTypes:true});addFormats(ajv);
ajv.addSchema({$id:'urn:velogroupsets:api-contract',components:{schemas:specification.components.schemas}});
const validate=(name,body)=>{
  const check=ajv.compile({$ref:'urn:velogroupsets:api-contract#/components/schemas/'+name});
  assert.equal(check(body),true,JSON.stringify(check.errors));return body;
};

test('OpenAPI 3.1 validates without network access and derives records from canonical schemas',async()=>{
  assert.deepEqual(specification,makeOpenApi(schema,typeSchema),'Regenerate the contract with npm run api:spec after schema changes.');
  await SwaggerParser.validate(structuredClone(specification),{resolve:{external:false}});
  assert.deepEqual(specification.security,[]);
  for(const path of Object.values(specification.paths))assert.deepEqual(Object.keys(path).sort(),['get','head','options']);
});

test('discovery, all public collections and details match their OpenAPI response schemas',async()=>{
  const index=await(await call()).json();validate('ApiIndex',index);
  assert.match(index.data.catalogue_version,/^[a-f0-9]{64}$/);
  for(const [resource,type,id] of [['manufacturers','Manufacturer','shimano'],['groupsets','Groupset','shimano-105-r7000'],['components','Component','shimano-rd-r7000-gs'],['component-types','ComponentType','rear-derailleur']]){
    const page=await call('/api/v1/'+resource);assert.equal(page.status,200);validate(type+'Page',await page.json());
    const detail=await call('/api/v1/'+resource+'/'+id);assert.equal(detail.status,200);
    const body=validate(type+'Response',await detail.json());assert.equal(body.data.id,id);
    assert.equal(detail.headers.get('Content-Location'),'/api/v1/'+resource+'/'+id);
  }
  assert.deepEqual(await(await call('/api/v1/openapi.json')).json(),specification);
  assert.deepEqual(JSON.parse(readFileSync(new URL('../apps/web/dist/openapi.json',import.meta.url),'utf8')),specification);
});

test('bulk export preserves the full curated records, citations, shared identity and null weights',async()=>{
  const response=await call('/api/v1/catalogue');assert.equal(response.status,200);
  const body=validate('CatalogueResponse',await response.json());
  assert.deepEqual(body.data.manufacturers,manufacturers);assert.deepEqual(body.data.groupsets,groupsets);assert.deepEqual(body.data.components,components);
  assert.deepEqual(body.data.component_types,typeSchema.oneOf.map(t=>({id:t.const,name:t.title})));
  for(const [id,weight] of [['shimano-rd-4400-ss',264],['shimano-rd-a551-ss',273],['sram-fc-frc-w-d1',null]]){
    const result=await(await call('/api/v1/components/'+id)).json();assert.equal(result.data.weight_g,weight);
    assert.ok(result.data.technical_document.url.startsWith('https://'));assert.ok(result.data.sources.length);
  }
  assert.equal(body.data.components.filter(c=>c.id==='shimano-fc-u6040-2').length,1);
  assert.equal('users' in body.data,false);assert.equal('photos' in body.data,false);
});

test('bounded pagination enumerates each groupset once in year order',async()=>{
  const found=[];let offset=0;
  while(offset!==null){
    const body=validate('GroupsetPage',await(await call('/api/v1/groupsets?limit=37&offset='+offset)).json());
    assert.equal(body.pagination.total,groupsets.length);assert.equal(body.pagination.limit,37);
    found.push(...body.data);offset=body.pagination.next_offset;
  }
  const expected=[...groupsets].sort((a,b)=>a.start_year-b.start_year||(a.id<b.id?-1:a.id>b.id?1:0));
  assert.deepEqual(found,expected);assert.equal(new Set(found.map(g=>g.id)).size,groupsets.length);
  const empty=await(await call('/api/v1/components?offset=1000000')).json();assert.deepEqual(empty.data,[]);assert.equal(empty.pagination.total,components.length);assert.equal(empty.pagination.next_offset,null);
});

test('component filters, multiple search terms, accents and historical ID aliases work together',async()=>{
  const filtered=await(await call('/api/v1/components?manufacturer_id=shimano&groupset_id=shimano-105-r7000&type=rear-derailleur&q=R7000%20GS')).json();
  assert.deepEqual(filtered.data.map(c=>c.id),['shimano-rd-r7000-gs']);
  const sides=await(await call('/api/v1/components?q=ST-R7000-R')).json();assert.ok(sides.data.some(c=>c.id==='shimano-st-r7000'));
  const accented=await(await call('/api/v1/groupsets?q=SANTE')).json();assert.ok(accented.data.some(g=>g.id==='shimano-sante-5000'));
  const alias=await call('/api/v1/components/shimano-st-r7000-l');assert.equal(alias.headers.get('Content-Location'),'/api/v1/components/shimano-st-r7000');assert.equal((await alias.json()).data.id,'shimano-st-r7000');
  const incompatible=await(await call('/api/v1/components?manufacturer_id=sram&groupset_id=shimano-105-r7000')).json();assert.deepEqual(incompatible.data,[]);
});

test('invalid or repeated parameters are rejected with JSON errors',async()=>{
  for(const query of ['limit=0','limit=101','limit=1.5','limit=01','limit=-1','offset=1000001','offset=NaN','limit=1&limit=2','q=x&q=y','unknown=x','manufacturer_id=unknown','groupset_id=unknown','type=unknown','q='+'x'.repeat(121)]){
    const response=await call('/api/v1/components?'+query);assert.equal(response.status,400,query);
    validate('Error',await response.json());assert.equal(response.headers.get('Cache-Control'),'no-store');
  }
  for(const path of ['/api/v1/catalogue?limit=1','/api/v1/components/shimano-rd-r7000-gs?limit=1','/api/v1/manufacturers?groupset_id=shimano-105-r7000'])assert.equal((await call(path)).status,400,path);
});

test('reads use public CORS, five-minute caching, ETags and bodyless HEAD/304 responses',async()=>{
  const response=await call('/api/v1/components/shimano-rd-r7000-gs');const etag=response.headers.get('ETag');assert.match(etag,/^"[a-f0-9]{64}"$/);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'),'*');assert.equal(response.headers.get('Access-Control-Allow-Credentials'),null);
  assert.equal(response.headers.get('Cache-Control'),'public, max-age=300, s-maxage=300, must-revalidate');assert.match(response.headers.get('X-Catalogue-Version'),/^[a-f0-9]{64}$/);
  for(const validator of [etag,'W/'+etag,'"other", '+etag,'*']){
    const cached=await call('/api/v1/components/shimano-rd-r7000-gs',{headers:{'If-None-Match':validator}});assert.equal(cached.status,304);assert.equal(await cached.text(),'');assert.equal(cached.headers.get('ETag'),etag);
  }
  assert.equal((await call('/api/v1/components/shimano-rd-r7000-gs',{headers:{'If-None-Match':'"not-current"'}})).status,200);
  const head=await call('/api/v1/components/shimano-rd-r7000-gs',{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');assert.equal(head.headers.get('ETag'),etag);
  const error=await call('/api/v1/components?limit=0',{method:'HEAD'});assert.equal(error.status,400);assert.equal(await error.text(),'');
  const unknown=await call('/api/v1/no-such-record',{method:'HEAD'});assert.equal(unknown.status,404);assert.equal(await unknown.text(),'');
  assert.equal((await call('/api/health')).headers.get('Access-Control-Allow-Origin'),null);
});

test('the versioned namespace is read only and unknown routes never fall through to community handlers',async()=>{
  for(const method of ['POST','PUT','PATCH','DELETE']){
    const response=await call('/api/v1/components',{method});assert.equal(response.status,405);assert.equal(response.headers.get('Allow'),'GET, HEAD, OPTIONS');validate('Error',await response.json());
  }
  const options=await call('/api/v1/components',{method:'OPTIONS',headers:{Origin:'https://other.example','Access-Control-Request-Method':'GET','Access-Control-Request-Headers':'If-None-Match'}});assert.equal(options.status,204);assert.equal(options.headers.get('Access-Control-Allow-Origin'),'*');assert.equal(await options.text(),'');
  for(const path of ['/api/v1/components/unknown','/api/v1/components/shimano-rd-r7000-gs/photos','/api/v1/toString','/api/v1/constructors','/api/v1/components/%2F','/api/v1/openapi.yaml']){
    const response=await call(path);assert.equal(response.status,404,path);validate('Error',await response.json());
  }
  assert.equal((await call('/api/v1/')).status,200);
});

test('edge caching is scoped to the catalogue and release, ignores credentials and survives cache failures',async()=>{
  const original=Object.getOwnPropertyDescriptor(globalThis,'caches');const saved=new Map();const tasks=[];const keys=[];
  const context={waitUntil(p){tasks.push(p);}};
  Object.defineProperty(globalThis,'caches',{configurable:true,value:{default:{
    async match(key){keys.push(key.url);return saved.get(key.url)?.clone();},
    async put(key,response){saved.set(key.url,response.clone());},
  }}});
  try{
    const first=await call('/api/v1/components?limit=1',{headers:{Cookie:'private=session',Authorization:'Bearer private'}},context);const expected=await first.json();await Promise.all(tasks);
    const hit=await call('/api/v1/components?limit=1',{},context);assert.deepEqual(await hit.json(),expected);assert.equal(saved.size,1);assert.equal(hit.headers.get('Set-Cookie'),null);
    assert.equal(new URL(keys[0]).searchParams.get('__vg_release'),'test-release');assert.match(new URL(keys[0]).searchParams.get('__vg_catalogue'),/^[a-f0-9]{64}$/);
    await call('/api/v1/components?limit=1',{},context,{...env,RELEASE_SHA:'next-release'});await Promise.all(tasks);assert.equal(saved.size,2);
    const count=keys.length;assert.equal((await call('/api/v1/components?unknown=bad',{},context)).status,400);assert.equal(keys.length,count);
    globalThis.caches.default={match(){throw Error('cache offline');},put(){throw Error('cache offline');}};
    assert.equal((await call('/api/v1/components',{},context)).status,200);await Promise.all(tasks);
  }finally{if(original)Object.defineProperty(globalThis,'caches',original);else delete globalThis.caches;}
});
