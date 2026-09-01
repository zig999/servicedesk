export class MalformedHttpConnectorConfigurationError extends Error {
  public readonly context: Readonly<{ connector: string; problems: readonly string[] }>;

  public constructor(connector: string, problems: readonly string[]) {
    super(
      `connector "${connector}"'s own call configuration is not a well-formed HTTP configuration: ${problems.join('; ')}`,
    );
    this.name = 'MalformedHttpConnectorConfigurationError';
    this.context = { connector, problems };
  }
}
