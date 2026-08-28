// Wire shapes for POST /v1/simulate
// (task/case-simulation-pipeline/simulate-case-operation,
// contracts/investigation/case-simulation): the request and response DTOs
// the route validates and types against (DTO-01/02/03), following
// diagnose.dto.ts's own convention exactly, minus the two fields neither
// simulation operation ever carries — narrative and ticket_ref, both
// belonging to the investigation record simulate-case never creates
// (contracts/investigation/case-simulation's own "neither operation carries
// a narrative or a ticket reference").
//
// simulateCaseRequestSchema's own case/subject shapes mirror
// diagnoseRequestSchema's own caseRefSchema/subjectSchema exactly,
// duplicated locally the same way test-connector.dto.ts's own subjectSchema
// already mirrors diagnose.dto.ts's rather than importing it — diagnose.dto.ts
// declares both unexported (MNT-03 kept in spirit, the same precedent
// read-case.dto.ts's own header comment already states for its own
// referralSchema).
//
// simulateCaseResponseSchema carries exactly the six fields this task's own
// criteria and contracts/investigation/case-simulation both name — evidence,
// evaluations, resolved outcome, assessment, cost and durations — mirroring
// every value object's own already-declared shape (domain/investigation/evidence,
// domain/investigation/evaluation, domain/investigation/citation,
// domain/investigation/verdict, domain/investigation/evaluation-reason,
// domain/investigation/usage, domain/knowledge/resolution,
// domain/investigation/assessment, domain/investigation/cost,
// domain/investigation/durations), the same nested-schema convention
// read-case.dto.ts already keeps for domain/knowledge's own nested shapes.
// It deliberately excludes InvestigationPipelineResult's own separate
// prompts field: neither the contract nor this task's own criteria name it
// as part of the published record (disclosed as an inference in this task's
// own delivery record).

import { z } from 'zod';
import { EVALUATION_REASONS } from '../../investigation/evaluation-reason.js';
import { EVIDENCE_RESULTS } from '../../investigation/evidence-result.js';

/** One attribute-value pair identifying the subject instance, mirroring diagnose.dto.ts's own subjectAttributeValueSchema. */
const subjectAttributeValueSchema = z.object({
  attribute: z.string().min(1),
  value: z.string().min(1),
});

/**
 * The subject this simulation examines: a governed type plus its whole
 * attribute-value set, at least one pair
 * (rules/investigation/a-subject-carries-at-least-one-attribute) — mirroring
 * diagnose.dto.ts's own subjectSchema exactly.
 */
const subjectSchema = z.object({
  type: z.string().min(1),
  attributes: z.array(subjectAttributeValueSchema).min(1),
});

/** The pinned case's own identity as the request names it, mirroring diagnose.dto.ts's own caseRefSchema exactly. */
const caseRefSchema = z.object({
  slug: z.string().min(1),
  version: z.int().positive(),
});

/**
 * The whole simulate-case request body: case, subject and requester, and
 * nothing else — no narrative, no ticket_ref
 * (contracts/investigation/case-simulation's own "neither operation carries
 * a narrative or a ticket reference").
 */
export const simulateCaseRequestSchema = z.object({
  case: caseRefSchema,
  subject: subjectSchema,
  requester: z.string().min(1),
});

export type SimulateCaseRequestDto = z.infer<typeof simulateCaseRequestSchema>;

/** domain/investigation/citation: one pointer into the evidence that grounded a verdict. */
const citationSchema = z.object({
  concept: z.string().min(1),
  field: z.string().min(1),
});

/** domain/investigation/usage: what one provider call spent — the same call-level shape carried by a judgment call's own usage. */
const usageSchema = z.object({
  input_tokens: z.number(),
  output_tokens: z.number(),
});

/**
 * domain/investigation/evaluation: one hypothesis's whole judgment,
 * discriminated on its own verdict exactly the way evaluation.ts declares it
 * — confirmed and refuted each cite at least one evidence item, inconclusive
 * carries its own reason and whatever citations ground it, possibly none.
 * usage, elapsed_ms and prompt are optional on every branch, present exactly
 * where a judgment call actually happened.
 */
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

/** domain/investigation/evidence: one collected concept's whole record. */
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

/** The forwarding a resolution carries, mirroring diagnose.dto.ts's own referralSchema exactly. */
const referralSchema = z.object({
  action: z.string().min(1),
  recipient: z.string().min(1),
});

/** domain/knowledge/resolution, as resolveAndNarrow answers it: outcome and referral, and the determining hypothesis where one confirmed. */
const resolvedOutcomeSchema = z.object({
  outcome: z.string().min(1),
  referral: referralSchema,
  determining: z.string().min(1).optional(),
});

/**
 * domain/investigation/assessment, exactly diagnoseResponseSchema's own four
 * fields (outcome, referral, determining_hypothesis, text) — this task's own
 * criteria do not ask for usage/elapsed_ms/prompt/register to be added onto
 * it, and Assessment's own delivered shape does not yet carry them (disclosed
 * in this task's own delivery record).
 */
const assessmentSchema = z.object({
  outcome: z.string().min(1),
  referral: referralSchema,
  determining_hypothesis: z.string().min(1).optional(),
  text: z.string().min(1),
});

/** domain/investigation/cost: what one investigation (or simulation) cost at the provider. */
const costSchema = z.object({
  calls: z.number(),
  input_tokens: z.number(),
  output_tokens: z.number(),
});

/** domain/investigation/durations: how long each stage took, in milliseconds. */
const durationsSchema = z.object({
  collection: z.number(),
  judgment: z.number(),
  writing: z.number(),
  total: z.number(),
});

/**
 * The whole simulate-case response: the complete record
 * (contracts/investigation/case-simulation's own "returns the whole record
 * back") — evidence per concept, evaluation per hypothesis with its
 * citations, the resolved outcome, the assessment, cost and durations. No
 * narrative and no ticket reference field, since Assessment itself never
 * carries either.
 */
export const simulateCaseResponseSchema = z.object({
  evidence: z.array(evidenceSchema).readonly(),
  evaluations: z.array(evaluationSchema).readonly(),
  resolved: resolvedOutcomeSchema,
  assessment: assessmentSchema,
  cost: costSchema,
  durations: durationsSchema,
});

export type SimulateCaseResponseDto = z.infer<typeof simulateCaseResponseSchema>;
