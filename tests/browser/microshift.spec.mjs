import {test, expect} from '@playwright/test';

const detail=(page,label)=>page.locator('dl > div').filter({has:page.getByRole('term').filter({hasText:new RegExp(`^${label}$`)})});

test('browse the fourth manufacturer and filter its road and MTB offerings',async({page})=>{
  await page.goto('/manufacturers/');
  await page.getByRole('link').filter({has:page.getByRole('heading',{name:'microSHIFT',exact:true})}).click();
  await expect(page.getByRole('heading',{name:'microSHIFT',level:1,exact:true})).toBeVisible();
  const category=page.getByRole('combobox',{name:'Riding category'});
  await category.selectOption('road');
  await expect(page.getByRole('link').filter({has:page.getByRole('heading',{name:'Arsis 11',exact:true})})).toBeVisible();
  await expect(page.getByRole('link').filter({has:page.getByRole('heading',{name:'XCD 11',exact:true})})).not.toBeVisible();
  await category.selectOption('mtb');
  await page.getByRole('link').filter({has:page.getByRole('heading',{name:'XCD 11',exact:true})}).click();
  await page.getByRole('link',{name:'RD-M78L',exact:true}).click();
  await expect(page.getByRole('heading',{name:'RD-M78L',level:1,exact:true})).toBeVisible();
  await expect(detail(page,'Largest sprocket').locator('dd')).toHaveText('42T');
  await expect(detail(page,'Smallest sprocket').locator('dd')).toHaveText('11T');
  const source=page.getByRole('link',{name:'Read microSHIFT technical specification'});
  await expect(source).toHaveAttribute('href','https://microshift.com/wp-content/uploads/2021/03/microSHIFT-catalogue-2017.pdf#page=26');
  await expect(source).toHaveAccessibleName(/opens in new tab/);
});

test('cassette gearing disambiguates shared model numbers in search and static API links',async({page,request})=>{
  await page.goto('/catalogue/?groupset=microshift-xcd-11&type=cassette');
  await expect(page.getByRole('link',{name:'CS-G110',exact:true})).toHaveCount(2);
  await page.locator('#query').fill('11–42T');
  await expect(page.getByRole('link',{name:'CS-G110',exact:true})).toHaveCount(1);
  await page.getByRole('link',{name:'CS-G110',exact:true}).click();
  await expect(page).toHaveURL(/\/components\/microshift\/cs-g110-11-42\/$/);
  await expect(detail(page,'Weight').locator('dd > span')).toHaveText('441.5 g');
  const response=await request.get('/api/v1/components/microshift-cs-g110-11-42.json');
  expect(response.headers()['x-catalogue-delivery']).toBe('static-assets');
  const {data}=await response.json();
  expect(data.manufacturer_id).toBe('microshift');
  expect(data.specifications.sprocket_range).toBe('11–42T');
  expect(data.specifications.sprockets_teeth).toHaveLength(11);
  expect(data.groupset_ids).toEqual(['microshift-xcd-11']);
});
