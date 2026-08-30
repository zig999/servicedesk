---
title: Discriminate test dispatch outcome, review
summary: What four passes found over the TYP-04 corrective task that replaced isTesting/result/testError
  with one discriminated testOutcome field.
reviewed:
- src/hooks/use-test-connector-panel.ts
- src/routes/connector-test-panel.tsx
- src/routes/connector-test-panel-result.tsx
- src/routes/connector-test-panel-fields.tsx
- src/hooks/use-test-connector-panel.spec.ts
- src/routes/connector-test-panel-fresh-failure-clears-stale-result.spec.ts
- src/routes/connector-test-panel-idle-dispatch-state.spec.ts
- src/routes/connector-test-panel-forwards-configuration-text.spec.ts
- src/routes/connector-configuration-form-dialog-forwards-configuration-text.spec.ts
tasks:
- task/connector-test-panel-dispatch-state/discriminate-test-dispatch-outcome
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run passed cleanly (all 8 steps), so there was no failure
    to diagnose
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
coverage:
- criterion: TestConnectorPanelState's type can no longer represent, simultaneously,
    a result from a previous successful call and an error from a more recent failed
    call -- the type's own structure (a discriminated union) makes that combination
    unrepresentable, not merely avoided at runtime.
  state: covered
  tests:
  - file: src/hooks/use-test-connector-panel.spec.ts
    name: refuses a "succeeded" outcome that also carries a fresh failed message
  - file: src/hooks/use-test-connector-panel.spec.ts
    name: refuses a "failed" outcome that also carries a stale succeeded result
findings:
- pass: standard
  file: src/hooks/use-test-connector-panel.ts
  where: the testOutcome declaration and its onSuccess handler
  cites: STA-01
  evidence: 'const [testOutcome, setTestOutcome] = useState<TestDispatchOutcome>({
    kind: "idle" });'
  cost: The result useMutation already holds (react-query's own cache) is copied a
    second time into a component-local useState. Nothing reads mutation.data/isPending/error
    again today, so the copy does not visibly disagree with anything yet, but the
    moment a second consumer reads the mutation object directly instead of testOutcome,
    the two can show a different call's result at once.
  correction: Derive testOutcome from the mutation's own status/data/error at render
    time instead of setting a second, independent state variable in onSuccess/onError.
- pass: standard
  file: src/routes/connector-configuration-form-dialog-forwards-configuration-text.spec.ts
  where: the module-level vi.mock of ../hooks/use-test-connector-panel
  cites: TST-03
  evidence: "vi.mock(\"../hooks/use-test-connector-panel\", () => ({\n  useTestConnectorPanel:\
    \ (connector: string, configurationText: string) => ({"
  cost: useTestConnectorPanel is this component's own business logic, not the network,
    storage or the clock; the test proves the stand-in forwards its two arguments,
    not that the real hook does.
  correction: Observe the forwarded value through the real hook rather than a stand-in
    for it.
- pass: standard
  file: src/routes/connector-test-panel-fields.tsx
  where: the isLoadingCapabilities/isCapabilitiesError branches, no branch for an
    empty successful capabilityOptions
  cites: API-04
  evidence: "{state.isLoadingCapabilities && <p>Loading registered capabilities…</p>}\n\
    {state.isCapabilitiesError && (\n  <p role=\"alert\" ...>Could not load the capabilities\
    \ registered with this connector.</p>\n)}"
  cost: Once loading finishes without error and no capability is registered for this
    connector, the picker renders with nothing selectable and no explanation, indistinguishable
    from a still-loading or silently-empty fetch.
  correction: Render an explicit message (e.g. "No capabilities are registered with
    this connector") when capabilityOptions is empty and neither isLoadingCapabilities
    nor isCapabilitiesError holds.
- pass: standard
  file: src/routes/connector-test-panel-fields.tsx
  where: the isCapabilitiesError branch
  cites: EDG-02
  evidence: "{state.isCapabilitiesError && (\n  <p role=\"alert\" ...>Could not load\
    \ the capabilities registered with this connector.</p>\n)}"
  cost: The fetch failure is shown but TestConnectorPanelState exposes no retry, so
    the only way out is leaving and reopening the panel.
  correction: Expose a retry (e.g. useCapabilities' own refetch) through TestConnectorPanelState
    and render it alongside this message.
- pass: standard
  file: src/routes/connector-test-panel-fields.tsx
  where: formatSchemaForDisplay
  cites: ARC-03
  evidence: "function formatSchemaForDisplay(schema: string): string {\n  try {\n\
    \    return JSON.stringify(JSON.parse(schema), null, 2);\n  } catch {\n    return\
    \ schema;\n  }\n}"
  cost: A transformation of fetched data lives in the route component's file rather
    than a hook or service module; a second screen needing the same pretty-print reimplements
    it.
  correction: Move formatSchemaForDisplay into a hook or service module (e.g. beside
    use-capabilities.ts).
- pass: standard
  file: src/routes/connector-test-panel-forwards-configuration-text.spec.ts
  where: the module-level vi.mock of ../hooks/use-test-connector-panel
  cites: TST-03
  evidence: "vi.mock(\"../hooks/use-test-connector-panel\", () => ({\n  useTestConnectorPanel:\
    \ (connector: string, configurationText: string) => ({"
  cost: Same substitution as the sibling file -- proves the stand-in forwards its
    arguments, not that the real hook does.
  correction: Reach the forwarded value through the real hook rather than a stand-in
    for it.
- pass: standard
  file: src/routes/connector-test-panel-result.tsx
  where: the pending message and the succeeded branch's root element
  cites: ACC-07
  evidence: "if (testOutcome.kind === \"pending\") {\n  return <p>Sending test call…</p>;\n\
    }"
  cost: The pending message and the whole succeeded panel appear with no aria-live
    and no focus management (only the failed branch's role="alert" is announced),
    so a screen-reader user not looking at the screen cannot notice a test started
    or its result arrived.
  correction: Wrap the pending and succeeded output in an aria-live region, or move
    focus to the result panel once it renders.
---

## What it is
Four passes over the TYP-04 corrective task: coverage pairs the sole criterion with the tests that would fail if it stopped holding; conformance reads the file set against the specification (this task implements no node); standard reads the file set against the project's own frontend-typescript.yaml; failures did not run because the captured run (install, typecheck, lint, style, build, a11y, secret-scan, test) passed cleanly, including the test step that had failed on an unrelated pre-existing race in the implementer's own first suite attempt.

## Notes
Of the 7 standard findings, only two touch code this task actually wrote or restructured: STA-01 (testOutcome duplicates the mutation's own cache into local state -- a tension the implementer's own disclosed inference already reasoned about: deriving testOutcome from the mutation object directly would reintroduce the very impossible-state bug this task fixes, since react-query does not clear stale data on a new mutate() call) and ACC-07 (the pending/succeeded rendering this task touches carries no aria-live region). The other five (two TST-03 stub-substitution findings, API-04, EDG-02, ARC-03) are pre-existing gaps in files this task's own diff barely touches (mechanical stub-field renames only) or does not touch at all in substance -- they are reported because the standard pass reads the whole file set, not only this task's own diff.
None of these findings are acted on here -- review-change produces evidence, and whether any becomes its own corrective task is the human's call.
