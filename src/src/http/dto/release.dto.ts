import { z } from 'zod';

export const releaseParamsSchema = z.object({
  slug: z.string().min(1),
  version: z.coerce.number().int().positive(),
});

export type ReleaseParamsDto = z.infer<typeof releaseParamsSchema>;
