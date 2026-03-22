import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { env } from './config/env.js';
import { pool } from './lib/db.js';
import { auth } from './plugins/auth.js';
import { routes } from './routes/index.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL
    }
  });

  const origins = env.CORS_ORIGIN === '*'
    ? true
    : env.CORS_ORIGIN.split(',').map((value) => value.trim());

  await app.register(cors, {
    origin: origins,
    credentials: true
  });

  await app.register(sensible);
  await app.register(auth);

  app.decorate('pg', pool);

  await app.register(routes);

  app.addHook('onClose', async () => {
    await pool.end();
  });

  return app;
}
