---
title: Proof that TestDispatchOutcome makes a stale succeeded result and a fresh failed message structurally
  uncoexistable
summary: Two compile-time constructions prove the sole criterion at the type level; two runtime tests
  witness it and this task's own two disclosed inferences in the composed panel; two pre-existing spec
  files were mechanically adapted to the new testOutcome shape so the suite still builds.
implementation: sha256:1e60d0894f260ba400b9e046250f437c765b1c55bb4d86f205fdc6eff0b7784d
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-test-panel-dispatch-state-discriminate-test-dispatch-outcome-suite-2
tests:
- file: src/hooks/use-test-connector-panel.spec.ts
  name: TestDispatchOutcome -- a stale succeeded result and a fresh failed message can never coexist in
    one value (criterion) > refuses a "succeeded" outcome that also carries a fresh failed message
  proves: The task's sole criterion, from the "succeeded" side -- TestDispatchOutcome's own structure,
    not runtime discipline, is what refuses a value combining a result and a message.
  fails_when: A "succeeded" object literal carrying both `result` and `message` type-checks cleanly against
    TestDispatchOutcome (e.g. the union widens back toward the old isTesting/result/testError bag of independent,
    simultaneously-settable fields, or the "succeeded" member itself gains a `message` field) -- the `@ts-expect-error`
    directive above the construction then becomes an "unused directive", a real `npm run typecheck` failure.
- file: src/hooks/use-test-connector-panel.spec.ts
  name: TestDispatchOutcome -- a stale succeeded result and a fresh failed message can never coexist in
    one value (criterion) > refuses a "failed" outcome that also carries a stale succeeded result
  proves: The same criterion from the "failed" side, so a regression widening either member alone is caught,
    not only a regression on one specific member.
  fails_when: A "failed" object literal carrying both `message` and `result` type-checks cleanly against
    TestDispatchOutcome (the "failed" member gains a `result` field, or the same bag-of-fields regression
    as above) -- the `@ts-expect-error` directive becomes unused, failing typecheck.
- file: src/routes/connector-test-panel-fresh-failure-clears-stale-result.spec.ts
  name: ConnectorTestPanel -- a later failed call clears an earlier call's own successful rendering entirely
    > shows only the fresh failure message once a second dispatch fails, with none of the first dispatch's
    own request/response content left on screen
  proves: 'The runtime consequence of the criterion, and this task''s own disclosed inference that testOutcome
    is set explicitly at each dispatch stage rather than derived from useMutation''s own isPending/data/error
    -- a first successful dispatch followed by a second failed one leaves no trace of the first call''s
    own "Request sent"/"Response received"/"Status: 200" rendering once the second call''s failure message
    is showing.'
  fails_when: 'After a second dispatch fails, the panel still shows any of "Request sent", "Response received"
    or "Status: 200" from the first call''s own rendering alongside the fresh failure message -- exactly
    what an inline derivation off react-query''s own lingering `data` would produce.'
- file: src/routes/connector-test-panel-idle-dispatch-state.spec.ts
  name: 'ConnectorTestPanel -- nothing is rendered for the Test result before any dispatch (disclosed
    inference: an explicit "idle" variant) > renders no pending, failure or result content until Test
    is clicked for the first time'
  proves: This task's own first disclosed inference -- testOutcome needs an explicit "idle" variant for
    the pre-dispatch state -- by checking that none of the pending, succeeded or failed renderings appear
    before any dispatch.
  fails_when: Any of "Sending test call…", "Request sent", or the generic dispatch-failure message renders
    before Test has ever been clicked -- e.g. if "idle" were dropped and testOutcome defaulted to one
    of the other three kinds instead.
- file: src/routes/connector-test-panel-forwards-configuration-text.spec.ts
  name: ConnectorTestPanel — forwards configurationText into useTestConnectorPanel (criterion 2) > forwards
    exactly its own connector and configurationText props as useTestConnectorPanel's two positional arguments
  proves: 'Unchanged from before this task -- ConnectorTestPanel still forwards its own connector/configurationText
    props into useTestConnectorPanel''s two positional arguments. The mocked useTestConnectorPanel return''s
    isTesting/result/testError fields were replaced with testOutcome: { kind: "idle" } only so the file
    continues to type-check against the new TestConnectorPanelState; no assertion changed.'
  fails_when: The rendered Requester input's value stops echoing `received:<connector>:<configurationText>`
    at mount.
