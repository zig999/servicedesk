---
entries:
- field: operations
  unstated: The material asked only for creating and editing a connector configuration, without stating whether the published surface also exposes reading one or listing all of them.
  decided: read-connector-configuration and list-connector-configurations are published alongside register-connector.
  why: Editing an existing connector configuration requires reading it first, exactly as capability-registry already publishes read-capability and list-capabilities alongside register-capability; this mirrors that sibling contract's own shape rather than introducing a new judgment about what an authoring surface needs.
- field: operations
  unstated: The material names the HTTP route (DELETE /v1/connectors/:connector) a connector configuration's removal takes, not the domain operation's own name.
  decided: remove-connector
  why: Same naming convention as remove-concept and remove-capability, paired with this registry's own register-connector.
---
