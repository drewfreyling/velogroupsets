import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { generateKeyPair, exportJWK, createLocalJWKSet, SignJWT } from 'jose';
import { communityRuntime } from './helpers/community-runtime.mjs';
import { communityApi } from '../apps/api/src/community.ts';
import { verifyGoogleToken } from '../apps/api/src/auth.ts';
import { hash, random } from '../apps/api/src/http.ts';
import { cleanup } from '../apps/api/src/moderation.ts';
import { boundedBody } from '../apps/api/src/http.ts';
import { stripJpegMetadata } from '../apps/api/src/images.ts';
import { POLICY_VERSION, MAX_UPLOAD_BYTES } from '../packages/shared/community.ts';
let runtime,env,fixture,keys,owner,other,moderator;
let failPurge=false,cdnStatus=200,purgeCalls=[];
const deps={fetcher:async (input,options={})=>{
  const url=new URL(typeof input==='string'?input:input.url);
  if(url.hostname==='challenges.cloudflare.com'){
    const token=new URLSearchParams(options.body).get('response')||'';
    return Response.json({success:token!=='bad',hostname:token==='wrong-host'?'evil.example':'127.0.0.1',action:token.startsWith('report')?'report-photo':token.startsWith('signin')?'sign-in':'upload-photo'});
  }
  if(url.hostname==='api.cloudflare.com'){purgeCalls.push(JSON.parse(options.body));return Response.json({success:!failPurge},{status:failPurge?503:200});}
  if(url.hostname==='images.example.test'){
    if(cdnStatus!==200)return new Response('blocked',{status:cdnStatus});
    const photo=await env.PHOTOS.get(url.pathname.slice(1));return photo?new Response(photo.body,{headers:{'Content-Type':'image/jpeg'}}):new Response('missing',{status:404});
  }
  throw new Error('Unexpected test network destination: '+url.origin);
}};
before(async()=>{
  runtime=await communityRuntime();env=runtime.env;
  fixture=await sharp({create:{width:64,height:48,channels:3,background:'#3dcfc2'}}).jpeg().withMetadata().withExif({IFD0:{Artist:'PRIVATE_TEST_AUTHOR',ImageDescription:'GPS=0,0; synthetic test metadata'}}).toBuffer();
  keys=await generateKeyPair('RS256',{modulusLength:2048});
});
after(async()=>{await runtime?.close();});
async function user(role='member'){
  const id=crypto.randomUUID(),token=random(),csrf=random(),email=role==='moderator'?'moderator@example.test':`${id}@example.test`;
  await env.COMMUNITY_DB.prepare('INSERT INTO users (id,google_sub,email,display_name,role,created_at) VALUES (?,?,?,?,?,?)').bind(id,id,email,role==='moderator'?'Test moderator':'Test contributor',role,Date.now()).run();
  await env.COMMUNITY_DB.prepare('INSERT INTO sessions (token_hash,user_id,csrf_token,created_at,expires_at) VALUES (?,?,?,?,?)').bind(await hash(token),id,csrf,Date.now(),Date.now()+86400_000).run();
  return {id,token,csrf,email};
}
beforeEach(async()=>{
  failPurge=false;cdnStatus=200;purgeCalls=[];
  for(const table of ['moderation_events','reports','consents','upload_attempts','sessions','oauth_requests','photo_cleanup','photos','users'])await env.COMMUNITY_DB.prepare(`DELETE FROM ${table}`).run();
  for(const bucket of [env.UPLOADS,env.PHOTOS,env.EVIDENCE]){const {objects}=await bucket.list();for(const o of objects)await bucket.delete(o.key);}
  owner=await user();other=await user();moderator=await user('moderator');
});
async function call(path,{method='GET',body,as,origin=env.SITE_ORIGIN,csrf=true,headers={}}={},overrides={}) {
  const h=new Headers(headers);if(as)h.set('Cookie',`__Host-vg_session=${as.token}`);
  if(method!=='GET'&&method!=='HEAD'){if(origin)h.set('Origin',origin);if(as&&csrf)h.set('X-CSRF-Token',as.csrf);}
  if(body && !(body instanceof FormData)){h.set('Content-Type','application/json');body=JSON.stringify(body);}
  return communityApi(new Request(env.SITE_ORIGIN+path,{method,headers:h,body}),{...env,...overrides},undefined,deps);
}
function uploadForm({component='shimano-rd-r7000-gs',licence='on',version=POLICY_VERSION,bytes=fixture,type='image/jpeg',token='upload-proof'}={}){
  const form=new FormData();form.set('component_id',component);form.set('caption','Synthetic bicycle-component test photo');form.set('alt_text','A solid teal rectangle used only for automated tests.');form.set('accepted_licence',licence);form.set('policy_version',version);form.set('turnstile_token',token);form.set('photo',new File([bytes],'private-user-filename.jpg',{type}));return form;
}
async function upload(options={},as=owner,overrides={}){return call('/api/uploads',{method:'POST',as,body:uploadForm(options)},overrides);}
async function pending(){const response=await upload();assert.equal(response.status,201,await response.clone().text());return (await response.json()).id;}
async function moderate(id,action,as=moderator,reason='Synthetic test review decision') {return call(`/api/moderation/photos/${id}/${action}`,{method:'POST',as,body:{reason}});}
async function localKeys(){const jwk=await exportJWK(keys.publicKey);return createLocalJWKSet({keys:[{...jwk,alg:'RS256',kid:'test-key'}]});}
async function token(claims={}){return new SignJWT({sub:'google-test-sub',email:'google-test@example.test',email_verified:true,nonce:'expected-nonce',...claims}).setProtectedHeader({alg:'RS256',kid:'test-key'}).setIssuer(claims.iss||'https://accounts.google.com').setAudience(claims.aud||env.GOOGLE_CLIENT_ID).setIssuedAt().setExpirationTime('5m').sign(keys.privateKey);}

