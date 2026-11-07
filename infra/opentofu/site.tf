# Wrangler owns Worker code/assets/bindings. Only OpenTofu owns this domain.
# Bootstrap the Worker before enabling this resource; the API requires it to exist.
resource "cloudflare_workers_custom_domain" "site" {
  count      = var.enable_site_domain ? 1 : 0
  account_id = var.account_id
  hostname   = var.site_hostname
  service    = "velogroupsets-${var.environment}"
  zone_id    = var.zone_id

  lifecycle {
    precondition {
      condition     = var.zone_id != null
      error_message = "The website custom domain requires the existing Cloudflare zone ID."
    }
  }
}
