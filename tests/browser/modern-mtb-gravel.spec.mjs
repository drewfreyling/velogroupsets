import {test,expect} from '@playwright/test';
const detail=(page,label)=>page.locator('dl > div').filter({has:page.getByRole('term').filter({hasText:new RegExp(`^${label}$`)})});

test('MTB search finds real single controls and retains their weight basis',async({page,request})=>{
  await page.goto('/catalogue/?category=mtb&type=shifters');
  await page.locator('#query').fill('SL-M9505-R');
  await page.getByRole('link',{name:'SL-M9505-R',exact:true}).click();
  await expect(page.getByRole('heading',{name:'SL-M9505-R',level:1,exact:true})).toBeVisible();
  await expect(detail(page,'Weight basis').locator('dd')).toHaveText('Single right-hand control');
  await expect(detail(page,'Weight').locator('dd > span')).toHaveText('119 g');
  const response=await request.get('/api/v1/components/microshift-sl-m9505-r.json');
  expect(response.headers()['x-catalogue-delivery']).toBe('static-assets');
  const {data}=await response.json();
  expect(data.specifications).toMatchObject({weight_basis:'Single',control_side:'Right',front_speeds:1,rear_speeds:10});
});

test('Sword one-by drop-bar controls remain a complete pair',async({page,request})=>{
  await page.goto('/groupsets/microshift/sword/');
  await page.getByRole('link',{name:'SB-G7000',exact:true}).click();
  await expect(detail(page,'Weight basis').locator('dd')).toHaveText('Left and right pair');
  await expect(detail(page,'Weight').locator('dd > span')).toHaveText('466 g');
  await expect(detail(page,'Weight').locator('dd')).toContainText('left unit is brake-only');
  for (const [model, leftWeight, grams] of [['SB-G7000',190,466],['SB-G7020',276,552]]) {
    const {data} = await (await request.get(`/api/v1/components/microshift-${model.toLowerCase()}.json`)).json();
    expect(data).toMatchObject({weight_g:grams,specifications:{weight_basis:'Pair',weight_method:'Sum of manufacturer side weights',left_model:`${model} (left)`,right_model:`${model} (right)`,left_weight_g:leftWeight,right_weight_g:276}});
    await page.goto(`/components/microshift/${model.toLowerCase()}/`);
    await expect(detail(page,'Weight').locator('dd > span')).toHaveText(`${grams} g`);
    await expect(detail(page,'Weight')).toContainText('Calculated pair weight:');
  }
});

test('shared microSHIFT cassettes have one identity across MTB and gravel',async({page,request})=>{
  for(const group of ['advent-x','sword']){
    await page.goto(`/groupsets/microshift/${group}/`);
    await page.getByRole('link',{name:'CS-G104',exact:true}).click();
    await expect(page).toHaveURL(/\/components\/microshift\/cs-g104-11-48\/$/);
  }
  const {data}=await(await request.get('/api/v1/components/microshift-cs-g104-11-48.json')).json();
  expect(data.groupset_ids).toEqual(['microshift-advent-x','microshift-sword']);
  expect(data.weight_g).toBe(424);expect(data.specifications.sprockets_teeth).toHaveLength(10);
});

test('GRX mechanical and Di2 ranges share the documented double crank',async({page,request})=>{
  for(const group of ['grx-rx820','grx-di2-rx825']){
    await page.goto(`/groupsets/shimano/${group}/`);
    await page.getByRole('link',{name:'FC-RX820-2',exact:true}).click();
    await expect(page).toHaveURL(/\/components\/shimano\/fc-rx820-2\/$/);
  }
  const {data}=await(await request.get('/api/v1/components/shimano-fc-rx820-2.json')).json();
  expect(data).toMatchObject({weight_g:718,specifications:{crank_length_mm:170,chainrings_teeth:[48,31],includes_bottom_bracket:false}});
  await page.goto('/components/shimano/st-rx825/');
  await expect(detail(page,'Weight basis').locator('dd')).toHaveText('Left and right pair');
  await expect(detail(page,'Weight').locator('dd > span')).toHaveText('415 g');
});

test('SRAM separates Eagle from Transmission and explains ambidextrous Pod configuration',async({page,request})=>{
  await page.goto('/groupsets/sram/eagle-90-transmission/');
  await page.getByRole('link',{name:'SL-90-A1',exact:true}).click();
  await expect(detail(page,'Weight basis').locator('dd')).toHaveText('Single right-hand control');
  await expect(detail(page,'Weight').locator('dd > span')).toHaveText('135 g');
  await page.goto('/components/sram/ec-axs-pod-d1-right/');
  await expect(page.getByRole('heading',{name:'EC-AXS-POD-D1',level:1,exact:true})).toBeVisible();
  await expect(detail(page,'reference configuration').locator('dd')).toContainText('Hardware supports left or right installation');
  const {data}=await(await request.get('/api/v1/components/sram-rd-gx-1-b2.json')).json();
  expect(data.groupset_ids).toEqual(['sram-gx-eagle']);
  expect(data.specifications).toMatchObject({maximum_sprocket_teeth:52,minimum_largest_sprocket_teeth:50,minimum_sprocket_teeth:null});
});
