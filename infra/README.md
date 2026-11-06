# Infrastructure and CI

The repository includes Terraform configuration and GitHub Actions workflows. They have not provisioned Cloudflare resources yet. Application code, Wrangler deployments, D1 schema migrations, DNS routes, cache/WAF rules, and image processing are still to be implemented.

## Included foundation

For each environment, Terraform defines:

- One D1 community database, with destruction/replacement protection.
- Separate temporary-upload and approved-photo R2 buckets, with destruction/replacement protection.
- Disabled public `r2.dev` access on both buckets.
- Upload CORS allowing only `PUT` from that environment's HTTPS website origin, with `Content-Type` and exposed `ETag`.
- Deletion of **all staging originals after seven days**, plus aborting incomplete multipart uploads after one day. Processing must finish within that retention period; staging is not an original-photo archive.
- Cleanup of incomplete multipart uploads in approved storage, without automatic deletion of published objects.
- A managed Turnstile widget restricted to the environment's hostname, without network challenge clearance.
- An optional approved-photo custom domain, **disabled by default**. It requires `zone_id` and a reviewed `enable_public_photos = true` change.
- Non-secret outputs for future Wrangler bindings and the public Turnstile site key. The Turnstile secret is stored in Terraform state by the provider and is deliberately not an output.

| Environment | Website hostname | Resource prefix | HCP workspace |
| --- | --- | --- | --- |
| staging | `staging.velogroupsets.com` | `velogroupsets-staging` | `velogroupsets-staging` |
| production | `velogroupsets.com` | `velogroupsets-production` | `velogroupsets-production` |

The Cloudflare account ID is a non-secret identifier in [the environment inputs](terraform/environments/). Those files do not create website DNS records. Photo hostnames are reserved configuration values until public access is explicitly enabled.

## Toolchain and local checks

Use Terraform **1.17.1** (also recorded in [`.terraform-version`](../.terraform-version)), Cloudflare provider **5.28.1**, Python **3.13** in CI, and actionlint **1.7.12**. GitHub Actions dependencies are pinned to commit SHAs. Install these tools locally through their official distributions; Python scripts use only the standard library.

From the repository root:

```sh
python3 scripts/check_commits.py
python3 scripts/check_docs.py
python3 -m unittest discover -s scripts/tests -v
terraform -chdir=infra/terraform fmt -check -recursive
terraform -chdir=infra/terraform init -backend=false -input=false -lockfile=readonly
terraform -chdir=infra/terraform validate
terraform -chdir=infra/terraform test
actionlint
```

These checks need no Cloudflare/HCP credentials and do not read live state or create resources. Initialization downloads the locked provider. Tests use a mocked provider, so they verify configuration and safety conditions, not the live Cloudflare API or token permissions.

Commit `.terraform.lock.hcl`. To deliberately upgrade the toolchain, update the pins and docs, regenerate the lock file using the official registry, run all checks, and review the diff.

## Bootstrap HCP Terraform

HCP Terraform is the selected remote backend **and remote execution service**. It supplies separate workspace state, locking, remote plans, and approval of the exact plan. Check its current free-tier terms before enabling paid features. The organization and workspaces must exist before a workflow can run; this repo does not provision its own state service.

