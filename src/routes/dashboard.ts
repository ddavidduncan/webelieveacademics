import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

export const dashboardRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/dashboard/student/:studentId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const params = z.object({
      studentId: z.uuid()
    }).parse(request.params);

    const [studentResult, enrollmentsResult, gradesResult, preferencesResult] = await Promise.all([
      fastify.pg.query(
        `select
          u.user_id,
          u.first_name,
          u.last_name,
          u.email,
          u.display_name,
          s.grade_level,
          s.school_name,
          s.parent_id
         from users u
         join students s on s.student_id = u.user_id
         where u.user_id = $1
         limit 1`,
        [params.studentId]
      ),
      fastify.pg.query(
        `select
          e.enrollment_id,
          e.status,
          e.enrollment_date,
          c.course_id,
          c.title,
          c.subject_area,
          c.grade_level
         from student_enrollments e
         join courses c on c.course_id = e.course_id
         where e.student_id = $1
         order by e.enrollment_date desc`,
        [params.studentId]
      ),
      fastify.pg.query(
        `select
          g.grade_id,
          g.assignment_type,
          g.score,
          g.max_score,
          g.percentage,
          g.grade_date,
          t.title as test_title
         from grades g
         left join tests t on t.test_id = g.test_id
         where g.student_id = $1
         order by g.grade_date desc
         limit 10`,
        [params.studentId]
      ),
      fastify.pg.query(
        `select
          slp.subject_area,
          tm.method_name as best_method_name,
          tm.description as best_method_description
         from student_learning_preferences slp
         join teaching_methods tm on tm.method_id = slp.best_method_id
         where slp.student_id = $1
         order by slp.subject_area asc`,
        [params.studentId]
      )
    ]);

    const student = studentResult.rows[0];

    if (!student) {
      return reply.notFound('Student not found');
    }

    return {
      student,
      enrollments: enrollmentsResult.rows,
      recentGrades: gradesResult.rows,
      learningPreferences: preferencesResult.rows
    };
  });
};
