export class IncompleteConnectorCallDescriptorError extends Error {
  public readonly context: Readonly<{ problems: readonly string[] }>;

  public constructor(problems: readonly string[]) {
    super(`the connector's own call configuration is not a well-formed call descriptor: ${problems.join('; ')}`);
    this.name = 'IncompleteConnectorCallDescriptorError';
    this.context = { problems };
  }
}