1. Create an HCP Terraform organization, then two **API-driven** workspaces named exactly `velogroupsets-staging` and `velogroupsets-production`.
2. Set each workspace's execution mode to **Remote**, Terraform version to **1.17.1**, and working directory to empty/root. The workflow uploads the Terraform directory as the archive root. Disable **Auto Apply** on both workspaces; the submission script refuses other settings and also sets `auto-apply: false` on every run.
3. Add a sensitive **environment variable** named `CLOUDFLARE_API_TOKEN` to each HCP workspace. Do not create Terraform variables for the account, environment, hostname, or other committed inputs: the uploaded configuration supplies the selected environment as `environment.auto.tfvars`. Avoid priority variable sets or `TF_VAR_*` overrides of those inputs.
4. Grant the Cloudflare token the account-scoped permissions needed for this foundation: **D1 Edit/Write**, **Workers R2 Storage Edit/Write**, and **Turnstile Sites Edit/Write** (Cloudflare's labels vary by UI/API). Keep its account scope limited to the configured account. Use separate staging/production tokens where practical; some Cloudflare permissions are account-wide rather than bucket-specific.
5. Before enabling photo domains, obtain the existing zone ID and verify that the token has the permissions required by the R2 custom-domain endpoint for that zone. No broad DNS/WAF token is needed for the initial configuration, which manages neither general DNS nor zone rules.
6. Create an HCP API token authorized to read the selected workspace, upload configurations, and queue runs. Scope access narrowly using the capabilities available on your HCP plan. Treat it as sensitive: workspace access may include state access. Approval/apply access should remain with the maintainer through HCP, not an automatic apply step in GitHub.
7. Restrict workspace access and configure state retention/recovery. The provider persists a Turnstile secret in state even though outputs omit it.

HCP locking serializes applies within a workspace. Staging and production use different workspaces/state; changing a `.tfvars` file alone is not state separation. Never disable state locking to work around a queued run. Resolve/discard stale runs in HCP after investigating them.

## Configure GitHub

Create GitHub environments named `staging` and `production`. Restrict production deployment branches to `main` and configure required reviewers where your GitHub plan supports them. HCP still requires explicit apply approval regardless of GitHub environment-review availability.

Set these values **in each GitHub environment**:

| Kind | Name | Value |
| --- | --- | --- |
| Variable | `TF_CLOUD_ORGANIZATION` | Your HCP organization name |
| Secret | `TF_API_TOKEN` | The HCP token for that environment's workspace |

Cloudflare API tokens live in HCP, not GitHub. No credential belongs in `.tfvars`, workflow YAML, outputs, pull request comments, or chat. Never run an infrastructure workflow against unreviewed code.

Recommended required PR checks: **Repository checks**, **Terraform checks (no credentials)**, and **Workflow lint**. Configure branch protection/rulesets in GitHub so those checks must pass before changes reach `main`.

## Workflows

### CI

[CI](../.github/workflows/ci.yml) runs on PRs and pushes to `main`, and can be called by the infrastructure workflow. It checks incoming commits and PR titles for Conventional Commits, local documentation links/anchors/fences and shared diagrams, automation unit tests, Terraform formatting/schema validation/mocked tests, and workflow syntax using actionlint.

PR titles are rechecked when edited. Commit checks examine incoming commits rather than failing on the repository's pre-existing initial commit. Local/manual checks inspect the newest commit. No job uses deployment secrets, and fork PRs never receive infrastructure access.

### Terraform infrastructure

[Terraform infrastructure](../.github/workflows/terraform.yml) is **manual only** and accepts dispatches from `main`. It first reruns the credential-free CI checks, then uses the selected GitHub environment to upload configuration and queue an HCP run.

1. Merge reviewed changes to `main` after CI passes.
2. In GitHub Actions, select **Terraform infrastructure → Run workflow**, choose `main` and the environment, and start with `speculative-plan`.
3. Follow the run link in the job summary. A successful GitHub job means the run was **queued**, not that the remote plan or apply passed. Inspect the HCP run result.
4. When ready to provision, dispatch `plan-for-approval`. It queues a new apply-capable plan with auto-apply disabled. Review **that plan** in HCP; a prior speculative plan cannot be applied and does not approve this new plan.
5. Confirm the commit SHA, environment, resource names, and absence of unexpected deletions/replacements. Explicitly approve/apply the same run in HCP, or discard it. Start with staging.
6. Verify the apply and outputs in HCP. Only after reviewing staging should production get its own plan and approval.

No state files, saved binary plans, presigned upload URLs, or secret outputs are published as GitHub artifacts. The upload script allowlists root `.tf` files, the provider lock file, and exactly one selected environment input file. It does not upload state, credentials, tests, or the other environment's inputs. There is no automatic apply call, destroy operation, or deployment on PR events.

The GitHub `deploy-<environment>` concurrency group serializes submissions and is reserved for future application release workflows. It ends when the remote run is queued; it does **not** hold a lock through later HCP approval/apply. Before building application deployments, add a wait/coordination step for the remote run. HCP's workspace queue/locking remains authoritative for Terraform operations.

## Existing resources, imports, and recovery

Before the first apply, inventory existing D1 databases, buckets, widgets, DNS, and public domains. The initial plan should create only this foundation; it must not replace existing data services. Keep the existing domain registration and zone untouched.

For existing resources, use Terraform import blocks in a reviewed change and confirm the pinned provider's import support and identifier format. D1 databases, R2 buckets, and Turnstile widgets support import. Several R2 settings resources in provider 5.28.1, including CORS, lifecycle policies, managed domains, and custom domains, **do not support import**. Inventory their current settings and deliberately reconcile them before applying; do not assume every resource can be imported.

Persistent resources have `prevent_destroy = true`. This guards replacement/destruction while the resource block remains in configuration; removing the block removes that protection. Always review plans. Infrastructure state recovery is not a backup of D1 rows or R2 objects. Live database/object backup and restore procedures remain required before community launch.

For CLI access to a configured HCP workspace, set `TF_CLOUD_ORGANIZATION` and `TF_WORKSPACE` in your shell, authenticate through Terraform's supported login/token mechanism, and initialize the cloud backend. Keep credentials outside Git. Use the same pinned toolchain and selected environment inputs; avoid ad hoc local applies bypassing the reviewed HCP workflow.

## Next infrastructure work

- Scaffold the Worker/static site and add real build/test/deployment jobs through Wrangler.
- Read `wrangler_bindings` from HCP outputs into application configuration; keep Worker code and bindings owned by Wrangler.
- Deliver the Turnstile secret from the secured provider/dashboard workflow directly to the Worker secret store. Do not add it as a normal Terraform output or build-time frontend variable.
- Select ownership/targets for website DNS, Worker routes, and custom domains after the Worker exists; import existing records first.
- Add narrowly scoped cache/WAF rules after the actual routes and plan features are known. A zone-level ruleset phase must have a single owner across environments; do not create conflicting per-environment rulesets in the same zone.
- Enable the approved-photo custom domain only after image validation, moderation, publication, and removal procedures are implemented.
- Configure actual backups, usage monitoring, and application-level quotas; bucket cleanup is not a complete cost cap.
