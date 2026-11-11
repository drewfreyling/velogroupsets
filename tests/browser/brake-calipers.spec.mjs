import {test, expect} from '@playwright/test';

const detailRow = (page, label) => page.locator('dl > div').filter({
  has: page.getByRole('term').filter({hasText: new RegExp(`^${label}$`)}),
});

test('calipers filter by groupset and retain a published pair total', async ({page, request}) => {
  await page.goto('/catalogue/?groupset=shimano-105-r7000&type=brake-calipers');
  await expect(page.locator('#type')).toHaveValue('brake-calipers');
  await expect(page.locator('#result-count')).toHaveText('4 components');
  await page.getByRole('link', {name:'BR-R7000', exact:true}).click();
  await expect(page.getByRole('heading', {name:'BR-R7000', exact:true, level:1})).toBeVisible();
  await expect(detailRow(page, 'Weight').locator('dd > span')).toHaveText('379 g');
  await expect(detailRow(page, 'Weight basis')).toContainText('Front and rear pair');
  await expect(detailRow(page, 'Weight basis')).toContainText('Includes brake pads and mounting bolts.');
  const index = await (await request.get('/search-index.json')).json();
  expect(index.find(c=>c.id==='shimano-br-r7000')).toMatchObject({weight_g:379, weight_basis:'Pair'});
});

test('separate front and rear calipers keep the same manufacturer model number', async ({page, request}) => {
  await page.goto('/groupsets/shimano/ultegra-r8000/');
  const links = page.getByRole('link', {name:'BR-R8000', exact:true});
  await expect(links).toHaveCount(2);
  await expect(links.nth(0)).toHaveAttribute('href', '/components/shimano/br-r8000-front/');
  await expect(links.nth(1)).toHaveAttribute('href', '/components/shimano/br-r8000-rear/');
  for (const [position, grams] of [['Front',182], ['Rear',178]]) {
    await page.goto(`/components/shimano/br-r8000-${position.toLowerCase()}/`);
    await expect(page.getByRole('heading', {name:'BR-R8000', exact:true, level:1})).toBeVisible();
    await expect(detailRow(page, 'Weight').locator('dd > span')).toHaveText(`${grams} g`);
    await expect(detailRow(page, 'Weight basis')).toContainText(`${position} caliper`);
    const {data} = await (await request.get(`/api/v1/components/shimano-br-r8000-${position.toLowerCase()}.json`)).json();
    expect(data).toMatchObject({model_number:'BR-R8000',weight_g:grams,specifications:{weight_basis:position,includes_brake_pads:true,includes_mounting_bolts:true}});
  }
});

test('unknown caliper weights keep their basis and remain readable without JavaScript', async ({page, request}) => {
  await page.route('**/*.js', route=>route.abort());
  await page.goto('/components/shimano/br-4700/');
  await expect(detailRow(page, 'Weight').locator('dd > span')).toHaveText('Not yet sourced');
  await expect(detailRow(page, 'Weight basis').locator('dd')).toHaveText('Front and rear pair');
  const {data} = await (await request.get('/api/v1/components/shimano-br-4700.json')).json();
  expect(data.weight_g).toBeNull();
  expect(data.specifications.weight_basis).toBe('Pair');
  expect(data.specifications.includes_brake_pads).toBeUndefined();
});
