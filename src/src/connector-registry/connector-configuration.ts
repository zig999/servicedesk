export type ConnectorConfiguration = {
  readonly connector: string;
  readonly configuration: string;
};

export type ConnectorConfigurationRegistration = {
  readonly connector?: string;
  readonly configuration?: unknown;
};
