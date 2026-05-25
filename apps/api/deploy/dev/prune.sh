#!/usr/bin/env bash
set -euo pipefail

KEEP="${KEEP:-5}"

SCRIPT_DIR="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
DEPLOY_ROOT="$(cd -P "$SCRIPT_DIR/../../../.." && pwd -P)"
RELEASES_DIR="$DEPLOY_ROOT/releases"

cd "$RELEASES_DIR"
TO_DELETE="$(ls -1 | sort -r | tail -n +$((KEEP + 1)) || true)"

if [ -z "$TO_DELETE" ]; then
  echo "nothing to prune (keeping $KEEP)"
  exit 0
fi

echo "$TO_DELETE" | while IFS= read -r dir; do
  [ -z "$dir" ] && continue
  echo "removing old release: $dir"
  rm -rf -- "$dir"
done

echo "pruned, kept newest $KEEP"
