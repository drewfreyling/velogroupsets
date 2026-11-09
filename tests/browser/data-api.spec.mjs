import {test,expect} from '@playwright/test';

test('find the catalogue API documentation and download the matching OpenAPI contract',async({page,request})=>{
  await page.goto('/');
  await page.getByRole('link',{name:'Catalogue API',exact:true}).click();
  await expect(page).toHaveURL(/\/api-docs\/$/);
  await expect(page.getByRole('heading',{name:'Catalogue API',level:1,exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'Download the OpenAPI 3.1 specification'})).toHaveAttribute('href','/openapi.json');
  const publicSpec=await request.get('/openapi.json');expect(publicSpec.status()).toBe(200);
  expect(publicSpec.headers()['access-control-allow-origin']).toBe('*');
  const spec=await publicSpec.json();expect(spec.openapi).toBe('3.1.0');
  const apiSpec=await request.get('/api/v1/openapi.json');expect(apiSpec.status()).toBe(200);expect(await apiSpec.json()).toEqual(spec);
  expect(spec.paths['/api/v1/components'].get.operationId).toBe('listComponents');
});

test('browser consumers can filter public records and retain null weights and source citations',async({page,request})=>{
  await page.goto('/api-docs/');
  const body=await page.evaluate(async()=>{
    const response=await fetch('/api/v1/components?manufacturer_id=shimano&groupset_id=shimano-105-r7000&type=rear-derailleur&q=R7000%20GS');
    return {status:response.status,body:await response.json()};
  });
  expect(body.status).toBe(200);expect(body.body.data.map(c=>c.model_number)).toEqual(['RD-R7000-GS']);
  const external=await request.get('/api/v1/components/sram-fc-frc-w-d1',{headers:{Origin:'https://other.example'}});
  expect(external.status()).toBe(200);expect(external.headers()['access-control-allow-origin']).toBe('*');
  const component=(await external.json()).data;expect(component.weight_g).toBeNull();expect(component.technical_document.url).toMatch(/^https:\/\/www\.sram\.com\//);expect(component.sources.length).toBeGreaterThan(0);
});

test('real Worker responses support caching, aliases, preflight and read-only errors',async({request})=>{
  const path='/api/v1/components/shimano-st-r7000-r';const response=await request.get(path);
  expect(response.status()).toBe(200);expect(response.headers()['content-location']).toBe('/api/v1/components/shimano-st-r7000');
  expect(response.headers()['cache-control']).toContain('max-age=300');const etag=response.headers().etag;expect(etag).toBeTruthy();
  const unchanged=await request.get(path,{headers:{'If-None-Match':etag}});expect(unchanged.status()).toBe(304);expect(await unchanged.text()).toBe('');
  const head=await request.head(path);expect(head.status()).toBe(200);expect(await head.text()).toBe('');expect(head.headers().etag).toBe(etag);
  const preflight=await request.fetch('/api/v1/components',{method:'OPTIONS',headers:{Origin:'https://other.example','Access-Control-Request-Method':'GET','Access-Control-Request-Headers':'If-None-Match'}});expect(preflight.status()).toBe(204);expect(preflight.headers()['access-control-allow-methods']).toBe('GET, HEAD, OPTIONS');
  const write=await request.post('/api/v1/components',{data:{weight_g:1}});expect(write.status()).toBe(405);expect(write.headers().allow).toBe('GET, HEAD, OPTIONS');
  const invalid=await request.get('/api/v1/components?limit=101');expect(invalid.status()).toBe(400);expect(invalid.headers()['cache-control']).toBe('no-store');
  const unknown=await request.get('/api/v1/private');expect(unknown.status()).toBe(404);expect(unknown.headers()['content-type']).toContain('application/json');
});
