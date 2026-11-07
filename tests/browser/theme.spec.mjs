import { test, expect } from '@playwright/test';

const themeKey = 'velogroupsets-theme';

test('system theme is followed until a keyboard toggle is saved across pages and reloads', async ({page}) => {
  await page.emulateMedia({colorScheme:'light'});
  await page.goto('/');
  const toggle = page.getByRole('button', {name:'Dark mode',exact:true});
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(243, 248, 247)');
  await page.emulateMedia({colorScheme:'dark'});
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(11, 21, 20)');
  await toggle.focus();
  await page.keyboard.press('Space');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  expect(await page.evaluate(key => localStorage.getItem(key), themeKey)).toBe('light');
  await page.reload();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(243, 248, 247)');
  await page.getByRole('navigation', {name:'Main navigation'}).getByRole('link', {name:'Catalogue',exact:true}).click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await page.emulateMedia({colorScheme:'light'});
  await page.emulateMedia({colorScheme:'dark'});
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
});

test('brand buttons, links and form surfaces use the specified light and dark colours', async ({page}) => {
  await page.emulateMedia({colorScheme:'light'});
  await page.goto('/');
  const primary = page.getByRole('link', {name:'Search the catalogue',exact:true});
  const link = page.getByRole('link', {name:'See manufacturers',exact:true});
  for (const dark of [false, true]) {
    if (dark) await page.getByRole('button', {name:'Dark mode',exact:true}).click();
    await expect(primary).toHaveCSS('background-color', 'rgb(61, 207, 194)');
    await expect(primary).toHaveCSS('color', 'rgb(16, 32, 31)');
    await expect(link).toHaveCSS('color', dark ? 'rgb(111, 224, 213)' : 'rgb(11, 107, 101)');
    await primary.hover();
    await expect(primary).toHaveCSS('background-color', 'rgb(8, 64, 60)');
    await expect(primary).toHaveCSS('color', 'rgb(230, 242, 240)');
    await page.mouse.move(0,0);
  }
  await page.getByRole('navigation', {name:'Main navigation'}).getByRole('link', {name:'Catalogue',exact:true}).click();
  await expect(page.getByLabel('Search components')).toHaveCSS('background-color', 'rgb(18, 33, 31)');
  await expect(page.getByLabel('Component type')).toHaveCSS('color', 'rgb(230, 242, 240)');
  await page.getByLabel('Search components').fill('FC-R7000');
  await expect(page.locator('#result-count')).toHaveText('1 component');
});

test('the toggle works when storage is blocked and remains usable on mobile', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({colorScheme:'light'});
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {get() {throw new DOMException('Storage blocked', 'SecurityError');}});
  });
  await page.goto('/');
  const toggle = page.getByRole('button', {name:'Dark mode',exact:true});
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(11, 21, 20)');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('without JavaScript the system dark palette still renders and the inactive toggle stays hidden', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled:false,colorScheme:'dark'});
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:8787/');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(11, 21, 20)');
  await expect(page.getByRole('button', {name:'Dark mode',exact:true})).toHaveCount(0);
  await context.close();
});
