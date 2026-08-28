---
type: policy
statement: A connector configuration registration or edit is refused if a placeholder naming a Subject attribute, in its own text, names an attribute absent from the properties the input schema of a capability currently registered against that connector's name declares; a capability registration is refused likewise if the connector it names already holds a registered configuration whose own text embeds a placeholder naming a Subject attribute absent from this registration's own input schema properties. Either refusal is an HTTP 422 response reporting a ConnectorPlaceholderOutsideInputSchemaError naming every orphaned placeholder together with the capability that fails to declare it.
constrains:
  - domain/integration/capability
  - domain/integration/connector-configuration
consistency: eventual
---

## Description

a-capability-input-schema-holds-a-well-formed-object fixes what properties declares; this is the other half — what a connector configuration's own placeholders actually name must stay inside it, checked at both writes that could put them out of step, against whatever is registered on the other side at that moment.
Registering a capability before its connector is ever configured stays possible, and so does configuring a connector before any capability names it — this rule reconciles only what already exists on both sides at the moment of a write, never forcing an order. The two registrations can still transiently disagree between one write and the next, in an order the specification permits; an-unresolvable-observation-ends-unavailable's own degrade, not a fault, is what an observation reaching that gap answers with meanwhile.
Only a placeholder naming a Subject attribute is held to this — a placeholder naming the requester or a credential names no subject attribute, so properties has nothing to check it against.
Testing a connector configuration through its capability (a-connector-configuration-is-tested-through-a-registered-capability) reports this same check for the pairing under test, since that diagnostic exists exactly to expose this seam to an operator.
