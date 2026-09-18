import { z } from 'zod';

export const registerCapabilityParamsSchema = z.object({
  name: z.string(),
  version: z.string(),
});

export type RegisterCapabilityParamsDto = z.infer<typeof registerCapabilityParamsSchema>;

export const registerCapabilityBodySchema = z.object({
  nature: z.string().optional(),
  input_schema: z.string().optional(),
  output_schema: z.string().optional(),
  timeout: z.number().int().positive().optional(),
  connector: z.string().optional(),
  concept: z.string().optional(),
  payload_notes: z.string().optional(),
});

export type RegisterCapabilityBodyDto = z.infer<typeof registerCapabilityBodySchema>;
