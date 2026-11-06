terraform {
  required_version = "= 1.17.1"
  # HCP Terraform supplies state, locking, remote execution and apply approval.
  # CLI use sets TF_CLOUD_ORGANIZATION and TF_WORKSPACE explicitly.
  cloud {}
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "= 5.28.1"
    }
  }
}
# Authentication comes from CLOUDFLARE_API_TOKEN in the HCP workspace.
provider "cloudflare" {}
