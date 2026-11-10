import {test,expect} from '@playwright/test';

const row=(page,label)=>page.locator('dl > div').filter({has:page.locator('dt',{hasText:new RegExp('^'+label+'$')})}).locator('dd');

test('handbook limits preserve contributor weights and separate Tiagra and Sora cages',async({page,request})=>{
  for(const [id,grams,total,largest,smallest,front] of [
    ['shimano-rd-4400-ss',264,29,27,11,14],['shimano-rd-3300-ss',266,29,27,11,14],
    ['shimano-rd-a551-ss',273,28,28,12,13],['shimano-rd-4400-gs',280,37,27,11,22],
  ]){
    const record=(await(await request.get('/api/v1/components/'+id+'.json')).json()).data;
    expect(record.weight_g).toBe(grams);
    expect(record.specifications).toMatchObject({total_capacity_teeth:total,maximum_sprocket_teeth:largest,minimum_sprocket_teeth:smallest,maximum_front_difference_teeth:front});
    await page.goto('/components/shimano/'+id.slice('shimano-'.length)+'/');
    await expect(row(page,'Weight').locator('span')).toHaveText(grams+' g');
    await expect(row(page,'Total capacity')).toHaveText(total+'T');
    await expect(row(page,'Front chainring tooth difference')).toHaveText(front+'T');
  }
  const gs=(await(await request.get('/api/v1/components/shimano-rd-4500-gs.json')).json()).data;
  const ss=(await(await request.get('/api/v1/components/shimano-rd-4500-ss.json')).json()).data;
  expect(gs.specifications.total_capacity_teeth).toBe(37);expect(ss.specifications.total_capacity_teeth).toBe(31);
});

test('catalogue weights retain exact crank and cassette references in static JSON and pages',async({page,request})=>{
  for(const [slug,grams,configuration] of [['fc-7700',599,'175 mm arms and 53/39T'],['fc-4400',776,'170 mm arms and 52/39T'],['cs-7700',159.5,'12–23T'],['st-4400',490,'left/right ST-4400']]){
    const response=await request.get('/api/v1/components/shimano-'+slug+'.json');expect(response.status()).toBe(200);expect(response.headers()['x-catalogue-delivery']).toBe('static-assets');
    const record=(await response.json()).data;expect(record.weight_g).toBe(grams);
    await page.goto('/components/shimano/'+slug+'/');
    await expect(row(page,'Weight').locator('span')).toHaveText(grams+' g');await expect(row(page,'Weight')).toContainText(configuration);
  }
  const crank=(await(await request.get('/api/v1/components/shimano-fc-7700.json')).json()).data;
  expect(crank.specifications.crank_length_mm).toBe(175);expect(crank.specifications.includes_bottom_bracket).toBe(false);
});

test('manufacturer evidence does not turn catalogue options into universal limits',async({page,request})=>{
  await page.goto('/components/sram/rd-red-a1/');
  await expect(row(page,'Total capacity')).toHaveText('33T');await expect(row(page,'Largest sprocket')).toHaveText('28T');
  await expect(row(page,'Smallest sprocket')).toHaveText('11T');await expect(row(page,'Front chainring tooth difference')).toHaveText('16T');
  for(const id of ['sram-rd-frc-a1','sram-rd-riv-a1']){
    const record=(await(await request.get('/api/v1/components/'+id+'.json')).json()).data;
    expect(record.specifications.total_capacity_teeth).toBeNull();expect(record.specifications.maximum_sprocket_teeth).toBeNull();
  }
  await page.goto('/components/campagnolo/rd15-ch1eps/');await expect(row(page,'Weight').locator('span')).toHaveText('225 g');await expect(row(page,'Total capacity')).toHaveText('33T');await expect(row(page,'Largest sprocket')).toHaveText('Not yet sourced');
  await page.goto('/components/campagnolo/fd15-re2b/');await expect(row(page,'Weight').locator('span')).toHaveText('Not yet sourced');await expect(row(page,'capacity teeth')).toHaveText('16');
  await page.goto('/components/shimano/rd-7700/');await expect(row(page,'Total capacity')).toHaveText('26T');await expect(row(page,'catalogue capacity note')).toContainText('2001 catalogue lists 29T');
});
