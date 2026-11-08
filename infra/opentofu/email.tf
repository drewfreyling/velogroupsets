# Zone-wide mail configuration has the same sole state owner as CAA and TLS.
# Cloudflare owns the underlying generated MX/SPF records; do not also declare
# those records as cloudflare_dns_record resources.
resource "cloudflare_email_routing_dns" "mail" {
  count   = var.manage_zone_email ? 1 : 0
  zone_id = var.zone_id
  # Provider 5.28.1 marks name no_refresh: imports cannot recover it. Setting
  # this optional creation parameter would cause a needless update on adoption.

  lifecycle {
    prevent_destroy = true
    precondition {
      condition     = var.zone_id != null && var.site_zone_name != null && var.environment == "staging"
      error_message = "Shared email DNS requires the apex zone and staging-state ownership."
    }
  }
}

resource "cloudflare_email_routing_rule" "contact" {
  count    = var.manage_zone_email ? 1 : 0
  zone_id  = var.zone_id
  enabled  = true
  name     = try(var.email_contact_metadata.name, null)
  priority = try(var.email_contact_metadata.priority, null)
  source   = "api"
  matchers = [{ type = "literal", field = "to", value = "contact@${var.site_zone_name}" }]
  actions  = [{ type = "forward", value = [var.email_forwarding_destination] }]

  lifecycle {
    prevent_destroy = true
    precondition {
      condition     = var.zone_id != null && var.site_zone_name != null && var.environment == "staging" && var.email_contact_metadata != null && var.email_forwarding_destination != null
      error_message = "Contact forwarding requires staging-state ownership, private live-rule discovery and the forwarding secret."
    }
  }
}

import {
  for_each = var.manage_zone_email && var.import_zone_settings ? toset(["mail"]) : toset([])
  to       = cloudflare_email_routing_dns.mail[0]
  id       = var.zone_id
}
import {
  for_each = var.manage_zone_email && var.import_zone_settings ? toset(["contact"]) : toset([])
  to       = cloudflare_email_routing_rule.contact[0]
  # Only the opaque identifier is declassified, never the forwarding address.
  id = "${var.zone_id}/${nonsensitive(try(var.email_contact_metadata.id, ""))}"
}
