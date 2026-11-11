import type { Env } from './types.ts';
import { MAX_UPLOAD_BYTES, POLICY_VERSION } from '../../../packages/shared/community.ts';
export function communityEnabled(env:Env) {
  return env.COMMUNITY_ENABLED !== 'false' && (env.ENVIRONMENT !== 'production' || env.COMMUNITY_ENABLED === 'true');
}
export function legalReady(env:Env) {
  return env.CONTACT_READY==='true' && Boolean(env.PUBLIC_SITE_OPERATOR?.trim()) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.PUBLIC_CONTACT_EMAIL||'');
}
export function signInReady(env:Env) {return communityEnabled(env)&&legalReady(env)&&Boolean(env.COMMUNITY_DB&&env.GOOGLE_CLIENT_ID&&env.GOOGLE_CLIENT_SECRET&&env.TURNSTILE_SITE_KEY&&env.TURNSTILE_SECRET&&env.SITE_ORIGIN);}
export function publicPhotoOrigin(env:Env) {
  const expected=env.ENVIRONMENT==='production'?'https://images.velogroupsets.com':env.ENVIRONMENT==='staging'?'https://images.staging.velogroupsets.com':'https://images.example.test';
  return env.PHOTOS_BASE_URL===expected?expected:null;
}
export function uploadsReady(env:Env) {
  return signInReady(env)&&env.UPLOADS_ENABLED==='true'&&env.CSAM_SCANNING_CONFIRMED==='true'&&Boolean(publicPhotoOrigin(env)&&env.UPLOADS&&env.PHOTOS&&env.EVIDENCE&&env.IMAGES&&env.TURNSTILE_SECRET&&env.TURNSTILE_SITE_KEY&&env.MODERATOR_EMAILS?.trim()&&env.PHOTO_CACHE_PURGE_TOKEN&&env.CLOUDFLARE_ZONE_ID);
}
export function publicConfig(env:Env) {return {
  communityAvailable:communityEnabled(env),
  signInAvailable:signInReady(env),uploadsAvailable:uploadsReady(env),policyVersion:POLICY_VERSION,
  turnstileSiteKey:communityEnabled(env)?env.TURNSTILE_SITE_KEY||null:null,contactEmail:legalReady(env)?env.PUBLIC_CONTACT_EMAIL:null,
  operator:legalReady(env)?env.PUBLIC_SITE_OPERATOR:null,maxUploadBytes:MAX_UPLOAD_BYTES,
};}
