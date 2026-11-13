import {test, expect} from '@playwright/test';

const detailRow = (page, label) => page.locator('dl > div').filter({
  has: page.getByRole('term').filter({hasText:new RegExp(`^${label}$`)}),
});

test('2005 Ultegra caliper reference displays the complete pair and manufacturer source', async ({page, request}) => {
  await page.goto('/components/shimano/br-6600/');
  await expect(detailRow(page, 'Weight').locator('dd > span')).toHaveText('330 g');
  await expect(detailRow(page, 'Weight basis')).toContainText('Front and rear pair');
  await expect(detailRow(page, 'Weight basis')).toContainText('Includes brake pads and mounting bolts.');
  await expect(page.getByRole('link', {name:/2005 Trade Sales Support Manual, PDF page 176/}).first()).toHaveAttribute('href', /2005_Trade_Sales_Support_Manual\.pdf#page=176$/);
  const {data} = await (await request.get('/api/v1/components/shimano-br-6600.json')).json();
  expect(data).toMatchObject({weight_g:330,specifications:{weight_basis:'Pair',standard_brake_pads:'R55C2',includes_brake_pads:true,includes_mounting_bolts:true}});
});

test('the detailed hub-only reference is used while incomplete pair and crank references stay unknown', async ({page, request}) => {
  await page.goto('/components/shimano/fh-7800/');
  await expect(detailRow(page, 'Weight').locator('dd > span')).toHaveText('264 g');
  const {data} = await (await request.get('/api/v1/components/shimano-fh-7800.json')).json();
  expect(data).toMatchObject({weight_g:264,weight_excludes_skewers:true});
  for (const model of ['st-7703','fc-7800']) {
    const {data:unknown} = await (await request.get(`/api/v1/components/shimano-${model}.json`)).json();
    expect(unknown.weight_g).toBeNull();
  }
});
