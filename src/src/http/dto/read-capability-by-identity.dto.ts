import { z } from 'zod';
import { CAPABILITY_NATURES } from '../../capability-registry/capability.js';

export const readCapabilityByIdentityParamsSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
});

export type ReadCapabilityByIdentityParamsDto = z.infer<typeof readCapabilityByIdentityParamsSchema>;

export const readCapabilityByIdentityResponseSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  nature: z.enum(CAPABILITY_NATURES),
  input_schema: z.string().min(1),
  output_schema: z.string().min(1),
  timeout: z.int().positive(),
  connector: z.string().min(1),
  concept: z.string().min(1),
});

export type ReadCapabilityByIdentityResponseDto = z.infer<typeof readCapabilityByIdentityResponseSchema>;
