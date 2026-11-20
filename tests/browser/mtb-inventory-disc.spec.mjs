import {test,expect} from '@playwright/test';
const detail=(page,label)=>page.locator('dl > div').filter({has:page.getByRole('term').filter({hasText:new RegExp(`^${label}$`)})});

test('expanded XT range links to a sourced crank and a real right-hand control',async({page})=>{
  await page.goto('/groupsets/shimano/deore-xt-m8100/');
  await page.getByRole('link',{name:'FC-M8100-1',exact:true}).click();
  await expect(detail(page,'Weight').locator('dd > span')).toHaveText('624 g');
  await expect(detail(page,'Weight')).toContainText('170 mm');
  await expect(detail(page,'Weight')).toContainText('32T');
  await expect(detail(page,'Weight')).toContainText('excludes bottom bracket');
  await page.goto('/groupsets/shimano/deore-xt-m8100/');
  await page.getByRole('link',{name:'SL-M8100-R',exact:true}).click();
  await expect(detail(page,'Weight basis').locator('dd')).toHaveText('Single right-hand control');
  await expect(detail(page,'Weight').locator('dd > span')).toHaveText('117 g');
});

test('original Eagle controller is shared across XX1 and X01 without duplicate identity',async({page,request})=>{
  for(const group of ['xx1-eagle-axs','x01-eagle-axs']){
    await page.goto(`/groupsets/sram/${group}/`);
    await page.getByRole('link',{name:'EC-AXS-SRAM-A1',exact:true}).click();
    await expect(page).toHaveURL(/\/components\/sram\/ec-axs-sram-a1\/$/);
  }
  const {data}=await(await request.get('/api/v1/components/sram-ec-axs-sram-a1.json')).json();
  expect(data.groupset_ids).toEqual(['sram-xx1-eagle-axs','sram-x01-eagle-axs']);
  await page.goto('/groupsets/sram/gx-eagle-axs/');
  await page.getByRole('link',{name:'EC-GX-AXS-A1',exact:true}).click();
  await expect(detail(page,'Weight basis').locator('dd')).toHaveText('Single right-hand control');
});

test('disc rotor filters preserve diameter identities and lockring exclusions',async({page,request})=>{
  await page.goto('/catalogue/?category=mtb&type=disc-brake-rotor&groupset=shimano-deore-xt-m8100&q=RT-MT800');
  await expect(page.getByRole('combobox',{name:'Component type'})).toHaveValue('disc-brake-rotor');
  await expect(page.getByRole('link',{name:'RT-MT800',exact:true})).toHaveCount(3);
  await page.locator('article').filter({hasText:'160 mm'}).getByRole('link',{name:'RT-MT800',exact:true}).click();
  await expect(detail(page,'Weight basis').locator('dd')).toHaveText('One rotor');
  await expect(detail(page,'Mount').locator('dd')).toHaveText('Center Lock');
  await expect(detail(page,'Includes mounting hardware').locator('dd')).toHaveText('No');
  const response=await request.get('/api/v1/components/shimano-rt-mt800-160.json');
  expect(response.headers()['x-catalogue-delivery']).toBe('static-assets');
  const {data}=await response.json();
  expect(data).toMatchObject({model_number:'RT-MT800',weight_g:108,specifications:{diameter_mm:160,includes_mounting_hardware:false}});
});

test('standalone calipers and complete hydraulic kits show different weight bases',async({page})=>{
  await page.goto('/groupsets/shimano/deore-xt-m8100/');
  await page.getByRole('link',{name:'BR-M8100',exact:true}).click();
  await expect(detail(page,'Weight basis').locator('dd')).toHaveText('One caliper');
  await expect(detail(page,'Pistons').locator('dd')).toHaveText('2');
  await expect(detail(page,'Weight').locator('dd > span')).toHaveText('Not yet sourced');
  await page.goto('/groupsets/shimano/deore-xt-m8100/');
  await page.getByRole('link',{name:'BL-M8100 / BR-M8100',exact:true}).click();
  await expect(detail(page,'Weight basis').locator('dd')).toHaveText('One complete front brake');
  await expect(detail(page,'Hose length').locator('dd')).toHaveText('800 mm');
  await expect(detail(page,'Lever side').locator('dd')).toHaveText('Not documented');
  await expect(detail(page,'Includes rotor').locator('dd')).toHaveText('Not documented');
  await expect(detail(page,'Weight').locator('dd > span')).toHaveText('Not yet sourced');
});

test('existing generic crank identity retains its explicitly sourced reference model',async({page,request})=>{
  await page.goto('/components/shimano/fc-m9000/');
  await expect(page.getByRole('heading',{name:'FC-M9000',level:1,exact:true})).toBeVisible();
  await expect(detail(page,'Weight').locator('dd > span')).toHaveText('586 g');
  await expect(detail(page,'Weight')).toContainText('175 mm');
  const {data}=await(await request.get('/api/v1/components/shimano-fc-m9000.json')).json();
  expect(data).toMatchObject({id:'shimano-fc-m9000',specifications:{reference_model:'FC-M9000-1',crank_length_mm:175,chainrings_teeth:[30],includes_bottom_bracket:false}});
});

test('the 1991 SG crank reference stays separate from the later SG-X assembly', async ({page,request}) => {
  await page.goto('/groupsets/shimano/deore-xt-m730/');
  await page.getByRole('link',{name:'FC-M730-SG',exact:true}).click();
  await expect(page).toHaveURL('/components/shimano/fc-m730-sg/');
  const weight = page.locator('dl > div').filter({has:page.getByRole('term').filter({hasText:/^Weight$/})});
  await expect(weight.locator('dd > span')).toHaveText('730 g');
  await expect(weight).toContainText('170 mm');
  await expect(weight).toContainText('46/36/26T');
  await expect(weight).toContainText('excludes the separately listed BB-M730');
  const {data:sg} = await (await request.get('/api/v1/components/shimano-fc-m730-sg.json')).json();
  expect(sg).toMatchObject({model_number:'FC-M730-SG',weight_g:730,specifications:{crank_length_mm:170,chainrings_teeth:[46,36,26],includes_bottom_bracket:false}});
  expect(sg.technical_document.url).toContain('1991_Shimano_Bicycle_System_Component_Dealer_Product_Manual.pdf#page=54');
  const {data:sgx} = await (await request.get('/api/v1/components/shimano-fc-m730.json')).json();
  expect(sgx).toMatchObject({id:'shimano-fc-m730',model_number:'FC-M730',slug:'fc-m730',weight_g:null});
  expect(sgx.name).toContain('Round Gear SG-X');
  await page.goto('/components/shimano/fc-m730/');
  await expect(weight.locator('dd > span')).toHaveText('Not yet sourced');
  const {data:lx} = await (await request.get('/api/v1/components/shimano-fc-m550.json')).json();
  expect(lx).toMatchObject({weight_g:752,specifications:{crank_length_mm:170,chainrings_teeth:[48,38,28],includes_bottom_bracket:false}});
});
