import { z } from 'zod';
import {
  CONNECTOR_CONFIGURATION_DRAFT_READING_NOTE_KINDS,
  CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS,
} from '../../connector-registry/connector-configuration-draft.js';
import { EVIDENCE_RESULTS } from '../../investigation/evidence-result.js';

export const draftConnectorConfigurationFromOpenApiRequestSchema = z.object({
  connector: z.string().min(1),
  link: z.string().min(1),
  path: z.string().min(1),
  method: z.string().min(1),
});

export type DraftConnectorConfigurationFromOpenApiRequestDto = z.infer<
  typeof draftConnectorConfigurationFromOpenApiRequestSchema
>;

const draftUnresolvedItemResponseSchema = z.object({
  name: z.string(),
  reason: z.enum(CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS),
});

const draftGeneratedCredentialResponseSchema = z.object({
  name: z.string(),
  security_scheme: z.string(),
});

const draftMethodMismatchResponseSchema = z.object({
  registered: z.string(),
  operation: z.string(),
});

const draftStatusReadingResponseSchema = z.object({
  status: z.string(),
  ending: z.enum(EVIDENCE_RESULTS),
  declared_as: z.string().optional(),
});

const draftResponseFieldResponseSchema = z.object({
  name: z.string(),
  path: z.string(),
  status: z.string(),
  declared_type: z.string().optional(),
  declared_required: z.boolean().optional(),
  envelope: z.string().optional(),
});

const draftReadingNoteResponseSchema = z.object({
  kind: z.enum(CONNECTOR_CONFIGURATION_DRAFT_READING_NOTE_KINDS),
  subject: z.string(),
  detail: z.string().optional(),
});

export const draftConnectorConfigurationFromOpenApiResponseSchema = z.object({
  connector: z.string(),
  configuration: z.string(),
  unresolved: z.array(draftUnresolvedItemResponseSchema),
  generated_credentials: z.array(draftGeneratedCredentialResponseSchema),
  method_mismatch: draftMethodMismatchResponseSchema.optional(),
  status_readings: z.array(draftStatusReadingResponseSchema),
  response_fields: z.array(draftResponseFieldResponseSchema),
  reading_notes: z.array(draftReadingNoteResponseSchema),
});

export type DraftConnectorConfigurationFromOpenApiResponseDto = z.infer<
  typeof draftConnectorConfigurationFromOpenApiResponseSchema
>;
