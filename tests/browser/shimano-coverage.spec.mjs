import {test,expect} from '@playwright/test';

test('previously empty MTB and gravel ranges link to real sourced components',async({page,request})=>{
  const examples=[
    ['slx-m660','RD-M662','rd-m662'],
    ['grx-rx600','ST-RX600','st-rx600'],
  ];
  for(const [group,model,slug] of examples){
    await page.goto(`/groupsets/shimano/${group}/`);
    const part=page.getByRole('link',{name:model,exact:true});
    await expect(part).toHaveAttribute('href',`/components/shimano/${slug}/`);
    await part.click();
    await expect(page.getByRole('heading',{name:model,level:1,exact:true})).toBeVisible();
    await expect(page.getByRole('link',{name:'Read Shimano technical specification'})).toHaveAttribute('href',/^https:\/\/si\.shimano\.com\/en\/pdfs\/ev\//);
    const response=await request.get(`/api/v1/components/shimano-${slug}.json`);
    expect(response.headers()['x-catalogue-delivery']).toBe('static-assets');
    const {data}=await response.json();
    expect(data.groupset_ids).toContain(`shimano-${group}`);
    expect(data.weight_g).toBeNull();
  }
});
