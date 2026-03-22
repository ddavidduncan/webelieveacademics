import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const listUsersQuery = z.object({
  role: z.enum(['student', 'teacher', 'parent', 'admin']).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100)
});

const listConsultationsQuery = z.object({
  status: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50)
});

const consultationParams = z.object({
  consultationRequestId: z.uuid()
});

const consultationStatusBody = z.object({
  status: z.enum(['new', 'in_review', 'contacted', 'scheduled', 'closed'])
});

const userParams = z.object({
  userId: z.uuid()
});

const userStatusBody = z.object({
  isActive: z.boolean()
});

export const adminRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/admin/summary', { preHandler: [fastify.authorizeAdmin] }, async () => {
    const [
      usersByRoleResult,
      consultationCountsResult,
      activeCoursesResult,
      recentUsersResult,
      recentConsultationsResult
    ] = await Promise.all([
      fastify.pg.query(
        `select role, count(*)::int as count
         from users
         group by role
         order by role asc`
      ),
      fastify.pg.query(
        `select status, count(*)::int as count
         from consultation_requests
         group by status
         order by status asc`
      ),
      fastify.pg.query(
        `select count(*)::int as count
         from courses
         where is_active = true`
      ),
      fastify.pg.query(
        `select user_id, email, first_name, last_name, display_name, role, is_active, created_at
         from users
         order by created_at desc
         limit 8`
      ),
      fastify.pg.query(
        `select consultation_request_id, parent_name, email, child_name, status, created_at
         from consultation_requests
         order by created_at desc
         limit 8`
      )
    ]);

    return {
      usersByRole: usersByRoleResult.rows,
      consultationsByStatus: consultationCountsResult.rows,
      activeCourseCount: activeCoursesResult.rows[0]?.count ?? 0,
      recentUsers: recentUsersResult.rows,
      recentConsultations: recentConsultationsResult.rows
    };
  });

  fastify.get('/admin/users', { preHandler: [fastify.authorizeAdmin] }, async (request) => {
    const query = listUsersQuery.parse(request.query);
    const values: unknown[] = [];
    const conditions: string[] = [];

    if (query.role) {
      values.push(query.role);
      conditions.push(`role = $${values.length}`);
    }

    values.push(query.limit);
    const limitPlaceholder = `$${values.length}`;
    const whereClause = conditions.length ? `where ${conditions.join(' and ')}` : '';

    const result = await fastify.pg.query(
      `select user_id, email, first_name, last_name, display_name, role, is_active, created_at, last_login_at
       from users
       ${whereClause}
       order by created_at desc
       limit ${limitPlaceholder}`,
      values
    );

    return {
      count: result.rowCount,
      users: result.rows
    };
  });

  fastify.patch('/admin/users/:userId', { preHandler: [fastify.authorizeAdmin] }, async (request, reply) => {
    const params = userParams.parse(request.params);
    const body = userStatusBody.parse(request.body);

    const result = await fastify.pg.query(
      `update users
       set is_active = $2, updated_at = now()
       where user_id = $1
       returning user_id, email, role, is_active, updated_at`,
      [params.userId, body.isActive]
    );

    if (!result.rowCount) {
      return reply.notFound('User not found');
    }

    return result.rows[0];
  });

  fastify.get('/admin/consultations', { preHandler: [fastify.authorizeAdmin] }, async (request) => {
    const query = listConsultationsQuery.parse(request.query);
    const values: unknown[] = [];
    const conditions: string[] = [];

    if (query.status) {
      values.push(query.status);
      conditions.push(`status = $${values.length}`);
    }

    values.push(query.limit);
    const limitPlaceholder = `$${values.length}`;
    const whereClause = conditions.length ? `where ${conditions.join(' and ')}` : '';

    const result = await fastify.pg.query(
      `select
        consultation_request_id,
        parent_name,
        email,
        phone,
        child_name,
        child_age,
        child_grade_level,
        goals,
        challenges,
        source_page,
        status,
        created_at,
        updated_at
       from consultation_requests
       ${whereClause}
       order by created_at desc
       limit ${limitPlaceholder}`,
      values
    );

    return {
      count: result.rowCount,
      consultations: result.rows
    };
  });

  fastify.patch('/admin/consultations/:consultationRequestId', { preHandler: [fastify.authorizeAdmin] }, async (request, reply) => {
    const params = consultationParams.parse(request.params);
    const body = consultationStatusBody.parse(request.body);

    const result = await fastify.pg.query(
      `update consultation_requests
       set status = $2, updated_at = now()
       where consultation_request_id = $1
       returning consultation_request_id, status, updated_at`,
      [params.consultationRequestId, body.status]
    );

    if (!result.rowCount) {
      return reply.notFound('Consultation request not found');
    }

    return result.rows[0];
  });
};
