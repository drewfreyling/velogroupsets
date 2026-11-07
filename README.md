# VeloGroupsets

An open-source reference for bicycle groupsets and components, with community photos and comments.

VeloGroupsets aims to make component specifications and identification information easy to browse, search, and improve. Most traffic should be served as static content at Cloudflare's edge; a small API handles community contributions.

> **Status: static application and infrastructure foundation.** Astro, Tailwind CSS, a TypeScript Worker, catalogue generation/search, CI and deployment workflows are implemented. The staging D1/R2/Turnstile foundation was [provisioned on 7 November 2026](https://github.com/drewfreyling/velogroupsets/actions/runs/42334477273). Production deployment remains pending. The catalogue includes [Shimano Dura-Ace road generations and documented track families](docs/dura-ace.md), all nine [Shimano 105 generations](docs/shimano-105.md), including separate R7100 mechanical and Di2 offerings, plus Exage 500EX A500, RX100 A550 and all five [Ultegra series offered in 1990–2009](docs/ultegra.md), including Ultegra SL; see the [catalogue notes](docs/catalogue.md#validation-and-current-status) for sources and coverage. The staging Worker and static assets were [deployed successfully](https://github.com/drewfreyling/velogroupsets/actions/runs/42338589328); [staging.velogroupsets.com](https://staging.velogroupsets.com/) is live after the [domain and TLS/HSTS apply](https://github.com/drewfreyling/velogroupsets/actions/runs/42339179675), using TLS 1.3 only and one-year HSTS with subdomains/preload; authentication, uploads and comments remain planned.

## Planned features

- Browse groupsets and individual components by manufacturer, model, generation, and component type.
- Search a static catalogue without making a database request for each search.
- View component specifications, source references, and community photos.
- Sign in to upload component photos and comment on photos.
- Report inappropriate content and support moderator approval, hiding, and removal.
- Improve curated catalogue data through GitHub pull requests.

Compatibility claims should identify their source and any limitations. Unknown information should stay explicitly unknown.

## Catalogue and UI

Use **Tailwind CSS** for the UI, compiled into static CSS during the frontend build. Browse data as **manufacturer → groupset → component**. Components use stable IDs and can be referenced by multiple groupsets, keeping shared photo/comment history together.

Each component requires a model number, a weight field with an identifying description, and a manufacturer-hosted technical specification. Known weights are positive grams for a configuration that meets the [weight guidelines](docs/weights-guidelines.md); any component awaiting a compliant sourced weight uses explicit null, displayed as “Not yet sourced”. Hub weights exclude skewers. Groupsets require a model number and year range; unknown end years are labelled explicitly.

The initial component types are Crankset, Bottom Bracket, Front Derailleur, Rear Derailleur, Shifters, Cassettes, Headset, Seatpost, Pedals, Front Hub, and Rear Hub.

See [the catalogue and UI guide](docs/catalogue.md) for the JSON schemas, relationships, component taxonomy, examples, and validation commands. Astro generates the frontend with Tailwind compiled at build time; browser search and type/groupset filters work without API requests.

The [colour and theme guide](docs/design.md) documents the teal palette, contrast rules and dark-mode behaviour.

## Architecture

The starting design uses **Cloudflare Workers Static Assets + a TypeScript Worker + D1 + R2**, with OpenTofu managing Cloudflare infrastructure in this repository and GitHub Actions deploying the application through Wrangler. This keeps the initial stack small and aims to fit a modest community within free allowances.

```mermaid
flowchart TD
    Browser["Browser"]

    subgraph GitHub["GitHub"]
        Repo["Source code and curated catalogue"]
        CI["GitHub Actions: validate, build, deploy via Wrangler"]
        TF["OpenTofu: plan, approval and saved-plan apply"]
        Repo --> CI
        CI -.-> TF
    end

    subgraph Cloudflare["Cloudflare"]
        State[("Private R2: encrypted state, plans and snapshots")]
        Edge["Custom domain: TLS 1.3, HSTS, CDN and available WAF rules"]
        Static["Workers Static Assets: HTML, CSS, JS, search index"]
        API["TypeScript Worker API"]
        DB[("D1: users, comments, photo metadata")]
        Staging[("Private R2 staging bucket")]
        Processing["Image validation, processing and moderation"]
        Photos[("Public R2 approved photos")]
        ImageCDN["images.example.com: CDN cache"]
        Turnstile["Turnstile verification"]

        Edge -->|"Catalogue and assets"| Static
        Edge -->|"/api/*: community reads and writes"| API
        API --> DB
        API -->|"Verify submission token"| Turnstile
        API -->|"Issue upload URL; verify completion"| Staging
        Staging --> Processing
        Processing -->|"Publish approved derivatives"| Photos
        Processing -->|"Update photo status"| DB
        ImageCDN --> Photos
    end

    TF ---|"Native state locking"| State
    Browser --> Edge
    Browser -->|"Signed PUT to R2 S3 endpoint"| Staging
    Browser -->|"View approved photos"| ImageCDN
    CI -.->|"Deploy"| Static
    CI -.->|"Deploy"| API
    CI -.->|"Apply reviewed migrations"| DB
    TF -.->|"Provision database"| DB
    TF -.->|"Provision private bucket and policies"| Staging
    TF -.->|"Provision public bucket and domain"| Photos
    TF -.->|"Configure DNS, cache and security rules"| Edge
    TF -.->|"Configure widget"| Turnstile
```

The processing box describes a required capability; its runtime and trigger are still to be selected. It must not be assumed to fit within a free Worker's image-processing budget. `images.example.com` is an illustrative hostname, not a configured domain.

See [the architecture document](docs/architecture.md) for request flows, upload safeguards, caching, data ownership, and outstanding decisions.

### Responsibilities

| Area | Proposed implementation |
| --- | --- |
| Curated groupset and component data | Versioned JSON in GitHub: manufacturers, groupsets and components, validated in CI |
| Catalogue pages and search | Generated HTML, Tailwind CSS and a static search index |
| Community API | TypeScript Worker for reads, comments, upload authorization, and moderation |
| Community records | D1 for user references, comments, photo metadata, and moderation state |
| Original uploads | Private R2 staging bucket |
| Published photos | Approved image derivatives in a separate public R2 bucket, served through a custom domain |
| Abuse prevention | Server-validated Turnstile, authentication, per-user quotas, and rate limits |
| Infrastructure | OpenTofu in `infra/opentofu/` for Cloudflare resources and settings |
| Delivery | GitHub Actions deploying trusted changes from `main` through Wrangler |

## Repository layout

The web and API apps, catalogue, infrastructure and CI are implemented. Shared packages and database migrations remain planned.

```text
velogroupsets/
├── apps/
│   ├── web/                 # Static site and frontend
│   └── api/                 # TypeScript Worker API
├── data/
│   ├── manufacturers/      # Curated brand records
│   ├── groupsets/           # Refer to manufacturer IDs
│   ├── components/         # Refer to manufacturers and groupset IDs
│   └── schemas/            # Catalogue contract and component taxonomy
├── packages/
│   └── shared/              # Shared types and validation
├── db/
│   └── migrations/          # D1 schema migrations
├── infra/
│   └── opentofu/           # Cloudflare resources, settings, and environment inputs
├── scripts/                 # Data checks and build helpers
├── docs/
│   └── architecture.md
├── .github/
│   └── workflows/           # Validation and deployment
├── AGENTS.md
├── LICENSE
└── README.md
```

Keep one repository initially so catalogue, frontend, and API changes can be reviewed together. User accounts, comments, uploads, database exports, and credentials belong outside Git.

## Local development

Use Node 24.22.1 (see `.node-version`). Run commands from the repository root:

```sh
git clone https://github.com/drewfreyling/velogroupsets.git
cd velogroupsets
npm ci
npm run dev
```

The Astro development server runs at `http://localhost:4321`. To exercise the production-style Worker routing and asset headers locally:

```sh
npm run build
npm test
npm run worker:check
npm run worker:dev
```

Wrangler serves the built site at `http://localhost:8787`; `GET /api/health` reports the environment/release. Unknown API paths return JSON 404s. Community writes are not implemented and local development uses no live D1/R2 resources. Run `npx playwright install chromium` once, then `npm run test:browser` for browser checks.

Set `SITE_URL` during builds to generate environment-specific canonical URLs and `/sitemap.xml`. The sitemap includes the home page, manufacturer index, catalogue and every canonical manufacturer/groupset/component page, with shared components listed once. Production `robots.txt` advertises the sitemap; other builds disallow crawling, and staging/localhost pages retain `noindex`. Normal assets bypass Worker execution, while `/api` and `/api/*` explicitly run the Worker. See the [CAA policy](infra/README.md#dns-caa-policy) for certificate-authority DNS records owned by the shared-zone state.

Infrastructure uses OpenTofu 1.13.9 and Cloudflare provider 5.28.1. CI checks Conventional Commits/PR titles, documentation, catalogue schemas/relationships, automation tests, OpenTofu formatting/validation/mocked tests, and workflow syntax. See [the infrastructure guide](infra/README.md) for local check commands, private R2 backend setup, environment configuration, and the manual plan/approval/apply workflow. CI also builds the static site, tests generated links and Worker routing, checks the Wrangler bundle, and runs Playwright in desktop and mobile Chromium configurations.

### Browser functionality checks

Run `npm run build` followed by `npm run test:browser`. Playwright starts a local Wrangler server against the built site. Both projects use Chromium: a desktop profile and an emulated Pixel 5 with touch input. This does not claim Firefox, WebKit or physical-device coverage.

The suite exercises catalogue browsing, combined search/type/groupset filters, reload and browser Back navigation, model-number links, shared component pages, sourced/unknown weights, rear derailleur limits and accessible cage-code help, 404 recovery, navigation without JavaScript, cache/security headers, external links and theme behaviour including cross-tab changes. Comments, uploads and authentication are not yet implemented and are not represented as working test flows.

| Stage | Browser checks |
| --- | --- |
| Pull requests and pushes to `main` | Full Playwright suite in the **Application build and tests** CI job |
| Manual website deployment | Reuses the same CI suite for the selected commit; a browser-test failure blocks environment approval and deployment |
| Live staging verification | Separate manual **Verify staging HTTPS** smoke workflow checks public HTTP/TLS behaviour; it does not replace the local functionality suite |

Browser failures fail CI. On failure, GitHub retains the HTML report, screenshots and Playwright traces for seven days under the `playwright-failures-…` artifact. Locally, use `npx --no-install playwright show-report` to inspect the report. These generated files are ignored by Git; CI tests use local public catalogue fixtures and no deployment credentials.

## Infrastructure ownership

Keep OpenTofu alongside the application in `infra/opentofu/` so infrastructure and code changes can be reviewed together.

| Owner | Scope |
| --- | --- |
| OpenTofu | D1 databases, R2 buckets and their CORS/lifecycle/public-domain settings, DNS, zone cache/WAF rules supported by the plan/provider, Turnstile widgets, and explicitly assigned route/domain resources |
| Wrangler + GitHub Actions | Worker definition and code, static assets, runtime bindings/configuration, and application deployment |
| Database migration tooling | D1 tables, indexes, and schema changes in `db/migrations/` |

Each resource or setting must have one owner. OpenTofu provisions databases/buckets; Wrangler references their IDs/names as bindings. Keep OpenTofu state in a secured remote backend with locking, separate staging and production state, and no state or credentials in Git. Commit the OpenTofu dependency lock file and only non-secret environment inputs. Private R2 stores encrypted state, plans, and snapshots with separate staging/production keys. GitHub Actions runs OpenTofu, verifies backend locking, and requires environment approval before applying the saved plan. See [the bootstrap guide](infra/README.md#bootstrap-the-state-bucket).

See [infrastructure and deployment](docs/architecture.md#infrastructure-and-deployment) for the proposed OpenTofu layout, ownership boundaries, imports, and plan/apply workflow.

## Deployment plan

1. Validate catalogue records and application changes; format and validate OpenTofu changes. Run plans only in trusted workflows with appropriately scoped credentials.
2. Review an environment-specific OpenTofu plan and apply that exact plan through the protected production workflow when infrastructure changes are required. Import existing resources before managing them.
3. Build static pages, assets, and a search index; deploy previews using isolated development resources and no production secrets.
4. Pass provisioned resource IDs/names into Wrangler bindings. Apply reviewed, backward-compatible migrations in the required order and deploy trusted application changes from `main` through Wrangler.
5. Verify the deployment, community API, and static routing.

Use explicit `/api/*` routing so API requests cannot fall through to static pages. Untrusted fork pull requests must not receive deployment credentials or access to production data. Prefer migrations compatible with both old and new application versions; an application rollback does not reverse database changes.

## Website releases

The manual [Deploy website workflow](.github/workflows/deploy-web.yml) builds a pinned commit from `main`, reruns CI, then waits for the target GitHub environment approval. It reads only allowlisted non-secret D1/R2 bindings from encrypted infrastructure state and deploys with Wrangler. It shares `deploy-<environment>` concurrency with OpenTofu. There is no automatic production deployment or PR access to live resources.

For the first release, deploy the Worker before enabling the OpenTofu `enable_site_domain` resource. OpenTofu owns the custom domain and its automatically provisioned DNS/TLS; Wrangler has no routes configured and keeps `workers.dev` and preview URLs disabled. A successful bootstrap Worker deploy alone does not make the staging hostname browsable. See [website deployment](infra/README.md#website-deployment) for token permissions, domain activation and verification.

## Cost approach

The goal is low ongoing cost, not an unconditional promise of free hosting. Domain registration and renewal remain separate costs.

Indicative Cloudflare allowances checked on **7 November 2026**:

| Service | Included free usage |
| --- | --- |
| Workers Static Assets | Free, unlimited requests served directly as static assets; platform file limits apply |
| Workers API | 100,000 requests per day and 10 ms CPU time per invocation |
| D1 | 5 million rows read/day, 100,000 rows written/day, 5 GB total storage; 500 MB maximum per database on Free |
| R2 Standard | 10 GB-month storage, 1 million Class A operations/month, 10 million Class B operations/month; no egress bandwidth fees |

D1 usage counts rows scanned/written, not just API calls. Add indexes and pagination. Image originals, derivatives, and abandoned uploads all consume storage.

Free-plan limits can cause requests or queries to fail. R2 and paid services can accrue usage charges. Budget alerts are notifications, not a hard spending cap: enforce upload quotas, size limits, cleanup policies, and usage monitoring in the application. Image processing, identity-provider features, and enhanced security features need their own pricing checks.

Official references: [static assets](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/), [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), [D1 limits](https://developers.cloudflare.com/d1/platform/limits/), and [R2 pricing](https://developers.cloudflare.com/r2/pricing/).

## Contributing

Issues and pull requests are welcome for catalogue corrections, source references, documentation, and implementation work.

- Use stable component and groupset IDs; a display-name or URL change must not detach existing community content.
- Include sources for specifications and distinguish documented facts from estimates.
- Follow the [component weight guidelines](docs/weights-guidelines.md), including required configurations, inclusions and exclusions.
- Submit only material you have permission to contribute. Do not copy manufacturer images or manuals without checking their terms.
- Keep real user data and secrets out of examples and fixtures.
- Update documentation when behaviour or architecture changes.

**All commits must follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).** Use the same format for pull request titles so squash merges remain compliant.

Examples:

```text
feat(catalogue): add groupset browsing
fix(api): reject comments on removed photos
docs(architecture): document direct R2 uploads
data(components): add sourced derailleur specifications
chore(ci): validate catalogue references
```

Use `!` and/or a `BREAKING CHANGE:` footer for breaking changes. See [AGENTS.md](AGENTS.md) for repository instructions for coding agents.

## Initial milestones

- [x] Define catalogue schemas, stable IDs, manufacturer/groupset/component relationships, component types, and source requirements.
- [x] Scaffold the Astro/Tailwind static frontend and TypeScript Worker; retain catalogue schema validation in CI.
- [x] Add catalogue generation, canonical component pages and client-side search/type/groupset filters.
- [ ] Select authentication and implement sessions and authorization.
- [ ] Add D1 migrations and paginated public community reads.
- [ ] Implement private uploads, image processing, and moderation.
- [ ] Add photo comments, reporting, and contributor quotas.
- [x] Implement credential-free CI and a manual OpenTofu plan/approval/apply workflow.
- [x] Define initial D1, R2, upload policies, and Turnstile OpenTofu resources.
- [x] Bootstrap the private R2 state backend and staging GitHub environments; complete the reviewed staging foundation apply.
- [ ] Configure production environments and complete a reviewed production foundation apply.
- [ ] Add isolated app previews, website DNS/routes, cache/WAF rules, and Wrangler production deployment.
- [ ] Establish backup, restore, deletion, and usage-monitoring procedures.
- [ ] Finalize catalogue licensing and user contribution/photo terms before accepting uploads.

## License

Project code is licensed under [GNU GPL v3.0](LICENSE). A dedicated catalogue-data policy and user-photo contribution terms remain to be defined; do not assume the code licence grants rights to third-party content.
