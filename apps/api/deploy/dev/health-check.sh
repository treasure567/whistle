#!/usr/bin/env bash
set -euo pipefail

HEALTH_URL="${HEALTH_URL:?HEALTH_URL required (e.g. http://127.0.0.1:4000/healthz)}"
ATTEMPTS="${ATTEMPTS:-10}"
DELAY="${DELAY:-2}"

for i in $(seq 1 "$ATTEMPTS"); do
  if curl -fsS --max-time 3 "$HEALTH_URL" >/dev/null 2>&1; then
    echo "health check passed: $HEALTH_URL (attempt $i)"
    exit 0
  fi
  sleep "$DELAY"
done

echo "health check failed: $HEALTH_URL after $ATTEMPTS attempts" >&2
exit 1
