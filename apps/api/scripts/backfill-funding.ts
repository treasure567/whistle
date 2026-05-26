/**
 * Backfill the Allocation table from real onchain PositionManager events.
 *
 * The leaderboard's "funded" total sums the Allocation table. New fundings are
 * recorded as they happen, but allocations made before that path existed only
 * live onchain. This script reads every CapitalAllocated / CapitalWithdrawn
 * event since deploy, nets them per (user, agent), and rebuilds the table so
 * the leaderboard reflects the true onchain picture.
 *
 * Idempotent: it deletes the rows for the three agents and re-inserts from
 * chain, so re-running reconciles rather than double-counts.
 *
 *   DATABASE_URL=... pnpm --filter @whistle/api backfill:funding
 *
 * Env (all but DATABASE_URL have testnet defaults):
 *   DATABASE_URL                 Postgres connection (required)
 *   X_LAYER_RPC_URL              default https://testrpc.xlayer.tech/terigon
 *   X_LAYER_CHAIN_ID             default 1952
 *   POSITION_MANAGER_ADDRESS     default 0x91bed7A3ce8940430646BD8cC4AB842a2A470B22
 *   START_BLOCK                  skip deploy-block discovery if set
 */
/* eslint-disable no-console, whistle-internal/no-direct-process-env -- standalone CLI ops tool */
import { createPublicChainClient, positionManagerAbi, type Address } from '@whistle/chain';
import { createPrismaClient, type AgentKind } from '@whistle/db';

const RPC_URL = process.env.X_LAYER_RPC_URL ?? 'https://testrpc.xlayer.tech/terigon';
const CHAIN_ID = Number(process.env.X_LAYER_CHAIN_ID ?? 1952);
const PM_ADDRESS = (process.env.POSITION_MANAGER_ADDRESS ??
  '0x91bed7A3ce8940430646BD8cC4AB842a2A470B22') as Address;
const SPAN = 100n; // public RPC caps eth_getLogs at a 100-block range
const CONCURRENCY = 8;

const AGENT_KIND_BY_ID: Record<number, AgentKind> = { 1: 'SCOUT', 2: 'BOOKIE', 3: 'MANAGER' };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function withRetry<T>(fn: () => Promise<T>, tries = 6): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      await sleep(300 * (i + 1));
    }
  }
  throw lastErr;
}

type Client = ReturnType<typeof createPublicChainClient>;

// Smallest block at which the contract has code = its deploy block.
async function findDeployBlock(client: Client, latest: bigint): Promise<bigint> {
  let lo = 0n;
  let hi = latest;
  let ans = latest;
  while (lo <= hi) {
    const mid = (lo + hi) / 2n;
    const code = await withRetry(() => client.getCode({ address: PM_ADDRESS, blockNumber: mid }));
    if (code && code !== '0x') {
      ans = mid;
      hi = mid - 1n;
    } else {
      lo = mid + 1n;
    }
  }
  return ans;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is required');

  const client = createPublicChainClient({ chainId: CHAIN_ID, rpcUrl: RPC_URL });

  const latest = await withRetry(() => client.getBlockNumber());
  const start = process.env.START_BLOCK
    ? BigInt(process.env.START_BLOCK)
    : await findDeployBlock(client, latest);
  console.log(`chain ${CHAIN_ID} · PositionManager ${PM_ADDRESS}`);
  console.log(`scanning blocks ${start} -> ${latest} (${latest - start} blocks)`);

  const windows: Array<[bigint, bigint]> = [];
  for (let from = start; from <= latest; from += SPAN) {
    const to = from + SPAN - 1n > latest ? latest : from + SPAN - 1n;
    windows.push([from, to]);
  }

  // net[agentId][user] = wei (allocate adds, withdraw subtracts)
  const net = new Map<number, Map<string, bigint>>();
  let alloc = 0;
  let withdraw = 0;

  const scanWindow = async ([fromBlock, toBlock]: [bigint, bigint]) =>
    withRetry(() =>
      client.getContractEvents({ address: PM_ADDRESS, abi: positionManagerAbi, fromBlock, toBlock }),
    );

  for (let i = 0; i < windows.length; i += CONCURRENCY) {
    const batches = await Promise.all(windows.slice(i, i + CONCURRENCY).map(scanWindow));
    for (const logs of batches) {
      for (const log of logs) {
        if (log.eventName !== 'CapitalAllocated' && log.eventName !== 'CapitalWithdrawn') continue;
        const args = log.args as { user?: Address; agentId?: bigint; amount?: bigint };
        if (!args.user || args.agentId === undefined || args.amount === undefined) continue;
        const agentId = Number(args.agentId);
        const user = args.user.toLowerCase();
        const delta = log.eventName === 'CapitalAllocated' ? args.amount : -args.amount;
        if (log.eventName === 'CapitalAllocated') alloc++;
        else withdraw++;
        const byUser = net.get(agentId) ?? new Map<string, bigint>();
        byUser.set(user, (byUser.get(user) ?? 0n) + delta);
        net.set(agentId, byUser);
      }
    }
    process.stdout.write(`  ${Math.min(i + CONCURRENCY, windows.length)}/${windows.length} windows\r`);
  }
  console.log(`\nfound ${alloc} allocate, ${withdraw} withdraw events`);

  console.log('net per agent:');
  for (const [onchainId, kind] of Object.entries(AGENT_KIND_BY_ID)) {
    const byUser = net.get(Number(onchainId));
    const total = byUser ? [...byUser.values()].reduce((s, v) => s + (v > 0n ? v : 0n), 0n) : 0n;
    console.log(`  ${kind}: ${(Number(total) / 1e18).toFixed(4)} OKB across ${byUser?.size ?? 0} funder(s)`);
  }

  if (process.env.DRY_RUN) {
    console.log('DRY_RUN set: skipping database write.');
    return;
  }

  const prisma = createPrismaClient({ databaseUrl });
  const agents = await prisma.agent.findMany();
  const agentIdByKind = new Map<AgentKind, string>(agents.map((a) => [a.kind, a.id]));

  const rows: Array<{ agentId: string; userAddress: string; amount: string; asset: string }> = [];
  const targetAgentDbIds: string[] = [];
  for (const [onchainId, kind] of Object.entries(AGENT_KIND_BY_ID)) {
    const dbId = agentIdByKind.get(kind);
    if (!dbId) {
      console.warn(`no DB agent for kind ${kind}; skipping`);
      continue;
    }
    targetAgentDbIds.push(dbId);
    const byUser = net.get(Number(onchainId));
    if (!byUser) continue;
    for (const [user, wei] of byUser) {
      if (wei <= 0n) continue;
      rows.push({ agentId: dbId, userAddress: user, amount: wei.toString(), asset: 'OKB' });
    }
  }

  await prisma.$transaction([
    prisma.allocation.deleteMany({ where: { agentId: { in: targetAgentDbIds } } }),
    ...(rows.length ? [prisma.allocation.createMany({ data: rows })] : []),
  ]);

  console.log(`wrote ${rows.length} allocation row(s).`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
