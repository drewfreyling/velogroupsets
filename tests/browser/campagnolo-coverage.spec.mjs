import {test,expect} from '@playwright/test';
const detail=(page,label)=>page.locator('dl > div').filter({has:page.getByRole('term').filter({hasText:new RegExp(`^${label}$`)})});

test('previously empty Athena group links to its sourced control pair',async({page})=>{
  await page.goto('/groupsets/campagnolo/athena-9-speed/');
  await page.getByRole('link',{name:'EC-09ATCG',exact:true}).click();
  await expect(page.getByRole('heading',{name:'EC-09ATCG',level:1,exact:true})).toBeVisible();
  await expect(detail(page,'Weight').locator('dd > span')).toHaveText('435 g');
  await expect(detail(page,'Weight basis').locator('dd')).toHaveText('Left and right pair');
  await expect(page.getByRole('link',{name:'Read Campagnolo technical specification'})).toHaveAttribute('href',/^https:\/\/www\.bikeschematics\.com\/.*1998.*#page=46$/);
});

test('Nano Clutch is shared by the documented 1x and All Road builds',async({page,request})=>{
  for(const group of ['super-record-1x13','super-record-all-road-13-speed']){
    await page.goto(`/groupsets/campagnolo/${group}/`);
    await page.getByRole('link',{name:'RD02-SR13WRLC',exact:true}).click();
    await expect(page).toHaveURL(/\/components\/campagnolo\/rd02-sr13wrlc\/$/);
  }
  const response=await request.get('/api/v1/components/campagnolo-rd02-sr13wrlc.json');
  expect(response.headers()['x-catalogue-delivery']).toBe('static-assets');
  const {data}=await response.json();
  expect(data.groupset_ids).toEqual(['campagnolo-super-record-1x13','campagnolo-super-record-all-road-13-speed']);
  expect(data.weight_g).toBe(315);
  expect(data.weight_description).toContain('with battery');
  expect(data.specifications.total_capacity_teeth).toBeNull();
});

test('Ultra cassette variants retain their own tooth ranges and weights',async({page,request})=>{
  await page.goto('/groupsets/campagnolo/super-record-ultra-13-speed/');
  for(const [model,slug,weight,range] of [
    ['CS02-UL1303','cs02-ul1303',215,'10–33T'],
    ['CS02-UL1316','cs02-ul1316',238,'11–36T'],
  ]){
    await expect(page.getByRole('link',{name:model,exact:true})).toHaveAttribute('href',`/components/campagnolo/${slug}/`);
    const {data}=await(await request.get(`/api/v1/components/campagnolo-${slug}.json`)).json();
    expect(data.weight_g).toBe(weight);
    expect(data.specifications.sprocket_range).toBe(range);
  }
});
