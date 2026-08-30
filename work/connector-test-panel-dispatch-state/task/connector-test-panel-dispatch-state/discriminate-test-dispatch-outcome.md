---
title: Model the test dispatch outcome as a discriminated union
summary: TestConnectorPanelState's isTesting/result/testError fields are replaced
  by one discriminated testOutcome field, so a stale result and a live error can never
  coexist in the type a caller reads.
rationale: This corrective task fixes a TYP-04 finding from the project's own standard
  (a value with a fixed, known set of shapes must be modeled as a discriminated union),
  not a domain fact the specification states. The execution-contract-binder read contracts/integration/connector-diagnostics.md
  fresh and found it governs the test-connector API operation's business semantics,
  not the internal shape of a React hook's own local UI state -- no candidate the
  specification holds governs this task's objective or criteria, so it implements
  none.
sources:
- intake/scope.md
objective: useTestConnectorPanel's returned state represents the test dispatch's outcome
  as one discriminated union rather than three independent fields, making the previously-representable
  impossible state (a stale successful result alongside a fresh error) unrepresentable
  in the type itself.
criteria:
- TestConnectorPanelState's type can no longer represent, simultaneously, a result
  from a previous successful call and an error from a more recent failed call -- the
  type's own structure (a discriminated union) makes that combination unrepresentable,
  not merely avoided at runtime.
---

## What it is
Corrective increment fixing the TYP-04 finding from review/deduplicate-configuration-object-check.md over the connector-test-panel-placeholder-attributes initiative (now closed).
useTestConnectorPanel's dispatch-outcome fields (isTesting, result, testError) collapsed into one discriminated testOutcome field, with ConnectorTestPanel and its consumers updated to read it.

## Notes
Advisory note from the binder: contracts/integration/connector-diagnostics.md describes the test-connector API operation's business semantics (diagnostic-only, subject assembly, non-evidentiary result), not how useTestConnectorPanel represents the dispatch outcome in its own local React state; it is a neighbor to this task, not a governor. The wire-level discriminated union (TestConnectorOutcome, already present in use-test-connector-panel.ts) is untouched by this task.
