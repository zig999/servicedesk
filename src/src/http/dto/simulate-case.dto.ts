import { z } from 'zod';
import { EVALUATION_REASONS } from '../../investigation/evaluation-reason.js';
import { EVIDENCE_RESULTS } from '../../investigation/evidence-result.js';

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

export const simulateCaseRequestSchema = z.object({
  case: caseRefSchema,
  subject: subjectSchema,
  requester: z.string().min(1),
});

export type SimulateCaseRequestDto = z.infer<typeof simulateCaseRequestSchema>;

const citationSchema = z.object({
  concept: z.string().min(1),
  field: z.string().min(1).optional(),
});

const usageSchema = z.object({
  input_tokens: z.number(),
  output_tokens: z.number(),
});

const evaluationSchema = z.discriminatedUnion('verdict', [
  z.object({
    hypothesis: z.string().min(1),
    verdict: z.literal('confirmed'),
    citations: z.array(citationSchema).min(1).readonly(),
    usage: usageSchema.optional(),
    elapsed_ms: z.number().optional(),
    prompt: z.string().optional(),
  }),
  z.object({
    hypothesis: z.string().min(1),
    verdict: z.literal('refuted'),
    citations: z.array(citationSchema).min(1).readonly(),
    usage: usageSchema.optional(),
    elapsed_ms: z.number().optional(),
    prompt: z.string().optional(),
  }),
  z.object({
    hypothesis: z.string().min(1),
    verdict: z.literal('inconclusive'),
    reason: z.enum(EVALUATION_REASONS),
    citations: z.array(citationSchema).readonly(),
    usage: usageSchema.optional(),
    elapsed_ms: z.number().optional(),
    prompt: z.string().optional(),
  }),
]);

const evidenceSchema = z.object({
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
});

const referralSchema = z.object({
  action: z.string().min(1),
  recipient: z.string().min(1),
});

const resolvedOutcomeSchema = z.object({
  outcome: z.string().min(1),
  referral: referralSchema,
  determining: z.string().min(1).optional(),
});

const assessmentSchema = z.object({
  outcome: z.string().min(1),
  referral: referralSchema,
  determining_hypothesis: z.string().min(1).optional(),
  text: z.string().min(1),
});

const costSchema = z.object({
  calls: z.number(),
  input_tokens: z.number(),
  output_tokens: z.number(),
});

const durationsSchema = z.object({
  collection: z.number(),
  judgment: z.number(),
  writing: z.number().optional(),
  total: z.number(),
});

export const simulateCaseResponseSchema = z.object({
  evidence: z.array(evidenceSchema).readonly(),
  evaluations: z.array(evaluationSchema).readonly(),
  resolved: resolvedOutcomeSchema,
  assessment: assessmentSchema,
  cost: costSchema,
  durations: durationsSchema,
});

export type SimulateCaseResponseDto = z.infer<typeof simulateCaseResponseSchema>;
