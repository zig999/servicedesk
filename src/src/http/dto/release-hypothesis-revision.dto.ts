import { z } from 'zod';

export const releaseHypothesisRevisionParamsSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  revision: z.coerce.number().int().positive(),
});

export type ReleaseHypothesisRevisionParamsDto = z.infer<typeof releaseHypothesisRevisionParamsSchema>;
