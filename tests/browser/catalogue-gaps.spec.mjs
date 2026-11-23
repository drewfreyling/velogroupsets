import {test,expect} from '@playwright/test';
const detail=(page,label)=>page.locator('dl > div').filter({has:page.getByRole('term').filter({hasText:new RegExp(`^${label}$`)})});

test('Campagnolo caliper pairs and individual direct-mount positions remain distinct',async({page,request})=>{
  await page.goto('/catalogue/?groupset=campagnolo-super-record-11-speed&type=brake-calipers');
  await page.getByRole('link',{name:'BR15-SR',exact:true}).click();
  await expect(detail(page,'Weight basis').locator('dd')).toContainText('Front and rear pair');
  await expect(detail(page,'Weight basis').locator('dd')).toContainText('Includes brake pads and mounting bolts.');
  await expect(detail(page,'Weight').locator('dd > span')).toHaveText('272 g');
  await expect(detail(page,'Weight')).toContainText('rear single-pivot');
  for (const [slug, grams] of [['br15-sr',272],['br15-srdp',297],['br15-re',284],['br15-redp',309],['br15-chdp',302]]) {
    const {data} = await (await request.get(`/api/v1/components/campagnolo-${slug}.json`)).json();
    expect(data).toMatchObject({weight_g:grams,specifications:{weight_basis:'Pair',includes_brake_pads:true,includes_mounting_bolts:true}});
  }
  for(const [slug,basis,grams] of [['br16-redmf','Front',null],['br16-redmrbb','Rear',158],['br16-redmrss','Rear',null]]){
    const {data}=await(await request.get(`/api/v1/components/campagnolo-${slug}.json`)).json();
    expect(data.specifications.weight_basis).toBe(basis);
    expect(data.weight_g).toBe(grams);
    expect(data.groupset_ids).toContain('campagnolo-record-11-speed');
  }
});

test('original SRAM RED has its own control pair and rim-caliper pair',async({page,request})=>{
  await page.goto('/groupsets/sram/red-10-speed/');
  await expect(page.getByRole('link',{name:'SB-RED-A1',exact:true})).toBeVisible();
  await page.getByRole('link',{name:'RB-RED-A1',exact:true}).click();
  await expect(page.getByRole('heading',{name:'RB-RED-A1',level:1,exact:true})).toBeVisible();
  const response=await request.get('/api/v1/components/sram-rb-red-a1.json');
  expect(response.headers()['x-catalogue-delivery']).toBe('static-assets');
  const {data}=await response.json();
  expect(data).toMatchObject({weight_g:null,specifications:{weight_basis:'Pair'}});
});

test('shared DUB installation options use one canonical bottom-bracket record',async({page,request})=>{
  for(const group of ['force-axs-e1','rival-xplr-axs-e1']){
    await page.goto(`/groupsets/sram/${group}/`);
    await page.getByRole('link',{name:'BB-DUB-BSA-A1',exact:true}).click();
    await expect(page).toHaveURL(/\/components\/sram\/bb-dub-bsa-a1\/$/);
  }
  const {data}=await(await request.get('/api/v1/components/sram-bb-dub-bsa-a1.json')).json();
  expect(data.specifications.interface).toBe('DUB');
  expect(data.groupset_ids).toContain('sram-force-axs-e1');
  expect(data.groupset_ids).toContain('sram-rival-xplr-axs-e1');
  expect(data).toMatchObject({weight_g:76,specifications:{weight_reference_shell_width_mm:68}});
  await expect(detail(page,'Weight')).toContainText('appropriate spacers for a 68 mm shell');
  const {data:pressFit} = await (await request.get('/api/v1/components/sram-bb-dub-pf-a1.json')).json();
  expect(pressFit).toMatchObject({weight_g:72,specifications:{weight_reference_configuration:'BB92',weight_reference_shell_width_mm:92}});
  expect(pressFit.weight_description).toContain('does not establish the weight of the BB86.5 road option');
});

test('rear derailleur limits retain their double, triple and single-chainring references',async({page,request})=>{
  await page.goto('/components/shimano/rd-m8050/');
  await expect(detail(page,'Total capacity').locator('dd')).toHaveText('35T');
  await expect(detail(page,'Largest sprocket').locator('dd')).toHaveText('42T');
  await expect(detail(page,'Smallest sprocket').locator('dd')).toHaveText('11T');
  await expect(detail(page,'Front chainring tooth difference').locator('dd')).toHaveText('10T');
  const {data}=await(await request.get('/api/v1/components/shimano-rd-4700-gs.json')).json();
  expect(data.specifications).toMatchObject({total_capacity_teeth:39,total_capacity_triple_teeth:41,maximum_sprocket_teeth:34,minimum_sprocket_teeth:11,maximum_front_difference_teeth:16});
  expect(data.specifications.reference_configuration).toMatch(/double/i);
  expect(data.sources.some(source=>source.url==='https://na.s-tec.shimano.com/s3_assets/filelibrary/Catalogs/2016_Bicycle_Components_usa.pdf#page=161')).toBe(true);
  await page.goto('/components/shimano/rd-4700-gs/');
  await expect(detail(page,'Total capacity').locator('dd')).toHaveText('39T');
});

test('early hub additions retain their actual model numbers and unknown skewer-free weights',async({page,request})=>{
  await page.goto('/groupsets/shimano/dura-ace-original/');
  await page.getByRole('link',{name:'HB-7110',exact:true}).click();
  await expect(page).toHaveURL(/\/components\/shimano\/hb-7110-r\/$/);
  const {data}=await(await request.get('/api/v1/components/shimano-hb-7110-r.json')).json();
  expect(data).toMatchObject({model_number:'HB-7110',type:'rear-hub',weight_g:null,weight_excludes_skewers:true});
});
