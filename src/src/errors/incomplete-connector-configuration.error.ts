/**
 * A business error of the connector-configuration registry: the
 * registration does not declare the minimum shape this registry requires —
 * a connector identity and a configuration payload that is a plain object —
 * and the registry refuses it before any write.
 */
export class IncompleteConnectorConfigurationError extends Error {
  public readonly context: Readonly<{ problems: readonly string[] }>;

  public constructor(problems: readonly string[]) {
    super(`the registration does not declare a complete connector configuration: ${problems.join('; ')}`);
    this.name = 'IncompleteConnectorConfigurationError';
    this.context = { problems };
  }
}
