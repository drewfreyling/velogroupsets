import type { Env, Session } from './types.ts';
export class HttpError extends Error {
  status:number;
  constructor(status:number,message:string) { super(message); this.status=status; }
}
export const json=(body:unknown,status=200,extra:Record<string,string>={})=>new Response(JSON.stringify(body),{
  status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',
    'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer',...extra},
});
export function originFor(env:Env) {
  const origin=env.SITE_ORIGIN || (env.ENVIRONMENT==='local'?'http://127.0.0.1:8787':'');
  if (!origin || new URL(origin).origin!==origin || (env.ENVIRONMENT!=='local'&&!origin.startsWith('https://'))) throw new HttpError(503,'Community features are not configured.');
  return origin;
}
export function sameOrigin(request:Request,env:Env,session?:Session) {
  if(request.headers.get('Origin')!==originFor(env)) throw new HttpError(403,'This request must come from this website.');
  if(session && !equal(request.headers.get('X-CSRF-Token')||'',session.csrf)) throw new HttpError(403,'Refresh this page and try again.');
}
export function equal(a:string,b:string) {
  if(a.length!==b.length)return false;
  let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);
  return diff===0;
}
export const random=()=>btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
export async function hash(value:string) {return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),x=>x.toString(16).padStart(2,'0')).join('');}
export function cookieValue(request:Request,name:string) {
  return (request.headers.get('Cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='))?.slice(name.length+1)||'';
}
export function cookie(name:string,value:string,maxAge:number) {return `${name}=${value}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;}
export async function boundedBody(request:Request,limit:number) {
  const declared=request.headers.get('Content-Length');
  if(declared && (!/^\d+$/.test(declared)||Number(declared)>limit))throw new HttpError(413,'The file or request is too large.');
  if(!request.body)throw new HttpError(400,'A request body is required.');
  const reader=request.body.getReader();const chunks:Uint8Array[]=[];let size=0,expired=false;
  const timeout=setTimeout(()=>{expired=true;void reader.cancel().catch(()=>{});},60_000);
  try {while(true){const {done,value}=await reader.read();if(expired)throw new HttpError(408,'The request body took too long. Please try again.');if(done)break;size+=value.byteLength;if(size>limit)throw new HttpError(413,'The file or request is too large.');chunks.push(value);}}
  finally {clearTimeout(timeout);await reader.cancel().catch(()=>{});}
  const output=new Uint8Array(size);let offset=0;for(const c of chunks){output.set(c,offset);offset+=c.byteLength;}return output;
}
export async function readJson(request:Request,limit=12_000) {
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))throw new HttpError(415,'Send JSON for this request.');
  try {const value=JSON.parse(new TextDecoder().decode(await boundedBody(request,limit)));if(!value||typeof value!=='object'||Array.isArray(value))throw Error();return value;}
  catch(e){if(e instanceof HttpError)throw e;throw new HttpError(400,'Invalid JSON.');}
}
export function text(value:unknown,min:number,max:number,label:string) {
  if(typeof value!=='string'||value.trim().length<min||value.trim().length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value))throw new HttpError(400,`Enter ${label} between ${min} and ${max} characters.`);
  return value.trim();
}
export function db(env:Env) {if(!env.COMMUNITY_DB)throw new HttpError(503,'Community storage is unavailable.');return env.COMMUNITY_DB;}
