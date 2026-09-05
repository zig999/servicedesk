import { z } from 'zod';
import { EVALUATION_REASONS } from '../../investigation/evaluation-reason.js';
import { VERDICTS } from '../../investigation/verdict.js';
import { evidenceSchema } from './evidence.dto.js';

const subjectAttributeValueSchema = z.object({
  attribute: z.string().min(1),
  value: z.string().min(1),
});

const subjectSchema = z.object({
  type: z.string().min(1),
  attributes: z.array(subjectAttributeValueSchema).min(1),
});

const caseRefSchema = z.object({
  slug: z.string().min(1),
  version: z.int().positive(),
});

export const simulateHypothesisRequestSchema = z.object({
  case: caseRefSchema,
  subject: subjectSchema,
  requester: z.string().min(1),
  hypothesis: z.string().min(1),
});

export type SimulateHypothesisRequestDto = z.infer<typeof simulateHypothesisRequestSchema>;

const citationSchema = z.object({
  concept: z.string().min(1),
  field: z.string().min(1).optional(),
});

const usageSchema = z.object({
  input_tokens: z.number(),
  output_tokens: z.number(),
});

const [CONFIRMED_VERDICT, REFUTED_VERDICT, INCONCLUSIVE_VERDICT] = VERDICTS;

const evaluationSchema = z.discriminatedUnion('verdict', [
  z.object({
    hypothesis: z.string().min(1),
    verdict: z.literal(CONFIRMED_VERDICT),
    citations: z.array(citationSchema).min(1).readonly(),
    usage: usageSchema.optional(),
    elapsed_ms: z.number().optional(),
    prompt: z.string().optional(),
  }),
  z.object({
    hypothesis: z.string().min(1),
    verdict: z.literal(REFUTED_VERDICT),
    citations: z.array(citationSchema).min(1).readonly(),
    usage: usageSchema.optional(),
    elapsed_ms: z.number().optional(),
    prompt: z.string().optional(),
  }),
  z.object({
    hypothesis: z.string().min(1),
    verdict: z.literal(INCONCLUSIVE_VERDICT),
    reason: z.enum(EVALUATION_REASONS),
    citations: z.array(citationSchema).readonly(),
    usage: usageSchema.optional(),
    elapsed_ms: z.number().optional(),
    prompt: z.string().optional(),
  }),
]);

const durationsSchema = z.object({
  collection: z.number(),
  judgment: z.number(),
  total: z.number(),
});

export const simulateHypothesisResponseSchema = z.object({
  evidence: z.array(evidenceSchema).readonly(),
  evaluation: evaluationSchema,
  durations: durationsSchema,
});

export type SimulateHypothesisResponseDto = z.infer<typeof simulateHypothesisResponseSchema>;
