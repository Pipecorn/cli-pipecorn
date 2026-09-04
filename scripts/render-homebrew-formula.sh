#!/usr/bin/env bash
#
# Renders homebrew/pipecorn.rb.tmpl for a release, printing the formula on
# stdout. Expects the release tarballs to be named
# pipecorn-v<version>-<target>.tar.gz (see the release workflow).
#
# Usage: scripts/render-homebrew-formula.sh <version> [tarball-dir]

set -euo pipefail

version="${1:?usage: render-homebrew-formula.sh <version> [tarball-dir]}"
tarball_dir="${2:-dist}"
root="$(cd "$(dirname "$0")/.." && pwd)"

formula="$(cat "$root/homebrew/pipecorn.rb.tmpl")"
formula="${formula//\{\{VERSION\}\}/$version}"

for target in darwin-arm64 darwin-x64 linux-arm64 linux-x64; do
  tarball="$tarball_dir/pipecorn-v$version-$target.tar.gz"
  if [ ! -f "$tarball" ]; then
    echo "missing tarball: $tarball" >&2
    exit 1
  fi

  sha="$(shasum -a 256 "$tarball" | cut -d ' ' -f 1)"
  placeholder="SHA256_$(printf '%s' "$target" | tr '[:lower:]-' '[:upper:]_')"
  formula="${formula//\{\{$placeholder\}\}/$sha}"
done

if printf '%s' "$formula" | grep -q '{{'; then
  echo "unrendered placeholders remain in formula" >&2
  exit 1
fi

printf '%s\n' "$formula"