test('uploads require authentication, origin, CSRF, current licence and a known component',async()=>{
  assert.equal((await call('/api/uploads',{method:'POST',body:uploadForm()})).status,401);
  assert.equal((await call('/api/uploads',{method:'POST',as:owner,origin:'https://evil.example',body:uploadForm()})).status,403);
  assert.equal((await call('/api/uploads',{method:'POST',as:owner,csrf:false,body:uploadForm()})).status,403);
  assert.equal((await upload({licence:'off'})).status,400);
  assert.equal((await upload({version:'old-policy'})).status,400);
  assert.equal((await upload({component:'invented-component'})).status,404);
  assert.equal((await upload({token:'wrong-host'})).status,400);
  assert.equal((await upload({token:'report-proof'})).status,400);
  assert.equal((await env.UPLOADS.list()).objects.length,0);
});

test('real local image processing strips metadata and keeps pending photos private',async()=>{
  assert.ok((await sharp(fixture).metadata()).exif);
  const id=await pending();
  const row=await env.COMMUNITY_DB.prepare('SELECT * FROM photos WHERE id=?').bind(id).first();assert.equal(row.status,'pending');
  const object=await env.UPLOADS.get(row.pending_key);const bytes=Buffer.from(await object.arrayBuffer());
  assert.notDeepEqual(bytes,fixture);assert.equal(bytes.includes(Buffer.from('PRIVATE_TEST_AUTHOR')),false);assert.equal(bytes.includes(Buffer.from('GPS=0,0')),false);
  const metadata=await sharp(bytes).metadata();assert.equal(metadata.exif,undefined);assert.equal(metadata.icc,undefined);assert.ok(metadata.width<=2000&&metadata.height<=2000);
  assert.equal((await env.PHOTOS.list()).objects.length,0);
  assert.equal((await call(`/api/photos/${id}/file`)).status,404);
  assert.equal((await call(`/api/photos/${id}/preview`,{as:other})).status,404);
  const preview=await call(`/api/photos/${id}/preview`,{as:owner});assert.equal(preview.status,200);assert.equal(preview.headers.get('Cache-Control'),'no-store');
  assert.deepEqual((await (await call('/api/components/shimano-rd-r7000-gs/photos')).json()).photos,[]);
  const consent=await env.COMMUNITY_DB.prepare("SELECT policy_version FROM consents WHERE action='upload' AND photo_id=?").bind(id).first();assert.equal(consent.policy_version,POLICY_VERSION);
});

