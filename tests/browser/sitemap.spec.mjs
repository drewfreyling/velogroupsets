import { test, expect } from '@playwright/test';
import { manufacturers, manufacturerUrl, groupsets, groupsetUrl, components, componentUrl } from '../../apps/web/src/lib/catalogue.mjs';

test('sitemap contains every canonical catalogue page once and robots follows the environment', async ({page, request}) => {
  await page.goto('/');
  const origin = new URL(await page.locator('link[rel="canonical"]').getAttribute('href')).origin;
  const response = await request.get('/sitemap.xml');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/xml');
  const xml = await response.text();
  const parsed = await page.evaluate(source => {
    const document = new DOMParser().parseFromString(source, 'application/xml');
    return {
      errors: document.querySelectorAll('parsererror').length,
      namespace: document.documentElement.namespaceURI,
      urls: [...document.querySelectorAll('url > loc')].map(node => node.textContent),
    };
  }, xml);
  expect(parsed.errors).toBe(0);
  expect(parsed.namespace).toBe('http://www.sitemaps.org/schemas/sitemap/0.9');
  const paths = ['/', '/manufacturers/', '/catalogue/', '/api-docs/', '/policies/terms/', '/policies/privacy/', '/policies/community/', '/policies/copyright/', ...manufacturers.map(manufacturerUrl), ...groupsets.map(groupsetUrl), ...components.map(componentUrl)];
  expect(parsed.urls.sort()).toEqual(paths.map(path => new URL(path, origin).href).sort());
  expect(new Set(parsed.urls).size).toBe(parsed.urls.length);
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(robots.headers()['content-type']).toContain('text/plain');
  expect(await robots.text()).toBe(origin === 'https://velogroupsets.com'
    ? `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`
    : 'User-agent: *\nDisallow: /\n');
});
