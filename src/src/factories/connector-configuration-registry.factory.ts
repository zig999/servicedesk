import type { IConnectorConfigurationsReader } from '../capability-registry/connector-configurations-reader.port.js';
import type { ICapabilitiesReader } from '../connector-registry/capabilities-reader.port.js';
import { ConnectorConfigurationRegistryService } from '../connector-registry/connector-configuration-registry.service.js';
import type { DatabaseConnection } from '../persistence/database-connection.js';
import { RelationalConnectorConfigurationStore } from '../persistence/relational-connector-configuration-store.repository.js';

const NO_REGISTERED_CAPABILITIES: ICapabilitiesReader = {
  readCapabilities: () => Promise.resolve([]),
};

export function createConnectorConfigurationRegistry(
  connection: DatabaseConnection,
  capabilitiesReader: ICapabilitiesReader = NO_REGISTERED_CAPABILITIES,
): ConnectorConfigurationRegistryService {
  return new ConnectorConfigurationRegistryService(
    new RelationalConnectorConfigurationStore(connection),
    capabilitiesReader,
  );
}

export function createConnectorConfigurationsReader(connection: DatabaseConnection): IConnectorConfigurationsReader {
  const store = new RelationalConnectorConfigurationStore(connection);
  return { readConnectorConfigurations: () => store.readConnectorConfigurations() };
}
