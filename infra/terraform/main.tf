locals {
  name = "velogroupsets-${var.environment}"
}
resource "cloudflare_d1_database" "community" {
  account_id = var.account_id
  name       = "${local.name}-community"
  lifecycle {
    prevent_destroy = true
  }
}
resource "cloudflare_r2_bucket" "uploads" {
  account_id    = var.account_id
  name          = "${local.name}-uploads"
  storage_class = "Standard"
  lifecycle {
    prevent_destroy = true
  }
}
resource "cloudflare_r2_bucket" "photos" {
  account_id    = var.account_id
  name          = "${local.name}-photos"
  storage_class = "Standard"
  lifecycle {
    prevent_destroy = true
  }
}
# Keep r2.dev access off, including for approved-photo storage.
resource "cloudflare_r2_managed_domain" "uploads" {
  account_id  = var.account_id
  bucket_name = cloudflare_r2_bucket.uploads.name
  enabled     = false
}
resource "cloudflare_r2_managed_domain" "photos" {
  account_id  = var.account_id
  bucket_name = cloudflare_r2_bucket.photos.name
  enabled     = false
}
resource "cloudflare_r2_bucket_cors" "uploads" {
  account_id  = var.account_id
  bucket_name = cloudflare_r2_bucket.uploads.name
  rules = [{
    id = "website-signed-uploads"
    allowed = {
      origins = ["https://${var.site_hostname}"]
      methods = ["PUT"]
      headers = ["Content-Type"]
    }
    expose_headers  = ["ETag"]
    max_age_seconds = 3600
  }]
}
# Staging is temporary, not an archive of original photos.
resource "cloudflare_r2_bucket_lifecycle" "uploads" {
  account_id  = var.account_id
  bucket_name = cloudflare_r2_bucket.uploads.name
  rules = [{
    id         = "expire-temporary-uploads"
    enabled    = true
    conditions = { prefix = "" }
    delete_objects_transition = {
      condition = {
        type    = "Age"
        max_age = var.staging_retention_days * 86400
      }
    }
    abort_multipart_uploads_transition = {
      condition = {
        type    = "Age"
        max_age = 86400
      }
    }
  }]
}
# Keep published derivatives; clean up only incomplete multipart uploads.
resource "cloudflare_r2_bucket_lifecycle" "photos" {
  account_id  = var.account_id
  bucket_name = cloudflare_r2_bucket.photos.name
  rules = [{
    id         = "abort-incomplete-photo-uploads"
    enabled    = true
    conditions = { prefix = "" }
    abort_multipart_uploads_transition = {
      condition = {
        type    = "Age"
        max_age = 86400
      }
    }
  }]
}
resource "cloudflare_turnstile_widget" "submissions" {
  account_id      = var.account_id
  name            = "${local.name}-submissions"
  domains         = [var.site_hostname]
  mode            = "managed"
  clearance_level = "no_clearance"
}
resource "cloudflare_r2_custom_domain" "photos" {
  count = var.enable_public_photos ? 1 : 0

  account_id  = var.account_id
  bucket_name = cloudflare_r2_bucket.photos.name
  domain      = var.photos_hostname
  zone_id     = var.zone_id
  enabled     = true
  min_tls     = "1.2"

  lifecycle {
    precondition {
      condition     = var.photos_hostname != null && var.zone_id != null && var.photos_hostname != var.site_hostname
      error_message = "Public photos require a zone_id and a distinct photos_hostname."
    }
  }
}