test('active content, forged MIME, malformed images and oversized bodies are rejected',async()=>{
  assert.equal((await upload({bytes:Buffer.from('<svg onload="alert(1)"></svg>'),type:'image/png'})).status,415);
  assert.equal((await upload({type:'image/png'})).status,415);
  assert.equal((await upload({bytes:Buffer.from([255,216,255,0,0,1])})).status,422);
  assert.equal((await upload({bytes:Buffer.alloc(MAX_UPLOAD_BYTES+1)})).status,413);
  const oversized=new Request('https://example.test',{method:'POST',body:new ReadableStream({start(c){c.enqueue(new Uint8Array(1024));c.enqueue(new Uint8Array(1024));c.close();}}),duplex:'half'});
  await assert.rejects(()=>boundedBody(oversized,1500),error=>error.status===413);
  assert.equal((await env.UPLOADS.list()).objects.length,0);
});

test('readiness gates prevent uploads when legal contact, CSAM, purge or private evidence are missing',async()=>{
  for(const overrides of [{CONTACT_READY:'false'},{CSAM_SCANNING_CONFIRMED:'false'},{PHOTO_CACHE_PURGE_TOKEN:''},{EVIDENCE:undefined},{PHOTOS_BASE_URL:'https://evil.example'}]){
    assert.equal((await upload({},owner,overrides)).status,503);
    const config=await (await call('/api/community/config',{},overrides)).json();assert.equal(config.uploadsAvailable,false);
  }
});

test('only moderators publish and removal blocks delivery before cache removal succeeds',async()=>{
  const id=await pending();assert.equal((await moderate(id,'approve',owner)).status,403);
  const approved=await moderate(id,'approve');assert.equal(approved.status,200,await approved.clone().text());
  const listing=await (await call('/api/components/shimano-rd-r7000-gs/photos')).json();assert.equal(listing.photos.length,1);assert.equal(listing.photos[0].id,id);assert.equal(listing.photos[0].public_key,undefined);assert.equal(listing.photos[0].email,undefined);
  const image=await call(`/api/photos/${id}/file`);assert.equal(image.status,200);assert.equal(image.headers.get('Content-Type'),'image/jpeg');assert.equal(image.headers.get('Cache-Control'),'no-store');
  assert.equal((await env.UPLOADS.list()).objects.length,0);
  failPurge=true;assert.equal((await moderate(id,'remove')).status,503);
  assert.equal((await call(`/api/photos/${id}/file`)).status,404);assert.equal((await env.PHOTOS.list()).objects.length,0);
  assert.equal((await env.COMMUNITY_DB.prepare('SELECT COUNT(*) AS count FROM photo_cleanup').first()).count,1);
  await env.COMMUNITY_DB.prepare('UPDATE photo_cleanup SET created_at=?').bind(Date.now()-3600_000).run();failPurge=false;await cleanup(env,deps);
  assert.equal((await env.COMMUNITY_DB.prepare('SELECT COUNT(*) AS count FROM photo_cleanup').first()).count,0);assert.ok(purgeCalls.length>=2);
});

test('publication failures remain private and CDN blocks never fall back to raw R2 delivery',async()=>{
  const id=await pending();cdnStatus=503;assert.equal((await moderate(id,'approve')).status,503);assert.equal((await call(`/api/photos/${id}/file`)).status,404);
  cdnStatus=200;assert.equal((await moderate(id,'approve')).status,200);
  cdnStatus=451;assert.equal((await call(`/api/photos/${id}/file`)).status,404);
  assert.equal((await env.COMMUNITY_DB.prepare('SELECT status FROM photos WHERE id=?').bind(id).first()).status,'blocked');
});

test('anonymous reports stay private and evidence holds have no public image route',async()=>{
  const id=await pending();assert.equal((await moderate(id,'approve')).status,200);
  const report=await call(`/api/photos/${id}/reports`,{method:'POST',body:{reason:'copyright',details:'Synthetic rights-holder test report.',contact_email:'reporter@example.test',turnstile_token:'report-proof'}});assert.equal(report.status,201);
  assert.equal((await call('/api/moderation',{as:owner})).status,403);
  const queue=await (await call('/api/moderation',{as:moderator})).json();assert.equal(queue.reports[0].contact_email,'reporter@example.test');
  assert.equal((await moderate(id,'hold')).status,200);
  assert.equal((await env.EVIDENCE.list()).objects.length,1);assert.equal((await env.PHOTOS.list()).objects.length,0);assert.equal((await call(`/api/photos/${id}/file`)).status,404);
  const key=(await env.EVIDENCE.list()).objects[0].key;assert.equal((await call('/api/evidence/'+key,{as:owner})).status,404);
  const resolve=await call(`/api/moderation/reports/${queue.reports[0].id}/resolve`,{method:'POST',as:moderator,body:{resolution:'Handled under the synthetic test incident.'}});assert.equal(resolve.status,200);
});

