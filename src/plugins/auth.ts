import fastifyJwt from '@fastify/jwt';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { env } from '../config/env.js';

const authPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET
  });

  fastify.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.unauthorized('Authentication required');
    }
  });

  fastify.decorate('authorizeAdmin', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.unauthorized('Authentication required');
    }

    if (request.user.role !== 'admin') {
      return reply.forbidden('Admin access required');
    }
  });
};

export const auth = fp(authPlugin);
