import { test, expect } from '@playwright/test';

const withheld = [
  'FC-5600', 'FC-5603', 'FC-6600', 'FC-6601-G', 'FC-6603',
  'FC-6604-G', 'FC-6650-G', 'FC-6650-S', 'FC-6700',
  'BB-1050', 'BB-1055', 'BB-6400',
];

test('R7000 pair weight adds the two published sides and labels the calculation in pages and API', async ({page, request}) => {
  const index = await (await request.get('/search-index.json')).json();
  const record = index.find(part => part.model === 'ST-R7000');
  expect(record).toMatchObject({weight_g:500, weight_basis:'Pair'});
  await page.goto(record.url);
  const weight = page.locator('dl > div').filter({has:page.getByRole('term').filter({hasText:/^Weight$/})});
  await expect(weight.locator('dd > span')).toHaveText('500 g');
  await expect(weight).toContainText('Calculated');
  await expect(weight).toContainText('249 g');
  await expect(weight).toContainText('251 g');
  const {data} = await (await request.get('/api/v1/components/shimano-st-r7000.json')).json();
  expect(data).toMatchObject({weight_g:500, specifications:{weight_basis:'Pair', left_model:'ST-R7000-L', right_model:'ST-R7000-R', left_weight_g:249, right_weight_g:251, weight_method:'Sum of manufacturer side weights'}});
});

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

test('newly sourced pair totals preserve both side references in pages, search and API', async ({page, request}) => {
  const index = await (await request.get('/search-index.json')).json();
  for (const [slug, left, leftWeight, right, rightWeight] of [
    ['sl-m8000','SL-M8000-L',117,'SL-M8000-R',127],
    ['sl-m7000-11','SL-M7000-L',130,'SL-M7000-11-R',135],
    ['sl-m610','SL-M610-L',130,'SL-M610-R',135],
    ['sw-m8050','SW-M8050-L',93,'SW-M8050-R',93],
    ['sw-m9050','SW-M9050-L',66,'SW-M9050-R',66],
    ['st-rx820','ST-RX820-L',283,'ST-RX820-R',289],
    ['st-rx600','ST-RX600-L',306,'ST-RX600-R',307],
    ['st-rx400','ST-RX400-L',306,'ST-RX400-R',307],
    ['st-r8070','ST-R8070-L',180,'ST-R8070-R',180],
  ]) {
    const id = `shimano-${slug}`;
    const grams = leftWeight + rightWeight;
    const {data} = await (await request.get(`/api/v1/components/${id}.json`)).json();
    expect(data).toMatchObject({weight_g:grams, specifications:{
      weight_basis:'Pair', weight_method:'Sum of manufacturer side weights',
      left_model:left, right_model:right, left_weight_g:leftWeight, right_weight_g:rightWeight,
    }});
    expect(data.sources.some(source => source.url.includes('_Specifications_') && source.url.includes('#page='))).toBe(true);
    const entry = index.find(record => record.model === data.model_number);
    expect(entry).toMatchObject({weight_g:grams,weight_basis:'Pair'});
    await page.goto(entry.url);
    const weight = page.locator('dl > div').filter({has:page.getByRole('term').filter({hasText:/^Weight$/})});
    await expect(weight.locator('dd > span')).toHaveText(`${grams} g`);
    await expect(weight).toContainText(`Calculated pair weight: ${leftWeight} g (${left}) + ${rightWeight} g (${right}) = ${grams} g`);
  }
  // A later revision's figures must not be transferred to the original SL-M980.
  const {data:original} = await (await request.get('/api/v1/components/shimano-sl-m980.json')).json();
  expect(original.weight_g).toBeNull();
  expect(original.weight_description).toContain('different revisions');
});
