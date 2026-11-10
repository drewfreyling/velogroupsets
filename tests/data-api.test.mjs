import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,writeFileSync,rmSync,readdirSync,statSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import SwaggerParser from '@apidevtools/swagger-parser';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import specification from '../apps/api/openapi.json' with {type:'json'};
import schema from '../data/schemas/catalogue.schema.json' with {type:'json'};
import typeSchema from '../data/schemas/component-type.schema.json' with {type:'json'};
import {makeOpenApi} from '../apps/api/openapi.mjs';
import {manufacturers,groupsets,components} from '../apps/web/src/lib/catalogue.mjs';
const ajv=new Ajv2020({strict:false,allErrors:true,allowUnionTypes:true});addFormats(ajv);
ajv.addSchema({$id:'urn:velogroupsets:api-contract',components:{schemas:specification.components.schemas}});
const validate=(name,body)=>{
  const check=ajv.compile({$ref:'urn:velogroupsets:api-contract#/components/schemas/'+name});
  assert.equal(check(body),true,JSON.stringify(check.errors));return body;
};
const read=path=>JSON.parse(readFileSync(new URL('../apps/web/dist/api/v1/'+path+'.json',import.meta.url),'utf8'));

test('OpenAPI 3.1 validates offline, derives canonical records and documents static reads only',async()=>{
  assert.deepEqual(specification,makeOpenApi(schema,typeSchema),'Run npm run api:spec after contract changes.');
  await SwaggerParser.validate(structuredClone(specification),{resolve:{external:false}});
  assert.deepEqual(specification.security,[]);
  assert.equal(specification.info.version,'1.0.0');
  for(const operations of Object.values(specification.paths))assert.deepEqual(Object.keys(operations).sort(),['get','head']);
  assert.equal(specification.paths['/api/v1/components'],undefined);
  assert.equal(specification.paths['/api/v1/components.json'].get.parameters.some(p=>p.in==='query'),false);
  assert.deepEqual(JSON.parse(readFileSync(new URL('../apps/web/dist/openapi.json',import.meta.url),'utf8')),specification);
});

test('static collections, every canonical detail and bulk export preserve all data and match OpenAPI',()=>{
  const bulk=validate('CatalogueResponse',read('catalogue'));
  const canonical={manufacturers,groupsets,components,component_types:typeSchema.oneOf.map(t=>({id:t.const,name:t.title}))};
  assert.deepEqual(bulk.data,canonical);assert.match(bulk.catalogue_version,/^[a-f0-9]{64}$/);
  const index=validate('ApiIndex',read('index'));assert.equal(index.catalogue_version,bulk.catalogue_version);
  assert.equal(index.data.endpoints.catalogue,'/api/v1/catalogue.json');
  for(const [resource,name,records] of [['manufacturers','Manufacturer',manufacturers],['groupsets','Groupset',groupsets],['components','Component',components],['component-types','ComponentType',canonical.component_types]]){
    const collection=validate(name+'Collection',read(resource));assert.deepEqual(collection.data,records);assert.equal(collection.catalogue_version,bulk.catalogue_version);
    for(const record of records){const detail=validate(name+'Response',read(resource+'/'+record.id));assert.deepEqual(detail.data,record);assert.equal(detail.catalogue_version,bulk.catalogue_version);}
  }
  for(const [id,weight] of [['shimano-rd-4400-ss',264],['shimano-rd-a551-ss',273],['sram-fc-frc-w-d1',null]]){
    const record=read('components/'+id).data;assert.equal(record.weight_g,weight);assert.ok(record.sources.length);assert.ok(record.technical_document.url.startsWith('https://'));
  }
  assert.equal(bulk.data.components.filter(c=>c.id==='shimano-fc-u6040-2').length,1);
  assert.equal('users' in bulk.data,false);assert.equal('photos' in bulk.data,false);
});

test('generated assets fit Cloudflare Free file count and file size limits',()=>{
  let count=0;
  function walk(dir){for(const entry of readdirSync(dir,{withFileTypes:true})){
    const path=join(dir,entry.name);
    if(entry.isDirectory())walk(path);
    else {count++;assert.ok(statSync(path).size<=25*1024*1024,'Static asset exceeds 25 MiB: '+path);}
  }}
  walk(fileURLToPath(new URL('../apps/web/dist',import.meta.url)));
  assert.ok(count<=20_000,'Static assets exceed the Cloudflare Free file count limit.');
});

test('catalogue JSON bypasses the Worker with user code replaced by a failing probe',async()=>{
  const {unstable_dev}=await import('wrangler');
  const dir=mkdtempSync(join(tmpdir(),'velogroupsets-static-routing-'));
  let server;
  try{
    const production=JSON.parse(readFileSync(new URL('../wrangler.jsonc',import.meta.url),'utf8'));
    const probe=join(dir,'probe.mjs');writeFileSync(probe,'export default {fetch(){return new Response("Worker invoked",{status:503})}}');
    const config=join(dir,'wrangler.json');writeFileSync(config,JSON.stringify({name:'static-routing-test',main:probe,compatibility_date:production.compatibility_date,assets:{...production.assets,directory:fileURLToPath(new URL('../apps/web/dist',import.meta.url))}}));
    server=await unstable_dev(probe,{config,local:true,port:0,inspectorPort:0,logLevel:'none',experimental:{disableExperimentalWarning:true,disableDevRegistry:true,watch:false}});
    // The probe runs for community routes, but not inside the static namespace.
    assert.equal((await server.fetch('/api/health')).status,503);
    assert.equal((await server.fetch('/api/v1/no-such-file.json')).status,404);
    for(const path of ['/api/v1/index.json','/api/v1/catalogue.json','/api/v1/manufacturers.json','/api/v1/groupsets.json','/api/v1/components.json','/api/v1/component-types.json','/api/v1/components/shimano-rd-r7000-gs.json','/openapi.json']){
      const response=await server.fetch(path);assert.equal(response.status,200,path);
      assert.match(response.headers.get('Content-Type'),/application\/json/);assert.equal(response.headers.get('Access-Control-Allow-Origin'),'*');
      assert.equal(response.headers.get('Cache-Control'),'public, max-age=300, must-revalidate');
      if(path.startsWith('/api/'))assert.equal(response.headers.get('X-Catalogue-Delivery'),'static-assets');
      assert.equal(response.headers.get('Set-Cookie'),null);
      const json=await response.json();
      const operation=specification.paths[path]||specification.paths['/api/v1/components/{id}.json'];
      validate(operation.get.responses['200'].content['application/json'].schema.$ref.split('/').pop(),json);
    }
    const first=await server.fetch('/api/v1/components.json');const body=await first.text();const etag=first.headers.get('ETag');assert.ok(etag);
    assert.equal(await(await server.fetch('/api/v1/components.json?q=ignored&limit=1')).text(),body);
    const withCredentials=await server.fetch('/api/v1/components.json',{headers:{Cookie:'synthetic=session',Authorization:'Bearer synthetic-test'}});
    assert.equal(withCredentials.status,200);assert.equal(withCredentials.headers.get('Set-Cookie'),null);assert.equal(await withCredentials.text(),body);
    const unchanged=await server.fetch('/api/v1/components.json',{headers:{'If-None-Match':etag}});assert.equal(unchanged.status,304);assert.equal(await unchanged.text(),'');
    const head=await server.fetch('/api/v1/components.json',{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');
    for(const method of ['OPTIONS','POST','PUT','PATCH','DELETE'])assert.equal((await server.fetch('/api/v1/components.json',{method})).status,405);
  }finally{await server?.stop();rmSync(dir,{recursive:true,force:true});}
});
