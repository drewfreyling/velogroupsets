import {test, expect} from '@playwright/test';

const weightRow = page => page.locator('dl > div').filter({
  has:page.getByRole('term').filter({hasText:/^Weight$/}),
});

test('Ultegra SL calipers have their own source and weight', async ({page, request}) => {
  await page.goto('/groupsets/shimano/ultegra-sl-6600/');
  await page.getByRole('link', {name:'BR-6600-G', exact:true}).click();
  await expect(weightRow(page).locator('dd > span')).toHaveText('320 g');
  const {data:sl} = await (await request.get('/api/v1/components/shimano-br-6600-g.json')).json();
  const {data:standard} = await (await request.get('/api/v1/components/shimano-br-6600.json')).json();
  expect(sl).toMatchObject({weight_g:320,groupset_ids:['shimano-ultegra-sl-6600'],specifications:{weight_basis:'Pair',includes_brake_pads:true,includes_mounting_bolts:true}});
  expect(standard.weight_g).toBe(330);
  expect(sl.technical_document.url).toContain('2008_Trade_Support_Manual.pdf#page=202');
});

test('Di2 cage variants display their own weights and preserve sourced limits in the API', async ({page, request}) => {
  await page.goto('/components/shimano/rd-r8050-gs/');
  await expect(weightRow(page).locator('dd > span')).toHaveText('247 g');
  const {data:gs} = await (await request.get('/api/v1/components/shimano-rd-r8050-gs.json')).json();
  const {data:ss} = await (await request.get('/api/v1/components/shimano-rd-r8050-ss.json')).json();
  expect(gs.specifications).toMatchObject({total_capacity_teeth:37,maximum_sprocket_teeth:34,minimum_sprocket_teeth:11,maximum_front_difference_teeth:16});
  expect(ss).toMatchObject({weight_g:240,specifications:{total_capacity_teeth:33,maximum_sprocket_teeth:30}});
});

test('cassette references retain gearing while individual controls do not acquire pair weights', async ({page, request}) => {
  await page.goto('/components/shimano/cs-r9100/');
  await expect(weightRow(page).locator('dd > span')).toHaveText('175 g');
  const {data} = await (await request.get('/api/v1/components/shimano-cs-r9100.json')).json();
  expect(data.specifications).toMatchObject({rear_speeds:11,sprocket_range:'11–25T',sprockets_teeth:[11,12,13,14,15,16,17,19,21,23,25]});
  const {data:rimPair} = await (await request.get('/api/v1/components/shimano-st-r8050.json')).json();
  expect(rimPair).toMatchObject({weight_g:295,specifications:{weight_basis:'Pair'}});
  const {data:ttPair} = await (await request.get('/api/v1/components/shimano-st-r9160.json')).json();
  expect(ttPair).toMatchObject({weight_g:127,specifications:{weight_basis:'Pair'}});
  for (const [model, grams] of [['st-r9120',505],['st-r9170',320]]) {
    const {data:pair} = await (await request.get(`/api/v1/components/shimano-${model}.json`)).json();
    expect(pair).toMatchObject({weight_g:grams,specifications:{weight_basis:'Pair'}});
    await page.goto(`/components/shimano/${model}/`);
    await expect(weightRow(page).locator('dd > span')).toHaveText(`${grams} g`);
    await expect(weightRow(page)).toContainText('pair');
  }
  for (const model of ['st-r8000','st-r8070']) {
    const {data:unknown} = await (await request.get(`/api/v1/components/shimano-${model}.json`)).json();
    expect(unknown).toMatchObject({weight_g:null,specifications:{weight_basis:'Pair'}});
  }
});
