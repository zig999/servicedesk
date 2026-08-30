---
title: Connector test panel dispatch state
summary: The test dispatch outcome in useTestConnectorPanel modeled as a discriminated
  union instead of three independent fields, fixing a TYP-04 finding.
sources:
- intake/scope.md
covers:
- contracts/integration/connector-diagnostics
uncovered:
- node: contracts/integration/connector-diagnostics
  why: This is the only node a vocabulary search over the specification root surfaced
    as plausibly relevant, and the execution-contract-binder read it fresh and found
    it governs the test-connector API operation's business semantics (diagnostic-only,
    subject assembly, non-evidentiary result), not the internal shape of a React hook's
    own local UI state. This epic's only task is a TYP-04 standard-conformance fix
    with no domain fact of its own, so it implements no specification node.
---

## What it is
Fixes one standard-conformance finding (TYP-04) left over from the closed connector-test-panel-placeholder-attributes initiative's own review: useTestConnectorPanel's dispatch-outcome fields (isTesting, result, testError), which could represent an impossible combination, collapsed into one discriminated testOutcome field.

## Notes
None.
