// Wire shapes for POST /v1/diagnose (task/http-surface/diagnose-http-endpoint,
// contracts/investigation/diagnosis): the request/response DTOs the route
// validates and serializes against, spelled independently of the domain's
// own Subject/Assessment types so the wire boundary and the domain stay two
// things (constraints/the-domain-depends-on-no-infrastructure keeps the
// domain itself free of any transport concern; DTO-02/DTO-03 keep this file
// a Zod schema plus its own inferred type, named for the use case it
// answers). diagnoseResponseSchema carries exactly domain/investigation/assessment's
// own four fields — outcome, referral, the optional determining_hypothesis
// and text — so no verdict, citation or evidence item can ever cross into it.
// Schema constants are named camelCase, matching this codebase's own
// established convention (file-glossary-store.repository.ts's own
// termRecordsSchema/conceptRecordsSchema) and CON-01's variable-naming rule.

import { z } from 'zod';

/** One attribute-value pair identifying the subject instance, the wire shape of domain/investigation/subject-attribute-value. */
const subjectAttributeValueSchema = z.object({
  attribute: z.string().min(1),
  value: z.string().min(1),
});

/**
 * The subject the diagnose call examines: a governed type plus its whole
 * attribute-value set, at least one pair
 * (rules/investigation/a-subject-carries-at-least-one-attribute) — the wire
 * shape of domain/investigation/subject.
 */
const subjectSchema = z.object({
  type: z.string().min(1),
  attributes: z.array(subjectAttributeValueSchema).min(1),
});

/** The pinned case's own identity as the request names it: slug and version, read through createCaseQuery rather than trusted whole. */
const caseRefSchema = z.object({
  slug: z.string().min(1),
  version: z.int().positive(),
});

/**
 * The whole diagnose request body (contracts/investigation/diagnosis's own
 * "case, subject, narrative and requester in, with an optional ticket
 * reference"): ticket_ref is the one optional field, matching
 * domain/investigation/investigation's own "requester is always given,
 * ticket_ref is not".
 */
export const diagnoseRequestSchema = z.object({
  case: caseRefSchema,
  subject: subjectSchema,
  narrative: z.string().min(1),
  requester: z.string().min(1),
  ticket_ref: z.string().min(1).optional(),
});

export type DiagnoseRequestDto = z.infer<typeof diagnoseRequestSchema>;

/** The forwarding a resolved assessment carries, exactly domain/knowledge/referral's own two fields. */
const referralSchema = z.object({
  action: z.string().min(1),
  recipient: z.string().min(1),
});

/**
 * domain/investigation/assessment answered over the wire: outcome, referral
 * and text always present, determining_hypothesis exactly where a
 * hypothesis confirmed — never a verdict, a citation or an evidence item,
 * none of which Assessment itself carries.
 */
export const diagnoseResponseSchema = z.object({
  outcome: z.string().min(1),
  referral: referralSchema,
  determining_hypothesis: z.string().min(1).optional(),
  text: z.string().min(1),
});

export type DiagnoseResponseDto = z.infer<typeof diagnoseResponseSchema>;
