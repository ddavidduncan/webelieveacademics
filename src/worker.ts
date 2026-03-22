import { Worker } from 'bullmq';
import { env } from './config/env.js';
import { redisConnection } from './lib/redis.js';

const aiWorker = new Worker(
  'ai-jobs',
  async (job) => {
    console.log(`[ai-jobs] received ${job.name}`, job.data);
    return {
      status: 'queued-for-implementation'
    };
  },
  { connection: redisConnection }
);

const reportsWorker = new Worker(
  'reports',
  async (job) => {
    console.log(`[reports] received ${job.name}`, job.data);
    return {
      status: 'queued-for-implementation'
    };
  },
  { connection: redisConnection }
);

for (const worker of [aiWorker, reportsWorker]) {
  worker.on('failed', (job, error) => {
    console.error(`[${job?.queueName}] job failed`, error);
  });
}

console.log(`Webelieve worker running in ${env.NODE_ENV}`);
