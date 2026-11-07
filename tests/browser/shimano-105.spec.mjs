import { test, expect } from '@playwright/test';

const offerings = [
  ['105 Golden Arrow A105', 'RD-A105', 1982],
  ['105 1050', 'FC-1050-BP', 1986],
  ['105 SC 1055', 'ST-1055', 1989],
  ['105 5500', 'FC-5501', 1998],
  ['105 5600', 'FC-5600', 2005],
  ['105 5700', 'FC-5700', 2010],
  ['105 5800', 'FC-5800', 2014],
  ['105 R7000', 'FC-R7000', 2018],
  ['105 Di2 R7100', 'RD-R7150', 2022],
  ['105 R7100', 'RD-R7100', 2023],
];

test('browse every Shimano 105 generation and both current shifting systems', async ({page}) => {
  for (const [name, model, year] of offerings) {
    await page.goto('/manufacturers/shimano/');
    const card = page.getByRole('link').filter({has:page.getByRole('heading', {name,level:3,exact:true})});
    await expect(card).toContainText(`${year} – end year not documented`);
    await card.click();
    await expect(page.getByRole('heading', {name,level:1,exact:true})).toBeVisible();
    await page.getByRole('link', {name:model,exact:true}).click();
    await expect(page.getByRole('heading', {name:model,level:1,exact:true})).toBeVisible();
    await expect(page.getByRole('heading', {name:'Sources',level:2})).toBeVisible();
    await expect(page.getByRole('link', {name:'Read Shimano technical specification'})).toHaveAttribute('href', /^https:\/\/(si|productinfo)\.shimano\.com\//);
  }
});

test('R7100 mechanical and Di2 share canonical parts while keeping their derailleurs separate', async ({page}) => {
  await page.goto('/catalogue/?groupset=shimano-105-r7100&type=rear-derailleur');
  const group = page.getByRole('combobox', {name:'Groupset',exact:true});
  const type = page.getByRole('combobox', {name:'Component type',exact:true});
  await expect(page.locator('#result-count')).toHaveText('1 component');
  await expect(page.getByRole('link', {name:'RD-R7100',exact:true})).toBeVisible();
  await expect(page.getByRole('link', {name:'RD-R7150',exact:true})).not.toBeVisible();
  await group.selectOption('shimano-105-di2-r7100');
  await expect(page.getByRole('link', {name:'RD-R7150',exact:true})).toBeVisible();
  await expect(page.getByRole('link', {name:'RD-R7100',exact:true})).not.toBeVisible();
  await type.selectOption('crankset');
  const crank = page.getByRole('link', {name:'FC-R7100',exact:true});
  await expect(crank).toHaveAttribute('href', '/components/shimano/fc-r7100/');
  await group.selectOption('shimano-105-r7100');
  await expect(crank).toBeVisible();
  await crank.click();
  await expect(page.getByText('754 g', {exact:true})).toBeVisible();
  const membership = page.locator('dl');
  await expect(membership.getByRole('link', {name:'105 R7100',exact:true})).toHaveCount(1);
  await expect(membership.getByRole('link', {name:'105 Di2 R7100',exact:true})).toHaveCount(1);
});
