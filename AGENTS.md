# Repository instructions

## Commit messages and pull requests

All commits in this repository must follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/), including documentation, catalogue data, maintenance, and automated commits.

Use:

```text
<type>[optional scope][!]: <description>

[optional body]

[optional footer(s)]
```

- Use a meaningful type such as `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`, or `data`.
- Use an optional scope to identify the affected area, for example `web`, `api`, `catalogue`, `components`, or `architecture`.
- Write a concise description of the change.
- Mark breaking changes with `!` before the colon and/or a `BREAKING CHANGE:` footer describing the impact.
- Use Conventional Commits format for pull request titles so squash-merge commit messages remain compliant. Check the final squash message as well.

Examples:

```text
docs(architecture): document Cloudflare hosting and upload flows
feat(web): add groupset search
fix(api): prevent comments on removed photos
data(components): add sourced component specifications
ci: validate catalogue records on pull requests
feat(api)!: change photo comment response format
```

## Project context

Read [README.md](README.md) and [docs/architecture.md](docs/architecture.md) before changing the design. OpenTofu configuration, CI and catalogue schemas/validation are implemented; The staging Cloudflare D1/R2/Turnstile foundation is provisioned; the Astro/Tailwind frontend, Worker health endpoint and manual deployment workflow are implemented; the staging Worker/static assets are deployed; the staging custom domain and shared TLS 1.3/HSTS policy are live; production catalogue/domain and isolated foundation are deployed, with community features disabled. Existing staging state is live: inspect it and review plans before infrastructure changes. Read [infra/README.md](infra/README.md) before infrastructure or workflow changes. Describe implemented and planned capabilities accurately.

Keep curated catalogue data in Git; keep real user accounts, comments, photos, database exports, and secrets out of the repository. Preserve stable catalogue IDs and cite sources for component facts.

For implementation changes, run the relevant checks that actually exist and document any checks that could not be run. For documentation changes, verify relative links, code fences, and diagram consistency. Update the documentation when behaviour or architecture changes.

## Infrastructure and CI

Keep infrastructure under `infra/opentofu/`. OpenTofu owns provisioned Cloudflare resources; Wrangler owns Worker code, static assets, and bindings. Never give both tools ownership of the same setting. Shared apex CAA, Google Search Console verification TXT and zone TLS/HSTS have a single owner in staging state; do not duplicate them in production state. Private R2 stores encrypted state and plans. GitHub Actions runs OpenTofu with verified backend locking; require GitHub environment approval and apply the exact checksum-verified saved plan. Never regenerate the plan in the apply job. Do not add state, saved plans, credentials, or secret outputs to Git or public CI artifacts.

Import the existing Google verification TXT without changes. Preserve its content, TTL, comment and tags; its adoption plan guard must reject DNS changes or a duplicate record. The TXT proof is publicly readable DNS data, not an API secret. Shared Email Routing DNS and the contact forwarding rule also belong only to staging state. Import existing mail without changes; the plan guard must reject changes until deliberately revised. Never commit or log the personal forwarding destination: use `EMAIL_FORWARDING_DESTINATION` in GitHub secrets, sensitive OpenTofu inputs and encrypted state/plans. Cloudflare owns generated mail DNS records; do not independently declare duplicate MX/SPF records. CSAM inspection logs only enabled/verification status, never its notification email or raw provider responses.

Keep website deployment manual through `workflow_dispatch`. The deploy job must depend on successful reusable CI for the same commit, with an explicit success condition before GitHub environment approval.

Production currently launches as a read-only catalogue. Preserve the build-time community UI gate and forced `COMMUNITY_ENABLED=false` / `UPLOADS_ENABLED=false` in production deployment configuration, with no D1/R2/Images bindings, community secrets, migrations or scheduled jobs. Deny community requests before accessing any binding. Run the separate production-origin build/browser suite as well as normal desktop/mobile CI. Do not enable community features through a GitHub variable alone; follow the reviewed activation procedure in [the production launch guide](docs/production-launch.md).

