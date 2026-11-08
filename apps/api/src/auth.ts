import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { Dependencies, Env, Session } from './types.ts';
import { boundedBody, cookie, cookieValue, db, equal, hash, HttpError, json, originFor, random, sameOrigin, text } from './http.ts';
import { POLICY_VERSION } from '../../../packages/shared/community.ts';
import { signInReady } from './config.ts';
import { turnstile } from './security.ts';
import { knownReturnPath } from './catalogue.ts';
const remoteKeys=createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const SESSION_COOKIE='__Host-vg_session';
const OAUTH_COOKIE='__Host-vg_oauth';
export async function sessionFor(request:Request,env:Env,required=true):Promise<Session|null> {
  const token=cookieValue(request,SESSION_COOKIE);
  if(!/^[A-Za-z0-9_-]{43}$/.test(token)||!env.COMMUNITY_DB){if(required)throw new HttpError(401,'Sign in to continue.');return null;}
  const tokenHash=await hash(token);
  const row=await db(env).prepare('SELECT u.id,u.email,u.display_name,u.role,u.disabled,s.csrf_token,s.created_at FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND u.disabled=0').bind(tokenHash,Date.now()).first();
  if(!row){if(required)throw new HttpError(401,'Sign in to continue.');return null;}
  const allowed=(env.MODERATOR_EMAILS||'').split(',').map(email=>email.trim().toLowerCase()).includes(row.email.toLowerCase());
  return {user:{id:row.id,email:row.email,display_name:row.display_name,role:row.role==='moderator'&&allowed?'moderator':'member',disabled:row.disabled},tokenHash,csrf:row.csrf_token,createdAt:row.created_at};
}
export async function requireModerator(request:Request,env:Env) {
  const session=(await sessionFor(request,env))!;
  if(session.user.role!=='moderator')throw new HttpError(403,'Moderator access is required.');return session;
}
export async function startGoogle(request:Request,env:Env,deps:Dependencies={}) {
  sameOrigin(request,env);
  if(!signInReady(env))throw new HttpError(503,'Sign-in is not open yet. The operator and contact details must be configured first.');
  const raw=await boundedBody(request,8192);
  let data:any;
  if(request.headers.get('Content-Type')?.startsWith('application/x-www-form-urlencoded')) data=Object.fromEntries(new URLSearchParams(new TextDecoder().decode(raw)));
  else if(request.headers.get('Content-Type')?.startsWith('application/json')) {try{data=JSON.parse(new TextDecoder().decode(raw));}catch{throw new HttpError(400,'Invalid sign-in form.');}}
  else throw new HttpError(415,'Invalid sign-in form.');
  if(!data||!['on','true',true].includes(data.accepted_terms)||data.policy_version!==POLICY_VERSION)throw new HttpError(400,'Actively agree to the current Terms and Community Guidelines before signing in.');
  await turnstile(data.turnstile_token,'sign-in',env,deps);
  const displayName=data.display_name?text(data.display_name,1,60,'a public display name'):'Contributor';
  const candidate=typeof data.return_path==='string'?data.return_path:'/account/';
  const parsed=new URL(candidate,originFor(env));
  const returnPath=parsed.origin===originFor(env)&&knownReturnPath(parsed.pathname)&&candidate.startsWith('/')&&!candidate.startsWith('//')&&!candidate.includes('\\')?parsed.pathname+parsed.search:'/account/';
  const state=random(),nonce=random(),verifier=random();
  const challenge=btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier))))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
  const now=Date.now();
  const reserved=await db(env).prepare('INSERT INTO oauth_requests (state_hash,verifier,nonce,return_path,display_name,policy_version,accepted_at,expires_at) SELECT ?,?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM oauth_requests WHERE accepted_at>?)<20').bind(await hash(state),verifier,nonce,returnPath,displayName,POLICY_VERSION,now,now+600_000,now-60_000).run();
  if(reserved.meta.changes!==1)throw new HttpError(429,'Too many sign-in attempts. Please try again shortly.');
  const url=new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.search=new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID!,redirect_uri:originFor(env)+'/api/auth/google/callback',response_type:'code',scope:'openid email',state,nonce,code_challenge:challenge,code_challenge_method:'S256',prompt:'select_account'}).toString();
  if(request.headers.get('Accept')==='application/json')return json({redirectUrl:url.toString()},200,{'Set-Cookie':cookie(OAUTH_COOKIE,state,600)});
  return new Response(null,{status:303,headers:{Location:url.toString(),'Set-Cookie':cookie(OAUTH_COOKIE,state,600),'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
}
export async function verifyGoogleToken(token:string,env:Env,nonce:string,keys:any=remoteKeys) {
  const {payload}=await jwtVerify(token,keys,{issuer:['https://accounts.google.com','accounts.google.com'],audience:env.GOOGLE_CLIENT_ID,algorithms:['RS256'],requiredClaims:['sub','email','email_verified','nonce','exp','iat'],clockTolerance:30,maxTokenAge:'10m'});
  if(payload.email_verified!==true||payload.nonce!==nonce||typeof payload.sub!=='string'||typeof payload.email!=='string'||payload.sub.length>255||payload.email.length>254)throw new HttpError(401,'Google sign-in could not be verified.');
  if((Array.isArray(payload.aud)&&payload.aud.length>1&&payload.azp!==env.GOOGLE_CLIENT_ID)||(payload.azp!==undefined&&payload.azp!==env.GOOGLE_CLIENT_ID))throw new HttpError(401,'Google sign-in could not be verified.');
  return {sub:payload.sub,email:payload.email.toLowerCase()};
}
export async function finishGoogle(request:Request,env:Env,deps:Dependencies={}) {
  if(!signInReady(env))throw new HttpError(503,'Sign-in is not configured.');
  const url=new URL(request.url),state=url.searchParams.get('state')||'',code=url.searchParams.get('code')||'';
  if(!state||!code||state.length>256||code.length>4096||!equal(state,cookieValue(request,OAUTH_COOKIE)))throw new HttpError(401,'This sign-in has expired. Start again.');
  const login=await db(env).prepare('DELETE FROM oauth_requests WHERE state_hash=? AND expires_at>? RETURNING *').bind(await hash(state),Date.now()).first();
  if(!login||login.policy_version!==POLICY_VERSION)throw new HttpError(401,'This sign-in has expired. Start again.');
  const response=await (deps.fetcher||fetch)('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID!,client_secret:env.GOOGLE_CLIENT_SECRET!,code,code_verifier:login.verifier,grant_type:'authorization_code',redirect_uri:originFor(env)+'/api/auth/google/callback'})});
  if(!response.ok)throw new HttpError(401,'Google sign-in failed. Start again.');
  const payload=await response.json() as {id_token?:unknown};
  if(typeof payload.id_token!=='string'||payload.id_token.length>32_000)throw new HttpError(401,'Google sign-in failed.');
  const identity=await verifyGoogleToken(payload.id_token,env,login.nonce,deps.googleKeys||remoteKeys);
  const moderator=(env.MODERATOR_EMAILS||'').split(',').map(e=>e.trim().toLowerCase()).includes(identity.email);
  const now=Date.now();
  await db(env).prepare('INSERT INTO users (id,google_sub,email,display_name,role,created_at) VALUES (?,?,?,?,?,?) ON CONFLICT(google_sub) DO UPDATE SET email=excluded.email').bind(crypto.randomUUID(),identity.sub,identity.email,login.display_name,moderator?'moderator':'member',now).run();
  const user=await db(env).prepare('SELECT id,disabled FROM users WHERE google_sub=?').bind(identity.sub).first();
  if(!user||user.disabled)throw new HttpError(403,'This account is unavailable. Contact the site operator.');
  if(moderator)await db(env).prepare("UPDATE users SET role='moderator' WHERE id=?").bind(user.id).run();
  const sessionToken=random(),csrf=random();
  await db(env).batch([
    db(env).prepare('INSERT INTO sessions (token_hash,user_id,csrf_token,created_at,expires_at) VALUES (?,?,?,?,?)').bind(await hash(sessionToken),user.id,csrf,now,now+30*86400_000),
    db(env).prepare("INSERT INTO consents (id,user_id,action,policy_version,accepted_at) VALUES (?,?,'account',?,?)").bind(crypto.randomUUID(),user.id,POLICY_VERSION,login.accepted_at),
  ]);
  const headers=new Headers({'Location':login.return_path,'Cache-Control':'no-store','Referrer-Policy':'no-referrer'});
  headers.append('Set-Cookie',cookie(SESSION_COOKIE,sessionToken,30*86400));headers.append('Set-Cookie',cookie(OAUTH_COOKIE,'',0));
  return new Response(null,{status:303,headers});
}
export async function logout(request:Request,env:Env) {
  const session=(await sessionFor(request,env))!;sameOrigin(request,env,session);
  await db(env).prepare('DELETE FROM sessions WHERE token_hash=?').bind(session.tokenHash).run();
  return json({ok:true},200,{'Set-Cookie':cookie(SESSION_COOKIE,'',0)});
}
