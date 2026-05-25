# `@whistle/api`

Public HTTP and WebSocket surface for whistle. Serves the agent pages,
leaderboard, and capital allocator; reads off-chain state from Postgres;
relays the live feed from Redis. Holds no signing keys and makes no
onchain transactions.

## Layers

```
routes/        URL to controller binding, mounted under /v1
controllers/   thin HTTP logic; parse, call one service, format
services/       business logic; framework-agnostic
repositories/  data access via @whistle/db
```

Dependencies flow downward only.

## Endpoints (foundation)

- `GET /healthz` liveness
- `GET /readyz` readiness
- `GET /metrics` Prometheus exposition
- `/v1` application router (empty until the first resource lands)

## Commands

```
pnpm --filter @whistle/api dev
pnpm --filter @whistle/api build
pnpm --filter @whistle/api test:integration
```

Copy `.env.example` to `.env` before running locally.
