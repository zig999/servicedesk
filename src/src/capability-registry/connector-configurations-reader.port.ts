export type RegisteredConnectorConfigurationForPlaceholderCheck = {
  readonly connector: string;
  readonly configuration: string;
};

export interface IConnectorConfigurationsReader {

  readConnectorConfigurations(): Promise<readonly RegisteredConnectorConfigurationForPlaceholderCheck[]>;
}
