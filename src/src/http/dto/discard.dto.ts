// Wire shape for DELETE /v1/cases/{slug}/versions/{version}
// (task/case-lifecycle-http/discard-route, contracts/knowledge/case-lifecycle):
// the path-parameter DTO the route validates against (DTO-01/02/03), named
// for this use case the same way update-draft.dto.ts's own
// updateDraftParamsSchema is.
//
// discardParamsSchema mirrors update-draft.dto.ts's own updateDraftParamsSchema
// exactly — the identical :slug/:version pair, coerced the same way
// (z.coerce.number()) rather than trusting Fastify to have parsed the URL
// segment (EDG-01, DTO-01) — since this task's own instructions require
// mirroring that path-parameter convention exactly. No body schema exists:
// discard removes a named version outright and takes no other input
// (case-lifecycle.factory.ts's own discard: (slug, version) => Promise<void>).

import { z } from 'zod';

/** The identical :slug/:version pair update-draft.dto.ts's own updateDraftParamsSchema already validates — this route reads the same two path parameters, so the same coercion applies (EDG-01, DTO-01, MNT-03 kept in spirit; not imported directly since update-draft.dto.ts declares it unexported). */
export const discardParamsSchema = z.object({
  slug: z.string().min(1),
  version: z.coerce.number().int().positive(),
});

export type DiscardParamsDto = z.infer<typeof discardParamsSchema>;
