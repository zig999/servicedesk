// Wire shapes for POST /v1/simulate/hypothesis
// (task/case-simulation-pipeline/simulate-hypothesis-operation,
// contracts/investigation/case-simulation): the request and response DTOs
// the route validates and types against (DTO-01/02/03), following
// simulate-case.dto.ts's own convention exactly, narrower where this
// operation's own response is narrower — exactly one evaluation, evidence,
// and durations carrying no writing slot at all, since this operation never
// consolidates. No narrative, no ticket_ref, no resolved outcome and no
// assessment: none of the four is ever produced by an operation that never
// reaches consolidation or resolution
// (contracts/investigation/case-simulation's own "resolves no outcome — one
// hypothesis does not resolve a case").
//
// simulateHypothesisRequestSchema's own case/subject shapes mirror
// simulateCaseRequestSchema's own caseRefSchema/subjectSchema exactly,
// duplicated locally the same way simulate-case.dto.ts's own header comment
// already states for its own precedent (test-connector.dto.ts mirroring
// diagnose.dto.ts) — diagnose.dto.ts and simulate-case.dto.ts both declare
// their own shapes unexported (MNT-03 kept in spirit). hypothesis is this
// request's own added field: the one hypothesis name this run narrows to
// (domain/knowledge/hypothesis-revision, domain/knowledge/manifest-entry).
//
// simulateHypothesisResponseSchema carries exactly the three fields this
// task's own criteria name — evidence, one evaluation, and durations —
// mirroring domain/investigation/evidence, domain/investigation/evaluation
// (with its own domain/investigation/citation, domain/investigation/verdict,
// domain/investigation/evaluation-reason and domain/investigation/usage) and
// a narrower durations shape (collection, judgment, total) — never the
// domain/investigation/durations node's own optional writing attribute,
// since this operation never makes the one call that would populate it.

import { z } from 'zod';
import { EVALUATION_REASONS } from '../../investigation/evaluation-reason.js';
import { EVIDENCE_RESULTS } from '../../investigation/evidence-result.js';

/** One attribute-value pair identifying the subject instance, mirroring simulate-case.dto.ts's own subjectAttributeValueSchema. */
const subjectAttributeValueSchema = z.object({
  attribute: z.string().min(1),
  value: z.string().min(1),
});

/**
 * The subject this simulation examines: a governed type plus its whole
 * attribute-value set, at least one pair
 * (rules/investigation/a-subject-carries-at-least-one-attribute) — mirroring
 * simulate-case.dto.ts's own subjectSchema exactly.
 */
const subjectSchema = z.object({
  type: z.string().min(1),
  attributes: z.array(subjectAttributeValueSchema).min(1),
});

/** The pinned case's own identity as the request names it, mirroring simulate-case.dto.ts's own caseRefSchema exactly. */
const caseRefSchema = z.object({
  slug: z.string().min(1),
  version: z.int().positive(),
});

/**
 * The whole simulate-hypothesis request body: case, subject, requester and
 * the one hypothesis name this run narrows to — no narrative, no ticket_ref
 * (contracts/investigation/case-simulation's own "neither operation carries
 * a narrative or a ticket reference").
 */
export const simulateHypothesisRequestSchema = z.object({
  case: caseRefSchema,
  subject: subjectSchema,
  requester: z.string().min(1),
  hypothesis: z.string().min(1),
});

export type SimulateHypothesisRequestDto = z.infer<typeof simulateHypothesisRequestSchema>;

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
 * domain/investigation/evaluation: the one named hypothesis's whole
 * judgment, discriminated on its own verdict exactly the way evaluation.ts
 * declares it — confirmed and refuted each cite at least one evidence item,
 * inconclusive carries its own reason and whatever citations ground it,
 * possibly none. usage, elapsed_ms and prompt are optional on every branch,
 * present exactly where a judgment call actually happened.
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

/**
 * How long collection and judgment took, in milliseconds
 * (domain/investigation/durations): no writing field at all — this
 * operation never consolidates, so that slot never applies, unlike
 * simulate-case's own durationsSchema which always carries it.
 */
const durationsSchema = z.object({
  collection: z.number(),
  judgment: z.number(),
  total: z.number(),
});

/**
 * The whole simulate-hypothesis response: exactly one evaluation, for the
 * named hypothesis, the evidence its own revision collected, and how long
 * collection and judgment took
 * (scenarios/investigation/a-single-hypothesis-is-simulated's own "exactly
 * one evaluation returns," "no outcome and no assessment are resolved"). No
 * resolved outcome, no assessment, no cost, no narrative and no ticket
 * reference field — none of these five is ever produced by a run that never
 * resolves or consolidates.
 */
export const simulateHypothesisResponseSchema = z.object({
  evidence: z.array(evidenceSchema).readonly(),
  evaluation: evaluationSchema,
  durations: durationsSchema,
});

export type SimulateHypothesisResponseDto = z.infer<typeof simulateHypothesisResponseSchema>;
