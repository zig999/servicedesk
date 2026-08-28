---
title: Refuse a malformed capability input schema, and read a legacy one as empty
summary: registerCapability now refuses an input_schema that parses but does not hold the declared shape,
  and a new shared reader answers a shape-departing input_schema (new or pre-existing) as declaring properties
  and required both empty.
task: sha256:71c769eb5128518f27a56e1edb7fe896d63a877491ccdee7e212a2522d74c22a
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/capability-input-schema-contract-refuse-malformed-capability-input-schema-build
files:
- path: src/capability-registry/capability-input-schema-shape.ts
  effect: 'new module owning the input_schema shape logic — inputSchemaShapeProblems(parsed) names every
    way a parsed input schema departs from the declared shape (properties not an object once declared,
    required not an array, or required naming a key properties does not hold; an absent properties key
    is read as an implicit empty object, never a departure), and declaredInputSchemaShape(inputSchema)
    is the permissive shared reader that answers { properties: [], required: [] } for anything that does
    not parse or does not hold the shape.'
- path: src/errors/malformed-capability-input-schema.error.ts
  effect: new typed domain error MalformedCapabilityInputSchemaError, carrying a readonly context.problems
    array naming every departure together, following the same shape as IncompleteCapabilityContractError/CapabilitySchemaNotWellFormedError.
- path: src/capability-registry/capability-registry.service.ts
  effect: heldCapability() now calls refuseMalformedInputSchemaShape(registration) immediately after refuseMalformedSchemas(registration)
    and before the nature check — re-parses the already-confirmed-valid input_schema JSON and throws MalformedCapabilityInputSchemaError
    with every problem inputSchemaShapeProblems names, before any write.
- path: src/errors/status-map.ts
  effect: STATUS_BY_ERROR_CLASS now maps MalformedCapabilityInputSchemaError to 422, inserted beside CapabilitySchemaNotWellFormedError.
criteria:
- criterion: Registering a capability whose input_schema, once valid JSON, does not declare properties
    as an object is refused with an HTTP 422 response reporting MalformedCapabilityInputSchemaError.
  met: true
  how: inputSchemaShapeProblems pushes a problem whenever a declared properties value is neither absent
    nor a plain object; refuseMalformedInputSchemaShape throws MalformedCapabilityInputSchemaError, which
    status-map.ts resolves to 422.
- criterion: Registering a capability whose input_schema declares a required array naming a key absent
    from properties is refused with an HTTP 422 response reporting MalformedCapabilityInputSchemaError.
  met: true
  how: requiredProblems() filters required's own entries against the declared properties keys and reports
    a problem for any not already present in properties; refuseMalformedInputSchemaShape throws the same
    error class, mapped to 422.
- criterion: A single registration departing from the shape in more than one way is refused with one MalformedCapabilityInputSchemaError
    naming every departure together.
  met: true
  how: inputSchemaShapeProblems accumulates every problem into one array before returning, and refuseMalformedInputSchemaShape
    throws exactly once with that whole array, joined in the error's message and kept structured in context.problems.
- criterion: Registering a capability whose input_schema declares an empty properties object and no required
    array succeeds.
  met: true
  how: '{"properties": {}} makes propertiesIsObject true with an empty key list and no required value,
    so inputSchemaShapeProblems returns an empty array and refuseMalformedInputSchemaShape does not throw.'
- criterion: Reading the declared shape of a capability's input_schema that was stored before this check
    existed, and does not hold this shape, answers properties and required both empty rather than throwing
    or refusing.
  met: true
  how: 'declaredInputSchemaShape parses the stored input_schema defensively and returns { properties:
    [], required: [] } whenever inputSchemaShapeProblems reports any problem or the parsed value is not
    a plain object.'
- criterion: MalformedCapabilityInputSchemaError resolves to 422 through the shared status map.
  met: true
  how: STATUS_BY_ERROR_CLASS in status-map.ts now includes [MalformedCapabilityInputSchemaError, 422],
    and statusForError() resolves any instance of it to 422 through the existing instanceof loop.
nodes:
- node: domain/integration/capability
  how: capability.ts already models input_schema as the capability's own required string attribute; this
    task adds no new attribute to the aggregate, only a shape rule the registry enforces over the existing
    one and a shared reader for the same attribute's content.
  encoded_at:
  - src/capability-registry/capability-input-schema-shape.ts
