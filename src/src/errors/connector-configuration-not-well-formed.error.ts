export class ConnectorConfigurationNotWellFormedError extends Error {
  public readonly context: Readonly<{ reason: string }>;

  public constructor(reason: string) {
    super(`the registry refuses a registration whose configuration is not syntactically valid JSON object text: ${reason}`);
    this.name = 'ConnectorConfigurationNotWellFormedError';
    this.context = { reason };
  }
}
