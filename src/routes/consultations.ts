import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const consultationSchema = z.object({
  parentName: z.string().min(1),
  email: z.email(),
  phone: z.string().optional(),
  childName: z.string().optional(),
  childAge: z.string().optional(),
  childGradeLevel: z.string().optional(),
  goals: z.string().min(1),
  challenges: z.string().optional(),
  sourcePage: z.string().default('contact')
});

export const consultationRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/consultations', async (request, reply) => {
    const body = consultationSchema.parse(request.body);

    const result = await fastify.pg.query(
      `insert into consultation_requests (
        parent_name,
        email,
        phone,
        child_name,
        child_age,
        child_grade_level,
        goals,
        challenges,
        source_page
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      returning consultation_request_id, status, created_at`,
      [
        body.parentName,
        body.email,
        body.phone ?? null,
        body.childName ?? null,
        body.childAge ?? null,
        body.childGradeLevel ?? null,
        body.goals,
        body.challenges ?? null,
        body.sourcePage
      ]
    );

    return reply.code(201).send({
      message: 'Consultation request received',
      request: result.rows[0]
    });
  });
};
