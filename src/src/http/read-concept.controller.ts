// Maps one validated read-concept request to the published IGlossaryQuery call, and the resulting
// ConceptResolution back to the wire response (task/glossary-query-http/read-concept-route,
// contracts/glossary/glossary-query): transport in, transport out, no business decision of its own
// — the concept's own attributes travel through unchanged. Receives its one dependency as an
// interface (ARC-01); constructs none of it itself (ARC-02) — the composition root that builds
// IGlossaryQuery is src/factories/glossary.factory.ts's own createGlossaryQuery.
//
// The one decision this controller does make is not a domain fact: the domain's own read-concept
// answers an unheld concept as ordinary data (`{ held: false, name }`, never a thrown error —
// glossary-query.port.ts's own ConceptResolution and contracts/glossary/glossary-query's own
// description). Which transport status that ordinary absence becomes is COR-04's concern, not this
// specification's, so this controller raises ConceptNotHeldError once it has read that held: false
// answer, letting the shared status map (src/errors/status-map.ts) resolve it rather than choosing
// a status here — exactly as read-capability.controller.ts already leaves its own
// ConceptNotAnsweredError to it, though this is a distinct typed error of the glossary's own
// bounded context (concept-not-held.error.ts's own header comment says why it is not a reuse).

import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import { ConceptNotHeldError } from '../errors/concept-not-held.error.js';
import type { ReadConceptParamsDto, ReadConceptResponseDto } from './dto/read-concept.dto.js';

/** Everything the controller needs beyond one request's own path parameter: the published glossary-query read. */
export type ReadConceptControllerDependencies = {
  readonly glossaryQuery: IGlossaryQuery;
};

/**
 * Handles one read-concept request end to end: resolves the named concept through the published
 * glossary-query contract, answers with the held concept's own attributes where one currently
 * exists, and raises ConceptNotHeldError — for the shared status map to resolve — where the
 * resolution answers `held: false`.
 */
export async function handleReadConceptRequest(
  dependencies: ReadConceptControllerDependencies,
  params: ReadConceptParamsDto,
): Promise<ReadConceptResponseDto> {
  const resolution = await dependencies.glossaryQuery.readConcept(params.name);
  if (!resolution.held) {
    throw new ConceptNotHeldError(resolution.name);
  }
  return { name: resolution.concept.name, accepts: resolution.concept.accepts, ttl: resolution.concept.ttl };
}
