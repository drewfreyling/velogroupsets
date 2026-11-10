// Generate the public contract from the canonical catalogue JSON Schemas.
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
  const object=properties=>({type:'object',additionalProperties:false,required:Object.keys(properties),properties});
  const schemas=Object.fromEntries(Object.entries(catalogueSchema.$defs).map(([name,schema])=>[schemaName(name),rewrite(schema)]));
  schemas.ComponentTypeId={type:'string',enum:typeSchema.oneOf.map(t=>t.const)};
  schemas.ComponentType=object({id:ref('ComponentTypeId'),name:{type:'string'}});
  schemas.CatalogueVersion={type:'string',pattern:'^[a-f0-9]{64}$',description:'SHA-256 of the canonical public catalogue snapshot. Compare across files to detect different releases.'};
  const envelope=data=>object({catalogue_version:ref('CatalogueVersion'),data});
  schemas.ApiIndex=envelope(object({api_version:{const:'v1'},endpoints:object(Object.fromEntries(['manufacturers','groupsets','components','component_types','catalogue','openapi','documentation'].map(k=>[k,{type:'string',pattern:'^/'}])))}));
  schemas.Catalogue=object({...rewrite(catalogueSchema.properties),component_types:{type:'array',items:ref('ComponentType')}});
  schemas.CatalogueResponse=envelope(ref('Catalogue'));
  for(const name of ['Manufacturer','Groupset','Component','ComponentType']){
    schemas[name+'Response']=envelope(ref(name));
    schemas[name+'Collection']=envelope({type:'array',items:ref(name)});
  }
  const paths={};
  function endpoint(path,id,summary,schema,detail=false){
    const headers={
      ETag:{description:'Platform-provided entity tag; usable with If-None-Match.',schema:{type:'string'}},
      'Cache-Control':{description:'Browsers may reuse the file for five minutes before revalidation.',schema:{type:'string'}},
      ...(path.startsWith('/api/')?{'X-Catalogue-Delivery':{schema:{type:'string',const:'static-assets'}}}:{}),
    };
    const operation={summary,description:'Build-time JSON served directly by Cloudflare Workers Static Assets without executing the Worker. Query strings are ignored: no server-side search, filtering or pagination. Collections contain all records in canonical snapshot order. Canonical IDs only. Unknown paths and unsupported methods use the platform asset/fallback behaviour.',parameters:[
      ...(detail?[{name:'id',in:'path',required:true,description:'Canonical record ID; historical aliases are not separate static files.',schema:ref('Id')}]:[]),
      {name:'If-None-Match',in:'header',description:'ETag validator for same-origin or non-browser clients. Cross-origin JavaScript should use a normal GET and let browser caching manage validation: the static service does not support OPTIONS preflight.',schema:{type:'string'}},
    ]};
    const common={'304':{description:'Unchanged static asset; no response body.',headers}};
    paths[path]={
      get:{...operation,operationId:id,responses:{'200':{description:'Generated catalogue JSON.',headers,content:{'application/json':{schema:ref(schema)}}},...common}},
      head:{...operation,operationId:id+'Headers',responses:{'200':{description:'Static asset headers without a response body.',headers},...common}},
    };
  }
  endpoint('/api/v1/index.json','getApiIndex','Discover catalogue files','ApiIndex');
  endpoint('/api/v1/catalogue.json','getCatalogue','Download the complete catalogue','CatalogueResponse');
  for(const [resource,name] of [['manufacturers','Manufacturer'],['groupsets','Groupset'],['components','Component'],['component-types','ComponentType']]){
    endpoint('/api/v1/'+resource+'.json','list'+name+'s','Download all '+resource,name+'Collection');
    endpoint('/api/v1/'+resource+'/{id}.json','get'+name,'Download a canonical '+resource+' record',name+'Response',true);
  }
  schemas.OpenApiDocument={type:'object',required:['openapi','info','paths'],properties:{openapi:{type:'string',pattern:'^3\\.1\\.'},info:{type:'object'},paths:{type:'object'}}};
  endpoint('/openapi.json','getOpenApi','Download this OpenAPI 3.1 specification','OpenApiDocument');
  return {openapi:'3.1.0',jsonSchemaDialect:'https://json-schema.org/draft/2020-12/schema',
    info:{title:'VeloGroupsets catalogue API',version:'1.0.0',description:'Public, read-only build-time JSON files served directly by Cloudflare Workers Static Assets. No Worker execution for successful GET/HEAD asset requests. No authentication or query parameters: download complete collections and filter/search locally. Query strings are ignored. Unknown values remain null; model variants and evidence are preserved. Responses include a catalogue_version revision. Browser max-age is 300 seconds. Breaking changes are allowed under v1 during staging; production compatibility has not been promised. Community APIs are separate.'},
    servers:[{url:'/',description:'Same origin as the served specification'}],security:[],paths,components:{schemas}};
}
