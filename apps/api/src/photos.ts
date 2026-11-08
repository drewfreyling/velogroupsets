import type { Context, Dependencies, Env, Session } from './types.ts';
import { sessionFor } from './auth.ts';
import { boundedBody, db, HttpError, json, sameOrigin, text, readJson } from './http.ts';
import { componentFor } from './catalogue.ts';
import { sanitizeImage } from './images.ts';
import { legalReady, publicPhotoOrigin, uploadsReady } from './config.ts';
import { turnstile } from './security.ts';
import { removePublicCopy } from './moderation.ts';
import { MAX_STORED_PHOTOS, MAX_UPLOAD_BYTES, POLICY_VERSION, REPORT_REASONS, SITE_DAILY_LIMIT, USER_DAILY_LIMIT } from '../../../packages/shared/community.ts';
const publicFields='p.id,p.component_id,p.caption,p.alt_text,p.width,p.height,p.created_at,u.display_name';
export function publicPhoto(row:any) {return {id:row.id,componentId:row.component_id,caption:row.caption,alt:row.alt_text,width:row.width,height:row.height,createdAt:row.created_at,contributor:row.display_name,imageUrl:`/api/photos/${row.id}/file`};}
export async function listPhotos(request:Request,env:Env,id:string) {
  const component=componentFor(id);
  if(!env.COMMUNITY_DB)return json({photos:[],nextCursor:null});
  const url=new URL(request.url);let cursor:{time:number;id:string}|null=null;
  if(url.searchParams.has('cursor')){
    try{cursor=JSON.parse(atob(url.searchParams.get('cursor')!));if(!cursor||!Number.isSafeInteger(cursor.time)||typeof cursor.id!=='string'||cursor.id.length>64)throw Error();}
    catch{throw new HttpError(400,'Invalid photo cursor.');}
  }
  const query=`SELECT ${publicFields} FROM photos p JOIN users u ON p.user_id=u.id WHERE p.component_id=? AND p.status='approved' ${cursor?'AND (p.created_at<? OR (p.created_at=? AND p.id<?))':''} ORDER BY p.created_at DESC,p.id DESC LIMIT 25`;
  const params:any[]=[component.id];if(cursor)params.push(cursor.time,cursor.time,cursor.id);
  const {results}=await db(env).prepare(query).bind(...params).all();const rows=results.slice(0,24);const last=rows.at(-1);
  return json({photos:rows.map(publicPhoto),nextCursor:results.length>24&&last?btoa(JSON.stringify({time:last.created_at,id:last.id})):null});
}
let activeUploads=0;
export async function uploadPhoto(request:Request,env:Env,deps:Dependencies={}) {
  const session=(await sessionFor(request,env))!;sameOrigin(request,env,session);
  if(!uploadsReady(env))throw new HttpError(503,'Uploads are not open yet.');
  if(activeUploads>=2)throw new HttpError(429,'Image processing is busy. Please try again shortly.');
  activeUploads++;
  try{return await processUpload(request,env,deps,session);}finally{activeUploads--;}
}
async function processUpload(request:Request,env:Env,deps:Dependencies,session:Session) {
  if(!request.headers.get('Content-Type')?.startsWith('multipart/form-data;'))throw new HttpError(415,'Send a photo using the upload form.');
  // Bound the multipart envelope before asking the runtime to parse it.
  const body=await boundedBody(request,MAX_UPLOAD_BYTES+32_768);
  let form:FormData;try{form=await new Response(body,{headers:{'Content-Type':request.headers.get('Content-Type')!}}).formData();}catch{throw new HttpError(400,'Invalid upload form.');}
  if(form.get('accepted_licence')!=='on'||form.get('policy_version')!==POLICY_VERSION)throw new HttpError(400,'Agree to the current upload licence before submitting.');
  const component=componentFor(form.get('component_id'));
  const caption=text(form.get('caption'),1,500,'a caption');const alt=text(form.get('alt_text'),1,250,'an image description');
  const file=form.get('photo');if(!(file instanceof File))throw new HttpError(400,'Choose a photo.');
  if(file.size<1||file.size>MAX_UPLOAD_BYTES)throw new HttpError(413,'Choose a photo no larger than 5 MiB.');
  await turnstile(form.get('turnstile_token'),'upload-photo',env,deps);
  const id=crypto.randomUUID(),now=Date.now(),startOfDay=now-now%86400_000;
  // A single SQLite write reserves both limits atomically, including concurrent attempts.
  const reserved=await db(env).prepare('INSERT INTO upload_attempts (id,user_id,created_at) SELECT ?,?,? WHERE (SELECT COUNT(*) FROM upload_attempts WHERE user_id=? AND created_at>=?)<? AND (SELECT COUNT(*) FROM upload_attempts WHERE created_at>=?)<?').bind(id,session.user.id,now,session.user.id,startOfDay,USER_DAILY_LIMIT,startOfDay,SITE_DAILY_LIMIT).run();
  if(reserved.meta.changes!==1)throw new HttpError(429,'The daily upload limit has been reached. Try another day.');
  const key=`pending/${id}.jpg`;
  const storage=await db(env).prepare("INSERT INTO photos (id,user_id,component_id,caption,alt_text,status,pending_key,policy_version,created_at) SELECT ?,?,?,?,?,'processing',?,?,? WHERE (SELECT COUNT(*) FROM photos WHERE status IN ('processing','pending','approved','blocked') OR legal_hold=1)<?").bind(id,session.user.id,component.id,caption,alt,key,POLICY_VERSION,now,MAX_STORED_PHOTOS).run();
  if(storage.meta.changes!==1)throw new HttpError(507,'The site’s current photo storage allowance has been reached. Please contact the operator.');
  try {
    const clean=await sanitizeImage(file,env);
    await env.UPLOADS.put(key,clean.bytes,{httpMetadata:{contentType:'image/jpeg',cacheControl:'no-store'}});
    const committed=await db(env).batch([
      db(env).prepare("UPDATE photos SET status='pending',width=?,height=?,bytes=? WHERE id=? AND status='processing'").bind(clean.width,clean.height,clean.bytes.length,id),
      db(env).prepare("INSERT INTO consents (id,user_id,action,policy_version,accepted_at,photo_id) SELECT ?,?,'upload',?,?,? WHERE EXISTS (SELECT 1 FROM photos WHERE id=? AND status='pending')").bind(crypto.randomUUID(),session.user.id,POLICY_VERSION,now,id,id),
    ]);
    if(committed[0].meta.changes!==1)throw new HttpError(409,'This upload was cancelled.');
    return json({id,status:'pending',message:'Your photo is awaiting moderator review.'},201);
  } catch(error) {
    await env.UPLOADS.delete(key).catch(()=>{});
    await db(env).prepare("UPDATE photos SET status='failed',pending_key=NULL WHERE id=? AND status='processing'").bind(id).run();
    throw error;
  }
}
export async function photoFile(request:Request,env:Env,id:string,preview=false,deps:Dependencies={},ctx?:Context) {
  const viewer=preview?await sessionFor(request,env):null;
  const photo=await db(env).prepare('SELECT id,user_id,status,pending_key,public_key FROM photos WHERE id=?').bind(id).first();
  if(!photo)throw new HttpError(404,'Photo not found.');
  let response:Response;
  if(preview){
    const session=viewer!;
    if(session.user.id!==photo.user_id&&session.user.role!=='moderator')throw new HttpError(404,'Photo not found.');
    if(!['pending','processing'].includes(photo.status)||!photo.pending_key)throw new HttpError(404,'Preview not available.');
    const object=await env.UPLOADS?.get(photo.pending_key);if(!object)throw new HttpError(404,'Preview not available.');response=new Response(object.body);
  } else {
    if(photo.status!=='approved'||!photo.public_key||!publicPhotoOrigin(env))throw new HttpError(404,'Photo not found.');
    // Fetch through the zone's R2 custom-domain cache, where CSAM scanning runs.
    response=await (deps.fetcher||fetch)(`${publicPhotoOrigin(env)}/${photo.public_key}`);
    if(!response.ok){
      if([403,451].includes(response.status)){
        const blocked=db(env).prepare("UPDATE photos SET status='blocked',review_reason='Image delivery was blocked by the image CDN; operator review required.' WHERE id=? AND status='approved'").bind(id).run();
        if(ctx)ctx.waitUntil(blocked);else await blocked;
      }
      await response.body?.cancel().catch(()=>{});throw new HttpError(404,'Photo is unavailable.');
    }
    if(response.headers.get('Content-Type')?.split(';')[0]!=='image/jpeg'){await response.body?.cancel();throw new HttpError(502,'Photo delivery failed.');}
  }
  if(request.method==='HEAD')await response.body?.cancel().catch(()=>{});
  return new Response(request.method==='HEAD'?null:response.body,{headers:{'Content-Type':'image/jpeg','Content-Disposition':'inline; filename="component-photo.jpg"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox",'Cross-Origin-Resource-Policy':'same-origin','Referrer-Policy':'no-referrer'}});
}
export async function ownPhotos(request:Request,env:Env) {
  const session=(await sessionFor(request,env))!;
  const {results}=await db(env).prepare('SELECT id,component_id,caption,alt_text,status,created_at FROM photos WHERE user_id=? ORDER BY created_at DESC,id DESC LIMIT 50').bind(session.user.id).all();
  return json({photos:results.map((p:any)=>({id:p.id,componentModel:componentFor(p.component_id).model,componentUrl:componentFor(p.component_id).url,componentId:p.component_id,caption:p.caption,alt:p.alt_text,status:p.status,createdAt:p.created_at,reason:['rejected','removed','blocked'].includes(p.status)?'This photo is not public. Contact the operator if you need a review of the decision.':null,previewUrl:p.status==='pending'?`/api/photos/${p.id}/preview`:null}))});
}
export async function reportPhoto(request:Request,env:Env,id:string,deps:Dependencies={}) {
  sameOrigin(request,env);if(!env.TURNSTILE_SECRET||!legalReady(env))throw new HttpError(503,'Use the contact details in the copyright policy to report this photo.');
  const body=await readJson(request);
  if(!REPORT_REASONS.includes(body.reason))throw new HttpError(400,'Choose a report reason.');
  const details=text(body.details,5,2000,'report details');let email:string|null=null;
  if(body.contact_email){email=text(body.contact_email,3,254,'a contact email');if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new HttpError(400,'Enter a valid contact email.');}
  const photo=await db(env).prepare("SELECT id FROM photos WHERE id=? AND status='approved'").bind(id).first();if(!photo)throw new HttpError(404,'Photo not found.');
  await turnstile(body.turnstile_token,'report-photo',env,deps);
  const now=Date.now(),start=now-now%86400_000;
  const result=await db(env).prepare('INSERT INTO reports (id,photo_id,reason,details,contact_email,created_at) SELECT ?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM reports WHERE photo_id=? AND created_at>=?)<20 AND (SELECT COUNT(*) FROM reports WHERE created_at>=?)<500').bind(crypto.randomUUID(),id,body.reason,details,email,now,id,start,start).run();
  if(result.meta.changes!==1)throw new HttpError(429,'The report limit has been reached. Please use the monitored contact email.');
  return json({ok:true,message:'Your report is in the private moderation queue.'},201);
}

export async function removeOwnPhoto(request:Request,env:Env,id:string,deps:Dependencies={}) {
  const session=(await sessionFor(request,env))!;sameOrigin(request,env,session);
  const photo=await db(env).prepare('SELECT user_id,pending_key,public_key FROM photos WHERE id=?').bind(id).first();
  if(!photo||photo.user_id!==session.user.id)throw new HttpError(404,'Photo not found.');
  await db(env).prepare("UPDATE photos SET status='removed',reviewed_at=? WHERE id=? AND user_id=?").bind(Date.now(),id,session.user.id).run();
  if(photo.pending_key)await env.UPLOADS.delete(photo.pending_key);
  if(photo.public_key)await removePublicCopy(photo.public_key,env,deps);
  return json({ok:true,message:'Your photo has been removed from public display. A private copy may be retained only where needed for an investigation or legal obligation.'});
}
