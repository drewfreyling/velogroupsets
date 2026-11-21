import {test,expect} from '@playwright/test';

test('ADVENT has sourced single controls and a calculated pair with independently published side weights',async({page,request})=>{
  await page.goto('/groupsets/microshift/advent/');
  await page.getByRole('link',{name:'SL-M819-L / SL-M819-R',exact:true}).click();
  await expect(page.getByText('224 g',{exact:true})).toBeVisible();
  await expect(page.getByText('Left and right pair',{exact:true})).toBeVisible();
  const pair=(await (await request.get('/api/v1/components/microshift-sl-m819-l-sl-m819-r.json')).json()).data;
  expect(pair.specifications).toMatchObject({weight_method:'Sum of manufacturer side weights',left_model:'SL-M819-L',right_model:'SL-M819-R',left_weight_g:112,right_weight_g:112});
  await page.goto('/components/microshift/bs-m19-r/');
  await expect(page.getByText('75 g',{exact:true})).toBeVisible();
  await expect(page.getByText('Single right-hand control',{exact:true})).toBeVisible();
});

test('direct-mount front derailleurs render their actual interface without a fictitious clamp',async({page,request})=>{
  await page.goto('/components/microshift/fd-m622-d/');
  await expect(page.getByRole('heading',{name:'FD-M622-D',level:1})).toBeVisible();
  await expect(page.getByText('135 g',{exact:true})).toBeVisible();
  await expect(page.getByText('Direct mount',{exact:true})).toBeVisible();
  const data=(await (await request.get('/api/v1/components/microshift-fd-m622-d.json')).json()).data;
  expect(data.specifications.mount).toBe('Direct mount');
  expect(data.specifications.clamp_diameter_mm).toBeUndefined();
  const xle=(await (await request.get('/api/v1/groupsets/microshift-xle-11.json')).json()).data;
  expect(xle.start_year).toBe(2021);
});

test('Super Short variants keep their own sprocket limits and unresolved source conflicts stay null',async({request})=>{
  for(const [id,grams,speeds] of [['rd-m6195s',361,9],['rd-m5185s',335,8],['rd-m5180s',284,8]]){
    const data=(await (await request.get(`/api/v1/components/microshift-${id}.json`)).json()).data;
    expect(data).toMatchObject({weight_g:grams,specifications:{rear_speeds:speeds,total_capacity_teeth:27,maximum_sprocket_teeth:38,minimum_sprocket_teeth:null}});
  }
  for(const id of ['sl-m9195-r','rd-m6195l','rd-m619l','cs-h093a-11-42','fd-t492b','fd-m622-b','fd-m622g-b']){
    const data=(await (await request.get(`/api/v1/components/microshift-${id}.json`)).json()).data;
    expect(data.weight_g).toBeNull();
    expect(data.sources.length).toBeGreaterThan(0);
  }
  const cassette=(await (await request.get('/api/v1/components/microshift-cs-h083-11-38.json')).json()).data;
  expect(cassette).toMatchObject({weight_g:421,specifications:{rear_speeds:8,sprockets_teeth:[11,13,15,18,21,24,30,38]}});
});
