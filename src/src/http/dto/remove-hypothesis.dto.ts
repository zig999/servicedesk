// Wire shape for DELETE /v1/cases/{slug}/versions/{version}/manifest/{hypothesis_name}
// (task/case-lifecycle-http/remove-hypothesis-route, contracts/knowledge/case-lifecycle):
// the path-parameter DTO the route validates against (DTO-01/02/03), named
// for this use case the same way discard.dto.ts's own discardParamsSchema
// and release.dto.ts's own releaseParamsSchema are.
//
// removeHypothesisParamsSchema carries the same :slug/:version pair those
// two already validate, coerced the same way (z.coerce.number()) rather
// than trusting Fastify to have parsed the URL segment (EDG-01, DTO-01), plus
// the one path segment neither of those two routes reads: :hypothesis_name,
// the third input manifest-composition.operations.ts's own RemoveHypothesisInput
// requires alongside slug and version. hypothesis_name is validated as a
// non-empty string rather than against any closed vocabulary — a hypothesis
// name is discovered content the glossary does not enumerate, the same
// reasoning update-draft.dto.ts's own subject field states for its own
// discovered value. No body schema exists: remove-hypothesis removes a
// named manifest entry outright and takes no other input
// (case-lifecycle.factory.ts's own removeHypothesis: (input: RemoveHypothesisInput) => Promise<void>).

import { z } from 'zod';

/** The identical :slug/:version pair discard.dto.ts's own discardParamsSchema and release.dto.ts's own releaseParamsSchema already validate, plus the one further path segment this route alone reads (EDG-01, DTO-01, MNT-03 kept in spirit; not imported directly since both siblings declare their schema unexported). */
export const removeHypothesisParamsSchema = z.object({
  slug: z.string().min(1),
  version: z.coerce.number().int().positive(),
  hypothesis_name: z.string().min(1),
});

export type RemoveHypothesisParamsDto = z.infer<typeof removeHypothesisParamsSchema>;
