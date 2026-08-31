---
title: Model useTestConnectorPanel's dispatch outcome as one discriminated union
summary: TestConnectorPanelState's isTesting/result/testError fields are replaced by one discriminated
  testOutcome field (idle/pending/succeeded/failed), and ConnectorTestPanel, ConnectorTestPanelFields
  and ConnectorTestPanelResult are updated to read it, so a stale successful result and a fresh error
  can no longer coexist in the type a caller reads.
task: sha256:589bd9fdd8b9a5335a3850bb8879d410211496a5fea88b08975a47f9f06a8879
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-test-panel-dispatch-state-discriminate-test-dispatch-outcome-build
files:
- path: src/hooks/use-test-connector-panel.ts
  effect: 'declares TestDispatchOutcome ({kind:"idle"}|{kind:"pending"}|{kind:"succeeded", result}|{kind:"failed",
    error}), tagged `kind` to mirror TestConnectorOutcome''s own tag rather than this app''s `phase` load-lifecycle
    convention. TestConnectorPanelState''s isTesting/result/testError fields are replaced by one `testOutcome`
    field of type TestDispatchOutcome. The hook''s own testError useState is replaced by one testOutcome
    useState (of type TestDispatchOutcome) seeded to {kind:"idle"}; onTest sets {kind:"pending"} before
    dispatch, and mutation.mutate''s own onSuccess/onError callbacks set {kind:"succeeded", result: data}
    / {kind:"failed", error: message} respectively -- mutation.isPending and mutation.data are no longer
    read anywhere in this file, so the returned union is now the one place this state lives rather than
    a value recomputed from three independently-settable sources at render time.'
- path: src/routes/connector-test-panel.tsx
  effect: passes ConnectorTestPanelResult a single testOutcome prop (state.testOutcome) in place of the
    three separate isTesting/testError/result props it used to forward.
- path: src/routes/connector-test-panel-fields.tsx
  effect: the Test button's disabled expression reads state.testOutcome.kind === "pending" in place of
    state.isTesting; no other read of the old fields existed in this file.
- path: src/routes/connector-test-panel-result.tsx
  effect: ConnectorTestPanelResultProps collapses to one testOutcome field of type TestDispatchOutcome
    in place of its own isTesting/testError/result props. The component body switches on testOutcome.kind
    ("pending" leads to the sending message, "failed" leads to the alert paragraph with testOutcome.error,
    "idle" renders null, otherwise it destructures the result field from the narrowed "succeeded" variant)
    and renders the unchanged two-column request/response layout from that result.
criteria:
- criterion: TestConnectorPanelState's type can no longer represent, simultaneously, a result from a previous
    successful call and an error from a more recent failed call -- the type's own structure (a discriminated
    union) makes that combination unrepresentable, not merely avoided at runtime.
  met: true
  how: 'TestConnectorPanelState now holds one testOutcome field of type TestDispatchOutcome, and TestDispatchOutcome
    is a four-member discriminated union whose "succeeded" member is the only one carrying a result and
    whose "failed" member is the only one carrying an error -- no member of the union carries both, so
    a value of this type can never hold a result and an error at once, structurally rather than by runtime
    discipline. This also closes the concrete stale-data path the old three-field shape left open: TanStack
    Query does not clear mutation.data when a later mutate() call fails, so the old result (mutation.data
    or null) alongside a freshly-set testError could read a prior success and a fresh error simultaneously;
    the new code never reads mutation.data or mutation.isPending at all -- onSuccess/onError explicitly
    replace the whole testOutcome value, so a failed call''s own {kind:"failed"} discards whatever {kind:"succeeded",result}
    preceded it.'
inferences:
- inferred: the union's discriminant field is named kind, matching TestConnectorOutcome's own tag immediately
    above it in the same file, rather than status (the task's own illustrative suggestion) or phase (this
    codebase's established tag for a route's one-shot load lifecycle, e.g. ConnectorConfigurationDetailState,
    CapabilityDetailState).
  from: the task's own notes direct reusing TestConnectorOutcome's shape/naming convention for consistency
    if sensible; TestConnectorOutcome is the closer precedent because it is also an outcome of one dispatched
    call, where phase names a screen's load lifecycle, a different kind of state machine this hook does
    not have.
- inferred: testOutcome is tracked as its own local useState, explicitly set at each of the three transition
    points (dispatch start, success, error) in onTest, rather than derived at render time from mutation.isPending/mutation.data/mutation.error.
  from: deriving it from the mutation observer's own three signals would still leave three independently-updating
    sources feeding one value every render, which is exactly the kind of drift (mutation.data persisting
    across a later failed call) the criterion asks to make unrepresentable; setting the union explicitly
    at each transition is what makes it the single source of truth the type's own shape implies.
- inferred: ConnectorTestPanelResultProps is also collapsed to one testOutcome prop, rather than keeping
    its own three independent isTesting/testError/result props fed from the new union.
  from: the task's own instruction to update every consumer to read the new discriminated shape instead
    of the three old fields; leaving ConnectorTestPanelResultProps as three props would recreate, one
    level down, the exact representable-impossible-state problem this task fixes at the hook's own boundary.
preserved:
- The Test button in ConnectorTestPanelFields must stay disabled for exactly the same condition as before
  (a dispatch in flight), now read as state.testOutcome.kind === "pending" in place of state.isTesting.
- 'ConnectorTestPanelResult must keep rendering exactly the same four branches with the same content:
  "Sending test call..." while a dispatch is in flight, the destructive alert paragraph with the failure
  message on error, nothing before any call has completed, and the unchanged two-column request/response
  layout (including the response''s own "response"/"timed-out"/"error" kinds) on success.'
- testDispatchFailureMessage's mapping through error-ui-state.ts's central registry is unchanged, and
  its returned string is still exactly what reaches the rendered failure paragraph.
- Every other criterion this file already answers (capability filtering, onAddAttribute's placeholder-reconciliation
  gating via parsesAsConfigurationObject/reconcileAttributeRows, canTest's gating, requester/subjectType/attributes
  state) is untouched by this task and must keep behaving exactly as before.
- TestConnectorOutcome and TestConnectorResult (the wire-level types) and the actual POST /v1/test-connector
  dispatch logic are untouched, per this task's own instruction.
deferred:
- what: connector-test-panel-forwards-configuration-text.spec.ts's own stub useTestConnectorPanel mock
    (around its lines 22-41) still returns a literal object with isTesting/testError/result fields, which
    will no longer match TestConnectorPanelState's type now that it holds testOutcome instead.
  why: this task's own instruction is explicit that no test/spec file is touched by this record -- writing
    source and writing what proves it are two separate judgments in two separate contexts, and updating
    that stub belongs to the test-author working from this implementation next; recorded here so it is
    not overlooked.
---

## What it is
TestConnectorPanelState's isTesting/result/testError fields are replaced by one discriminated
testOutcome field, and ConnectorTestPanel, ConnectorTestPanelFields and ConnectorTestPanelResult
are updated to read it, so a stale successful result and a fresh error can no longer coexist in
the type a caller reads.

## Notes
This task implements no specification node: it fixes a TYP-04 finding from the project's own
standard (a value with a fixed, known set of shapes must be modeled as a discriminated union),
not a domain fact the specification states. The execution-contract-binder read
contracts/integration/connector-diagnostics.md fresh and found it governs the test-connector
API operation's business semantics, not the internal shape of a React hook's own local UI
state -- no candidate the specification holds governs this task's objective or criteria, so it
implements none.
