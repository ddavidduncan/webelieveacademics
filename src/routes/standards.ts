import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const standardsQuery = z.object({
  gradeLevel: z.string().optional(),
  subjectArea: z.string().optional(),
  domain: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().positive().max(250).default(100)
});

export const standardsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/standards', async (request) => {
    const query = standardsQuery.parse(request.query);
    const values: unknown[] = [];
    const conditions: string[] = [];

    if (query.gradeLevel) {
      values.push(query.gradeLevel);
      conditions.push(`grade_level = $${values.length}`);
    }

    if (query.subjectArea) {
      values.push(query.subjectArea);
      conditions.push(`subject_area = $${values.length}`);
    }

    if (query.domain) {
      values.push(query.domain);
      conditions.push(`domain = $${values.length}`);
    }

    if (query.search) {
      values.push(`%${query.search}%`);
      conditions.push(`(standard_identifier ilike $${values.length} or description ilike $${values.length})`);
    }

    values.push(query.limit);
    const whereClause = conditions.length ? `where ${conditions.join(' and ')}` : '';

    const result = await fastify.pg.query(
      `select
        standard_id,
        standard_identifier,
        subject_area,
        grade_level,
        domain,
        description,
        is_current
       from educational_standards
       ${whereClause}
       order by standard_identifier asc
       limit $${values.length}`,
      values
    );

    return result.rows;
  });
};
