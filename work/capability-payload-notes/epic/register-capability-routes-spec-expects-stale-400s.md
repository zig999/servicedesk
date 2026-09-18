---
title: register-capability's route test asserts the registry's own refusal, not a stale 400
summary: 'Corrective increment: register-capability.routes.spec.ts asserts HTTP 400 for six
  cases register-capability-dto-refusal-order/reaches-the-registry-refusal''s legitimate
  delivery now routes to the registry''s own 422 refusal instead.'
rationale: The wrong assertion was observed in a test file this project already delivered
  (under a now-closed initiative), outside any live task's criteria; the claim is seeded
  mechanically from trace.py --encodes over register-capability.dto.ts, the file the falsifying
  correction changed and whose bindings this test file's assertions answer to.
sources:
- work/capability-payload-notes/intake/register-capability-routes-spec-expects-stale-400s.md
covers:
- constraints/a-malformed-request-is-refused-with-a-validation-error
- constraints/the-register-capability-route-defers-completeness-to-the-registry
- constraints/the-register-capability-route-defers-the-nature-vocabulary-to-the-registry
- contracts/integration/capability-registry
- domain/integration/capability
- domain/integration/capability-nature
- rules/integration/a-capability-declares-its-contract
- rules/integration/a-capability-is-read-only
uncovered:
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  why: This correction narrows this constraint's own fitness demonstration for these six
    cases specifically (already the outcome register-capability-dto-refusal-order's own
    epic anticipated); it does not otherwise change what this constraint requires.
- node: contracts/integration/capability-registry
  why: It declares register-capability among the registry's published operations and states
    nothing about how a submission is refused; this correction changes only which HTTP status
    six test cases expect, not the operation's existence or shape.
- node: domain/integration/capability-nature
  why: This correction reaches only the closed vocabulary's boundary (a value outside it is
    "out-of-vocabulary"), not the vocabulary's own membership or meaning.
---
## What it is

register-capability.routes.spec.ts's tests "answers 400 for an out-of-vocabulary nature",
"refuses a registration whose body omits input_schema outright", "refuses a registration
whose body omits output_schema outright", "answers 400 for a wholly empty body", "answers 400
via validation for a request with an empty :name segment" and "...:version segment" each
assert HTTP 400 and that registerCapability is never reached. Since
register-capability-dto-refusal-order/reaches-the-registry-refusal loosened
register-capability.dto.ts's shape schemas, all six now reach registerCapability and are
refused there with HTTP 422 (IncompleteCapabilityContractError or CapabilityNotReadOnlyError,
depending on the case).

## Notes

None.
