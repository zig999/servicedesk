---
title: Deduplicate configuration object check, review
summary: 'What four passes found over the corrective task fixing two prior review
  findings: the duplicated well-formed-JSON-object check and the vacuous criterion-7
  coverage in the capability picker.'
reviewed:
- src/shared/services/plain-record.ts
- src/services/simulation-subject-derivation.ts
- src/hooks/use-test-connector-panel.ts
- src/routes/connector-test-panel-capability-picker.spec.ts
tasks:
- task/connector-test-panel-placeholder-attributes/deduplicate-configuration-object-check
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
- criterion: A single, exported well-formed-JSON-object-check primitive exists under
    frontend/app/src/shared/services/, and both use-test-connector-panel.ts's parsesAsConfigurationObject
    and simulation-subject-derivation.ts's own equivalent private check are replaced
    by calls to it, rather than each declaring its own private typeof/null/Array.isArray
    expression.
  state: uncovered
  why: This criterion states a fact about code shape (one shared primitive, two call
    sites invoking it instead of each re-declaring its own private expression), not
    a fact about behavior, and the pre-refactor private expression and the post-refactor
    shared call answer every JSON input identically. Nothing in the test set (simulation-subject-derivation.spec.ts's
    malformed-JSON case, connector-test-panel-attribute-reconciliation.spec.ts's criterion-6
    describe block) would fail if either file reverted to its own private expression
    instead of calling the shared primitive -- the deduplication itself is what the
    criterion asks for, and that fact is unexercised by anything that tests only behavior.
    A test asserting the import or call graph directly would bind to the code's internal
    shape rather than prove the criterion, so its absence is not itself a gap to fill.
- criterion: connector-test-panel-capability-picker.spec.ts contains at least one
    test that clicks "Add attribute" against a Configuration text embedding a subject-attribute
    placeholder and asserts the resulting row reflects that placeholder, so the file
    would fail if the reconciliation behavior regressed to the old append-one-empty-row
    behavior.
  state: covered
  tests:
  - file: src/routes/connector-test-panel-capability-picker.spec.ts
    name: adds a row already named for Configuration's own placeholder, not an empty
      row
findings:
- pass: standard
  file: src/hooks/use-test-connector-panel.ts
  where: TestConnectorPanelState's isTesting/result/testError fields, and their assembly
    in useTestConnectorPanel's return
  cites: TYP-04
  evidence: 'readonly isTesting: boolean;

    readonly result: TestConnectorResult | null;

    readonly testError: string | null;

    ... isTesting: mutation.isPending, result: mutation.data ?? null, testError,'
  cost: onTest clears testError before each dispatch but never clears mutation.data,
    and react-query does not clear a mutation's prior data on a subsequent mutate()
    call either. A second dispatch that fails leaves result still holding the previous
    successful call's payload while testError now holds the new failure -- a combination
    the type permits and the compiler cannot refuse. A consumer of this hook has no
    way to tell, from the type alone, whether it is looking at a fresh success, a
    stale success beside a fresh failure, or neither.
  correction: 'Model the outcome as one discriminated field -- e.g. testOutcome: {kind:
    "idle"} | {kind: "testing"} | {kind: "succeeded"; result: TestConnectorResult}
    | {kind: "failed"; message: string} -- so a stale result and a live error cannot
    coexist in the type a caller reads.'
---

## What it is
Four passes over the corrective task deduplicate-configuration-object-check: coverage pairs each of the 2 stated criteria with the tests that would fail if it stopped holding; conformance reads the file set against the specification nodes the task implements; standard reads the file set against the project's own frontend-typescript.yaml; failures did not run because the captured run (install, typecheck, lint, style, build, a11y, secret-scan, test) passed cleanly end to end -- including the test step that, in the prior review of the sibling reconcile-test-panel-attribute-rows task, had failed on an unrelated flaky test; it did not recur here.

## Notes
The standard finding (TYP-04, TestConnectorPanelState's isTesting/result/testError not forming a discriminated union) is real but sits in code this corrective task did not write or touch -- it is the shape useTestConnectorPanel's own dispatch state has carried since the original test-connector-debug-panel task. It is reported here because the standard pass reads the whole file this task modified, not only the lines it changed; whether to open a further corrective task for it is the human's call, not decided here.
This review closes the loop opened by review/reconcile-test-panel-attribute-rows.md: of its three findings, two (the duplicated well-formed-JSON-object check, and the vacuous capability-picker coverage of criterion 7) are fixed and proven here; the third (1 test failing in an unrelated file during that review's captured run) was investigated separately and confirmed as pre-existing suite flakiness unrelated to this initiative -- it does not recur in this review's own run, consistent with that diagnosis.
