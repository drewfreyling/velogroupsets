import type { Context, Env } from './types.ts';
import { communityApi } from './community.ts';
import { dataApi } from './data-api.ts';
import { cleanup } from './moderation.ts';


export default {
  async scheduled(_event:unknown,env:Env,ctx:Context) { ctx.waitUntil(cleanup(env)); },
  async fetch(request: Request, env: Env, ctx?: Context): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (path === '/api/v1' || path.startsWith('/api/v1/')) return dataApi(request,env,ctx);
    if (path === '/api' || path.startsWith('/api/')) {
      const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      };
      if (path === '/api/health' && ['GET', 'HEAD'].includes(request.method)) {
        return new Response(request.method === 'HEAD' ? null : JSON.stringify({
          status: 'ok', environment: env.ENVIRONMENT, release: env.RELEASE_SHA || 'local',
        }), { headers });
      }
      if (path === '/api/health') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405, headers: { ...headers, Allow: 'GET, HEAD' },
        });
      }
      return communityApi(request,env,ctx);
    }
    return env.ASSETS.fetch(request);
  },
};