Run Playwright functionality tests in credential-free CI for both desktop and mobile Chromium; manual website deployment reuses that CI result. Browser failures must fail CI and block deployment. Keep failure artifacts limited to generated Playwright reports/screenshots/traces from the local test server, never infrastructure state, plans or credentials.

Run the credential-free checks listed in [infra/README.md](infra/README.md#toolchain-and-checks). Mocked OpenTofu tests do not prove live API access or provisioning. Keep production credentials out of PR checks and use Conventional Commits for all changes.

## Catalogue and UI

Use Astro for generated catalogue pages and Tailwind CSS for the frontend, compiled at build time. Browse manufacturer → groupset → component. Keep canonical JSON records in `data/manufacturers/`, `data/groupsets/`, and `data/components/`; shared components use multiple groupset references rather than duplicated identities. Read [docs/catalogue.md](docs/catalogue.md) before changing catalogue contracts.

Use the ordered component-type schema as the single source of type IDs/UI labels. Preserve stable IDs separately from slugs and display names. Add only sourced facts; unknown values stay omitted/null. Do not infer that every groupset includes all categories or that compatibility implies membership. Install `scripts/requirements-catalogue.txt`, then run `python3 scripts/check_catalogue.py` and relevant catalogue tests after data/schema changes. Run `npm run build`, `npm test`, `npm run worker:check` and `npm run test:browser` for application changes; install Chromium with Playwright first. Run npm commands from the repository root.

Follow [docs/weights-guidelines.md](docs/weights-guidelines.md) for weight contributions: cranksets exclude bottom brackets and identify the weighed crank length and every chainring tooth count; prefer 170 mm reference cranks without rejecting other explicitly sourced lengths; square-taper bottom brackets identify the weighed spindle length; shifter records represent left/right pairs even when weights are unknown, with `weight_basis: "Pair"`; standalone brake levers use pair weights; cassettes identify the weighed tooth range and sprocket count, with lockring inclusion assumed unless explicitly excluded by the source (no verification required); brake calipers use either a complete front/rear pair weight or separate front and rear records, with `weight_basis: "Pair"`, `"Front"` or `"Rear"` even when unknown; known caliper weights require `includes_brake_pads: true` and `includes_mounting_bolts: true`; front derailleurs identify braze-on/clamp mounting and clamp diameter where applicable. Do not treat noncompliant existing records as exceptions or guess replacement weights. Standalone brake levers use the `brake-levers` category; brake calipers use `brake-calipers`; never divide a pair weight or invent manufacturer model suffixes for position variants.

Every component requires `model_number`, `weight_g`, identifying `weight_description`, and an HTTPS `technical_document` hosted by the manufacturer or covered by the narrowly approved archive exception in [docs/campagnolo-record.md](docs/campagnolo-record.md#approved-archived-manufacturer-documents). The project owner approved original Campagnolo 1994/1997 spare-parts pages preserved by Disraeli Gears. Explicit source review also covers the original April 1985 n.18 bis, July 1987 Chorus, November 1987 Croce d’Aune and April 1989 Athena brochures on their exact documented archive paths. The original 1982 US Olympic catalogue at the exact `www.campyonly.com/history/catalogs/1982_olympic_catalog.pdf` path was also explicitly reviewed on 14 November 2026; other archives still need explicit review. Known weights must be positive. Any component without a compliant sourced weight must use explicit `weight_g: null`; render “Not yet sourced” without a gram suffix and preserve null in the search index. Never publish a noncompliant source figure as the canonical weight. Validate the type-specific reference configuration for every known weight. Both hub types require `weight_excludes_skewers: true`; never use skewer-inclusive hub weights or undocumented deductions. Groupsets require `category` (`road`, `mtb`, `gravel` or `track`), `model_number` and an integer `start_year`; classify the documented manufacturer range and derive component categories from memberships rather than duplicating the field. Categories and labels come from the catalogue schema. Do not collect or display end years. List each manufacturer’s groupsets by start year ascending, with name order for ties. Preserve stable IDs when migrating fields. See the catalogue guide for source/variant requirements.

Rear derailleurs require all four sourced-or-null limits in `specifications`: `total_capacity_teeth`, `maximum_sprocket_teeth`, `minimum_sprocket_teeth`, and `maximum_front_difference_teeth`. Display tooth units and explicit unknowns. Keep cage-code explanations in the shared `DerailleurCageHelp` component; never duplicate them in component records or infer compatibility from cage length. Preserve keyboard, hover, touch and no-JavaScript access to the explanation.

## UI copy

Write as a knowledgeable bicycle component reference: state what a page contains, cite sources and describe limitations precisely. Avoid slogans, lifestyle claims and promises of complete coverage. Link and button labels should name the action or destination, such as “Search the catalogue”, “See Shimano groupsets” and “Add a missing part”. Distinguish working features from planned ones; contribution links should explain the GitHub workflow.

Use model numbers as the entire component hyperlink text in catalogue results and groupset lists, and as the primary component-page heading. Keep the manufacturer and descriptive name as adjacent, unlinked supporting text; descriptions must remain searchable. Render groupset names consistently as name plus model number (for example, “105 R7000”). Avoid redundant eyebrow labels and tiny internal-ID captions. Use sentence-case section headings at a readable size, reserve monospace for actual model identifiers, and keep specification labels close to values in a responsive definition list.

Use the shared `ExternalLink` component for off-site links: only these links show ↗, open in a new tab, and announce “(opens in new tab)” in their accessible name. Internal navigation stays in the same tab without an external-link arrow.

## Colour and themes

Read [docs/design.md](docs/design.md) before changing visual styles. Use the shared semantic colour tokens for both light and dark modes. Base teal `#3DCFC2` takes `#10201F` ink, never white text; small links on light backgrounds use `#0B6B65`. Preserve system-theme fallback, the accessible persistent dark-mode toggle and the external pre-paint script without weakening CSP. Check responsive pages and contrast in both themes.


## Public catalogue API

Serve curated data as generated JSON under `/api/v1/*.json` using Workers Static Assets. Keep this namespace excluded from Worker-first routing; successful catalogue reads must not execute application code or access D1/R2/KV. Search, filtering and pagination run in clients; static files ignore query strings. Preserve the OpenAPI 3.1 contract, canonical records, explicit nulls, source citations and body-level catalogue revision. Run the failing-Worker routing probe, schema validation and desktop/mobile browser tests when changing delivery. Do not enable a broad cache rule or Workers Cache over private community routes or the direct static-asset path. Preserve the production v1 contract: endpoint paths, envelopes, existing fields and canonical IDs. Additive fields/records and sourced data corrections are permitted; incompatible contract changes require a new major API namespace.

## Community uploads and policies

Read [photo uploads](docs/photo-uploads.md) before changing community code or enabling uploads. Google sign-in, sessions, moderated photos, reports, owner removal and policy drafts are implemented; comments remain planned. Do not mark a mailbox, Google credentials or Cloudflare CSAM enrolment complete without evidence. Uploads stay disabled until operator/contact confirmation, provider secrets, private evidence storage and the approved-photo domain are ready. Keep identity/client/provider credentials and real community data out of Git and logs.

Require active, unchecked acceptance at sign-in and for each upload. Material policy changes need a new `POLICY_VERSION` and corresponding acceptance records. Decode/re-encode server-side, remove metadata before storage, enforce byte/pixel/output limits and atomic quotas, and never publish originals or pending bytes. CSAM matching runs on images entering the zone cache; it is not a private-upload scanner or a guarantee that an image is safe. Preserve human moderation, private reports and a monitored contact channel.

Keep temporary, approved/public and evidence storage separate. Evidence must have no public domain or automatic expiry. Public image requests must check current D1 status before fetching through the scanned CDN and must not fall back to private storage. Removals hide first and queue deletion/purge retries. Use only synthetic fixtures in CI; provider mocks do not prove live OAuth, scanning, mailbox monitoring or production image transformation behaviour. Run the community API integration tests and desktop/mobile browser tests, and review actual OpenTofu plans before infrastructure changes.
