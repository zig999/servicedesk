---
implementation: sha256:f79da7f9ed04d2fb5a10fa5050be1165fde497c3ac1b155c9f37437ac5ea862a
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/simulation-cockpit-use-simulate-case-suite-3
title: Proof for use-simulate-case
summary: Extends the existing use-simulate-case test suite with the two absence-cases criterion 4's conditional
  fields lacked, and confirms the rest already proves this task's criteria and inferences.
tests:
- file: src/hooks/use-simulate-case.spec.ts
  name: succeeds through the identical POST /v1/simulate call whether the case version is a draft or a
    released one
  proves: Dispatching the hook against a draft version and against a released version both succeed structurally
    the same way — the operation is open to either state, per contracts/investigation/case-simulation.
  fails_when: the dispatched request body differs between a draft and a released case ref, or either dispatch
    fails to reach /v1/simulate as a POST
- file: src/hooks/use-simulate-case-response-shape.spec.ts
  name: carries the full evidence record per collected concept, with result_detail present only when the
    response included it
  proves: The hook's typed success response carries one evidence item per collected concept (result, capability/connector
    reference, elapsed_ms, observation, result_detail when present).
  fails_when: an evidence item's result, capability reference, elapsed_ms or result_detail (when the wire
    response carried it) is dropped, renamed, or result_detail is invented for the item that lacked it
- file: src/hooks/use-simulate-case-response-shape.spec.ts
  name: carries an empty evidence array as a valid success rather than treating no collected concept as
    a failure
  proves: the empty-collection edge case of criterion 2 — an evidence array with zero items is still a
    successful result
  fails_when: an empty evidence array is treated as a dispatch failure (populates simulateError) or is
    coerced into something other than []
- file: src/hooks/use-simulate-case-response-shape.spec.ts
  name: carries citations for a decided verdict and a reason for an inconclusive one, with usage/elapsed_ms/prompt
    present only when a judgment call happened
  proves: The hook's typed success response carries one evaluation per manifested hypothesis (verdict,
    citations when decided, reason when inconclusive, usage/elapsed_ms/prompt when a judgment call happened).
  fails_when: a confirmed evaluation's citations or usage are dropped, or the inconclusive evaluation
    carries usage/elapsed_ms/prompt it never had (a judgment call was never made for it)
- file: src/hooks/use-simulate-case-response-shape.spec.ts
  name: carries an empty evaluations array as a valid success rather than treating no manifested hypothesis
    as a failure
  proves: the empty-collection edge case of criterion 3 — an evaluations array with zero items is still
    a successful result
  fails_when: an empty evaluations array is treated as a dispatch failure or coerced into something other
    than []
- file: src/hooks/use-simulate-case-response-shape.spec.ts
  name: carries the resolved assessment, total cost and per-stage durations exactly as the response sent
    them
  proves: The hook's typed success response carries the resolved assessment (outcome, referral, determining
    hypothesis when one confirmed, text, register, usage, elapsed_ms, prompt), the total cost, and the
    per-stage durations, matching domain/investigation/assessment, domain/investigation/cost and domain/investigation/durations.
  fails_when: any field of the fully-populated assessment, cost or durations fixture is dropped, renamed
    or altered on the way through the hook
- file: src/hooks/use-simulate-case-response-shape.spec.ts
  name: carries the assessment with no determining_hypothesis when the response sent none, rather than
    defaulting one in
  proves: criterion 4's own conditional clause 'determining hypothesis when one confirmed' — the field's
    absence for an unconfirmed outcome is honored, not defaulted or required
  fails_when: the hook injects a determining_hypothesis value the response never sent, or otherwise fails
    when the field is absent
- file: src/hooks/use-simulate-case-response-shape.spec.ts
  name: carries durations with no writing figure when no consolidation call happened, rather than defaulting
    one in
  proves: domain/investigation/durations's own 'writing is present exactly when a consolidation call happened'
    as criterion 4 binds it — the field's absence is honored, not defaulted or required
  fails_when: the hook injects a writing value the response never sent, or otherwise fails when the field
    is absent
- file: src/hooks/use-simulate-case.spec.ts
  name: invalidates no query and calls no endpoint besides /v1/simulate for a successful dispatch
  proves: Nothing the hook does writes to, or invalidates, any query or endpoint that persists an investigation
    — the dispatch's only observable effect is the mutation's own in-memory result, satisfying rules/investigation/a-simulation-writes-no-investigation.
  fails_when: a successful dispatch calls queryClient.invalidateQueries, or a second endpoint besides
    /v1/simulate is called
