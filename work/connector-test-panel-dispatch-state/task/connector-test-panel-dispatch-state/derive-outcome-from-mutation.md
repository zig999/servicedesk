---
title: Derive the test dispatch outcome from the mutation instead of duplicating it
summary: testOutcome is computed from useMutation's own status/data/error at render/return
  time instead of a separately-set useState assigned in onSuccess/onError, without
  reintroducing the impossible-state bug the sibling task fixed.
rationale: This corrective task fixes an STA-01 finding from the project's own standard
  (server-fetched data is read directly rather than copied into a second piece of
  state), not a domain fact the specification states. The execution-contract-binder
  read contracts/integration/connector-diagnostics.md fresh and found it governs the
  test-connector API operation's business semantics, not the internal derivation mechanics
  of a React hook's own local UI state -- no candidate the specification holds governs
  this task's objective or criteria, so it implements none.
sources:
- intake/derive-outcome-from-mutation.md
objective: useTestConnectorPanel no longer holds a second, independent copy of the
  mutation's own result state; testOutcome is derived from the mutation object itself,
  and the original TYP-04 fix (a stale successful result and a fresh error cannot
  coexist) still holds under the new derivation.
criteria:
- useTestConnectorPanel no longer declares testOutcome as an independently-set useState
  assigned inside onSuccess/onError -- it is computed from the mutation object's own
  state at render/return time, so there is no second, separately-settable copy of
  what the mutation already holds.
- 'After a first dispatch succeeds and a second dispatch (against the same or a changed
  subject) fails, the returned testOutcome is exactly {kind: "failed", message} --
  never a value also carrying the first call''s own result -- proving the original
  TYP-04 fix still holds under the new derivation.'
depends_on:
- task/connector-test-panel-dispatch-state/discriminate-test-dispatch-outcome
---

## What it is
Corrective increment fixing the STA-01 finding from review/discriminate-test-dispatch-outcome.md, over the sibling task in this same initiative.
useTestConnectorPanel's testOutcome, changed from an independently-set useState mirroring useMutation's own status/data/error to a value derived from the mutation object itself, without reintroducing the impossible-state bug the sibling task fixed.

## Notes
None.
