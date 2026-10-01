---
entries:
- field: statement
  unstated: What read-connector-configuration answers when the connector name it is given resolves to no registered configuration — the api contract publishes the operation but, as an api, cannot declare a refusal itself (that field is command-only per the contract schema), so the fact had no addressable home at all.
  decided: A read of a connector configuration by a connector name nothing has registered is refused with an HTTP 404 response reporting a ConnectorConfigurationNotFoundError.
  why: The only addressable home an api's own read can give a refusal is a rule constraining the domain element being read, and this registry already has one such rule — a-connector-configuration-holds-a-well-formed-object, anchored to domain/integration/connector-configuration rather than to the domain-service, because read-connector-configuration itself answers to no domain-service operation of its own. Naming the HTTP status and the error value keeps the refusal a fact the specification states rather than one left for code alone to carry, the same discipline the-capability-identity-read-is-rate-limited already used in naming its own status (429) rather than leaving a caller's slow-down refusal unstated.
---
