---
title: Discriminated test-dispatch outcome makes a stale success and a fresh failure unrepresentable together
summary: A behavioral test exercises a success dispatch followed by a failing dispatch and asserts the
  panel shows only the fresh failure message with no trace of the prior success anywhere in the rendered
  output, proving TestDispatchOutcome's shape (not merely runtime discipline) rules out the stale-result-plus-fresh-error
  combination; a stub mock left over from the old three-field state shape is corrected to compile against
  the new testOutcome field.
implementation: sha256:bec512e72e2507cc6c694ece6e6c995abf8d8e093c25e7f0fc6ffa97b4e53125
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-test-panel-dispatch-state-discriminate-test-dispatch-outcome-suite-3
tests:
- file: src/routes/connector-test-panel-request-response.spec.ts
  name: ConnectorTestPanel -- a later failed call discards a stale successful result entirely, leaving
    no trace of it in the rendered output (task/connector-test-panel-dispatch-state/discriminate-test-dispatch-outcome)
    > renders only the failure message once a second dispatch fails, with nothing of the first call's
    own successful result still visible
  proves: 'TestConnectorPanelState''s testOutcome cannot hold, at once, a result from a previous successful
    call and an error from a more recent failed call: dispatching a call that succeeds (its status, headers
    and body render) and then dispatching a second call that fails leaves the rendered output holding
    only the fresh failure message, with none of the first call''s status, headers, body or the ''Request
    sent''/''Response received'' section headings surviving into it. This is the concrete, observable
    consequence the task''s own criterion states for its type-level guarantee: the disclosed inference
    that testOutcome is set explicitly at each transition (dispatch start, success, error) rather than
    derived from mutation.isPending/mutation.data/mutation.error is what this test pins, since deriving
    from those three independent TanStack Query signals would leave mutation.data from the first call
    still present (TanStack Query does not clear it on a later failed mutate()) alongside the fresh error,
    which is exactly the stale-result-plus-fresh-error combination the criterion asks to make unrepresentable.'
  fails_when: 'after the second (failing) dispatch settles, the rendered dialog still contains any of
    "Status: 200", the literal text "hola", "Request sent", or "Response received" -- i.e. the prior success''s
    own rendered fragments survive alongside the fresh failure message -- or the failure message itself
    never appears.'
not_applicable:
- edge_case: absent or empty input to testOutcome
  why: testOutcome is never constructed from user-typed input; it is set entirely by this hook's own three
    transition points (dispatch start, success, error), so there is no absent/empty-input case of its
    own to test beyond the pre-existing empty-required-field disabled-state test.
- edge_case: a boundary at each end of a numeric range
  why: TestDispatchOutcome carries no numeric range of its own for this task's own criterion to bound.
- edge_case: a duplicate where uniqueness is claimed
  why: no criterion of this task claims uniqueness over any collection; not applicable.
- edge_case: an operation against state that forbids it
  why: already covered, unaffected by this task's own change, by the pre-existing "Test stays disabled
    until every required field is filled" test.
- edge_case: a dependency that fails or answers slowly
  why: already covered, unaffected by this task's own change, by the pre-existing capabilities-read-failure
    test and the pre-existing single-dispatch-failure test in connector-test-panel-dispatch-safety.spec.ts.
- edge_case: two operations against one subject at once
  why: already covered, unaffected by this task's own change (the isDispatchingRef guard this task does
    not touch), by the pre-existing "issues only one POST /v1/test-connector call when Test is clicked
    twice before the first call settles" test.
untested:
- The union's discriminant field is named `kind` rather than `status` or `phase` (a disclosed inference).
  This is a compile-time-only fact with no runtime-observable consequence -- renaming the tag would not
  change any rendered text, disabled attribute, or dispatched request -- so no runtime test can assert
  it without reaching into the value's own internal shape, which TST-01 (this project's own standard)
  forbids a test from doing. Left unproven for that reason rather than omitted silently.
- Whether the Test button is disabled, and whether "Sending test call..." renders, specifically while
  testOutcome.kind === "pending" (as opposed to before any dispatch, which the pre-existing "Test stays
  disabled until every required field is filled" test in connector-test-panel-dispatch-safety.spec.ts
  already covers). This task rearranges an existing, already-working preserved behavior (the implementation
  record's own "preserved" list) rather than introducing it, and no pre-existing test exercised the in-flight-pending
  render before this task either -- the gap pre-dates this task's own criterion and is not something the
  type-level rearrangement itself asks to be freshly proven, so no new test is written for it per the
  framework's own rule against pinning a rearrangement's shape with the rearrangement itself.
- 'ConnectorTestPanelResultProps collapsing to one `testOutcome` prop (a disclosed inference) is not separately
  tested here: every rendering test in connector-test-panel-request-response.spec.ts and connector-test-panel-dispatch-safety.spec.ts
  already renders ConnectorTestPanelResult through the real component tree with that exact prop shape
  and asserts its output, so this inference is already exercised by the full existing suite rather than
  left to a fresh test.'
---

## What it is
A new test in connector-test-panel-request-response.spec.ts dispatches a successful test call,
then a second call that fails, and asserts the rendered output holds only the fresh failure
message with no trace of the prior success -- the concrete, observable consequence of
TestDispatchOutcome making that combination unrepresentable in the type itself. A stale stub mock
in connector-test-panel-forwards-configuration-text.spec.ts (left over from the old
isTesting/result/testError shape) is corrected to compile against the new testOutcome field.

## Notes
The discriminant field's name (`kind`), the pending-state render, and ConnectorTestPanelResultProps'
own prop collapse are each disclosed as untested above, with why: a compile-time-only fact, a
pre-existing gap this task did not introduce, and a fact already exercised incidentally by the full
existing suite, respectively.
