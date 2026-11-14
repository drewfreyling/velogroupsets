import { test, expect } from '@playwright/test';

const withheld = [
  'FC-5600', 'FC-5603', 'FC-6600', 'FC-6601-G', 'FC-6603',
  'FC-6604-G', 'FC-6650-G', 'FC-6650-S', 'FC-6700',
  'BB-1050', 'BB-1055', 'BB-6400', 'ST-R7000',
];

test('withheld weights remain null in search and readable on their original component pages', async ({page, request}) => {
  const index = await (await request.get('/search-index.json')).json();
  for (const model of withheld) {
    const record = index.find(part => part.model === model);
    expect(record, model).toBeDefined();
    expect(record.weight_g, model).toBeNull();
    await page.goto(record.url);
    await expect(page.getByRole('heading', {name:model,level:1,exact:true})).toBeVisible();
    const weight = page.locator('dl > div').filter({has:page.getByRole('term').filter({hasText:/^Weight$/})});
    await expect(weight.locator('dd > span')).toHaveText('Not yet sourced');
    await expect(weight).toContainText('Weight withheld:');
    await expect(page.getByRole('link', {name:'Read Shimano technical specification'})).toBeVisible();
  }
});

test('replacement crankset weights identify arm length and chainrings and exclude bottom brackets', async ({page, request}) => {
  const index = await (await request.get('/search-index.json')).json();
  for (const [model, grams, chainrings] of [
    ['FC-5800',757,'50/34T'], ['FC-6750',699,'50/34T'],
    ['FC-6703',803,'52/39/30T'], ['FC-5750',716,'50/34T'], ['FC-5703',831,'50/39/30T'],
  ]) {
    const record = index.find(part => part.model === model);
    expect(record.weight_g).toBe(grams);
    await page.goto(record.url);
    const weight = page.locator('dl > div').filter({has:page.getByRole('term').filter({hasText:/^Weight$/})});
    await expect(weight.locator('dd > span')).toHaveText(`${grams} g`);
    await expect(weight).toContainText('170 mm');
    await expect(weight).toContainText(chainrings);
    await expect(weight).toContainText('excludes bottom bracket');
    await expect(page.getByRole('link', {name:'Read Shimano technical specification'})).toHaveAttribute('href', /2017-2018_Specifications_v028_en\.pdf#page=/);
  }
});
