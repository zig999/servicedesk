/**
 * A configuration fault of HttpDeclarativeObservationSource: the connector's
 * own opaque call configuration does not declare the minimum shape this
 * adapter requires to drive an HTTP call — a method outside the ones this
 * adapter issues, a responseMap that is not a plain object of string paths,
 * or a statusMap that does not map every declared status to one of the four
 * evidence-result endings. Refused before any request is assembled, since a
 * configuration missing this minimum shape gives the adapter nothing sound
 * to call — the same name-message-context shape
 * IncompleteConnectorCallDescriptorError already establishes for the
 * sibling request-assembly refusal, and never one of the four
 * evidence-result endings this adapter answers.
 */
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
