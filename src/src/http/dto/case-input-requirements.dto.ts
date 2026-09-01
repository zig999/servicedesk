import { z } from 'zod';

export const caseInputRequirementsParamsSchema = z.object({
  slug: z.string().min(1),
  version: z.coerce.number().int().positive(),
});

export type CaseInputRequirementsParamsDto = z.infer<typeof caseInputRequirementsParamsSchema>;

const capabilityIdentitySchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
});

const caseInputRequirementSchema = z.object({
  attribute: z.string().min(1),
  required: z.boolean(),
  capabilities: z.array(capabilityIdentitySchema).min(1).readonly(),
});

export const caseInputRequirementsResponseSchema = z.object({
  requirements: z.array(caseInputRequirementSchema).readonly(),
  capabilities_with_malformed_input_schema: z.array(capabilityIdentitySchema).readonly(),
});

export type CaseInputRequirementsResponseDto = z.infer<typeof caseInputRequirementsResponseSchema>;
