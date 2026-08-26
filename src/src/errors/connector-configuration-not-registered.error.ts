/**
 * The condition of HttpDeclarativeObservationSource: the calling capability's
 * own connector names no configuration the connector-configuration registry
 * currently holds — a registration bug (a capability registered against a
 * connector nobody ever called registerConnector for). Instantiated to read
 * its own `.name` and never thrown from this adapter's own observe-concept
 * path: the adapter answers 'unavailable' with a result_detail naming this
 * class rather than raising it
 * (rules/integration/an-unresolvable-observation-ends-unavailable,
 * domain/investigation/evidence). Still an ordinary thrown Error everywhere
 * else it is used.
 */
export class ConnectorConfigurationNotRegisteredError extends Error {
  public readonly context: Readonly<{ connector: string }>;

  public constructor(connector: string) {
    super(`no connector configuration is currently registered for connector "${connector}"`);
    this.name = 'ConnectorConfigurationNotRegisteredError';
    this.context = { connector };
  }
}
