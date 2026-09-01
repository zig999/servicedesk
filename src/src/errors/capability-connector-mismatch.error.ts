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
