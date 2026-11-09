import type { APIRoute } from 'astro';
import specification from '../../../api/openapi.json' with {type:'json'};
export const GET:APIRoute=()=>new Response(JSON.stringify(specification),{
  headers:{'Content-Type':'application/json; charset=utf-8'},
});
