import { test, expect } from '@playwright/test';
import { components, componentUrl } from '../../apps/web/src/lib/catalogue.mjs';

const limits = [
  ['total_capacity_teeth', 'Total capacity'],
  ['maximum_sprocket_teeth', 'Largest sprocket'],
  ['minimum_sprocket_teeth', 'Smallest sprocket'],
  ['maximum_front_difference_teeth', 'Front chainring tooth difference'],
];

for (const component of components.filter(part => part.type === 'rear-derailleur')) {
  test(`${component.model_number} shows all four sourced limits with tooth units`, async ({page}) => {
    await page.goto(componentUrl(component));
    for (const [key, label] of limits) {
      const row = page.locator('dl > div').filter({has:page.getByRole('term').filter({hasText:new RegExp(`^${label}$`)})});
      await expect(row).toHaveCount(1);
      await expect(row.locator('dd')).toHaveText(component.specifications[key] == null ? 'Not yet sourced' : `${component.specifications[key]}T`);
    }
    await expect(page.getByRole('button', {name:'Explain rear derailleur cage codes'})).toHaveCount(1);
  });
}

test('cage help opens with keyboard focus, dismisses with Escape and works on tap', async ({page, isMobile}) => {
  await page.goto('/components/shimano/rd-r7000-gs/');
  const button = page.getByRole('button', {name:'Explain rear derailleur cage codes'});
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).not.toBeVisible();
  await button.focus();
  await expect(tooltip).toBeVisible();
  await expect(button).toHaveAccessibleDescription(/SS: short cage.*GS: medium cage.*LS\/SGS: long cage/);
  await expect(tooltip).toContainText('check the model’s published capacity and sprocket limits');
  await button.press('Escape');
  await expect(tooltip).not.toBeVisible();
  if (isMobile) await button.tap();
  else await button.click();
  await expect(tooltip).toBeVisible();
  const bounds = await tooltip.boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(page.viewportSize().width);
  await page.getByRole('heading', {name:'RD-R7000-GS',level:1}).click();
  await expect(tooltip).not.toBeVisible();
});

test('cage help stays open while hovering the explanation and supports an unsourced cage code', async ({page}) => {
  await page.goto('/components/shimano/rd-6400/');
  const cage = page.locator('dl > div').filter({has:page.getByRole('term').filter({hasText:/^Cage code$/})});
  await expect(cage.locator('dd')).toContainText('Not yet sourced');
  const button = page.getByRole('button', {name:'Explain rear derailleur cage codes'});
  const tooltip = page.getByRole('tooltip');
  await button.hover();
  await expect(tooltip).toBeVisible();
  await tooltip.hover();
  await expect(tooltip).toBeVisible();
  const bounds = await tooltip.boundingBox();
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(page.viewportSize().width);
  await page.getByRole('heading', {name:'RD-6400',level:1}).hover();
  await expect(tooltip).not.toBeVisible();
});

test('front derailleurs do not display rear cassette limits or cage help', async ({page}) => {
  await page.goto('/components/shimano/fd-6600-f/');
  await expect(page.getByRole('heading', {name:'FD-6600-F',level:1})).toBeVisible();
  await expect(page.getByRole('term').filter({hasText:/^Largest sprocket$/})).toHaveCount(0);
  await expect(page.getByRole('button', {name:'Explain rear derailleur cage codes'})).toHaveCount(0);
});

test.describe('without JavaScript', () => {
  test.use({javaScriptEnabled:false});
  test('rear limits and the shared cage explanation remain readable', async ({page}) => {
    await page.goto('/components/shimano/rd-r7000-gs/');
    await expect(page.getByText('39T', {exact:true})).toBeVisible();
    await expect(page.locator('noscript').getByText(/SS: short cage\. GS: medium cage/)).toBeVisible();
    await expect(page.getByRole('button', {name:'Explain rear derailleur cage codes'})).toHaveCount(0);
  });
});
