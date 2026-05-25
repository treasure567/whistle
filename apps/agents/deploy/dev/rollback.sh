#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:?APP_NAME required (e.g. agents)}"

SCRIPT_DIR="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
DEPLOY_ROOT="$(cd -P "$SCRIPT_DIR/../../../.." && pwd -P)"
RELEASES_DIR="$DEPLOY_ROOT/releases"

TARGET="${1:-}"
if [ -z "$TARGET" ]; then
  TARGET="$(ls -1 "$RELEASES_DIR" | sort -r | sed -n '2p' || true)"
fi

if [ -z "$TARGET" ]; then
  echo "no previous release to roll back to" >&2
  exit 1
fi
if [ ! -d "$RELEASES_DIR/$TARGET" ]; then
  echo "target release does not exist: $RELEASES_DIR/$TARGET" >&2
  exit 1
fi

echo "rolling back to $TARGET"
cd "$DEPLOY_ROOT"
ln -sfn "releases/$TARGET" current.new
mv -Tf current.new current

cd "$DEPLOY_ROOT/current"
pm2 delete "$APP_NAME" 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save

echo "rollback complete; current -> $(readlink "$DEPLOY_ROOT/current")"
