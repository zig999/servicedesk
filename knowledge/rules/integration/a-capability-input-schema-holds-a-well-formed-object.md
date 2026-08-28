---
type: invariant
statement: A registered capability's input schema, once syntactically valid JSON, declares at its top level an object named properties, and, where declared, an array named required that is a subset of properties' own keys; a registration whose input schema departs from this shape is refused with an HTTP 422 response reporting a MalformedCapabilityInputSchemaError naming every departure.
constrains:
  - domain/integration/capability
---

## Description

The output schema already lives by this same convention — a top-level properties object, its keys the field names a citation may name — but only by an inference this specification discloses, never checked at registration, because nothing yet reads an output schema's own content to decide anything at write time.
This rule is that same convention, now declared and enforced for the input schema alone: a properties key names one subject attribute the capability uses, and required names which of those it cannot observe without. An empty properties object is a valid declaration on its own — a capability whose connector reads nothing from the subject, only a credential or the requester, declares no attribute and requires none.
Distinct from a-capability-declares-well-formed-schemas, which only ever asks whether the text parses: a schema that parses and still holds no properties object, or a required naming a key properties does not hold, is well-formed JSON and malformed all the same, and this rule is what catches it.
A capability registered before this rule existed, whose stored input schema does not hold this shape, is read as declaring properties and required both empty — malformed is nothing declared, never a fault at read — the same posture a-capability-declares-well-formed-schemas already gives a schema that fails to parse at all, wherever anything reads a schema's content.
