import { test, expect } from '@playwright/test';

test('Chorus speed filters keep separate controls and a shared crank identity', async ({page}) => {
  await page.goto('/catalogue/?groupset=campagnolo-chorus-8-speed&type=shifters');
  await expect(page.getByRole('link',{name:'EC-08CHCG',exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'EC-09CHCG',exact:true})).not.toBeVisible();
  await page.getByRole('combobox',{name:'Groupset',exact:true}).selectOption('campagnolo-chorus-9-speed');
  await expect(page.getByRole('link',{name:'EC-09CHCG',exact:true})).toBeVisible();
  await page.getByRole('combobox',{name:'Component type',exact:true}).selectOption('crankset');
  await page.getByRole('link',{name:'FC-21CH',exact:true}).click();
  for (const name of ['Chorus 8-speed','Chorus 9-speed']) {
    await expect(page.locator('dl').getByRole('link',{name,exact:true})).toHaveCount(1);
  }
});

test('browse additional 1990s Campagnolo families and their original technical drawings', async ({page}) => {
  for (const [slug,model,number] of [['athena-8-speed','RD-41AT',26],['veloce-8-speed','RD-31VL',28],['mirage-8-speed','RDI11MI',29],['avanti-8-speed','RDI11AV',30],['racing-triple-8-speed','RD-11RA3',27]]) {
    await page.goto(`/groupsets/campagnolo/${slug}/`);
    await page.getByRole('link',{name:model,exact:true}).click();
    await expect(page.getByRole('heading',{name:model,level:1,exact:true})).toBeVisible();
    await expect(page.getByRole('link',{name:'Read Campagnolo technical specification'})).toHaveAttribute('href',`https://www.disraeligears.co.uk/site/campagnolo_spare_parts_catalogue_-_1997_page_${number}.html`);
  }
});

test('browse 1980s groups and retain a single shared seatpost with unknown weight', async ({page,request}) => {
  for (const [slug,model] of [['c-record-180','0102050'],['victory-269','0102045'],['triomphe-267','0102055'],['chorus-700','706/101'],['croce-daune-b000','B040'],['athena-d000a','D056']]) {
    await page.goto(`/groupsets/campagnolo/${slug}/`);
    await page.getByRole('link',{name:model,exact:true}).click();
    await expect(page.getByRole('heading',{name:model,level:1,exact:true})).toBeVisible();
  }
  await page.goto('/components/campagnolo/c0r2/');
  for (const name of ['Croce d’Aune B000','Athena D000A']) {
    await expect(page.locator('dl').getByRole('link',{name,exact:true})).toHaveCount(1);
  }
  const records=await (await request.get('/search-index.json')).json();
  expect(records.filter(c=>c.id==='campagnolo-c0r2')).toHaveLength(1);
  expect(records.find(c=>c.id==='campagnolo-c0r2').weight_g).toBeNull();
  const earlyShifters=records.filter(c=>c.manufacturer==='Campagnolo' && c.type==='shifters' && /Victory 269|Triomphe 267/.test(c.groupsets));
  expect(earlyShifters).toHaveLength(2);
});
