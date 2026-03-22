import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const listCoursesQuery = z.object({
  subjectArea: z.string().optional(),
  gradeLevel: z.string().optional(),
  teacherId: z.uuid().optional(),
  activeOnly: z.coerce.boolean().default(true)
});

export const courseRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/courses', async (request) => {
    const query = listCoursesQuery.parse(request.query);
    const values: unknown[] = [];
    const conditions: string[] = [];

    if (query.subjectArea) {
      values.push(query.subjectArea);
      conditions.push(`c.subject_area = $${values.length}`);
    }

    if (query.gradeLevel) {
      values.push(query.gradeLevel);
      conditions.push(`c.grade_level = $${values.length}`);
    }

    if (query.teacherId) {
      values.push(query.teacherId);
      conditions.push(`c.teacher_id = $${values.length}`);
    }

    if (query.activeOnly) {
      conditions.push('c.is_active = true');
    }

    const whereClause = conditions.length ? `where ${conditions.join(' and ')}` : '';

    const result = await fastify.pg.query(
      `select
        c.course_id,
        c.title,
        c.description,
        c.subject_area,
        c.grade_level,
        c.teacher_id,
        c.is_active,
        c.created_at,
        u.display_name as teacher_name
       from courses c
       left join users u on u.user_id = c.teacher_id
       ${whereClause}
       order by c.created_at desc`,
      values
    );

    return result.rows;
  });

  fastify.get('/courses/:courseId', async (request, reply) => {
    const params = z.object({
      courseId: z.uuid()
    }).parse(request.params);

    const courseResult = await fastify.pg.query(
      `select
        c.course_id,
        c.title,
        c.description,
        c.subject_area,
        c.grade_level,
        c.teacher_id,
        c.is_active,
        u.display_name as teacher_name
       from courses c
       left join users u on u.user_id = c.teacher_id
       where c.course_id = $1
       limit 1`,
      [params.courseId]
    );

    const course = courseResult.rows[0];

    if (!course) {
      return reply.notFound('Course not found');
    }

    const lessonsResult = await fastify.pg.query(
      `select
        l.lesson_id,
        l.title,
        l.description,
        l.lesson_type,
        l.subject_area,
        l.grade_level,
        l.estimated_minutes,
        cl.order_in_course
       from course_lessons cl
       join lessons l on l.lesson_id = cl.lesson_id
       where cl.course_id = $1
       order by cl.order_in_course asc`,
      [params.courseId]
    );

    const testsResult = await fastify.pg.query(
      `select test_id, title, description, test_type, max_score, passing_score, time_limit_min
       from tests
       where course_id = $1
       order by created_at desc`,
      [params.courseId]
    );

    return {
      ...course,
      lessons: lessonsResult.rows,
      tests: testsResult.rows
    };
  });
};
