import { z } from 'zod';

export const placeHypothesisParamsSchema = z.object({
  slug: z.string().min(1),
  version: z.coerce.number().int().positive(),
  hypothesis_name: z.string().min(1),
});

export type PlaceHypothesisParamsDto = z.infer<typeof placeHypothesisParamsSchema>;

export const placeHypothesisBodySchema = z.object({
  revision: z.number().int().positive(),
  position: z.number().int().positive(),
});

export type PlaceHypothesisBodyDto = z.infer<typeof placeHypothesisBodySchema>;
