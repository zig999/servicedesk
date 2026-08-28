---
title: Proof for refusing a malformed capability input schema and reading a legacy one as empty
summary: Direct tests of the new capability-input-schema-shape module, registerCapability's new refusal
  at both the service and route levels, and the status map's new entry, proving all six criteria and the
  recorded inference.
implementation: sha256:41b093d874d9842bda6a69d6c353e9b169623cc4a9a72863b210a4a09268e90b
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/capability-input-schema-contract-refuse-malformed-capability-input-schema-suite-2
tests:
- file: src/__tests__/unit/capability-registry/capability-input-schema-shape.spec.ts
  name: reports no problem for a parsed value declaring an empty properties object and no required array
  proves: Registering a capability whose input_schema declares an empty properties object and no required
    array succeeds.
  fails_when: inputSchemaShapeProblems reports a problem for {"properties":{}}, or the array is non-empty
- file: src/__tests__/unit/capability-registry/capability-input-schema-shape.spec.ts
  name: reports no problem when the parsed value declares no properties key at all, reading the omission
    as declaring it empty rather than a departure
  proves: the implementation's recorded inference that a schema declaring no properties key at all is
    read as declaring it empty rather than a shape departure
  fails_when: inputSchemaShapeProblems reports a problem for {} (no properties key)
- file: src/__tests__/unit/capability-registry/capability-input-schema-shape.spec.ts
  name: reports a problem naming properties when it is declared as something other than an object
  proves: Registering a capability whose input_schema, once valid JSON, does not declare properties as
    an object is refused with an HTTP 422 response reporting MalformedCapabilityInputSchemaError.
  fails_when: inputSchemaShapeProblems fails to report the properties problem for {"properties":"not-an-object"},
    or reports a different message
- file: src/__tests__/unit/capability-registry/capability-input-schema-shape.spec.ts
  name: reports a problem naming properties when it is declared as an array rather than an object
  proves: the same criterion, at the boundary where typeof reports "object" for an array — an array does
    not satisfy "declares properties as an object"
  fails_when: inputSchemaShapeProblems treats a properties array as a valid object declaration
- file: src/__tests__/unit/capability-registry/capability-input-schema-shape.spec.ts
  name: reports a problem when the parsed value itself is not an object at all
  proves: the properties-not-an-object criterion extends to a top-level input_schema value that is not
    an object at all
  fails_when: inputSchemaShapeProblems reports no problem for a non-object top-level parsed value
- file: src/__tests__/unit/capability-registry/capability-input-schema-shape.spec.ts
  name: reports no problem when required is declared as an empty array
  proves: an empty required array is a valid, empty subset of properties' keys
  fails_when: inputSchemaShapeProblems reports a problem for an explicit empty required array
- file: src/__tests__/unit/capability-registry/capability-input-schema-shape.spec.ts
  name: reports a problem naming the key when required names a key absent from properties
  proves: Registering a capability whose input_schema declares a required array naming a key absent from
    properties is refused with an HTTP 422 response reporting MalformedCapabilityInputSchemaError.
  fails_when: inputSchemaShapeProblems fails to report the absent key, or names the wrong key
- file: src/__tests__/unit/capability-registry/capability-input-schema-shape.spec.ts
  name: reports a problem naming required when it is declared as something other than an array
  proves: the required-array-shape half of rules/integration/a-capability-input-schema-holds-a-well-formed-object
  fails_when: inputSchemaShapeProblems reports no problem when required is not an array
- file: src/__tests__/unit/capability-registry/capability-input-schema-shape.spec.ts
  name: reports both problems together when properties and required depart from the shape at once
  proves: A single registration departing from the shape in more than one way is refused with one MalformedCapabilityInputSchemaError
    naming every departure together.
  fails_when: inputSchemaShapeProblems reports only one of the two problems, or reports the second instead
    of both
- file: src/__tests__/unit/capability-registry/capability-input-schema-shape.spec.ts
  name: reads the declared properties and required keys from a well-formed input_schema
  proves: declaredInputSchemaShape reads a well-formed schema's actual keys rather than always answering
    empty
  fails_when: declaredInputSchemaShape answers anything but { properties:['a','b'], required:['a'] } for
    that well-formed input
- file: src/__tests__/unit/capability-registry/capability-input-schema-shape.spec.ts
  name: answers properties and required both empty for an input_schema that does not hold the declared
    shape, rather than throwing or refusing
  proves: Reading the declared shape of a capability's input_schema that was stored before this check
    existed, and does not hold this shape, answers properties and required both empty rather than throwing
    or refusing.
  fails_when: 'declaredInputSchemaShape throws, or answers anything but { properties: [], required: []
    }, for a shape-departing input_schema'
- file: src/__tests__/unit/capability-registry/capability-input-schema-shape.spec.ts
  name: answers properties and required both empty for an input_schema that is not valid JSON at all,
    rather than throwing
  proves: the same legacy-read criterion extends to a stored value that is not JSON at all
  fails_when: declaredInputSchemaShape throws, or answers anything but the empty shape, for unparseable
    text
