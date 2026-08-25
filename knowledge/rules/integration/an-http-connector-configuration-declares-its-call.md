---
type: invariant
statement: A connector configuration executed by the HTTP connector declares a method that is one of GET, POST, PUT, PATCH or DELETE, a responseMap that is an object of string paths, and a statusMap that is an object mapping an HTTP status to one evidence-result ending; an observation reaching a configuration that lacks any of the three issues no call and ends unavailable, with a result detail reporting a MalformedHttpConnectorConfigurationError.
constrains:
  - domain/integration/connector-configuration
---

## Description

The registry still holds a connector configuration to nothing but well-formedness (a-connector-configuration-holds-a-well-formed-object), because what its keys mean is the executing connector's own business.
This rule is that connector's statement of what it needs, for the one connector kind this build ships, so an operator learns the required keys from the specification rather than from a failed collection.
The absence is answered as an ending rather than a fault because collection records how an attempt ended and never raises (domain/investigation/evidence).
