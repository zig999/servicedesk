# Corrective increment scope

Origin: STA-01 finding from the review record
`delivery/connector-test-panel-dispatch-state/review/discriminate-test-dispatch-outcome.md`, over
`frontend/app/src/hooks/use-test-connector-panel.ts`, corrected now by the human's own explicit
request ("abre task corretiva pro STA-01").

## Behavior to correct

`useTestConnectorPanel` holds `testOutcome` as its own `useState<TestDispatchOutcome>`, set
imperatively inside `useMutation`'s `onSuccess`/`onError` callbacks. This duplicates a fact
`useMutation` already holds in its own cache (`status`/`data`/`error`) into a second, independent
piece of state — the standard's own STA-01 ("server-fetched data is read directly rather than
copied into a second piece of state") names exactly this pattern, because nothing today stops a
future second consumer of this hook from reading `mutation.status`/`mutation.data` directly and
observing a different call's result than `testOutcome` shows.

## Fix

Derive `testOutcome` from the mutation object's own `status`/`data`/`error` at render/return time,
rather than setting a separately managed `useState` imperatively in `onSuccess`/`onError`. The
naive version of this (deriving straight from `mutation.isPending`/`mutation.data`/`mutation.error`
with no other change) reintroduces the exact bug the sibling task
`task/connector-test-panel-dispatch-state/discriminate-test-dispatch-outcome` fixed: react-query
does not clear a mutation's prior `data` (or `error`) on a subsequent `mutate()` call, so a second
dispatch that is still pending, or that fails, could again read a stale `data` from the first
call alongside the new state — the same impossible combination TYP-04 was raised against, one
layer down. Resolving this without reintroducing it is this task's own problem to solve (e.g.
resetting the mutation's own state before each new dispatch, so what it holds always belongs to
the latest call) — the criteria below state the outcome, not the mechanism.

Target: frontend (`frontend/app`). Initiative: `connector-test-panel-dispatch-state` (already
open, holding the sibling task this one follows).

## Criteria (falsifiable)

1. `useTestConnectorPanel` no longer declares `testOutcome` as an independently-set `useState`
   assigned inside `onSuccess`/`onError` — it is computed from the mutation object's own state at
   render/return time, so there is no second, separately-settable copy of what the mutation
   already holds.
2. After a first dispatch succeeds and a second dispatch (against the same or a changed subject)
   fails, the returned `testOutcome` is exactly `{kind: "failed", message}` — never a value also
   carrying the first call's own `result` — proving the original TYP-04 fix still holds under the
   new derivation.
