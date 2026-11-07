mock_provider "cloudflare" {}
variables {
  account_id    = "0123456789abcdef0123456789abcdef"
  environment   = "staging"
  site_hostname = "staging.example.com"
}
run "private_by_default" {
  command = plan
  assert {
    condition     = !cloudflare_r2_managed_domain.uploads.enabled && !cloudflare_r2_managed_domain.photos.enabled && length(cloudflare_r2_custom_domain.photos) == 0
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
run "production_has_separate_names" {
  command = plan
  variables {
    environment   = "production"
    site_hostname = "example.com"
  }
  assert {
    condition     = cloudflare_d1_database.community.name == "velogroupsets-production-community" && cloudflare_r2_bucket.uploads.name == "velogroupsets-production-uploads" && cloudflare_r2_bucket.photos.name == "velogroupsets-production-photos"
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
    condition     = cloudflare_r2_custom_domain.photos[0].bucket_name == cloudflare_r2_bucket.photos.name && cloudflare_r2_custom_domain.photos[0].min_tls == "1.2" && !cloudflare_r2_managed_domain.uploads.enabled
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
