import { z } from 'zod';

export const removeCapabilityParamsSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
});

export type RemoveCapabilityParamsDto = z.infer<typeof removeCapabilityParamsSchema>;