- node: domain/integration/capability-registry
  how: the node's own responsibility text ("refuse ... a registration ... that declares an input schema
    that does not hold a well-formed shape") is exactly what heldCapability()'s new refuseMalformedInputSchemaShape
    call answers, run before any write alongside the registry's other refusals.
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: rules/integration/a-capability-input-schema-holds-a-well-formed-object
  how: both clauses are encoded — the registration-time refusal (inputSchemaShapeProblems + refuseMalformedInputSchemaShape
    + MalformedCapabilityInputSchemaError, mapped to HTTP 422, naming every departure together) and the
    legacy-read posture (declaredInputSchemaShape, permissive and never-throwing). The node's silence
    on whether an entirely absent properties key counts as "declaring" it is resolved as an inference
    below.
  encoded_at:
  - src/capability-registry/capability-input-schema-shape.ts
  - src/capability-registry/capability-registry.service.ts
  - src/errors/malformed-capability-input-schema.error.ts
  - src/errors/status-map.ts
- node: contracts/integration/capability-registry
  how: register-capability is the one operation this task touches; the contract's own text is unchanged
    — the new refusal sits inside the existing registerCapability call the route already exposes, adding
    no new operation and no new response shape beyond the existing typed-error-to-status pipeline.
inferences:
- inferred: 'an input_schema whose top-level object declares no properties key at all is read as declaring
    properties (and, by extension, required) empty — the same outcome as an explicit {"properties": {}}
    — rather than as a shape departure refused at registration.'
  from: the rule's own explanatory sentence framing an empty properties object's business meaning without
    distinguishing how it is spelled; declaredFieldsOf's own established reading of output_schema already
    treats an absent properties key as "no fields declared," never as a fault; and the existing test suite
    calls registerCapability with input_schema defaulted to the bare string '{}' across dozens of already-passing
    scenarios unrelated to schema shape — refusing bare omission would silently break every one of those,
    a regression this task's own criteria never ask for.
divergences:
- from: existing-conventions-and-reuse.md's must_not_duplicate entry naming citation-validation.ts's declaredFieldsOf
    as the function the new input_schema shape reader should reuse or sit beside.
  departure: the shared shape reader (declaredInputSchemaShape) and its underlying inputSchemaShapeProblems
    are implemented as an independent module in src/capability-registry/ rather than colocated in src/investigation/citation-validation.ts,
    and do not import declaredFieldsOf or its private helpers.
  why: 'capability-registry is upstream of investigation in this codebase''s evidenced import direction
    (investigation-layer files import Capability/ICapabilityQuery from capability-registry, never the
    reverse); colocating the reader in citation-validation.ts would run a registry-layer refusal through
    an investigation-layer file against that grain. The "reuse rather than duplicate" intent is honored
    inside the new module itself: registerCapability''s own refusal and the permissive reader both call
    the single inputSchemaShapeProblems function, so there is exactly one shape-parsing implementation
    for input_schema.'
preserved:
- capability-registry.service.spec.ts's own fixtures, and at least eight integration spec files, register
  capabilities with input_schema defaulted to the bare string '{}' (no properties key) and expect success
  for scenarios unrelated to schema shape — the shape check's treatment of an absent properties key as
  implicit-empty keeps every one of these passing unchanged.
- declaredFieldsOf's own three existing consumers read output_schema exactly as before — this task adds
  no import into or modification of citation-validation.ts.
- registerCapability's existing refusal ordering (contract completeness, then schema well-formedness,
  then nature, then answered-concept) is preserved; the new shape check is inserted between the existing
  well-formedness check and the nature check.
deferred:
- what: the case-input-requirements derivation the rationale names as declaredInputSchemaShape's own future
    consumer is not built here.
  why: it belongs to a separate, not-yet-cut task; this task's own objective is the registration check
    and the shared reader's existence, not its wiring into a new investigation-layer capability.
---

## What it is
registerCapability now refuses an input_schema that parses but does not hold the declared shape, and a new shared reader answers a shape-departing input_schema (new or pre-existing) as declaring properties and required both empty.

## Notes
None.
