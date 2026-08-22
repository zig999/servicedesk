/**
 * The client-side validation schema for the shared Revise/New-hypothesis
 * form (task/manifest-hypothesis-authoring/revise-hypothesis-form): the
 * fields the form itself edits before `subject` is appended from the
 * draft's own declared subject type at submit time (this task's own
 * criterion 9 -- "a body of exactly { hypothesis_name, criterion, collects,
 * resolution, subject } built from the form's own current content and the
 * draft's own subject type"). `subject` is deliberately excluded from this
 * schema and from CaseVersionFormValues's own convention of resending a
 * fixed value on every submit: this form never lets the curator edit it at
 * all, and the criterion itself separates "the form's own current content"
 * from "the draft's own subject type" as two distinct sources composed only
 * at submit time, unlike the Version Editor's own PATCH (a full-replace body
 * where every field, editable or not, is part of one form record).
 *
 * Mirrors reviseHypothesisBodySchema (src/src/http/dto/revise-hypothesis.dto.ts,
 * confirmed directly against that file) field-for-field for hypothesis_name,
 * criterion and resolution -- but diverges from it, deliberately, on
 * `collects`: the real DTO validates only an array of non-empty strings,
 * with no minimum length, because HypothesisRevisionCollectsNoConceptError
 * (rules/knowledge/a-hypothesis-collects-at-least-one-concept) is the
 * domain operation's own named refusal to raise, not a boundary validation.
 * This task's own criterion 6 ("Submitting the form with no concept checked
 * in Collects is refused before any request is sent") asks for exactly that
 * refusal client-side, before any request reaches the server -- so this
 * schema adds `.min(1)` where the backend's own DTO does not, as a
 * pre-check on the same domain invariant, never as a claim that the
 * server's own authority moves. This task's own inference, disclosed in its
 * delivery record.
 */

import { z } from "zod";

/** domain/knowledge/referral: one action paired with one recipient, both glossary-backed. Required non-empty here so criterion 8's "no referral action or recipient selected" is refused before any request is sent. */
const referralSchema = z.object({
  action: z.string().min(1),
  recipient: z.string().min(1),
});

/** domain/knowledge/resolution: one outcome paired with the referral to act on it. Required non-empty here so criterion 8's "no resolution outcome selected" is refused before any request is sent. */
const resolutionSchema = z.object({
  outcome: z.string().min(1),
  referral: referralSchema,
});

/**
 * The form's own editable fields. `hypothesis_name` is required non-empty
 * for both entry points: the New-hypothesis route leaves it blank until the
 * curator types one (criterion 2), and the Revise route pre-fills it from
 * the addressed hypothesis and renders it disabled (criterion 3) -- either
 * way, a submission always carries a non-empty name, matching
 * reviseHypothesisBodySchema's own requirement.
 */
export const hypothesisRevisionFormSchema = z.object({
  hypothesis_name: z.string().min(1),
  criterion: z.string().min(1),
  collects: z.array(z.string().min(1)).min(1),
  resolution: resolutionSchema,
});

export type HypothesisRevisionFormValues = z.infer<typeof hypothesisRevisionFormSchema>;
