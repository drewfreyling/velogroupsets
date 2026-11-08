import { test, expect } from '@playwright/test';
import sharp from 'sharp';
import { POLICY_VERSION } from '../../packages/shared/community.ts';
const component='shimano-rd-r7000-gs';
const photoId='00000000-0000-4000-8000-000000000001';
const publicConfig={signInAvailable:true,uploadsAvailable:true,policyVersion:POLICY_VERSION,turnstileSiteKey:'fictional-site-key',contactEmail:'contact@example.test',operator:'Example Operator',maxUploadBytes:5*1024*1024};
const member={id:'00000000-0000-4000-8000-000000000002',displayName:'Test contributor',moderator:false};
const jpeg=await sharp({create:{width:64,height:48,channels:3,background:'#3dcfc2'}}).jpeg().toBuffer();
async function mockCommunity(page,{user=member,config={}}={}) {
  await page.route('**/api/session',route=>route.fulfill({json:{...publicConfig,...config,user,csrfToken:user?'fictional-csrf':null}}));
  await page.route('**/api/community/config',route=>route.fulfill({json:{...publicConfig,...config}}));
  await page.route('**/api/account/photos',route=>route.fulfill({json:{photos:[]}}));
  await page.route('**/api/photos/*/file',route=>route.fulfill({contentType:'image/jpeg',body:jpeg}));
  await page.route('**/api/photos/*/preview',route=>route.fulfill({contentType:'image/jpeg',body:jpeg}));
  await page.route('https://challenges.cloudflare.com/turnstile/v0/api.js*',route=>route.fulfill({contentType:'application/javascript',body:`
    window.turnstile={
      ready(fn){fn()},
      render(node,options){this.options=options;node.textContent='Test anti-spam check passed';options.callback('proof-'+options.action);return 'test-widget'},
      reset(){this.options.callback('fresh-proof-'+this.options.action)}
    };
  `}));
}

test('sign-in requires an unchecked agreement before starting Google authentication',async({page})=>{
  await mockCommunity(page,{user:null});let starts=0,submitted;
  await page.route('**/api/auth/google/start',async route=>{starts++;submitted=route.request().postDataJSON();await route.fulfill({json:{redirectUrl:'/account/?completed=test'}});});
  await page.goto('/account/');const agreement=page.getByRole('checkbox');await expect(agreement).not.toBeChecked();
  const button=page.getByRole('button',{name:'Continue with Google',exact:true});await expect(button).toBeEnabled();await button.click();expect(starts).toBe(0);
  await agreement.check();await page.getByLabel('Public display name',{exact:false}).fill('Test public alias');await button.click();
  await expect.poll(()=>starts).toBe(1);expect(submitted.accepted_terms).toBe('on');expect(submitted.policy_version).toBe(POLICY_VERSION);expect(submitted.display_name).toBe('Test public alias');
});

test('each photo upload requires fresh licence acceptance and preserves the selected component after reset',async({page})=>{
  await mockCommunity(page);const submissions=[];
  await page.route('**/api/uploads',async route=>{
    expect(route.request().headers()['x-csrf-token']).toBe('fictional-csrf');
    const form=await new Response(route.request().postDataBuffer(),{headers:{'Content-Type':route.request().headers()['content-type']}}).formData();
    submissions.push({component:form.get('component_id'),licence:form.get('accepted_licence'),version:form.get('policy_version'),size:form.get('photo').size});
    await route.fulfill({status:201,json:{id:photoId,status:'pending',message:'Your photo is awaiting moderator review.'}});
  });
  await page.goto(`/upload/?component=${component}`);const licence=page.getByRole('checkbox');await expect(licence).not.toBeChecked();
  for(let attempt=0;attempt<2;attempt++){
    await page.getByLabel('Photo',{exact:true}).setInputFiles({name:'synthetic-component.jpg',mimeType:'image/jpeg',buffer:jpeg});
    await page.getByLabel('Caption',{exact:true}).fill('Synthetic test view of the model markings.');await page.getByLabel('Image description',{exact:true}).fill('A teal test rectangle.');
    await page.getByRole('button',{name:'Submit photo for review',exact:true}).click();expect(submissions).toHaveLength(attempt);
    await licence.check();await page.getByRole('button',{name:'Submit photo for review',exact:true}).click();
    await expect(page.getByRole('status')).toContainText('awaiting moderator review');await expect(licence).not.toBeChecked();
    await expect(page.locator('#component-id')).toHaveValue(component);
  }
  expect(submissions).toHaveLength(2);for(const submission of submissions){expect(submission.component).toBe(component);expect(submission.licence).toBe('on');expect(submission.version).toBe(POLICY_VERSION);expect(submission.size).toBe(jpeg.length);}
});

