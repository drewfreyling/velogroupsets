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
download_args=(--fail --location --retry 3 --retry-all-errors --connect-timeout 15 --max-time 120)
if ! curl "${download_args[@]}" --output "$archive" \
  "https://github.com/cloudflare/terraform-provider-cloudflare/releases/download/v${version}/terraform-provider-cloudflare_${version}_linux_amd64.zip"; then
  api_headers=(--header 'Accept: application/octet-stream')
  if [[ -n "${GH_TOKEN:-}" ]]; then
    api_headers+=(--header "Authorization: Bearer ${GH_TOKEN}")
  fi
  download_nonce="${GITHUB_RUN_ID:-local}-${GITHUB_RUN_ATTEMPT:-1}-$(date +%s)"
  curl "${download_args[@]}" "${api_headers[@]}" --output "$archive" \
    "https://api.github.com/repos/cloudflare/terraform-provider-cloudflare/releases/assets/${asset}?download=${download_nonce}"
fi
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
