import { ConnectorConfigurationRegistryService } from '../connector-registry/connector-configuration-registry.service.js';
import type { DatabaseConnection } from '../persistence/database-connection.js';
import { RelationalConnectorConfigurationStore } from '../persistence/relational-connector-configuration-store.repository.js';

/**
 * Wires the connector-configuration registry module: the relational
 * adapter behind its own store port, built from the one connection this
 * composition shares — the same wiring shape
 * capability-registry.factory.ts already holds for the capability
 * registry, and task/service-on-the-database/store-wiring's own convention
 * of building every store from the shared connection rather than a
 * data-directory path of its own.
 */
export function createConnectorConfigurationRegistry(
  connection: DatabaseConnection,
): ConnectorConfigurationRegistryService {
  return new ConnectorConfigurationRegistryService(new RelationalConnectorConfigurationStore(connection));
}
