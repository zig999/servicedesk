import { z } from 'zod';

export const readConceptParamsSchema = z.object({
  name: z.string().min(1),
});

export type ReadConceptParamsDto = z.infer<typeof readConceptParamsSchema>;

export const readConceptResponseSchema = z.object({
  name: z.string().min(1),
  accepts: z.array(z.string().min(1)).readonly(),
  ttl: z.int().positive(),
  description: z.string(),
});

export type ReadConceptResponseDto = z.infer<typeof readConceptResponseSchema>;
