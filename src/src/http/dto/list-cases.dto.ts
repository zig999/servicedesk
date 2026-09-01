import { z } from 'zod';

export const listCasesQuerySchema = z.object({
  offset: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export type ListCasesQueryDto = z.infer<typeof listCasesQuerySchema>;
