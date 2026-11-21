import {test,expect} from '@playwright/test';

test('XLE 11 is separate from XCD 11 and shares one long-cage component with XLE 10',async({page,request})=>{
  await page.goto('/manufacturers/microshift/');
  await page.getByRole('link').filter({has:page.getByRole('heading',{name:'XLE 11',level:3,exact:true})}).click();
  await expect(page.getByRole('heading',{name:'XLE 11',level:1})).toBeVisible();
  await page.getByRole('link',{name:'RD-M665L',exact:true}).click();
  await expect(page).toHaveURL(/\/components\/microshift\/rd-m665l\/$/);
  await expect(page.getByText('380 g',{exact:true})).toBeVisible();
  const shared=(await (await request.get('/api/v1/components/microshift-rd-m665l.json')).json()).data;
  expect(shared.groupset_ids).toEqual(['microshift-xle-10','microshift-xle-11']);
  expect(shared.specifications).toMatchObject({total_capacity_teeth:47,maximum_sprocket_teeth:46,minimum_sprocket_teeth:null});
  await page.goto('/groupsets/microshift/xle-10/');
  await page.getByRole('link',{name:'RD-M665L',exact:true}).click();
  await expect(page).toHaveURL(/\/components\/microshift\/rd-m665l\/$/);
  for(const id of ['microshift-rd-m665m','microshift-rd-m66m']){
    const data=(await (await request.get(`/api/v1/components/${id}.json`)).json()).data;
    expect(data.weight_g).toBeNull();
    expect(data.specifications.total_capacity_teeth).toBe(41);
  }
});

test('single 1x references and complete shifter pairs retain distinct weight bases',async({page,request})=>{
  for(const [model,basis,grams] of [['SL-M851-R','Single right-hand control',112],['SL-M851-2','Left and right pair',225],['SL-M759','Left and right pair',271]]){
    await page.goto(`/components/microshift/${model.toLowerCase()}/`);
    await expect(page.getByRole('heading',{name:model,level:1,exact:true})).toBeVisible();
    await expect(page.getByText(basis,{exact:true})).toBeVisible();
    await expect(page.getByText(`${grams} g`,{exact:true})).toBeVisible();
  }
  const data=(await (await request.get('/api/v1/components/microshift-sl-m9605-er.json')).json()).data;
  expect(data).toMatchObject({weight_g:120,specifications:{weight_basis:'Single',front_speeds:1,rear_speeds:10,e_bike_single_click:true}});
});

test('new cassette variants preserve exact model, gearing and existing reference weights',async({request,page})=>{
  for(const [id,weight,speeds,max] of [['microshift-cs-h113-11-40',617,11,40],['microshift-cs-g113-11-46',499,11,46],['microshift-cs-h103a-11-42',536,10,42],['microshift-cs-h092-11-34',363,9,34],['microshift-cs-h100-11-42',535.5,10,42]]){
    const data=(await (await request.get(`/api/v1/components/${id}.json`)).json()).data;
    expect(data.weight_g).toBe(weight);
    expect(data.specifications.sprockets_teeth).toHaveLength(speeds);
    expect(data.specifications.sprockets_teeth.at(-1)).toBe(max);
  }
  await page.goto('/catalogue/?groupset=microshift-xle-11&type=cassette');
  await expect(page.getByRole('link',{name:'CS-H113',exact:true})).toHaveCount(3);
  await expect(page.getByRole('link',{name:'CS-G113',exact:true})).toHaveCount(2);
});
