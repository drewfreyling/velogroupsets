import records from '../generated/catalogue.json' with {type:'json'};
import { HttpError } from './http.ts';
const byId=new Map(records.flatMap(r=>[r.id,...r.aliases].map(id=>[id,r] as const)));
export function componentFor(id:unknown) {
  const record=typeof id==='string'&&id.length<=160&&/^[a-z0-9-]+$/.test(id)?byId.get(id):undefined;
  if(!record)throw new HttpError(404,'Component not found.');return record;
}
const returnPaths=new Set(['/', '/account/', '/upload/', '/catalogue/', '/moderation/', ...records.map(r=>r.url)]);
export const knownReturnPath=(path:string)=>returnPaths.has(path);
