# Infrastructure and CI

OpenTofu manages Cloudflare resources; GitHub Actions runs checks, creates plans, and applies reviewed saved plans. A dedicated **private R2 bucket** stores encrypted state, plans, and recovery snapshots. No HCP account is needed. The staging foundation was [successfully applied on 7 November 2026](https://github.com/drewfreyling/velogroupsets/actions/runs/42334477273). Production deployment remains pending.

## Deployed staging foundation

| Resource | Name |
| --- | --- |
| D1 database | `velogroupsets-staging-community` |
| Private temporary-upload R2 bucket | `velogroupsets-staging-uploads` |
| Approved-photo R2 bucket, public access disabled | `velogroupsets-staging-photos` |
| Turnstile widget | `velogroupsets-staging-submissions` |

The apply also configured upload CORS, lifecycle policies, and disabled public `r2.dev` access. State and saved plans use the separately bootstrapped `velogroupsets-infra-state` bucket, with encrypted pre/post-apply snapshots. The staging GitHub environment has a required reviewer. Runtime binding IDs and the public Turnstile site key are available in secured OpenTofu outputs; the widget secret stays private.

D1 read replication is explicitly disabled, matching the provisioned single-primary default. Change that setting deliberately if the application later needs read replicas.

This provisions the data/storage/abuse-prevention foundation. Worker/static-site deployment, website DNS and a browsable staging site remain to be implemented.

## Included resources

Each environment defines one D1 community database, temporary-upload and approved-photo R2 buckets, upload CORS, cleanup policies, and a hostname-restricted managed Turnstile widget. D1 and application buckets have `prevent_destroy = true`. Both application buckets have public `r2.dev` access disabled. Approved-photo custom-domain access defaults to off.

Temporary originals expire after seven days; processing must finish first. Incomplete multipart uploads expire after one day. Published photos do not expire automatically. The state bucket is separate from these application buckets and is bootstrapped independently.

| Environment | Website | Backend key |
| --- | --- | --- |
| staging | `staging.velogroupsets.com` | `state/staging/terraform.tfstate` |
| production | `velogroupsets.com` | `state/production/terraform.tfstate` |

Account ID and hostnames in [environment inputs](opentofu/environments/) are non-secret. Backend settings in [backends](opentofu/backends/) contain no credentials. The backend uses the default CLI workspace and separate state keys; environment input files alone do not isolate state.

## Toolchain and checks

Use OpenTofu **1.13.9** ([`.opentofu-version`](../.opentofu-version)), Cloudflare provider **5.28.1**, Python **3.13** in CI, and actionlint **1.7.12**. Provider dependencies use the OpenTofu registry and the standard `.terraform.lock.hcl` filename. HCL still uses `terraform {}` and `.tf` files; those are OpenTofu's configuration syntax.

From the repository root, in a Python virtual environment:

```sh
python3 -m pip install -r scripts/requirements-infra.txt -r scripts/requirements-catalogue.txt
python3 scripts/check_commits.py
python3 scripts/check_docs.py
python3 scripts/check_catalogue.py
python3 -m unittest discover -s scripts/tests -v
python3 scripts/infra.py validate
actionlint
```

Validation runs formatting, backend-free initialization, schema validation, mocked resource checks, and a real local CLI lock/encryption probe. It uses a public test-only encryption key and never touches Cloudflare/R2. Live operations refuse a missing passphrase or one shorter than OpenTofu's 16-character minimum.

## Bootstrap the state bucket

Create `velogroupsets-infra-state` in account `5ccb67114ff0fa1a13cb46ef3d08cb49` through the Cloudflare dashboard before initializing the backend. This avoids making a state store depend on its own state. Bootstrap settings are an explicit exception to application IaC ownership; do not later adopt this bucket into the application root without a separate recovery design.

- Use Standard storage. Disable `r2.dev` and custom domains. Do not add browser CORS.
- Never apply the application's seven-day upload lifecycle policy to state storage.
- Add prefix-scoped lifecycle rules: delete `plans/` after two days, `lock-checks/` after seven days, and optionally `snapshots/` after your chosen retention period (at least 90 days initially). Do not expire `state/` or real `.tflock` objects. Retention must match your recovery needs.
- Create bucket-scoped **Object Read & Write** R2 S3 credentials for this bucket. These supply `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY`; they are different from a Cloudflare API bearer token.
- Restrict bucket administration and retain an independent encrypted copy of important recovery snapshots. Same-bucket snapshots do not survive bucket deletion. Do not assume that S3 bucket versioning is available on R2.

The backend enables `use_lockfile = true` and the R2-specific S3 compatibility flags. Before **every live plan and apply**, the script initializes a unique `lock-checks/<random>/terraform.tfstate` key, holds a lock using the built-in `terraform_data` resource, verifies that another OpenTofu process fails with a lock error, releases it, verifies a subsequent operation succeeds, and cleans up that disposable state. This checks actual pinned CLI/backend behavior, not just raw S3 conditional writes. A local probe cannot establish R2 compatibility: live verification remains pending until credentials are configured.

There is a reported [conditional-write retry/orphan-lock edge case](https://github.com/opentofu/opentofu/issues/4405). Passing a probe does not prove all network failures are safe. If a lock remains, first confirm all writers have stopped, inspect the lock ID and owning operation in a private terminal, and use a targeted `tofu force-unlock` only after investigation. Never disable locking, automatically force-unlock, or delete a real lock to make CI pass.

## Encryption and credentials

OpenTofu's native PBKDF2/AES-GCM encryption is enforced for state and saved plans. The wrapper passes key configuration through `TF_ENCRYPTION`, not files or command arguments. Generate a separate key per environment using `openssl rand -hex 32` in your own secure terminal, and back it up in a password manager. **Losing the key makes state, plans, and snapshots unrecoverable.** Keep key-provider/method names stable; rotation requires the documented OpenTofu fallback/migration procedure, not simply replacing the secret.

Create four GitHub environments: `staging-plan`, `staging`, `production-plan`, and `production`. Restrict all to the `main` branch. The apply environments (`staging` and `production`) **must have a required reviewer**. The apply script checks this through the GitHub API and fails closed if the policy is missing or unreadable. Ensure maintainers can approve a solo-maintainer run if that is your operating model. Configure reviewers and bypass permissions deliberately.

Set these secrets in both the plan and apply environments for a given target:

| Secret | Purpose |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Account-scoped provider API token |
| `R2_ACCESS_KEY_ID` | S3 key ID for the dedicated state bucket |
| `R2_SECRET_ACCESS_KEY` | Corresponding S3 secret |
| `TOFU_ENCRYPTION_PASSPHRASE` | Strong passphrase of at least 16 characters; 64 random hex characters recommended; identical in that target's plan/apply environments |

Use provider **read** permissions in plan environments and **edit/write** permissions in apply environments for D1, Workers R2 Storage, and Turnstile Sites. Backend S3 credentials need writes for locking and snapshots even during planning. No general DNS/WAF edit permissions are needed initially. Shared-bucket S3 credentials can access both environment prefixes; use separate state buckets/credentials if stronger environment isolation is required.

No secrets belong in Git, environment `.tfvars`, public artifacts, or chat. GitHub needs Environments write permission to configure these settings. Configure required branch checks for **Repository checks**, **OpenTofu checks (no credentials)**, and **Workflow lint**. Fork PR checks have no deployment credentials. Remove unused HCP tokens/variables if you created any previously.

## Plan and apply

[CI](../.github/workflows/ci.yml) checks PRs, PR titles and incoming commits, documentation, automation tests, OpenTofu, and workflow syntax. All commits and PR titles use Conventional Commits.

[OpenTofu infrastructure](../.github/workflows/opentofu.yml) is manual-only and runs live operations only from `main`. It first reruns credential-free CI.

1. Select **OpenTofu infrastructure → Run workflow**, choose `main`, `staging`, and `plan` initially.
2. The plan job uses `staging-plan` credentials, checks actual R2 locking, saves an immutable encrypted snapshot of existing state, and generates an encrypted saved plan.
3. The job summary shows the commit, plan checksum, and resource addresses/actions. No resource values, state, or binary plans are published as GitHub artifacts. The plan is uploaded privately under `plans/<environment>/<run>/<attempt>/<commit>/plan.tofuplan`.
4. For deeper review, download the encrypted plan through an authorized R2 client in a trusted private terminal, securely set `TOFU_ENCRYPTION_PASSPHRASE`, and run `python3 scripts/infra.py show --plan-file /absolute/path/plan.tofuplan`. This displays values: never run it in a public job. `tofu show` may require an initialized provider directory; run offline validation first if needed.
5. To provision, dispatch **plan-and-apply**. Review its **new** saved plan and checksum, then approve the waiting GitHub apply environment. A prior plan-only run does not approve this plan.
6. The apply job verifies the required-reviewer policy, commit/run/environment binding and SHA-256 checksum, checks locking, snapshots state, and applies **that exact saved plan**. It does not regenerate a plan. OpenTofu rejects a plan if the state has changed. Dispatch a new workflow when replanning is needed.
7. A post-apply snapshot runs on success or partial failure. Check job results before proceeding to production. If a snapshot fails after a successful apply, changes may already be live: inspect before retrying.

Workflow concurrency `deploy-<environment>` spans planning, approval and apply; it does not cancel an active apply. Backend locking protects against other writers, including local CLI operations. All future application deployments must share the release coordination policy. Review promptly: plans expire after two days, and a newer pending GitHub run can replace an older pending run.

Snapshots use immutable keys under `snapshots/<environment>/<run>/<attempt>/`. They are taken before plans, before applies, and after applies; a first deployment may have no pre-existing state. Live command output is suppressed because provider/backend errors and plan values may be sensitive. Diagnose failures in an authorized private terminal; do not enable `TF_LOG` or upload debug logs publicly. No automated destroy operation is provided. The isolated lock probe's local `terraform_data` apply/destroy does not create Cloudflare resources.

## Imports, recovery, and remaining work

Inventory existing resources before applying. D1, R2 buckets, and Turnstile widgets support import; several R2 settings resources in provider 5.28.1 do not. Review supported IDs and deliberately reconcile existing CORS/lifecycle/domain settings. `prevent_destroy` only protects a resource while its block remains in configuration. State snapshots do not back up D1 rows or photo bytes.

The switch from Terraform to OpenTofu occurred before provisioning, so no Terraform state migration was needed. Staging OpenTofu state is now live. Preserve its backend key and encryption material, and plan any future state/backend migration explicitly.

### Failed deployment inspection

Use the manual workflow's `inspect` operation with the target environment to read existing state without changing remote state or Cloudflare resources. Optionally provide `inspect_key`, either a saved-plan key from that environment or `diagnostics/<environment>/<run>/<attempt>/apply-failure.tfstate`. Public inspection output lists managed resource addresses, plan actions, and allowlisted error categories/HTTP/API codes; it never prints resource values or raw provider errors. This distinguishes a pre-apply failure from partial provisioning before generating a recovery plan.

New apply failures preserve raw command output as an encrypted native OpenTofu state object under the private `diagnostics/` prefix. A local built-in data resource performs only encryption; it provisions no Cloudflare resources. Diagnostic upload or post-failure snapshot errors must not hide the original apply error. Define an appropriate retention period for `diagnostics/` (for example 30 days), and protect it like state: raw errors can contain credentials. Older failures that predate this capture cannot be recovered from the ephemeral runner.

For full private review, download the diagnostic with an authorized R2 client and use `python3 scripts/infra.py show --json --plan-file /absolute/path/apply-failure.tfstate` with the secured encryption passphrase in your environment. This JSON includes sensitive values and must never be printed in public CI or chat. Fix the diagnosed cause, then create and review a new plan using the actual current state. Do not blindly rerun a saved plan after partial provisioning.

Worker/static-site scaffolding, Wrangler deployment, schema migrations, website DNS/routes, cache/WAF rules, image processing, application backups and quotas remain future work. Enabling public image access still requires a zone ID and the completed validation/moderation flow. Keep one owner per setting: OpenTofu owns Cloudflare infrastructure, Wrangler owns Worker code/assets/bindings, and migration tooling owns D1 schema.
