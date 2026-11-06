terraform {
  required_version = "= 1.13.9"
  backend "s3" {}
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "= 5.28.1"
    }
  }
  # The runner supplies key material through TF_ENCRYPTION. Fail closed if absent.
  encryption {
    state { enforced = true }
    plan { enforced = true }
  }
}
provider "cloudflare" {}
