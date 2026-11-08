variable "account_id" {
  description = "Cloudflare account ID (not a credential)."
  type        = string
  validation {
    condition     = can(regex("^[0-9a-f]{32}$", var.account_id))
    error_message = "account_id must be a 32-character lowercase hexadecimal Cloudflare account ID."
  }
}
variable "environment" {
  description = "Environment; each value must use a separate backend state key."
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
  description = "Existing zone ID; required for public photos and an alternative to site_zone_name for the website."
  type        = string
  default     = null
  validation {
    condition     = var.zone_id == null ? true : can(regex("^[0-9a-f]{32}$", var.zone_id))
    error_message = "zone_id must be a 32-character lowercase hexadecimal Cloudflare zone ID."
  }
}
variable "enable_site_domain" {
  description = "Attach the site hostname after Wrangler has created this environment's Worker."
  type        = bool
  default     = false
}
variable "site_zone_name" {
  description = "Existing apex zone name; required for CAA records, or an alternative to zone_id for the Worker custom domain."
  type        = string
  default     = null
  validation {
    condition     = var.site_zone_name == null ? true : can(regex("^([a-z0-9]([a-z0-9-]*[a-z0-9])?\\.)+[a-z]{2,}$", var.site_zone_name))
    error_message = "site_zone_name must be a lowercase DNS zone name."
  }
}
variable "manage_zone_caa" {
  description = "Own shared apex CAA records in staging state only, with zone_id and site_zone_name configured."
  type        = bool
  default     = false
}
variable "manage_zone_tls" {
  description = "Own shared zone-wide HTTPS/TLS settings in staging state only. Do not enable in another state for the same zone."
  type        = bool
  default     = false
}
variable "minimum_tls_version" {
  description = "Minimum visitor TLS version. TLS 1.3 stays enabled for both choices."
  type        = string
  default     = "1.2"
  validation {
    condition     = contains(["1.2", "1.3"], var.minimum_tls_version)
    error_message = "minimum_tls_version must be 1.2 or 1.3; older protocols are prohibited."
  }
}
variable "import_zone_settings" {
  description = "Adopt existing settings before updates. Keep true for live plans; false only in mocked tests, whose provider cannot import."
  type        = bool
  default     = true
}
variable "manage_zone_email" {
  description = "Import and own shared Email Routing DNS and contact forwarding in staging state only."
  type        = bool
  default     = false
}
variable "email_forwarding_destination" {
  description = "Private existing verified destination, supplied only by GitHub environment secret. Retained in encrypted state/plan."
  type        = string
  default     = null
  sensitive   = true
  validation {
    condition     = var.email_forwarding_destination == null ? true : can(regex("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", var.email_forwarding_destination))
    error_message = "The forwarding secret must contain one email address without surrounding whitespace."
  }
}
variable "email_contact_metadata" {
  description = "Private runner-discovered import metadata; no destination is committed to configuration."
  type = object({
    id       = string
    name     = optional(string)
    priority = optional(number)
  })
  default   = null
  sensitive = true
}
