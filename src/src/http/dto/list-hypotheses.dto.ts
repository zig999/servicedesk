import { z } from 'zod';

export const listHypothesesParamsSchema = z.object({
  slug: z.string().min(1),
});

export type ListHypothesesParamsDto = z.infer<typeof listHypothesesParamsSchema>;

export const listHypothesesQuerySchema = z.object({
  offset: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export type ListHypothesesQueryDto = z.infer<typeof listHypothesesQuerySchema>;
