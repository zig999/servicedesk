---
title: Name the not-draft release refusal in the error vocabulary
summary: The mapping from HypothesisRevisionNotDraftAtReleaseError to a UI error state of its own.
rationale: I cut this apart from the release control because the error-code-to-UI-state table is an interface every mutation's error handling consumes, and a task that widens that table and consumes it in the same breath joins two seams; the inventory records that an unmapped code falls silently to the generic state, which is the failure this task exists to make impossible.
sources:
  - intake/scope.md
objective: An API refusal reporting HypothesisRevisionNotDraftAtReleaseError resolves to a UI error state of its own rather than to the generic one.
criteria:
  - Given an API error whose code is HypothesisRevisionNotDraftAtReleaseError, the error-to-UI-state resolution answers a kind exclusive to this error code — resolved by no other code the table lists — and distinguishable from the kind any unrecognized code falls back to.
  - That kind is declared as a member of the module's UI error-state kind union.
  - Every other error code the table already lists resolves to the same kind it resolved to before.
  - An error code the table does not list still resolves to the generic kind.
implements:
  - scenarios/knowledge/releasing-an-already-released-revision-tells-the-curator-so
  - rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
---
## What it is

One entry in the flat error-code lookup table and one member of the kind union.
Nothing consumes the new kind yet; the release control does.

## Notes

None.
