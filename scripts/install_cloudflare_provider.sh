#!/usr/bin/env bash
# Avoid release-page checksum outages; retain the committed provider lock checks.
set -euo pipefail
version=5.28.1
asset=660831078
digest=2ae200482bf592cd703981c4d4fe87a52c0dfae81a70261295f59b1bb0d01a6c
python3 - "$version" "$digest" <<'PY'
from pathlib import Path
import sys
lock=Path('infra/opentofu/.terraform.lock.hcl').read_text()
if ('version     = "'+sys.argv[1]+'"') not in lock or ('"zh:'+sys.argv[2]+'"') not in lock:
    raise SystemExit('Pinned provider version/checksum must match the committed dependency lock.')
PY
mirror="$RUNNER_TEMP/provider-mirror"
folder="$mirror/registry.opentofu.org/cloudflare/cloudflare"
mkdir -p "$folder"
archive="$folder/terraform-provider-cloudflare_${version}_linux_amd64.zip"
curl --fail --location --retry 3 --retry-all-errors --connect-timeout 15 --max-time 120 \
  --header 'Accept: application/octet-stream' --output "$archive" \
  "https://api.github.com/repos/cloudflare/terraform-provider-cloudflare/releases/assets/${asset}"
printf '%s  %s\n' "$digest" "$archive" | sha256sum --check
config="$RUNNER_TEMP/provider-mirror.tfrc"
cat > "$config" <<EOF
provider_installation {
  filesystem_mirror {
    path = "$mirror"
    include = ["registry.opentofu.org/cloudflare/cloudflare"]
  }
  direct {
    exclude = ["registry.opentofu.org/cloudflare/cloudflare"]
  }
}
EOF
printf 'TF_CLI_CONFIG_FILE=%s\n' "$config" >> "$GITHUB_ENV"
