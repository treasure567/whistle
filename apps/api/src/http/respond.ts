import type { Request, Response } from 'express';

export function ok<T>(res: Response, req: Request, data: T): void {
  const requestId = (req as Request & { requestId?: string }).requestId;
  if (requestId) {
    res.json({ ok: true, data, requestId });
  } else {
    res.json({ ok: true, data });
  }
}
