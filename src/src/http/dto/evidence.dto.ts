import { z } from 'zod';
import { EVIDENCE_RESULTS } from '../../investigation/evidence-result.js';

export const fieldSemanticsSchema = z.object({
  name: z.string(),
  type: z.string().optional(),
  description: z.string().optional(),
});

export const evidenceSchema = z.object({
  concept: z.string().min(1),
  inputs: z.string(),
  observation: z.string(),
  observed_at: z.string().min(1),
  ttl: z.number(),
  origin: z.string(),
  result: z.enum(EVIDENCE_RESULTS),
  result_detail: z.string().optional(),
  capability_name: z.string(),
  capability_version: z.string(),
  elapsed_ms: z.number(),
  fields: z.array(fieldSemanticsSchema).readonly(),
  concept_description: z.string(),
});
