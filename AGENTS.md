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

Read [README.md](README.md) and [docs/architecture.md](docs/architecture.md) before changing the design. The repository is currently in planning: do not describe proposed routes, services, directories, or commands as already implemented.

Keep curated catalogue data in Git; keep real user accounts, comments, photos, database exports, and secrets out of the repository. Preserve stable catalogue IDs and cite sources for component facts.

For implementation changes, run the relevant checks that actually exist and document any checks that could not be run. For documentation changes, verify relative links, code fences, and diagram consistency. Update the documentation when behaviour or architecture changes.
