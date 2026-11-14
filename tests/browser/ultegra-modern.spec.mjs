import { test, expect } from '@playwright/test';
import { components } from '../../apps/web/src/lib/catalogue.mjs';

test('shifters are pairs and former individual ST-R7000 URLs redirect to one canonical pair', async ({page,request}) => {
  const index=await (await request.get('/search-index.json')).json();
  for (const part of components.filter(p=>p.type==='shifters')) {
    expect(part.specifications.weight_basis,part.id).toBe('Pair');
    expect(part.name,part.id).toMatch(/pair/i);
  }
  const shifters=index.filter(p=>p.type==='shifters');
  expect(shifters.some(p=>p.model==='ST-R7000-L'||p.model==='ST-R7000-R')).toBe(false);
  expect(shifters.filter(p=>p.model==='ST-R7000')).toHaveLength(1);
  for (const side of ['l','r']) {
    const old=`/components/shimano/st-r7000-${side}/`;
    const response=await request.get(old,{maxRedirects:0});
    expect(response.status()).toBe(301);
    expect(new URL(response.headers().location,'http://127.0.0.1:8787').pathname).toBe('/components/shimano/st-r7000/');
    await page.goto(old);
    await expect(page).toHaveURL(/\/components\/shimano\/st-r7000\/$/);
    await expect(page.getByRole('heading',{name:'ST-R7000',level:1,exact:true})).toBeVisible();
    await expect(page.getByText('105 eleven-speed Dual Control lever pair',{exact:true})).toBeVisible();
    await page.goto(`/catalogue/?q=ST-R7000-${side.toUpperCase()}&type=shifters`);
    await expect(page.locator('#result-count')).toHaveText('1 component');
    await expect(page.getByRole('link',{name:'ST-R7000',exact:true})).toHaveAttribute('href','/components/shimano/st-r7000/');
  }
});

test('browse mechanical Ultegra 6800 and R8000 with sourced 170 mm crank references', async ({page}) => {
  for (const [family,year,grams] of [['6800',2013,689],['R8000',2017,681]]) {
    await page.goto('/manufacturers/shimano/');
    const card=page.getByRole('link').filter({has:page.getByRole('heading',{name:`Ultegra ${family}`,level:3,exact:true})});
    await expect(card).toContainText(`Start year: ${year}`);
    await card.click();
    await page.getByRole('link',{name:`FC-${family}`,exact:true}).click();
    const weight=page.locator('dl > div').filter({has:page.getByRole('term').filter({hasText:/^Weight$/})});
    await expect(weight.locator('dd > span')).toHaveText(`${grams} g`);
    await expect(weight).toContainText('170 mm');
    await expect(weight).toContainText('52/36T');
    await expect(weight).toContainText('excludes bottom bracket');
    await expect(page.getByRole('link',{name:'Read Shimano technical specification'})).toHaveAttribute('href',/^https:\/\/si\.shimano\.com\//);
  }
});

test('mechanical lever pairs retain published pair weights and unknown R8000 pair weight', async ({page,request}) => {
  const index=await (await request.get('/search-index.json')).json();
  for (const [model,grams] of [['ST-6800',425],['ST-R8020',554],['ST-R8000',null]]) {
    const part=index.find(p=>p.model===model);
    expect(part.weight_g).toBe(grams);
    await page.goto(part.url);
    const weight=page.locator('dl > div').filter({has:page.getByRole('term').filter({hasText:/^Weight$/})});
    await expect(weight.locator('dd > span')).toHaveText(grams===null?'Not yet sourced':`${grams} g`);
    await expect(weight).toContainText('pair');
  }
});

test('eleven-speed groups share bottom-bracket identity and display sourced and unknown hub weights', async ({page,request}) => {
  for (const family of ['6800','r8000']) {
    await page.goto(`/catalogue/?groupset=shimano-ultegra-${family}&type=bottom-bracket`);
    await expect(page.getByRole('link',{name:'SM-BBR60',exact:true})).toHaveAttribute('href','/components/shimano/sm-bbr60/');
  }
  const index=await (await request.get('/search-index.json')).json();
  for (const [model,grams] of [['HB-6800',null],['FH-6800',null],['HB-RS770',125],['FH-RS770',302]]) {
    const part=index.find(p=>p.model===model);
    expect(part.weight_g).toBe(grams);
    await page.goto(part.url);
    const weight=page.locator('dl > div').filter({has:page.getByRole('term').filter({hasText:/^Weight$/})});
    await expect(weight.locator('dd > span')).toHaveText(grams===null?'Not yet sourced':`${grams} g`);
    await expect(page.getByText(grams===null?'Any weight added must exclude skewers.':'Excludes skewers.',{exact:true})).toBeVisible();
    if (grams!==null) {
      await expect(weight).toContainText('12 mm E-THRU');
      await expect(weight).toContainText('separate frame/fork through-axle');
    }
  }
});
