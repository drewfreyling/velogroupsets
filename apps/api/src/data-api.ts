import snapshot from '../generated/public-catalogue.json' with {type:'json'};
import specification from '../openapi.json' with {type:'json'};
import type { Context, Env } from './types.ts';

type RecordData = {id:string; [key:string]:any};
const {version,manufacturers,groupsets,components,component_types}=snapshot;
const catalogue={manufacturers,groupsets,components,component_types};
const collections=new Map<string,RecordData[]>([
  ['manufacturers',manufacturers],['groupsets',groupsets],
  ['components',components],['component-types',component_types],
]);
const compareId=(a:RecordData,b:RecordData)=>a.id<b.id?-1:a.id>b.id?1:0;
const byResource=new Map([...collections].map(([name,records])=>[name,new Map(records.map(r=>[r.id,r]))]));
for(const component of components)for(const alias of component.aliases||[])byResource.get('components')!.set(alias.id,component);
const ordered=new Map([...collections].map(([name,records])=>[name,[...records].sort(name==='groupsets'?(a,b)=>a.start_year-b.start_year||compareId(a,b):compareId)]));
const fold=(value:string)=>value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const searchText=new Map<string,string>();
for(const [resource,records] of collections)for(const record of records){
  const manufacturer=byResource.get('manufacturers')!.get(record.manufacturer_id);
  const memberGroups=(record.groupset_ids||[]).map((id:string)=>byResource.get('groupsets')!.get(id));
  searchText.set(resource+':'+record.id,fold([
    record.id,record.name,record.model_number,record.generation,manufacturer?.name,
    record.specifications?.left_model,record.specifications?.right_model,
    ...(record.aliases||[]).flatMap((a:any)=>[a.id,a.slug]),
    ...memberGroups.flatMap((g:any)=>[g?.name,g?.model_number]),
  ].filter(Boolean).join(' ')));
}
const cors={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Expose-Headers':'ETag, X-Catalogue-Version, Content-Location',
  'X-Content-Type-Options':'nosniff',
};
const error=(status:number,message:string,extra:Record<string,string>={})=>new Response(JSON.stringify({error:message}),{
  status,headers:{...cors,'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...extra},
});
class QueryError extends Error {}
const invalid=(message:string):never=>{throw new QueryError(message);};
function integer(params:URLSearchParams,name:string,fallback:number,min:number,max:number){
  const raw=params.get(name);if(raw===null)return fallback;
  if(!/^(0|[1-9][0-9]*)$/.test(raw))return invalid(`${name} must be an integer between ${min} and ${max}.`);
  const value=Number(raw);if(!Number.isSafeInteger(value)||value<min||value>max)return invalid(`${name} must be an integer between ${min} and ${max}.`);
  return value;
}
function validateParams(params:URLSearchParams,allowed:string[]){
  for(const key of params.keys()){
    if(!allowed.includes(key))invalid(`Unknown query parameter: ${key}.`);
    if(params.getAll(key).length!==1)invalid(`Query parameter ${key} must be provided only once.`);
  }
}
function filterId(params:URLSearchParams,name:string,resource:string){
  const id=params.get(name);if(id===null)return null;
  if(!byResource.get(resource)!.has(id))return invalid(`Unknown ${name}.`);
  return id;
}
function list(resource:string,params:URLSearchParams){
  const allowed=['limit','offset','q'];
  if(resource==='groupsets'||resource==='components')allowed.push('manufacturer_id');
  if(resource==='components')allowed.push('groupset_id','type');
  validateParams(params,allowed);
  const limit=integer(params,'limit',50,1,100),offset=integer(params,'offset',0,0,1_000_000);
  const q=(params.get('q')||'').trim();if(q.length>120)invalid('q must contain no more than 120 characters.');
  const manufacturer=filterId(params,'manufacturer_id','manufacturers');
  const group=filterId(params,'groupset_id','groupsets');
  const type=filterId(params,'type','component-types');
  const terms=fold(q).split(/\s+/).filter(Boolean);
  const records=ordered.get(resource)!.filter(record=>
    (!manufacturer||record.manufacturer_id===manufacturer)&&
    (!group||record.groupset_ids?.includes(group))&&
    (!type||record.type===type)&&terms.every(term=>searchText.get(resource+':'+record.id)!.includes(term)));
  const total=records.length;
  return {data:records.slice(offset,offset+limit),pagination:{limit,offset,total,
    next_offset:offset+limit<total?offset+limit:null,previous_offset:offset>0?Math.max(0,offset-limit):null}};
}
function representation(path:string,params:URLSearchParams){
  if(path==='/api/v1'){
    validateParams(params,[]);
    return {data:{api_version:'v1',catalogue_version:version,endpoints:{
      manufacturers:'/api/v1/manufacturers',groupsets:'/api/v1/groupsets',components:'/api/v1/components',
      component_types:'/api/v1/component-types',catalogue:'/api/v1/catalogue',openapi:'/api/v1/openapi.json',documentation:'/api-docs/',
    }}};
  }
  if(path==='/api/v1/openapi.json'){validateParams(params,[]);return specification;}
  if(path==='/api/v1/catalogue'){validateParams(params,[]);return {data:catalogue};}
  const match=path.match(/^\/api\/v1\/([a-z-]+)(?:\/([a-z0-9]+(?:-[a-z0-9]+)*))?$/);
  if(!match||!collections.has(match[1]))return null;
  const [,resource,id]=match;
  if(!id)return list(resource,params);
  validateParams(params,[]);
  if(id.length>160)return null;
  const record=byResource.get(resource)!.get(id);
  return record?{data:record}:null;
}
function knownPath(path:string){
  if(['/api/v1','/api/v1/openapi.json','/api/v1/catalogue'].includes(path))return true;
  const match=path.match(/^\/api\/v1\/([a-z-]+)(?:\/([a-z0-9]+(?:-[a-z0-9]+)*))?$/);
  return !!match&&collections.has(match[1])&&(!match[2]||(match[2].length<=160&&byResource.get(match[1])!.has(match[2])));
}
function notModified(request:Request,etag:string){
  return (request.headers.get('If-None-Match')||'').split(',').some(value=>{
    const tag=value.trim();return tag==='*'||tag.replace(/^W\//,'')===etag.replace(/^W\//,'');
  });
}
function reply(request:Request,response:Response){
  if(notModified(request,response.headers.get('ETag')!))return new Response(null,{status:304,headers:response.headers});
  return request.method==='HEAD'?new Response(null,{status:response.status,headers:response.headers}):response;
}
async function route(request:Request,env:Env,ctx?:Context):Promise<Response>{
  const url=new URL(request.url),path=url.pathname.replace(/\/$/,'');
  if(!knownPath(path))return error(404,'Catalogue endpoint or record not found.');
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...cors,
    'Cache-Control':'no-store','Allow':'GET, HEAD, OPTIONS','Access-Control-Allow-Methods':'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers':'If-None-Match, Content-Type','Access-Control-Max-Age':'86400'}});
  if(!['GET','HEAD'].includes(request.method))return error(405,'Method not allowed.',{Allow:'GET, HEAD, OPTIONS'});
  try{
    // Validate before cache lookup, so misspelled/repeated parameters never pass silently.
    const body=representation(path,url.searchParams);
    if(body===null)return error(404,'Catalogue endpoint or record not found.');
    const keyUrl=new URL(url);keyUrl.pathname=path;
    keyUrl.searchParams.set('__vg_release',env.RELEASE_SHA||'local');
    keyUrl.searchParams.set('__vg_catalogue',version);keyUrl.searchParams.sort();
    const key=new Request(keyUrl,{method:'GET'});
    const cache=ctx?((globalThis as any).caches?.default):undefined;
    if(cache){try{const hit=await cache.match(key);if(hit)return reply(request,hit);}catch{/* Cache availability must not prevent catalogue reads. */}}
    const json=JSON.stringify(body);
    const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(json));
    const etag='"'+Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('')+'"';
    const headers:Record<string,string>={...cors,'Content-Type':'application/json; charset=utf-8',
      'Cache-Control':'public, max-age=300, s-maxage=300, must-revalidate','ETag':etag,'X-Catalogue-Version':version};
    const record=(body as any).data;
    if(record?.id)headers['Content-Location']=path.slice(0,path.lastIndexOf('/')+1)+record.id;
    const response=new Response(json,{headers});
    if(cache){const cached=response.clone();ctx!.waitUntil(Promise.resolve().then(()=>cache.put(key,cached)).catch(()=>{}));}
    return reply(request,response);
  }catch(e){
    if(e instanceof QueryError)return error(400,e.message);
    return error(500,'Catalogue is unavailable.');
  }
}

export async function dataApi(request:Request,env:Env,ctx?:Context):Promise<Response>{
  const response=await route(request,env,ctx);
  return request.method==='HEAD'?new Response(null,{status:response.status,headers:response.headers}):response;
}
