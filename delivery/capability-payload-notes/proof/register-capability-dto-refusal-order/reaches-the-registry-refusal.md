---
target: backend
title: register-capability.dto.ts's loosened shape schemas reach the registry's own completeness refusal
summary: One new test proves criterion 2 (an empty-string required body attribute reaches the
  registry's 422); criteria 1, 3 and 4 are already proven by pre-existing tests in the same
  file, cited rather than duplicated; the implemented nodes whose fact spans files this task
  does not touch go to untested.
implementation: sha256:99c0ba240b54180d010f4f4e4cc450875b7da26a26b0739439d5930188bd8db5
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/register-capability-payload-notes-corrections-suite-5
tests:
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: "refuses with the status the status map assigns IncompleteCapabilityContractError naming connector, when the body states connector as an empty string, reaching registerCapability rather than being intercepted by shape validation"
  proves: "Criterion 2 — a PUT submission whose body states a required attribute as an empty string is answered with HTTP 422 IncompleteCapabilityContractError naming that attribute, not HTTP 400 VALIDATION_ERROR."
  fails_when: registerCapabilityBodySchema keeps (or regains) .min(1) on connector, so an empty string fails shape validation and the route answers 400 VALIDATION_ERROR without calling registerCapability; or the route stops surfacing the registry's IncompleteCapabilityContractError as 422 naming the attribute.
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: "refuses with the status the status map assigns IncompleteCapabilityContractError naming input_schema, when the body omits input_schema outright, reaching registerCapability"
  proves: "Criterion 1 — a PUT submission whose body omits a required attribute is answered with HTTP 422 IncompleteCapabilityContractError naming that attribute, not HTTP 400 VALIDATION_ERROR. input_schema is one representative of the same equivalence class the criterion illustrates with connector."
  fails_when: an omitted required body attribute stops reaching registerCapability, or the response reverts to HTTP 400 VALIDATION_ERROR for that condition.
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: "answers 200 with the held capability registerCapability resolved, for a valid registration at a (name, version) the path names"
  proves: "Criterion 3 — a PUT submission whose body states every required attribute, and whose payload_notes is left undeclared, is accepted and the held capability answers with no payload_notes value."
  fails_when: a fully-declared registration stops being accepted (non-200), or the response carries a payload_notes property the registry never supplied.
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: "refuses a registration whose timeout is a numeric string, answering 400 VALIDATION_ERROR rather than registering it"
  proves: "Criterion 4 — the route's shape validation still refuses a submission whose required attribute holds the wrong type (timeout as a non-numeric string), independent of this change."
  fails_when: a string-typed timeout stops being refused at the shape boundary (i.e. registerCapability gets called, or the status is no longer 400 VALIDATION_ERROR).
- file: src/__tests__/integration/http/register-capability-dto-refusal-order.routes.spec.ts
  name: "answers HTTP 422 IncompleteCapabilityContractError naming connector, not HTTP 400 VALIDATION_ERROR, when the body omits connector"
  proves: "Criterion 1, end to end against the real registry and database — an omitted required attribute reaches the real capability-registry.service.ts and is refused with its own 422, naming the attribute."
  fails_when: the route answers anything but 422 IncompleteCapabilityContractError naming connector, against the real (unmocked) registry.
  demonstrates: rules/integration/a-capability-declares-its-contract
- file: src/__tests__/integration/http/register-capability-dto-refusal-order.routes.spec.ts
  name: "answers HTTP 422 IncompleteCapabilityContractError naming connector, not HTTP 400 VALIDATION_ERROR, when the body states connector as an empty string"
  proves: "Criterion 2, end to end against the real registry and database — an empty-string required attribute is treated as undeclared by the real registry and refused with its own 422, naming the attribute."
  fails_when: the route answers anything but 422 IncompleteCapabilityContractError naming connector, against the real (unmocked) registry.
- file: src/__tests__/integration/http/register-capability-dto-refusal-order.routes.spec.ts
  name: "accepts a submission stating every required attribute with payload_notes left undeclared, and the held capability answers with no payload_notes value"
  proves: "Criterion 3, end to end against the real registry and database — a fully-declared registration is accepted (200) and the real persisted/returned capability carries no payload_notes property."
  fails_when: the real registration is refused, or the response carries a payload_notes property.
- file: src/__tests__/integration/http/register-capability-dto-refusal-order.routes.spec.ts
  name: "still refuses with HTTP 400 VALIDATION_ERROR a submission whose timeout holds the wrong type (a non-numeric string), independent of this task's own loosening of the required string attributes"
  proves: "Criterion 4, end to end — a wrong-typed timeout is still refused at the shape boundary and never reaches the real registry."
  fails_when: the route answers anything but 400 VALIDATION_ERROR for a non-numeric timeout.
untested:
- "rules/integration/a-capability-declares-its-contract: compound and spans files this task does
  not touch — the positive-integer-milliseconds and absent-timeout-default clauses are decided
  by capability-registry.service.ts (unchanged, exercised by its own spec file, not this route's).
  No single finite test reachable from register-capability.routes.spec.ts, where
  registerCapability is a mock rather than the real registry, decides this whole fact."
- "domain/integration/capability: an aggregate-root's attribute list and typing is a structural
  declaration carried jointly by capability-registry/capability.ts's types,
  REQUIRED_REGISTRATION_ATTRIBUTES in capability-registry.service.ts and this task's own DTO
  schemas — none of which this task's test scope observes as one behavior through one HTTP call."
- "constraints/a-malformed-request-is-refused-with-a-validation-error: scoped to the whole
  system and decided by the test-unit step run across the whole suite, not by one route's file.
  On this route specifically, its 'body missing a required field' fitness example can no longer
  be demonstrated once this task's DTO change lands, and the sibling corrective task
  (register-capability-routes-spec-expects-stale-400s/asserts-the-registrys-422) already moved
  the stale assertions that used to demonstrate it against this route to the registry's 422
  instead. What remains true on this route (a wrong-typed value still answers 400) is a fragment,
  not the node's fact whole."
- "constraints/the-register-capability-route-defers-completeness-to-the-registry: this task's
  own DTO change is what this node's statement describes, but its own fitness (an empty-JSON-
  object body, an empty path segment) is demonstrated by the sibling corrective task's proof
  (register-capability-routes-spec-expects-stale-400s/asserts-the-registrys-422), not by any test
  this proof adds."
- "constraints/the-register-capability-route-defers-the-nature-vocabulary-to-the-registry: same
  as above — this task's DTO change is what the node describes, but its fitness (an
  out-of-vocabulary nature) is demonstrated by the sibling corrective task's proof, not by this
  one."
