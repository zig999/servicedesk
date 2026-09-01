export class ConnectorConfigurationNotFoundError extends Error {
  public readonly context: Readonly<{ connector: string }>;

  public constructor(connector: string) {
    super(`no connector configuration is currently registered for connector "${connector}"`);
    this.name = 'ConnectorConfigurationNotFoundError';
    this.context = { connector };
  }
}
