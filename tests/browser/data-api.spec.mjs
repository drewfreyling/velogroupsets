import {test,expect} from '@playwright/test';
import {createServer} from 'node:http';
import {manufacturers} from '../../apps/web/src/lib/catalogue.mjs';

test('find static catalogue API documentation and download its OpenAPI contract',async({page,request})=>{
  await page.goto('/');
  await page.getByRole('link',{name:'Catalogue API',exact:true}).click();
  await expect(page).toHaveURL(/\/api-docs\/$/);
  await expect(page.getByRole('heading',{name:'Catalogue API',level:1,exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'Download the OpenAPI 3.1 specification'})).toHaveAttribute('href','/openapi.json');
  const publicSpec=await request.get('/openapi.json');expect(publicSpec.status()).toBe(200);
  expect(publicSpec.headers()['access-control-allow-origin']).toBe('*');
  const spec=await publicSpec.json();expect(spec.openapi).toBe('3.1.0');expect(spec.info.version).toBe('1.0.0');
  expect(spec.paths['/api/v1/components.json'].get.operationId).toBe('listComponents');
  expect(spec.paths['/api/v1/components']).toBeUndefined();
  await expect(page.getByText(/static files ignore query strings/)).toBeVisible();
});

test('clients filter downloaded records locally and retain null weights and citations',async({page,request})=>{
  await page.goto('/api-docs/');
  const result=await page.evaluate(async()=>{
    const response=await fetch('/api/v1/catalogue.json');const {data,catalogue_version}=await response.json();
    return {status:response.status,catalogue_version,models:data.components.filter(c=>c.manufacturer_id==='shimano'&&c.groupset_ids.includes('shimano-105-r7000')&&c.type==='rear-derailleur'&&c.model_number.includes('GS')).map(c=>c.model_number)};
  });
  expect(result.status).toBe(200);expect(result.models).toEqual(['RD-R7000-GS']);expect(result.catalogue_version).toMatch(/^[a-f0-9]{64}$/);
  const external=await request.get('/api/v1/components/sram-fc-frc-w-d1.json',{headers:{Origin:'https://other.example'}});
  expect(external.status()).toBe(200);expect(external.headers()['access-control-allow-origin']).toBe('*');
  const record=await external.json();expect(record.catalogue_version).toBe(result.catalogue_version);
  expect(record.data.weight_g).toBeNull();expect(record.data.technical_document.url).toMatch(/^https:\/\/www\.sram\.com\//);expect(record.data.sources.length).toBeGreaterThan(0);
});

test('static reads support ETags and HEAD; query strings are ignored and writes rejected',async({request})=>{
  const path='/api/v1/components/shimano-st-r7000.json';const response=await request.get(path);
  expect(response.status()).toBe(200);expect(response.headers()['x-catalogue-delivery']).toBe('static-assets');
  expect(response.headers()['cache-control']).toBe('public, max-age=300, must-revalidate');const etag=response.headers().etag;expect(etag).toBeTruthy();
  expect(response.headers()['set-cookie']).toBeUndefined();
  const unchanged=await request.get(path,{headers:{'If-None-Match':etag}});expect(unchanged.status()).toBe(304);expect(await unchanged.text()).toBe('');
  const head=await request.head(path);expect(head.status()).toBe(200);expect(await head.text()).toBe('');expect(head.headers().etag).toBe(etag);
  const collection=await request.get('/api/v1/components.json');const body=await collection.text();
  const query=await request.get('/api/v1/components.json?limit=1&q=ignored');expect(query.status()).toBe(200);expect(await query.text()).toBe(body);
  for(const method of ['OPTIONS','POST'])expect((await request.fetch(path,{method})).status()).toBe(405);
  for(const missing of ['/api/v1/components','/api/v1/components/shimano-st-r7000-r.json','/api/v1/private.json']){
    const unknown=await request.get(missing);expect(unknown.status()).toBe(404);expect(unknown.headers()['content-type']).toContain('text/html');
  }
});

test('a browser on another origin can read static JSON with a normal GET',async({page})=>{
  // A real second loopback origin avoids Chromium classifying a route-fulfilled
  // document as a public network page and blocking Local Network Access first.
  const consumer=createServer((_request,response)=>response.writeHead(200,{'Content-Type':'text/html'}).end('<!doctype html><title>API consumer</title>'));
  await new Promise(resolve=>consumer.listen(0,'127.0.0.1',resolve));
  try{
    await page.goto('http://127.0.0.1:'+consumer.address().port);
    const result=await page.evaluate(async()=>{
      const response=await fetch('http://127.0.0.1:8787/api/v1/manufacturers.json',{credentials:'omit'});
      return {status:response.status,delivery:response.headers.get('X-Catalogue-Delivery'),body:await response.json()};
    });
    expect(result.status).toBe(200);expect(result.delivery).toBe('static-assets');
    expect(result.body.data.map(m=>m.id).sort()).toEqual(manufacturers.map(m=>m.id).sort());
  }finally{await new Promise(resolve=>consumer.close(resolve));}
});
