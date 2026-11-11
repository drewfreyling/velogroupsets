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
export const groupsetName = (g) => `${g.name} ${g.model_number}`;
export const groupsFor = (record) => groupsets.filter(g => record.groupset_ids.includes(g.id));
export const modelNumbersFor = (record) => [...new Set([
  record.model_number, record.specifications?.left_model, record.specifications?.right_model,
].filter(Boolean))];
export const searchRecords = components.map(c => ({
  id: c.id, name: c.name, model: c.model_number, models: modelNumbersFor(c), weight_g: c.weight_g, weight_description: c.weight_description, type: c.type,
  weight_basis: c.specifications?.weight_basis ?? null,
  typeName: typeName(c.type), manufacturer: manufacturerFor(c).name,
  groupsets: groupsFor(c).map(groupsetName).join(' '),
  url: componentUrl(c),
}));
