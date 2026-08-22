/**
 * The client-side validation schema for the Version Editor's one field form
 * (task/version-editor/edit-draft-version), reused verbatim from the real
 * backend contract rather than re-derived: PATCH /v1/cases/{slug}/versions/
 * {version} validates its request body against updateDraftBodySchema
 * (src/src/http/dto/update-draft.dto.ts, confirmed directly against that
 * file, and named by this app's own inventory as the shape to reuse) --
 * title, when_to_use, subject and fallback required, consolidation_register
 * optional. This schema mirrors that field set and requiredness exactly, so
 * the form's own full-replace shape can never drift from what the backend
 * actually validates.
 *
 * The same shape also serves task/version-editor/new-draft-creation's blank
 * form (POST /v1/cases's own body is this shape plus slug/authored_at,
 * additive over it per the inventory) -- this module states only what this
 * task's own edit flow needs, and a later task composing POST's own two
 * extra fields on top is that task's own concern, not scope this one
 * reaches for pre-emptively.
 */

import { z } from "zod";

/**
 * The two-value closed vocabulary domain/knowledge/consolidation-register
 * itself declares -- formal or plain, nothing else, "fixed and known ahead
 * of time" per that node's own description. Declared here as this app's own
 * copy of that domain fact, the same way the backend's own
 * updateDraftBodySchema declares its own CONSOLIDATION_REGISTERS import --
 * both read from the one specification node, neither from the other's
 * source (this app and the backend are two separate deployments).
 */
export const CONSOLIDATION_REGISTERS = ["formal", "plain"] as const;

/** domain/knowledge/referral: one action paired with one recipient, both glossary-backed. */
const referralSchema = z.object({
  action: z.string().min(1),
  recipient: z.string().min(1),
});

/** domain/knowledge/resolution: one outcome paired with the referral to act on it. */
const resolutionSchema = z.object({
  outcome: z.string().min(1),
  referral: referralSchema,
});

/**
 * The full-replace body this form always sends on Save: every field
 * updateDraftBodySchema requires, plus the one it leaves optional. `subject`
 * is included even though the form shows it fixed/disabled -- the PATCH is
 * full-replace, so it is resent unchanged on every save rather than omitted
 * because the UI never lets it change.
 */
export const caseVersionFormSchema = z.object({
  title: z.string().min(1),
  when_to_use: z.string().min(1),
  subject: z.string().min(1),
  fallback: resolutionSchema,
  consolidation_register: z.enum(CONSOLIDATION_REGISTERS).optional(),
});

export type CaseVersionFormValues = z.infer<typeof caseVersionFormSchema>;
