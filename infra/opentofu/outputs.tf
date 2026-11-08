output "wrangler_bindings" {
  description = "Non-secret values for the application-owned Wrangler configuration."
  value = {
    d1_databases = [{
      binding       = "COMMUNITY_DB"
      database_name = cloudflare_d1_database.community.name
      database_id   = cloudflare_d1_database.community.id
    }]
    r2_buckets = [
      { binding = "UPLOADS", bucket_name = cloudflare_r2_bucket.uploads.name },
      { binding = "PHOTOS", bucket_name = cloudflare_r2_bucket.photos.name },
      { binding = "EVIDENCE", bucket_name = cloudflare_r2_bucket.evidence.name },
    ]
  }
}
output "turnstile_site_key" {
  description = "Public site key. Deliver the secret separately to the Worker secret store."
  value       = cloudflare_turnstile_widget.submissions.sitekey
}
output "photos_base_url" {
  description = "Null until public access is enabled; domain activation still needs verification."
  value       = var.enable_public_photos && var.photos_hostname != null ? "https://${var.photos_hostname}" : null
}
output "site_url" {
  description = "Website URL after custom domain attachment; verify DNS and TLS separately."
  value       = var.enable_site_domain ? "https://${var.site_hostname}" : null
}
