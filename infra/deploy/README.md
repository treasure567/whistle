# Deploy flow

Each app deploys independently with an atomic symlink swap and PM2. The
GitHub workflows build and ship a release; the per-app scripts under
`apps/<app>/deploy/dev/` run on the VPS.

## Pipeline

1. Push to `main` touching an app or one of its packages triggers
   `deploy-<app>.yml` (also runnable via the Actions tab).
2. CI gate runs typecheck, lint, and test for the app.
3. The app is built and `pnpm deploy --prod` bundles its production
   `node_modules`.
4. The release is tarred, copied to the VPS, and extracted under
   `releases/<timestamp>/`.
5. `release.sh` links the shared `.env`, runs `prisma migrate deploy`
   when a schema is bundled, swaps the `current` symlink, restarts PM2,
   and health-checks `/healthz`. A failed health check auto-rolls back.

## Scripts (`apps/<app>/deploy/dev/`)

| Script | Purpose |
|---|---|
| `release.sh` | Atomic release: symlink swap, PM2 restart, health gate. |
| `rollback.sh` | Flip `current` back to a prior release. |
| `health-check.sh` | Poll `/healthz` until healthy or timeout. |
| `prune.sh` | Keep the newest five releases. |

Manual rollback: run the `Manual Rollback` workflow and pick the app.

## VPS layout (per app)

```
<DEPLOY_PATH>/
  releases/<timestamp>/   extracted release (dist, node_modules, deploy)
  current -> releases/<timestamp>
  shared/.env             persistent secrets, symlinked into each release
  shared/logs/            PM2 logs
```

## Required GitHub configuration

Secrets:

- `VPS_HOST`, `VPS_USER`, `VPS_SSH_PASSWORD`

Variables:

- `API_DEPLOY_PATH` (e.g. `htdocs/api.example`)
- `AGENTS_DEPLOY_PATH` (e.g. `htdocs/agents.example`)

Provisioning the VPS (Node, PM2, Postgres, Redis, nginx) is out of scope
for this foundation and lands separately.