test('Google tokens require valid signatures, issuer, audience, nonce and verified email',async()=>{
  const resolver=await localKeys();assert.equal((await verifyGoogleToken(await token(),env,'expected-nonce',resolver)).email,'google-test@example.test');
  for(const claims of [{nonce:'wrong'},{email_verified:false},{aud:'wrong-client'},{iss:'https://evil.example'}])await assert.rejects(()=>token(claims).then(t=>verifyGoogleToken(t,env,'expected-nonce',resolver)));
  const parts=(await token()).split('.');parts[2]=parts[2].slice(0,-8)+'AAAAAAAA';await assert.rejects(()=>verifyGoogleToken(parts.join('.'),env,'expected-nonce',resolver));
});

test('Google sign-in requires active current acceptance and binds PKCE, state and one-time sessions',async()=>{
  assert.equal((await call('/api/auth/google/start',{method:'POST',body:{policy_version:POLICY_VERSION,accepted_terms:false}})).status,400);
  const started=await call('/api/auth/google/start',{method:'POST',body:{policy_version:POLICY_VERSION,accepted_terms:true,turnstile_token:'signin-proof',display_name:'Chosen public alias',return_path:'https://evil.example'}});
  assert.equal(started.status,303);const provider=new URL(started.headers.get('Location'));assert.equal(provider.searchParams.get('code_challenge_method'),'S256');assert.equal(provider.searchParams.get('scope'),'openid email');
  assert.match(started.headers.get('Set-Cookie'),/Secure; HttpOnly; SameSite=Lax/);
  const state=provider.searchParams.get('state'),nonce=provider.searchParams.get('nonce');
  const signed=await token({nonce});let exchanged=false;
  const authDeps={googleKeys:await localKeys(),fetcher:async(url,options)=>{assert.equal(url,'https://oauth2.googleapis.com/token');const data=new URLSearchParams(options.body);assert.equal(data.get('redirect_uri'),env.SITE_ORIGIN+'/api/auth/google/callback');assert.equal(data.get('code_verifier').length,43);exchanged=true;return Response.json({id_token:signed});}};
  const callback=new Request(`${env.SITE_ORIGIN}/api/auth/google/callback?state=${state}&code=test-code`,{headers:{Cookie:`__Host-vg_oauth=${state}`}});
  const response=await communityApi(callback,env,undefined,authDeps);assert.equal(response.status,303);assert.equal(response.headers.get('Location'),'/account/');assert.ok(exchanged);
  const cookies=response.headers.getSetCookie();assert.ok(cookies.some(c=>c.startsWith('__Host-vg_session=')&&c.includes('HttpOnly')));
  const googleUser=await env.COMMUNITY_DB.prepare('SELECT * FROM users WHERE google_sub=?').bind('google-test-sub').first();assert.equal(googleUser.display_name,'Chosen public alias');
  const consent=await env.COMMUNITY_DB.prepare("SELECT * FROM consents WHERE user_id=? AND action='account'").bind(googleUser.id).first();assert.equal(consent.policy_version,POLICY_VERSION);
  const replay=await communityApi(callback,env,undefined,authDeps);assert.equal(replay.headers.get('Location'),'/account/?signIn=failed');
});

test('per-user and site upload quotas are atomic under concurrent requests',async()=>{
  const now=Date.now();
  for(let i=0;i<9;i++)await env.COMMUNITY_DB.prepare('INSERT INTO upload_attempts (id,user_id,created_at) VALUES (?,?,?)').bind(crypto.randomUUID(),owner.id,now).run();
  const responses=await Promise.all([upload({token:'upload-one'}),upload({token:'upload-two'})]);
  assert.deepEqual(responses.map(r=>r.status).sort(),[201,429]);
  assert.equal((await env.COMMUNITY_DB.prepare('SELECT COUNT(*) AS count FROM upload_attempts WHERE user_id=?').bind(owner.id).first()).count,10);
  await env.COMMUNITY_DB.prepare('DELETE FROM upload_attempts').run();
  for(let i=0;i<99;i++)await env.COMMUNITY_DB.prepare('INSERT INTO upload_attempts (id,user_id,created_at) VALUES (?,?,?)').bind(crypto.randomUUID(),moderator.id,now).run();
  const siteResponses=await Promise.all([upload({token:'upload-three'},owner),upload({token:'upload-four'},other)]);
  assert.deepEqual(siteResponses.map(r=>r.status).sort(),[201,429]);
});

