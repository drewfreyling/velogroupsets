import { test, expect } from '@playwright/test';

const offerings = [
  ['Exage 400EX A400', 'FC-A400', 1989],
  ['Exage 300EX A300', 'FC-A300', 1989],
  ['Exage Motion A250', 'SL-A250', 1988],
  ['Exage Sport A450/A451', 'RD-A450', 1987],
];

test('browse the four Exage road ranges and their manufacturer documents', async ({page}) => {
  for (const [name, model, year] of offerings) {
    await page.goto('/manufacturers/shimano/');
    const card=page.getByRole('link').filter({has:page.getByRole('heading', {name,level:3,exact:true})});
    await expect(card).toContainText(`Start year: ${year}`);
    await card.click();
    await expect(page.getByRole('heading', {name,level:1,exact:true})).toBeVisible();
    await page.getByRole('link', {name:model,exact:true}).click();
    await expect(page.getByRole('heading', {name:model,level:1,exact:true})).toBeVisible();
    await expect(page.getByRole('link', {name:'Read Shimano technical specification'})).toHaveAttribute('href', /^https:\/\/si\.shimano\.com\/en\/pdfs\/ev\//);
    await expect(page.getByRole('heading', {name:'Sources',level:2})).toBeVisible();
  }
});

test('numbered Exage groups share a cassette URL and preserve its reference configuration', async ({page}) => {
  await page.goto('/catalogue/?groupset=shimano-exage-400ex&type=cassette');
  const group=page.getByRole('combobox', {name:'Groupset',exact:true});
  const cassette=page.getByRole('link', {name:'CS-HG50',exact:true});
  for (const id of ['shimano-exage-400ex','shimano-exage-300ex','shimano-exage-500ex']) {
    await group.selectOption(id);
    await expect(page.locator('#result-count')).toHaveText('1 component');
    await expect(cassette).toHaveAttribute('href','/components/shimano/cs-hg50-7-i/');
  }
  await cassette.click();
  await expect(page.getByText('268 g', {exact:true})).toBeVisible();
  await expect(page.getByText('13–23T', {exact:true})).toBeVisible();
  for (const name of ['Exage 300EX A300','Exage 400EX A400','Exage 500EX A500']) {
    await expect(page.locator('dl').getByRole('link', {name,exact:true})).toHaveCount(1);
  }
});

test('Motion and Sport retain six-speed controls while EX uses seven-speed shared levers', async ({page}) => {
  await page.goto('/catalogue/?groupset=shimano-exage-motion&type=shifters');
  const group=page.getByRole('combobox', {name:'Groupset',exact:true});
  await expect(page.locator('#result-count')).toHaveText('2 components');
  await expect(page.getByRole('link', {name:'SL-A250',exact:true})).toBeVisible();
  const downtube=page.getByRole('link', {name:'SL-A452',exact:true});
  await expect(downtube).toHaveAttribute('href','/components/shimano/sl-a452/');
  await group.selectOption('shimano-exage-sport');
  await expect(downtube).toBeVisible();
  await expect(page.getByRole('link', {name:'SL-A250',exact:true})).not.toBeVisible();
  await group.selectOption('shimano-exage-300ex');
  await expect(page.locator('#result-count')).toHaveText('1 component');
  await page.getByRole('link', {name:'SL-A400-FCAI',exact:true}).click();
  const details=page.locator('dl');
  await expect(details).toContainText('71 g');
  await expect(details).toContainText('left/right downtube lever pair');
  for (const name of ['Exage 300EX A300','Exage 400EX A400']) {
    await expect(details.getByRole('link', {name,exact:true})).toHaveCount(1);
  }
});

test('unknown Motion hub weight remains null without inheriting the later RM50 front hub measurement', async ({page,request}) => {
  await page.goto('/catalogue/?groupset=shimano-exage-motion&type=front-hub');
  await expect(page.getByRole('link', {name:'HB-RM50-F',exact:true})).not.toBeVisible();
  await page.getByRole('link', {name:'HB-RA50-F',exact:true}).click();
  const weight=page.locator('dl > div').filter({has:page.getByRole('term').filter({hasText:/^Weight$/})});
  await expect(weight.locator('dd > span')).toHaveText('Not yet sourced');
  await expect(weight).toContainText('Any weight added must exclude skewers.');
  const index=await (await request.get('/search-index.json')).json();
  expect(index.find(c=>c.id==='shimano-hb-ra50-f').weight_g).toBeNull();
});
