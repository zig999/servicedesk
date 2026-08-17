// Maps one validated read-capability request to the published ICapabilityQuery call, and the
// resulting CapabilityResolution back to the wire response (task/capability-registry-http/read-capability-route,
// contracts/integration/capability-registry): transport in, transport out, no business decision
// of its own — the capability's own attributes travel through unchanged. Receives its one
// dependency as an interface (ARC-01); constructs none of it itself (ARC-02) — the composition
// root that builds ICapabilityQuery is src/factories/capability-registry.factory.ts's own
// createCapabilityQuery.
//
// The one decision this controller does make is not a domain fact: the domain's own read-capability
// answers an unheld concept as ordinary data (`{ held: false, concept }`, never a thrown error —
// capability-query.port.ts's own CapabilityResolution and contracts/integration/capability-registry's
// own description). Which transport status that ordinary absence becomes is COR-04's concern, not
// this specification's, so this controller raises ConceptNotAnsweredError once it has read that
// held: false answer, letting the shared status map (src/errors/status-map.ts) resolve it rather
// than choosing a status here.

import type { ICapabilityQuery } from '../capability-registry/capability-query.port.js';
import { ConceptNotAnsweredError } from '../errors/concept-not-answered.error.js';
import type { ReadCapabilityParamsDto, ReadCapabilityResponseDto } from './dto/read-capability.dto.js';

/** Everything the controller needs beyond one request's own path parameter: the published capability-registry read. */
export type ReadCapabilityControllerDependencies = {
  readonly capabilityQuery: ICapabilityQuery;
};

/**
 * Handles one read-capability request end to end: resolves the named concept through the
 * published capability-registry contract, answers with the held capability's whole declared
 * contract where one currently answers the concept, and raises ConceptNotAnsweredError — for the
 * shared status map to resolve — where the resolution answers `held: false`.
 */
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
