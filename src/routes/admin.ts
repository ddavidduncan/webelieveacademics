import { randomUUID } from 'node:crypto';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { withTransaction } from '../lib/db.js';
import { hashPassword } from '../lib/auth.js';

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

// ── New: admin user creation ──────────────────────────────────────────────────
const createUserBody = z.object({
  email:        z.email(),
  firstName:    z.string().min(1),
  lastName:     z.string().optional(),
  role:         z.enum(['student', 'teacher', 'parent', 'admin']),
  password:     z.string().min(8).optional(),   // optional — not all users need login
  // parent-specific
  phone:          z.string().optional(),
  preferredContact: z.enum(['email', 'phone', 'text']).default('email').optional(),
  // student-specific
  gradeLevel:   z.string().optional(),
  parentId:     z.uuid().optional(),
  schoolName:   z.string().optional(),
  notes:        z.string().optional()
});

const resetPasswordBody = z.object({
  newPassword: z.string().min(8)
});

export const adminRoutes: FastifyPluginAsync = async (fastify) => {

  // ── Summary ──────────────────────────────────────────────────────────────────
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
      usersByRole:           usersByRoleResult.rows,
      consultationsByStatus: consultationCountsResult.rows,
      activeCourseCount:     activeCoursesResult.rows[0]?.count ?? 0,
      recentUsers:           recentUsersResult.rows,
      recentConsultations:   recentConsultationsResult.rows
    };
  });

  // ── List users ────────────────────────────────────────────────────────────────
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

    return { count: result.rowCount, users: result.rows };
  });

  // ── Enable / disable a user ───────────────────────────────────────────────────
  fastify.patch('/admin/users/:userId', { preHandler: [fastify.authorizeAdmin] }, async (request, reply) => {
    const params = userParams.parse(request.params);
    const body   = userStatusBody.parse(request.body);

    const result = await fastify.pg.query(
      `update users
       set is_active = $2, updated_at = now()
       where user_id = $1
       returning user_id, email, role, is_active, updated_at`,
      [params.userId, body.isActive]
    );

    if (!result.rowCount) return reply.notFound('User not found');
    return result.rows[0];
  });

  // ── Create user (any role) ────────────────────────────────────────────────────
  // Supports admin-initiated creation of parents, students, teachers, or admins.
  // Password is optional — accounts without passwords cannot use local login.
  fastify.post('/admin/users', { preHandler: [fastify.authorizeAdmin] }, async (request, reply) => {
    const body = createUserBody.parse(request.body);

    const existing = await fastify.pg.query(
      'select user_id from users where email = $1 limit 1',
      [body.email]
    );
    if (existing.rowCount) {
      return reply.conflict('A user with that email already exists');
    }

    const passwordHash = body.password ? await hashPassword(body.password) : null;

    const user = await withTransaction(async (client) => {
      const userId = randomUUID();

      // Core user record
      await client.query(
        `insert into users (user_id, firebase_uid, email, first_name, last_name, display_name, role)
         values ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId,
          `local:${userId}`,
          body.email,
          body.firstName,
          body.lastName ?? null,
          body.lastName ? `${body.firstName} ${body.lastName}` : body.firstName,
          body.role
        ]
      );

      // Role-specific profile rows
      if (body.role === 'parent') {
        await client.query(
          `insert into parents (parent_id, phone, preferred_contact) values ($1, $2, $3)`,
          [userId, body.phone ?? null, body.preferredContact ?? 'email']
        );
      }

      if (body.role === 'student') {
        await client.query(
          `insert into students (student_id, grade_level, parent_id, school_name, notes)
           values ($1, $2, $3, $4, $5)`,
          [userId, body.gradeLevel ?? null, body.parentId ?? null, body.schoolName ?? null, body.notes ?? null]
        );
      }

      // Optional local credentials
      if (passwordHash) {
        await client.query(
          `insert into auth_local_credentials (user_id, password_hash) values ($1, $2)`,
          [userId, passwordHash]
        );
      }

      const result = await client.query(
        `select user_id, email, first_name, last_name, role, is_active, created_at
         from users where user_id = $1`,
        [userId]
      );

      return result.rows[0]!;
    });

    return reply.code(201).send(user);
  });

  // ── Reset a user's password ───────────────────────────────────────────────────
  fastify.patch('/admin/users/:userId/reset-password', { preHandler: [fastify.authorizeAdmin] }, async (request, reply) => {
    const params = userParams.parse(request.params);
    const body   = resetPasswordBody.parse(request.body);

    // Verify user exists
    const userResult = await fastify.pg.query(
      'select user_id from users where user_id = $1 limit 1',
      [params.userId]
    );
    if (!userResult.rowCount) return reply.notFound('User not found');

    const newHash = await hashPassword(body.newPassword);

    // Upsert — create credentials row if none exists, otherwise update
    await fastify.pg.query(
      `insert into auth_local_credentials (user_id, password_hash, password_updated_at)
       values ($1, $2, now())
       on conflict (user_id) do update
         set password_hash = excluded.password_hash,
             password_updated_at = now()`,
      [params.userId, newHash]
    );

    return { ok: true, userId: params.userId };
  });

  // ── List all students (admin view — not parent-scoped) ────────────────────────
  fastify.get('/admin/students', { preHandler: [fastify.authorizeAdmin] }, async () => {
    const result = await fastify.pg.query(
      `select
        u.user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.display_name,
        u.is_active,
        u.created_at,
        s.grade_level,
        s.school_name,
        s.parent_id,
        p.first_name  as parent_first_name,
        p.last_name   as parent_last_name,
        p.email       as parent_email
       from students s
       join users u  on u.user_id  = s.student_id
       left join users p on p.user_id = s.parent_id
       order by u.first_name asc, u.last_name asc`
    );

    return { count: result.rowCount, students: result.rows };
  });

  // ── List consultations ────────────────────────────────────────────────────────
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

    return { count: result.rowCount, consultations: result.rows };
  });

  // ── Update consultation status ────────────────────────────────────────────────
  fastify.patch('/admin/consultations/:consultationRequestId', { preHandler: [fastify.authorizeAdmin] }, async (request, reply) => {
    const params = consultationParams.parse(request.params);
    const body   = consultationStatusBody.parse(request.body);

    const result = await fastify.pg.query(
      `update consultation_requests
       set status = $2, updated_at = now()
       where consultation_request_id = $1
       returning consultation_request_id, status, updated_at`,
      [params.consultationRequestId, body.status]
    );

    if (!result.rowCount) return reply.notFound('Consultation request not found');
    return result.rows[0];
  });
};
