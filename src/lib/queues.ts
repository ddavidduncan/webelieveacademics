import { Queue } from 'bullmq';
import { redisConnection } from './redis.js';

export const aiJobsQueue = new Queue('ai-jobs', {
  connection: redisConnection
});

export const reportsQueue = new Queue('reports', {
  connection: redisConnection
});
