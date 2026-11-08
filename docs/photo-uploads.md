# Photo uploads and community operations

Google sign-in, component photo submissions, public galleries, owner removal, anonymous reports and a moderator console are implemented. Comments remain planned. The feature is **disabled until its deployment readiness checks pass**; drafting the policies or deploying this code does not verify a mailbox, configure Google or enable Cloudflare’s CSAM tool.

## The first release

- Google OpenID Connect uses the authorization-code flow, PKCE, one-time state, nonce and verified, signed ID tokens. Only `openid email` is requested. Google tokens and passwords are not stored. The public display name is chosen by the contributor and defaults to “Contributor”.
- Accounts use random, server-side sessions stored as hashes in D1. Cookies are host-only, Secure, HttpOnly and SameSite=Lax. Writes require the site’s Origin and a session-bound CSRF token. Moderator access requires both a moderator account role and its verified Google email in the current private allowlist; removing the allowlist entry revokes that privilege on subsequent requests.
- Sign-in requires an unchecked, actively accepted Terms/Community Guidelines checkbox and acknowledgement of the Privacy Policy. Each upload requires a separate unchecked rights/licence checkbox. The server checks the current policy version and records acceptance times in D1.
- Sign-in, upload and report forms load Turnstile asynchronously in explicit mode and wait for its documented `onload` callback before rendering a widget or enabling submission. Do not combine an async/defer script with `turnstile.ready()`, which Cloudflare rejects. Browser fixtures delay API readiness and reject that unsupported combination.
- The Worker accepts at most a 5 MiB JPEG, PNG or WebP file in a bounded multipart request. File extensions, browser MIME types and declared sizes are not trusted. Actual bytes, decoding and dimensions are checked; SVG, GIF, animated PNG/WebP and images above 20 megapixels are rejected.
- Cloudflare’s Images binding re-encodes to a still JPEG with a maximum 2,000-pixel edge. A second pass removes JPEG application/comment segments and trailing data, including EXIF/GPS, ICC, XMP and IPTC metadata. Output is capped at 3 MiB. Originals exist only in processing memory and are never written to R2.
- Only sanitised JPEGs enter private temporary storage. A moderator reviews each submission before publishing a separately keyed copy. Clients never receive upload credentials or private R2 keys. The previous signed-PUT proposal is superseded by this server-controlled flow.
- Public image delivery checks D1 approval state on every request, then fetches the image through the zone’s R2 custom-domain cache. This is where Cloudflare’s CSAM tool operates. Site responses are not cached, so changing the approval state immediately blocks site delivery; removal also deletes the public object and purges its CDN URL. Failed purges and abandoned publication copies have a persistent retry queue.
- Contributors can remove their own photos. Moderators can approve, reject, remove, preserve privately, resolve reports and disable accounts. A private evidence hold is copied into a separate bucket with no public domain or automatic expiry. This does not preserve the original upload, which was never retained.
- Hourly cleanup expires unpublished submissions after seven days, removes expired sign-in/session records and reconciles interrupted publication. Preserved evidence and incident records are not automatically expired; the operator must review and release them when their justification ends.

The source-code licence does **not** apply to user photos. The upload licence is limited to operating the service. See the website’s [Terms of Service](../apps/web/src/pages/policies/terms.astro), [Privacy Policy](../apps/web/src/pages/policies/privacy.astro), [Community Guidelines](../apps/web/src/pages/policies/community.astro) and [Copyright and Takedown Policy](../apps/web/src/pages/policies/copyright.astro). Material policy changes require a new `POLICY_VERSION` in [the shared constants](../packages/shared/community.ts).

## Finish the external setup

### Operator and a monitored contact address

1. Choose the person or business that operates the site. Do not substitute an invented legal identity.
2. Create an address such as `contact@velogroupsets.com`, with a mailbox or forwarding route to an inbox you actually monitor. Cloudflare Email Routing can forward to an existing inbox; it does not itself provide an inbox. Complete destination verification and test delivery from an unrelated account.
3. Use this contact for privacy/copyright/takedown requests and the Cloudflare CSAM notifications. Review the inbox and moderation queue daily. Reports submitted through the website enter the private moderation queue; the application does not send report notification emails.
4. Set the public operator/address and `CONTACT_READY=true` only after those checks. Policy pages otherwise display a draft notice and sign-in stays closed. The flag records the operator’s confirmation; code cannot prove that an inbox is being monitored.

