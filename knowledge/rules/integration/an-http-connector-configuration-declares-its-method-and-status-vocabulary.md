---
type: invariant
statement: A connector configuration executed by the HTTP connector declares a method that is one of GET, POST, PUT, PATCH or DELETE, a responseMap that is an object of string paths, and a statusMap that is an object mapping an HTTP status to one evidence-result ending; an observation reaching a configuration that lacks any of the three issues no call and ends unavailable, with a result detail reporting a MalformedHttpConnectorConfigurationError, and that result detail states beside that error the vocabulary the malformed key is held to — where the method is not one of the five, the methods an HTTP connector configuration may declare, and where the statusMap is not such an object, the evidence-result endings a statusMap may map a status to.
constrains:
  - domain/integration/connector-configuration
---

## Description

The registry still holds a connector configuration to nothing but well-formedness (a-connector-configuration-holds-a-well-formed-object), because what its keys mean is the executing connector's own business. This rule is that connector's statement of what it needs, for the one connector kind this build ships, so an operator learns the required keys from the specification rather than from a failed collection. The absence is answered as an ending rather than a fault because collection records how an attempt ended and never raises (domain/investigation/evidence).

The detail states the vocabulary a malformed method or statusMap was held to for the same reason the rule states the keys at all: the configuration is authored directly and opaquely (domain/integration/connector-configuration), so the accepted values are what an operator has to learn to correct the one that failed. Those values are this rule's own text and domain/investigation/evidence-result's own values, so stating them carries nothing out of the failed call — unlike the assembled address, query, headers and body, which an-unreachable-connector-ends-unavailable keeps out of a detail because a credential placeholder may have resolved into them.
