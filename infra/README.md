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

This provisions the data/storage/abuse-prevention foundation. The Worker/static catalogue and a manual Wrangler deployment workflow are now implemented. The staging Worker `velogroupsets-staging` and 13 static assets were [deployed successfully](https://github.com/drewfreyling/velogroupsets/actions/runs/42338589328), with existing D1/R2 bindings and version `cc33e3e1-2028-4223-8f4f-6b9dec1f88d4`. Both workers.dev and preview URLs are disabled. The [reviewed domain/TLS/HSTS apply](https://github.com/drewfreyling/velogroupsets/actions/runs/42339179675) succeeded; [staging.velogroupsets.com](https://staging.velogroupsets.com/) is publicly reachable. HTTPS, HTTP redirects and the HSTS header were verified on static pages and API responses.

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

The backend enables `use_lockfile = true` and the R2-specific S3 compatibility flags. Before **every live plan and apply**, the script initializes a unique `lock-checks/<random>/terraform.tfstate` key, holds a lock using the built-in `terraform_data` resource, verifies that another OpenTofu process fails with a lock error, releases it, verifies a subsequent operation succeeds, and cleans up that disposable state. This checks actual pinned CLI/backend behavior, not just raw S3 conditional writes. A local probe cannot establish R2 compatibility: the successful live plan/apply runs have now passed this R2 locking probe.

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

Use provider **read** permissions in plan environments and **edit/write** permissions in apply environments for D1, Workers R2 Storage, and Turnstile Sites. Backend S3 credentials need writes for locking and snapshots even during planning. For website deployment and custom-domain activation, add the permissions described below. CAA records additionally require zone-scoped DNS Read in the plan environment and DNS Edit in the apply environment; zone TLS/HSTS settings use Zone Settings permissions. WAF permissions are not used by the current resources. Shared-bucket S3 credentials can access both environment prefixes; use separate state buckets/credentials if stronger environment isolation is required.

No secrets belong in Git, environment `.tfvars`, public artifacts, or chat. GitHub needs Environments write permission to configure these settings. Configure required branch checks for **Repository checks**, **OpenTofu checks (no credentials)**, **Workflow lint**, and **Application build and tests**. Fork PR checks have no deployment credentials. Remove unused HCP tokens/variables if you created any previously.

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

Workflow concurrency `deploy-<environment>` spans planning, approval and apply; it does not cancel an active apply. Backend locking protects against other writers, including local CLI operations. The website deployment workflow uses this same release lock. Review promptly: plans expire after two days, and a newer pending GitHub run can replace an older pending run.

Snapshots use immutable keys under `snapshots/<environment>/<run>/<attempt>/`. They are taken before plans, before applies, and after applies; a first deployment may have no pre-existing state. Live command output is suppressed because provider/backend errors and plan values may be sensitive. Diagnose failures in an authorized private terminal; do not enable `TF_LOG` or upload debug logs publicly. No automated destroy operation is provided. The isolated lock probe's local `terraform_data` apply/destroy does not create Cloudflare resources.

## Imports, recovery, and remaining work

Inventory existing resources before applying. D1, R2 buckets, and Turnstile widgets support import; several R2 settings resources in provider 5.28.1 do not. Review supported IDs and deliberately reconcile existing CORS/lifecycle/domain settings. `prevent_destroy` only protects a resource while its block remains in configuration. State snapshots do not back up D1 rows or photo bytes.

The switch from Terraform to OpenTofu occurred before provisioning, so no Terraform state migration was needed. Staging OpenTofu state is now live. Preserve its backend key and encryption material, and plan any future state/backend migration explicitly.

### Failed deployment inspection

Use the manual workflow's `inspect` operation with the target environment to read existing state without changing remote state or Cloudflare resources. Optionally provide `inspect_key`, either a saved-plan key from that environment or `diagnostics/<environment>/<run>/<attempt>/apply-failure.tfstate`. Public inspection output lists managed resource addresses, plan actions, and allowlisted error categories/HTTP/API codes; it never prints resource values or raw provider errors. This distinguishes a pre-apply failure from partial provisioning before generating a recovery plan.

New apply failures preserve raw command output as an encrypted native OpenTofu state object under the private `diagnostics/` prefix. A local built-in data resource performs only encryption; it provisions no Cloudflare resources. Diagnostic upload or post-failure snapshot errors must not hide the original apply error. Define an appropriate retention period for `diagnostics/` (for example 30 days), and protect it like state: raw errors can contain credentials. Older failures that predate this capture cannot be recovered from the ephemeral runner.

For full private review, download the diagnostic with an authorized R2 client and use `python3 scripts/infra.py show --json --plan-file /absolute/path/apply-failure.tfstate` with the secured encryption passphrase in your environment. This JSON includes sensitive values and must never be printed in public CI or chat. Fix the diagnosed cause, then create and review a new plan using the actual current state. Do not blindly rerun a saved plan after partial provisioning.

Schema migrations, cache/WAF rules, image processing, application backups and quotas remain future work. Worker/static-site deployment and an opt-in OpenTofu website custom domain are implemented; staging activation is live. Enabling public image access still requires a zone ID and the completed validation/moderation flow. Keep one owner per setting: OpenTofu owns Cloudflare infrastructure, Wrangler owns Worker code/assets/bindings, and migration tooling owns D1 schema.

## Website deployment

The [Deploy website workflow](../.github/workflows/deploy-web.yml) is manual, `main`-only and protected by the target GitHub environment. Its `checks` job calls the reusable CI workflow for the selected commit. A read-only `preflight` job uses the target's `-plan` environment to check encrypted state and bindings. The deploy job has `needs: [checks, preflight]` and explicitly requires both results to be `success`: all CI jobs, including the application build and tests, must pass before deployment can reach environment approval. Failed, cancelled or skipped checks do not permit deployment.

The application CI job includes the full [Playwright functionality suite](../README.md#browser-functionality-checks) in desktop and mobile Chromium configurations. Browser failures block this same gate; the tests are not an optional deployment-only step. Failure artifacts contain only the browser report, screenshots and traces from the local test server, with seven-day retention. State, plans and deployment credentials are not part of those artifacts.

After approval, it builds Astro/Tailwind for the target hostname, reads the encrypted R2 state privately with OpenTofu, exports only expected database/bucket bindings, and deploys code/static assets with pinned Wrangler. It never creates new D1/R2 resources, publishes state/plan artifacts, or changes infrastructure state. The generated binding file is deleted after each job and ignored by Git. Output extraction decrypts a downloaded snapshot in an empty local directory using `tofu output`; it requires neither provider downloads nor backend initialization. Both jobs install OpenTofu using a pinned release ZIP checksum and fail closed if verification fails. Errors identify the failing stage and an allowlisted reason without logging state or raw provider messages. Preflight does not read the protected deployment environment’s public readiness settings; those are validated again after approval.

Extend `CLOUDFLARE_API_TOKEN` permissions while retaining existing D1/R2/Turnstile permissions:

| Environment | Account permissions | Zone permissions for **velogroupsets.com only** |
| --- | --- | --- |
| `staging-plan` | Workers Scripts: Read | Workers Routes: Read; Zone: Read; Zone Settings: Read; DNS: Read |
| `staging` | Workers product: **Admin for the initial Worker creation**, then product-level Editor for releases/domain management; retain existing D1/R2/Turnstile permissions | Workers Routes: Edit; Zone: Read; Zone Settings: Edit; DNS: Edit |

Scope account permissions to `5ccb67114ff0fa1a13cb46ef3d08cb49`. Cloudflare's current granular authorization distinguishes **Admin** (can create/delete Workers) from **Editor** (can deploy existing Workers). Initial creation requires **Workers product-level Admin** on this account; Editor is insufficient for bootstrap. After creation, reduce to Workers product-level Editor while this shared token also manages custom domains. Custom Domains currently do not support per-Worker roles. A separate code-only deployment token can later use per-Worker Editor. For granular roles, use an account-owned API token; do not grant broad Developer Platform administration. See [Cloudflare's Workers permissions](https://developers.cloudflare.com/workers/authorization/workers/). Keep raw tokens only in the GitHub environment secrets. Existing R2 state credentials/encryption passphrases are reused without changing their values.

Bootstrap in this order:

1. Run **Deploy website** on `main` for `staging`; approve the GitHub `staging` deployment after CI. This creates `velogroupsets-staging` with static assets, `/api/health`, and existing D1/R2 bindings. Both `workers.dev` and preview URLs stay disabled. No hostname is reachable yet.
2. The existing staging `zone_id = "7f6cc6f517450ef96d9f8b2bd891ee80"` is already configured; it is a public identifier. Production retains `site_zone_name = "velogroupsets.com"` as an alternative lookup. Staging now has `enable_site_domain = true` in `opentofu/environments/staging.tfvars` after the successful Worker bootstrap; leave this disabled for an unbootstrapped environment. Commit conventionally. Do not add routes to Wrangler or manually create a conflicting DNS record.
3. Run the infrastructure **plan-and-apply** workflow. Review the `cloudflare_workers_custom_domain.site[0]` create plus adoption/updates of shared zone HTTPS/TLS/HSTS settings, then approve the exact saved plan. Cloudflare manages the domain's DNS and TLS certificate automatically; activation may take time. This does not expose either photo bucket.
4. Verify `https://staging.velogroupsets.com/`, a component detail page, `/api/health`, and an unknown path returning HTTP 404. The health response identifies the deployed commit. Confirm search/filter behavior and static asset headers. Staging pages include `noindex`.

Subsequent website releases only need the website workflow. Infrastructure changes continue through separate saved-plan approval. The same instructions apply to production only after its foundation, secrets and reviewer policy are provisioned. Authentication, uploads, comments and database tables are not included in this scaffold. Roll back application code by reverting to a known good commit on `main` and deploying; this does not roll back infrastructure or future database migrations.

### Worker authorization failures

The initial website run reached Wrangler but failed before asset upload while listing existing Worker secret **names** at `/accounts/<account>/workers/scripts/velogroupsets-staging/secrets`, with “No access to the specified resource.” This endpoint is part of Wrangler’s normal check for binding/secret-name conflicts; it does not retrieve secret values or require a separate Secrets Store permission.

Check the token stored specifically in the GitHub `staging` environment. It must target the account above and have Workers product-level Admin for first creation, plus the existing infrastructure/zone permissions. Read/edit access scoped only to a zone or to selected existing Workers cannot create the missing Worker. Correct access before rerunning; do not bypass Wrangler’s secret-conflict check. Once bootstrap succeeds, reduce Workers access to Editor and verify subsequent deployment/domain operations.

## Shared HTTPS and TLS policy

Staging configuration enables `manage_zone_tls = true` and `minimum_tls_version = "1.3"`, following the chosen free-plan policy. The successful reviewed infrastructure apply enforces:

- TLS 1.3 only for visitor connections; TLS 1.2 and older clients are intentionally rejected.
- TLS 1.3 enabled, HTTP redirected to HTTPS, and Full (strict) origin TLS. A Worker custom domain has no separate application origin server; strict mode also protects any other proxied origins in this zone.
- HSTS with `max-age=31536000` (one year), `include_subdomains = true`, `preload = true`, plus nosniff. Cloudflare injects this at the edge for proxied hostnames, including static and API responses; application code does not independently own the header. Only HTTPS responses establish browser HSTS policy.

These are **zone-wide settings**, shared by staging and any future production hostname. The staging state is their sole initial owner. `manage_zone_tls` defaults off and is prohibited in production state to prevent two states managing the same zone policy. A later move to a dedicated shared-zone root must migrate state ownership deliberately, not recreate these resources. DNS-only hosts do not receive Cloudflare edge headers, but browsers that learn the apex HSTS policy will also require HTTPS for its subdomains through `includeSubDomains`; every present and future web hostname must support HTTPS.

Existing zone settings are adopted with declarative import blocks before changes; the saved plan contains both imports and updates, and public review summaries include import-only actions without printing import IDs/values. Live plans keep `import_zone_settings = true`. Mocked tests disable imports because OpenTofu 1.13.9's mock provider cannot import; the live plan checks real permissions and existing settings.

Cloudflare [requires Advanced Certificate Manager for custom cipher allowlists](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/cipher-suites/customize-cipher-suites/). No paid subscription or custom cipher setting is provisioned. The selected TLS 1.3-only policy limits negotiation to TLS 1.3's authenticated-encryption suites while Cloudflare manages the exact list. This is stronger than allowing TLS 1.2 with the uncustomized free-plan cipher list. Do not describe this as a manually configured cipher allowlist.

After apply, verify HTTPS reachability, HTTP redirects and the HSTS header on both `/` and `/api/health`. Confirm the configured TLS minimum through Cloudflare's API and direct TLS probes from a host without TLS interception; a proxy that terminates TLS can hide the edge's actual protocol/cipher behavior. Keep HTTPS available for the browser's cached HSTS lifetime when changing or rolling back infrastructure. Subdomain-wide HSTS and the preload directive were explicitly selected for this new domain. The directive does not submit the domain to browser preload lists. Actual preload-list submission remains pending until the apex site is reachable over HTTPS and satisfies the preload service requirements.

### Public staging smoke checks

The manual [Verify staging HTTPS workflow](../.github/workflows/verify-staging.yml) is read-only and needs no deployment credentials or environment approval. It checks HTTPS page/API status codes, real 404 responses, one-year HSTS with `includeSubDomains`/`preload`, and HTTP redirects. Direct probes from the GitHub runner validate the certificate, negotiate TLS 1.3 and require a protocol-version alert for TLS 1.2. The script refuses TLS probing when proxy variables are configured, because intercepted TLS would not establish the edge's behavior. Run this after domain/TLS changes; it is separate from offline PR checks and does not mutate Cloudflare.

## DNS CAA policy

[zone_dns.tf](opentofu/zone_dns.tf) defines four apex `CAA` records for `velogroupsets.com`, enabled by `manage_zone_caa` in staging configuration. Like TLS/HSTS, these zone-wide records have one owner: **staging state**, covering the apex and inherited subdomains, including future production. Production must leave the option disabled; migrate state deliberately before moving ownership to a shared-zone root. CAA requires both `zone_id` and the apex `site_zone_name`.

Each record uses flags `0`, tag `issue`, and a one-hour TTL. The permitted issuers are `letsencrypt.org`, `pki.goog; cansignhttpexchanges=yes`, `ssl.com`, and `sectigo.com`. These are [Cloudflare's documented certificate authorities](https://developers.cloudflare.com/ssl/reference/certificate-authorities/), including its backup provider. With no `issuewild` override, the same issuers are authorized for wildcard certificates, which Cloudflare Universal SSL uses. Do not add a wildcard denial that would prevent renewal. No reporting email address is invented.

Cloudflare may also synthesize CAA answers to preserve Universal SSL issuance. Such records can appear in DNS without appearing in the dashboard/API and are not imported as independent resources. The effective DNS answer can therefore include additional Cloudflare-managed issuers; this configuration does not pin the certificate Cloudflare will choose. Review the [CAA behavior documentation](https://developers.cloudflare.com/ssl/edge-certificates/caa-records/) when changing the list.

Before the first apply, add **Zone → DNS → Read** to the `staging-plan` Cloudflare token and **Zone → DNS → Edit** to the `staging` token, scoped only to `velogroupsets.com`. Retain existing permissions and store raw tokens only in GitHub secrets. Public DNS was checked and the existing encrypted state inspected before adoption; neither had managed CAA entries. If records have since been added manually, inspect/import their API IDs rather than creating duplicates. Review the saved plan: the expected change is four CAA creates, with no changes to the Worker custom domain or TLS policy. Apply still requires the existing GitHub environment approval.

Verify the effective policy after approval using `dig velogroupsets.com CAA +short` and check HTTPS certificate renewal status in Cloudflare. CAA controls certificate issuance, not browser certificate validation or HTTP security headers. The website's generated sitemap and robots policy are described in the [local development guide](../README.md#local-development).


## Community photo infrastructure and activation

The photo implementation adds a third application bucket, `velogroupsets-<environment>-evidence`, private with public access disabled and no expiry rule. It is separate from temporary sanitised submissions, approved/public photos and encrypted infrastructure state. Staging inputs now request the approved-photo custom domain `images.staging.velogroupsets.com` with TLS 1.3; these additions require a reviewed plan/apply before they are live. Production remains opt-in.

Wrangler owns the Images optimization binding and application code. The deployment workflow applies additive D1 migrations before releasing the Worker, and reads only allowlisted non-secret output values for storage, the Turnstile site key and approved-photo origin. The configuration generator accepts the previous two-bucket state during a disabled rollout, but photo activation requires the new evidence binding. Runtime Google/Turnstile/moderator/purge credentials are separate Worker secrets supplied through GitHub, never OpenTofu outputs or public files.

CSAM enrolment is currently operator-owned through the dashboard, with a verified monitored email and service-specific terms acceptance. Cloudflare now documents a [CSAM configuration API](https://developers.cloudflare.com/api/resources/csam_scanner/methods/edit/), but the pinned provider 5.28.1 has [no supported CSAM resource](https://developers.cloudflare.com/api/terraform/resources/csam_scanner/). A separate API integration is possible; it is not implemented here. Do not assume the generic zone-setting resource supports this specialised endpoint, or conflate a successful configuration request with verified, active scanning. `CSAM_SCANNING_CONFIRMED` records completion and does not enable the tool itself. Refer to [photo setup and operations](../docs/photo-uploads.md) for exact Google redirect URLs, credential names, zone-scoped cache-purge permission, contact verification, readiness gates, limits and incident handling.


## Email Routing ownership

Cloudflare Email Routing for `contact@velogroupsets.com` was configured in the dashboard by the operator. Public DNS confirms the Cloudflare MX records and `v=spf1 include:_spf.mx.cloudflare.net ~all`. The import configuration in [email.tf](opentofu/email.tf) adopts this existing setup when its first reviewed plan is applied. Mailbox setup does not establish CSAM enrolment.

Adoption stays in this repository and uses the same single staging-state owner as the shared apex CAA/TLS settings; production must not declare the same zone-wide resources. `manage_zone_email=true` is enabled only in staging. Existing resources are imported before applying anything:

- Use [`cloudflare_email_routing_dns`](https://registry.terraform.io/providers/cloudflare/cloudflare/5.28.1/docs/resources/email_routing_dns) to manage Cloudflare's Email Routing DNS setup. Do not also declare its MX/SPF records as separate `cloudflare_dns_record` resources or recreate them with different priorities.
- The existing zone ID selects the mail domain. Omit the DNS resource's optional `name`: provider 5.28.1 marks it `no_refresh`, so its import cannot recover that creation parameter; setting it would propose an unnecessary update. The adoption guard caught this in the first live plan, before anything was applied.
- Import the existing contact forwarding rule as [`cloudflare_email_routing_rule`](https://registry.terraform.io/providers/cloudflare/cloudflare/5.28.1/docs/resources/email_routing_rule). Keep the destination in a GitHub environment secret, pass it as a sensitive OpenTofu variable and retain it only in encrypted state, never in committed `.tfvars`, public outputs or logs. Destination verification remains an operator step.
- Adopt other manually created mail records only after establishing that Email Routing does not own them. Do not introduce a second owner for provider-managed DNS records.

Set `EMAIL_FORWARDING_DESTINATION` as a secret in **both** `staging-plan` and `staging`, with the existing verified destination. Do not put its value in repository/environment variables, chat or committed `.tfvars`. The runner passes it as sensitive `TF_VAR_email_forwarding_destination`. OpenTofu necessarily retains it in the private encrypted saved plan and state; anyone who can decrypt that state can read it. Never add a non-sensitive output for it.

[The private discovery helper](../scripts/cloudflare_services.py) reads existing Email Routing rules and locates exactly one enabled, literal contact rule whose sole action forwards to that secret. It preserves its name and priority, refuses duplicate/mismatched/Worker-owned rules, and never prints addresses, provider bodies or IDs. Opaque import metadata is passed in memory through a separate sensitive variable. The runner only saves a mail plan when both resources are imports/no-ops or existing no-ops: it refuses creates, updates, replacements and deletions. A future intentional mail change needs a deliberate revision of this adoption guard. Both resources have `prevent_destroy`.

The helper also reads CSAM's documented settings API and logs only finite `enabled` and `email_state` values. It does not configure scanning, change the notification address or mark an email verified. Actual scanning matches and provider notification delivery remain outside these synthetic checks. `CSAM_SCANNING_CONFIRMED` is still a separate application readiness setting.

Use **Zone → Email Routing Rules → Read** in `staging-plan` and **Edit** in `staging`, scoped only to `velogroupsets.com`, alongside the existing zone DNS and Zone Settings permissions. Confirm any rejected API operation before widening permissions further. Read/write Email Routing Rules permissions are separate from DNS permissions. Do not remove managed MX/SPF records manually or independently adopt them as DNS-record resources while Email Routing owns them.

## Google Search Console verification ownership

The existing apex `google-site-verification` TXT record belongs only to staging state, alongside shared CAA, TLS/HSTS and mail configuration. Production leaves `google_site_verification_content` null. The public TXT proof is stored in [staging inputs](opentofu/environments/staging.tfvars); it is publicly readable DNS data, not a Google account credential or API token.

During planning, the runner uses the existing zone-scoped **DNS Read** permission to discover exactly one existing apex TXT record matching that value. It accepts the exact proof either unquoted or enclosed in Cloudflare’s TXT wrapping quotes, then preserves the original API content representation, record ID, TTL (including automatic TTL), comment and tags in plan inputs. Missing, mismatched or duplicate records fail closed. The import block adopts that ID; it does not create another verification record. `prevent_destroy` protects the resource, and a plan guard accepts only import/no-op for this record. Updating/removing the proof later requires a deliberate change to that guard. Apply uses the same encrypted saved plan and the existing GitHub approval gate; no new secret or permission is needed.

The configuration and adoption guard are implemented; adoption is complete only after a reviewed live import plan succeeds. Keep the TXT record after Google verifies ownership so Search Console can continue checking it. DNS ownership verification does not clear a Google Safe Browsing warning or guarantee that Google considers the site safe.

For the reported warning at `/api/auth/google/callback`, Search Console was still processing its initial data on 8 November 2026. Check **Security & Manual Actions → Security Issues** when available. Investigate any issue and example paths before requesting review; do not include live OAuth codes, state values, session cookies or private user information in public reports. The public Safe Browsing lookup returned no available data during investigation, which is not a clean verdict. If no issue is listed but the warning persists, use [Google's incorrect-warning report](https://safebrowsing.google.com/safebrowsing/report_error/) after checking the affected flow. A report/review is separate from DNS import.
