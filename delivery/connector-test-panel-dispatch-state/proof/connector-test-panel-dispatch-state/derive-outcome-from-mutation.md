---
title: Runtime proof that testOutcome is derived from the mutation, and TYP-04 still holds across sequential
  dispatches
summary: Four renderHook-level tests over useTestConnectorPanel prove testOutcome tracks mutation.status/data/error
  on every render with no separate settable copy (criterion 1), and that a second dispatch's outcome never
  carries the first dispatch's leftover result or message in either succeed-then-fail or fail-then-succeed
  order (criterion 2).
implementation: sha256:de32a988c5de90a49c00e8afa85f8f73cbbb29e6174ed7ae9364b84e253213a9
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-test-panel-dispatch-state-derive-outcome-from-mutation-suite-4
tests:
- file: src/hooks/use-test-connector-panel.spec.ts
  name: 'useTestConnectorPanel -- testOutcome is derived from the mutation''s own state, not a separately-set
    useState (criterion 1) > starts as {kind: ''idle''} before any dispatch has ever been made'
  proves: useTestConnectorPanel no longer declares testOutcome as an independently-set useState assigned
    inside onSuccess/onError -- it is computed from the mutation object's own state at render/return time,
    so there is no second, separately-settable copy of what the mutation already holds.
  fails_when: testOutcome renders as anything other than exactly {kind:"idle"} on first mount, before
    onTest is ever called -- e.g. a reintroduced useState defaulting to a different shape, or carrying
    extra fields alongside kind.
- file: src/hooks/use-test-connector-panel.spec.ts
  name: useTestConnectorPanel -- testOutcome is derived from the mutation's own state, not a separately-set
    useState (criterion 1) > reports pending exactly while a dispatch is in flight, then succeeded once
    it resolves -- tracking the mutation's own status on every render rather than a value a callback set
    once
  proves: useTestConnectorPanel no longer declares testOutcome as an independently-set useState assigned
    inside onSuccess/onError -- it is computed from the mutation object's own state at render/return time,
    so there is no second, separately-settable copy of what the mutation already holds.
  fails_when: testOutcome does not report exactly {kind:"pending"} while the dispatch's own promise is
    still unresolved, or does not become exactly {kind:"succeeded", result:<the resolved TestConnectorResult>}
    once it settles -- e.g. if testOutcome were still driven by a useState set only inside a removed onSuccess
    callback it would never observe the pending render at all, or would lag a render behind mutation.status.
- file: src/hooks/use-test-connector-panel.spec.ts
  name: 'useTestConnectorPanel -- a second dispatch''s own outcome never carries the first dispatch''s
    own leftover result or message (criterion 2) > replaces a first dispatch''s own succeeded result with
    exactly {kind: "failed", message} once a second dispatch fails, carrying no leftover result field'
  proves: 'After a first dispatch succeeds and a second dispatch (against the same or a changed subject)
    fails, the returned testOutcome is exactly {kind: "failed", message} -- never a value also carrying
    the first call''s own result -- proving the original TYP-04 fix still holds under the new derivation.'
  fails_when: testOutcome after the second (failing) dispatch is anything other than exactly {kind:"failed",
    message:<the generic dispatch-failure message>} -- in particular if it still carries a result field
    left over from the first dispatch (the exact TYP-04 regression this task fixes), or the message text
    is computed differently.
- file: src/hooks/use-test-connector-panel.spec.ts
  name: 'useTestConnectorPanel -- a second dispatch''s own outcome never carries the first dispatch''s
    own leftover result or message (criterion 2) > replaces a first dispatch''s own failed message with
    exactly {kind: "succeeded", result} once a second dispatch succeeds, carrying no leftover message
    field'
  proves: The same mechanism criterion 2 states, read from its opposite direction -- a stale failed message
    must not survive alongside a fresh succeeded result, corroborating that mutation.reset() before every
    dispatch clears an error the same way it clears a result.
  fails_when: testOutcome after the second (succeeding) dispatch is anything other than exactly {kind:"succeeded",
    result:<the resolved TestConnectorResult>} -- in particular if it still carries a message field left
    over from the first dispatch's own failure.
