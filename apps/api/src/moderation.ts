import type { Dependencies, Env } from './types.ts';
import { requireModerator } from './auth.ts';
import { boundedBody, db, HttpError, json, readJson, sameOrigin, text } from './http.ts';
import { publicPhotoOrigin, uploadsReady } from './config.ts';
import { purgePhoto } from './security.ts';
import { MAX_OUTPUT_BYTES } from '../../../packages/shared/community.ts';
async function event(env:Env,actor:string,action:string,reason:string,photoId:string|null=null,userId:string|null=null) {
  await db(env).prepare('INSERT INTO moderation_events (id,actor_id,photo_id,user_id,action,reason,created_at) VALUES (?,?,?,?,?,?,?)').bind(crypto.randomUUID(),actor,photoId,userId,action,reason,Date.now()).run();
}
export async function moderationQueue(request:Request,env:Env) {
  await requireModerator(request,env);
  const {results:photos}=await db(env).prepare("SELECT p.id,p.user_id,p.component_id,p.caption,p.alt_text,p.status,p.created_at,p.review_reason,p.legal_hold,u.display_name FROM photos p JOIN users u ON u.id=p.user_id WHERE p.status IN ('pending','blocked') ORDER BY p.created_at LIMIT 50").all();
  const {results:reports}=await db(env).prepare('SELECT id,photo_id,reason,details,contact_email,created_at FROM reports WHERE resolved_at IS NULL ORDER BY created_at LIMIT 50').all();
  return json({photos:photos.map((p:any)=>({...p,previewUrl:p.status==='pending'?`/api/photos/${p.id}/preview`:null})),reports});
}
export async function moderatePhoto(request:Request,env:Env,id:string,action:string,deps:Dependencies={}) {
  const session=await requireModerator(request,env);sameOrigin(request,env,session);
  const body=await readJson(request);const reason=text(body.reason,5,1000,'a moderation reason');
  const photo=await db(env).prepare('SELECT * FROM photos WHERE id=?').bind(id).first();if(!photo)throw new HttpError(404,'Photo not found.');
  if(action==='approve'){
    if(!uploadsReady(env))throw new HttpError(503,'Photo publication is not configured.');
    if(photo.status==='approved')return json({ok:true,status:'approved'});
    if(photo.status!=='pending')throw new HttpError(409,'This photo is no longer awaiting review.');
    const publicKey=`photos/${crypto.randomUUID()}.jpg`;
    const claim=await db(env).prepare("UPDATE photos SET status='processing',public_key=?,reviewed_by=?,reviewed_at=? WHERE id=? AND status='pending'").bind(publicKey,session.user.id,Date.now(),id).run();
    if(claim.meta.changes!==1)throw new HttpError(409,'Another moderator has already reviewed this photo.');
    await db(env).prepare('INSERT OR IGNORE INTO photo_cleanup (object_key,created_at) VALUES (?,?)').bind(publicKey,Date.now()).run();
    try {
      const object=await env.UPLOADS.get(photo.pending_key);if(!object)throw new HttpError(410,'The pending photo has expired.');
      await env.PHOTOS.put(publicKey,object.body,{httpMetadata:{contentType:'image/jpeg',cacheControl:'public, max-age=300, must-revalidate'}});
      const primed=await (deps.fetcher||fetch)(`${publicPhotoOrigin(env)}/${publicKey}`);
      const primedOk=primed.ok&&primed.headers.get('Content-Type')?.split(';')[0]==='image/jpeg';
      // Read the complete bounded derivative so the cache fetch is not cancelled early.
      if(primedOk)await boundedBody(new Request('https://image.internal',{method:'POST',body:primed.body,duplex:'half'} as RequestInit),MAX_OUTPUT_BYTES);
      else await primed.body?.cancel().catch(()=>{});
      if([403,451].includes(primed.status))await db(env).prepare("UPDATE photos SET status='blocked',review_reason='Image CDN blocked this image. Review the Cloudflare notification and incident runbook.' WHERE id=?").bind(id).run();
      if(!primedOk)throw new HttpError(503,'The image CDN did not accept this photo. It has not been published.');
      const published=await db(env).prepare("UPDATE photos SET status='approved',published_at=?,review_reason=?,pending_key=NULL WHERE id=? AND status='processing' AND reviewed_by=?").bind(Date.now(),reason,id,session.user.id).run();
      if(published.meta.changes!==1)throw new HttpError(409,'Photo state changed during publication.');
    }catch(error){
      await env.PHOTOS.delete(publicKey).catch(()=>{});
      await purgePhoto(publicKey,env,deps).then(()=>db(env).prepare('DELETE FROM photo_cleanup WHERE object_key=?').bind(publicKey).run()).catch(()=>{});
      await db(env).prepare("UPDATE photos SET status='pending',public_key=NULL WHERE id=? AND status='processing' AND reviewed_by=?").bind(id,session.user.id).run();
      throw error;
    }
    await db(env).prepare('DELETE FROM photo_cleanup WHERE object_key=?').bind(publicKey).run();
    await env.UPLOADS.delete(photo.pending_key).catch(()=>{});
    await event(env,session.user.id,'approve',reason,id);
    return json({ok:true,status:'approved'});
  }
  if(action==='hold'){
    if(!env.EVIDENCE)throw new HttpError(503,'Private evidence preservation is unavailable.');
    const proposed=photo.evidence_key||`cases/${id}/${crypto.randomUUID()}.jpg`;
    // Reserve one key and hide first; concurrent holds cannot create untracked copies.
    await db(env).prepare("UPDATE photos SET evidence_key=COALESCE(evidence_key,?),legal_hold=1,status='blocked',review_reason=? WHERE id=?").bind(proposed,reason,id).run();
    const {evidence_key:key}=await db(env).prepare('SELECT evidence_key FROM photos WHERE id=?').bind(id).first();
    if(!await env.EVIDENCE.head(key)){
      const source=photo.public_key?await env.PHOTOS.get(photo.public_key):photo.pending_key?await env.UPLOADS.get(photo.pending_key):null;
      if(source)await env.EVIDENCE.put(key,source.body,{httpMetadata:{contentType:'image/jpeg',cacheControl:'no-store'}});
      else if(!await env.EVIDENCE.head(key))throw new HttpError(410,'No stored image remains to preserve. Record and investigate the report.');
    }
    await db(env).prepare("UPDATE photos SET status='blocked',legal_hold=1,evidence_key=?,reviewed_by=?,reviewed_at=?,review_reason=? WHERE id=?").bind(key,session.user.id,Date.now(),reason,id).run();
    if(photo.pending_key)await env.UPLOADS.delete(photo.pending_key);
    if(photo.public_key){await removePublicCopy(photo.public_key,env,deps);}
    await event(env,session.user.id,'hold',reason,id);
    return json({ok:true,status:'blocked',message:'A copy is held in private evidence storage. Public copies have been removed.'});
  }
  if(!['reject','remove'].includes(action))throw new HttpError(404,'Moderation action not found.');
  if(action==='reject'&&!['pending','rejected'].includes(photo.status))throw new HttpError(409,'Only pending photos can be rejected.');
  const status=action==='reject'?'rejected':'removed';
  // Hide first. File requests always check D1, so cached CDN bytes cannot bypass removal.
  await db(env).prepare('UPDATE photos SET status=?,review_reason=?,reviewed_by=?,reviewed_at=? WHERE id=?').bind(status,reason,session.user.id,Date.now(),id).run();
  if(photo.pending_key)await env.UPLOADS.delete(photo.pending_key);
  if(photo.public_key){await removePublicCopy(photo.public_key,env,deps);}
  await event(env,session.user.id,action,reason,id);
  return json({ok:true,status});
}
export async function resolveReport(request:Request,env:Env,id:string) {
  const session=await requireModerator(request,env);sameOrigin(request,env,session);const body=await readJson(request);const resolution=text(body.resolution,5,1000,'a resolution');
  const result=await db(env).prepare('UPDATE reports SET resolved_at=?,resolved_by=?,resolution=? WHERE id=? AND resolved_at IS NULL').bind(Date.now(),session.user.id,resolution,id).run();
  if(result.meta.changes!==1)throw new HttpError(404,'Unresolved report not found.');return json({ok:true});
}
export async function disableUser(request:Request,env:Env,id:string) {
  const session=await requireModerator(request,env);sameOrigin(request,env,session);const body=await readJson(request);const reason=text(body.reason,5,1000,'a suspension reason');
  if(id===session.user.id)throw new HttpError(400,'You cannot disable your own moderator account.');
  const result=await db(env).prepare('UPDATE users SET disabled=1 WHERE id=?').bind(id).run();if(result.meta.changes!==1)throw new HttpError(404,'Account not found.');
  await db(env).prepare('DELETE FROM sessions WHERE user_id=?').bind(id).run();await event(env,session.user.id,'disable-account',reason,null,id);return json({ok:true});
}
export async function removePublicCopy(key:string,env:Env,deps:Dependencies={}) {
  await db(env).prepare('INSERT OR IGNORE INTO photo_cleanup (object_key,created_at) VALUES (?,?)').bind(key,Date.now()).run();
  await env.PHOTOS.delete(key);await purgePhoto(key,env,deps);
  await db(env).prepare('DELETE FROM photo_cleanup WHERE object_key=?').bind(key).run();
}
export async function cleanup(env:Env,deps:Dependencies={}) {
  if(!env.COMMUNITY_DB)return;const now=Date.now();
  const {results:stale}=await db(env).prepare("SELECT id,public_key,pending_key FROM photos WHERE status='processing' AND COALESCE(reviewed_at,created_at)<? LIMIT 10").bind(now-3600_000).all();
  for(const photo of stale){
    await db(env).prepare("UPDATE photos SET status=CASE WHEN pending_key IS NULL THEN 'failed' ELSE 'pending' END,public_key=NULL WHERE id=? AND status='processing'").bind(photo.id).run();
    if(photo.public_key)await db(env).prepare('INSERT OR IGNORE INTO photo_cleanup (object_key,created_at) VALUES (?,?)').bind(photo.public_key,now-3600_000).run();
  }
  const {results:orphans}=await db(env).prepare('SELECT object_key FROM photo_cleanup WHERE created_at<? ORDER BY created_at LIMIT 10').bind(now-900_000).all();
  for(const object of orphans){
    const active=await db(env).prepare("SELECT id FROM photos WHERE public_key=? AND status='approved'").bind(object.object_key).first();
    if(active)await db(env).prepare('DELETE FROM photo_cleanup WHERE object_key=?').bind(object.object_key).run();
    else await removePublicCopy(object.object_key,env,deps).catch(()=>{});
  }
  // Bounded work per invocation. Never expire preserved evidence or incident records.
  const {results}=await db(env).prepare("SELECT id,pending_key FROM photos WHERE status IN ('pending','failed','processing') AND legal_hold=0 AND created_at<? ORDER BY created_at LIMIT 50").bind(now-7*86400_000).all();
  for(const photo of results){if(photo.pending_key&&env.UPLOADS)await env.UPLOADS.delete(photo.pending_key);await db(env).prepare("UPDATE photos SET status='expired',pending_key=NULL WHERE id=? AND legal_hold=0 AND status IN ('pending','failed','processing')").bind(photo.id).run();}
  await db(env).batch([
    db(env).prepare('DELETE FROM oauth_requests WHERE expires_at<?').bind(now),
    db(env).prepare('DELETE FROM sessions WHERE expires_at<?').bind(now),
    db(env).prepare('DELETE FROM upload_attempts WHERE created_at<?').bind(now-2*86400_000),
  ]);
}