- file: src/__tests__/unit/capability-registry/capability-input-schema-shape.spec.ts
  name: answers properties and required both empty for an input_schema that is undefined, rather than
    throwing
  proves: the legacy-read posture holds for a capability record carrying no input_schema value at all
  fails_when: declaredInputSchemaShape throws, or answers anything but the empty shape, for undefined
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: refuses a registration whose input_schema declares properties as something other than an object,
    reporting MalformedCapabilityInputSchemaError
  proves: Registering a capability whose input_schema, once valid JSON, does not declare properties as
    an object is refused with an HTTP 422 response reporting MalformedCapabilityInputSchemaError.
  fails_when: registerCapability does not reject with MalformedCapabilityInputSchemaError, or the thrown
    error's context.problems does not name the properties departure
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: refuses a registration whose input_schema declares a required array naming a key absent from properties,
    reporting MalformedCapabilityInputSchemaError
  proves: Registering a capability whose input_schema declares a required array naming a key absent from
    properties is refused with an HTTP 422 response reporting MalformedCapabilityInputSchemaError.
  fails_when: registerCapability does not reject with MalformedCapabilityInputSchemaError, or does not
    name the absent key
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: refuses a registration whose input_schema departs from the shape in more than one way with one
    MalformedCapabilityInputSchemaError naming every departure together
  proves: A single registration departing from the shape in more than one way is refused with one MalformedCapabilityInputSchemaError
    naming every departure together.
  fails_when: registerCapability throws more than once, throws a different error, or the single thrown
    error's context.problems omits either departure
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: writes nothing to the store when it refuses a registration for a malformed input schema shape
  proves: the new refusal runs before any write, exactly as the node's own responsibility text and the
    existing sibling refusals already established
  fails_when: a registration this refusal rejects nonetheless persists a change to the store
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: accepts a registration whose input_schema declares an empty properties object and no required
    array
  proves: Registering a capability whose input_schema declares an empty properties object and no required
    array succeeds.
  fails_when: registerCapability rejects, or returns anything but the registered capability, for that
    registration
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: accepts a registration whose input_schema declares no properties key at all, reading the omission
    as declaring it empty rather than refusing it as a shape departure
  proves: the implementation's recorded inference, pinned at the service level so registerCapability's
    own behavior is bound to it
  fails_when: registerCapability rejects a registration whose input_schema is the bare string '{}'
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: resolves MalformedCapabilityInputSchemaError to 422
  proves: MalformedCapabilityInputSchemaError resolves to 422 through the shared status map.
  fails_when: statusForError answers anything but 422 for an instance of MalformedCapabilityInputSchemaError
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: refuses with the status the status map assigns MalformedCapabilityInputSchemaError, naming every
    departure in the details
  proves: criteria 1-3 at the wire level — an HTTP 422 response actually carries the error's name as its
    code and every departure in its details
  fails_when: the route answers anything but 422, or the response body's error.code or error.details does
    not carry MalformedCapabilityInputSchemaError's name and problems
not_applicable:
- edge_case: two registrations racing against the same (name, version) at once
  why: this task adds no concurrency behavior; the check runs synchronously against the parsed JSON before
    the store is ever touched, and no bound node states a concurrent-write guarantee for register-capability
    to test here
- edge_case: the store failing while this check is being evaluated
  why: refuseMalformedInputSchemaShape runs inside heldCapability(), entirely before registerCapability's
    own store.readCapabilities() call — a store failure cannot interact with this check, and the generic
    store-failure path is already covered by this file's own pre-existing test for a different operation
- edge_case: a duplicate key named twice in the required array
  why: no criterion or node states behavior distinguishing a duplicate absent-key mention from a single
    one; the existing "names every departure together" test already exercises the array-filtering logic
    that would produce it
- edge_case: a numeric boundary (e.g. a minimum/maximum count of properties or required entries)
  why: the rule is a structural shape check, not a range — no node states a size bound for this task to
    test
untested:
- the actual HTTP wire behavior for the specific malformed shapes this task's own criteria enumerate (properties
  non-object, required naming an absent key) is proved only through the route's existing rejected-value
  stand-in for registerCapability, carrying a MalformedCapabilityInputSchemaError constructed directly
  in the test rather than one actually thrown by the shape check against those exact input_schema strings
  — the two facts are each proved, but never in the same request.
---

## What it is
Direct tests of the new capability-input-schema-shape module, registerCapability's new refusal at both the service and route levels, and the status map's new entry, proving all six criteria and the recorded inference.

## Notes
The first suite attempt (run/capability-input-schema-contract-refuse-malformed-capability-input-schema-suite) failed at its test step, diagnosed as `cause: test` against a pre-existing assertion owned by task/stale-specification-citations-round-two/citations-corrected-again (in the closed initiative work/backend-spec-conformance-corrections), which hardcoded the stale literal "four specification nodes" in src/errors/status-map.spec.ts. That literal was corrected to "five" by explicit human decision, directly in source, since the owning task's work root is closed and /implement-task's proof-only re-delivery route cannot write against it; the second run (recorded above) passed.
