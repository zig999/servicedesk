// Wire shapes for POST /v1/cases/{slug}/versions/{version}/release
// (task/case-lifecycle-http/release-route, contracts/knowledge/case-lifecycle):
// the path-parameter DTO the route validates against (DTO-01/02/03), named
// for this use case the same way read-case.dto.ts's own readCaseParamsSchema
// and update-draft.dto.ts's own updateDraftParamsSchema are.
//
// releaseParamsSchema mirrors those two exactly — the identical
// :slug/:version pair, coerced the same way (z.coerce.number()) rather than
// trusting Fastify to have parsed the URL segment (EDG-01, DTO-01) — since
// this task's own instructions require mirroring update-draft.dto.ts's own
// coercion. release takes no request body (the domain operation's own
// signature is release(slug, version): Promise<void>), so no body schema is
// declared here.

import { z } from 'zod';

/** The identical :slug/:version pair read-case.dto.ts's own readCaseParamsSchema and update-draft.dto.ts's own updateDraftParamsSchema already validate — this route reads the same two path parameters, so the same coercion applies (EDG-01, DTO-01, MNT-03 kept in spirit; not imported directly since both declare it unexported). */
export const releaseParamsSchema = z.object({
  slug: z.string().min(1),
  version: z.coerce.number().int().positive(),
});

export type ReleaseParamsDto = z.infer<typeof releaseParamsSchema>;
