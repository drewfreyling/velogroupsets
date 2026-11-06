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

Read [README.md](README.md) and [docs/architecture.md](docs/architecture.md) before changing the design. OpenTofu configuration, CI and catalogue schemas/validation are implemented; Cloudflare resources have not yet been provisioned and the application remains planned. Read [infra/README.md](infra/README.md) before infrastructure or workflow changes. Describe implemented and planned capabilities accurately.

Keep curated catalogue data in Git; keep real user accounts, comments, photos, database exports, and secrets out of the repository. Preserve stable catalogue IDs and cite sources for component facts.

For implementation changes, run the relevant checks that actually exist and document any checks that could not be run. For documentation changes, verify relative links, code fences, and diagram consistency. Update the documentation when behaviour or architecture changes.

## Infrastructure and CI

Keep infrastructure under `infra/opentofu/`. OpenTofu owns provisioned Cloudflare resources; Wrangler owns future Worker code, static assets, and bindings. Never give both tools ownership of the same setting. Private R2 stores encrypted state and plans. GitHub Actions runs OpenTofu with verified backend locking; require GitHub environment approval and apply the exact checksum-verified saved plan. Never regenerate the plan in the apply job. Do not add state, saved plans, credentials, or secret outputs to Git or public CI artifacts.

Run the credential-free checks listed in [infra/README.md](infra/README.md#toolchain-and-checks). Mocked OpenTofu tests do not prove live API access or provisioning. Keep production credentials out of PR checks and use Conventional Commits for all changes.

## Catalogue and UI

Use Tailwind CSS for the future frontend, compiled at build time. Browse manufacturer → groupset → component. Keep canonical JSON records in `data/manufacturers/`, `data/groupsets/`, and `data/components/`; shared components use multiple groupset references rather than duplicated identities. Read [docs/catalogue.md](docs/catalogue.md) before changing catalogue contracts.

Use the ordered component-type schema as the single source of type IDs/UI labels. Preserve stable IDs separately from slugs and display names. Add only sourced facts; unknown values stay omitted/null. Do not infer that every groupset includes all categories or that compatibility implies membership. Install `scripts/requirements-catalogue.txt`, then run `python3 scripts/check_catalogue.py` and relevant catalogue tests after data/schema changes. The frontend/Tailwind package integration is still planned.