test('pixel caps and animation rejection occur before storage',async()=>{
  const images={info:async()=>({format:'image/jpeg',width:5000,height:5000}),input:()=>{throw Error('Must not transform oversized images');}};
  assert.equal((await upload({},owner,{IMAGES:images})).status,422);
  const animatedWebP=Buffer.alloc(30);animatedWebP.write('RIFF');animatedWebP.write('WEBP',8);animatedWebP.write('VP8X',12);animatedWebP[20]=2;
  assert.equal((await upload({bytes:animatedWebP,type:'image/webp'})).status,415);
  const apng=Buffer.alloc(28);Buffer.from([137,80,78,71,13,10,26,10]).copy(apng);apng.writeUInt32BE(8,8);apng.write('acTL',12);
  assert.equal((await upload({bytes:apng,type:'image/png'})).status,415);
  assert.equal((await env.UPLOADS.list()).objects.length,0);
});

test('metadata removal handles progressive scans, trailing payloads and post-scan comments',async()=>{
  const progressive=await sharp(fixture).jpeg({progressive:true}).withMetadata().toBuffer();
  const secret=Buffer.from('PRIVATE_POST_SCAN_DATA');const comment=Buffer.alloc(secret.length+4);comment[0]=255;comment[1]=254;comment.writeUInt16BE(secret.length+2,2);secret.copy(comment,4);
  const dirty=Buffer.concat([progressive.subarray(0,-2),comment,Buffer.from([255,217]),Buffer.from('TRAILING_PRIVATE_PAYLOAD')]);
  const clean=Buffer.from(stripJpegMetadata(dirty));assert.equal(clean.includes(secret),false);assert.equal(clean.includes(Buffer.from('TRAILING_PRIVATE_PAYLOAD')),false);assert.equal((await sharp(clean).metadata()).exif,undefined);assert.equal((await sharp(clean).metadata()).width,64);
});

test('component aliases resolve to the pair and public pagination never exposes private fields',async()=>{
  const response=await upload({component:'shimano-st-r7000-l'});assert.equal(response.status,201);
  const id=(await response.json()).id;assert.equal((await env.COMMUNITY_DB.prepare('SELECT component_id FROM photos WHERE id=?').bind(id).first()).component_id,'shimano-st-r7000');
  const now=Date.now();
  for(let i=0;i<26;i++)await env.COMMUNITY_DB.prepare("INSERT INTO photos (id,user_id,component_id,caption,alt_text,status,policy_version,created_at) VALUES (?,?,?,?,?,?,?,?)").bind(crypto.randomUUID(),owner.id,'shimano-st-r7000',i===25?'PRIVATE_CAPTION':'Public test caption','Synthetic alt',i===25?'pending':'approved',POLICY_VERSION,now).run();
  const first=await (await call('/api/components/shimano-st-r7000-l/photos')).json();assert.equal(first.photos.length,24);assert.ok(first.nextCursor);
  const second=await (await call('/api/components/shimano-st-r7000/photos?cursor='+encodeURIComponent(first.nextCursor))).json();assert.equal(second.photos.length,1);
  assert.equal(new Set([...first.photos,...second.photos].map(p=>p.id)).size,25);assert.equal(JSON.stringify(first).includes('PRIVATE_CAPTION'),false);assert.equal(JSON.stringify(first).includes(owner.email),false);
  assert.equal((await call('/api/components/shimano-st-r7000/photos?cursor=bad')).status,400);
});

test('logout and suspension revoke server sessions, and private review reasons stay private',async()=>{
  const id=await pending();await moderate(id,'reject',moderator,'Private investigation contact reporter@example.test');
  const own=await (await call('/api/account/photos',{as:owner})).json();assert.equal(JSON.stringify(own).includes('reporter@example.test'),false);
  assert.equal((await call('/api/auth/logout',{method:'POST',as:owner,body:{}})).status,200);
  assert.equal((await upload()).status,401);
  assert.equal((await call(`/api/moderation/users/${other.id}/disable`,{method:'POST',as:moderator,body:{reason:'Synthetic repeated rule violation'}})).status,200);
  assert.equal((await upload({},other)).status,401);
});

