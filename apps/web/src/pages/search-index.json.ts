import { searchRecords } from '../lib/catalogue.mjs';
export function GET() { return new Response(JSON.stringify(searchRecords), { headers: { 'Content-Type': 'application/json' } }); }
