import { z } from 'zod';
import { CAPABILITY_NATURES } from '../../capability-registry/capability.js';

export const registerCapabilityParamsSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
});

export type RegisterCapabilityParamsDto = z.infer<typeof registerCapabilityParamsSchema>;

export const registerCapabilityBodySchema = z.object({
  nature: z.enum(CAPABILITY_NATURES),
  input_schema: z.string().min(1),
  output_schema: z.string().min(1),
  timeout: z.number().int().positive().optional(),
  connector: z.string().min(1),
  concept: z.string().min(1),
});

export type RegisterCapabilityBodyDto = z.infer<typeof registerCapabilityBodySchema>;