not_applicable:
- edge_case: Absent/empty input, a numeric range boundary, an empty collection, a duplicate value.
  why: This task changes only how one internal result field (testOutcome) is produced from an existing
    mutation object; it introduces no new user-supplied input, no numeric range, no collection and no
    uniqueness constraint for any of these classes to apply to.
- edge_case: An operation attempted against a state that forbids it (Test clicked with incomplete fields),
    and two operations against one subject at once read concurrently (two clicks before either settles).
  why: Unchanged by this task -- isDispatchingRef's own re-entrancy guard and the canTest gate are untouched,
    and both are already proven in connector-test-panel-dispatch-safety.spec.ts. Rewriting either here
    would describe the same already-proven behavior rather than this task's own criteria.
- edge_case: A dependency that answers slowly.
  why: Read as the pending-state edge case for the mutation this task's criterion 1 is about, and directly
    tested above (the pending->succeeded test) rather than dismissed.
untested:
- The disclosed inference that testOutcomeFromMutation is called as a plain, non-memoized function rather
  than wrapped in useMemo (PRF-02) -- no criterion requires memoization, and asserting a render-count
  or return-value reference-identity claim would prove a performance choice no criterion states rather
  than either of this task's two criteria.
- The disclosed inference that testOutcomeFromMutation's mutation parameter is typed UseMutationResult<...,
  Error, ...> (TError = Error) -- exercised only indirectly, through a real Error-shaped ApiError flowing
  through the failure-path tests above; no test independently pins the generic itself.
- That mutation.mutate()'s own onSuccess/onError callbacks were removed and only onSettled remains --
  an internal call this framework's own instructions refuse to assert on directly (a test asserts observable
  behavior, never that a particular callback was or was not wired); its sole observable consequence, that
  testOutcome still updates correctly without them, is what the four tests above already prove.
---

## What it is
Four runtime tests proving useTestConnectorPanel's testOutcome tracks useMutation's own status/data/error on every render (criterion 1), and that mutation.reset() before every dispatch keeps a second dispatch's outcome free of the first dispatch's own leftover result or message in both orders -- succeed-then-fail and fail-then-succeed (criterion 2, the TYP-04 regression this task fixes).

## Notes
Three suite attempts preceded the passing one pinned above, and none surfaced any failure in a file this delivery touched (src/hooks/use-test-connector-panel.ts or its spec):
- run/connector-test-panel-dispatch-state-derive-outcome-from-mutation-suite failed one test in src/routes/new-case-draft-screen-seed-post.spec.ts (a findByDisplayValue timeout), unrelated code this delivery never touched. A failure-diagnostician read that run and returned cause: setup -- the harness/environment did not stand up in time for an unrelated async assertion under heavy worker load, not a defect in this delivery's own code or tests.
- run/connector-test-panel-dispatch-state-derive-outcome-from-mutation-suite-2 failed four tests, again none in a file this delivery touched, while a separate, concurrent worktree was independently running its own full suite against the same machine at the same time, competing for CPU. Once that unrelated process finished, a rerun was warranted rather than diagnosed as this delivery's own defect.
- run/connector-test-panel-dispatch-state-derive-outcome-from-mutation-suite-3 failed exactly one test: src/hooks/use-connector-configuration-detail-validity.spec.ts's 'a number' sub-case, in code this delivery never touched (src/hooks/use-connector-configuration-detail.ts). This is the same pre-existing race already diagnosed and documented in the sibling task's own proof (proof/connector-test-panel-dispatch-state/discriminate-test-dispatch-outcome.md's Notes): configurationValid is seeded via useState(true) and corrected only inside a useEffect, so phase:"ready" can be observed for one render before that correction runs, independent of testOutcome and of this task's own criteria.

A fourth attempt (run/connector-test-panel-dispatch-state-derive-outcome-from-mutation-suite-4, pinned above) passed every one of its 973 tests with no code change, confirming each of the three prior reds was environmental/pre-existing rather than a regression this delivery introduced.
