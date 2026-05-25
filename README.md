# whistle backend

Backend monorepo for whistle, an AI agent stable that acts onchain on
X Layer during every World Cup match. Users allocate capital to agents;
the agents take onchain positions on their behalf. Every meaningful agent
action is a transaction.

## Topology

Two apps over a shared Postgres (off-chain state) and Redis (live feed,
pub/sub).

| App | Role |
|---|---|
| `apps/api` | Public HTTP and WebSocket surface. Serves agents, leaderboard, and the capital allocator; reads off-chain state; relays the live feed. Holds no signing keys. |
| `apps/agents` | Autonomous runtime. A per-match scheduler runs the Scout, Bookie, and Manager decision loops, signs and posts onchain via session keys, and writes every decision to Postgres for audit. Singleton. |

The split keeps the public surface away from signing keys and lets the
API scale without duplicating the singleton scheduler.

## The three agents

| Agent | Track | Acts |
|---|---|---|
| Scout | NFT / Moments | Mints commemorative ERC-721 attestations for culturally significant match moments. |
| Bookie | Prediction / Trading | Generates micro-markets, prices them, and takes positions per match. |
| Manager | Fantasy / GameFi | Drafts licensing-clean rosters (nation plus jersey number) and transfers per matchday. |

## Packages

| Package | Purpose |
|---|---|
| `@whistle/types` | Shared TypeScript types. No runtime code. |
| `@whistle/errors` | `AppError`, `ErrorCode`, and the Express error and not-found middleware. |
| `@whistle/config` | Zod-validated env loader. The single legal point of `process.env` access. |
| `@whistle/logger` | Pino instance with PII redaction, plus the HTTP request logger. |
| `@whistle/observability` | Request id, `/healthz`, `/readyz`, and Prometheus `/metrics`. |
| `@whistle/db` | Prisma schema, client factory, and the shared off-chain data model. |
| `@whistle/chain` | viem clients for reading X Layer. |

## Layout

```
backend/
  apps/
    api/        public HTTP and WebSocket
    agents/     autonomous agent runtime
  packages/
    types/  errors/  config/  logger/  observability/  db/  chain/
  infra/
    ports.json
```

## Conventions

- pnpm workspaces and Turborepo. Exact version pins only (no `^` or `~`).
- TypeScript with `strict`, `noUncheckedIndexedAccess`, and
  `exactOptionalPropertyTypes`.
- Five-layer model in every app: routes, controllers, services,
  repositories. Dependencies flow downward only.
- No comments in code. Names and types carry the meaning.
- One env access point (`@whistle/config`), enforced by ESLint.

## Commands

```
pnpm install
pnpm db:generate     # generate the Prisma client (run once after install)
pnpm dev             # run all apps in watch mode
pnpm build
pnpm typecheck
pnpm lint
pnpm test
```

Per app: `pnpm dev:api`, `pnpm dev:agents`.

## CI and deploy

GitHub Actions in `.github/workflows/`:

- `ci.yml` runs on every PR and push to `main`: install, generate the
  Prisma client, then typecheck, lint, test, and build, followed by
  `gitleaks`, `osv-scanner`, and `pnpm audit`.
- `cve-scheduled.yml` re-scans locked dependencies weekly and opens a
  security issue on new findings.
- `deploy-api.yml` and `deploy-agents.yml` build, bundle, and release
  each app to the VPS with an atomic symlink swap and a health gate.
- `rollback.yml` flips an app back to a prior release on demand.
- Renovate (`renovate.json`) pins exact versions and raises upgrade and
  vulnerability PRs.

The deploy mechanics live in [`infra/deploy/README.md`](infra/deploy/README.md).
VPS provisioning is out of scope for this foundation.