The existing mail configuration is adopted through the infrastructure workflow, using the private `EMAIL_FORWARDING_DESTINATION` environment secret and sensitive OpenTofu variables. The forwarding address is not committed or published; it does remain in encrypted private state/plans. See [Email Routing ownership](../infra/README.md#email-routing-ownership). Infrastructure plans also inspect the CSAM API and print only enabled/verification status; they do not enable the application upload feature.

### Google sign-in

Create a Google OAuth **Web application** client and configure its consent screen. Use separate clients/secrets for staging and production where practical. Basic OpenID/email scopes do not require access to Google’s mail, files or contacts.

| Environment | Exact authorised redirect URI |
| --- | --- |
| Staging | `https://staging.velogroupsets.com/api/auth/google/callback` |
| Production | `https://velogroupsets.com/api/auth/google/callback` |

Configure the website’s real Terms and Privacy URLs on the consent screen. In Google’s testing mode, add the intended Google accounts as test users. Publish/configure the consent screen appropriately before opening public registration. The client secret belongs in GitHub/Worker secrets, never in a public environment variable, `.tfvars`, Git or chat.

### Turnstile and image processing

Use the provisioned environment-specific Turnstile widget. Its public site key comes from the encrypted infrastructure outputs; copy its secret into the GitHub environment’s `TURNSTILE_SECRET`. The backend verifies the expected hostname and one of the actions `sign-in`, `upload-photo` or `report-photo`. Tokens are not interchangeable between actions.

The Worker uses an `IMAGES` optimization binding and R2 storage, rather than paid Cloudflare Images hosted-image storage. Check that the account is on **Images Free**. Cloudflare documents 5,000 unique transformations per month for free; new transformations fail after that allowance on the Free plan. `.info()` calls are free. Do not enable a paid plan merely to get this feature working without reviewing the cost change.

### Enable Cloudflare’s CSAM Scanning Tool

In the Cloudflare dashboard, select the `velogroupsets.com` zone, then **Caching → Configuration → CSAM Scanning Tool → Configure**. Supply and verify the monitored contact email and review the service-specific terms. Confirm it is enabled for the zone serving `images.staging.velogroupsets.com` / `images.velogroupsets.com`, and then set `CSAM_SCANNING_CONFIRMED=true`.

The current rollout uses dashboard enrolment, including email verification and service terms. Cloudflare also documents a [CSAM configuration API](https://developers.cloudflare.com/api/resources/csam_scanner/methods/edit/) at `PATCH /zones/{zone_id}/settings/csam_scanner_third_party`. It can set the notification email, toggle scanning and request a verification email; changing the address triggers verification. A separate automation could use it, but this repository does not implement that automation. The pinned Cloudflare provider 5.28.1 has [no supported CSAM resource](https://developers.cloudflare.com/api/terraform/resources/csam_scanner/), so do not assume `cloudflare_zone_setting` supports the specialised endpoint or add an invented resource. The API does not let automation mark an email verified, and API success alone is not evidence of active scanning: confirm `enabled=true` and `email_state=valid`. This API configures zone-cache scanning; it does not scan private uploads. OpenTofu owns the R2 custom domain and TLS setting; the operator currently owns CSAM enrolment.

**Coverage matters:** the tool hashes images as they enter Cloudflare’s cache and compares against known CSAM lists. It is not an inline private-R2 upload scanner, a general image-safety classifier or a guarantee of a clean image. Cloudflare may notify the operator daily and may be unable to place a block. Human review, reports, monitored notices and removal remain necessary. Never use illegal material to test scanning.

### Deployment settings

Use the target GitHub environment (`staging` first). Existing infrastructure/backend/deployment credentials remain separate.

| GitHub environment variable | Value |
| --- | --- |
| `PUBLIC_SITE_OPERATOR` | Actual operator name, published in the policies |
| `PUBLIC_CONTACT_EMAIL` | Verified, monitored public contact address |
| `CONTACT_READY` | `true` after inbox verification; otherwise `false`/unset |
| `GOOGLE_CLIENT_ID` | OAuth client ID, not its secret |
| `CSAM_SCANNING_CONFIRMED` | `true` only after dashboard enrolment and email verification |
| `UPLOADS_ENABLED` | Keep `false`/unset until all setup and live acceptance checks are ready |

| GitHub environment secret | Purpose |
| --- | --- |
| `GOOGLE_CLIENT_SECRET` | Server-side Google code exchange |
| `TURNSTILE_SECRET` | Backend verification for the existing widget |
| `MODERATOR_EMAILS` | Comma-separated verified Google emails allowed to moderate; not published |
| `PHOTO_CACHE_PURGE_TOKEN` | Dedicated Cloudflare token with **Zone → Cache Purge → Purge**, scoped only to `velogroupsets.com` |

Do not place the broad deployment/provisioning token in the running Worker. The dedicated purge token can only purge this zone’s cached content. Secrets are sent to Wrangler over stdin with captured output, not stored in generated public files. `wrangler.generated.json` contains only allowlisted non-secret bindings/settings and is removed after deployment.

The approved-photo origin and Turnstile site key are derived from reviewed OpenTofu outputs, not from an arbitrary client URL. Application publication requires the `EVIDENCE` binding, the expected image hostname, legal contact confirmation, CSAM confirmation, image processing, moderator allowlist and the relevant secrets. An explicit `UPLOADS_ENABLED=true` deployment fails its activation checks if setup is incomplete.

## Infrastructure and rollout

OpenTofu adds `velogroupsets-<environment>-evidence` as private R2 storage with `prevent_destroy`, public `r2.dev` disabled and no automatic expiry. No custom domain is attached to evidence or temporary uploads. Staging configuration requests `images.staging.velogroupsets.com` for the approved-photo bucket with TLS 1.3. Production remains opt-in.

1. Validate the change and review an environment-specific OpenTofu plan. Apply that exact saved plan through the protected [infrastructure workflow](../.github/workflows/opentofu.yml). Inspect any unexpected change before approving. The application does not create or adopt resources outside this ownership boundary.
2. Complete the operator/mailbox, Google, Turnstile, purge token and CSAM setup above. Keep `UPLOADS_ENABLED=false` while working through setup.
3. Run the manual [website deployment](../.github/workflows/deploy-web.yml). It must pass reusable CI before environment approval. Deployment reads reviewed bindings, applies additive D1 migrations, configures the supplied Worker secrets and deploys code/assets. For a brand-new production Worker, perform the existing static Worker bootstrap before adding its secrets.
4. Sign in as a configured moderator. Confirm Terms acceptance is required, the chosen public alias is used and no Google email appears publicly.
5. Enable uploads deliberately, redeploy and submit your own harmless test photo. Check the actual Turnstile challenge, pending-only visibility, decoded/metadata-free result, moderator approval, published gallery, anonymous report, owner removal, and a report removal while the CDN copy is cached. Verify the CSAM enrolment in the dashboard; an ordinary test photo cannot prove a known-hash match.
6. Verify `GET /api/community/config` reports the intended availability. Do not mark external-provider tests complete merely because mocked tests pass.

The deployment defaults to **Drew Freyling** as operator and **contact@velogroupsets.com** as the public contact. The corresponding variables can override these public defaults. Keep the private forwarding destination out of Git and public logs; any future OpenTofu adoption must supply it through a sensitive deployment variable, with its state protected by the existing encryption. These defaults do not set `CONTACT_READY`; verify delivery and monitoring before confirming it.

### Local checks

`npm run worker:dev` applies local D1 migrations before starting Wrangler. Local configuration uses separate local D1/R2 resources and keeps community launch disabled. Use `.dev.vars` for local credentials if needed; never commit it. Local synthetic tests do not need Google/Cloudflare credentials or real user photos.

Run:

```sh
npm run build
npm test
npm run worker:check
npm run test:browser
python3 -m unittest discover -s scripts/tests
python3 scripts/check_docs.py
python3 scripts/infra.py validate
```

Node integration tests use real local D1, R2 and Images bindings (Sharp-based offline image processing), with synthetic image metadata. Google tokens are cryptographically signed/verified with local test keys. Google exchange, Turnstile verification, the public image CDN and cache purge responses are mocked. Playwright covers the browser forms, fresh checkboxes, upload reset behaviour, gallery text escaping, anonymous reports, moderator actions and disabled setup, using explicit API/provider fixtures. The low-fidelity local Images binding does not prove all production transformation options or provider billing behaviour; live checks remain part of activation.

## Limits and cost controls

- Per upload: 5 MiB input, 20 megapixels, at most 2,000 pixels per output edge and 3 MiB sanitised output. Request-body reads expire after 60 seconds; at most two uploads are processed concurrently in each Worker isolate to bound memory use.
- Per account: 10 attempts per UTC day. Invalid attempts after validation/Turnstile also consume the allowance.
- Per site: 100 attempts per UTC day and 1,000 active/preserved photo records. Limits are reserved with atomic SQLite writes. The storage ceiling is checked before image transformation, not after a billable operation.
- At most 3,100 upload transformations in a 31-day month under these site limits, within the documented 5,000 Images Free allowance if this account has no other transformation usage. The app does not change the account’s billing plan.
- The main active photo allowance is at most about 3 GiB at the output cap. Transient copies, failed writes, evidence holds, infrastructure state and unrelated account usage still share R2 allowances. Review actual account usage and retained cases; do not equate application limits with a provider-wide spending cap.
- Public list queries, report counts, queues and cleanup batches are bounded and indexed. API/session/private images use `no-store`; the static catalogue retains its existing cache policy.

## Routes and data

| Route | Access and purpose |
| --- | --- |
| `GET /api/community/config` | Public availability, limits, public policy/widget details |
| `GET /api/session` | Current user summary and CSRF token; no-store |
| `POST /api/auth/google/start` | Current active acceptance, Turnstile, PKCE/state setup |
| `GET /api/auth/google/callback` | Verified Google exchange, consent record and session |
| `POST /api/auth/logout` | Authenticated, CSRF-protected session revocation |
| `POST /api/uploads` | Authenticated, current licence, Turnstile and quotas |
| `GET /api/account/photos` | Owner’s most recent 50 submissions; private internal review notes are excluded |
| `GET /api/components/:id/photos` | Up to 24 approved public records, with cursor pagination |
| `GET/HEAD /api/photos/:id/file` | Approved-only, state-checked image proxy through the scanned CDN |
| `GET/HEAD /api/photos/:id/preview` | Owner/moderator-only sanitised pending preview |
| `DELETE /api/photos/:id` | Owner removal; preserves any justified private evidence hold |
| `POST /api/photos/:id/reports` | Anonymous Turnstile-protected private report |
| `GET /api/moderation` | Moderator-only oldest pending/blocked photos and unresolved reports |
| `POST /api/moderation/photos/:id/approve` | Moderated publication and cache priming; no claim of a scanner clean verdict |
| `POST /api/moderation/photos/:id/reject` | Private submission rejection |
| `POST /api/moderation/photos/:id/remove` | Immediate hiding, public-object deletion and cache purge |
| `POST /api/moderation/photos/:id/hold` | Preserve privately, hide and remove public copies |
| `POST /api/moderation/reports/:id/resolve` | Private case resolution |
| `POST /api/moderation/users/:id/disable` | Disable an account and revoke sessions; approved photos are handled separately |

All writes use parameterised SQL. Component IDs are checked against a generated allowlist shipped with the Worker; historical aliases resolve to the canonical component. Private/provider identifiers, cookies, original filenames, image bytes and report details are not logged or committed. The generated allowlist contains only curated public catalogue identifiers/URLs and is rebuilt before the app/Worker build.

## Incident, takedown and privacy procedure

1. Review the monitored inbox, Cloudflare notices and private moderation queue daily. Identify the exact photo ID/URL. A Cloudflare notice may identify its R2 custom-domain path; match `public_key` in D1 privately. Do not put reports, emails, evidence or database exports into GitHub issues, source files, CI artifacts or public logs.
2. Hide harmful or disputed content promptly. If preservation is justified or legally required, use **Preserve privately and hide** before permanent deletion. This copies the sanitised image into the private evidence bucket, records the action and removes public copies. Suspected blocked material has no ordinary preview in the console. Do not unnecessarily view, download, attach or redistribute suspected CSAM.
3. Follow the applicable reporting/preservation obligations and instructions from the appropriate authority. Relevant portals include [Australia’s ACCCE](https://www.accce.gov.au/report) and [NCMEC’s CyberTipline](https://report.cybertip.org/). Cloudflare’s notification is not a substitute for the operator’s obligations. Document the case reference, lawful justification and next review date privately.
4. The site image endpoint denies removed/blocked photos even while a cache-purge retry is pending. Retry a failed removal or let the scheduled cleanup retry. Check the exact CDN URL is no longer served, and review Cloudflare’s notice where it says a block could not be placed. No public bucket/domain or image endpoint exposes evidence storage.
5. For copyright/privacy requests, verify identity or authority proportionately, acknowledge the request and record the decision. Share only necessary claim information with the uploader. Use owner removal or moderator removal; do not disclose reporter contacts in public replies or owner-facing review messages.
6. Disable an abusive account through the moderator console when justified; this revokes its sessions. Removing a moderator email from `MODERATOR_EMAILS` removes moderator access on subsequent requests. Handle any existing public photos separately.
7. Review evidence holds and restricted records regularly. When retention is no longer justified, an authorised operator must remove the specific held object and update the case/retention record privately. There is no automatic “delete all evidence” job. For account deletion, remove/restrict photos and sessions as appropriate, and delete or anonymise identifiers except where a documented legal basis requires retention.

References: [Cloudflare CSAM Scanning Tool](https://developers.cloudflare.com/cache/reference/csam-scanning/), [Images binding](https://developers.cloudflare.com/images/optimization/binding/), [Images pricing](https://developers.cloudflare.com/images/pricing/), [Turnstile validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/), and [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect).
