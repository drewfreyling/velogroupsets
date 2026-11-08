import { test, expect } from '@playwright/test';
import { manufacturers, groupsets } from '../../apps/web/src/lib/catalogue.mjs';

test('each manufacturer lists its groupsets oldest first with a single start year', async ({page}) => {
  for (const manufacturer of manufacturers) {
    await page.goto(`/manufacturers/${manufacturer.slug}/`);
    const cards=page.getByRole('link').filter({has:page.getByRole('heading',{level:3})});
    await expect(cards).toHaveCount(groupsets.filter(g=>g.manufacturer_id===manufacturer.id).length);
    const labels=await cards.locator('p').filter({hasText:/^Start year: /}).allTextContents();
    expect(labels).toHaveLength(await cards.count());
    const years=labels.map(label=>Number(label.replace('Start year: ','')));
    expect(years.every(year=>Number.isInteger(year))).toBe(true);
    expect(years).toEqual([...years].sort((a,b)=>a-b));
    await expect(page.getByText('end year not documented',{exact:false})).toHaveCount(0);
  }
});

test('groupset details show a start year without a range or discontinued-year wording', async ({page}) => {
  await page.goto('/groupsets/shimano/105-r7000/');
  const row=page.locator('dl > div').filter({has:page.getByRole('term').filter({hasText:/^Start year$/})});
  await expect(row.locator('dd')).toHaveText('2018');
  await expect(page.getByRole('term').filter({hasText:/^Year range$/})).toHaveCount(0);
  await expect(page.getByText('end year not documented',{exact:false})).toHaveCount(0);
});
