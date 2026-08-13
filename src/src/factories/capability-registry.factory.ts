import type { ICapabilityQuery } from '../capability-registry/capability-query.port.js';
import { CapabilityRegistryService } from '../capability-registry/capability-registry.service.js';
import type { DatabaseConnection } from '../persistence/database-connection.js';
import { RelationalCapabilityStore } from '../persistence/relational-capability-store.repository.js';

/**
 * Wires the capability registry module: the relational adapter behind the
 * domain's port, built from the one connection this composition shares
 * (task/service-on-the-database/store-wiring) rather than a data-directory
 * path — no directory of its own is read or written here.
 */
export function createCapabilityRegistry(connection: DatabaseConnection): CapabilityRegistryService {
  return new CapabilityRegistryService(new RelationalCapabilityStore(connection));
}

/**
 * Wires the published capability-registry contract
 * (contracts/integration/capability-registry) over the same relational
 * holding. What the caller receives is the contract alone, so an in-process
 * consumer resolves a concept to the capability currently answering it
 * without depending on the service or the store behind it.
 */
export function createCapabilityQuery(connection: DatabaseConnection): ICapabilityQuery {
  return createCapabilityRegistry(connection);
}
