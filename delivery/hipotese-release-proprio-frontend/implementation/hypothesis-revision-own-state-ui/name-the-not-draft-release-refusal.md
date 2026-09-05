---
title: Name the not-draft release refusal in the error vocabulary
summary: Adds HypothesisRevisionNotDraftAtReleaseError as its own entry in the API-error-to-UI-state lookup table and kind union, distinct from the generic fallback.
task: sha256:234b511c00b4d881b9c6154f97ed09e9a4dded81210d3c5473e86657cde425b7
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/hypothesis-revision-own-state-ui-name-the-not-draft-release-refusal-build
files:
- path: src/services/error-ui-state.ts
  effect: 'Adds "hypothesis-revision-not-draft-at-release" as a new member of the UiErrorStateKind union, and maps the error code HypothesisRevisionNotDraftAtReleaseError to { kind: "hypothesis-revision-not-draft-at-release" } in UI_STATE_BY_ERROR_CODE, placed beside the sibling CaseVersionNotDraftAtReleaseError entry it mirrors. No other entry, and no other code path, was touched.'
criteria:
- criterion: Given an API error whose code is HypothesisRevisionNotDraftAtReleaseError, the error-to-UI-state resolution answers a kind exclusive to this error code — resolved by no other code the table lists — and distinguishable from the kind any unrecognized code falls back to.
  met: true
  how: uiStateForApiError looks up error.code in UI_STATE_BY_ERROR_CODE; HypothesisRevisionNotDraftAtReleaseError is the only key mapped to { kind "hypothesis-revision-not-draft-at-release" }, and that kind is distinct from "generic-error", the kind GENERIC_ERROR_STATE (the fallback for an unrecognized code) carries.
- criterion: That kind is declared as a member of the module's UI error-state kind union.
  met: true
  how: '"hypothesis-revision-not-draft-at-release" was added as a new alternative in the UiErrorStateKind union type.'
- criterion: Every other error code the table already lists resolves to the same kind it resolved to before.
  met: true
  how: No existing key's value was changed, reordered, or removed; the new entry was inserted as an additional line beside CaseVersionNotDraftAtReleaseError, and every previously-listed code (CaseNotFoundError, ConceptNotAnsweredError, ... CaseNotValidError, the GENERIC_ERROR_STATE aliases) still maps to exactly the object it mapped to before.
- criterion: An error code the table does not list still resolves to the generic kind.
  met: true
  how: uiStateForApiError's fallback (state ?? GENERIC_ERROR_STATE) is unchanged, so any code absent from the table — including any code besides the one just added — still resolves to { kind "generic-error" }.
nodes:
- node: scenarios/knowledge/releasing-an-already-released-revision-tells-the-curator-so
  encoded_at:
  - src/services/error-ui-state.ts
  how: The scenario requires the frontend to tell the curator specifically that the revision is already released, distinguishable from the notice shown for an unrecognized failure reason. This task supplies the distinguishing UI-state kind the mapping now resolves HypothesisRevisionNotDraftAtReleaseError to, exclusive of the generic fallback; the control that consumes this kind to render the specific telling is out of this task's scope per its own "What it is" section ("Nothing consumes the new kind yet; the release control does.").
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  encoded_at:
  - src/services/error-ui-state.ts
  how: The rule states that a release asked of a revision not in draft state is refused reporting HypothesisRevisionNotDraftAtReleaseError. This task names that exact error code as a table key so the code the backend actually reports is what resolves to the new UI-state kind.
inferences:
- inferred: The new kind's string value is "hypothesis-revision-not-draft-at-release", following the naming convention already used for the sibling error CaseVersionNotDraftAtReleaseError -> "case-version-not-draft-at-release" (kebab-case, dropping the trailing "Error" suffix and the leading entity name lowercased with hyphens).
  from: 'The existing UI_STATE_BY_ERROR_CODE table and UiErrorStateKind union in src/services/error-ui-state.ts, and the inventory''s named convention: "A backend error code maps to a UI error-state kind through one flat lookup table (UI_STATE_BY_ERROR_CODE) keyed by the exact error code string."'
- inferred: The new table entry is placed immediately beside CaseVersionNotDraftAtReleaseError rather than at the end of the table.
  from: The existing table's grouping by related concern (case-version-lifecycle errors clustered together) rather than by insertion order; placing the sibling not-draft-at-release condition next to its case-version counterpart follows that same visible grouping.
---
## What it is

One entry in the flat error-code lookup table and one member of the kind union.
Nothing consumes the new kind yet; the release control does.

## Notes

None.
