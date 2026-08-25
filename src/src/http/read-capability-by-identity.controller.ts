// Maps one validated read-capability-by-identity request to the existing
// CapabilityRegistryService.readCapabilityByIdentity call, and the
// resulting CapabilityIdentityResolution back to the wire response
// (task/registry-reads/read-capability-by-identity-route,
// contracts/integration/capability-registry): transport in, transport out,
// no business decision of its own — the capability's own attributes travel
// through unchanged.
//
// Receives its one dependency as a plain function type (ARC-01), not the
// published ICapabilityQuery interface: readCapabilityByIdentity is not
// part of that contract (contracts/integration/capability-registry names
// read-capability, by concept, list-capabilities and register-capability;
// this operation is published as this route's own fourth operation,
// read-capability-by-identity, over the underlying method that already
// existed on CapabilityRegistryService for test-connector.controller.ts's
// own internal use) — the same shape TestConnectorControllerDependencies
// already takes this method as. Constructs nothing of its own (ARC-02): the
// composition root that supplies this function is build-app.factory.ts's
// own composeResources, reusing the same CapabilityRegistryService instance
// every other capability-registry route already shares.
//
// The one decision this controller does make is not a domain fact: the
// underlying read answers an unregistered identity as ordinary data
// (`{ held: false, name, version }`, never a thrown error —
// capability-registry.service.ts's own CapabilityIdentityResolution). Which
// transport status that ordinary absence becomes is COR-04's concern, not
// this specification's, so this controller raises
// CapabilityIdentityNotFoundError once it has read that held: false answer,
// letting the shared status map (src/errors/status-map.ts) resolve it
// rather than choosing a status here — a class distinct from
// ConceptNotAnsweredError, ConnectorConfigurationNotFoundError and
// CapabilityNotRegisteredForTestError, mirroring how each of those already
// answers its own route's structurally identical absence with its own
// class rather than a shared one.

import type { CapabilityIdentityResolution } from '../capability-registry/capability-registry.service.js';
import { CapabilityIdentityNotFoundError } from '../errors/capability-identity-not-found.error.js';
import type {
  ReadCapabilityByIdentityParamsDto,
  ReadCapabilityByIdentityResponseDto,
} from './dto/read-capability-by-identity.dto.js';

/** Everything the controller needs beyond one request's own path parameters: the existing readCapabilityByIdentity read, alone. */
export type ReadCapabilityByIdentityControllerDependencies = {
  readonly readCapabilityByIdentity: (name: string, version: string) => Promise<CapabilityIdentityResolution>;
};

/**
 * Handles one read-capability-by-identity request end to end: resolves the
 * named (name, version) identity through the existing
 * readCapabilityByIdentity read, answers with the held capability's whole
 * declared contract where one currently answers that identity, and raises
 * CapabilityIdentityNotFoundError — for the shared status map to resolve —
 * where the resolution answers `held: false`.
 */
export async function handleReadCapabilityByIdentityRequest(
  dependencies: ReadCapabilityByIdentityControllerDependencies,
  params: ReadCapabilityByIdentityParamsDto,
): Promise<ReadCapabilityByIdentityResponseDto> {
  const resolution = await dependencies.readCapabilityByIdentity(params.name, params.version);
  if (!resolution.held) {
    throw new CapabilityIdentityNotFoundError(resolution.name, resolution.version);
  }
  return resolution.capability;
}
