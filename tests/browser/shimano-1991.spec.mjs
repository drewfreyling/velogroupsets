import { test, expect } from '@playwright/test';
const weight = page => page.locator('dl > div').filter({has:page.getByRole('term').filter({hasText:/^Weight$/})});

test('1991 reference weights retain configuration, source pages and official technical links',async({page})=>{
  for(const [slug,grams,description,pdfPage] of [
    ['fc-7402',643,'170 mm',23],['bl-6403',272,'left/right pair',32],
    ['hb-7600-f',241,'large-flange',29],['hb-7600-r',313,'Includes the lockring',29],['hp-7600',90,'19.5 mm',29],
  ]){
    await page.goto(`/components/shimano/${slug}/`);
    await expect(weight(page).locator('dd > span')).toHaveText(`${grams} g`);
    await expect(weight(page)).toContainText(description);
    await expect(page.locator(`a[href="https://vintagecannondale.com/cannondale/shimano/1991%20Shimano.pdf#page=${pdfPage}"]`)).toBeVisible();
    await expect(page.getByRole('link',{name:'Read Shimano technical specification'})).toHaveAttribute('href',/^https:\/\/si\.shimano\.com\//);
    if(slug.startsWith('hb-'))await expect(weight(page)).toContainText('Excludes skewers.');
  }
});

test('105 SC and RX100 share the seven-speed cassette and explain the conflicting weight',async({page,request})=>{
  const href='/components/shimano/cs-hg70-7-i/';
  for(const group of ['105-sc-1055','rx100-a550']){
    await page.goto(`/groupsets/shimano/${group}/`);
    await expect(page.getByRole('link',{name:'CS-HG70',exact:true})).toHaveAttribute('href',href);
  }
  await page.goto(href);await expect(weight(page).locator('dd > span')).toHaveText('Not yet sourced');
  await expect(weight(page)).toContainText('286 g');await expect(weight(page)).toContainText('325 g');
  await expect(weight(page)).toContainText('seven-speed I-group 13–23T');
  const index=await (await request.get('/search-index.json')).json();
  const entries=index.filter(p=>p.id==='shimano-cs-hg70-7-i');expect(entries).toHaveLength(1);expect(entries[0].weight_g).toBeNull();
});

test('105 SC gains its documented front hub without publishing a skewer-inclusive weight',async({page})=>{
  await page.goto('/groupsets/shimano/105-sc-1055/');await page.getByRole('link',{name:'HB-1055-F',exact:true}).click();
  await expect(page.getByRole('heading',{name:'HB-1055-F',level:1,exact:true})).toBeVisible();
  await expect(weight(page).locator('dd > span')).toHaveText('Not yet sourced');
  await expect(weight(page)).toContainText('216 g with quick release');await expect(weight(page)).toContainText('Any weight added must exclude skewers.');
  await page.goto('/components/shimano/bb-1055/');await expect(weight(page).locator('dd > span')).toHaveText('Not yet sourced');
  await expect(weight(page)).toContainText('without identifying the weighed spindle length');
});
