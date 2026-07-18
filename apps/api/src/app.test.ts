import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from './app.js';

describe('API health', () => {
  it('returns an operational status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
