#!/usr/bin/env bash
# Downloads the screenshots used by the wiki from the old site (guide.rmux.eu)
# into static/img/guide/. Safe to run more than once: existing files are skipped.
set -euo pipefail

cd "$(dirname "$0")/.."
OLD="https://guide.rmux.eu"
DEST="static/img/guide"

# "path on the old site|path under static/img/guide"
IMAGES=(
  "/assets/screenshot-gentoo.CU6cGykM.png|screenshot-gentoo.png"
  "/assets/uniengine.C8S8fDwB.png|uniengine.png"
  "/images/vcn/vainfo.webp|vcn/vainfo.webp"
)

fail=0
for entry in "${IMAGES[@]}"; do
  src="${entry%%|*}"
  dst="$DEST/${entry##*|}"
  if [ -s "$dst" ]; then
    echo "  ok      $dst"
    continue
  fi
  mkdir -p "$(dirname "$dst")"
  if curl -fsSL "$OLD$src" -o "$dst"; then
    echo "  fetched $dst"
  else
    echo "  FAILED  $OLD$src" >&2
    rm -f "$dst"
    fail=1
  fi
done

exit $fail
