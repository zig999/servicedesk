import type { IConnectorConfigurationsReader } from '../capability-registry/connector-configurations-reader.port.js';
import type { ICapabilitiesReader } from '../connector-registry/capabilities-reader.port.js';
import { ConnectorConfigurationRegistryService } from '../connector-registry/connector-configuration-registry.service.js';
import type { DatabaseConnection } from '../persistence/database-connection.js';
import { RelationalConnectorConfigurationStore } from '../persistence/relational-connector-configuration-store.repository.js';

/**
 * The capabilities reader a caller naming none is given — every
 * pre-existing single-argument createConnectorConfigurationRegistry call
 * across this codebase among them: the empty list, matching
 * ConnectorConfigurationRegistryService's own default
 * (task/connector-configuration-and-placeholder-contract/build-placeholder-declaration-check).
 */
const NO_REGISTERED_CAPABILITIES: ICapabilitiesReader = {
  readCapabilities: () => Promise.resolve([]),
};

/**
 * Wires the connector-configuration registry module: the relational
 * adapter behind its own store port, built from the one connection this
 * composition shares — the same wiring shape
 * capability-registry.factory.ts already holds for the capability
 * registry, and task/service-on-the-database/store-wiring's own convention
 * of building every store from the shared connection rather than a
 * data-directory path of its own. Takes the connector-configuration
 * registry's own narrow read of the capability registry's current state as
 * a second, defaulted parameter
 * (task/connector-configuration-and-placeholder-contract/build-placeholder-declaration-check)
 * — build-app.factory.ts's own composeResources is the one caller that
 * supplies createCapabilitiesReader below rather than the default; every
 * other existing caller is unaffected.
 */
export function createConnectorConfigurationRegistry(
  connection: DatabaseConnection,
  capabilitiesReader: ICapabilitiesReader = NO_REGISTERED_CAPABILITIES,
): ConnectorConfigurationRegistryService {
  return new ConnectorConfigurationRegistryService(
    new RelationalConnectorConfigurationStore(connection),
    capabilitiesReader,
  );
}

/**
 * The capability registry's own narrow read of the connector-configuration
 * registry's current state
 * (rules/integration/a-connector-placeholder-is-declared-by-its-capability;
 * task/connector-configuration-and-placeholder-contract/build-placeholder-declaration-check),
 * backed by a RelationalConnectorConfigurationStore built from the same
 * connection the connector-configuration registry itself is built from —
 * the same "read fresh from the database on every call" store, never a
 * second persistence mechanism or a cache of the registry's own state.
 */
export function createConnectorConfigurationsReader(connection: DatabaseConnection): IConnectorConfigurationsReader {
  const store = new RelationalConnectorConfigurationStore(connection);
  return { readConnectorConfigurations: () => store.readConnectorConfigurations() };
}