- file: src/routes/connector-test-panel-forwards-configuration-text.spec.ts
  name: 'ConnectorTestPanel — forwards configurationText into useTestConnectorPanel (criterion 2) > forwards
    an empty configurationText exactly as an empty string, not as undefined or a placeholder (edge case:
    empty input)'
  proves: Unchanged from before this task -- same mechanical stub adaptation, no assertion changed.
  fails_when: The rendered Requester input's value stops echoing `received:<connector>:` for an empty
    configurationText.
- file: src/routes/connector-test-panel-forwards-configuration-text.spec.ts
  name: ConnectorTestPanel — forwards configurationText into useTestConnectorPanel (criterion 2) > forwards
    a re-rendered configurationText prop into the hook's own second argument again, not only at first
    mount (its own live value)
  proves: Unchanged from before this task -- same mechanical stub adaptation, no assertion changed.
  fails_when: The rendered Requester input's value stops echoing the new configurationText after a rerender
    with a changed prop.
- file: src/routes/connector-configuration-form-dialog-forwards-configuration-text.spec.ts
  name: ConnectorConfigurationFormDialog — its own edit-mode ConnectorTestPanel call site supplies configurationText
    (criterion 4, disclosed inference) > mounts its own Test section, forwarding this dialog's own currently-typed
    Configuration text into it -- the same field this dialog already reads at configuration={state.configuration}
  proves: Unchanged from before this task -- ConnectorConfigurationFormDialog's own edit-mode ConnectorTestPanel
    call site still forwards this dialog's currently-typed Configuration text. Same mechanical stub-field
    replacement as the file above, no assertion changed.
  fails_when: The rendered schema preview stops echoing `received:<connector>:<prettyPrinted configuration>`.
not_applicable:
- edge_case: Absent/empty input, a range boundary, an empty collection, a duplicate value.
  why: This task changes only the shape of one internal result field (testOutcome) on an existing hook;
    it introduces no new user-supplied input, no numeric range, no collection and no uniqueness constraint
    for any of these edge classes to apply to.
- edge_case: An operation attempted against a state that forbids it (Test clicked with incomplete fields).
  why: Unchanged by this task and already proven in connector-test-panel-dispatch-safety.spec.ts ("Test
    stays disabled until every required field is filled"); rewriting it here would describe the same already-proven
    behavior rather than this task's own criterion.
- edge_case: Two operations against one subject at once, read concurrently (two clicks before either settles).
  why: Unchanged by this task and already proven in connector-test-panel-dispatch-safety.spec.ts ("one
    dispatch per test run"); this task's own proof of the sequential reading of this edge case is connector-test-panel-fresh-failure-clears-stale-result.spec.ts
    above.
- edge_case: A dependency that answers slowly (the pending state).
  why: Already rendered and unaffected by the type change; connector-test-panel-idle-dispatch-state.spec.ts's
    own sibling assertion (pending text absent before dispatch) is the piece this task's own inference
    touches -- the pending state's own positive rendering was not disturbed by this task and needed no
    new test.
---

## What it is
Tests proving useTestConnectorPanel's testOutcome discriminated union makes a stale succeeded result and a fresh failed message structurally uncoexistable -- two type-level constructions plus two rendered-panel behaviors -- and mechanical adaptation of two pre-existing spec files' stubs to the new testOutcome shape so the suite continues to compile.

## Notes
The first suite attempt (run/connector-test-panel-dispatch-state-discriminate-test-dispatch-outcome-suite) failed one test: src/hooks/use-connector-configuration-detail-validity.spec.ts's 'a bare string' case, in code this delivery never touched (src/hooks/use-connector-configuration-detail.ts, last changed by an unrelated, already-delivered initiative). A failure-diagnostician read that run and returned cause: code, with the evidence that this hook seeds `configurationValid` via `useState(true)` and corrects it only inside a `useEffect`, so `phase: "ready"` can be observed for one render before that correction runs -- a pre-existing race independent of testOutcome. Fixing that file is outside this corrective task's own objective and would widen it, so no source change was made for it; a second suite attempt with no code change (run/connector-test-panel-dispatch-state-discriminate-test-dispatch-outcome-suite-2, pinned above) passed every test, confirming the failure was this pre-existing race rather than anything this delivery introduced.
