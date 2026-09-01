import { z } from 'zod';

export const listCaseVersionsParamsSchema = z.object({
  slug: z.string().min(1),
});

export type ListCaseVersionsParamsDto = z.infer<typeof listCaseVersionsParamsSchema>;

export const listCaseVersionsQuerySchema = z.object({
  offset: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export type ListCaseVersionsQueryDto = z.infer<typeof listCaseVersionsQuerySchema>;
