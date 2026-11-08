export interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  ENVIRONMENT: string;
  RELEASE_SHA?: string;
  COMMUNITY_DB?: any;
  UPLOADS?: any;
  PHOTOS?: any;
  EVIDENCE?: any;
  IMAGES?: any;
  SITE_ORIGIN?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET?: string;
  PUBLIC_SITE_OPERATOR?: string;
  PUBLIC_CONTACT_EMAIL?: string;
  CONTACT_READY?: string;
  UPLOADS_ENABLED?: string;
  CSAM_SCANNING_CONFIRMED?: string;
  PHOTOS_BASE_URL?: string;
  MODERATOR_EMAILS?: string;
  PHOTO_CACHE_PURGE_TOKEN?: string;
  CLOUDFLARE_ZONE_ID?: string;
}
export interface Context { waitUntil(promise: Promise<unknown>): void; }
export interface User { id:string; email:string; display_name:string; role:string; disabled:number; }
export interface Session { user:User; tokenHash:string; csrf:string; createdAt:number; }
export interface Dependencies {
  fetcher?: typeof fetch;
  googleKeys?: any;
}
