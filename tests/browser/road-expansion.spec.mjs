import {test,expect} from '@playwright/test';
const detail=(page,label)=>page.locator('dl > div').filter({has:page.getByRole('term').filter({hasText:new RegExp(`^${label}$`)})});

test('browse newly added Shimano road generations and retain model-number links',async({page})=>{
  for(const [slug,title,model] of [
    ['tiagra-4400','Tiagra 4400','ST-4400'],
    ['tiagra-r4000','Tiagra R4000','ST-R4020'],
    ['sora-r3000','Sora R3000','ST-R3000'],
    ['claris-r2000','Claris R2000','ST-R2000'],
    ['ultegra-di2-r8100','Ultegra Di2 R8100','RD-R8150'],
  ]){
    await page.goto('/manufacturers/shimano/');
    await page.getByRole('link').filter({has:page.getByRole('heading',{name:title,exact:true,level:3})}).click();
    await expect(page).toHaveURL(new RegExp(`/groupsets/shimano/${slug}/$`));
    await page.getByRole('link',{name:model,exact:true}).click();
    await expect(page.getByRole('heading',{name:model,level:1,exact:true})).toBeVisible();
    await expect(page.getByRole('link',{name:'Read Shimano technical specification'})).toHaveAttribute('href',/^https:\/\/si\.shimano\.com\/en\/pdfs\/ev\//);
  }
});

test('Campagnolo mechanical and EPS controls remain distinct complete pairs',async({page})=>{
  for(const [slug,model] of [['chorus-11-speed','EP15-CH1C'],['chorus-eps-11-speed','EP15-CH1CEPS']]){
    await page.goto(`/groupsets/campagnolo/${slug}/`);
    await page.getByRole('link',{name:model,exact:true}).click();
    await expect(detail(page,'weight basis').locator('dd')).toHaveText('Pair');
    await expect(detail(page,'Weight').locator('dd > span')).toHaveText('Not yet sourced');
    await expect(page.getByRole('link',{name:'Read Campagnolo technical specification'})).toHaveAttribute('href',/^https:\/\/media\.campagnolo\.com\//);
  }
  await page.goto('/components/campagnolo/rd02-sr13wrl/');
  await expect(detail(page,'Total capacity').locator('dd')).toHaveText('41T');
  await expect(detail(page,'Largest sprocket').locator('dd')).toHaveText('36T');
  await expect(detail(page,'Smallest sprocket').locator('dd')).toHaveText('10T');
  await expect(detail(page,'Front chainring tooth difference').locator('dd')).toHaveText('16T');
});

test('drop-bar CUES keeps nine- and ten-speed control pairs separate',async({page,request})=>{
  await page.goto('/groupsets/shimano/cues-drop-bar-u3030/');
  for(const model of ['ST-U3030-L / ST-U3030-10R','ST-U3030-L / ST-U3030-9R']){
    const link=page.getByRole('link',{name:model,exact:true});
    await expect(link).toBeVisible();
  }
  await page.getByRole('link',{name:'ST-U3030-L / ST-U3030-9R',exact:true}).click();
  await expect(detail(page,'rear speeds').locator('dd')).toHaveText('9');
  await expect(detail(page,'weight basis').locator('dd')).toHaveText('Pair');
  const index=await(await request.get('/search-index.json')).json();
  expect(index.filter(c=>c.id==='shimano-fc-u6040-2')).toHaveLength(1);
  expect(index.find(c=>c.id==='shimano-fc-u6040-2').weight_g).toBeNull();
});

test('SRAM Wide options belong to their existing road family',async({page})=>{
  await page.goto('/catalogue/?groupset=sram-force-etap-axs-d1&type=crankset');
  await page.getByRole('link',{name:'FC-FRC-W-D1',exact:true}).click();
  await expect(detail(page,'chainline mm').locator('dd')).toHaveText('47.5');
  await expect(detail(page,'Groupset membership').getByRole('link',{name:'Force eTap AXS D1',exact:true})).toHaveCount(1);
  await expect(detail(page,'Weight').locator('dd > span')).toHaveText('Not yet sourced');
});

test('compatibility markings and accessory codes do not create complete component identities',async({page,request})=>{
  const index=await(await request.get('/search-index.json')).json();
  // The manufacturer's 2017 table identifies FD-SR203 as a chain guard.
  expect(index.some(c=>c.model==='FD-SR203')).toBe(false);
  await page.goto('/components/campagnolo/rd23-sr12wrl/');
  await expect(detail(page,'Groupset membership').getByRole('link',{name:'Super Record Wireless 12-speed',exact:true})).toHaveCount(1);
  await expect(detail(page,'Groupset membership').getByRole('link',{name:'Super Record S Wireless 12-speed',exact:true})).toHaveCount(0);
  await page.goto('/groupsets/campagnolo/super-record-s-wireless-12-speed/');
  await expect(page.getByRole('heading',{name:'Super Record S Wireless 12-speed',level:1,exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'RD23-SR12WRL',exact:true})).toHaveCount(0);
});
