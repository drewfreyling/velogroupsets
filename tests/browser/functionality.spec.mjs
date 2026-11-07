import { test, expect } from '@playwright/test';

test('combine description search, type and groupset filters and restore them on reload', async ({page}) => {
  await page.goto('/catalogue/');
  const query = page.getByLabel('Search components');
  const type = page.getByRole('combobox', {name:'Component type',exact:true});
  const group = page.getByRole('combobox', {name:'Groupset',exact:true});
  await group.selectOption('shimano-ultegra-6500');
  await type.selectOption('crankset');
  await query.fill('  SHIMANO   TrIpLe  ');
  await query.press('Enter');
  await expect(page.locator('#result-count')).toHaveText('1 component');
  await expect(page.getByRole('link', {name:'FC-6503',exact:true})).toBeVisible();
  await expect(page.getByRole('link', {name:'FC-6500',exact:true})).not.toBeVisible();

  await page.reload();
  await expect(query).toHaveValue('  SHIMANO   TrIpLe  ');
  await expect(type).toHaveValue('crankset');
  await expect(group).toHaveValue('shimano-ultegra-6500');
  await expect(page.locator('#result-count')).toHaveText('1 component');
  await group.selectOption('shimano-ultegra-6600');
  await expect(page.getByRole('link', {name:'FC-6603',exact:true})).toBeVisible();
  await expect(page.getByRole('link', {name:'FC-6503',exact:true})).not.toBeVisible();
  await type.selectOption('front-derailleur');
  await expect(page.locator('#result-count')).toHaveText('1 component');
  await expect(page.getByRole('link', {name:'FD-6603-F',exact:true})).toBeVisible();
});

test('groupset category navigation finds a hub by model and browser Back restores the filters', async ({page}) => {
  await page.goto('/groupsets/shimano/ultegra-6500/');
  await page.getByRole('link', {name:'Front Hub',exact:true}).click();
  await expect(page.getByRole('combobox', {name:'Component type',exact:true})).toHaveValue('front-hub');
  await expect(page.getByRole('combobox', {name:'Groupset',exact:true})).toHaveValue('shimano-ultegra-6500');
  await expect(page.locator('#result-count')).toHaveText('1 component');
  const hub = page.getByRole('link', {name:'HB-6500',exact:true});
  await expect(hub).toHaveText('HB-6500');
  const result = page.getByRole('article').filter({has:hub});
  await expect(result.getByText('Shimano · Ultegra front hub', {exact:true})).toBeVisible();
  await expect(page.getByRole('link', {name:'Ultegra front hub',exact:true})).toHaveCount(0);
  await hub.focus();
  await hub.press('Enter');
  await expect(page.getByRole('heading', {name:'HB-6500',level:1,exact:true})).toBeVisible();
  await expect(page.getByText('136 g', {exact:true})).toBeVisible();
  await expect(page.getByText('Excludes skewers.', {exact:true})).toBeVisible();

  await page.goBack();
  await expect(page.getByRole('combobox', {name:'Component type',exact:true})).toHaveValue('front-hub');
  await expect(page.getByRole('combobox', {name:'Groupset',exact:true})).toHaveValue('shimano-ultegra-6500');
  await expect(page.locator('#result-count')).toHaveText('1 component');
  await expect(hub).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', {name:'Ultegra 6500',level:1,exact:true})).toBeVisible();
});

test('shared components keep one canonical page when navigating between groupsets', async ({page}) => {
  await page.goto('/groupsets/shimano/ultegra-6600/');
  await expect(page.getByRole('link', {name:'CS-6600',exact:true})).toHaveAttribute('href', '/components/shimano/cs-6600/');
  await page.getByRole('link', {name:'CS-6600',exact:true}).click();
  await expect(page).toHaveURL(/\/components\/shimano\/cs-6600\/$/);
  const membership = page.locator('dl');
  await expect(membership.getByRole('link', {name:'Ultegra 6600',exact:true})).toBeVisible();
  await membership.getByRole('link', {name:'Ultegra SL 6600-G',exact:true}).click();
  await expect(page.getByRole('heading', {name:'Ultegra SL 6600-G',level:1,exact:true})).toBeVisible();
  await expect(page.getByRole('link', {name:'CS-6600',exact:true})).toHaveAttribute('href', '/components/shimano/cs-6600/');
  await page.getByRole('link', {name:'CS-6600',exact:true}).click();
  await expect(page).toHaveURL(/\/components\/shimano\/cs-6600\/$/);
  await expect(page.getByRole('heading', {name:'CS-6600',level:1,exact:true})).toBeVisible();
});

test('recover from a missing component through search and return home', async ({page}) => {
  const response = await page.goto('/components/shimano/not-a-component/');
  expect(response.status()).toBe(404);
  await expect(page.getByRole('heading', {name:'Page not found',level:1})).toBeVisible();
  await page.getByRole('link', {name:'Search the catalogue',exact:true}).click();
  await page.getByLabel('Search components').fill('rd-r7000-gs');
  await expect(page.locator('#result-count')).toHaveText('1 component');
  await page.getByRole('link', {name:'RD-R7000-GS',exact:true}).click();
  await expect(page.getByRole('heading', {name:'RD-R7000-GS',level:1})).toBeVisible();
  await page.getByRole('link', {name:'VeloGroupsets home',exact:true}).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('link', {name:'Search the catalogue',exact:true})).toBeVisible();
});

test('static responses have one cache lifetime for pages, favicon and hashed styles', async ({page, request}) => {
  const home = await page.goto('/');
  expect(home.headers()['cache-control']).toBe('public, max-age=300, must-revalidate');
  const stylesheet = await page.locator('link[rel="stylesheet"]').first().getAttribute('href');
  const styles = await request.get(stylesheet);
  expect(styles.status()).toBe(200);
  expect(styles.headers()['cache-control']).toBe('public, max-age=31536000, immutable');
  const favicon = await request.get('/favicon.svg');
  expect(favicon.status()).toBe(200);
  expect(favicon.headers()['cache-control']).toBe('public, max-age=86400, must-revalidate');
  const index = await request.get('/search-index.json');
  expect(index.headers()['cache-control']).toBe('public, max-age=300, must-revalidate');
  const health = await request.get('/api/health');
  expect(health.headers()['cache-control']).toBe('no-store');
});

test.describe('without JavaScript', () => {
  test.use({javaScriptEnabled:false});

  test('the catalogue explains its fallback and model links still open component details', async ({page}) => {
    await page.goto('/catalogue/?type=rear-hub');
    await expect(page.getByText('All components are listed above. Enable JavaScript to search and filter.', {exact:true})).toBeVisible();
    await expect(page.getByRole('link', {name:'HB-6500',exact:true})).toBeVisible();
    await page.getByRole('link', {name:'FC-6500',exact:true}).click();
    await expect(page.getByRole('heading', {name:'FC-6500',level:1})).toBeVisible();
    await expect(page.getByRole('link', {name:'Read Shimano technical specification'})).toHaveAttribute('href', /si\.shimano\.com/);
  });
});
