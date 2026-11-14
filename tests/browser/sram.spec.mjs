import {test,expect} from '@playwright/test';
const detail=(page,label)=>page.locator('dl > div').filter({has:page.getByRole('term').filter({hasText:new RegExp(`^${label}$`)})});

test('browse SRAM through manufacturer, dated groupset and model-number component links',async({page})=>{
  await page.goto('/manufacturers/');
  await page.getByRole('link',{name:/See SRAM groupsets/}).click();
  await expect(page.getByRole('heading',{name:'SRAM',level:1,exact:true})).toBeVisible();
  const years=(await page.locator('p').allTextContents()).filter(t=>t.startsWith('Start year:')).map(t=>Number(t.match(/\d{4}/)[0]));
  expect(years).toEqual([...years].sort((a,b)=>a-b));
  for(const [name,model] of [['Force 10-speed','SB-FRC-B1'],['Apex 10-speed','SB-APX-A1'],['RED 22','RD-RED-C2'],['RED eTap 11-speed','EB-RED-A1'],['Rival XPLR AXS E1','RD-RIV-1E-E1']]){
    await page.goto('/manufacturers/sram/');
    await page.getByRole('link').filter({has:page.getByRole('heading',{name,level:3,exact:true})}).click();
    await expect(page.getByRole('heading',{name,level:1,exact:true})).toBeVisible();
    await page.getByRole('link',{name:model,exact:true}).click();
    await expect(page.getByRole('heading',{name:model,level:1,exact:true})).toBeVisible();
    const reference=page.getByRole('link',{name:'Read SRAM technical specification'});
    await expect(reference).toHaveAttribute('href',/^https:\/\/www\.sram\.com\//);
    await expect(reference).toHaveAccessibleName(/opens in new tab/);
  }
});

test('filter XPLR systems without confusing the minimum largest sprocket with the smallest sprocket',async({page})=>{
  await page.goto('/catalogue/?groupset=sram-force-xplr-axs-d2&type=rear-derailleur');
  await page.getByRole('link',{name:'RD-FRC-1E-D2',exact:true}).click();
  await expect(detail(page,'Largest sprocket').locator('dd')).toHaveText('44T');
  await expect(detail(page,'Smallest sprocket').locator('dd')).toHaveText('10T');
  await page.goto('/catalogue/?groupset=sram-force-xplr-axs-d2&type=rear-derailleur');
  await page.getByRole('combobox',{name:'Groupset',exact:true}).selectOption('sram-force-xplr-axs-e1');
  await expect(page.getByRole('link',{name:'RD-FRC-1E-D2',exact:true})).not.toBeVisible();
  await page.getByRole('link',{name:'RD-FRC-1E-E1',exact:true}).click();
  await expect(detail(page,'rear speeds').locator('dd')).toHaveText('13');
  await expect(detail(page,'Largest sprocket').locator('dd')).toHaveText('46T');
  await expect(detail(page,'Smallest sprocket').locator('dd')).toHaveText('10T');
  await expect(detail(page,'mount')).toContainText('requires UDH');
  await page.goto('/components/sram/rd-red-e-d1/');
  await expect(detail(page,'Largest sprocket').locator('dd')).toHaveText('Not yet sourced');
  await expect(detail(page,'largest sprocket variants')).toContainText('33, 36T');
});

test('road and gravel share one control pair while cassette weights retain their reference gearing',async({page,request})=>{
  for(const slug of ['force-axs-e1','force-xplr-axs-e1']){
    await page.goto(`/groupsets/sram/${slug}/`);
    await expect(page.getByRole('link',{name:'ED-FRC-E1',exact:true})).toHaveAttribute('href','/components/sram/ed-frc-e1/');
  }
  await page.getByRole('link',{name:'ED-FRC-E1',exact:true}).click();
  for(const name of ['Force AXS E1','Force XPLR AXS E1'])await expect(detail(page,'Groupset membership').getByRole('link',{name,exact:true})).toHaveCount(1);
  await expect(detail(page,'weight basis').locator('dd')).toHaveText('Pair');
  await expect(detail(page,'Weight').locator('dd > span')).toHaveText('Not yet sourced');
  for(const [model,grams,speed,range] of [['CS-XG-1290-E1',180,12,'10–28T'],['CS-XG-1391-E1',288,13,'10–46T']]){
    await page.goto(`/components/sram/${model.toLowerCase()}/`);
    await expect(detail(page,'Weight').locator('dd > span')).toHaveText(`${grams} g`);
    await expect(detail(page,'Weight')).toContainText(range);
    await expect(detail(page,'rear speeds').locator('dd')).toHaveText(String(speed));
  }
  const index=await(await request.get('/search-index.json')).json();
  expect(index.filter(c=>c.id==='sram-ed-frc-e1')).toHaveLength(1);
  expect(index.find(c=>c.id==='sram-cs-xg-1391-e1').weight_g).toBe(288);
});

test('mechanical 1x control pairs identify the brake-only left lever and keep pair weights distinct',async({page})=>{
  await page.goto('/groupsets/sram/rival-1-11-speed/');
  await page.getByRole('link',{name:'SB-RIV-B1 / BL-RIV-A1',exact:true}).click();
  await expect(detail(page,'Weight').locator('dd > span')).toHaveText('Not yet sourced');
  await expect(detail(page,'weight basis').locator('dd')).toHaveText('Pair');
  await expect(detail(page,'Weight')).toContainText('brake-only left lever');
  await page.goto('/groupsets/sram/rival-22/');
  await page.getByRole('link',{name:'SB-RIV-B1',exact:true}).click();
  await expect(detail(page,'Weight').locator('dd > span')).toHaveText('332 g');
  await expect(detail(page,'Weight')).toContainText('left/right');
});
