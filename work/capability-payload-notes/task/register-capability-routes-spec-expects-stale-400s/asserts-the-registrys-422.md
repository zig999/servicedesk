---
title: The six route tests assert the registry's own 422, not a stale 400
summary: register-capability.routes.spec.ts's six now-false 400 assertions are rewritten to
  assert the registry's own 422 refusal and that registerCapability is reached and refuses.
rationale: The wrong assertion was observed in delivered test code, outside any live task's
  criteria; the claim is seeded mechanically from trace.py --encodes over
  register-capability.dto.ts, the file whose legitimate correction falsified these six
  assertions.
sources:
- work/capability-payload-notes/intake/register-capability-routes-spec-expects-stale-400s.md
objective: register-capability.routes.spec.ts's six route tests for an out-of-vocabulary
  nature, an omitted input_schema, an omitted output_schema, a wholly empty body, an empty
  :name segment and an empty :version segment each assert the HTTP 422 refusal the registry
  itself now answers with, reaching registerCapability rather than being intercepted at 400.
criteria:
- A request with an out-of-vocabulary nature is asserted to answer 422 with
  CapabilityNotReadOnlyError, reaching registerCapability.
- A request whose body omits input_schema outright is asserted to answer 422 with
  IncompleteCapabilityContractError naming input_schema, reaching registerCapability.
- A request whose body omits output_schema outright is asserted to answer 422 with
  IncompleteCapabilityContractError naming output_schema, reaching registerCapability.
- A request with a wholly empty body, on an otherwise valid :name and :version path, is
  asserted to answer 422 with IncompleteCapabilityContractError naming nature, input_schema,
  output_schema, connector and concept — every required attribute left undeclared by an empty
  body except timeout, which takes its default rather than being named — reaching
  registerCapability.
- A request with an empty :name path segment, and an otherwise complete body, is asserted to
  answer 422 with IncompleteCapabilityContractError naming name, reaching registerCapability.
- A request with an empty :version path segment, and an otherwise complete body, is asserted to
  answer 422 with IncompleteCapabilityContractError naming version, reaching registerCapability.
implements:
- rules/integration/a-capability-declares-its-contract
- rules/integration/a-capability-is-read-only
- domain/integration/capability
- constraints/the-register-capability-route-defers-completeness-to-the-registry
- constraints/the-register-capability-route-defers-the-nature-vocabulary-to-the-registry
---
## What it is

Six pre-existing tests in register-capability.routes.spec.ts assert an HTTP 400 shape-validation
refusal for cases that register-capability-dto-refusal-order/reaches-the-registry-refusal's
legitimate delivery now routes past the DTO's shape validation and into the registry's own
completeness/nature refusal, answered as HTTP 422. Each assertion is rewritten to expect the
422 case it now actually produces, and to assert registerCapability is reached rather than
never called.

## Notes

REMAINDER, from the binder over constraints/a-malformed-request-is-refused-with-a-validation-error:
the constraint's statement clause — every route refuses a request whose path, query or body
fails the route's declared shape with HTTP 400, code VALIDATION_ERROR — reaches no criterion
of this task; all six criteria assert the opposite side of that boundary. That leaves the
constraint's own fitness demonstration ("a body missing a required field" answered 400) undemonstrated
on register-capability, with no criterion here relocating it — the same gap
register-capability-dto-refusal-order/reaches-the-registry-refusal already filed as an advisory
and which stays unowned.
