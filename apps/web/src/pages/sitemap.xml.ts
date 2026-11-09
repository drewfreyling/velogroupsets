import type { APIRoute } from 'astro';
import { manufacturers, manufacturerUrl, groupsets, groupsetUrl, components, componentUrl } from '../lib/catalogue.mjs';

const escapeXml = (value: string) => value.replace(/[<>&"']/g, char => ({
  '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;',
}[char]!));

export const GET: APIRoute = () => {
  const paths = [
    '/', '/manufacturers/', '/catalogue/', '/api-docs/',
    '/policies/terms/', '/policies/privacy/', '/policies/community/', '/policies/copyright/',
    ...manufacturers.map(manufacturerUrl),
    ...groupsets.map(groupsetUrl),
    ...components.map(componentUrl),
  ];
  const entries = [...new Set(paths)].map(path => `<url><loc>${escapeXml(new URL(path, import.meta.env.SITE).href)}</loc></url>`);
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
