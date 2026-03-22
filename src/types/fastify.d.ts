import type { UserRole } from '../lib/auth.js';
import type { Pool } from 'pg';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: string;
      email: string;
      role: UserRole;
    };
    user: {
      sub: string;
      email: string;
      role: UserRole;
    };
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    pg: Pool;
    authenticate: (request: import('fastify').FastifyRequest, reply: import('fastify').FastifyReply) => Promise<void>;
    authorizeAdmin: (request: import('fastify').FastifyRequest, reply: import('fastify').FastifyReply) => Promise<void>;
  }
}
