import type { ErrorRequestHandler, Request, RequestHandler } from 'express';
import { ErrorCode, type ApiError } from '@whistle/types';

export { ErrorCode };

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  INTERNAL: 500,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  VALIDATION: 422,
  CHAIN_ERROR: 502,
  AGENT_ERROR: 500,
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;

  constructor(code: ErrorCode, message: string, status?: number) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status ?? STATUS_BY_CODE[code] ?? 500;
  }
}

export function toApiError(err: unknown, requestId?: string): ApiError {
  const base =
    err instanceof AppError
      ? { ok: false as const, code: err.code, message: err.message }
      : { ok: false as const, code: ErrorCode.INTERNAL, message: 'Internal server error' };
  return requestId ? { ...base, requestId } : base;
}

export const errorMiddleware: ErrorRequestHandler = (err, req: Request, res, _next) => {
  const requestId = (req as Request & { requestId?: string }).requestId;
  if (err instanceof AppError) {
    if (err.status >= 500) {
      console.error('[errorMiddleware] AppError 5xx', {
        requestId,
        path: req.path,
        code: err.code,
        message: err.message,
      });
    }
    res.status(err.status).json(toApiError(err, requestId));
    return;
  }
  console.error('[errorMiddleware] unhandled', {
    requestId,
    path: req.path,
    method: req.method,
    name: err instanceof Error ? err.name : typeof err,
    message: err instanceof Error ? err.message : String(err),
  });
  res.status(500).json(toApiError(err, requestId));
};

export const notFoundMiddleware: RequestHandler = (req, res) => {
  const requestId = (req as Request & { requestId?: string }).requestId;
  const err = new AppError(ErrorCode.NOT_FOUND, `route not found: ${req.method} ${req.originalUrl}`);
  res.status(err.status).json(toApiError(err, requestId));
};
