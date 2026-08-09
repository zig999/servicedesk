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
