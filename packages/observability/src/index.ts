import { Router, type Request, type RequestHandler } from 'express';
import { ulid } from 'ulidx';
import { Registry, collectDefaultMetrics } from 'prom-client';

type WithRequestId = Request & { requestId?: string };

export function initTelemetry(_serviceName: string): void {
  return;
}

export const requestIdMiddleware: RequestHandler = (req, res, next) => {
  const incoming = req.headers['x-request-id'];
  const id = typeof incoming === 'string' && incoming.length > 0 ? incoming : ulid();
  (req as WithRequestId).requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
};

export function healthRouter(): Router {
  const router = Router();
  router.get('/', (_req, res) => {
    res.status(200).json({ ok: true });
  });
  return router;
}

export type ReadinessCheck = {
  name: string;
  check: () => Promise<boolean>;
  optional?: boolean;
};

export function readyRouter(checks: ReadinessCheck[]): Router {
  const router = Router();
  router.get('/', async (_req, res) => {
    const failedRequired: string[] = [];
    const degraded: string[] = [];
    await Promise.all(
      checks.map(async (c) => {
        let ok = false;
        try {
          ok = await c.check();
        } catch {
          ok = false;
        }
        if (ok) return;
        if (c.optional) degraded.push(c.name);
        else failedRequired.push(c.name);
      }),
    );
    if (failedRequired.length === 0) {
      res.status(200).json({ ok: true, ...(degraded.length > 0 ? { degraded } : {}) });
    } else {
      res
        .status(503)
        .json({ ok: false, failed: failedRequired, ...(degraded.length > 0 ? { degraded } : {}) });
    }
  });
  return router;
}

const metricsRegistry = new Registry();
collectDefaultMetrics({ register: metricsRegistry });

export function metricsRouter(): Router {
  const router = Router();
  router.get('/', async (_req, res, next) => {
    try {
      res.setHeader('Content-Type', metricsRegistry.contentType);
      res.send(await metricsRegistry.metrics());
    } catch (err) {
      next(err);
    }
  });
  return router;
}

export { metricsRegistry };
