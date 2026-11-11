import type { Context, Dependencies, Env } from './types.ts';
import { finishGoogle, logout, sessionFor, startGoogle } from './auth.ts';
import { communityEnabled, publicConfig } from './config.ts';
import { HttpError, json } from './http.ts';
import { listPhotos, ownPhotos, photoFile, removeOwnPhoto, reportPhoto, uploadPhoto } from './photos.ts';
import { disableUser, moderatePhoto, moderationQueue, resolveReport } from './moderation.ts';
export async function communityApi(request:Request,env:Env,ctx?:Context,deps:Dependencies={}) {
  const path=new URL(request.url).pathname;const method=request.method;
  try {
    if(path==='/api/community/config'&&method==='GET')return json(publicConfig(env));
    if(!communityEnabled(env))return json({error:'Community features are not available.'},404);
    if(path==='/api/session'&&method==='GET'){
      const session=await sessionFor(request,env,false);
      return json({user:session?{id:session.user.id,displayName:session.user.display_name,moderator:session.user.role==='moderator'}:null,csrfToken:session?.csrf||null,...publicConfig(env)});
    }
    if(path==='/api/auth/google/start'&&method==='POST')return await startGoogle(request,env,deps);
    if(path==='/api/auth/google/callback'&&method==='GET')return await finishGoogle(request,env,deps);
    if(path==='/api/auth/logout'&&method==='POST')return await logout(request,env);
    if(path==='/api/uploads'&&method==='POST')return await uploadPhoto(request,env,deps);
    if(path==='/api/account/photos'&&method==='GET')return await ownPhotos(request,env);
    if(path==='/api/moderation'&&method==='GET')return await moderationQueue(request,env);
    let match=path.match(/^\/api\/photos\/([a-f0-9-]{36})$/);
    if(match&&method==='DELETE')return await removeOwnPhoto(request,env,match[1],deps);
    match=path.match(/^\/api\/components\/([a-z0-9-]+)\/photos$/);
    if(match&&method==='GET')return await listPhotos(request,env,match[1]);
    match=path.match(/^\/api\/photos\/([a-f0-9-]{36})\/(file|preview|reports)$/);
    if(match&&['file','preview'].includes(match[2])&&['GET','HEAD'].includes(method))return await photoFile(request,env,match[1],match[2]==='preview',deps,ctx);
    if(match&&match[2]==='reports'&&method==='POST')return await reportPhoto(request,env,match[1],deps);
    match=path.match(/^\/api\/moderation\/photos\/([a-f0-9-]{36})\/(approve|reject|remove|hold)$/);
    if(match&&method==='POST')return await moderatePhoto(request,env,match[1],match[2],deps);
    match=path.match(/^\/api\/moderation\/reports\/([a-f0-9-]{36})\/resolve$/);
    if(match&&method==='POST')return await resolveReport(request,env,match[1]);
    match=path.match(/^\/api\/moderation\/users\/([a-f0-9-]{36})\/disable$/);
    if(match&&method==='POST')return await disableUser(request,env,match[1]);
    return json({error:'API endpoint not found'},404);
  }catch(error){
    if(path==='/api/auth/google/callback')return new Response(null,{status:303,headers:{Location:'/account/?signIn=failed','Cache-Control':'no-store','Referrer-Policy':'no-referrer','Set-Cookie':'__Host-vg_oauth=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0'}});
    if(error instanceof HttpError)return json({error:error.message},error.status);
    // Never log request bodies, OAuth codes, cookies, reports, photos or provider errors.
    console.error('Community request failed',{path,kind:error instanceof Error?error.name:'Error'});
    return json({error:'This action could not be completed. Please try again later.'},503);
  }
}
