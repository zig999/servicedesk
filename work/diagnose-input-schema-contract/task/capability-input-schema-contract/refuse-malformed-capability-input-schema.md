---
title: Refuse a malformed capability input schema, and read a legacy one as empty
summary: registerCapability gains a well-formed-input-schema shape check, and a shared
  shape reader answers a pre-existing malformed input_schema as declaring properties
  and required both empty.
sources:
- work/diagnose-input-schema-contract/intake/scope.md
objective: A registered capability's input_schema is held to the declared shape (properties
  as an object, required a subset of its keys) at registration, and a capability whose
  stored input_schema predates this check and does not hold that shape is read, wherever
  the shape is read, as declaring properties and required both empty rather than failing.
criteria:
- Registering a capability whose input_schema, once valid JSON, does not declare properties
  as an object is refused with an HTTP 422 response reporting MalformedCapabilityInputSchemaError.
- Registering a capability whose input_schema declares a required array naming a key
  absent from properties is refused with an HTTP 422 response reporting MalformedCapabilityInputSchemaError.
- A single registration departing from the shape in more than one way is refused with
  one MalformedCapabilityInputSchemaError naming every departure together.
- Registering a capability whose input_schema declares an empty properties object
  and no required array succeeds.
- Reading the declared shape of a capability's input_schema that was stored before
  this check existed, and does not hold this shape, answers properties and required
  both empty rather than throwing or refusing.
- MalformedCapabilityInputSchemaError resolves to 422 through the shared status map.
rationale: The scope states the check and the legacy-read posture as one rule but
  leaves the exact code seam to this decomposition. The inventory names declaredFieldsOf
  (citation-validation.ts) as the direct structural sibling this new shape reader
  must extend or sit beside rather than duplicate; building that shared reader here,
  in the task that owns the rule it comes from, is what lets the case-input-requirements
  derivation reuse it rather than writing a second one.
implements:
- domain/integration/capability
- domain/integration/capability-registry
- rules/integration/a-capability-input-schema-holds-a-well-formed-object
- contracts/integration/capability-registry
---

## What it is
registerCapability gains a well-formed-input-schema shape check, and a shared shape reader answers a pre-existing malformed input_schema as declaring properties and required both empty.

## Notes
None.
