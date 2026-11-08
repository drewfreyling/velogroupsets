import { test, expect } from '@playwright/test';

test('standalone levers filter by family and keep standard and extension weights distinct', async ({page, request}) => {
  await page.goto('/catalogue/?groupset=shimano-exage-sport&type=brake-levers');
  await expect(page.locator('#result-count')).toHaveText('4 components');
  for (const model of ['BL-A450','BL-A451','BL-A452','BL-A453']) {
    await expect(page.getByRole('link',{name:model,exact:true})).toBeVisible();
  }
  await page.goto('/catalogue/?groupset=shimano-exage-motion&type=brake-levers');
  await expect(page.locator('#result-count')).toHaveText('2 components');
  await page.getByRole('link',{name:'BL-A251-EX',exact:true}).click();
  await expect(page.getByRole('heading',{name:'BL-A251-EX',level:1,exact:true})).toBeVisible();
  const weight=page.locator('dl > div').filter({has:page.getByRole('term').filter({hasText:/^Weight$/})});
  await expect(weight.locator('dd > span')).toHaveText('Not yet sourced');
  const index=await (await request.get('/search-index.json')).json();
  expect(index.find(p=>p.id==='shimano-bl-a251').weight_g).toBe(310);
  expect(index.find(p=>p.id==='shimano-bl-a251-ex').weight_g).toBeNull();
});

test('shared Shimano and Record levers keep canonical component links across groupsets', async ({page}) => {
  for (const group of ['shimano-dura-ace-7800','shimano-ultegra-6600','shimano-105-5600']) {
    await page.goto(`/catalogue/?groupset=${group}&type=brake-levers`);
    await expect(page.locator('#result-count')).toHaveText('1 component');
    await expect(page.getByRole('link',{name:'BL-R600',exact:true})).toHaveAttribute('href','/components/shimano/bl-r600/');
  }
  for (const group of ['campagnolo-record-8-speed','campagnolo-record-9-speed']) {
    await page.goto(`/catalogue/?groupset=${group}&type=brake-levers`);
    const lever=page.getByRole('link',{name:'BL-22RECG',exact:true});
    await expect(lever).toHaveAttribute('href','/components/campagnolo/bl-22recg/');
    await lever.click();
    await expect(page.getByRole('heading',{name:'BL-22RECG',level:1,exact:true})).toBeVisible();
    await expect(page.getByRole('link',{name:'Read Campagnolo technical specification'})).toHaveAttribute('href',/1997_page_54\.html$/);
  }
});

test('period pair weights and missing RSX weights survive catalogue generation', async ({page, request}) => {
  const index=await (await request.get('/search-index.json')).json();
  for (const [id,grams] of [['shimano-bl-1050',202],['shimano-bl-6401',260],['shimano-bl-7402',240],['shimano-bl-tt79',89],['shimano-bl-a410',null]]) {
    const record=index.find(p=>p.id===id);
    expect(record.type).toBe('brake-levers');
    expect(record.weight_g).toBe(grams);
    await page.goto(record.url);
    const weight=page.locator('dl > div').filter({has:page.getByRole('term').filter({hasText:/^Weight$/})});
    await expect(weight.locator('dd > span')).toHaveText(grams===null?'Not yet sourced':`${grams} g`);
    await expect(weight).toContainText(grams===null?'leaves the BL-A410 weight blank':'pair');
  }
});
