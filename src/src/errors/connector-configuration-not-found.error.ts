/**
 * Not a business error of the registry itself:
 * contracts/integration/connector-configuration-registry's own
 * read-connector-configuration answer states the absence as ordinary data —
 * `{ held: false, connector }` — never an invented configuration and never a
 * failure of the read
 * (connector-configuration-registry.service.ts's own
 * ConnectorConfigurationResolution, mirroring capability-query.port.ts's own
 * CapabilityResolution). GET /v1/connectors/{connector} raises this typed
 * error only at the HTTP boundary, once it has read that ordinary
 * `held: false` answer, so the shared status map (COR-04,
 * src/errors/status-map.ts) can resolve the refusal to a transport status in
 * the one place that table lives, rather than a status chosen inline in the
 * route or its controller.
 */
export class ConnectorConfigurationNotFoundError extends Error {
  public readonly context: Readonly<{ connector: string }>;

  public constructor(connector: string) {
    super(`no connector configuration is currently registered for connector "${connector}"`);
    this.name = 'ConnectorConfigurationNotFoundError';
    this.context = { connector };
  }
}
