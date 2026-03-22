import type { FastifyPluginAsync } from 'fastify';

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/users', { preHandler: [fastify.authorizeAdmin] }, async () => {
    const result = await fastify.pg.query(
      `select user_id, email, first_name, last_name, display_name, role, is_active, created_at
       from users
       order by created_at desc
       limit 100`
    );

    return result.rows;
  });
};
