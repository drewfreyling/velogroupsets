import { readFileSync, readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// Build commands run from the repository root; bundling relocates import.meta.url.
const data = new URL('data/', pathToFileURL(process.cwd() + '/'));
const read = (name) => readdirSync(new URL(name, data)).filter(f => f.endsWith('.json')).sort()
  .map(f => JSON.parse(readFileSync(new URL(`${name}/${f}`, data), 'utf8')));
export const manufacturers = read('manufacturers');
export const groupsets = read('groupsets');
export const components = read('components');
export const types = JSON.parse(readFileSync(new URL('schemas/component-type.schema.json', data), 'utf8')).oneOf;
export const typeName = (id) => types.find(t => t.const === id)?.title || id;
export const manufacturerFor = (record) => manufacturers.find(m => m.id === record.manufacturer_id);
export const manufacturerUrl = (m) => `/manufacturers/${m.slug}/`;
export const groupsetUrl = (g) => `/groupsets/${manufacturerFor(g).slug}/${g.slug}/`;
// Shared components have one canonical URL, independent of groupset membership.
export const componentUrl = (c) => `/components/${manufacturerFor(c).slug}/${c.slug}/`;
export const groupsFor = (record) => groupsets.filter(g => record.groupset_ids.includes(g.id));
export const searchRecords = components.map(c => ({
  id: c.id, name: c.name, model: c.model_code || '', type: c.type,
  typeName: typeName(c.type), manufacturer: manufacturerFor(c).name,
  groupsets: groupsFor(c).map(g => `${g.name} ${g.generation || ''}`).join(' '),
  url: componentUrl(c),
}));
