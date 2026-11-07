import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const site = new URL(import.meta.env.SITE);
  const production = site.origin === 'https://velogroupsets.com';
  const rules = production
    ? `User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap.xml', site).href}\n`
    : 'User-agent: *\nDisallow: /\n';
  return new Response(rules, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