- "UNDERDETERMINED note — whether an absent timeout is carried into the loosened shape check or
  kept refused as a special case: the note observes an ambiguity the criteria do not decide; it
  names no implementation that satisfies every criterion and that the specification refuses, so
  no test is owed against it."
- "UNDERDETERMINED note — whether the loosened DTO also drops timeout's positive-integer bound:
  the route's existing 'timeout of 0' test, pre-existing and untouched by this proof, already
  shows the positive bound was not dropped, but that fact was not asked for by this task's own
  criteria."
- "UNDERDETERMINED note — whether a submission leaving two or more required attributes
  undeclared names only the first or every one: no implementation named; criteria 1 and 2 each
  exercise exactly one missing attribute."
- "UNDERDETERMINED note — whether criterion 4's wrong-type refusal must match
  constraints/a-malformed-request-is-refused-with-a-validation-error's own fitness description
  in code/message/details: no implementation named; criterion 4 requires only that the
  submission is still refused."
not_applicable:
- edge_case: duplicate / uniqueness violation
  why: Neither the task's criteria nor the implemented nodes state a uniqueness constraint;
    register-capability's own re-registration-at-the-same-identity behavior is a distinct,
    pre-existing concern proven by an unrelated pre-existing test in this file.
- edge_case: concurrent operations against one subject
  why: Already covered by a pre-existing test in this file, unaffected by this task's change.
- edge_case: a dependency that fails or answers slowly
  why: registerCapability is mocked at this layer; a generic-rejection path is already proven by
    a pre-existing test, and none of this task's criteria concern latency or dependency failure.
- edge_case: operation against state that forbids it
  why: No criterion or implemented node states a stateful precondition this task's change
    interacts with; the registry's own state-dependent refusals are unchanged and proven by
    pre-existing tests.
---

## What it is

One new test proves criterion 2; criteria 1, 3 and 4 are already proven by pre-existing tests in
the same file, cited rather than duplicated.

## Notes

None.
