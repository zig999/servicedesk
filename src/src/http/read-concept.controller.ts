import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import { ConceptNotHeldError } from '../errors/concept-not-held.error.js';
import type { ReadConceptParamsDto, ReadConceptResponseDto } from './dto/read-concept.dto.js';

export type ReadConceptControllerDependencies = {
  readonly glossaryQuery: IGlossaryQuery;
};

export async function handleReadConceptRequest(
  dependencies: ReadConceptControllerDependencies,
  params: ReadConceptParamsDto,
): Promise<ReadConceptResponseDto> {
  const resolution = await dependencies.glossaryQuery.readConcept(params.name);
  if (!resolution.held) {
    throw new ConceptNotHeldError(resolution.name);
  }
  return {
    name: resolution.concept.name,
    accepts: resolution.concept.accepts,
    ttl: resolution.concept.ttl,
    description: resolution.concept.description,
  };
}
