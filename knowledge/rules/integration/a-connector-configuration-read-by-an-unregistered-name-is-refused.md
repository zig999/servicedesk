---
type: invariant
statement: A read of a connector configuration by a connector name nothing has registered is refused with an HTTP 404 response reporting a ConnectorConfigurationNotFoundError.
constrains:
  - domain/integration/connector-configuration
---

## Description

Nothing said what read-connector-configuration answers when the name it is asked for resolves to nothing: an unregistered name is not an ordinary empty result a caller could read as though something answered to it, but a refusal of its own, addressable by an error value of its own — the same distinction a-connector-configuration-holds-a-well-formed-object already draws for a malformed write, held here for a miss on read.
