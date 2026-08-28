// The narrow port through which the connector-configuration registry reads
// every capability currently registered
// (rules/integration/a-connector-placeholder-is-declared-by-its-capability;
// task/connector-configuration-and-placeholder-contract/build-placeholder-declaration-check):
// only the connector it names and its own declared input schema, since that
// is all this registry's own placeholder-declaration reconciliation needs —
// never the capability registry's own service or store. The composition
// root supplies the implementation, backed by the same capability store the
// capability registry itself reads and writes through
// (factories/capability-registry.factory.ts's own createCapabilitiesReader).

/** One capability as this registry's own reconciliation check needs it — the connector it names and its own declared input schema, nothing else. */
export type RegisteredCapabilityForPlaceholderCheck = {
  readonly connector: string;
  readonly input_schema: string;
};

/** The connector-configuration registry's own narrow read of the capability registry's current state. */
export interface ICapabilitiesReader {
  /** Every capability currently registered, read through the same store the capability registry itself reads. */
  readCapabilities(): Promise<readonly RegisteredCapabilityForPlaceholderCheck[]>;
}
