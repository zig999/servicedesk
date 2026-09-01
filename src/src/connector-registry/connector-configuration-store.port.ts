import type { ConnectorConfiguration } from './connector-configuration.js';

export interface IConnectorConfigurationStore {

  readConnectorConfigurations(): Promise<readonly ConnectorConfiguration[]>;

  writeConnectorConfigurations(configurations: readonly ConnectorConfiguration[]): Promise<void>;
}
