import { randomUUID } from 'node:crypto';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { withTransaction } from '../lib/db.js';
import { hashPassword, verifyPassword } from '../lib/auth.js';

const registerParentSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  displayName: z.string().optional(),
  phone: z.string().optional(),
  preferredContact: z.enum(['email', 'phone', 'text']).default('email')
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8)
});

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/auth/register-parent', async (request, reply) => {
    const body = registerParentSchema.parse(request.body);

    const existing = await fastify.pg.query<{ user_id: string }>(
      'select user_id from users where email = $1 limit 1',
      [body.email]
    );

    if (existing.rowCount) {
      return reply.conflict('A user with that email already exists');
    }

    const passwordHash = await hashPassword(body.password);

    const user = await withTransaction(async (client) => {
      const userId = randomUUID();

      await client.query(
        `insert into users (
          user_id, firebase_uid, email, first_name, last_name, display_name, role
        ) values ($1, $2, $3, $4, $5, $6, 'parent')`,
        [userId, `local:${userId}`, body.email, body.firstName, body.lastName ?? null, body.displayName ?? body.firstName]
      );

      await client.query(
        `insert into parents (parent_id, phone, preferred_contact)
         values ($1, $2, $3)`,
        [userId, body.phone ?? null, body.preferredContact]
      );

      await client.query(
        `insert into auth_local_credentials (user_id, password_hash)
         values ($1, $2)`,
        [userId, passwordHash]
      );

      const result = await client.query<{
        user_id: string;
        email: string;
        role: 'parent';
        first_name: string;
        last_name: string | null;
      }>(
        'select user_id, email, role, first_name, last_name from users where user_id = $1',
        [userId]
      );

      return result.rows[0]!;
    });

    const token = await reply.jwtSign({
      sub: user.user_id,
      email: user.email,
      role: user.role
    });

    return reply.code(201).send({
      token,
      user
    });
  });

  fastify.post('/auth/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);

    const result = await fastify.pg.query<{
      user_id: string;
      email: string;
      role: 'student' | 'teacher' | 'parent' | 'admin';
      first_name: string;
      last_name: string | null;
      password_hash: string;
      is_active: boolean;
    }>(
      `select
        u.user_id,
        u.email,
        u.role,
        u.first_name,
        u.last_name,
        u.is_active,
        c.password_hash
       from users u
       join auth_local_credentials c on c.user_id = u.user_id
       where u.email = $1
       limit 1`,
      [body.email]
    );

    const user = result.rows[0];

    if (!user || !user.is_active) {
      return reply.unauthorized('Invalid credentials');
    }

    const isValid = await verifyPassword(body.password, user.password_hash);

    if (!isValid) {
      return reply.unauthorized('Invalid credentials');
    }

    await fastify.pg.query(
      'update users set last_login_at = now(), updated_at = now() where user_id = $1',
      [user.user_id]
    );

    const token = await reply.jwtSign({
      sub: user.user_id,
      email: user.email,
      role: user.role
    });

    return {
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name
      }
    };
  });

  fastify.get('/auth/me', { preHandler: [fastify.authenticate] }, async (request) => {
    const result = await fastify.pg.query(
      `select user_id, email, role, first_name, last_name, display_name, avatar_url, is_active, created_at
       from users
       where user_id = $1
       limit 1`,
      [request.user.sub]
    );

    return result.rows[0] ?? null;
  });
};
