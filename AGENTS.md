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

Read [README.md](README.md) and [docs/architecture.md](docs/architecture.md) before changing the design. OpenTofu configuration, CI and catalogue schemas/validation are implemented; The staging Cloudflare D1/R2/Turnstile foundation is provisioned; the Astro/Tailwind frontend, Worker health endpoint and manual deployment workflow are implemented; the staging Worker/static assets are deployed; the staging custom domain and shared TLS 1.3/HSTS policy are live; production provisioning remains pending. Existing staging state is live: inspect it and review plans before infrastructure changes. Read [infra/README.md](infra/README.md) before infrastructure or workflow changes. Describe implemented and planned capabilities accurately.

Keep curated catalogue data in Git; keep real user accounts, comments, photos, database exports, and secrets out of the repository. Preserve stable catalogue IDs and cite sources for component facts.

For implementation changes, run the relevant checks that actually exist and document any checks that could not be run. For documentation changes, verify relative links, code fences, and diagram consistency. Update the documentation when behaviour or architecture changes.

## Infrastructure and CI

Keep infrastructure under `infra/opentofu/`. OpenTofu owns provisioned Cloudflare resources; Wrangler owns Worker code, static assets, and bindings. Never give both tools ownership of the same setting. Private R2 stores encrypted state and plans. GitHub Actions runs OpenTofu with verified backend locking; require GitHub environment approval and apply the exact checksum-verified saved plan. Never regenerate the plan in the apply job. Do not add state, saved plans, credentials, or secret outputs to Git or public CI artifacts.

Run the credential-free checks listed in [infra/README.md](infra/README.md#toolchain-and-checks). Mocked OpenTofu tests do not prove live API access or provisioning. Keep production credentials out of PR checks and use Conventional Commits for all changes.

## Catalogue and UI

Use Astro for generated catalogue pages and Tailwind CSS for the frontend, compiled at build time. Browse manufacturer → groupset → component. Keep canonical JSON records in `data/manufacturers/`, `data/groupsets/`, and `data/components/`; shared components use multiple groupset references rather than duplicated identities. Read [docs/catalogue.md](docs/catalogue.md) before changing catalogue contracts.

Use the ordered component-type schema as the single source of type IDs/UI labels. Preserve stable IDs separately from slugs and display names. Add only sourced facts; unknown values stay omitted/null. Do not infer that every groupset includes all categories or that compatibility implies membership. Install `scripts/requirements-catalogue.txt`, then run `python3 scripts/check_catalogue.py` and relevant catalogue tests after data/schema changes. Run `npm run build`, `npm test`, `npm run worker:check` and `npm run test:browser` for application changes; install Chromium with Playwright first. Run npm commands from the repository root.

Every component requires `model_number`, positive `weight_g`, identifying `weight_description`, and a manufacturer-hosted HTTPS `technical_document`. Both hub types require `weight_excludes_skewers: true`; never use skewer-inclusive hub weights or undocumented deductions. Groupsets require `model_number` and an ordered `year_range`; a null end means undocumented, not ongoing production. Preserve stable IDs when migrating fields. See the catalogue guide for source/variant requirements.

## UI copy

Write as a knowledgeable bicycle component reference: state what a page contains, cite sources and describe limitations precisely. Avoid slogans, lifestyle claims and promises of complete coverage. Link and button labels should name the action or destination, such as “Search the catalogue”, “See Shimano groupsets” and “Add a missing part”. Distinguish working features from planned ones; contribution links should explain the GitHub workflow.

Use model numbers as the primary component-page heading, with the component name as supporting text. Render groupset names consistently as name plus model number (for example, “105 R7000”). Avoid redundant eyebrow labels and tiny internal-ID captions. Use sentence-case section headings at a readable size, reserve monospace for actual model identifiers, and keep specification labels close to values in a responsive definition list.

Use the shared `ExternalLink` component for off-site links: only these links show ↗, open in a new tab, and announce “(opens in new tab)” in their accessible name. Internal navigation stays in the same tab without an external-link arrow.
