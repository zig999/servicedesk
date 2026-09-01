import { z } from 'zod';

export const removeHypothesisParamsSchema = z.object({
  slug: z.string().min(1),
  version: z.coerce.number().int().positive(),
  hypothesis_name: z.string().min(1),
});

export type RemoveHypothesisParamsDto = z.infer<typeof removeHypothesisParamsSchema>;
