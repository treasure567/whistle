import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '@/app.js';

describe('health endpoints', () => {
  it('GET /healthz returns 200', async () => {
    const app = await createApp();
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true });
  });

  it('GET /readyz returns 200 when no checks are registered', async () => {
    const app = await createApp();
    const res = await request(app).get('/readyz');
    expect(res.status).toBe(200);
  });
});
