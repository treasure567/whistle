import { timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';
import { AppError, ErrorCode } from '@whistle/errors';

function matches(provided: string, secret: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function requireServiceAuth(secret: string | undefined): RequestHandler {
  return (req, _res, next) => {
    if (!secret) {
      next();
      return;
    }
    const headerKey = req.header('x-service-auth') ?? '';
    const authorization = req.header('authorization') ?? '';
    const bearer = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
    const provided = headerKey || bearer;
    if (!provided || !matches(provided, secret)) {
      next(new AppError(ErrorCode.UNAUTHORIZED, 'missing or invalid service credentials'));
      return;
    }
    next();
  };
}
