// Wire shapes for PATCH /v1/cases/{slug}/versions/{version}
// (task/case-lifecycle-http/update-draft-route, contracts/knowledge/case-lifecycle):
// the path-parameter and request-body DTOs the route validates against
// (DTO-01/02/03), named for this use case the same way read-case.dto.ts's
// own readCaseParamsSchema is.
//
// updateDraftParamsSchema mirrors read-case.dto.ts's own readCaseParamsSchema
// exactly — the identical :slug/:version pair, coerced the same way
// (z.coerce.number()) rather than trusting Fastify to have parsed the URL
// segment (EDG-01, DTO-01) — since this task's own instructions require
// mirroring that path-parameter convention exactly.
//
// updateDraftBodySchema mirrors case-store.port.ts's own UpdateDraftInput
// exactly: title, when_to_use, subject and fallback required (this
// analysis's own domain/knowledge/case-version node marks each attribute
// "required: true"), consolidation_register optional (that same node
// declares it with no "required" key at all, and
// domain/knowledge/consolidation-register's own description states
// "absent, the consolidation step keeps whatever register its own adapter
// defaults to" — an absence with its own meaning, not an omission this
// schema should paper over with a default). This is a full replacement of
// the five attributes on every call, not a partial per-field patch: the
// domain/knowledge/case-version node's own description reads "its own
// declared attributes may likewise be corrected, as many times as curation
// needs" — correcting the version's attributes, not one field in isolation
// — and case-store.port.ts's own UpdateDraftInput already committed to this
// shape (title/when_to_use/subject/fallback all required on the type), so
// this schema answers to that port's own already-decided shape rather than
// deciding a partial-patch alternative on its own. subject and fallback
// reuse read-case.dto.ts's own schemas verbatim rather than restating them
// (MNT-03): subject as the bare string read-case.dto.ts already validates
// it as (domain/glossary/subject-type is a discovered vocabulary, not a
// closed one this schema could enumerate), and fallback as the same
// resolutionSchema shape (domain/knowledge/resolution: one outcome paired
// with one referral).

import { z } from 'zod';
import { CONSOLIDATION_REGISTERS } from '../../investigation/consolidation-register.js';

/** The identical :slug/:version pair read-case.dto.ts's own readCaseParamsSchema already validates — this route reads the same two path parameters read-case-route does, so the same coercion applies (EDG-01, DTO-01, MNT-03 kept in spirit; not imported directly since read-case.dto.ts declares it unexported). */
export const updateDraftParamsSchema = z.object({
  slug: z.string().min(1),
  version: z.coerce.number().int().positive(),
});

export type UpdateDraftParamsDto = z.infer<typeof updateDraftParamsSchema>;

/** The forwarding a resolution carries — domain/knowledge/referral's own two fields, matching read-case.dto.ts's own referralSchema (MNT-03 kept in spirit; not imported directly since read-case.dto.ts declares it unexported). */
const referralSchema = z.object({
  action: z.string().min(1),
  recipient: z.string().min(1),
});

/** domain/knowledge/resolution: one outcome paired with the referral to act on it — matching read-case.dto.ts's own resolutionSchema. */
const resolutionSchema = z.object({
  outcome: z.string().min(1),
  referral: referralSchema,
});

/**
 * The five attributes case-store.port.ts's own UpdateDraftInput scopes
 * updateDraft to (domain/knowledge/case-version), mirrored here exactly:
 * title, when_to_use, subject and fallback required; consolidation_register
 * optional. Never the manifest (place-hypothesis/remove-hypothesis's own
 * concern) and never authored_at, state, released_at or version — none of
 * which this write touches.
 */
export const updateDraftBodySchema = z.object({
  title: z.string().min(1),
  when_to_use: z.string().min(1),
  subject: z.string().min(1),
  fallback: resolutionSchema,
  consolidation_register: z.enum(CONSOLIDATION_REGISTERS).optional(),
});

export type UpdateDraftBodyDto = z.infer<typeof updateDraftBodySchema>;
