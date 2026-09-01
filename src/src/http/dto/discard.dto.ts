import { z } from 'zod';

export const discardParamsSchema = z.object({
  slug: z.string().min(1),
  version: z.coerce.number().int().positive(),
});

export type DiscardParamsDto = z.infer<typeof discardParamsSchema>;
