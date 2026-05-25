import type { Request, RequestHandler, Response } from 'express';
import { AGENT_FEED_CHANNEL, LIVE_FEED_CHANNEL } from '@whistle/types';
import type { Redis } from './redis.js';

export type LiveFeed = {
  handler: RequestHandler;
  start: () => Promise<void>;
  close: () => Promise<void>;
};

const CHANNELS = [LIVE_FEED_CHANNEL, AGENT_FEED_CHANNEL];

export function createLiveFeed(subscriber: Redis): LiveFeed {
  const clients = new Set<Response>();

  const broadcast = (channel: string, message: string) => {
    const frame = `event: ${channel}\ndata: ${message}\n\n`;
    for (const client of clients) {
      client.write(frame);
    }
  };

  return {
    async start() {
      subscriber.on('message', broadcast);
      await subscriber.subscribe(...CHANNELS);
    },

    handler: (req: Request, res: Response) => {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      });
      res.write(`event: ready\ndata: ${JSON.stringify({ channels: CHANNELS })}\n\n`);
      clients.add(res);
      req.on('close', () => {
        clients.delete(res);
      });
    },

    async close() {
      for (const client of clients) client.end();
      clients.clear();
      await subscriber.quit().catch(() => undefined);
    },
  };
}
