import { z } from 'zod';

export const listCapabilitiesQuerySchema = z.object({
  offset: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export type ListCapabilitiesQueryDto = z.infer<typeof listCapabilitiesQuerySchema>;
