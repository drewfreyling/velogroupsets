# Catalogue API

The public catalogue API reads the same curated Git records as the generated website. It runs in the existing Cloudflare Worker, requires no account or API key, and does not query D1 or R2. The API and its data become available when the application release is deployed; adding records to Git alone does not update a running site.

The [OpenAPI 3.1 contract](../apps/api/openapi.json) documents the versioned endpoints, fields, parameters, response schemas and errors. A readable page is generated at `/api-docs/`; the same contract is served at `/openapi.json` and `/api/v1/openapi.json`. The contract covers curated catalogue data. Community accounts, photo uploads, reports and moderation retain their existing separate APIs and access controls.

## Endpoints

All routes accept GET and HEAD. OPTIONS handles public CORS preflight. Writes to known catalogue routes return 405 with `Allow: GET, HEAD, OPTIONS`. One trailing slash is accepted.

| Path | Response |
| --- | --- |
| `/api/v1` | API version, catalogue revision and endpoint links |
| `/api/v1/manufacturers` | Paginated manufacturers |
| `/api/v1/manufacturers/{id}` | One manufacturer |
| `/api/v1/groupsets` | Paginated groupsets |
| `/api/v1/groupsets/{id}` | One groupset |
| `/api/v1/components` | Paginated components |
| `/api/v1/components/{id}` | One component |
| `/api/v1/component-types` | Paginated taxonomy entries with `id` and `name` |
| `/api/v1/component-types/{id}` | One taxonomy entry |
| `/api/v1/catalogue` | Complete manufacturers, groupsets, components and component types |
| `/api/v1/openapi.json` | OpenAPI 3.1 specification |

Records keep their canonical field names: `model_number`, `weight_g`, `weight_description`, `sources`, `technical_document`, `groupset_ids` and `start_year`, where applicable. Unknown values remain null. Shared components retain one identity. A component detail request using a documented historical **ID** alias returns the canonical record and a canonical `Content-Location` header; alias URLs do not create extra collection or bulk-export records. Slugs are not alternate API IDs.

Single-record responses wrap the record in `data`. Collection responses include `data` and `pagination`:

```json
{
  "data": [],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 0,
    "next_offset": null,
    "previous_offset": null
  }
}
```

The complete export wraps `{manufacturers, groupsets, components, component_types}` in `data`. API discovery and the OpenAPI document have the schemas described in the specification.

## Search and filters

| Parameter | Applies to | Behaviour |
| --- | --- | --- |
| `limit` | Every collection | Integer 1–100; default 50 |
| `offset` | Every collection | Integer 0–1,000,000; default 0 |
| `q` | Every collection | Up to 120 characters; case/accent-insensitive, with all whitespace-separated terms required |
| `manufacturer_id` | Groupsets, components | Canonical manufacturer ID |
| `groupset_id` | Components | Exact documented membership |
| `type` | Components | Stable taxonomy ID, such as `rear-derailleur` |

Search includes names, model numbers and IDs. Component search also includes manufacturer/group names, paired-control model numbers and historical aliases. An empty search applies no text filter. Query parameters must occur only once; unknown parameters, unknown filter IDs and invalid numeric bounds return 400. Filters combine with AND; individually valid but incompatible filters return an empty page. Offsets beyond the total also return an empty page.

Paginated groupset lists sort by `start_year` ascending, then ID. Other paginated collections sort by ID. The bulk export retains the canonical snapshot order. The order is deterministic within one catalogue revision. Clients should compare `X-Catalogue-Version` across pages and restart or use the bulk export if the revision changes between requests.

Examples against a local Worker:

```sh
curl 'http://127.0.0.1:8787/api/v1/manufacturers'
curl 'http://127.0.0.1:8787/api/v1/groupsets?manufacturer_id=shimano&limit=25'
curl 'http://127.0.0.1:8787/api/v1/components?groupset_id=shimano-105-r7000&type=rear-derailleur'
curl 'http://127.0.0.1:8787/api/v1/components?q=RD-R7000&limit=10'
curl 'http://127.0.0.1:8787/api/v1/components/shimano-rd-r7000-gs'
curl 'http://127.0.0.1:8787/api/v1/catalogue' -o catalogue.json
```

Replace the local origin with the staging or production origin after that application has been deployed. The OpenAPI server URL `/` resolves against the origin serving the contract.

## Caching and browser access

Successful versioned reads use `Cache-Control: public, max-age=300, s-maxage=300, must-revalidate`. Each representation has a SHA-256 ETag, and `If-None-Match` can produce a bodyless 304. HEAD returns the same status/headers with no body, including for errors. `X-Catalogue-Version` identifies the build-time SHA-256 revision of the curated dataset and taxonomy.

The Worker uses Cloudflare’s local Cache API for successful public responses. Cache keys include both the catalogue revision and deployed release SHA; query validation precedes lookup. Cache failures fall back to the generated snapshot. Errors use `no-store`. The bulk export helps clients avoid repeated page requests.

These are Worker requests and remain subject to the account’s Worker request/CPU allowances. They do not add another database or hosting service. Cache API entries are local to the Cloudflare data centre serving the request, not a globally replicated application cache. Normal catalogue navigation/search still uses generated static content without calling this API.

Only the public versioned data routes and static OpenAPI download allow `Access-Control-Allow-Origin: *`. They never send credentials or user-specific responses. Versioned routes expose `ETag`, `X-Catalogue-Version` and `Content-Location` to browser clients. Preflight permits `If-None-Match` and `Content-Type`. Existing private community routes keep their original origin, session, CSRF and `no-store` behaviour.

## Maintaining the contract

Canonical catalogue schemas remain the source of record fields. [The OpenAPI factory](../apps/api/openapi.mjs) rewrites their local references into OpenAPI schema components and declares the HTTP operations. The checked-in JSON contract is generated, not maintained as an independent copy of the component fields.

```sh
npm run api:spec
npm run api:spec:check
npm run build
npm test
npm run worker:check
npm run test:browser
```

`npm test` validates the OpenAPI document with Swagger Parser, compares it with the factory output and validates actual API payloads with JSON Schema 2020-12. It exercises filtering, pagination, aliases, null weights, source preservation, CORS, conditional reads, cache isolation/failure and invalid requests. Playwright tests the compiled Worker and documentation in desktop and mobile Chromium. Existing CI runs these checks and remains the gate for manual deployment.
