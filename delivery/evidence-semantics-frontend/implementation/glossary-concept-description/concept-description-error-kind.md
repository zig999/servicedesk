---
title: Named UiErrorState kind for ConceptDescriptionRequiredError
summary: The central error-ui-state table gains a distinct concept-description-required kind for the backend's ConceptDescriptionRequiredError, carrying no wording, with every existing mapping left untouched.
task: sha256:617cb0701c82f2a395387408777ac0ad9ace80da9b0f17a02b1dc449c92b6cac
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/glossary-concept-description-concept-description-error-kind-build
files:
- path: src/services/error-ui-state.ts
  effect: 'Adds "concept-description-required" to the UiErrorStateKind union and a ConceptDescriptionRequiredError -> { kind: "concept-description-required" } entry to UI_STATE_BY_ERROR_CODE, placed in the existing 422-appropriate block alongside the other 422-mapped classes and commented in the same per-entry style already used there. Updates the module''s own header comment and the table''s own doc comment to count twenty keys instead of nineteen. No existing key, value or comment for any other error code was touched.'
criteria:
- criterion: An ApiError whose code is ConceptDescriptionRequiredError maps to a named UiErrorState kind distinct from the generic failure kind.
  met: true
  how: 'UI_STATE_BY_ERROR_CODE now carries ConceptDescriptionRequiredError: { kind: "concept-description-required" } — a kind value distinct from "generic-error" and added to the UiErrorStateKind union — so uiStateForApiError(error) resolves an ApiError carrying this code to that named state rather than falling through to GENERIC_ERROR_STATE.'
- criterion: The new table entry carries no user-facing wording.
  met: true
  how: 'The entry is exactly { kind: "concept-description-required" } — a bare discriminant, the same shape every other table entry has. No string intended for display appears in the value; the only prose added is the surrounding source comment, which documents provenance rather than being read by the UI.'
- criterion: Every ApiError code the table already names keeps mapping to its existing kind.
  met: true
  how: Every pre-existing line of UI_STATE_BY_ERROR_CODE and of the UiErrorStateKind union is unmodified; the new union member and the new table entry were each inserted as an addition without altering any surrounding line's key or value.
nodes:
- node: rules/glossary/a-concept-declares-its-description
  encoded_at:
  - src/services/error-ui-state.ts
  how: 'The rule states the registry refuses a description-less registration/update with an HTTP 422 reporting ConceptDescriptionRequiredError. This task''s seam is the frontend console''s own consumption of that refusal: the table gives that ApiError code its own named UiErrorState kind ("concept-description-required") rather than letting it collapse into the generic fallback. The refusal''s own occurrence (the 422 and the backend code) is enforced server-side and is not re-encoded here; this file only lets the UI tell the class apart from any other failure.'
- node: scenarios/glossary/a-concept-with-no-description-is-refused
  encoded_at:
  - src/services/error-ui-state.ts
  how: 'The scenario''s third then-clause — the operator console tells the operator specifically that the description is missing, never only a generic failure notice, the exact wording staying the console''s own — is exactly what this table''s convention already divides in two: this task supplies the first half, a distinct kind a consuming screen can switch on. The second half, the exact wording, is deliberately left unstated here and deferred to whichever screen task consumes this kind.'
inferences:
- inferred: The new kind's string is "concept-description-required" — the ApiError code's own name in kebab-case, with "Error" dropped — rather than any other spelling.
  from: Every existing kind in the union follows exactly this transform from its own ApiError-code key (e.g. ConnectorConfigurationNotWellFormedError -> "connector-configuration-not-well-formed"), so the new entry follows the same, already-established pattern.
- inferred: The entry sits in the table's 422-appropriate comment-delimited group, immediately after ConnectorConfigurationNotWellFormedError, rather than in a new group or at the end of the object.
  from: status-map.ts maps ConceptDescriptionRequiredError to HTTP 422, and this table's own existing grouping comments organize entries by that same transport-status appropriateness, which is exactly the class of refusal the rule describes.
- inferred: The header comment's running count and per-addition narration are updated (nineteen to twenty keys) rather than left as they were.
  from: The module's own header comment is a maintained, self-describing document of the table's provenance, and each prior extension updated the same running count.
preserved:
- Every other ApiError code's existing mapping in UI_STATE_BY_ERROR_CODE (all nineteen prior entries) — unchanged in key, value and inline comment.
- The exported UiErrorState and UiErrorStateKind shapes and the uiStateForApiError function's own behavior for every code besides ConceptDescriptionRequiredError.
deferred:
- what: The operator-facing wording for this refusal and any screen-level handling of the new "concept-description-required" kind (e.g. in use-concept-form's onError).
  why: The task's own rationale and objective bound this cut to the shared table alone — the convention holds that the table gains kinds and never wording; the scope stated the surfacing, not this cut.
---

## What it is
One entry in the one central ApiError-code-to-UI-state table, the seam the inventory says never to duplicate.

## Notes
The inventory notes UiErrorState was deliberately shaped as an object so a state could later grow data such as which field a 422 named; this entry is the case that comment anticipated.
