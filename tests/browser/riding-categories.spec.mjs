import {test, expect} from '@playwright/test';
import {groupsets, components, categoriesFor} from '../../apps/web/src/lib/catalogue.mjs';
const weight = page => page.locator('dl > div').filter({has:page.getByRole('term').filter({hasText:/^Weight$/})});

test('manufacturer categories restore from bookmarks and retain ascending years', async ({page}) => {
  await page.goto('/manufacturers/shimano/?category=mtb');
  await expect(page.getByRole('combobox',{name:'Riding category'})).toHaveValue('mtb');
  const cards=page.locator('[data-groupset-category]:visible');
  await expect(cards).toHaveCount(65);
  const years=(await cards.locator('p').filter({hasText:/^Start year: /}).allTextContents()).map(s=>Number(s.replace('Start year: ','')));
  expect(years).toEqual([...years].sort((a,b)=>a-b));
  await page.getByRole('link',{name:/Deore XT M737/}).click();
  await expect(page.getByRole('definition').filter({hasText:/^MTB$/})).toBeVisible();
  await expect(page.getByRole('link',{name:'RD-M737-SGS',exact:true})).toBeVisible();
  await page.goto('/manufacturers/sram/?category=mtb');
  await expect(page.getByText('No groupsets in this riding category have been catalogued for SRAM.')).toBeVisible();
  await page.getByRole('button',{name:'Show all groupsets'}).click();
  await expect(page.locator('[data-groupset-category]:visible')).toHaveCount(groupsets.filter(g=>g.manufacturer_id==='sram').length);
  await expect(page).not.toHaveURL(/category=/);
});

test('component filters combine category, type and groupset and clear incompatible groups',async({page})=>{
  await page.goto('/catalogue/?category=mtb&type=rear-derailleur&groupset=shimano-deore-xt-m737');
  await expect(page.locator('#result-count')).toHaveText('2 components');
  await expect(page.getByRole('link',{name:'RD-M737-SGS',exact:true})).toBeVisible();
  await page.getByRole('combobox',{name:'Riding category'}).selectOption('gravel');
  await expect(page.getByRole('combobox',{name:'Groupset',exact:true})).toHaveValue('');
  await expect(page.locator('#groupset option[value="shimano-deore-xt-m737"]')).toBeDisabled();
  await expect(page.getByRole('link',{name:'RD-RX810',exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'RD-M737-SGS',exact:true})).toBeHidden();
  await page.locator('#query').fill('no such component');
  await expect(page.locator('#result-count')).toHaveText('0 components');
  await page.getByRole('button',{name:'Clear filters'}).click();
  await expect(page.locator('#result-count')).toHaveText(`${components.length} components`);
  await expect(page.locator('#category')).toHaveValue('');
});

test('shared road and track parts retain one search identity in both category filters',async({page,request})=>{
  const index=await(await request.get('/search-index.json')).json();
  expect(index.filter(p=>p.id==='shimano-bb-7700')).toHaveLength(1);
  expect(index.find(p=>p.id==='shimano-bb-7700').categories.sort()).toEqual(['road','track']);
  for(const category of ['road','track']){
    await page.goto(`/catalogue/?category=${category}&q=BB-7700`);
    await expect(page.locator('#result-count')).toHaveText('1 component');
    await expect(page.getByRole('link',{name:'BB-7700',exact:true})).toHaveAttribute('href','/components/shimano/bb-7700/');
  }
  for(const part of index)expect(part.categories).toEqual(categoriesFor(components.find(c=>c.id===part.id)));
});

test('1994 weights preserve their pair and crank/bottom-bracket configurations in pages and static API',async({page,request})=>{
  for(const [slug,grams,description] of [['st-7400',480,'pair'],['fc-7410',589,'53/39T'],['bb-7410',230,'103 mm'],['sl-6401',67,'pair'],['st-m900',411,'pair'],['fc-m560',701,'46/36/26T']]){
    await page.goto(`/components/shimano/${slug}/`);
    await expect(weight(page).locator('dd > span')).toHaveText(`${grams} g`);
    await expect(weight(page)).toContainText(description);
    const {data}=await(await request.get(`/api/v1/components/shimano-${slug}.json`)).json();
    expect(data.weight_g).toBe(grams);
    expect(data.sources.some(s=>s.url.includes('1994_Shimano_Bicycle_System'))).toBe(true);
  }
  const {data}=await(await request.get('/api/v1/groupsets.json')).json();
  expect(data.find(g=>g.id==='shimano-grx-rx400').category).toBe('gravel');
  expect(data.find(g=>g.id==='shimano-xtr-m900').category).toBe('mtb');
});

test('category metadata and all groups remain readable without JavaScript in both themes',async({browser})=>{
  for(const colorScheme of ['light','dark']){
    const context=await browser.newContext({javaScriptEnabled:false,colorScheme,viewport:{width:390,height:844}});
    const page=await context.newPage();
    await page.goto('http://127.0.0.1:8787/manufacturers/shimano/?category=mtb');
    await expect(page.locator('[data-groupset-category]')).toHaveCount(groupsets.filter(g=>g.manufacturer_id==='shimano').length);
    await expect(page.locator('noscript p')).toContainText('All groupsets are listed above.');
    await expect(page.locator('noscript p')).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.goto('http://127.0.0.1:8787/groupsets/shimano/grx-rx400/');
    await expect(page.getByRole('definition').filter({hasText:/^Gravel$/})).toBeVisible();
    await context.close();
  }
});
