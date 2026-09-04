#!/usr/bin/env bash
#
# Renders homebrew/pipecorn.cask.rb.tmpl for a release, printing the cask on
# stdout. Expects the release tarballs to be named
# pipecorn-v<version>-<target>.tar.gz (see the release workflow).
#
# Usage: scripts/render-homebrew-cask.sh <version> [tarball-dir]

set -euo pipefail

version="${1:?usage: render-homebrew-cask.sh <version> [tarball-dir]}"
tarball_dir="${2:-dist}"
root="$(cd "$(dirname "$0")/.." && pwd)"

cask="$(cat "$root/homebrew/pipecorn.cask.rb.tmpl")"
cask="${cask//\{\{VERSION\}\}/$version}"

for target in darwin-arm64 darwin-x64; do
  tarball="$tarball_dir/pipecorn-v$version-$target.tar.gz"
  if [ ! -f "$tarball" ]; then
    echo "missing tarball: $tarball" >&2
    exit 1
  fi

  sha="$(shasum -a 256 "$tarball" | cut -d ' ' -f 1)"
  placeholder="SHA256_$(printf '%s' "$target" | tr '[:lower:]-' '[:upper:]_')"
  cask="${cask//\{\{$placeholder\}\}/$sha}"
done

if printf '%s' "$cask" | grep -q '{{'; then
  echo "unrendered placeholders remain in cask" >&2
  exit 1
fi

printf '%s\n' "$cask"
