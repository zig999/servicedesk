import type { ICapabilityQuery } from '../capability-registry/capability-query.port.js';
import { CapabilityRegistryService } from '../capability-registry/capability-registry.service.js';
import type { IConnectorConfigurationsReader } from '../capability-registry/connector-configurations-reader.port.js';
import type { ICapabilitiesReader } from '../connector-registry/capabilities-reader.port.js';
import type { DatabaseConnection } from '../persistence/database-connection.js';
import { RelationalCapabilityStore } from '../persistence/relational-capability-store.repository.js';

/**
 * The connector-configurations reader a caller naming none is given —
 * every pre-existing single-argument createCapabilityRegistry call across
 * this codebase among them: the empty list, matching
 * CapabilityRegistryService's own default
 * (task/connector-configuration-and-placeholder-contract/build-placeholder-declaration-check).
 * Named here too, rather than imported from the service module, so this
 * exported function's own arity (one required parameter) stays what
 * __tests__/unit/factories/store-wiring.spec.ts's own regex sweep already
 * asserts.
 */
const NO_REGISTERED_CONNECTOR_CONFIGURATIONS: IConnectorConfigurationsReader = {
  readConnectorConfigurations: () => Promise.resolve([]),
};

/**
 * Wires the capability registry module: the relational adapter behind the
 * domain's port, built from the one connection this composition shares
 * (task/service-on-the-database/store-wiring) rather than a data-directory
 * path — no directory of its own is read or written here. Takes the
 * capability registry's own narrow read of the connector-configuration
 * registry's current state as a second, defaulted parameter
 * (task/connector-configuration-and-placeholder-contract/build-placeholder-declaration-check)
 * — build-app.factory.ts's own composeResources is the one caller that
 * supplies createConnectorConfigurationsReader below rather than the
 * default; every other existing caller is unaffected.
 */
export function createCapabilityRegistry(
  connection: DatabaseConnection,
  connectorConfigurationsReader: IConnectorConfigurationsReader = NO_REGISTERED_CONNECTOR_CONFIGURATIONS,
): CapabilityRegistryService {
  return new CapabilityRegistryService(new RelationalCapabilityStore(connection), connectorConfigurationsReader);
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

/**
 * The connector-configuration registry's own narrow read of the capability
 * registry's current state
 * (rules/integration/a-connector-placeholder-is-declared-by-its-capability;
 * task/connector-configuration-and-placeholder-contract/build-placeholder-declaration-check),
 * backed by a RelationalCapabilityStore built from the same connection the
 * capability registry itself is built from — the same "read fresh from the
 * database on every call" store, never a second persistence mechanism or a
 * cache of the registry's own state.
 */
export function createCapabilitiesReader(connection: DatabaseConnection): ICapabilitiesReader {
  const store = new RelationalCapabilityStore(connection);
  return {
    readCapabilities: async () =>
      (await store.readCapabilities()).map(({ connector, input_schema: inputSchema }) => ({
        connector,
        input_schema: inputSchema,
      })),
  };
}
