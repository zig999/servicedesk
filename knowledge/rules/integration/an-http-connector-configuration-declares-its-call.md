---
type: invariant
statement: A connector configuration executed by the HTTP connector declares a method that is one of GET, POST, PUT, PATCH or DELETE, a responseMap that is an object of string paths, and a statusMap that is an object mapping an HTTP status to one evidence-result ending; an observation reaching a configuration that lacks any of the three issues no call and ends unavailable, with a result detail reporting a MalformedHttpConnectorConfigurationError. The same configuration declares an address, a non-empty string, and may declare a query and headers, each an object of string values, and a body of any shape; any of the four may embed one or more placeholders naming a Subject attribute, the requester, or a credential read from environment configuration at resolution time, substituted as plain text and never evaluated as code. A configuration missing its address, declaring query or headers as anything but an object of string values, naming a placeholder kind this connector does not recognize, naming a placeholder with no argument where one is required, or naming a Subject attribute or a credential that resolves to nothing, is refused before any call is assembled.
constrains:
  - domain/integration/connector-configuration
---

## Description

The registry still holds a connector configuration to nothing but well-formedness (a-connector-configuration-holds-a-well-formed-object), because what its keys mean is the executing connector's own business.
This rule is that connector's statement of what it needs, for the one connector kind this build ships, so an operator learns the required keys from the specification rather than from a failed collection.
The absence is answered as an ending rather than a fault because collection records how an attempt ended and never raises (domain/investigation/evidence).
The address, query, headers and body, and their placeholder mechanism, are the same connector's statement of how its call reaches into a Subject, a requester and a credential without either living in the configuration's own text — `rules/integration/a-diagnostic-response-masks-a-resolved-credential` already presumes a credential placeholder exists and masks what it resolves to; this is the first node stating the mechanism itself.
A request assembled from a configuration missing its address or naming an unresolvable placeholder is refused before it is ever issued — a fact about the call's own assembly, not a new evidence-result ending, and distinct from the missing-key case above.
