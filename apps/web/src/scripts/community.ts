export async function api(path:string,options:RequestInit={}) {
  const response=await fetch(path,{credentials:'same-origin',cache:'no-store',...options});
  const body=await response.json();if(!response.ok)throw new Error(body.error||'This action could not be completed.');return body;
}
export function element(tag:string,className='',content='') {const node=document.createElement(tag);node.className=className;node.textContent=content;return node;}
export function message(node:HTMLElement|null,value:string,error=false) {if(!node)return;node.textContent=value;node.setAttribute('role',error?'alert':'status');}
let turnstileScript:Promise<void>|undefined;
export async function challenge(container:HTMLElement,siteKey:string,action:string,input:HTMLInputElement) {
  const win=window as any;
  if(!turnstileScript)turnstileScript=new Promise<void>((resolve,reject)=>{
    if(win.turnstile){resolve();return;}
    // With async loading, Cloudflare's onload callback signals API readiness.
    // turnstile.ready() requires a synchronous script and rejects async/defer.
    const callback='__veloGroupsetsTurnstileReady';
    win[callback]=()=>{delete win[callback];resolve();};
    const script=document.createElement('script');
    script.src=`https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=${callback}`;
    script.async=true;
    script.onerror=()=>{delete win[callback];reject(new Error('The anti-spam check could not load. Please use the contact email if the problem continues.'));};
    document.head.append(script);
  });
  await turnstileScript;
  const id=win.turnstile.render(container,{sitekey:siteKey,action,callback:(token:string)=>{input.value=token;},'expired-callback':()=>{input.value='';},'error-callback':()=>{input.value='';}});
  return ()=>{input.value='';win.turnstile.reset(id);};
}
export function jsonOptions(body:unknown,csrf?:string):RequestInit {return {method:'POST',headers:{'Content-Type':'application/json',...(csrf?{'X-CSRF-Token':csrf}:{})},body:JSON.stringify(body)};}
