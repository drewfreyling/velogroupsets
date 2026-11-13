#!/usr/bin/env bash
# Ubuntu x64 Actions runners only. Fail closed on download or checksum errors.
set -euo pipefail
version=$(cat .opentofu-version)
case "$version" in
  1.13.9) asset=714326292; digest=bc44eb6b06446ba83bd4072114891987f590f66cca712737a7f1147c50c539ce ;;
  *) echo 'No verified OpenTofu release digest configured for this version.' >&2; exit 1 ;;
esac
archive="$RUNNER_TEMP/opentofu.zip"
download_args=(--fail --location --retry 3 --retry-all-errors --connect-timeout 15 --max-time 120)
if ! curl "${download_args[@]}" --output "$archive" \
  "https://github.com/opentofu/opentofu/releases/download/v${version}/tofu_${version}_linux_amd64.zip"; then
  # Use an authenticated API fallback on Actions runners, and avoid cached,
  # expired release-asset redirects. The digest below is mandatory either way.
  api_headers=(--header 'Accept: application/octet-stream')
  if [[ -n "${GH_TOKEN:-}" ]]; then
    api_headers+=(--header "Authorization: Bearer ${GH_TOKEN}")
  fi
  download_nonce="${GITHUB_RUN_ID:-local}-${GITHUB_RUN_ATTEMPT:-1}-$(date +%s)"
  curl "${download_args[@]}" "${api_headers[@]}" --output "$archive" \
    "https://api.github.com/repos/opentofu/opentofu/releases/assets/${asset}?download=${download_nonce}"
fi
printf '%s  %s\n' "$digest" "$archive" | sha256sum --check
mkdir -p "$RUNNER_TEMP/opentofu"
unzip -o "$archive" tofu -d "$RUNNER_TEMP/opentofu"
echo "$RUNNER_TEMP/opentofu" >> "$GITHUB_PATH"
