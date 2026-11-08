#!/usr/bin/env bash
# Ubuntu x64 Actions runners only. Fail closed on download or checksum errors.
set -euo pipefail
version=$(cat .opentofu-version)
case "$version" in
  1.13.9) asset=714326292; digest=bc44eb6b06446ba83bd4072114891987f590f66cca712737a7f1147c50c539ce ;;
  *) echo 'No verified OpenTofu release digest configured for this version.' >&2; exit 1 ;;
esac
archive="$RUNNER_TEMP/opentofu.zip"
curl --fail --location --retry 3 --retry-all-errors --connect-timeout 15 --max-time 120 \
  --header "Accept: application/octet-stream" --output "$archive" \
  "https://api.github.com/repos/opentofu/opentofu/releases/assets/${asset}"
printf '%s  %s\n' "$digest" "$archive" | sha256sum --check
mkdir -p "$RUNNER_TEMP/opentofu"
unzip -o "$archive" tofu -d "$RUNNER_TEMP/opentofu"
echo "$RUNNER_TEMP/opentofu" >> "$GITHUB_PATH"
