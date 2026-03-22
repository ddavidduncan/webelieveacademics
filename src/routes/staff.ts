import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

export const staffRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/teachers', async (request) => {
    const query = z.object({
      subjectArea: z.string().optional()
    }).parse(request.query);

    const values: unknown[] = [];
    let whereClause = '';

    if (query.subjectArea) {
      values.push(`%${query.subjectArea}%`);
      whereClause = `where t.subject_specialty ilike $${values.length}`;
    }

    const activeClause = whereClause ? 'and u.is_active = true' : 'where u.is_active = true';

    const result = await fastify.pg.query(
      `select
        u.user_id as teacher_id,
        u.first_name,
        u.last_name,
        u.display_name,
        u.email,
        t.subject_specialty,
        t.bio,
        t.certification
       from teachers t
       join users u on u.user_id = t.teacher_id
       ${whereClause}
       ${activeClause}
       order by u.first_name asc, u.last_name asc`,
      values
    );

    return result.rows;
  });
};
