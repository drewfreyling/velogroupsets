import { test, expect } from '@playwright/test';
import { components } from '../../apps/web/src/lib/catalogue.mjs';

test('browse manufacturer → groupset → component with sources', async ({page}) => {
  await page.goto('/');
  await page.getByRole('link', {name:'See manufacturers',exact:true}).click();
  await page.getByRole('link', {name:/Shimano/}).click();
  await page.getByRole('link').filter({has:page.getByRole('heading', {name:'105 R7000',level:3,exact:true})}).click();
  await expect(page.getByText('2018 – end year not documented', {exact:true})).toBeVisible();
  await expect(page.getByRole('heading', {name:'105 R7000',level:1})).toBeVisible();
  await expect(page.getByText('R7000', {exact:true})).toBeVisible();
  await page.getByRole('link', {name:'FC-R7000',exact:true}).click();
  await expect(page.getByRole('heading', {name:'FC-R7000',level:1})).toBeVisible();
  await expect(page.getByRole('navigation', {name:'Breadcrumb'}).getByRole('link', {name:'105 R7000',exact:true})).toHaveAttribute('href', '/groupsets/shimano/105-r7000/');
  await expect(page.locator('dl').getByRole('link', {name:'105 R7000',exact:true})).toHaveAttribute('href', '/groupsets/shimano/105-r7000/');
  await expect(page.getByText('713.4 g', {exact:true})).toBeVisible();
  await expect(page.getByText('Manufacturer average: 50–34T chainrings, 170 mm crank arms; excludes bottom bracket.', {exact:true})).toBeVisible();
  await expect(page.getByRole('link', {name:'Read Shimano technical specification'})).toHaveAttribute('href', 'https://productinfo.shimano.com/pdfs/product/archive/2022-2023_Specifications_v035_en.pdf#page=176');
  await expect(page.getByRole('link', {name:/Shimano FC-R7000 product reference/})).toHaveAttribute('href', /bike.shimano.com/);
  await expect(page.getByText('Photo uploads and comments are not available yet.',{exact:false})).toBeVisible();
});

test('search, URL filters, empty state and reset work at mobile width', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/catalogue/?type=cassette&groupset=shimano-105-r7000');
  await expect(page.locator('#result-count')).toHaveText('1 component');
  await expect(page.getByRole('link', {name:'CS-R7000',exact:true})).toBeVisible();
  await expect(page.getByText('Shimano · 105 cassette', {exact:true})).toBeVisible();
  await page.getByLabel('Search components').fill('does-not-exist');
  await expect(page.getByRole('heading', {name:'No components found'})).toBeVisible();
  await page.getByRole('button', {name:'Clear filters'}).click();
  await expect(page.locator('#result-count')).toHaveText(`${components.length} components`);
  await page.getByLabel('Search components').fill('FC-R7000');
  await expect(page.locator('#result-count')).toHaveText('1 component');
  expect(new URL(page.url()).searchParams.get('q')).toBe('FC-R7000');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('Worker routing, 404 status and asset security headers', async ({request}) => {
  const home=await request.get('/');
  expect(home.headers()['content-security-policy']).toContain("script-src 'self'");
  expect(home.headers()['x-content-type-options']).toBe('nosniff');
  const missing=await request.get('/does-not-exist/');
  expect(missing.status()).toBe(404);
  const api=await request.get('/api/not-implemented');
  expect(api.status()).toBe(404);
  expect(api.headers()['content-type']).toContain('application/json');
  const health=await request.get('/api/health');
  expect((await health.json()).status).toBe('ok');
});

test('a rear hub with unknown weight remains searchable and shows no numeric weight', async ({page, request}) => {
  await page.goto('/catalogue/?type=rear-hub&groupset=shimano-exage-500ex');
  await expect(page.locator('#result-count')).toHaveText('1 component');
  await page.getByRole('link', {name:'FH-HG50',exact:true}).click();
  await expect(page.getByRole('heading', {name:'FH-HG50',level:1})).toBeVisible();
  const weight = page.locator('dl > div').filter({has:page.locator('dt', {hasText:/^Weight$/})});
  await expect(weight.locator('dd > span')).toHaveText('Not yet sourced');
  await expect(weight).toContainText('Any weight added must exclude skewers.');
  await expect(page.getByRole('link', {name:'Read Shimano technical specification'})).toHaveAttribute('href', 'https://si.shimano.com/en/pdfs/ev/FH-HG50-1107/EV-FH-HG50-1107A.pdf');
  const index = await (await request.get('/search-index.json')).json();
  expect(index.find(record => record.id === 'shimano-fh-hg50').weight_g).toBeNull();
});

test('CSP permits the Cloudflare beacon and reporting, and blocks other script origins', async ({page}) => {
  let reports = 0;
  await page.route('https://cloudflareinsights.com/cdn-cgi/rum', async route => {
    reports++;
    await route.fulfill({status:204});
  });
  await page.route('https://static.cloudflareinsights.com/**', route => route.fulfill({
    contentType:'application/javascript',
    body:'window.__beaconLoaded = true; fetch("https://cloudflareinsights.com/cdn-cgi/rum", {method:"POST",mode:"no-cors",body:"test"});',
  }));
  await page.route('https://untrusted.example/**', route => route.fulfill({
    contentType:'application/javascript', body:'window.__untrustedLoaded = true;',
  }));
  await page.goto('/');
  const allowed = await page.evaluate(() => new Promise(resolve => {
    const script = document.createElement('script');
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js/versioned-test';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.append(script);
  }));
  expect(allowed).toBe(true);
  expect(await page.evaluate(() => window.__beaconLoaded)).toBe(true);
  await expect.poll(() => reports).toBe(1);
  const untrusted = await page.evaluate(() => new Promise(resolve => {
    const script = document.createElement('script');
    script.src = 'https://untrusted.example/tracker.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.append(script);
  }));
  expect(untrusted).toBe(false);
  expect(await page.evaluate(() => window.__untrustedLoaded)).toBeUndefined();
});

test('external links announce and open a new tab; internal navigation stays in the page', async ({page, context}) => {
  await context.route('https://github.com/**', route => route.fulfill({
    contentType:'text/html', body:'<title>GitHub contribution guide</title><p>Contribution guide</p>',
  }));
  await page.goto('/components/shimano/rd-r7000-gs/');
  const external = page.locator('a[href^="https://"]:visible');
  for (const link of await external.all()) {
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(link).toHaveAccessibleName(/\(opens in new tab\)$/);
  }
  const guide = page.getByRole('link', {name:'Contribution guide (opens in new tab)',exact:true});
  const popupPromise = page.waitForEvent('popup');
  await guide.click();
  const popup = await popupPromise;
  await popup.waitForLoadState();
  await expect(popup).toHaveTitle('GitHub contribution guide');
  await expect(page).toHaveURL(/\/components\/shimano\/rd-r7000-gs\/$/);
  await popup.close();
  await page.getByRole('navigation', {name:'Main navigation'}).getByRole('link', {name:'Catalogue',exact:true}).click();
  await expect(page).toHaveURL(/\/catalogue\/$/);
  expect(context.pages()).toHaveLength(1);
});
