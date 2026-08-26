/**
 * A configuration fault of the connector's own opaque call configuration:
 * it does not declare the minimum shape the HTTP connector requires to
 * drive a call — a method outside the ones it issues, a responseMap that is
 * not a plain object of string paths, or a statusMap that does not map
 * every declared status to one of the four evidence-result endings
 * (rules/integration/an-http-connector-configuration-declares-its-call).
 * Still thrown by asHttpConnectorCallConfiguration itself, the shared
 * narrowing test-connector.controller.ts also calls directly and where this
 * fault still propagates unmodified, refusing before any request is
 * assembled. Where HttpDeclarativeObservationSource's own observe-concept
 * meets this fault, it catches it there instead: the adapter answers
 * 'unavailable' with a result_detail naming this class rather than letting
 * it propagate (rules/integration/an-unresolvable-observation-ends-unavailable,
 * domain/investigation/evidence) — the same name-message-context shape
 * IncompleteConnectorCallDescriptorError already establishes for the
 * sibling request-assembly refusal.
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
