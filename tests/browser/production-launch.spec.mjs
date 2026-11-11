import {test, expect} from '@playwright/test';

test('production catalogue browsing and themes work without community requests', async ({page}) => {
  const communityRequests=[];
  page.on('request', r=>{if(new URL(r.url()).pathname.startsWith('/api/'))communityRequests.push(r.url());});
  await page.emulateMedia({colorScheme:'light'});
  await page.goto('/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://velogroupsets.com/');
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  await expect(page.getByRole('link',{name:'Account',exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'Dark mode',exact:true}).click();
  await expect(page.locator('body')).toHaveCSS('background-color','rgb(11, 21, 20)');
  await page.getByRole('link',{name:'Search the catalogue',exact:true}).click();
  await page.locator('#query').fill('RD-R7000-GS');
  await expect(page.locator('#result-count')).toHaveText('1 component');
  await page.getByRole('link',{name:'RD-R7000-GS',exact:true}).click();
  await expect(page.getByRole('heading',{name:'RD-R7000-GS',level:1,exact:true})).toBeVisible();
  await expect(page.locator('[data-photo-gallery]')).toHaveCount(0);
  await expect(page.getByRole('link',{name:'Add a photo',exact:true})).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://velogroupsets.com/components/shimano/rd-r7000-gs/');
  expect(communityRequests).toEqual([]);
});

test('community entry pages redirect to the catalogue', async ({page}) => {
  for(const path of ['/account/','/upload/?component=shimano-rd-r7000-gs','/report/','/moderation/']){
    await page.goto(path);
    await expect(page).toHaveURL(/\/catalogue\/$/);
    await expect(page.locator('input[type="file"], form[action="/api/auth/google/start"]')).toHaveCount(0);
  }
});

test('community APIs and photo delivery stay disabled while static data is public', async ({request}) => {
  const config=await request.get('/api/community/config');
  expect(await config.json()).toMatchObject({communityAvailable:false,signInAvailable:false,uploadsAvailable:false,turnstileSiteKey:null});
  const id='00000000-0000-4000-8000-000000000001';
  for(const path of ['/api/session','/api/auth/google/callback','/api/components/shimano-rd-r7000-gs/photos',`/api/photos/${id}/file`,`/api/photos/${id}/preview`,'/api/moderation']){
    const response=await request.get(path);expect(response.status()).toBe(404);expect(response.headers()['cache-control']).toBe('no-store');
  }
  for(const path of ['/api/uploads','/api/auth/google/start',`/api/photos/${id}/reports`])expect((await request.post(path)).status()).toBe(404);
  const data=await request.get('/api/v1/components/shimano-br-r7000.json');
  expect(data.status()).toBe(200);expect(data.headers()['x-catalogue-delivery']).toBe('static-assets');
  expect((await data.json()).data.weight_g).toBe(379);
});

test('production indexing, policies and 404 responses match launch settings', async ({page,request}) => {
  expect(await (await request.get('/robots.txt')).text()).toBe('User-agent: *\nAllow: /\nSitemap: https://velogroupsets.com/sitemap.xml\n');
  const xml=await (await request.get('/sitemap.xml')).text();
  const urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]));
  expect(urls.length).toBeGreaterThan(900);
  expect(urls.every(url=>url.origin==='https://velogroupsets.com')).toBe(true);
  expect(urls.some(url=>/^\/(account|upload|report|moderation)\//.test(url.pathname))).toBe(false);
  await page.goto('/policies/privacy/');
  await expect(page.getByText('Draft policies.',{exact:false})).toHaveCount(0);
  await expect(page.getByText('This release is a read-only catalogue.',{exact:false})).toBeVisible();
  await expect(page.locator('a[href="mailto:contact@velogroupsets.com"]')).toBeVisible();
  expect((await request.get('/not-a-real-page/')).status()).toBe(404);
});
