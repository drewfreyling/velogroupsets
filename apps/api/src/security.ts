import type { Dependencies, Env } from './types.ts';
import { HttpError, originFor } from './http.ts';
export async function turnstile(token:unknown,action:string,env:Env,deps:Dependencies={}) {
  if(typeof token!=='string'||!token||token.length>2048||!env.TURNSTILE_SECRET)throw new HttpError(400,'Complete the anti-spam check and try again.');
  let response:Response;try{response=await (deps.fetcher||fetch)('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({secret:env.TURNSTILE_SECRET,response:token,idempotency_key:crypto.randomUUID()})});}
  catch{throw new HttpError(503,'The anti-spam check is unavailable. Try again later.');}
  if(!response.ok)throw new HttpError(503,'The anti-spam check is unavailable.');
  const result=await response.json() as any;
  if(result.success!==true||result.hostname!==new URL(originFor(env)).hostname||result.action!==action)throw new HttpError(400,'The anti-spam check failed or expired. Try again.');
}
export async function purgePhoto(key:string,env:Env,deps:Dependencies={}) {
  if(!env.PHOTO_CACHE_PURGE_TOKEN||!env.CLOUDFLARE_ZONE_ID||!/^[a-f0-9]{32}$/.test(env.CLOUDFLARE_ZONE_ID)||!env.PHOTOS_BASE_URL)throw new HttpError(503,'Cache removal is not configured.');
  const response=await (deps.fetcher||fetch)(`https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/purge_cache`,{method:'POST',headers:{Authorization:`Bearer ${env.PHOTO_CACHE_PURGE_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({files:[`${env.PHOTOS_BASE_URL}/${key}`]})});
  if(!response.ok)throw new HttpError(503,'The photo is hidden, but cached copies still need removal. Retry this action.');
  const result=await response.json() as any;if(result.success!==true)throw new HttpError(503,'The photo is hidden, but cache removal needs another attempt.');
}
