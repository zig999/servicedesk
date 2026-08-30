---
title: Derive the test dispatch outcome from the mutation instead of duplicating it
summary: use-test-connector-panel.ts computes testOutcome from useMutation's own status/data/error at
  render/return time, calling mutation.reset() before every dispatch so a second call's outcome never
  carries the first call's stale result.
task: sha256:6e04cf9e80e5929f812eff1bcd37a82bd8359ed81210bba83d1241066cf165b4
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-test-panel-dispatch-state-derive-outcome-from-mutation-build-2
files:
- path: src/hooks/use-test-connector-panel.ts
  effect: testOutcome is no longer a useState assigned inside onSuccess/onError; a new module-level testOutcomeFromMutation(mutation)
    switches on mutation.status to build the same TestDispatchOutcome discriminated union, called once
    at render/return time. onTest now calls mutation.reset() immediately before mutation.mutate() on every
    dispatch (clearing react-query's own retained data/error from the prior call), and mutation.mutate()'s
    onSuccess/onError callbacks are removed -- only onSettled remains, to clear isDispatchingRef.
criteria:
- criterion: useTestConnectorPanel no longer declares testOutcome as an independently-set useState assigned
    inside onSuccess/onError -- it is computed from the mutation object's own state at render/return time,
    so there is no second, separately-settable copy of what the mutation already holds.
  met: true
  how: The useState<TestDispatchOutcome> declaration and both setTestOutcome calls (previously in onSuccess/onError)
    are removed. const testOutcome = testOutcomeFromMutation(mutation); is computed just before the return
    statement, switching on mutation.status/mutation.data/mutation.error -- the only remaining source
    of that value.
- criterion: 'After a first dispatch succeeds and a second dispatch (against the same or a changed subject)
    fails, the returned testOutcome is exactly {kind: "failed", message} -- never a value also carrying
    the first call''s own result -- proving the original TYP-04 fix still holds under the new derivation.'
  met: true
  how: 'onTest calls mutation.reset() before mutation.mutate() on every dispatch, so mutation.data/mutation.error
    always belong only to the call in flight or the one that just settled. testOutcomeFromMutation''s
    error branch returns exactly { kind: "failed", message: testDispatchFailureMessage(mutation.error)
    } -- a literal with only that field, matching TestDispatchOutcome''s own failed variant, which structurally
    has no result field to carry a stale value in.'
inferences:
- inferred: mutation.reset() called immediately before mutation.mutate() inside onTest is the mechanism
    that keeps react-query's own retained data/error from leaking into testOutcomeFromMutation's derivation
    across dispatches.
  from: the task's own Notes offer this exact approach as an example ("not prescriptive") rather than
    a stated requirement; it is the simplest mechanism that reuses react-query's own public API rather
    than adding a second, hand-rolled call-generation guard.
- inferred: testOutcomeFromMutation's mutation parameter is typed UseMutationResult<TestConnectorResult,
    Error, TestConnectorRequestBody> (TError = Error).
  from: no node or criterion states the mutation's error generic; confirmed by reading @tanstack/query-core's
    own DefaultError declaration (resolves to Error absent a Register augmentation) and confirming no
    such augmentation exists anywhere under src.
- inferred: testOutcomeFromMutation is called as a plain, non-memoized function right before the return
    statement rather than wrapped in useMemo.
  from: the standard's PRF-02 (a memoization hook is not applied by default to a trivial derivation) --
    a four-branch switch over an already-available object is exactly that, and no criterion asks for memoization.
- inferred: mutation.mutate()'s onSuccess/onError callbacks are removed entirely (only onSettled remains)
    rather than kept as empty or repurposed callbacks.
  from: testOutcome no longer needs any callback to update it -- useMutation's own subscription already
    re-renders the hook on every status change -- while onSettled is kept because isDispatchingRef's own
    pre-existing re-entrancy guard (which this task must preserve) still needs a callback to clear it.
preserved:
- the capability/subjectType/attributes/requester component state and their handlers (onSelectCapability,
  onSubjectTypeChange, onAttributeChange, onRemoveAttribute, onRequesterChange)
- canTest's own derivation (selectedCapability, subjectType, hasCompleteAttribute, requester)
- onAddAttribute's placeholder-reconciliation logic (parsesAsConfigurationObject, reconcileAttributeRows,
  configurationTextRef)
- isDispatchingRef's own re-entrancy guard and nextRowIdRef's own locally-generated row-id minting
- the TestDispatchOutcome discriminated union's own shape and its TYP-04 invariant (no branch ever carries
  two of result/message/pending at once)
- testDispatchFailureMessage's own generic-message-through-error-ui-state.ts convention (GENERIC_TEST_DISPATCH_FAILURE_MESSAGE,
  TEST_DISPATCH_FAILURE_MESSAGE_BY_KIND, uiStateForApiError) -- only its call site moved
- every JSDoc fact naming a specification node or contract in the file's header comment
deferred:
- what: 'use-simulate-case.ts''s own sibling hook reads result: mutation.data ?? null directly while keeping
    simulateError as a separate useState cleared only at dispatch start (not on every mutation state change),
    which appears to risk the same stale-result-beside-a-fresh-error combination this task fixes here.'
  why: this task's objective and criteria name only useTestConnectorPanel; widening to a second hook is
    outside this corrective task's scope.
---

## What it is
Corrective increment fixing the STA-01 finding from review/discriminate-test-dispatch-outcome.md: useTestConnectorPanel's testOutcome, changed from an independently-set useState mirroring useMutation's own status/data/error to a value derived from the mutation object itself, without reintroducing the impossible-state bug the sibling task fixed. mutation.reset() is called before every dispatch so react-query's own retained data/error from a prior call never leaks into the current one's derivation.

## Notes
None.
