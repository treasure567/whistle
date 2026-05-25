# `@whistle/agents`

The autonomous agent runtime. A per-match scheduler drives the Scout,
Bookie, and Manager decision loops: each loop reads match data, calls an
LLM under a strict tool-use schema, signs and posts the resulting action
onchain on X Layer via a session key, and writes the full decision
(prompt, response, action, transaction hash) to Postgres for audit.

This service is a singleton. Running more than one instance would double
post agent transactions onchain. It exposes only health, readiness, and
metrics over HTTP; it serves no public traffic and holds the signing
secrets the API never sees.

## Structure

```
server.ts       boots the health server and the scheduler
app.ts          health, readiness, and metrics only
config.ts        env: chain RPC, signer key, LLM keys, match data key
scheduler.ts    registers and drives the per-match agent loops
```

The three agent loops attach to the scheduler. None are registered yet.

## Commands

```
pnpm --filter @whistle/agents dev
pnpm --filter @whistle/agents build
pnpm --filter @whistle/agents test:integration
```

Copy `.env.example` to `.env` before running locally.
