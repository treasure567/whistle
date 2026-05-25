import { pino, type Logger } from 'pino';
import { pinoHttp, type HttpLogger } from 'pino-http';
import type { IncomingMessage, ServerResponse } from 'node:http';

const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-api-key"]',
  'req.body.privateKey',
  'req.body.signerKey',
  'req.body.sessionKey',
  'req.body.mnemonic',
  'req.body.apiKey',
  'res.body.token',
  'res.body.accessToken',
  'res.body.refreshToken',
];

function serializeHttpReq(req: IncomingMessage) {
  const extended = req as IncomingMessage & { id?: string | number };
  const socket = req.socket;
  return {
    id: extended.id,
    method: req.method,
    url: req.url,
    headers: {
      host: req.headers['host'],
      'content-type': req.headers['content-type'],
      'x-request-id': req.headers['x-request-id'],
    },
    remoteAddress: socket?.remoteAddress,
    remotePort: socket?.remotePort,
  };
}

function serializeHttpRes(res: ServerResponse) {
  return { statusCode: res.statusCode };
}

export function createLogger(serviceName: string): Logger {
  return pino({
    base: { service: serviceName },
    redact: { paths: REDACT_PATHS, remove: true },
    timestamp: pino.stdTimeFunctions.isoTime,
  });
}

export const httpLogger: HttpLogger = pinoHttp({
  logger: createLogger('http'),
  serializers: {
    req: serializeHttpReq,
    res: serializeHttpRes,
  },
  customProps: (req) => ({
    requestId: (req as { requestId?: string }).requestId,
  }),
});

export type { Logger };
