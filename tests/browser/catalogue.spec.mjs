import { test, expect } from '@playwright/test';

test('browse manufacturer → groupset → component with sources', async ({page}) => {
  await page.goto('/');
  await page.getByRole('link', {name:'Browse manufacturers',exact:true}).click();
  await page.getByRole('link', {name:/Shimano/}).click();
  await page.getByRole('link', {name:/105/}).click();
  await page.getByRole('link', {name:/105 crankset/}).click();
  await expect(page.getByRole('heading', {name:'105 crankset',exact:true})).toBeVisible();
  await expect(page.getByRole('link', {name:/Shimano FC-R7000 product reference/})).toHaveAttribute('href', /bike.shimano.com/);
  await expect(page.getByText('Uploads and sign-in are not available yet.',{exact:false})).toBeVisible();
});

test('search, URL filters, empty state and reset work at mobile width', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/catalogue/?type=cassette');
  await expect(page.locator('#result-count')).toHaveText('1 component');
  await expect(page.getByRole('link', {name:/105 cassette/})).toBeVisible();
  await page.getByLabel('Search components').fill('does-not-exist');
  await expect(page.getByRole('heading', {name:'No components found'})).toBeVisible();
  await page.getByRole('button', {name:'Clear filters'}).click();
  await expect(page.locator('#result-count')).toHaveText('3 components');
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
