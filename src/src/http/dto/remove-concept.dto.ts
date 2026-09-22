import { z } from 'zod';

export const removeConceptParamsSchema = z.object({
  name: z.string().min(1),
});

export type RemoveConceptParamsDto = z.infer<typeof removeConceptParamsSchema>;