test('expired private submissions and abandoned publication copies are cleaned up, evidence is retained',async()=>{
  const id=await pending();assert.equal((await moderate(id,'hold')).status,200);
  const held=(await env.EVIDENCE.list()).objects[0].key;
  const expiredId=await pending();await env.COMMUNITY_DB.prepare('UPDATE photos SET created_at=? WHERE id=?').bind(Date.now()-8*86400_000,expiredId).run();
  await env.PHOTOS.put('photos/orphan.jpg',fixture);await env.COMMUNITY_DB.prepare('INSERT INTO photo_cleanup (object_key,created_at) VALUES (?,?)').bind('photos/orphan.jpg',Date.now()-3600_000).run();
  await cleanup(env,deps);
  assert.equal((await env.COMMUNITY_DB.prepare('SELECT status FROM photos WHERE id=?').bind(expiredId).first()).status,'expired');assert.equal(await env.PHOTOS.get('photos/orphan.jpg'),null);assert.ok(await env.EVIDENCE.get(held));
});

test('the stored-photo ceiling prevents unbounded image storage and processing charges',async()=>{
  await env.COMMUNITY_DB.prepare("WITH RECURSIVE items(n) AS (VALUES(1) UNION ALL SELECT n+1 FROM items WHERE n<1000) INSERT INTO photos (id,user_id,component_id,caption,alt_text,status,policy_version,created_at) SELECT 'capacity-'||n,?,'shimano-rd-r7000-gs','Capacity fixture','Synthetic fixture','approved',?,? FROM items").bind(owner.id,POLICY_VERSION,Date.now()).run();
  const response=await upload();assert.equal(response.status,507);assert.equal((await env.UPLOADS.list()).objects.length,0);
});

test('owners can remove their own photos but cannot remove someone else’s submission',async()=>{
  const id=await pending();await moderate(id,'approve');
  assert.equal((await call(`/api/photos/${id}`,{method:'DELETE',as:other})).status,404);
  assert.equal((await call(`/api/photos/${id}`,{method:'DELETE',as:owner})).status,200);
  assert.equal((await call(`/api/photos/${id}/file`)).status,404);assert.equal((await env.PHOTOS.list()).objects.length,0);
});

test('removing a moderator allowlist entry immediately removes moderator privileges',async()=>{
  assert.equal((await call('/api/moderation',{as:moderator})).status,200);
  assert.equal((await call('/api/moderation',{as:moderator},{MODERATOR_EMAILS:''})).status,403);
});

test('concurrent preservation requests share one private evidence key',async()=>{
  const id=await pending();const responses=await Promise.all([moderate(id,'hold'),moderate(id,'hold')]);assert.ok(responses.every(r=>r.status===200));assert.equal((await env.EVIDENCE.list()).objects.length,1);
});

test('genuine PNG and WebP inputs are re-encoded as metadata-free JPEGs',async()=>{
  for(const type of ['png','webp']){
    const bytes=await sharp(fixture)[type]().withMetadata().toBuffer();
    const response=await upload({bytes,type:'image/'+type,token:'upload-'+type});assert.equal(response.status,201,await response.clone().text());
    const row=await env.COMMUNITY_DB.prepare('SELECT pending_key FROM photos WHERE id=?').bind((await response.json()).id).first();
    const object=await env.UPLOADS.get(row.pending_key);const output=Buffer.from(await object.arrayBuffer());assert.equal(output[0],255);assert.equal(output[1],216);assert.equal((await sharp(output).metadata()).format,'jpeg');assert.equal((await sharp(output).metadata()).exif,undefined);
  }
});


test('evidence preservation survives an interrupted publication with an absent public copy',async()=>{
  const id=await pending();
  await env.COMMUNITY_DB.prepare("UPDATE photos SET status='processing',public_key='photos/interrupted.jpg' WHERE id=?").bind(id).run();
  const response=await moderate(id,'hold');assert.equal(response.status,200,await response.clone().text());
  assert.equal((await call(`/api/photos/${id}/file`)).status,404);
  const row=await env.COMMUNITY_DB.prepare('SELECT evidence_key,legal_hold FROM photos WHERE id=?').bind(id).first();
  assert.equal(row.legal_hold,1);assert.ok(await env.EVIDENCE.get(row.evidence_key));assert.equal((await env.UPLOADS.list()).objects.length,0);
});
