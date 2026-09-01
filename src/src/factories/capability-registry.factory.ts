import type { ICapabilityQuery } from '../capability-registry/capability-query.port.js';
import { CapabilityRegistryService } from '../capability-registry/capability-registry.service.js';
import type { IConnectorConfigurationsReader } from '../capability-registry/connector-configurations-reader.port.js';
import type { ICapabilitiesReader } from '../connector-registry/capabilities-reader.port.js';
import type { DatabaseConnection } from '../persistence/database-connection.js';
import { RelationalCapabilityStore } from '../persistence/relational-capability-store.repository.js';

const NO_REGISTERED_CONNECTOR_CONFIGURATIONS: IConnectorConfigurationsReader = {
  readConnectorConfigurations: () => Promise.resolve([]),
};

export function createCapabilityRegistry(
  connection: DatabaseConnection,
  connectorConfigurationsReader: IConnectorConfigurationsReader = NO_REGISTERED_CONNECTOR_CONFIGURATIONS,
): CapabilityRegistryService {
  return new CapabilityRegistryService(new RelationalCapabilityStore(connection), connectorConfigurationsReader);
}

export function createCapabilityQuery(connection: DatabaseConnection): ICapabilityQuery {
  return createCapabilityRegistry(connection);
}

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