test('approved photo captions are text and anonymous visitors can send a private report',async({page})=>{
  await mockCommunity(page,{user:null});let report;
  await page.route('**/api/components/*/photos*',route=>route.fulfill({json:{photos:[{id:photoId,caption:'<img src=x onerror="window.photoXss=true">',alt:'A synthetic component image',contributor:'Test contributor',imageUrl:`/api/photos/${photoId}/file`,width:64,height:48}],nextCursor:null}}));
  await page.route(`**/api/photos/${photoId}/reports`,async route=>{report=route.request().postDataJSON();await route.fulfill({status:201,json:{message:'Your report is in the private moderation queue.'}});});
  await page.goto('/components/shimano/rd-r7000-gs/');await expect(page.getByText('<img src=x onerror="window.photoXss=true">',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>window.photoXss)).toBeUndefined();
  await page.getByRole('link',{name:'Report this photo',exact:true}).click();await expect(page.getByRole('heading',{name:'Report a photo',level:1})).toBeVisible();
  await page.getByLabel('Reason',{exact:true}).selectOption('privacy');await page.getByLabel('Details',{exact:true}).fill('Synthetic report: identifying information is visible.');
  await page.getByRole('button',{name:'Send photo report',exact:true}).click();await expect(page.getByRole('status')).toContainText('private moderation queue');expect(report.reason).toBe('privacy');expect(report.contact_email).toBe('');
});

test('moderators review a private pending preview and submit a reason before approval',async({page})=>{
  await mockCommunity(page,{user:{...member,moderator:true}});let approved=false,decision;
  await page.route('**/api/moderation',route=>route.fulfill({json:{photos:approved?[]:[{id:photoId,user_id:'00000000-0000-4000-8000-000000000003',component_id:component,caption:'Synthetic pending photo',alt_text:'A teal test rectangle.',display_name:'Test uploader',status:'pending',previewUrl:`/api/photos/${photoId}/preview`}],reports:[]}}));
  await page.route(`**/api/moderation/photos/${photoId}/approve`,async route=>{decision=route.request().postDataJSON();expect(route.request().headers()['x-csrf-token']).toBe('fictional-csrf');approved=true;await route.fulfill({json:{ok:true,status:'approved'}});});
  await page.goto('/moderation/');await expect(page.getByRole('img',{name:'A teal test rectangle.'})).toBeVisible();
  await page.getByRole('button',{name:'Approve photo',exact:true}).click();expect(approved).toBe(false);await expect(page.getByRole('alert')).toContainText('Enter a review reason');
  await page.getByLabel('Review reason',{exact:true}).fill('Correct component; useful markings and permission confirmed.');await page.getByRole('button',{name:'Approve photo',exact:true}).click();await expect(page.getByRole('status')).toContainText('Photo approved.');expect(decision.reason).toContain('permission confirmed');
});

test('disabled setup never presents a working sign-in or upload invitation, and policies are discoverable',async({page,request})=>{
  await mockCommunity(page,{user:null,config:{signInAvailable:false,uploadsAvailable:false,contactEmail:null}});
  await page.goto('/account/');await expect(page.locator('#sign-in-form')).toBeHidden();await expect(page.getByRole('status')).toContainText('not');
  for(const [path,title] of [['terms','Terms of Service'],['privacy','Privacy Policy'],['community','Community Guidelines'],['copyright','Copyright and Takedown Policy']]){
    await page.goto(`/policies/${path}/`);await expect(page.getByRole('heading',{name:title,level:1,exact:true})).toBeVisible();await expect(page.getByText('Policy version '+POLICY_VERSION,{exact:false})).toBeVisible();
  }
  const config=await (await request.get('/api/community/config')).json();expect(config.uploadsAvailable).toBe(false);
});
