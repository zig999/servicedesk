import { z } from 'zod';
import { CAPABILITY_NATURES } from '../../capability-registry/capability.js';

export const readCapabilityParamsSchema = z.object({
  concept: z.string().min(1),
});

export type ReadCapabilityParamsDto = z.infer<typeof readCapabilityParamsSchema>;

export const readCapabilityResponseSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  nature: z.enum(CAPABILITY_NATURES),
  input_schema: z.string().min(1),
  output_schema: z.string().min(1),
  timeout: z.int().positive(),
  connector: z.string().min(1),
  concept: z.string().min(1),
});

export type ReadCapabilityResponseDto = z.infer<typeof readCapabilityResponseSchema>;
