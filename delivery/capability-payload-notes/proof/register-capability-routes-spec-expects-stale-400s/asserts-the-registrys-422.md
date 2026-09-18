---
target: backend
title: The six route tests now assert the registry's own 422
summary: The six stale 400 assertions in register-capability.routes.spec.ts are rewritten to
  mock the registry's own refusal and assert its 422 response, with registerCapability called
  exactly once in each case.
implementation: sha256:33d8331b22b1fa745180412258a580847fe3854c45801286b56e4f1fe38a507e
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/register-capability-payload-notes-corrections-suite-5
tests:
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: refuses with the status the status map assigns CapabilityNotReadOnlyError for an
    out-of-vocabulary nature, reaching registerCapability rather than being intercepted by shape
    validation
  proves: A request with an out-of-vocabulary nature is asserted to answer 422 with
    CapabilityNotReadOnlyError, reaching registerCapability.
  fails_when: The route answers anything but 422 CapabilityNotReadOnlyError for this request, or
    registerCapability is not called exactly once.
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: refuses with the status the status map assigns IncompleteCapabilityContractError naming
    input_schema, when the body omits input_schema outright, reaching registerCapability
  proves: A request whose body omits input_schema outright is asserted to answer 422 with
    IncompleteCapabilityContractError naming input_schema, reaching registerCapability.
  fails_when: The route answers anything but 422 IncompleteCapabilityContractError naming
    input_schema for this request, or registerCapability is not called exactly once.
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: refuses with the status the status map assigns IncompleteCapabilityContractError naming
    output_schema, when the body omits output_schema outright, reaching registerCapability
  proves: A request whose body omits output_schema outright is asserted to answer 422 with
    IncompleteCapabilityContractError naming output_schema, reaching registerCapability.
  fails_when: The route answers anything but 422 IncompleteCapabilityContractError naming
    output_schema for this request, or registerCapability is not called exactly once.
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: refuses with the status the status map assigns IncompleteCapabilityContractError naming
    every required body attribute a wholly empty body leaves undeclared, reaching
    registerCapability
  proves: A request with a wholly empty body is asserted to answer 422 with
    IncompleteCapabilityContractError naming every required attribute left undeclared, reaching
    registerCapability.
  fails_when: The route answers anything but 422 naming exactly nature, input_schema,
    output_schema, connector and concept for a wholly empty body, or registerCapability is not
    called exactly once.
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: refuses with the status the status map assigns IncompleteCapabilityContractError naming
    name, for a request with an empty :name segment and an otherwise complete body, never 404
    "route not found"
  proves: A request with an empty :name path segment is asserted to answer 422 with
    IncompleteCapabilityContractError naming name, reaching registerCapability.
  fails_when: The route answers 404, or anything but 422 naming name, for an empty :name segment,
    or registerCapability is not called exactly once.
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: refuses with the status the status map assigns IncompleteCapabilityContractError naming
    version, for a request with an empty :version segment and an otherwise complete body, never
    404 "route not found"
  proves: A request with an empty :version path segment is asserted to answer 422 with
    IncompleteCapabilityContractError naming version, reaching registerCapability.
  fails_when: The route answers 404, or anything but 422 naming version, for an empty :version
    segment, or registerCapability is not called exactly once.
untested:
- "constraints/the-register-capability-route-defers-completeness-to-the-registry and
  constraints/the-register-capability-route-defers-the-nature-vocabulary-to-the-registry's own
  clause holding a value actually supplied to its declared type and bounds is not exercised by
  this proof's six tests, all of which supply either nothing or a bare string; that clause is
  exercised elsewhere in the same file by the pre-existing timeout-type tests, unaffected by this
  correction."
divergences:
- from: the framework convention that a corrective proof supersedes, or names, the
    implementation/proof record it corrects
  departure: This correction rewrites six pre-existing assertions in
    src/__tests__/unit/http/register-capability.routes.spec.ts with no owning implementation/
    proof record to supersede — the original assertions predate this project's task-tracked
    delivery discipline over this file.
  why: No task-tracked record owns these six pre-existing assertions, so this correction has
    nothing upstream to pin against. Disclosed so a later review holding this file to the same
    rules is not shown a fact it was not written down.
---

## What it is

Rewrites six now-false 400 assertions in register-capability.routes.spec.ts to mock the
registry's own refusal for each case and assert the 422 response it actually produces, with
registerCapability called exactly once in each.

## Notes

None.
