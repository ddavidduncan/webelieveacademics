import RedisModule from 'ioredis';
import { env } from '../config/env.js';

const Redis = RedisModule.default ?? RedisModule;
const redisUrl = new URL(env.REDIS_URL);

export const redisConnection = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port || 6379),
  username: redisUrl.username || undefined,
  password: redisUrl.password || undefined,
  db: redisUrl.pathname ? Number(redisUrl.pathname.slice(1) || 0) : 0
};

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null
});
