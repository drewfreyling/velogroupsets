mock_provider "cloudflare" {}
variables {
  account_id    = "0123456789abcdef0123456789abcdef"
  environment   = "staging"
  site_hostname = "staging.example.com"
  # OpenTofu 1.13.9 mocks cannot import existing resources. Live plans do.
  import_zone_settings = false
}
run "private_by_default" {
  command = plan
  assert {
    condition     = length(cloudflare_dns_record.caa) == 0
    error_message = "CAA must be opt-in so production cannot duplicate shared zone ownership."
  }
  assert {
    condition     = length(cloudflare_email_routing_dns.mail) == 0 && length(cloudflare_email_routing_rule.contact) == 0
    error_message = "Shared mail ownership must be opt-in and absent from production defaults."
  }
  assert {
    condition     = !cloudflare_r2_managed_domain.uploads.enabled && !cloudflare_r2_managed_domain.photos.enabled && !cloudflare_r2_managed_domain.evidence.enabled && length(cloudflare_r2_custom_domain.photos) == 0
    error_message = "Storage must not expose a public endpoint by default."
  }
  assert {
    condition     = cloudflare_r2_bucket_cors.uploads.rules[0].allowed.origins == tolist(["https://staging.example.com"])
    error_message = "Only the selected site's HTTPS origin may upload."
  }
  assert {
    condition     = cloudflare_r2_bucket_lifecycle.uploads.rules[0].delete_objects_transition.condition.max_age == 604800 && cloudflare_r2_bucket_lifecycle.photos.rules[0].delete_objects_transition == null
    error_message = "Expire staging originals after seven days, without expiring published photos."
  }
  assert {
    condition     = cloudflare_turnstile_widget.submissions.clearance_level == "no_clearance"
    error_message = "Turnstile must not grant network challenge clearance."
  }
}
run "shared_caa_allows_cloudflare_certificate_authorities" {
  command = plan
  variables {
    manage_zone_caa = true
    zone_id         = "0123456789abcdef0123456789abcdef"
    site_zone_name  = "example.com"
  }
  assert {
    condition = toset([for record in cloudflare_dns_record.caa : record.data.value]) == toset([
      "letsencrypt.org", "pki.goog; cansignhttpexchanges=yes", "ssl.com", "sectigo.com"
    ])
    error_message = "Allow Cloudflare's primary and backup certificate authorities."
  }
  assert {
    condition     = alltrue([for record in cloudflare_dns_record.caa : record.name == "example.com" && record.zone_id == var.zone_id && record.type == "CAA" && record.ttl == 3600 && record.data.flags == 0 && record.data.tag == "issue"])
    error_message = "CAA must apply at the apex, including inherited wildcard issuance, without blocking renewals."
  }
}
run "reject_duplicate_caa_ownership" {
  command = plan
  variables {
    environment     = "production"
    manage_zone_caa = true
    zone_id         = "0123456789abcdef0123456789abcdef"
    site_zone_name  = "example.com"
  }
  expect_failures = [cloudflare_dns_record.caa]
}
run "production_has_separate_names" {
  command = plan
  variables {
    environment   = "production"
    site_hostname = "example.com"
  }
  assert {
    condition     = cloudflare_d1_database.community.name == "velogroupsets-production-community" && cloudflare_r2_bucket.uploads.name == "velogroupsets-production-uploads" && cloudflare_r2_bucket.photos.name == "velogroupsets-production-photos" && cloudflare_r2_bucket.evidence.name == "velogroupsets-production-evidence"
    error_message = "Environments must not share persistent resource names."
  }
}
run "public_photos_require_configuration" {
  command = plan
  variables {
    enable_public_photos = true
  }
  expect_failures = [cloudflare_r2_custom_domain.photos]
}
run "publish_only_approved_bucket" {
  command = plan
  variables {
    enable_public_photos = true
    photos_hostname      = "images.example.com"
    zone_id              = "0123456789abcdef0123456789abcdef"
  }
  assert {
    condition     = cloudflare_r2_custom_domain.photos[0].bucket_name == cloudflare_r2_bucket.photos.name && cloudflare_r2_custom_domain.photos[0].min_tls == "1.3" && !cloudflare_r2_managed_domain.uploads.enabled
    error_message = "Publication must target the approved bucket and keep staging private."
  }
}
run "reject_wildcard_origin" {
  command = plan
  variables {
    site_hostname = "*.example.com"
  }
  expect_failures = [var.site_hostname]
}
run "site_domain_requires_zone" {
  command = plan
  variables {
    enable_site_domain = true
  }
  expect_failures = [cloudflare_workers_custom_domain.site]
}
run "site_domain_targets_environment_worker" {
  command = plan
  variables {
    enable_site_domain = true
    site_zone_name     = "example.com"
  }
  assert {
    condition     = cloudflare_workers_custom_domain.site[0].hostname == "staging.example.com" && cloudflare_workers_custom_domain.site[0].service == "velogroupsets-staging"
    error_message = "The site domain must target its own environment's Worker."
  }
}
run "zone_tls_and_hsts_policy" {
  command = plan
  variables {
    manage_zone_tls = true
    zone_id         = "0123456789abcdef0123456789abcdef"
  }
  assert {
    condition     = cloudflare_zone_setting.tls["min_tls_version"].value == "1.2" && cloudflare_zone_setting.tls["tls_1_3"].value == "on" && cloudflare_zone_setting.tls["always_use_https"].value == "on" && cloudflare_zone_setting.tls["ssl"].value == "strict"
    error_message = "Enforce HTTPS, TLS 1.2 or newer, TLS 1.3 support and strict origin TLS."
  }
  assert {
    condition     = cloudflare_zone_setting.hsts[0].value.strict_transport_security.enabled && cloudflare_zone_setting.hsts[0].value.strict_transport_security.max_age == 31536000 && cloudflare_zone_setting.hsts[0].value.strict_transport_security.include_subdomains && cloudflare_zone_setting.hsts[0].value.strict_transport_security.preload
    error_message = "Enable HSTS for one year, including subdomains and the preload directive."
  }
}
run "tls_policy_can_require_tls13" {
  command = plan
  variables {
    manage_zone_tls     = true
    zone_id             = "0123456789abcdef0123456789abcdef"
    minimum_tls_version = "1.3"
  }
  assert {
    condition     = cloudflare_zone_setting.tls["min_tls_version"].value == "1.3"
    error_message = "A TLS 1.3-only policy must not silently allow TLS 1.2."
  }
}
run "reject_legacy_tls" {
  command = plan
  variables {
    minimum_tls_version = "1.1"
  }
  expect_failures = [var.minimum_tls_version]
}
run "adopt_shared_mail_with_private_destination" {
  command = plan
  variables {
    manage_zone_email            = true
    zone_id                      = "0123456789abcdef0123456789abcdef"
    site_zone_name               = "example.com"
    email_forwarding_destination = "private-recipient@example.test"
    email_contact_metadata       = { id = "0123456789abcdef0123456789abcdef", name = "Existing contact", priority = 17 }
  }
  assert {
    condition     = cloudflare_email_routing_dns.mail[0].zone_id == var.zone_id && cloudflare_email_routing_dns.mail[0].name == null
    error_message = "Mail DNS ownership must target the existing apex zone."
  }
  assert {
    condition     = cloudflare_email_routing_rule.contact[0].actions[0].value[0] == var.email_forwarding_destination && cloudflare_email_routing_rule.contact[0].matchers[0].value == "contact@example.com" && cloudflare_email_routing_rule.contact[0].priority == 17 && cloudflare_email_routing_rule.contact[0].enabled
    error_message = "Preserve the contact destination, matching address, priority and enabled status."
  }
}
run "reject_duplicate_email_ownership" {
  command = plan
  variables {
    environment                  = "production"
    manage_zone_email            = true
    zone_id                      = "0123456789abcdef0123456789abcdef"
    site_zone_name               = "example.com"
    email_forwarding_destination = "private-recipient@example.test"
    email_contact_metadata       = { id = "0123456789abcdef0123456789abcdef", name = "Existing contact", priority = 17 }
  }
  expect_failures = [cloudflare_email_routing_dns.mail, cloudflare_email_routing_rule.contact]
}
