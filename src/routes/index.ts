import type { FastifyPluginAsync } from 'fastify';
import { adminRoutes } from './admin.js';
import { authRoutes } from './auth.js';
import { courseRoutes } from './courses.js';
import { consultationRoutes } from './consultations.js';
import { dashboardRoutes } from './dashboard.js';
import { healthRoutes } from './health.js';
import { staffRoutes } from './staff.js';
import { standardsRoutes } from './standards.js';
import { studentRoutes } from './students.js';
import { userRoutes } from './users.js';

export const routes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(healthRoutes);
  await fastify.register(consultationRoutes, { prefix: '/api/v1' });
  await fastify.register(authRoutes, { prefix: '/api/v1' });
  await fastify.register(adminRoutes, { prefix: '/api/v1' });
  await fastify.register(userRoutes, { prefix: '/api/v1' });
  await fastify.register(studentRoutes, { prefix: '/api/v1' });
  await fastify.register(staffRoutes, { prefix: '/api/v1' });
  await fastify.register(courseRoutes, { prefix: '/api/v1' });
  await fastify.register(dashboardRoutes, { prefix: '/api/v1' });
  await fastify.register(standardsRoutes, { prefix: '/api/v1' });
};
