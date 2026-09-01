export class IncompleteConnectorConfigurationError extends Error {
  public readonly context: Readonly<{ problems: readonly string[] }>;

  public constructor(problems: readonly string[]) {
    super(`the registration does not declare a complete connector configuration: ${problems.join('; ')}`);
    this.name = 'IncompleteConnectorConfigurationError';
    this.context = { problems };
  }
}
