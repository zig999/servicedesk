// Wire shapes for POST /v1/cases/{slug}/hypotheses
// (task/case-lifecycle-http/revise-hypothesis-route, contracts/knowledge/case-lifecycle):
// the path-parameter and request-body DTOs the route validates against
// (DTO-01/02/03), named for this use case the same way create-draft.dto.ts's
// own createDraftBodySchema and update-draft.dto.ts's own
// updateDraftParamsSchema/updateDraftBodySchema are.
//
// reviseHypothesisParamsSchema carries only :slug, unlike read-case.dto.ts's
// and update-draft.dto.ts's own two-segment schema: this route names no
// version in its own path (its title is "POST /v1/cases/{slug}/hypotheses"),
// since revise-hypothesis originates a hypothesis-revision independent of
// any case version's manifest or release state (this task's own REMAINDER
// note) — there is no :version segment for this schema to coerce.
//
// reviseHypothesisBodySchema mirrors revise-hypothesis.operation.ts's own
// ReviseHypothesisInput exactly, minus slug (already read from the path):
// hypothesis_name (domain/knowledge/hypothesis's own identity attribute),
// criterion and resolution (domain/knowledge/hypothesis-revision's own
// declared attributes, both marked required: true), collects
// (domain/knowledge/hypothesis-revision's own many-valued
// domain/glossary/concept attribute), and subject — the operation's own
// addition beyond case-store.port.ts's HypothesisRevisionInput, the subject
// type the concept-acceptance check anchors against
// (rules/knowledge/a-concept-accepts-the-declared-subject-type,
// revise-hypothesis.operation.ts's own header comment). collects is
// deliberately schema-validated as an array of non-empty strings without a
// top-level non-empty requirement: rules/knowledge/a-hypothesis-collects-at-least-one-concept
// is already a business refusal the domain operation itself raises, by name,
// with the slug and hypothesis_name as context
// (HypothesisRevisionCollectsNoConceptError) — enforcing "at least one" a
// second time at this boundary would intercept every such request with a
// generic VALIDATION_ERROR before that typed, contextful refusal is ever
// reached, the same distinction update-draft.dto.ts's own header comment
// draws for consolidation_register's absence carrying its own meaning rather
// than being defaulted away at the DTO layer. This task's own inference,
// disclosed in its delivery record.
//
// subject and resolution reuse read-case.dto.ts's and update-draft.dto.ts's
// own bare-string and nested-referral conventions rather than restating them
// independently (MNT-03 kept in spirit; not imported directly since each
// file already declares its own copy unexported, the same convention every
// sibling dto file in this directory keeps).

import { z } from 'zod';

/** The one path parameter this route reads: the case's own slug identity (domain/knowledge/case) the new hypothesis-revision is originated against — no :version segment, since revise-hypothesis never anchors to one case version's own manifest. */
export const reviseHypothesisParamsSchema = z.object({
  slug: z.string().min(1),
});

export type ReviseHypothesisParamsDto = z.infer<typeof reviseHypothesisParamsSchema>;

/** The forwarding a resolution carries — domain/knowledge/referral's own two fields, matching read-case.dto.ts's, update-draft.dto.ts's and create-draft.dto.ts's own referralSchema (MNT-03 kept in spirit; not imported directly since each declares it unexported). */
const referralSchema = z.object({
  action: z.string().min(1),
  recipient: z.string().min(1),
});

/** domain/knowledge/resolution: one outcome paired with the referral to act on it — matching read-case.dto.ts's, update-draft.dto.ts's and create-draft.dto.ts's own resolutionSchema. */
const resolutionSchema = z.object({
  outcome: z.string().min(1),
  referral: referralSchema,
});

/**
 * What revise-hypothesis needs beyond the path's own :slug
 * (revise-hypothesis.operation.ts's own ReviseHypothesisInput,
 * case-store.port.ts's own HypothesisRevisionInput): the hypothesis's own
 * name, its new revision's criterion, collects and resolution, and the
 * subject type its collected concepts are checked against. collects is
 * validated as an array of non-empty strings only — never required
 * non-empty here, so rules/knowledge/a-hypothesis-collects-at-least-one-concept
 * stays the domain operation's own refusal to raise, by name and by context
 * (this task's own inference, disclosed in its delivery record, above).
 */
export const reviseHypothesisBodySchema = z.object({
  hypothesis_name: z.string().min(1),
  criterion: z.string().min(1),
  collects: z.array(z.string().min(1)).readonly(),
  resolution: resolutionSchema,
  subject: z.string().min(1),
});

export type ReviseHypothesisBodyDto = z.infer<typeof reviseHypothesisBodySchema>;
