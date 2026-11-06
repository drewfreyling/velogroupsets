variable "account_id" {
  description = "Cloudflare account ID (not a credential)."
  type        = string
  validation {
    condition     = can(regex("^[0-9a-f]{32}$", var.account_id))
    error_message = "account_id must be a 32-character lowercase hexadecimal Cloudflare account ID."
  }
}
variable "environment" {
  description = "Environment; each value must use its own HCP Terraform workspace."
  type        = string
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "environment must be staging or production."
  }
}
variable "site_hostname" {
  description = "Website hostname without scheme or path; used for CORS and Turnstile."
  type        = string
  validation {
    condition     = can(regex("^([a-z0-9]([a-z0-9-]*[a-z0-9])?\\.)+[a-z]{2,}$", var.site_hostname))
    error_message = "site_hostname must be a lowercase DNS hostname without scheme, port, wildcard or path."
  }
}
variable "staging_retention_days" {
  description = "Days before all staging originals expire; processing must finish before this deadline."
  type        = number
  default     = 7
  validation {
    condition     = var.staging_retention_days >= 1 && var.staging_retention_days <= 30 && floor(var.staging_retention_days) == var.staging_retention_days
    error_message = "staging_retention_days must be an integer from 1 to 30."
  }
}
variable "enable_public_photos" {
  description = "Expose approved photos only after the publication flow is ready."
  type        = bool
  default     = false
}
variable "photos_hostname" {
  description = "Custom domain for approved photos; never assigned to staging."
  type        = string
  default     = null
  validation {
    condition     = var.photos_hostname == null ? true : can(regex("^([a-z0-9]([a-z0-9-]*[a-z0-9])?\\.)+[a-z]{2,}$", var.photos_hostname))
    error_message = "photos_hostname must be a lowercase DNS hostname without scheme, wildcard or path."
  }
}
variable "zone_id" {
  description = "Existing zone ID, required only when enabling the photo custom domain."
  type        = string
  default     = null
  validation {
    condition     = var.zone_id == null ? true : can(regex("^[0-9a-f]{32}$", var.zone_id))
    error_message = "zone_id must be a 32-character lowercase hexadecimal Cloudflare zone ID."
  }
}
