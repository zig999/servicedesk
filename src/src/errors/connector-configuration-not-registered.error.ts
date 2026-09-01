export class ConnectorConfigurationNotRegisteredError extends Error {
  public readonly context: Readonly<{ connector: string }>;

  public constructor(connector: string) {
    super(`no connector configuration is currently registered for connector "${connector}"`);
    this.name = 'ConnectorConfigurationNotRegisteredError';
    this.context = { connector };
  }
}
