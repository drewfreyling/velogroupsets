import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { readFileSync } from 'node:fs';
export async function communityRuntime() {
  const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("test")}}',compatibilityDate:'2026-11-07',d1Databases:['COMMUNITY_DB'],r2Buckets:['UPLOADS','PHOTOS','EVIDENCE'],images:{binding:'IMAGES'}}));
  await mf.ready;
  const env={
    ENVIRONMENT:'local',SITE_ORIGIN:'http://127.0.0.1:8787',GOOGLE_CLIENT_ID:'test-client.apps.googleusercontent.com',GOOGLE_CLIENT_SECRET:'fictional-test-secret',
    PUBLIC_SITE_OPERATOR:'Example Operator',PUBLIC_CONTACT_EMAIL:'contact@example.test',CONTACT_READY:'true',UPLOADS_ENABLED:'true',
    CSAM_SCANNING_CONFIRMED:'true',PHOTOS_BASE_URL:'https://images.example.test',MODERATOR_EMAILS:'moderator@example.test',
    TURNSTILE_SITE_KEY:'test-site-key',TURNSTILE_SECRET:'test-secret',PHOTO_CACHE_PURGE_TOKEN:'test-purge-token',CLOUDFLARE_ZONE_ID:'a'.repeat(32),
    COMMUNITY_DB:await mf.getD1Database('COMMUNITY_DB'),UPLOADS:await mf.getR2Bucket('UPLOADS'),PHOTOS:await mf.getR2Bucket('PHOTOS'),EVIDENCE:await mf.getR2Bucket('EVIDENCE'),IMAGES:await mf.getImagesBinding('IMAGES'),
  };
  const sql=readFileSync(new URL('../../db/migrations/0001_community.sql',import.meta.url),'utf8');
  // D1 exec does not parse multiline statements in all local runtime versions.
  for(const statement of sql.split(';').map(s=>s.trim()).filter(Boolean))await env.COMMUNITY_DB.prepare(statement).run();
  return {mf,env,close:()=>mf.dispose()};
}
