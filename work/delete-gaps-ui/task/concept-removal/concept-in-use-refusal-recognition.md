---
title: Recognise ConceptInUseError as its own refusal
summary: The shared error-code map answering a state of its own for the refusal remove-concept
  raises when the concept is still named.
rationale: Cut apart from the concept disclosure because the error-code map in error-ui-state.ts
  is shared by every surface, so changing it is its own seam, and the disclosure consumes
  it.
sources:
- work/delete-gaps-ui/intake/scope.md
objective: uiStateForApiError answers a state kind of its own for an ApiError whose
  code is ConceptInUseError.
criteria:
- An ApiError whose code is ConceptInUseError is answered with a state kind other
  than generic-error.
- The state kind answered for ConceptInUseError is answered for no other error code
  the map names.
- Every error code the map named before this change answers the same state kind it
  answered before.
implements:
- rules/glossary/a-registered-concept-is-never-removed
- rules/integration/a-submitted-removal-states-its-outcome-to-the-operator
---



## What it is
An entry in `UI_STATE_BY_ERROR_CODE` in frontend/app/src/services/error-ui-state.ts that recognises ConceptInUseError, with its own `UiErrorStateKind`.

## Notes
UNDERDETERMINED, from the specification — No criterion keeps the map's fallback in place. Today uiStateForApiError answers generic-error for any code the map does not name. Criterion 3 only protects codes the map already named, so the fallback itself can change freely, and criterion 2 only compares against codes the map names, so a code caught by the fallback is never compared. rules/integration/a-submitted-removal-states-its-outcome-to-the-operator requires the named condition to be stated apart from every other condition the route can name and apart from a refusal whose condition the surface does not recognise. A reading that would still pass every criterion: An implementation that does not name ConceptInUseError in the map and instead changes the fallback itself from generic-error to the new state kind; every criterion passes, but every unrecognised code, including INTERNAL_ERROR and VALIDATION_ERROR, is then reported as a concept-in-use refusal. An implementation keying the new kind on HTTP 409 instead of on the code also passes and misreports any other 409 refusal not yet named.
REMAINDER, from the specification — The registering clause, the removal's own four conditions with the HTTP 409 status, and the accepted-subject-types clause of rules/glossary/a-registered-concept-is-never-removed reach no criterion here; each is what the backend's register-concepts and remove-concept do, not something the frontend's error-code map decides. It belongs to: The backend act delivering glossary-authoring's register-concepts and remove-concept, not this frontend initiative.
REMAINDER, from the specification — The clause of rules/glossary/a-registered-concept-is-never-removed saying the refusal reports a reference and that its details carry the concept's own name and that reference reaches no criterion here; this task only gives the refusal a state kind of its own and reads nothing from the details. It belongs to: The task that shows the outcome of remove-concept on the concept removal surface, which reads the refusal's details and states the condition found to the operator.
REMAINDER, from the specification — Most clauses of rules/integration/a-submitted-removal-states-its-outcome-to-the-operator reach no criterion here: stating success, stating that nothing was removed, stating neither outcome before the api answers, stating which refusal answered, keeping VALIDATION_ERROR and INTERNAL_ERROR apart from an unrecognised refusal, and the same obligations for capability and connector-configuration removals. It belongs to: The removal-outcome surface tasks of this initiative, one for each of remove-concept, remove-capability and remove-connector.
REMAINDER, from the specification — rules/integration/a-removal-surface-offers-a-control-behind-a-further-explicit-act is a candidate, but none of its clauses (the removal control, the question it asks, the further explicit act, the entity standing unchanged without it) reaches a criterion here. It belongs to: The removal-control and confirmation tasks of this initiative.
REMAINDER, from the specification — rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing is a candidate, but its only clause (landing on the listing, never on the removed identity's surface) reaches no criterion here. It belongs to: The post-removal navigation tasks of this initiative.
ADVISORY, from the specification — domain/glossary/concept, constraints/a-successful-concept-removal-answers-with-no-content, constraints/a-malformed-request-is-refused-with-a-validation-error and constraints/a-domain-error-unmapped-by-status-is-refused-generically are neighbors, not implemented here: the concept element has no attribute this map reads, the 204 success answer is not an ApiError, and the VALIDATION_ERROR and INTERNAL_ERROR refusals are backend shapes whose mapping criterion 3 already keeps unchanged. The reworded statement ("whose error code is ConceptInUseError") now matches the map's lookup by error.code exactly, closing the earlier wording gap.
