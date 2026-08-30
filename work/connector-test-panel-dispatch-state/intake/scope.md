# Corrective increment scope

Origin: TYP-04 finding from the review record
`delivery/connector-test-panel-placeholder-attributes/review/deduplicate-configuration-object-check.md`
(the predecessor initiative, now closed), over `frontend/app/src/hooks/use-test-connector-panel.ts`,
corrected now by the human's own explicit request ("abra uma task corretiva pra ajustar o TYP-04").

## Behavior to correct

`TestConnectorPanelState` (and the corresponding assembly inside `useTestConnectorPanel`)
represents the test dispatch's own outcome as three independent fields:

```
readonly isTesting: boolean;
readonly result: TestConnectorResult | null;
readonly testError: string | null;
```

`onTest` clears `testError` before each dispatch, but never clears `mutation.data`, and
react-query does not clear a mutation's prior `data` on a subsequent `mutate()` call either. This
permits an impossible state: a second dispatch that fails leaves `result` still holding the
previous successful call's payload while `testError` now holds the new failure — a combination
the type permits and the compiler cannot refuse (TYP-04: "A value with a fixed, known set of
shapes is modeled as a discriminated union, never as a bag of optional fields").

Fix: model the outcome as one discriminated field — e.g.
`testOutcome: {kind: "idle"} | {kind: "testing"} | {kind: "succeeded"; result: TestConnectorResult} | {kind: "failed"; message: string}`
— so a stale result and a live error cannot coexist in the type a caller reads. Update every
current consumer of `isTesting`/`result`/`testError` (`ConnectorTestPanel` and its children, and
the specs exercising them) to the new shape.

Target: frontend (`frontend/app`). New initiative: `connector-test-panel-dispatch-state` (the
predecessor initiative, `connector-test-panel-placeholder-attributes`, is closed and cannot take
new tasks).
