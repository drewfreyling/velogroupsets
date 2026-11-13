# Production catalogue launch

Production is live at [velogroupsets.com](https://velogroupsets.com/) as a read-only catalogue since 13 November 2026. The protected website deployment and reviewed infrastructure apply completed successfully, and live desktop/mobile browser checks passed. Staging remains a separate environment.

## Deployment and verification record

- [Website deployment](https://github.com/drewfreyling/velogroupsets/actions/runs/43190107607) published application commit `811ad34c6ec4746a6390622e6223f17c45c2a1b9` to `velogroupsets-production`, with 2,033 static assets and community features disabled.
- [Infrastructure attempt 3](https://github.com/drewfreyling/velogroupsets/actions/runs/43419940563/attempts/3), at infrastructure commit `375d7e1c13125aefa8e7f3c14a87b358a05cb77c`, applied the exact encrypted saved plan: 12 creates, no updates/deletions. Both production plan and apply passed actual R2 lock contention/release checks. State stays under the separate production key; shared zone settings remain in staging state.
- The apex resolves publicly, HTTP redirects to HTTPS, and the live HSTS header is `max-age=31536000; includeSubDomains; preload`. Static catalogue/API responses use five-minute browser caching; the favicon uses one day. Public mail MX records were preserved, and `images.velogroupsets.com` has no public DNS record.
- [Live browser verification](https://github.com/drewfreyling/velogroupsets/actions/runs/43422610038) passed all eight desktop/mobile checks against the deployed hostname with normal certificate validation. These cover browsing/search/themes without gallery requests, community page redirects, disabled account/upload/image APIs, static data access, canonicals, robots/sitemap, policies and 404s.
- Future verification uses the manual [Verify live production workflow](../.github/workflows/smoke-production.yml). It does not deploy code or require deployment credentials.

These checks establish deployment and application behaviour, not a Google Safe Browsing verdict. The operator still needs to check Search Console for the previously reported Chrome warning. The HSTS `preload` directive is enabled; this record does not claim enrolment in browsers' preload lists.

## Launch behaviour

- Catalogue pages, search, themes, citations and `/api/v1/*.json` remain available. Successful static catalogue/API requests bypass Worker execution.
- Production builds omit Account navigation and component photo galleries. Account, upload, report and moderation pages redirect to the catalogue. Policies explain that community features are disabled.
- Production Worker configuration forces `COMMUNITY_ENABLED=false` and `UPLOADS_ENABLED=false`, regardless of supplied upload settings. It has no D1, R2 or Images bindings, no community secrets and no cron triggers. The runtime also denies community requests before accessing bindings and skips scheduled cleanup.
- `/api/community/config` reports community, sign-in and uploads unavailable. Other community endpoints, including the Google callback and image delivery, return uncached 404 responses. `/api/health` still identifies the deployed commit.
- The production sitemap and canonicals use the apex hostname; production robots permits indexing. Staging remains unindexed. Private community entry pages are excluded from the sitemap.
- The [production v1 API contract](api.md#production-v1-compatibility) is preserved. Breaking contract changes need a new major namespace.

Changing only a GitHub upload variable cannot enable production community features. A future activation must deliberately update the build/deployment configuration, attach the appropriate isolated bindings, configure secrets, verify all readiness conditions and run the live checks in the [photo operations guide](photo-uploads.md). This launch does not establish that production OAuth or image transformations work.

## Required setup

Create `production-plan` and `production` GitHub environments, restricted to `main`. Production requires a reviewer; the application preflight and infrastructure apply refuse an absent reviewer policy. Store the four infrastructure secrets from the [infrastructure guide](../infra/README.md#encryption-and-credentials) in both environments. The plan token is read-only; the production token needs Workers product-level Admin for initial Worker creation and the documented resource/domain edit permissions. Keep account permissions scoped to the project account and zone permissions scoped to `velogroupsets.com`.

The catalogue-only website bootstrap uses only the production Cloudflare deployment token after the reviewer check. It does not require existing production state or copy staging bindings. The subsequent infrastructure operation uses the private state bucket, encryption, locking and reviewed saved-plan controls. Google, Turnstile secrets, moderator identities and photo purge credentials are not required for this launch.

The public operator is Drew Freyling and the monitored contact is `contact@velogroupsets.com`, previously confirmed by the operator. Deployment publishes these policy details. The personal forwarding destination remains private in the existing staging-owned Email Routing configuration.

## Rollout

1. Push the launch change and require successful CI. CI runs the regular credential-free checks and desktop/mobile functionality suite, then rebuilds for the production origin and runs the separate catalogue-only browser suite.
2. Run **Deploy website** on `main`, targeting `production`. Review and approve the exact commit in GitHub. This bootstraps `velogroupsets-production` without a public hostname; workers.dev and preview URLs stay disabled. No D1 migrations or community-secret setup runs.
3. Run **OpenTofu infrastructure → plan-and-apply → production** for that commit. Inspect the saved plan before approving: it should create the production foundation and the apex Worker custom domain, without changing staging or shared zone resources. The root still declares dormant, isolated production D1/R2/Turnstile resources for later community use; the catalogue-only Worker does not bind or use them. Approved-photo public access remains off. Empty foundation resources do not imply a guarantee about account-wide free-tier usage.
4. Verify DNS, certificate activation and HTTP→HTTPS redirect; `/api/health` must identify the intended commit and `production`. Confirm TLS 1.3 and the existing one-year HSTS policy with subdomains/preload. OpenTofu's shared CAA, TLS, Google verification and mail resources retain their existing staging-state owner.
5. Open the production site in Chrome, check the exact apex and representative pages for browser warnings, and check Search Console Security Issues. The previously reported staging OAuth warning is not proof that the new production hostname is clear. OAuth is disabled, but production still needs its own check.
6. Check catalogue search/navigation, dark mode, static API data/ETag/CORS/cache headers, robots/sitemap, real 404 status, disabled community endpoints and the absence of gallery requests. Confirm public photo storage is not exposed. Review account usage after traffic starts.

## Remaining decisions and follow-up

- The canonical launch hostname is the apex. `www.velogroupsets.com` is not configured; add an OpenTofu-owned redirect if that alias is wanted, without replacing the mail or verification records.
- Submit the production sitemap in Search Console after the site is verified. Sitemap submission and Google's security review require the operator's Google access; DNS verification alone does not establish a security verdict.
- Catalogue coverage and weights remain incomplete where explicitly marked. All current records retain their citations and unknown values; launch is not a completeness claim.
- Confirm provider billing/usage alerts and operational monitoring in the Cloudflare dashboard. Direct static-asset requests are free within documented limits; health and denied API requests still execute the Worker and count against its request allowance. The launch adds no paid feature subscription.

If a release fails, fix or revert the application commit and use the same manual website workflow. Do not destroy infrastructure to roll back code, change encrypted state by hand or disable reviewer checks. A rollback to code predating catalogue-only mode could restore community routes; retain the launch guards when choosing a rollback.
