// Maps one validated read-capability-by-identity request to
// CapabilityRegistryService's own readCapabilityByIdentityOrThrow wrapper,
// and the resolved Capability back to the wire response
// (task/registry-reads/read-capability-by-identity-route,
// contracts/integration/capability-registry): transport in, transport out,
// no business decision of its own — the capability's own attributes travel
// through unchanged.
//
// Receives its one dependency as a plain function type (ARC-01), not the
// published ICapabilityQuery interface: readCapabilityByIdentityOrThrow is
// not part of that contract (contracts/integration/capability-registry names
// read-capability, by concept, list-capabilities and register-capability;
// this operation is published as this route's own fourth operation,
// read-capability-by-identity, over the underlying method that already
// existed on CapabilityRegistryService for test-connector.controller.ts's
// own internal use). Constructs nothing of its own (ARC-02): the
// composition root that supplies this function is build-app.factory.ts's
// own composeResources, reusing the same CapabilityRegistryService instance
// every other capability-registry route already shares.
//
// The held-check-and-throw this controller used to perform itself
// (task/registry-read-not-found-relocation-and-rate-limit/capability-not-found-relocation)
// now lives in CapabilityRegistryService.readCapabilityByIdentityOrThrow —
// COR-03's own "a service raises business errors" — so this handler only
// awaits that wrapper and returns whatever it resolves; a miss reaches this
// module as a thrown CapabilityIdentityNotFoundError rather than a `held:
// false` value this controller would otherwise branch on.
// CapabilityRegistryService.readCapabilityByIdentity itself is unaffected:
// it still answers an unregistered identity as ordinary data, never a
// thrown error, for every other consumer that reads it directly (the
// wrapper included, internally). Which transport status the propagated
// CapabilityIdentityNotFoundError becomes is COR-04's concern, not this
// specification's: the shared status map (src/errors/status-map.ts)
// resolves it, a class distinct from ConceptNotAnsweredError,
// ConnectorConfigurationNotFoundError and CapabilityNotRegisteredForTestError,
// mirroring how each of those already answers its own route's structurally
// identical absence with its own class rather than a shared one.

import type { Capability } from '../capability-registry/capability.js';
import type {
  ReadCapabilityByIdentityParamsDto,
  ReadCapabilityByIdentityResponseDto,
} from './dto/read-capability-by-identity.dto.js';

/** Everything the controller needs beyond one request's own path parameters: CapabilityRegistryService's own readCapabilityByIdentityOrThrow wrapper, alone. */
export type ReadCapabilityByIdentityControllerDependencies = {
  readonly readCapabilityByIdentity: (name: string, version: string) => Promise<Capability>;
};

/**
 * Handles one read-capability-by-identity request end to end: resolves the
 * named (name, version) identity through readCapabilityByIdentityOrThrow,
 * answering with the held capability's whole declared contract where one
 * currently answers that identity, and leaving that wrapper's own thrown
 * CapabilityIdentityNotFoundError — for the shared status map to resolve —
 * to propagate where it answers no capability. No held-check-and-throw of
 * its own: the resolution the wrapper already committed to is returned as
 * is.
 */
export async function handleReadCapabilityByIdentityRequest(
  dependencies: ReadCapabilityByIdentityControllerDependencies,
  params: ReadCapabilityByIdentityParamsDto,
): Promise<ReadCapabilityByIdentityResponseDto> {
  return dependencies.readCapabilityByIdentity(params.name, params.version);
}
