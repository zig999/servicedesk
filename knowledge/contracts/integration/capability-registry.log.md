---
entries:
- field: operations
  unstated: The same review decided registered capabilities need a listing, without naming the operation.
  decided: list-capabilities, added to capability-registry's own operations, alongside read-capability.
  why: The registry already publishes the one synchronous read a consumer depends on; a listing is the same read at a different cardinality, so it belongs beside read-capability rather than a second api.
- field: operations
  unstated: The material asked for a way to resolve a specific, already-known capability directly by its own identity — name and version together — without depending on which concept it currently answers; this contract's operations list was already closed and exhaustive over read-capability, list-capabilities and register-capability, so the absence of an identity-keyed read was the specification's own current statement rather than a silence, until this material asked for one.
  decided: read-capability-by-identity, added to capability-registry's own operations, alongside read-capability, list-capabilities and register-capability.
  why: An admin frontend needs a detail/edit screen addressed by a capability's own (name, version) identity that loads directly on first navigation or a page refresh — the same shape read-connector-configuration already serves for connector-configuration-registry's own single identity (connector) — and read-capability's existing concept-keyed resolution cannot serve this, since a screen editing an already-known capability does not need, and may not yet know, which concept it currently answers. This mirrors the same reasoning already used when list-capabilities and read-capability were themselves added to this operations list — a new read at a different cardinality or key belongs beside the existing reads rather than opening a second api. Left off domain/integration/capability-registry.md's own operations, matching the established pattern there — that domain-service's operations already name only register-capability and resolve-concept, never read-capability or list-capabilities either, so a read is consistently a contract-level surface over this domain-service, not one of its own declared operations.
- field: operations
  unstated: The material names the HTTP route (DELETE /v1/capabilities/:name/:version) a capability's removal takes, not the domain operation's own name.
  decided: remove-capability
  why: Same naming convention as remove-concept and remove-connector, paired with this registry's own register-capability.
---
