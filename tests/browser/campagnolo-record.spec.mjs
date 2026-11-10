import { test, expect } from '@playwright/test';

test('browse both Record systems and open their archived manufacturer technical documents', async ({page}) => {
  for (const [name,model,number,grams] of [['Record 8-speed','RD-08RE',24,234],['Record 9-speed','RD-09RE',22,230]]) {
    await page.goto('/manufacturers/');
    await page.getByRole('link',{name:/See Campagnolo groupsets/}).click();
    await page.getByRole('link').filter({has:page.getByRole('heading',{name,level:3,exact:true})}).click();
    await expect(page.getByRole('heading',{name,level:1,exact:true})).toBeVisible();
    await page.getByRole('link',{name:model,exact:true}).click();
    await expect(page.getByRole('heading',{name:model,level:1,exact:true})).toBeVisible();
    const specification=page.getByRole('link',{name:'Read Campagnolo technical specification'});
    await expect(specification).toHaveAttribute('href',`https://www.disraeligears.co.uk/site/campagnolo_spare_parts_catalogue_-_1997_page_${number}.html`);
    await expect(specification).toHaveAccessibleName(/opens in new tab/);
    const weight=page.locator('dl > div').filter({has:page.getByRole('term').filter({hasText:/^Weight$/})});
    await expect(weight.locator('dd > span')).toHaveText(`${grams} g`);
    await expect(weight).toContainText('Manufacturer-listed weight');
  }
});

test('Record filtering distinguishes speed-specific parts and preserves shared crank identity', async ({page,request}) => {
  await page.goto('/catalogue/?groupset=campagnolo-record-8-speed&type=rear-derailleur');
  const group=page.getByRole('combobox',{name:'Groupset',exact:true});
  const type=page.getByRole('combobox',{name:'Component type',exact:true});
  await expect(page.locator('#result-count')).toHaveText('1 component');
  await expect(page.getByRole('link',{name:'RD-08RE',exact:true})).toBeVisible();
  await group.selectOption('campagnolo-record-9-speed');
  await expect(page.getByRole('link',{name:'RD-09RE',exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'RD-08RE',exact:true})).not.toBeVisible();
  await type.selectOption('crankset');
  const crank=page.getByRole('link',{name:'FC-21RE',exact:true});
  await expect(crank).toHaveAttribute('href','/components/campagnolo/fc-21re/');
  await group.selectOption('campagnolo-record-8-speed');
  await expect(crank).toBeVisible();
  await crank.click();
  for (const name of ['Record 8-speed','Record 9-speed']) {
    await expect(page.locator('dl').getByRole('link',{name,exact:true})).toHaveCount(1);
  }
  const index=await (await request.get('/search-index.json')).json();
  const record=index.find(c=>c.id==='campagnolo-fc-21re');
  expect(record.weight_g).toBeNull();
  expect(record.url).toBe('/components/campagnolo/fc-21re/');
});
