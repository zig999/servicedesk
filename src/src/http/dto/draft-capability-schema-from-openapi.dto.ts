import { z } from 'zod';
import { CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_REASONS } from '../../connector-registry/capability-schema-draft.js';

export const draftCapabilitySchemaFromOpenApiRequestSchema = z.object({
  link: z.string().min(1),
  path: z.string().min(1),
  method: z.string().min(1),
});

export type DraftCapabilitySchemaFromOpenApiRequestDto = z.infer<
  typeof draftCapabilitySchemaFromOpenApiRequestSchema
>;

const draftCapabilitySchemaUnresolvedItemResponseSchema = z.object({
  name: z.string(),
  reason: z.enum(CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_REASONS),
});

export const draftCapabilitySchemaFromOpenApiResponseSchema = z.object({
  input_schema: z.string(),
  output_schema: z.string(),
  unresolved: z.array(draftCapabilitySchemaUnresolvedItemResponseSchema),
});

export type DraftCapabilitySchemaFromOpenApiResponseDto = z.infer<
  typeof draftCapabilitySchemaFromOpenApiResponseSchema
>;
