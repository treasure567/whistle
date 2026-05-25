#!/usr/bin/env bash
set -euo pipefail

RELEASE_ID="${1:?release id required (e.g. 20260524T120000Z)}"
APP_NAME="${APP_NAME:?APP_NAME required (e.g. api)}"

SCRIPT_DIR="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
RELEASE_DIR="$(cd -P "$SCRIPT_DIR/../.." && pwd -P)"
DEPLOY_ROOT="$(cd -P "$RELEASE_DIR/../.." && pwd -P)"
RELEASES_DIR="$DEPLOY_ROOT/releases"
SHARED_ENV="$DEPLOY_ROOT/shared/.env"

if [ ! -d "$RELEASES_DIR/$RELEASE_ID" ]; then
  echo "release dir not found: $RELEASES_DIR/$RELEASE_ID" >&2
  exit 1
fi
if [ ! -f "$SHARED_ENV" ]; then
  echo "shared .env missing at $SHARED_ENV" >&2
  exit 1
fi

ln -sfn "$SHARED_ENV" "$RELEASES_DIR/$RELEASE_ID/.env"

cd "$RELEASES_DIR/$RELEASE_ID"
set -a
. ./.env
set +a
if [ -d prisma ] && [ -x node_modules/.bin/prisma ]; then
  node_modules/.bin/prisma migrate deploy --schema=prisma/schema.prisma
fi

cd "$DEPLOY_ROOT"
ln -sfn "releases/$RELEASE_ID" current.new
mv -Tf current.new current

cd "$DEPLOY_ROOT/current"
# pm2 reload keeps the previous script path across a symlink swap, so it
# would strand the process on the old release; delete then start instead.
pm2 delete "$APP_NAME" 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save

if ! "$DEPLOY_ROOT/current/deploy/dev/health-check.sh"; then
  echo "health check failed; rolling back" >&2
  "$DEPLOY_ROOT/current/deploy/dev/rollback.sh"
  exit 1
fi

"$DEPLOY_ROOT/current/deploy/dev/prune.sh"
echo "deploy complete; current -> $(readlink "$DEPLOY_ROOT/current")"
