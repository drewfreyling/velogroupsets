import { components, componentUrl } from '../apps/web/src/lib/catalogue.mjs';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
const output=new URL('../apps/api/generated/',import.meta.url);
mkdirSync(output,{recursive:true});
const path=new URL('catalogue.json',output);
const content=JSON.stringify(components.map(c=>({
  id:c.id, model:c.model_number, url:componentUrl(c), aliases:(c.aliases||[]).map(a=>a.id),
})))+'\n';
if(!existsSync(path)||readFileSync(path,'utf8')!==content)writeFileSync(path,content);
