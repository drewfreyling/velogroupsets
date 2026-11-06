bucket = "velogroupsets-infra-state"
key    = "state/staging/terraform.tfstate"
region = "auto"
endpoints = {
  s3 = "https://5ccb67114ff0fa1a13cb46ef3d08cb49.r2.cloudflarestorage.com"
}
use_lockfile                = true
use_path_style              = true
skip_credentials_validation = true
skip_metadata_api_check     = true
skip_region_validation      = true
skip_requesting_account_id  = true
skip_s3_checksum            = true
