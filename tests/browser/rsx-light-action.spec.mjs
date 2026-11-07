import { test, expect } from '@playwright/test';

test('browse RSX double and triple parts from the manufacturer page', async ({page}) => {
  await page.goto('/manufacturers/shimano/');
  await page.getByRole('link').filter({has:page.getByRole('heading',{name:'RSX A410/A416',level:3,exact:true})}).click();
  await expect(page.getByRole('heading',{name:'RSX A410/A416',level:1,exact:true})).toBeVisible();
  await page.getByRole('link',{name:'FC-A413',exact:true}).click();
  await expect(page.getByRole('heading',{name:'FC-A413',level:1,exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'Read Shimano technical specification'})).toHaveAttribute('href',/si\.shimano\.com/);
  await expect(page.getByText('46, 36, 26',{exact:false})).toBeVisible();
});

test('RSX model search distinguishes seven- and eight-speed controls within one family', async ({page}) => {
  await page.goto('/catalogue/?groupset=shimano-rsx&type=shifters');
  const query=page.getByLabel('Search components');
  await expect(page.locator('#result-count')).toHaveText('4 components');
  await query.fill('ST-A410');
  await expect(page.locator('#result-count')).toHaveText('1 component');
  await expect(page.getByRole('link',{name:'ST-A410',exact:true})).toBeVisible();
  await query.fill('ST-A417');
  await expect(page.locator('#result-count')).toHaveText('1 component');
  await expect(page.getByRole('link',{name:'ST-A417',exact:true})).toBeVisible();
  await page.reload();
  await expect(query).toHaveValue('ST-A417');
  await page.getByRole('link',{name:'ST-A417',exact:true}).click();
  await expect(page.getByRole('heading',{name:'ST-A417',level:1,exact:true})).toBeVisible();
});

test('Light Action cage variants retain separate weights and unsourced limits', async ({page}) => {
  await page.goto('/catalogue/?groupset=shimano-light-action&type=rear-derailleur&q=L532');
  await expect(page.locator('#result-count')).toHaveText('3 components');
  await page.getByRole('link',{name:'RD-L532-GS',exact:true}).click();
  await expect(page.getByText('293 g',{exact:true})).toBeVisible();
  const minimum=page.locator('dl > div').filter({has:page.getByRole('term').filter({hasText:/^Smallest sprocket$/})});
  await expect(minimum.locator('dd')).toHaveText('Not yet sourced');
  await expect(page.getByText('The 1987 catalogue specifies SIS compatibility for the SS version only;',{exact:false})).toBeVisible();
});
