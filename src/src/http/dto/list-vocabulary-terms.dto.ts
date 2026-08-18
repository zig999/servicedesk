// Wire shapes for GET /v1/glossary/{vocabulary} (task/glossary-query-http/list-vocabulary-terms-route,
// contracts/glossary/glossary-query): the path-parameter and query-string DTOs the route validates
// against (DTO-01/02/03) — named for this use case the same way list-cases.dto.ts's own
// listCasesQuerySchema and read-vocabulary-term.dto.ts's own readVocabularyTermParamsSchema are, and
// split into two schemas because this route is the first of the glossary listing siblings to carry
// both a path segment and a query string at once: read-vocabulary-term.dto.ts declares only params
// (it has no query string) and list-cases.dto.ts/list-concepts.dto.ts declare only a query (neither
// carries a path parameter).
//
// listVocabularyTermsParamsSchema validates :vocabulary against the same closed set
// IGlossaryQuery.listVocabularyTerms itself is typed over — TERM_VOCABULARIES, the five term
// vocabularies of the glossary (terms.ts) — so a segment naming anything outside subject-type,
// subject-attribute, outcome, action or recipient is refused before the controller is ever reached
// (DTO-01, EDG-01), rather than reaching the domain operation as an untyped string. This is the
// route's whole refusal mechanism for an unrecognized vocabulary: IGlossaryQuery.listVocabularyTerms
// raises no typed error of its own for one (glossary-query.port.ts, glossary.service.ts — verified
// directly, and independently confirmed by both the implementation and the proof of
// task/glossary-query-http/list-vocabulary-terms-query-extension), exactly as
// read-vocabulary-term.dto.ts's own header comment already establishes for its sibling route.
//
// listVocabularyTermsQuerySchema coerces offset/limit exactly as list-cases.dto.ts's own
// listCasesQuerySchema does, and leaves both optional for the same reason stated there: EDG-01
// refuses input that is present but malformed, never input that is simply absent, and API-04
// presupposes exactly that absence by requiring a configured default. Bounding an absent or
// oversized limit against that configured default and maximum is left to the controller
// (list-vocabulary-terms.controller.ts), not to this schema.
//
// This module declares no response schema: GET /v1/glossary/{vocabulary} answers the shared
// PaginatedResponse<GlossaryTerm> src/types/pagination.ts already declares (API-01 — "never
// redeclared per module"), so list-vocabulary-terms.controller.ts types its own answer against that
// imported type directly rather than a second Zod-inferred shape this file would have to keep in
// step with it.

import { z } from 'zod';
import { TERM_VOCABULARIES } from '../../glossary/terms.js';

/**
 * The one path parameter this route reads: which of the five term vocabularies to list, resolved
 * through IGlossaryQuery.listVocabularyTerms exactly as the request spelled it.
 */
export const listVocabularyTermsParamsSchema = z.object({
  vocabulary: z.enum(TERM_VOCABULARIES),
});

export type ListVocabularyTermsParamsDto = z.infer<typeof listVocabularyTermsParamsSchema>;

/**
 * The two query-string parameters this route accepts, each optional and coerced from the raw
 * string (or absence) a query string carries: offset, how many matching terms of the named
 * vocabulary precede the first one this page returns, and limit, the most terms this page may
 * carry before the controller's own configured default and maximum are applied.
 */
export const listVocabularyTermsQuerySchema = z.object({
  offset: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export type ListVocabularyTermsQueryDto = z.infer<typeof listVocabularyTermsQuerySchema>;
