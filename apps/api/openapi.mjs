// Generate the public contract from the same JSON Schema definitions as the
// catalogue validator. Never maintain a second copy of component fields.
export function makeOpenApi(catalogueSchema,typeSchema){
  const schemaName=name=>name.split('_').map(s=>s[0].toUpperCase()+s.slice(1)).join('');
  const ref=name=>({$ref:'#/components/schemas/'+name});
  const rewrite=value=>{
    if(Array.isArray(value))return value.map(rewrite);
    if(!value||typeof value!=='object')return value;
    return Object.fromEntries(Object.entries(value).map(([key,item])=>{
      if(key==='$ref'&&item.startsWith('#/$defs/'))return [key,'#/components/schemas/'+schemaName(item.slice(8))];
      if(key==='$ref'&&item===typeSchema.$id)return [key,'#/components/schemas/ComponentTypeId'];
      return [key,rewrite(item)];
    }));
  };
  const object=(properties,required=Object.keys(properties))=>({type:'object',additionalProperties:false,required,properties});
  const schemas=Object.fromEntries(Object.entries(catalogueSchema.$defs).map(([name,schema])=>[schemaName(name),rewrite(schema)]));
  schemas.ComponentTypeId={type:'string',enum:typeSchema.oneOf.map(t=>t.const)};
  schemas.ComponentType=object({id:ref('ComponentTypeId'),name:{type:'string'}});
  schemas.Error=object({error:{type:'string'}});
  schemas.Pagination=object({limit:{type:'integer',minimum:1,maximum:100},offset:{type:'integer',minimum:0,maximum:1_000_000},total:{type:'integer',minimum:0},next_offset:{type:['integer','null'],minimum:0},previous_offset:{type:['integer','null'],minimum:0}});
  schemas.CatalogueVersion={type:'string',pattern:'^[a-f0-9]{64}$',description:'SHA-256 of the canonical public catalogue snapshot. Changes when curated records or taxonomy change.'};
  schemas.ApiIndex=object({data:object({api_version:{const:'v1'},catalogue_version:ref('CatalogueVersion'),endpoints:object(Object.fromEntries(['manufacturers','groupsets','components','component_types','catalogue','openapi','documentation'].map(k=>[k,{type:'string',pattern:'^/'}])))})});
  schemas.Catalogue=object({...rewrite(catalogueSchema.properties),component_types:{type:'array',items:ref('ComponentType')}});
  schemas.CatalogueResponse=object({data:ref('Catalogue')});
  schemas.OpenApiDocument={type:'object',required:['openapi','info','paths'],properties:{openapi:{type:'string',pattern:'^3\\.1\\.'},info:{type:'object'},paths:{type:'object'}}};
  for(const name of ['Manufacturer','Groupset','Component','ComponentType']){
    schemas[name+'Response']=object({data:ref(name)});
    schemas[name+'Page']=object({data:{type:'array',items:ref(name)},pagination:ref('Pagination')});
  }
  const headers={
    ETag:{description:'Entity tag for this representation; usable with If-None-Match.',schema:{type:'string'}},
    CacheControl:{description:'Public successful responses are cached for five minutes.',schema:{type:'string'}},
    CatalogueVersion:{description:'Revision of the curated catalogue; compare this while paging.',schema:ref('CatalogueVersion')},
    ContentLocation:{description:'Canonical API URI, including when an historical component ID alias is requested.',schema:{type:'string'}},
  };
  const publicHeaders={ETag:{$ref:'#/components/headers/ETag'},'Cache-Control':{$ref:'#/components/headers/CacheControl'},'X-Catalogue-Version':{$ref:'#/components/headers/CatalogueVersion'}};
  const content=name=>({'application/json':{schema:ref(name)}});
  const responses={
    NotModified:{description:'The If-None-Match validator matches; no response body.',headers:publicHeaders},
    BadRequest:{description:'Unknown/repeated query parameter, invalid pagination, excessive search length or unknown filter ID.',content:content('Error')},
    NotFound:{description:'Unknown catalogue endpoint or record ID.',content:content('Error')},
    MethodNotAllowed:{description:'This public data API is read only.',headers:{Allow:{schema:{type:'string',const:'GET, HEAD, OPTIONS'}}},content:content('Error')},
    ServerError:{description:'The catalogue could not be served.',content:content('Error')},
  };
  const parameters={
    Limit:{name:'limit',in:'query',description:'Page size.',schema:{type:'integer',minimum:1,maximum:100,default:50}},
    Offset:{name:'offset',in:'query',description:'Zero-based offset; offsets beyond the total return an empty page.',schema:{type:'integer',minimum:0,maximum:1_000_000,default:0}},
    Q:{name:'q',in:'query',description:'Case/accent-insensitive search. Every whitespace-separated term must match. Empty text applies no search.',schema:{type:'string',maxLength:120}},
    ManufacturerId:{name:'manufacturer_id',in:'query',description:'Canonical manufacturer ID, such as shimano.',schema:ref('Id')},
    GroupsetId:{name:'groupset_id',in:'query',description:'Canonical groupset membership ID, such as shimano-105-r7000.',schema:ref('Id')},
    Type:{name:'type',in:'query',description:'Stable component-type ID.',schema:ref('ComponentTypeId')},
    IfNoneMatch:{name:'If-None-Match',in:'header',description:'ETag validator; weak tags, lists of tags and * are accepted.',schema:{type:'string'}},
    Id:{name:'id',in:'path',required:true,description:'Canonical record ID. Component detail requests also accept documented historical ID aliases and return the canonical record.',schema:{...ref('Id'),maxLength:160}},
  };
  const paths={};
  function endpoint(path,id,summary,schema,params=[],detail=false,description=''){
    const responseHeaders=detail?{...publicHeaders,'Content-Location':{$ref:'#/components/headers/ContentLocation'}}:publicHeaders;
    const common={'304':{$ref:'#/components/responses/NotModified'},'400':{$ref:'#/components/responses/BadRequest'},'404':{$ref:'#/components/responses/NotFound'},'405':{$ref:'#/components/responses/MethodNotAllowed'},'500':{$ref:'#/components/responses/ServerError'}};
    const headErrors=Object.fromEntries(Object.entries(common).map(([status,item])=>{
      const definition=responses[item.$ref.split('/').pop()];
      return [status,{description:definition.description,...(definition.headers?{headers:definition.headers}:{})}];
    }));
    const operation={summary,description,parameters:[...params,'IfNoneMatch'].map(p=>({$ref:'#/components/parameters/'+p})),responses:{'200':{description:'Successful catalogue response.',headers:responseHeaders,content:content(schema)},...common}};
    paths[path]={
      get:{operationId:id,...operation},
      head:{...structuredClone(operation),operationId:id+'Headers',summary:summary+' (headers only)',responses:{...headErrors,'200':{description:'Same status and headers as GET, without a response body.',headers:responseHeaders}}},
      options:{operationId:id+'Options',summary:'CORS preflight',parameters:detail?[{$ref:'#/components/parameters/Id'}]:[],responses:{'204':{description:'Public GET/HEAD access is permitted. Allowed request headers are If-None-Match and Content-Type.'},'404':{$ref:'#/components/responses/NotFound'}}},
    };
  }
  endpoint('/api/v1','getApiIndex','Discover the catalogue API','ApiIndex');
  endpoint('/api/v1/catalogue','getCatalogue','Download the complete curated catalogue','CatalogueResponse',[],false,'Use this export for a consistent snapshot and fewer requests. Excludes community accounts, photos, comments and moderation data.');
  endpoint('/api/v1/openapi.json','getOpenApi','Download this OpenAPI 3.1 specification','OpenApiDocument');
  for(const [resource,name,filters] of [['manufacturers','Manufacturer',[]],['groupsets','Groupset',['ManufacturerId']],['components','Component',['ManufacturerId','GroupsetId','Type']],['component-types','ComponentType',[]]]){
    endpoint('/api/v1/'+resource,'list'+name+'s','List '+resource,name+'Page',['Limit','Offset','Q',...filters],false,
      resource==='groupsets'?'Ordered by start_year ascending, then id. Filters combine with AND.':'Ordered by id ascending. Filters combine with AND.');
    endpoint('/api/v1/'+resource+'/{id}','get'+name,'Get a '+resource+' record',name+'Response',['Id'],true);
  }
  return {openapi:'3.1.0',jsonSchemaDialect:'https://json-schema.org/draft/2020-12/schema',
    info:{title:'VeloGroupsets catalogue API',version:'1.0.0',description:'Public, read-only curated bicycle groupset and component data. No authentication required. Unknown weights remain null; sources, technical documents and model variants are preserved. Successful GET/HEAD responses are publicly cacheable for 300 seconds. Query parameters must appear only once; unknown parameters are rejected. Trailing slashes are accepted. Community APIs are separate and are not covered by this specification.'},
    servers:[{url:'/',description:'Same origin as the served specification'}],security:[],paths,
    components:{schemas,parameters,headers,responses}};
}
