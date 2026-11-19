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

test('riding category is additive to groupsets and shared components keep their original identities',()=>{
  const records=read('groupsets').data;
  assert.deepEqual(records.filter(g=>g.category==='mtb').map(g=>g.id).sort(),groupsets.filter(g=>g.category==='mtb').map(g=>g.id).sort());
  assert.equal(records.find(g=>g.id==='shimano-dura-ace-track').category,'track');
  assert.equal(records.find(g=>g.id==='shimano-grx-rx810').category,'gravel');
  assert.equal(read('components/shimano-bb-7700').data.id,'shimano-bb-7700');
  assert.equal(read('components/shimano-rd-m8000-sgs').data.specifications.maximum_sprocket_teeth,40);
  assert.equal(read('components/shimano-rd-m6000-gs').data.weight_g,null);
});

test('every Shimano range has sourced components in the public catalogue',()=>{
  const {groupsets:publicGroups,components:publicParts}=read('catalogue').data;
  const populated=new Set(publicParts.flatMap(part=>part.groupset_ids));
  const empty=publicGroups.filter(group=>group.manufacturer_id==='shimano'&&!populated.has(group.id)).map(group=>group.id);
  assert.deepEqual(empty,[],'Add verified component records with each Shimano range rather than publishing empty groupsets.');
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

test('every Campagnolo range has sourced components in the public catalogue',()=>{
  const {groupsets:publicGroups,components:publicParts}=read('catalogue').data;
  const populated=new Set(publicParts.flatMap(part=>part.groupset_ids));
  const empty=publicGroups.filter(group=>group.manufacturer_id==='campagnolo'&&!populated.has(group.id)).map(group=>group.id);
  assert.deepEqual(empty,[],`Campagnolo groupsets awaiting sourced component lists: ${empty.join(', ')}`);
});

test('every groupset has at least two sourced components after the inventory review',()=>{
  const {groupsets:publicGroups,components:publicParts}=read('catalogue').data;
  const counts=new Map();
  for(const part of publicParts)for(const group of part.groupset_ids)counts.set(group,(counts.get(group)||0)+1);
  const sparse=publicGroups.filter(group=>(counts.get(group.id)||0)<2).map(group=>group.id);
  assert.deepEqual(sparse,[],`Groupsets awaiting a sourced starter inventory: ${sparse.join(', ')}`);
});

test('OpenAPI supports explicit single right-hand one-by controls while preserving pairs',()=>{
  const single=read('components/microshift-sl-m9505-r').data;
  validate('Component',single);
  assert.deepEqual(single.specifications,{weight_basis:'Single',control_side:'Right',front_speeds:1,rear_speeds:10});
  assert.equal(single.weight_g,119);
  const check=ajv.compile({$ref:'urn:velogroupsets:api-contract#/components/schemas/Component'});
  for(const weight of [119,null]){
    for(const [field,value] of [['control_side','Left'],['front_speeds',2],['rear_speeds',1],['rear_speeds','10']]){
      const invalid=structuredClone(single);invalid.weight_g=weight;invalid.specifications[field]=value;
      assert.equal(check(invalid),false,`${field}=${value} must not identify a supported single control`);
    }
    for(const field of ['weight_basis','control_side','front_speeds','rear_speeds']){
      const invalid=structuredClone(single);invalid.weight_g=weight;delete invalid.specifications[field];
      assert.equal(check(invalid),false,`Single control missing ${field}`);
    }
  }
  const pair=validate('Component',read('components/microshift-sb-g7000').data);
  assert.equal(pair.specifications.weight_basis,'Pair');assert.equal(pair.specifications.front_speeds,1);
  assert.equal(pair.weight_g,466);
  assert.equal(pair.specifications.weight_method,'Sum of manufacturer side weights');
  assert.equal(pair.specifications.left_weight_g,190);
  assert.equal(pair.specifications.right_weight_g,276);
  assert.equal(pair.weight_g,pair.specifications.left_weight_g+pair.specifications.right_weight_g);
  const pod=validate('Component',read('components/sram-ec-axs-pod-d1-right').data);
  assert.equal(pod.model_number,'EC-AXS-POD-D1');assert.match(pod.specifications.reference_configuration,/Hardware supports left or right/);
});

test('disc assemblies have additive API types and preserve actual rotor and controller identities',()=>{
  const types=read('component-types').data.map(t=>t.id);
  for(const type of ['disc-brake-caliper','disc-brake-rotor','disc-brake-system'])assert.ok(types.includes(type));
  const rotor=validate('Component',read('components/shimano-rt-mt800-160').data);
  assert.equal(rotor.model_number,'RT-MT800');assert.equal(rotor.weight_g,108);
  assert.deepEqual(rotor.specifications,{weight_basis:'Single',diameter_mm:160,mount:'Center Lock',includes_mounting_hardware:false});
  const system=validate('Component',read('components/shimano-bl-m8100-br-m8100-front').data);
  assert.equal(system.type,'disc-brake-system');assert.equal(system.weight_g,null);
  assert.equal(system.specifications.hose_length_mm,800);assert.equal(system.specifications.includes_rotor,null);
  const check=ajv.compile({$ref:'urn:velogroupsets:api-contract#/components/schemas/Component'});
  for(const [record,key] of [[rotor,'diameter_mm'],[rotor,'mount'],[system,'lever_model'],[system,'position'],[system,'includes_rotor']]){
    const invalid=structuredClone(record);delete invalid.specifications[key];assert.equal(check(invalid),false,key);
  }
  const original=validate('Component',read('components/sram-ec-axs-sram-a1').data);
  assert.deepEqual(original.groupset_ids,['sram-xx1-eagle-axs','sram-x01-eagle-axs']);
  assert.equal(original.specifications.weight_basis,'Single');
  assert.equal(read('components/shimano-fc-m9000').data.specifications.reference_model,'FC-M9000-1');
  assert.equal(read('components/shimano-br-r7000').data.type,'brake-calipers','Existing rim-caliper API type remains stable');
});
