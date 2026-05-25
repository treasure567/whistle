import express, { type Express } from 'express';
import helmet from 'helmet';
import {
  requestIdMiddleware,
  healthRouter,
  readyRouter,
  metricsRouter,
  type ReadinessCheck,
} from '@whistle/observability';
import { httpLogger } from '@whistle/logger';
import { errorMiddleware, notFoundMiddleware } from '@whistle/errors';

export type AppDeps = {
  readinessChecks?: ReadinessCheck[];
};

export async function createApp(deps: AppDeps = {}): Promise<Express> {
  const app = express();

  app.use(helmet());
  app.use(requestIdMiddleware);
  app.use(httpLogger);

  app.use('/healthz', healthRouter());
  app.use('/readyz', readyRouter(deps.readinessChecks ?? []));
  app.use('/metrics', metricsRouter());

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
