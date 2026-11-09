import { createHash } from 'node:crypto';
import { manufacturers, groupsets, components, types, componentUrl } from '../apps/web/src/lib/catalogue.mjs';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
const output=new URL('../apps/api/generated/',import.meta.url);
mkdirSync(output,{recursive:true});
const path=new URL('catalogue.json',output);
const content=JSON.stringify(components.map(c=>({
  id:c.id, model:c.model_number, url:componentUrl(c), aliases:(c.aliases||[]).map(a=>a.id),
})))+'\n';
if(!existsSync(path)||readFileSync(path,'utf8')!==content)writeFileSync(path,content);

// Public curated data only. Community records, environment settings and secrets
// never enter this snapshot. Preserve the canonical fields and explicit nulls.
const catalogue={manufacturers,groupsets,components,component_types:types.map(t=>({id:t.const,name:t.title}))};
const snapshot=JSON.stringify({version:createHash('sha256').update(JSON.stringify(catalogue)).digest('hex'),...catalogue})+'\n';
const snapshotPath=new URL('public-catalogue.json',output);
if(!existsSync(snapshotPath)||readFileSync(snapshotPath,'utf8')!==snapshot)writeFileSync(snapshotPath,snapshot);
