import { test, expect } from '@playwright/test';

const offerings = [
  ['Dura-Ace EX 7200', 'RD-7200'], ['Dura-Ace AX 7300', 'RD-7300'],
  ['Dura-Ace 7400', 'ST-7400'], ['Dura-Ace 7700', 'FC-7701'],
  ['Dura-Ace 7800', 'ST-7801'], ['Dura-Ace 7900', 'RD-7900'],
  ['Dura-Ace Di2 7970', 'RD-7970'], ['Dura-Ace 9000', 'ST-9001'],
  ['Dura-Ace Di2 9070', 'ST-9070'], ['Dura-Ace R9100', 'RD-R9100'],
  ['Dura-Ace Di2 R9150', 'RD-R9150'], ['Dura-Ace Di2 R9200', 'RD-R9250'],
  ['Dura-Ace 10 7000', 'FC-7000'], ['Dura-Ace Track 7600/7710', 'HB-7600-F'],
];

test('browse each documented Dura-Ace road and track offering to a sourced component', async ({page}) => {
  for (const [name, model] of offerings) {
    await page.goto('/manufacturers/shimano/');
    await page.getByRole('link').filter({has:page.getByRole('heading', {name,level:3,exact:true})}).click();
    await expect(page.getByRole('heading', {name,level:1,exact:true})).toBeVisible();
    await page.getByRole('link', {name:model,exact:true}).click();
    await expect(page.getByRole('heading', {name:model,level:1,exact:true})).toBeVisible();
    await expect(page.getByRole('link', {name:'Read Shimano technical specification'})).toHaveAttribute('href', /^https:\/\/si\.shimano\.com\//);
  }
});

test('original Dura-Ace family is browsable with sources while parts remain undocumented', async ({page}) => {
  await page.goto('/manufacturers/shimano/');
  await page.getByRole('link').filter({has:page.getByRole('heading', {name:'Dura-Ace Original',level:3,exact:true})}).click();
  await expect(page.getByRole('heading', {name:'Dura-Ace Original',level:1,exact:true})).toBeVisible();
  await expect(page.getByText('0 components listed for this groupset.', {exact:false})).toBeVisible();
  await expect(page.getByRole('heading', {name:'Sources',level:2})).toBeVisible();
});

test('Dura-Ace filters distinguish shifting systems and retain shared component URLs', async ({page}) => {
  await page.goto('/catalogue/?groupset=shimano-dura-ace-r9100&type=rear-derailleur');
  const group=page.getByRole('combobox', {name:'Groupset',exact:true});
  await expect(page.getByRole('link', {name:'RD-R9100',exact:true})).toBeVisible();
  await group.selectOption('shimano-dura-ace-di2-r9150');
  await expect(page.getByRole('link', {name:'RD-R9150',exact:true})).toBeVisible();
  await expect(page.getByRole('link', {name:'RD-R9100',exact:true})).not.toBeVisible();
  await page.getByRole('combobox', {name:'Component type',exact:true}).selectOption('crankset');
  const crank=page.getByRole('link', {name:'FC-R9100',exact:true});
  await expect(crank).toHaveAttribute('href','/components/shimano/fc-r9100/');
  await group.selectOption('shimano-dura-ace-r9100');
  await crank.click();
  await expect(page.getByText('621 g', {exact:true})).toBeVisible();
  for (const name of ['Dura-Ace R9100','Dura-Ace Di2 R9150']) {
    await expect(page.locator('dl').getByRole('link', {name,exact:true})).toHaveCount(1);
  }
});

test('bottom-bracket-inclusive reference does not become a crank-only weight', async ({page,request}) => {
  await page.goto('/components/shimano/fc-7800/');
  const weight=page.locator('dl > div').filter({has:page.locator('dt', {hasText:/^Weight$/})});
  await expect(weight.locator('dd > span')).toHaveText('Not yet sourced');
  await expect(weight).toContainText('including the bottom bracket');
  const index=await (await request.get('/search-index.json')).json();
  expect(index.find(c=>c.id==='shimano-fc-7800').weight_g).toBeNull();
});

test('archived Dura-Ace configurations expose sourced weights and retain manufacturer technical links', async ({page,request}) => {
  const index=await (await request.get('/search-index.json')).json();
  for (const [model,grams,configuration] of [
    ['FD-7400',93,'28.6 mm clamp'],['FC-7402',643,'52/42T Shimano SG'],
    ['CS-7400-8',255,'eight-speed 12–21T'],['FC-7600',605,'48T chainring'],
    ['BB-7600',305,'109 mm spindle'],['SP-7300',224,'26.8 mm shaft'],
  ]) {
    const part=index.find(p=>p.model===model);
    expect(part.weight_g).toBe(grams);
    await page.goto(part.url);
    const weight=page.locator('dl > div').filter({has:page.getByRole('term').filter({hasText:/^Weight$/})});
    await expect(weight.locator('dd > span')).toHaveText(`${grams} g`);
    await expect(weight).toContainText(configuration);
    await expect(page.getByRole('link',{name:'Read Shimano technical specification'})).toHaveAttribute('href',/^https:\/\/si\.shimano\.com\//);
    await expect(page.locator('a[href^="https://labibleduvelocataloguesshimano.blogspot.com/"]')).toBeVisible();
  }
});

test('catalogue evidence preserves unknown pair, clamp and skewer configurations', async ({page,request}) => {
  const index=await (await request.get('/search-index.json')).json();
  for (const [model,reason] of [
    ['BL-7300','single-lever figure is not doubled'],['FD-7300','without identifying which was weighed'],
    ['SL-7402-FCAI','left/right pair weight'],['FH-7402','with quick release'],
  ]) {
    const part=index.find(p=>p.model===model);
    expect(part.weight_g).toBeNull();
    await page.goto(part.url);
    const weight=page.locator('dl > div').filter({has:page.getByRole('term').filter({hasText:/^Weight$/})});
    await expect(weight.locator('dd > span')).toHaveText('Not yet sourced');
    await expect(weight).toContainText(reason);
  }
  await page.goto('/catalogue/?groupset=shimano-dura-ace-7400&type=seatpost');
  for (const model of ['SP-7400-A','SP-7400-B','SP-7410']) {
    await expect(page.getByRole('link',{name:model,exact:true})).toBeVisible();
  }
});
