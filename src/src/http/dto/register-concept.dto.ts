import { z } from 'zod';

export const registerConceptParamsSchema = z.object({
  name: z.string().min(1),
});

export type RegisterConceptParamsDto = z.infer<typeof registerConceptParamsSchema>;

export const registerConceptBodySchema = z.object({
  accepts: z.array(z.string().min(1)),
  ttl: z.number().int().positive().optional(),
  description: z.string().optional(),
});

export type RegisterConceptBodyDto = z.infer<typeof registerConceptBodySchema>;
