import {test,expect} from '@playwright/test';

test('browse a sourced early component without a technical-document link',async({page})=>{
  await page.goto('/groupsets/shimano/dura-ace-original/');
  await page.getByRole('link',{name:'G-520',exact:true}).click();
  await expect(page.getByRole('heading',{name:'G-520',level:1})).toBeVisible();
  await expect(page.getByText('No technical document linked. See the sources below.',{exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'Read Shimano technical specification'})).toHaveCount(0);
  await expect(page.getByRole('heading',{name:'Sources',level:2})).toBeVisible();
  await expect(page.locator('a[href*="12pM10q10Sb3kbiDgQqn5LryPQ9ZRhqu2"]')).toHaveCount(1);
  await expect(page.getByText('300 g',{exact:true})).toBeVisible();
  await page.goto('/components/shimano/h-731/');
  await expect(page.getByText('Not yet sourced',{exact:true})).toBeVisible();
  await expect(page.getByText('Any weight added must exclude skewers.',{exact:true})).toBeVisible();
});

test('early EX codes remain searchable and link to their catalogue evidence',async({page,request})=>{
  await page.goto('/catalogue/?q=MA-200');
  await page.getByRole('link',{name:'MA-200',exact:true}).click();
  await expect(page.getByRole('heading',{name:'MA-200',level:1})).toBeVisible();
  await expect(page.getByText('206 g',{exact:true})).toBeVisible();
  await expect(page.locator('a[href="https://vintagecannondale.com/cannondale/shimano/shimano78.pdf"]')).toHaveCount(1);
  const response=await request.get('/api/v1/components/shimano-ma-200.json');
  expect(response.headers()['x-catalogue-delivery']).toBe('static-assets');
  expect((await response.json()).data).toMatchObject({technical_document:null,weight_g:206});
});

test('original 600 bar-end controls use the explicitly published pair weight',async({page,request})=>{
  await page.goto('/groupsets/shimano/600-original/');
  await page.getByRole('link',{name:'SL-BC10',exact:true}).click();
  await expect(page.getByRole('heading',{name:'SL-BC10',level:1})).toBeVisible();
  await expect(page.getByText('160 g',{exact:true})).toBeVisible();
  await expect(page.getByText('Left and right pair',{exact:true})).toBeVisible();
  const data=(await (await request.get('/api/v1/components/shimano-sl-bc10.json')).json()).data;
  expect(data).toMatchObject({weight_g:160,technical_document:null,specifications:{weight_basis:'Pair'}});
});

test('Integer BB-SL32 weight is separate from BB-AX31 and unweighed crank options',async({page,request})=>{
  await page.goto('/groupsets/shimano/ax-road/');
  await page.getByRole('link',{name:'BB-SL32',exact:true}).click();
  await expect(page.getByRole('heading',{name:'BB-SL32',level:1})).toBeVisible();
  await expect(page.getByText('325 g',{exact:true})).toBeVisible();
  const existing=(await (await request.get('/api/v1/components/shimano-bb-ax31.json')).json()).data;
  expect(existing.weight_g).toBeNull();
  const crank=(await (await request.get('/api/v1/components/shimano-fc-ax21.json')).json()).data;
  expect(crank.weight_g).toBeNull();
  await page.goto('/components/shimano/rd-6101/');
  await expect(page.getByText('Not yet sourced',{exact:true}).first()).toBeVisible();
  const long=(await (await request.get('/api/v1/components/shimano-rd-6101.json')).json()).data;
  expect(long.weight_g).toBeNull();
  expect(long.specifications.maximum_sprocket_teeth).toBeNull();
});
