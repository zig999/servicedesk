// The connector-configuration vocabulary as data
// (task/connector-registration/connector-configuration-persistence): pure
// values with no behavior, the same role capability-registry/capability.ts
// already plays for the capability vocabulary.
//
// No Domain Model element describes this shape: domain/integration/capability's
// own "connector" attribute is a deliberately opaque string (decision-log —
// "an opaque string keeps vendors out of the model"), and
// domain/investigation/subject states that a connector "resolves
// internally ... which of the attributes it needs and how to derive its
// call from them." So whatever a connector needs at call time is held here
// as one opaque, untyped payload rather than a declared shape (address,
// method, mapping, ...) this module would otherwise have had to invent —
// exactly the technical design this task's own Notes leave to the
// implementer, and the same design constraints/the-stored-schema-mirrors-
// the-declared-model exists to keep out of a schema that has no declared
// attribute to pair a named column with.

/**
 * Whatever configuration one connector needs to reach its external system
 * at call time, as the registry holds it: the connector identity — exactly
 * the value domain/integration/capability's own "connector" attribute
 * names — paired with its own opaque configuration payload, held and
 * returned whole rather than interpreted by this module.
 */
export type ConnectorConfiguration = {
  readonly connector: string;
  readonly configuration: Readonly<Record<string, unknown>>;
};

/**
 * A connector configuration as its registration submits it: either
 * attribute may still be absent or malformed — the registry, never the
 * type, is what refuses a registration departing from the minimum shape
 * below (connector-configuration-registry.service.ts's own
 * registerConnector).
 */
export type ConnectorConfigurationRegistration = {
  readonly connector?: string;
  readonly configuration?: unknown;
};
