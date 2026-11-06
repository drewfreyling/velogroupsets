# Architecture

**Status:** proposed design; no production resources or application have been provisioned by this documentation.

## Goals and starting decisions

Serve a mostly read-only bicycle groupset catalogue quickly, keep operating costs low, and allow authenticated users to upload component photos and comment on photos.

Use one GitHub repository for code, curated catalogue data, database migrations, and infrastructure configuration. Start with a TypeScript Worker and D1 so a container service and an external database are unnecessary. Catalogue browsing should continue to work if community services reach a quota or become unavailable.

## System diagram

```mermaid
flowchart TD
    Browser["Browser"]

    subgraph GitHub["GitHub"]
        Repo["Source code and curated catalogue"]
        CI["GitHub Actions: validate, build, deploy"]
        Repo --> CI
    end

    subgraph Cloudflare["Cloudflare"]
        Edge["Custom domain: CDN and available WAF rules"]
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

    Browser --> Edge
    Browser -->|"Signed PUT to R2 S3 endpoint"| Staging
    Browser -->|"View approved photos"| ImageCDN
    CI -.->|"Deploy"| Static
    CI -.->|"Deploy"| API
    CI -.->|"Apply reviewed migrations"| DB
```

The diagram is logical, not a deployment manifest. WAF capabilities depend on the Cloudflare plan. Turnstile is a browser widget with backend verification, not a universal network filter. Direct signed uploads go to the R2 S3 endpoint and must not rely on the site's WAF rules for protection.

The image-processing runtime and trigger are unresolved. The processor may need a separately priced service or compute budget. Photo uploads must remain disabled until validation, publication, and cleanup work end to end.

## Catalogue reads

1. A contributor changes JSON/YAML catalogue records through a pull request.
2. CI validates records, stable IDs, relationships, and sources.
3. The build generates HTML, static catalogue data, and a client-side search index.
4. Cloudflare serves the generated site without querying D1 for normal catalogue navigation.

Use a stable ID for each component and groupset, separate from its URL slug and display name. Removing or renaming a catalogue record needs a policy for redirects and existing community references. The API must validate submitted component IDs against a catalogue ID set shipped with its deployment.

## Community reads and writes

The Worker serves both public reads and authenticated writes. Illustrative routes:

| Route | Responsibility |
| --- | --- |
| `GET /api/components/:id/photos` | Paginated list of approved photo metadata |
| `GET /api/photos/:id/comments` | Paginated list of visible photo comments |
| `POST /api/photos/:id/comments` | Authorized, validated comment submission |
| `POST /api/uploads` | Reserve quota, create pending record, issue signed URL |
| `POST /api/uploads/:id/complete` | Verify ownership and uploaded object, schedule validation |
| Moderator-only routes | Approve, hide, remove, and review reports |

Routes are proposals, not an implemented API contract. Requests that edit or delete content must check ownership or moderator permissions. Hidden photos and comments must not leak through public APIs.

D1 stores identity-provider references, user roles, comments, photo metadata, upload reservations, reports, and moderation status. Store image object keys in D1, not image bytes or expiring signed URLs. Authentication provider and session design are still to be chosen; visitors do not need accounts to browse public content.

Use parameterized SQL, indexes, bounded queries, and pagination. API writes should be retry-safe where duplicate submissions are possible.

## Upload and publication flow

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant API as Worker API
    participant DB as D1
    participant R2 as Private R2 staging
    participant Processor as Validation and moderation
    participant Public as Public R2 photos

    User->>Browser: Select component photo
    Browser->>API: Request upload with session and Turnstile token
    API->>API: Verify identity, token, component ID and quota
    API->>DB: Reserve upload allowance and create pending record
    API-->>Browser: Short-lived signed PUT URL and upload ID
    Browser->>R2: Upload directly to assigned object key
    Browser->>API: Complete upload
    API->>R2: Check actual object metadata
    API->>DB: Mark validation pending
    API-->>Browser: Processing status
    Processor->>R2: Read and validate actual image
    Processor->>Processor: Re-encode, strip EXIF, resize and moderate
    Processor->>Public: Write approved derivatives under new immutable keys
    Processor->>DB: Mark approved and record published object keys
    Browser->>API: Fetch approved photo metadata
    API-->>Browser: Public image URLs
