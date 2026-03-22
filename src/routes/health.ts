import type { FastifyPluginAsync } from 'fastify';
import { pool } from '../lib/db.js';
import { redis } from '../lib/redis.js';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async () => ({
    status: 'ok',
    service: 'webelieve-api'
  }));

  fastify.get('/ready', async () => {
    await pool.query('select 1');
    await redis.ping();

    return {
      status: 'ready'
    };
  });
};
