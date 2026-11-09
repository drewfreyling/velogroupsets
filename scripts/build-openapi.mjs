import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {makeOpenApi} from '../apps/api/openapi.mjs';
const schema=JSON.parse(readFileSync(new URL('../data/schemas/catalogue.schema.json',import.meta.url),'utf8'));
const types=JSON.parse(readFileSync(new URL('../data/schemas/component-type.schema.json',import.meta.url),'utf8'));
const path=new URL('../apps/api/openapi.json',import.meta.url);
const content=JSON.stringify(makeOpenApi(schema,types),null,2)+'\n';
if(process.argv.includes('--check')){
  if(!existsSync(path)||readFileSync(path,'utf8')!==content)throw new Error('OpenAPI contract is out of date. Run npm run api:spec.');
  console.log('OpenAPI contract matches canonical catalogue schemas.');
}else writeFileSync(path,content);
