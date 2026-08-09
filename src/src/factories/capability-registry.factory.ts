import type { ICapabilityQuery } from '../capability-registry/capability-query.port.js';
import { CapabilityRegistryService } from '../capability-registry/capability-registry.service.js';
import { FileCapabilityStore } from '../persistence/file-capability-store.repository.js';

/**
 * Wires the capability registry module: the file-backed store behind the
 * domain's port. The data directory is the caller's to choose, so no data
 * path is written in source.
 */
export function createCapabilityRegistry(dataDirectory: string): CapabilityRegistryService {
  return new CapabilityRegistryService(new FileCapabilityStore(dataDirectory));
}

/**
 * Wires the published capability-registry contract
 * (contracts/integration/capability-registry) over the same file-backed
 * holding. What the caller receives is the contract alone, so an in-process
 * consumer resolves a concept to the capability currently answering it
 * without depending on the service or the store behind it.
 */
export function createCapabilityQuery(dataDirectory: string): ICapabilityQuery {
  return createCapabilityRegistry(dataDirectory);
}
