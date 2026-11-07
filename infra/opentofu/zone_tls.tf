# Shared by every proxied hostname in the zone. Staging state is the sole
# initial owner; migrate ownership deliberately before reorganizing roots.
locals {
  zone_tls_settings = var.manage_zone_tls ? {
    min_tls_version  = var.minimum_tls_version
    tls_1_3          = "on"
    always_use_https = "on"
    ssl              = "strict"
  } : {}
}

resource "cloudflare_zone_setting" "tls" {
  for_each   = local.zone_tls_settings
  zone_id    = var.zone_id
  setting_id = each.key
  value      = each.value

  lifecycle {
    precondition {
      condition     = var.zone_id != null && var.environment == "staging"
      error_message = "Shared TLS settings require a zone ID and staging-state ownership; do not duplicate them in production state."
    }
  }
}

resource "cloudflare_zone_setting" "hsts" {
  count      = var.manage_zone_tls ? 1 : 0
  zone_id    = var.zone_id
  setting_id = "security_header"
  value = {
    strict_transport_security = {
      enabled            = true
      max_age            = 31536000
      include_subdomains = true
      preload            = true
      nosniff            = true
    }
  }

  lifecycle {
    precondition {
      condition     = var.zone_id != null && var.environment == "staging"
      error_message = "Shared HSTS settings require a zone ID and staging-state ownership."
    }
  }
}

# Settings already exist in Cloudflare; adopt their real current values before
# planning updates. Imports are recorded only when the saved plan is approved.
import {
  for_each = var.import_zone_settings ? local.zone_tls_settings : {}
  to       = cloudflare_zone_setting.tls[each.key]
  id       = "${var.zone_id}/${each.key}"
}
import {
  for_each = var.manage_zone_tls && var.import_zone_settings ? toset(["security_header"]) : toset([])
  to       = cloudflare_zone_setting.hsts[0]
  id       = "${var.zone_id}/${each.key}"
}
