// Wire shape for POST /v1/cases
// (task/case-lifecycle-http/create-draft-route, contracts/knowledge/case-lifecycle):
// the request-body DTO the route validates against (DTO-01/02/03), named for
// this use case the same way update-draft.dto.ts's own
// updateDraftBodySchema is.
//
// createDraftBodySchema mirrors case-store.port.ts's own CreateDraftInput
// exactly: slug, title, when_to_use, authored_at, subject and fallback
// required (every one of them a plain, non-optional field on that type),
// consolidation_register optional (that type declares it with a `?`, the
// same convention update-draft.dto.ts's own updateDraftBodySchema already
// keeps for the same field), and source_version optional — naming none
// copies the case's own latest released version's manifest instead
// (case-store.port.ts's own CreateDraftInput doc comment). source_version is
// read as a plain positive integer rather than coerced from a URL string
// segment the way readCaseParamsSchema's own :version is: this route has no
// path parameters at all (everything arrives in the POST body), so the
// value already arrives as JSON's own number type, never a string
// Fastify would need coercing.
//
// slug, title, when_to_use, authored_at and subject reuse read-case.dto.ts's
// own bare-string convention (MNT-03 kept in spirit; not imported directly
// since read-case.dto.ts declares its own schema unexported), and fallback
// reuses the same nested resolutionSchema shape (domain/knowledge/resolution:
// one outcome paired with one referral) update-draft.dto.ts's own
// updateDraftBodySchema already keeps for the identical field.

import { z } from 'zod';
import { CONSOLIDATION_REGISTERS } from '../../investigation/consolidation-register.js';

/** The forwarding a resolution carries — domain/knowledge/referral's own two fields, matching read-case.dto.ts's and update-draft.dto.ts's own referralSchema (MNT-03 kept in spirit; not imported directly since each declares it unexported). */
const referralSchema = z.object({
  action: z.string().min(1),
  recipient: z.string().min(1),
});

/** domain/knowledge/resolution: one outcome paired with the referral to act on it — matching read-case.dto.ts's and update-draft.dto.ts's own resolutionSchema. */
const resolutionSchema = z.object({
  outcome: z.string().min(1),
  referral: referralSchema,
});

/**
 * What create-draft needs to originate a new draft version
 * (case-store.port.ts's own CreateDraftInput), mirrored here exactly: slug,
 * title, when_to_use, authored_at, subject and fallback required;
 * consolidation_register and source_version optional. Naming no
 * source_version copies the case's own latest released version's manifest
 * instead, empty where the case holds none yet — this schema states only
 * the shape, never that default; the domain operation beneath it decides it
 * (case-store.port.ts's own createDraft doc comment).
 */
export const createDraftBodySchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  when_to_use: z.string().min(1),
  authored_at: z.string().min(1),
  subject: z.string().min(1),
  fallback: resolutionSchema,
  consolidation_register: z.enum(CONSOLIDATION_REGISTERS).optional(),
  source_version: z.number().int().positive().optional(),
});

export type CreateDraftBodyDto = z.infer<typeof createDraftBodySchema>;
