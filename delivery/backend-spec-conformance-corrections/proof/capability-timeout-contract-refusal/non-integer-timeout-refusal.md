---
title: Non-integer capability timeout is refused at the route, not the service
summary: Proves that a decimal or numeric-string timeout is refused by register-capability's own 400 VALIDATION_ERROR,
  identically for both forms and distinctly from the absent-timeout default, and corrects the one pre-existing
  test that asserted the service-level refusal this task deliberately removed.
implementation: sha256:163dfc6a1a6fd06097d30b30e490273479e1b09d0f1ff661fbd79a182ec58eca
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/capability-timeout-contract-refusal-non-integer-timeout-refusal-suite
tests:
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: refuses a registration whose timeout is a decimal number, answering 400 VALIDATION_ERROR rather
    than registering it
  proves: Registering a capability whose timeout is a decimal number is refused rather than registered.
  fails_when: a PUT with timeout:0.5 answers with anything but 400/VALIDATION_ERROR, or registerCapability
    is ever called for it
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: refuses a registration whose timeout is a numeric string, answering 400 VALIDATION_ERROR rather
    than registering it
  proves: Registering a capability whose timeout is a numeric string is refused rather than registered.
  fails_when: a PUT with timeout:"60000" answers with anything but 400/VALIDATION_ERROR, or registerCapability
    is ever called for it
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: refuses a decimal timeout and a numeric-string timeout alike with the identical status and the
    identical named error, rather than either falling through to a different or default response
  proves: Every non-integer timeout value tested is refused with the same stated HTTP status and the same
    named error, rather than each falling through to a different or default response.
  fails_when: the decimal case and the numeric-string case answer different statuses, different error
    codes, or either is not 400/VALIDATION_ERROR
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: 'answers the non-integer-timeout refusal distinctly from the registry''s response to a capability
    that declares no timeout at all: a decimal timeout is refused with 400 while an absent timeout reaches
    registerCapability and takes the registry''s own sixty-second default'
  proves: The refusal is distinct from the registry's response to a capability that declares no timeout
    at all, which still takes the sixty-second default.
  fails_when: an absent timeout is refused with 400 instead of reaching registerCapability, or a non-integer
    timeout stops being refused with 400
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: accepts a stated timeout that is not an integer count of milliseconds, holding it through unchanged,
    since a present value is never "undeclared"
  proves: the implementation's disclosed inference that removing capability-registry.service.ts's own
    non-integer-timeout branch from contractProblems() was the corrective change needed — verified directly
    by a call straight into registerCapability, bypassing the route entirely, so the removal (not merely
    the route's pre-existing schema) is what this test pins
  fails_when: the service's contractProblems() reintroduces a check that classifies a present, non-integer
    timeout as undeclared, causing this direct call to throw IncompleteCapabilityContractError instead
    of succeeding with registered.timeout === 0.5
not_applicable:
- edge_case: an empty-string timeout
  why: registerCapabilityBodySchema's timeout:z.number() rejects any non-number runtime type by its type
    check alone, before .int() ever runs — an empty string fails through exactly the same branch the numeric-string
    test already exercises ("60000" is also a non-number type), so a separate case would repeat that same
    code path rather than exercise a different one.
- edge_case: a negative or otherwise out-of-range non-integer timeout
  why: the task's own criteria name exactly two non-integer forms — a decimal number and a numeric string
    — and both are already proven; the schema's separate positive-boundary refusal (timeout:0) is pre-existing,
    unaffected by this task, and already covered by the pre-existing "answers 400 for a timeout of 0"
    test.
- edge_case: a dependency that is unavailable, slow, or answers in an unexpected shape
  why: the refusal this task proves happens entirely inside registerCapabilityBodySchema.safeParse(),
    synchronously, before any store or external call is reached — there is no dependency on this path
    for a slow or failing answer to affect.
- edge_case: two registrations against one (name, version) at once
  why: no criterion of this task, and no node it implements, states anything about concurrent registration;
    the timeout-refusal behavior this task adds is stateless per request and raises no new concurrency
    question the task's own criteria ask about.
untested:
- Whether a direct, non-HTTP caller of registerCapability should itself refuse a declared, non-integer
  timeout is left open by this delivery (its own deferred note) and by this proof — the rewritten service-level
  test proves only that it currently accepts one, which is the implementation's own deliberate choice,
  not a criterion this task states either way.
---

## What it is

Route-level tests prove a decimal or numeric-string capability timeout is refused with 400 VALIDATION_ERROR, identically, and distinctly from an absent timeout; one pre-existing service-level test is corrected to match the behavior this task's implementation deliberately left in place.

## Notes

None.
