import type { APIRoute } from 'astro';
import {createHash} from 'node:crypto';
import {manufacturers,groupsets,components,types} from '../../../lib/catalogue.mjs';

// These are build-time files, served by Workers Static Assets before the Worker.
// Wrangler excludes /api/v1/* from Worker-first routing. Query strings never
// select static data: clients search and filter the returned records locally.
export function getStaticPaths() {
  const catalogue={manufacturers,groupsets,components,component_types:types.map(t=>({id:t.const,name:t.title}))};
  const version=createHash('sha256').update(JSON.stringify(catalogue)).digest('hex');
  const entry=(path:string,data:unknown)=>({params:{path},props:{body:{catalogue_version:version,data}}});
  const collections=[
    ['manufacturers',catalogue.manufacturers],['groupsets',catalogue.groupsets],
    ['components',catalogue.components],['component-types',catalogue.component_types],
  ] as const;
  return [
    entry('index',{api_version:'v1',endpoints:{
      catalogue:'/api/v1/catalogue.json',manufacturers:'/api/v1/manufacturers.json',
      groupsets:'/api/v1/groupsets.json',components:'/api/v1/components.json',
      component_types:'/api/v1/component-types.json',openapi:'/openapi.json',documentation:'/api-docs/',
    }}),
    entry('catalogue',catalogue),
    ...collections.flatMap(([resource,records])=>[
      entry(resource,records),
      ...records.map(record=>entry(resource+'/'+record.id,record)),
    ]),
  ];
}

export const GET:APIRoute=({props})=>new Response(JSON.stringify(props.body),{
  headers:{'Content-Type':'application/json; charset=utf-8'},
});
