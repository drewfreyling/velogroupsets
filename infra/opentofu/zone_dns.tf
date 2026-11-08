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

# Preserve the existing Search Console proof; never create a duplicate TXT record.
resource "cloudflare_dns_record" "google_site_verification" {
  count = var.google_site_verification_content != null ? 1 : 0

  zone_id = var.zone_id
  name    = var.site_zone_name
  type    = "TXT"
  content = var.google_site_verification_content
  ttl     = try(var.google_site_verification_metadata.ttl, 1)
  proxied = false
  comment = try(var.google_site_verification_metadata.comment, null)
  tags    = try(var.google_site_verification_metadata.tags, [])

  lifecycle {
    prevent_destroy = true
    precondition {
      condition     = var.zone_id != null && var.site_zone_name != null && var.environment == "staging" && var.google_site_verification_metadata != null
      error_message = "Search Console verification requires staging-state ownership and read-only discovery of the existing TXT record."
    }
  }
}

import {
  for_each = var.google_site_verification_content != null && var.import_zone_settings ? toset(["google"]) : toset([])
  to       = cloudflare_dns_record.google_site_verification[0]
  id       = "${var.zone_id}/${try(var.google_site_verification_metadata.id, "")}"
}
