import { z } from 'zod';

export const listHypothesisRevisionsParamsSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
});

export type ListHypothesisRevisionsParamsDto = z.infer<typeof listHypothesisRevisionsParamsSchema>;

export const listHypothesisRevisionsQuerySchema = z.object({
  offset: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export type ListHypothesisRevisionsQueryDto = z.infer<typeof listHypothesisRevisionsQuerySchema>;
