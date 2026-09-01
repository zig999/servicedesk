import type { ICapabilityQuery } from '../capability-registry/capability-query.port.js';
import { ConceptNotAnsweredError } from '../errors/concept-not-answered.error.js';
import type { ReadCapabilityParamsDto, ReadCapabilityResponseDto } from './dto/read-capability.dto.js';

export type ReadCapabilityControllerDependencies = {
  readonly capabilityQuery: ICapabilityQuery;
};

export async function handleReadCapabilityRequest(
  dependencies: ReadCapabilityControllerDependencies,
  params: ReadCapabilityParamsDto,
): Promise<ReadCapabilityResponseDto> {
  const resolution = await dependencies.capabilityQuery.readCapability(params.concept);
  if (!resolution.held) {
    throw new ConceptNotAnsweredError(resolution.concept);
  }
  return resolution.capability;
}
