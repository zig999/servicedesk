---
title: Model the test dispatch outcome as a discriminated union
summary: useTestConnectorPanel's TestConnectorPanelState now returns one discriminated testOutcome field
  (idle/pending/succeeded/failed) in place of the independent isTesting/result/testError fields, and every
  production consumer reads it.
task: sha256:589bd9fdd8b9a5335a3850bb8879d410211496a5fea88b08975a47f9f06a8879
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-test-panel-dispatch-state-discriminate-test-dispatch-outcome-build-3
files:
- path: src/hooks/use-test-connector-panel.ts
  effect: 'exports a new TestDispatchOutcome discriminated union ({ kind: "idle" } | { kind: "pending"
    } | { kind: "succeeded"; result } | { kind: "failed"; message }); replaces TestConnectorPanelState''s
    isTesting/result/testError with one testOutcome field of that type; replaces the removed testError
    useState with a testOutcome useState, and onTest now sets exactly one variant at each stage of the
    dispatch (pending on start, succeeded with the response''s result on success, failed with the mapped
    message on error) instead of leaving react-query''s own isPending/data/error read independently, so
    a previous call''s result can no longer survive alongside a later call''s error.'
- path: src/routes/connector-test-panel.tsx
  effect: ConnectorTestPanel now passes state.testOutcome as ConnectorTestPanelResult's single prop instead
    of spreading isTesting/testError/result across three separate props.
- path: src/routes/connector-test-panel-result.tsx
  effect: ConnectorTestPanelResultProps now declares one testOutcome field (TestDispatchOutcome) instead
    of isTesting/testError/result; the component switches over testOutcome.kind (idle -> null, pending
    -> the sending message, failed -> the alert with testOutcome.message, succeeded -> the existing request/response
    rendering read off testOutcome.result).
- path: src/routes/connector-test-panel-fields.tsx
  effect: the Test button's disabled expression now reads state.testOutcome.kind === "pending" in place
    of the removed state.isTesting.
criteria:
- criterion: TestConnectorPanelState's type can no longer represent, simultaneously, a result from a previous
    successful call and an error from a more recent failed call -- the type's own structure (a discriminated
    union) makes that combination unrepresentable, not merely avoided at runtime.
  met: true
  how: 'TestConnectorPanelState now exposes one field, testOutcome, typed as the union { kind: "idle"
    } | { kind: "pending" } | { kind: "succeeded"; result } | { kind: "failed"; message }. A result and
    an error are carried by two different variants of the same tagged union, so a value of this type holds
    at most one of them by TypeScript''s own exhaustiveness over the "kind" discriminant -- there is no
    shape in the type where both a `result` field and a `message` field coexist. This also closes the
    runtime path that used to produce the combination: onTest previously left the mutation''s own `data`
    (react-query keeps the last successful response around across a later call) untouched while independently
    setting `testError`, so a stale result and a fresh error were simultaneously readable off the old
    three-field shape; testOutcome is instead explicit local state that onTest sets to exactly one variant
    at each stage (pending on dispatch, succeeded with the fresh result on success, failed with the mapped
    message on error), so no earlier call''s result can survive into a later call''s error state even
    before the type change is considered.'
inferences:
- inferred: testOutcome needs an "idle" variant for the state before any test has ever been dispatched
    (no capability selected yet, or selected but never clicked).
  from: 'the criterion states only that a stale result must not coexist with a fresh error; it names no
    label for the pre-dispatch state. The three fields being replaced already needed one (isTesting: false,
    result: null, testError: null all at once), so the union needs an explicit variant to replace that
    same starting point rather than defaulting to one of the other three, none of which describes it.'
- inferred: testOutcome is tracked as this hook's own local state, set explicitly to one variant at each
    stage of onTest, rather than derived inline from useMutation's own isPending/data/error.
  from: react-query's useMutation keeps `data` from the previous successful call while a later call is
    pending or has errored -- reading testOutcome as a computed projection of isPending/data/error at
    render time would have reintroduced exactly the representable-but-impossible combination (a fresh
    error, stale data) one layer down, inside the derivation itself, even with the union type sitting
    on top of it. Setting the state explicitly at each dispatch stage is what makes the impossible combination
    unrepresentable in practice as well as in the type.
deferred:
- what: connector-test-panel-forwards-configuration-text.spec.ts and connector-configuration-form-dialog-forwards-configuration-text.spec.ts
    each mock useTestConnectorPanel's return value with the old isTesting/result/testError fields rather
    than the new testOutcome field.
  why: this task's implementation is scoped to source only, leaving tests -- including updating existing
    spec files' stubs to match a changed type -- to the test-author's later step; neither spec file's
    own assertions concern the dispatch-outcome shape (both assert configurationText forwarding, unrelated
    to this task's objective), so their stubs' extra/missing fields are the one loose end this task's
    own scope does not reach.
---

## What it is
Corrective TYP-04 fix: useTestConnectorPanel's dispatch-outcome fields (isTesting, result, testError) collapsed into one discriminated testOutcome field ({kind:"idle"}|{kind:"pending"}|{kind:"succeeded",result}|{kind:"failed",message}), with every production consumer (ConnectorTestPanel, ConnectorTestPanelResult, ConnectorTestPanelFields) updated to read it.

## Notes
The first two build attempts (run/connector-test-panel-dispatch-state-discriminate-test-dispatch-outcome-build and -build-2) failed typecheck for a reason unrelated to this task's source: the frontend/tui git submodule this worktree resolves @tui/ui/* against was not checked out, and once checked out its own separately-installed node_modules was also absent. Both are environment bootstrap facts of this worktree, not source this delivery wrote; they were resolved by running `git submodule update --init --recursive` and `npm ci` under frontend/tui/frontend, then re-running frontend/app's own `npm ci` so its postinstall dedupe script relinked react/react-dom. The third build attempt (build-3) passed clean. No source line changed between attempts.
