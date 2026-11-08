import type { Env } from './types.ts';
import { HttpError, boundedBody } from './http.ts';
import { MAX_EDGE, MAX_OUTPUT_BYTES, MAX_PIXELS, MAX_UPLOAD_BYTES } from '../../../packages/shared/community.ts';
export function sniffImage(bytes:Uint8Array) {
  if(bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';
  if(bytes.length>=8&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))return 'image/png';
  if(bytes.length>=12&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP')return 'image/webp';
  throw new HttpError(415,'Upload a JPEG, PNG or WebP photo. SVG, GIF and other formats are not accepted.');
}
// Remove every JPEG APP segment and comment, including metadata between scans.
// Entropy-coded data is copied byte-for-byte. Bytes after EOI are discarded.
export function stripJpegMetadata(bytes:Uint8Array) {
  if(bytes[0]!==255||bytes[1]!==216)throw new HttpError(422,'The image processor did not return a valid JPEG.');
  const chunks:Uint8Array[]=[bytes.subarray(0,2)];let p=2,sawScan=false,sawFrame=false;
  while(p<bytes.length){
    const start=p;if(bytes[p]!==255)throw new HttpError(422,'Invalid processed JPEG.');
    while(bytes[p]===255)p++;
    const marker=bytes[p++];
    if(marker===217){
      if(!sawScan||!sawFrame)throw new HttpError(422,'Invalid processed JPEG.');
      chunks.push(new Uint8Array([255,217]));const size=chunks.reduce((n,c)=>n+c.length,0);const result=new Uint8Array(size);let i=0;for(const c of chunks){result.set(c,i);i+=c.length;}return result;
    }
    if(marker===0||marker===216||marker===undefined||marker>=208&&marker<=215)throw new HttpError(422,'Invalid processed JPEG.');
    if(p+2>bytes.length)throw new HttpError(422,'Invalid processed JPEG.');
    const length=(bytes[p]<<8)|bytes[p+1];if(length<2||p+length>bytes.length)throw new HttpError(422,'Invalid processed JPEG.');
    const end=p+length;
    if([192,193,194].includes(marker))sawFrame=true;
    if(marker===218){
      sawScan=true;p=end;
      while(p<bytes.length){const next=bytes.indexOf(255,p);if(next<0)throw new HttpError(422,'Invalid processed JPEG.');const following=bytes[next+1];if(following===0||following>=208&&following<=215){p=next+2;continue;}p=next;break;}
      chunks.push(bytes.subarray(start,p));
    } else {if(!(marker>=224&&marker<=239)&&marker!==254)chunks.push(bytes.subarray(start,end));p=end;}
  }
  throw new HttpError(422,'The processed image is incomplete.');
}
export async function sanitizeImage(file:File,env:Env) {
  if(!env.IMAGES)throw new HttpError(503,'Image processing is unavailable.');
  if(file.size===0||file.size>MAX_UPLOAD_BYTES)throw new HttpError(413,'Choose a photo no larger than 5 MiB.');
  const bytes=new Uint8Array(await file.arrayBuffer());const mime=sniffImage(bytes);
  if(mime==='image/webp' && String.fromCharCode(...bytes.subarray(12,16))==='VP8X' && (bytes[20]&2))throw new HttpError(415,'Animated images are not accepted.');
  if(mime==='image/png'){
    for(let p=8;p+12<=bytes.length;){
      const length=new DataView(bytes.buffer,bytes.byteOffset+p,4).getUint32(0);
      const type=String.fromCharCode(...bytes.subarray(p+4,p+8));
      if(type==='acTL')throw new HttpError(415,'Animated images are not accepted.');
      if(length>bytes.length-p-12)break;p+=length+12;
    }
  }
  if(file.type!==mime)throw new HttpError(415,'The file contents do not match its image type.');
  let info:any;
  try {info=await env.IMAGES.info(new Blob([bytes]).stream());}catch{throw new HttpError(422,'This photo could not be decoded.');}
  if(!['jpeg','jpg','png','webp'].includes(String(info.format).toLowerCase().replace('image/',''))||!Number.isInteger(info.width)||!Number.isInteger(info.height)||info.width<1||info.height<1||info.width*info.height>MAX_PIXELS)throw new HttpError(422,'Choose a still image with no more than 20 megapixels.');
  if(info.frames&&info.frames>1)throw new HttpError(415,'Animated images are not accepted.');
  let response:Response;
  try {
    const result=await env.IMAGES.input(new Blob([bytes]).stream()).transform({width:MAX_EDGE,height:MAX_EDGE,fit:'scale-down'}).output({format:'image/jpeg',quality:85,anim:false});
    response=result.response();
  }catch{throw new HttpError(422,'This photo could not be re-encoded.');}
  if(!response.ok||response.headers.get('Content-Type')?.split(';')[0]!=='image/jpeg')throw new HttpError(422,'Image processing failed.');
  const encoded=stripJpegMetadata(await boundedBody(new Request('https://image.internal',{method:'POST',body:response.body,duplex:'half'} as RequestInit),MAX_OUTPUT_BYTES));
  // Read dimensions from the final JPEG, after orientation and resizing.
  let outputInfo:any;try{outputInfo=await env.IMAGES.info(new Blob([encoded]).stream());}catch{throw new HttpError(422,'Processed image validation failed.');}
  if(!Number.isInteger(outputInfo.width)||!Number.isInteger(outputInfo.height)||outputInfo.width<1||outputInfo.height<1||outputInfo.width>MAX_EDGE||outputInfo.height>MAX_EDGE)throw new HttpError(422,'Processed image dimensions are invalid.');
  return {bytes:encoded,width:outputInfo.width,height:outputInfo.height};
}
