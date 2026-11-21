import {test,expect} from '@playwright/test';

test('Acolyte revisions have separate weights without changing the original SpringLock record',async({page,request})=>{
  await page.goto('/groupsets/microshift/acolyte/');
  await page.getByRole('link',{name:'RD-M5185M-B',exact:true}).click();
  await expect(page.getByRole('heading',{name:'RD-M5185M-B',level:1})).toBeVisible();
  await expect(page.getByText('387 g',{exact:true})).toBeVisible();
  const original=(await (await request.get('/api/v1/components/microshift-rd-m5185m.json')).json()).data;
  expect(original.weight_g).toBeNull();
  const revised=(await (await request.get('/api/v1/components/microshift-rd-m5180m-b.json')).json()).data;
  expect(revised).toMatchObject({weight_g:311,specifications:{revision:'Ver.2',clutch:false,maximum_sprocket_teeth:46,minimum_sprocket_teeth:null}});
});

test('e-bike single-click controls remain single right-hand eight-speed shifters',async({page,request})=>{
  await page.goto('/catalogue/?q=SL-M6285-ER');
  await page.getByRole('link',{name:'SL-M6285-ER',exact:true}).click();
  await expect(page.getByText('Single right-hand control',{exact:true})).toBeVisible();
  await expect(page.getByText('130 g',{exact:true})).toBeVisible();
  const data=(await (await request.get('/api/v1/components/microshift-sl-m6285-er.json')).json()).data;
  expect(data.specifications).toMatchObject({weight_basis:'Single',control_side:'Right',front_speeds:1,rear_speeds:8,e_bike_single_click:true,indicator:true});
});

test('same-model cassettes retain their own sprocket combinations and weights',async({page,request})=>{
  await page.goto('/catalogue/?groupset=microshift-acolyte&type=cassette');
  await expect(page.getByRole('link',{name:'CS-H083',exact:true})).toHaveCount(3);
  for(const [suffix,grams,first,last] of [['11-42',505,11,42],['12-42',505,12,42],['12-46',576,12,46]]){
    const data=(await (await request.get(`/api/v1/components/microshift-cs-h083-${suffix}.json`)).json()).data;
    expect(data.weight_g).toBe(grams);
    expect(data.specifications.sprockets_teeth).toHaveLength(8);
    expect(data.specifications.sprockets_teeth.at(0)).toBe(first);
    expect(data.specifications.sprockets_teeth.at(-1)).toBe(last);
  }
  await page.goto('/components/shimano/cs-mt62-13-30/');
  await expect(page.getByRole('heading',{name:'CS-MT62',level:1})).toBeVisible();
  await expect(page.getByText('325 g',{exact:true})).toBeVisible();
});
