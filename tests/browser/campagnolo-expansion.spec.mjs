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

test('1997 rear capacities distinguish short-cage doubles from the long-cage triple', async ({page}) => {
  const row=label=>page.locator('dl > div').filter({has:page.locator('dt',{hasText:new RegExp('^'+label+'$')})}).locator('dd');
  for(const [model,weight,total,largest] of [['rd-09re',230,27,26],['rd-31vl',260,28,28],['rd-11ra3',267,37,28]]){
    await page.goto('/components/campagnolo/'+model+'/');
    await expect(row('Weight').locator('span')).toHaveText(`${weight} g`);
    await expect(row('Total capacity')).toHaveText(`${total}T`);
    await expect(row('Largest sprocket')).toHaveText(`${largest}T`);
    await expect(row('Smallest sprocket')).toHaveText('Not yet sourced');
    await expect(row('Front chainring tooth difference')).toHaveText('Not yet sourced');
    await expect(page.getByRole('link',{name:/1997 Technical Specifications, printed page/})).toHaveAttribute('href','https://mail.prestacycle.co.uk/campybike/downloads/Campagnolo_1994_1999s.zip');
  }
});

test('1997 reference weights retain spindle, braze-on and headset configurations in pages and JSON', async ({page,request}) => {
  for(const [model,weight,configuration] of [['bb-13ra3',294,'115.5 mm square-taper spindle, English / BSA thread, 68 mm shell'],['fd-31sre',89,'braze-on double-chainring version, without a clamp adapter'],['hs-21re',106,'26.4 mm crown-race seat, 30.2 mm cup diameter and 36.5 mm total stack height']]){
    await page.goto('/components/campagnolo/'+model+'/');
    const row=page.locator('dl > div').filter({has:page.locator('dt',{hasText:/^Weight$/})});
    await expect(row.locator('dd > span')).toHaveText(`${weight} g`);await expect(row).toContainText(configuration);
    const json=await request.get('/api/v1/components/campagnolo-'+model+'.json');expect(json.status()).toBe(200);
    expect(json.headers()['x-catalogue-delivery']).toBe('static-assets');expect((await json.json()).data.weight_g).toBe(weight);
  }
  const hub=(await(await request.get('/api/v1/components/campagnolo-hb-30re.json')).json()).data;
  expect(hub.weight_g).toBeNull();expect(hub.weight_excludes_skewers).toBe(true);
});
