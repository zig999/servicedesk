// Wire shapes for PUT /v1/cases/{slug}/versions/{version}/manifest/{hypothesis_name}
// (task/case-lifecycle-http/place-hypothesis-route, contracts/knowledge/case-lifecycle):
// the path-parameter and request-body DTOs the route validates against
// (DTO-01/02/03), named for this use case the same way update-draft.dto.ts's
// own updateDraftParamsSchema/updateDraftBodySchema are.
//
// placeHypothesisParamsSchema carries three path segments rather than the two
// every sibling route (read-case, update-draft, release, discard) validates —
// this operation's own route names the hypothesis directly in its path
// (the task's own title), so hypothesis_name joins slug and version as a
// third required segment. slug and version are coerced exactly as every
// sibling schema already coerces them (z.coerce.number() — EDG-01, DTO-01,
// MNT-03 kept in spirit; not imported directly since each sibling declares
// its own copy unexported); hypothesis_name is a bare non-empty string,
// domain/knowledge/hypothesis's own one declared attribute, read the same way
// read-case.dto.ts's own hypothesisIdentitySchema already validates it.
//
// placeHypothesisBodySchema carries the two remaining fields
// case-store.port.ts's own PlaceHypothesisInput declares beyond slug,
// version and hypothesis_name: revision (domain/knowledge/hypothesis-revision's
// own "revision" attribute — the numbered content this call adopts) and
// position (domain/knowledge/manifest-entry's own "position" attribute — the
// precedence slot this call places it at). Both are required integers;
// neither node states a lower bound, but this schema applies .positive() to
// both, the same convention every sibling schema already applies to
// version — insertHypothesisRevision's own doc numbers a revision "one past
// that hypothesis's own highest existing revision, or 1 where none exists
// yet", and every position this codebase's own tests exercise starts at 1 —
// so this is this task's own inference, disclosed in its delivery record,
// rather than a bound the specification itself states.

import { z } from 'zod';

/**
 * The three path parameters this route reads: the case's own slug identity
 * (domain/knowledge/case), the numbered draft version to place into
 * (domain/knowledge/case-version), and the hypothesis's own stable identity
 * within that case (domain/knowledge/hypothesis) — the route's own path names
 * all three, unlike every sibling route's two-segment path.
 */
export const placeHypothesisParamsSchema = z.object({
  slug: z.string().min(1),
  version: z.coerce.number().int().positive(),
  hypothesis_name: z.string().min(1),
});

export type PlaceHypothesisParamsDto = z.infer<typeof placeHypothesisParamsSchema>;

/**
 * The request body this route accepts: which revision of the path-named
 * hypothesis to adopt (domain/knowledge/hypothesis-revision) and at which
 * manifest position to place it (domain/knowledge/manifest-entry). Never
 * slug, version or hypothesis_name here — those three arrive through the
 * path alone, never duplicated into the body.
 */
export const placeHypothesisBodySchema = z.object({
  revision: z.number().int().positive(),
  position: z.number().int().positive(),
});

export type PlaceHypothesisBodyDto = z.infer<typeof placeHypothesisBodySchema>;
