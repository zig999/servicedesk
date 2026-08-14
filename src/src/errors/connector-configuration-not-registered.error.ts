/**
 * A configuration fault of HttpDeclarativeObservationSource: the calling
 * capability's own connector names no configuration the
 * connector-configuration registry currently holds — a registration bug (a
 * capability registered against a connector nobody ever called
 * registerConnector for), the same "descriptor absent is a configuration
 * error, not one of the four endings" posture intake/scope.md's own
 * algorithm sketches, non-binding on mechanism but not on this distinction.
 * Never one of the four evidence-result endings this adapter answers
 * (domain/investigation/evidence-result): a genuine unexpected fault,
 * propagated as a rejection rather than degraded to one of the four.
 */
export class ConnectorConfigurationNotRegisteredError extends Error {
  public readonly context: Readonly<{ connector: string }>;

  public constructor(connector: string) {
    super(`no connector configuration is currently registered for connector "${connector}"`);
    this.name = 'ConnectorConfigurationNotRegisteredError';
    this.context = { connector };
  }
}
