// The narrow port through which the capability registry reads every
// connector configuration currently registered
// (rules/integration/a-connector-placeholder-is-declared-by-its-capability;
// task/connector-configuration-and-placeholder-contract/build-placeholder-declaration-check):
// only the connector identity and its own call text, since that is all this
// registry's own placeholder-declaration reconciliation needs — never the
// connector-configuration registry's own service, store or type, so this
// module names no dependency on connector-registry at all
// (domain/integration/capability-registry's own "the most generic piece of
// the system"). The composition root supplies the implementation, backed by
// the same connector-configuration store the connector-configuration
// registry itself reads and writes through
// (factories/connector-configuration-registry.factory.ts's own
// createConnectorConfigurationsReader).

/** One connector configuration as this registry's own reconciliation check needs it — the connector identity and its own call text, nothing else. */
export type RegisteredConnectorConfigurationForPlaceholderCheck = {
  readonly connector: string;
  readonly configuration: string;
};

/** The capability registry's own narrow read of the connector-configuration registry's current state. */
export interface IConnectorConfigurationsReader {
  /** Every connector configuration currently registered, read through the same store the connector-configuration registry itself reads. */
  readConnectorConfigurations(): Promise<readonly RegisteredConnectorConfigurationForPlaceholderCheck[]>;
}
