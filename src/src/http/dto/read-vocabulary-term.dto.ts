// Wire shapes for GET /v1/glossary/{vocabulary}/{name} (task/glossary-query-http/read-vocabulary-term-route,
// contracts/glossary/glossary-query): the path-parameter and response DTOs the route validates
// and serializes against (DTO-01/02/03), named for this use case the same way
// read-concept.dto.ts's own readConceptParamsSchema/ResponseSchema are.
//
// readVocabularyTermParamsSchema validates :vocabulary against the same closed set
// IGlossaryQuery.readVocabularyTerm itself is typed over — TERM_VOCABULARIES, the five term
// vocabularies of the glossary (terms.ts) — so a segment naming anything outside subject-type,
// subject-attribute, outcome, action or recipient is refused before the controller is ever
// reached (DTO-01, EDG-01), rather than reaching the domain operation as an untyped string.
//
// readVocabularyTermResponseSchema carries exactly domain/glossary's own bare-name term shape
// (GlossaryTerm — the one attribute every one of the five vocabularies' entries carries), since
// criterion 1 asks for the term "exactly as the glossary currently holds it" and TermResolution's
// held branch carries nothing beyond that name.

import { z } from 'zod';
import { TERM_VOCABULARIES } from '../../glossary/terms.js';

/**
 * The two path parameters this route reads: which of the five term vocabularies to resolve
 * against, and the term named within it — resolved through IGlossaryQuery.readVocabularyTerm
 * exactly as the request spelled them. :name is never trusted empty (EDG-01), though Fastify's
 * own route matching already refuses an empty path segment before this schema is ever reached.
 */
export const readVocabularyTermParamsSchema = z.object({
  vocabulary: z.enum(TERM_VOCABULARIES),
  name: z.string().min(1),
});

export type ReadVocabularyTermParamsDto = z.infer<typeof readVocabularyTermParamsSchema>;

/**
 * The term currently held by the named vocabulary, whole — its one name attribute, exactly as
 * TermResolution's held branch carries it, with no field of its own.
 */
export const readVocabularyTermResponseSchema = z.object({
  name: z.string().min(1),
});

export type ReadVocabularyTermResponseDto = z.infer<typeof readVocabularyTermResponseSchema>;