- file: src/hooks/use-simulate-case.spec.ts
  name: resolves a domain-coded refusal and a bare network failure to the identical fallback message,
    and never the backend's own raw text
  proves: A dispatch failure resolves to a UI state through uiStateForApiError rather than a hand-checked
    error code at the call site, and an operation failure (network, 5xx) is never confused with a returned
    verdict.
  fails_when: a domain-coded (404 ApiError) and a bare network (TypeError) failure resolve to different
    messages, or either surfaces the backend's own raw message text instead of the resolved UI state's
    message
- file: src/hooks/use-simulate-case.spec.ts
  name: keeps simulateError null when the response carries an inconclusive verdict, since that is a returned
    evaluation rather than a dispatch failure
  proves: the second half of criterion 6 — an inconclusive verdict returned inside a successful response
    never populates simulateError
  fails_when: a successful response carrying an inconclusive evaluation also sets simulateError, conflating
    a returned verdict with an operation failure
- file: src/hooks/use-simulate-case.spec.ts
  name: reports isSimulating while a dispatch is in flight and drops a second dispatch fired before the
    first settles
  proves: The hook exposes a pending status so a caller can gate a second dispatch while one is already
    in flight.
  fails_when: isSimulating never becomes true while a dispatch is pending, or a second onSimulate call
    fired before the first settles reaches fetch a second time
- file: src/hooks/use-simulate-case.spec.ts
  name: dispatches the request body as exactly {case, subject, requester}, matching this task's own recorded
    inference
  proves: the implementation record's inference that the request body's own wire shape is {case, subject,
    requester}
  fails_when: the dispatched body carries a different shape (extra, missing or renamed top-level fields)
    than {case, subject, requester}
- file: src/hooks/use-simulate-case.spec.ts
  name: exposes exactly {result, isSimulating, simulateError, onSimulate} before any dispatch, with no
    computed can-simulate boolean of its own
  proves: the implementation record's inference that this hook exposes no computed canX/'can simulate'
    boolean, unlike use-test-connector-panel.ts's own canTest
  fails_when: the hook's returned state carries any key besides result, isSimulating, simulateError and
    onSimulate
not_applicable:
- edge_case: dispatching a third overlapping call while a first is still in flight
  why: the pending-status test already proves a second call fired before the first settles is dropped
    by the ref guard; a third call exercises the identical branch (isDispatchingRef.current already true)
    and would add nothing the second call's own test does not already show
- edge_case: testing a refuted verdict evaluation explicitly, distinct from the confirmed one already
    exercised
  why: SimulateEvaluation's discriminated union carries refuted in the identical branch as confirmed —
    same fields, same optionality — so a confirmed-verdict fixture already exercises the whole branch;
    a refuted fixture would repeat the same assertions under a different string literal
- edge_case: asserting a confirmed/decided evaluation carries no reason property (the mirror of the inconclusive
    branch's own usage/elapsed_ms/prompt absence already tested)
  why: the hook performs no runtime parsing or narrowing of the response body (it is returned to the caller
    exactly as apiFetch's generic cast types it) — a decided evaluation lacking reason is enforced only
    by TypeScript's discriminated union at compile time, never at runtime, so a test asserting its absence
    at runtime would only be re-asserting a property the test's own fixture chose not to include, not
    something the hook computed or enforced
- edge_case: a subject with zero attributes, or a request body with an empty/absent field
  why: no criterion of this task states validation of the request body's contents; the hook dispatches
    whatever body a caller passes without inspecting it, so there is no branch such an input would exercise
    differently from any other body
- edge_case: duplicate evidence items for the same concept, or duplicate evaluations for the same hypothesis
  why: no bound node states a uniqueness constraint over evidence or evaluations that this hook enforces
    or could violate; it passes the response array through unmodified regardless of duplication
untested:
- 'the implementation record''s inference that SimulateSubjectAttributeValue is declared locally rather
  than importing use-test-connector-panel.ts''s own SubjectAttributeValue — this is a source-organization
  choice (which module a type is imported from) with no runtime signature: both forms produce an identical
  dispatched request body and an identical typed response, so no test written against this hook''s observable
  behavior could distinguish them. Left unproven deliberately rather than pinned by a test that would
  actually assert something else (the request body''s own field names, already covered by a separate test).'
- TypeScript's own compile-time enforcement that a decided (confirmed/refuted) SimulateEvaluation never
  carries reason and an inconclusive one never carries usage/elapsed_ms/prompt as a matter of the type
  system, as opposed to the runtime pass-through behavior this suite proves. The discriminated union's
  closure is a tsc/build-step guarantee, not something a vitest assertion over the hook's runtime output
  can exercise, since the hook performs no runtime narrowing of its own.
---

## What it is

Fourteen tests across three spec files, proving the use-simulate-case hook's request shape, its full typed response (evidence, evaluations, assessment, cost, durations, including both the fully-populated and the conditionally-absent field cases), the no-cache-invalidation guarantee, failure resolution through the shared uiStateForApiError convention, and pending/re-entrancy gating.

## Notes

None.
