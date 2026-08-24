/**
 * rules/integration/a-connector-configuration-is-tested-through-a-registered-capability:
 * a connector configuration is tested only through the specific,
 * already-registered capability that names it as its own connector — never
 * through a different capability naming a different connector (criterion 4:
 * requesting test-connector naming a connector configuration the
 * capability's own connector does not match is refused).
 * test-connector.controller.ts raises this once it has read the named
 * capability's own connector field and found it does not match the
 * connector the request named, so the shared status map (COR-04,
 * src/errors/status-map.ts) resolves the refusal to a transport status in
 * the one place that table lives, rather than a status chosen inline.
 */
export class CapabilityConnectorMismatchError extends Error {
  public readonly context: Readonly<{ capabilityConnector: string; requestedConnector: string }>;

  public constructor(capabilityConnector: string, requestedConnector: string) {
    super(
      `the named capability's own connector is "${capabilityConnector}", not the requested connector "${requestedConnector}"`,
    );
    this.name = 'CapabilityConnectorMismatchError';
    this.context = { capabilityConnector, requestedConnector };
  }
}
