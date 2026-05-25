import type { Logger } from '@whistle/logger';
import type { MatchIngestion } from './services/match-ingestion.js';
import type { AgentRunner } from './services/agent-runner.js';

export type SchedulerDeps = {
  log: Logger;
  ingestion: MatchIngestion | undefined;
  agentRunner: AgentRunner | undefined;
  livePollMs: number;
  fixturesSyncMs: number;
  agentTickMs: number;
};

export type SchedulerHandle = {
  stop: () => Promise<void>;
};

export async function startScheduler(deps: SchedulerDeps): Promise<SchedulerHandle> {
  const { log, ingestion, agentRunner, livePollMs, fixturesSyncMs, agentTickMs } = deps;
  const timers: NodeJS.Timeout[] = [];

  if (ingestion) {
    let syncing = false;
    let polling = false;
    const runSync = async () => {
      if (syncing) return;
      syncing = true;
      try {
        const result = await ingestion.syncFixtures();
        log.info({ fixtures: result.fixtures }, 'fixtures synced');
      } catch (err) {
        log.error({ err }, 'fixtures sync failed');
      } finally {
        syncing = false;
      }
    };
    const runPoll = async () => {
      if (polling) return;
      polling = true;
      try {
        const result = await ingestion.pollLive();
        if (result.eventsPublished > 0) {
          log.info(result, 'live events published');
        }
      } catch (err) {
        log.error({ err }, 'live poll failed');
      } finally {
        polling = false;
      }
    };
    await runSync();
    timers.push(setInterval(() => void runSync(), fixturesSyncMs));
    timers.push(setInterval(() => void runPoll(), livePollMs));
  } else {
    log.warn({}, 'match ingestion disabled (set API_FOOTBALL_KEY to enable)');
  }

  if (agentRunner) {
    let running = false;
    const runAgents = async () => {
      if (running) return;
      running = true;
      try {
        const result = await agentRunner.runTick();
        if (result.decisions > 0) {
          log.info(result, 'agent decisions recorded');
        }
      } catch (err) {
        log.error({ err }, 'agent tick failed');
      } finally {
        running = false;
      }
    };
    timers.push(setInterval(() => void runAgents(), agentTickMs));
  } else {
    log.warn({}, 'agent runner disabled (set ANTHROPIC_API_KEY or OPENAI_API_KEY to enable)');
  }

  log.info(
    { livePollMs, fixturesSyncMs, agentTickMs, ingestion: Boolean(ingestion), agents: Boolean(agentRunner) },
    'scheduler started',
  );

  return {
    stop: async () => {
      for (const timer of timers) clearInterval(timer);
      log.info({}, 'scheduler stopped');
    },
  };
}
