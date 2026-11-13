# Catalogue API

The public catalogue API is a set of generated JSON files served directly by **Cloudflare Workers Static Assets**. Successful GET/HEAD requests bypass the application Worker, including when Cloudflare needs to retrieve a cold asset. There are no D1, R2 or KV reads in this delivery path. Cloudflare documents direct static-asset requests as free and unlimited, subject to platform file limits.

The [OpenAPI 3.1 contract](../apps/api/openapi.json) documents the files and their response schemas. Readable documentation is generated at `/api-docs/`; download the contract at `/openapi.json`. Files update with an application deployment, not when a record is merely committed to Git.

## Production v1 compatibility

Production v1 preserves endpoint paths, response envelopes, existing fields and canonical IDs. Additive fields, new records and sourced data corrections are permitted. Consumers must tolerate new fields, records and component types, and explicit unknowns becoming known as evidence improves. Incompatible contract changes require a new major namespace such as `/api/v2/`; do not change the production v1 contract in place. The body-level `catalogue_version` identifies data revisions, not API versions.

The former staging Worker query API was replaced by static files before launch. Append `.json` to collection/detail URLs and use `/api/v1/index.json` for discovery. The old extensionless URLs and `/api/v1/openapi.json` are not endpoints; the contract is at `/openapi.json`.

There is no server-side search, filtering or pagination. **Static files ignore query strings.** A request with `?q=R7000&limit=1` returns the same complete file, not a filtered page or a validation error. Clients must download records and apply selection locally.

## Files

All documented files accept GET and HEAD.

| Path | Contents of data |
| --- | --- |
| `/api/v1/index.json` | API version and file links |
| `/api/v1/manufacturers.json` | All manufacturers |
| `/api/v1/manufacturers/{id}.json` | One manufacturer |
| `/api/v1/groupsets.json` | All groupsets |
| `/api/v1/groupsets/{id}.json` | One groupset |
| `/api/v1/components.json` | All components |
| `/api/v1/components/{id}.json` | One component |
| `/api/v1/component-types.json` | All taxonomy entries, each with id and name |
| `/api/v1/component-types/{id}.json` | One taxonomy entry |
| `/api/v1/catalogue.json` | Complete manufacturers, groupsets, components and component types |

Every response includes the snapshot revision:

```json
{
  "catalogue_version": "64-character SHA-256 revision",
  "data": []
}
```

The example shows a collection; detail files contain one record in data, while the catalogue file contains an object with manufacturers, groupsets, components and component_types arrays. Each array retains canonical snapshot order. Clients choose their own sorting.

Records preserve canonical field names, source references, technical documents, model variants and explicit nulls. Shared components retain one identity. Detail files use **canonical IDs only**, not slugs or historical aliases. Alias metadata remains in component records so clients can resolve it locally.

## Client example

Use the origin of a deployed environment instead of localhost when appropriate:

```sh
curl 'http://127.0.0.1:8787/api/v1/catalogue.json' -o catalogue.json
curl 'http://127.0.0.1:8787/api/v1/components/shimano-rd-r7000-gs.json'
```

Filter the downloaded snapshot without more requests:

```js
const response = await fetch('/api/v1/catalogue.json');
if (!response.ok) throw new Error('Catalogue download failed');
const { data, catalogue_version } = await response.json();
const components = data.components.filter(component =>
  component.manufacturer_id === 'shimano' &&
  component.groupset_ids.includes('shimano-105-r7000') &&
  component.type === 'rear-derailleur'
);
```

## Cache delivery and costs

The production Wrangler configuration excludes `/api/v1/*` from Worker-first routing. Existing files are handled directly by Workers Static Assets; do not add a Worker router in front of them. The static OpenAPI download follows the same asset-first path. No zone-wide Cache Everything rule, paid cache feature or new storage service is required.

The asset service manages Cloudflare caching and deployment updates. A cold location or eviction may require an internal asset fetch, so **a 100% cache-hit ratio is not guaranteed**. This still avoids the application Worker. Successful JSON responses carry `X-Catalogue-Delivery: static-assets`; that header identifies the configured delivery path, not whether this particular request was a cache hit.

Browser cache policy stays `Cache-Control: public, max-age=300, must-revalidate`. Cloudflare supplies ETags and supports conditional 304 responses and bodyless HEAD reads. Compare body-level catalogue_version values when combining separate files: browsers may retain different releases for up to five minutes. Downloading catalogue.json gives a consistent snapshot in one response.

All catalogue files and the OpenAPI download allow public CORS without credentials. Normal cross-origin GETs require no preflight. The static asset service does not support OPTIONS preflight. Cross-origin browser clients must use ordinary GET/HEAD requests without custom request headers and let browser HTTP caching handle validators. Same-origin and non-browser clients can send If-None-Match directly.

Within `/api/v1/*`, the static service handles missing files with the configured HTML 404 page and unsupported methods (including OPTIONS) with 405. These are platform responses, not the former JSON query-error contract. The bare `/api/v1` URL remains outside the static-file namespace and reaches the general Worker API handler. Use the documented `.json` file URLs.

The runtime Cache API used by the former query implementation did not eliminate Worker requests. Cloudflare's separate Workers Cache feature can skip execution on hits but still bills requests at the Workers rate; do not enable it globally to try to make these static reads free. Keep the direct static-asset path.

Community accounts, uploads, reports and moderation remain separate, authenticated where needed, and no-store. They still use the Worker and their provisioned storage. Never enable a broad cache rule covering them.

References checked on 10 November 2026: [static assets billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/), [asset-first routing](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/) and [Workers Cache billing](https://developers.cloudflare.com/workers/cache/).

## Maintaining and verifying the API

The [Astro endpoint generator](../apps/web/src/pages/api/v1/[...path].json.ts) prerenders the curated snapshot into JSON assets. The [OpenAPI factory](../apps/api/openapi.mjs) derives record definitions from the canonical schemas; its generated JSON contract is checked in.

```sh
npm run api:spec
npm run api:spec:check
npm run build
npm test
npm run worker:check
npm run test:browser
```

Tests validate the contract with Swagger Parser, every generated canonical record against its JSON Schema 2020-12 response schema, source/null preservation, platform asset limits and actual routing. A separate local Wrangler test replaces application code with a handler that returns 503 for every invocation: catalogue JSON reads still succeed, conditional requests and HEAD work, unknown files return the platform 404, and unsupported methods return 405. A community path must hit the failing probe. This detects accidental Worker-first routing even when response headers look correct.

Desktop/mobile browser tests cover downloaded data, local filtering, cache headers, conditional responses, CORS and documentation. These run in CI and gate manual deployment. Local tests establish routing behaviour; live cache residency and account billing must be verified after deployment through Cloudflare analytics.

Groupsets expose their primary riding `category` (`road`, `mtb`, `gravel` or `track`), defined in the OpenAPI schema. Components inherit categories through their `groupset_ids`; a shared part can appear in several categories without duplicated identity. Clients filter the downloaded static records.
