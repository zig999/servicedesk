import { z } from 'zod';

export const listConceptsQuerySchema = z.object({
  offset: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export type ListConceptsQueryDto = z.infer<typeof listConceptsQuerySchema>;
