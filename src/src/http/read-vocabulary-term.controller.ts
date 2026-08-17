// Maps one validated read-vocabulary-term request to the published IGlossaryQuery call, and the
// resulting TermResolution back to the wire response (task/glossary-query-http/read-vocabulary-term-route,
// contracts/glossary/glossary-query): transport in, transport out, no business decision of its own
// — the term's own name travels through unchanged. Receives its one dependency as an interface
// (ARC-01); constructs none of it itself (ARC-02) — the composition root that builds
// IGlossaryQuery is src/factories/glossary.factory.ts's own createGlossaryQuery.
//
// The one decision this controller does make is not a domain fact: the domain's own
// read-vocabulary-term answers an unheld term as ordinary data (`{ held: false, vocabulary, name
// }`, never a thrown error — glossary-query.port.ts's own TermResolution and
// contracts/glossary/glossary-query's own description). Which transport status that ordinary
// absence becomes is COR-04's concern, not this specification's, so this controller raises
// VocabularyTermNotHeldError once it has read that held: false answer, letting the shared status
// map (src/errors/status-map.ts) resolve it rather than choosing a status here — exactly as
// read-concept.controller.ts already leaves its own ConceptNotHeldError to it, though this is a
// distinct typed error of the glossary's own bounded context (vocabulary-term-not-held.error.ts's
// own header comment says why it is not a reuse of that one).

import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import { VocabularyTermNotHeldError } from '../errors/vocabulary-term-not-held.error.js';
import type { ReadVocabularyTermParamsDto, ReadVocabularyTermResponseDto } from './dto/read-vocabulary-term.dto.js';

/** Everything the controller needs beyond one request's own path parameters: the published glossary-query read. */
export type ReadVocabularyTermControllerDependencies = {
  readonly glossaryQuery: IGlossaryQuery;
};

/**
 * Handles one read-vocabulary-term request end to end: resolves the named term of the named
 * vocabulary through the published glossary-query contract, answers with the held term's own name
 * where one currently exists, and raises VocabularyTermNotHeldError — for the shared status map to
 * resolve — where the resolution answers `held: false`.
 */
export async function handleReadVocabularyTermRequest(
  dependencies: ReadVocabularyTermControllerDependencies,
  params: ReadVocabularyTermParamsDto,
): Promise<ReadVocabularyTermResponseDto> {
  const resolution = await dependencies.glossaryQuery.readVocabularyTerm(params.vocabulary, params.name);
  if (!resolution.held) {
    throw new VocabularyTermNotHeldError(resolution.vocabulary, resolution.name);
  }
  return { name: resolution.term.name };
}