```

Required safeguards:

- Require authentication and server-side Turnstile verification when authorizing submissions. Check the expected hostname/action. Turnstile does not replace authorization.
- Generate unpredictable object keys on the server. Bind each upload to its owner, component, expiry, and reserved quota.
- Sign only the required operation and object key, with a short expiry and expected content type. Signed URLs are bearer capabilities and can be reused until expiry; do not treat them as one-time credentials.
- Configure staging-bucket CORS for the site's origin and required methods/headers. CORS is a browser policy, not access control against other clients.
- Treat declared size, MIME type, and browser checks as untrusted. Verify actual uploaded size, decode the image, and enforce format, pixel-count, and processing-resource limits. Reject active content such as SVG initially.
- A signed PUT alone is not a sufficient maximum-size enforcement mechanism. Define a separate approach if strict ingress size enforcement is needed; otherwise account for temporary oversized objects and reject/delete them before publication.
- Publish from validated bytes to a new key in a separate bucket. Never expose staging keys directly: a still-valid signed URL could overwrite an uploaded original after validation.
- Re-encode approved images, remove EXIF/GPS metadata, and generate bounded display sizes before public release.
- Keep rejected uploads private; expire abandoned objects and reservations, and handle retries without publishing duplicates.
- Make publication state transitions recoverable: D1 updates and R2 writes are not one cross-service transaction. Reconcile orphaned objects and records after failures.

A private staging bucket and a public approved bucket are a security boundary. Attaching a public custom domain to the staging bucket would defeat that boundary.

References: [R2 presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/), [R2 CORS](https://developers.cloudflare.com/r2/buckets/cors/), and [Turnstile validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).

## Caching and routing

| Content | Policy |
| --- | --- |
| Catalogue HTML | Static serving; refresh on deploy and use appropriate browser revalidation |
| Hashed JS/CSS and versioned catalogue/search files | Long-lived immutable caching |
| Approved photo derivatives | Long-lived caching through an R2 custom domain; use new keys when bytes change |
| Public photo/comment lists | Explicit short shared cache, initially 30–60 seconds |
| Sessions, upload URLs, private/moderator responses, writes | `Cache-Control: no-store`; no shared caching |

Configure public API caching explicitly. A general Cloudflare proxy does not cache HTML or JSON by default, and a cache lookup inside a Worker still invokes the Worker. Do not assume a cached API response eliminates Worker request accounting.

Keep personalized information out of public cached responses. Skip shared caching for authenticated requests initially, and never cache a response containing session cookies or a signed upload URL.

The public image bucket should use a custom domain such as `images.example.com`; `r2.dev` is for development and is not the production caching path. Presigned upload URLs use `<ACCOUNT_ID>.r2.cloudflarestorage.com`, not the public image domain.

On comment/photo moderation or deletion, invalidate affected API caches and purge public image URLs as applicable. Long cache lifetimes require an explicit removal procedure; deleting an origin object alone does not immediately remove cached copies.

References: [default CDN cache behaviour](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/) and [R2 caching](https://developers.cloudflare.com/cache/interaction-cloudflare-products/r2/).

## Security and operations

- Keep secrets in deployment/runtime secret stores. Grant CI and R2 credentials only the permissions needed.
- Separate preview and production D1 databases, R2 buckets, identity settings, and credentials. Fork PR checks run without production secrets.
- Validate comment length and render comments as escaped text or safely sanitized markup.
- Protect cookie-authenticated writes against CSRF and enforce restrictive session-cookie settings.
- Apply per-user upload/storage/comment quotas and appropriate IP rate limits. Use application checks alongside the available WAF features.
- Record moderation actions, provide reporting, and define account/content deletion procedures.
- Back up D1 with a documented retention and restore process; test restoration. Define retention and recovery needs for R2 originals and published derivatives separately.
- Track usage, failed requests, pending-upload age, processor failures, and storage growth. Avoid logging secrets, session tokens, or signed URLs.
- Degrade community widgets gracefully when the API is unavailable, preserving static catalogue browsing.

## Deployment

GitHub Actions should validate and build pull requests, then deploy trusted changes from `main`. A Git push is not a database backup or a reverse migration.

Configure static assets so catalogue requests avoid unnecessary Worker execution and `/api/*` always reaches the API. Select the exact Worker/static-assets packaging during scaffolding.

Before applying production migrations, establish backup and compatibility checks. Keep application and schema changes compatible across deployment boundaries. Configure preview resources independently and verify secrets never reach frontend bundles.

## Cost and portability

The initial design aims to use Cloudflare free allowances; see the [README cost table](../README.md#cost-approach) and linked official pricing. Those allowances do not cover unlimited storage, processing, or enhanced security features. Quota exhaustion can interrupt community features, and budget alerts do not enforce a spending cap.

D1 uses SQLite semantics, not Postgres. JSON/YAML catalogue records, SQL migrations, and an explicit storage interface help future migration, but moving D1 to Postgres would still require schema and query work.

If .NET is required later, replace the backend with a Worker routing to an ASP.NET Cloudflare Container and hosted Postgres. Keep the static catalogue and R2 upload/publication separation. Account for the paid Workers plan, container runtime usage, cold starts, database connection pooling, and the database provider's limits.

## Decisions required before community launch

- Frontend/static generator, package manager, runtime versions, and local development commands.
- Authentication provider, sessions, account recovery, and moderator provisioning.
- Image-processing runtime, triggering/retry mechanism, and resource/cost limits.
- Supported image formats, byte/pixel limits, quota values, and retention periods.
- Moderation policy, reporting, privacy/deletion policy, and user-photo permissions.
- Catalogue schema, source attribution, and dedicated data licensing policy.
- Actual custom-domain names, Cloudflare resource names, and CI configuration.
