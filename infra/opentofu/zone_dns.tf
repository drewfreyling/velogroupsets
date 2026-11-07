# Like the shared TLS policy, apex CAA records have one owner: staging state.
# issue also authorizes wildcard certificates when issuewild is absent.
resource "cloudflare_dns_record" "caa" {
  for_each = var.manage_zone_caa ? toset([
    "letsencrypt.org",
    "pki.goog; cansignhttpexchanges=yes",
    "ssl.com",
    "sectigo.com",
  ]) : toset([])

  zone_id = var.zone_id
  name    = var.site_zone_name
  type    = "CAA"
  ttl     = 3600
  data = {
    flags = 0
    tag   = "issue"
    value = each.value
  }
  comment = "Cloudflare edge certificate issuance; managed by OpenTofu."

  lifecycle {
    precondition {
      condition     = var.zone_id != null && var.site_zone_name != null && var.environment == "staging"
      error_message = "Shared CAA records require the zone ID, apex zone name and staging-state ownership."
    }
  }
}
