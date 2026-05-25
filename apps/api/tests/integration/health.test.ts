import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createPrismaClient } from '@whistle/db';
import { createApp } from '@/app.js';

const prisma = createPrismaClient({
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://test:test@127.0.0.1:5432/whistle_test',
});

describe('health endpoints', () => {
  it('GET /healthz returns 200', async () => {
    const app = await createApp({ prisma });
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true });
  });

  it('GET /readyz returns 200 when no checks are registered', async () => {
    const app = await createApp({ prisma });
    const res = await request(app).get('/readyz');
    expect(res.status).toBe(200);
  });

  it('GET on an unknown route returns 404 with an error shape', async () => {
    const app = await createApp({ prisma });
    const res = await request(app).get('/v1/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ ok: false, code: 'NOT_FOUND' });
  });
});
