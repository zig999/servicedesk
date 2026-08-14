/**
 * A business error of the connector-request resolver: the connector's own
 * call configuration does not declare a well-formed call descriptor — an
 * address that is not a non-empty string, a declared query or headers value
 * that is not a plain object of strings, or a placeholder inside address,
 * query, headers or body naming a kind this resolver does not recognize, or
 * naming no attribute or variable at all. Refused before any substitution is
 * attempted and before any request is assembled, since a descriptor missing
 * this minimum shape gives the resolver nothing sound to build a request
 * from. The same name-message-context shape
 * IncompleteConnectorConfigurationError already establishes for the
 * sibling registration-time refusal.
 */
export class IncompleteConnectorCallDescriptorError extends Error {
  public readonly context: Readonly<{ problems: readonly string[] }>;

  public constructor(problems: readonly string[]) {
    super(`the connector's own call configuration is not a well-formed call descriptor: ${problems.join('; ')}`);
    this.name = 'IncompleteConnectorCallDescriptorError';
    this.context = { problems };
  }
}
