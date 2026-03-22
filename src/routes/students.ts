import { randomUUID } from 'node:crypto';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { withTransaction } from '../lib/db.js';

const createStudentSchema = z.object({
  email: z.email(),
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  displayName: z.string().optional(),
  gradeLevel: z.string().optional(),
  dateOfBirth: z.string().date().optional(),
  parentId: z.uuid().optional(),
  schoolName: z.string().optional(),
  notes: z.string().optional()
});

export const studentRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/students', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const body = createStudentSchema.parse(request.body);

    const existing = await fastify.pg.query('select user_id from users where email = $1 limit 1', [body.email]);
    if (existing.rowCount) {
      return reply.conflict('A user with that email already exists');
    }

    const student = await withTransaction(async (client) => {
      const userId = randomUUID();

      await client.query(
        `insert into users (
          user_id, firebase_uid, email, first_name, last_name, display_name, role
        ) values ($1, $2, $3, $4, $5, $6, 'student')`,
        [userId, `local:${userId}`, body.email, body.firstName, body.lastName ?? null, body.displayName ?? body.firstName]
      );

      await client.query(
        `insert into students (
          student_id, grade_level, date_of_birth, parent_id, school_name, notes
        ) values ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          body.gradeLevel ?? null,
          body.dateOfBirth ?? null,
          body.parentId ?? request.user.sub,
          body.schoolName ?? null,
          body.notes ?? null
        ]
      );

      const result = await client.query(
        `select u.user_id, u.email, u.first_name, u.last_name, s.grade_level, s.parent_id
         from users u
         join students s on s.student_id = u.user_id
         where u.user_id = $1`,
        [userId]
      );

      return result.rows[0]!;
    });

    return reply.code(201).send(student);
  });

  fastify.get('/students/:studentId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const params = z.object({
      studentId: z.uuid()
    }).parse(request.params);

    const result = await fastify.pg.query(
      `select
        u.user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.display_name,
        s.grade_level,
        s.date_of_birth,
        s.parent_id,
        s.school_name,
        s.notes
       from users u
       join students s on s.student_id = u.user_id
       where u.user_id = $1
       limit 1`,
      [params.studentId]
    );

    return result.rows[0] ?? reply.notFound('Student not found');
  });

  fastify.get('/parents/me/students', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'parent' && request.user.role !== 'admin') {
      return reply.forbidden('Only parents or admins can view parent-linked students');
    }

    const result = await fastify.pg.query(
      `select
        u.user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.display_name,
        s.grade_level,
        s.school_name,
        s.parent_id
       from students s
       join users u on u.user_id = s.student_id
       where s.parent_id = $1
       order by u.first_name asc, u.last_name asc`,
      [request.user.sub]
    );

    return {
      count: result.rows.length,
      students: result.rows
    };
  });
};
