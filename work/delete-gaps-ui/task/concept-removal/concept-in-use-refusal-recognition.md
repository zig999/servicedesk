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
- rules/integration/a-submitted-removal-states-its-outcome-to-the-operator
- rules/glossary/a-registered-concept-is-never-removed
---


## What it is
An entry in `UI_STATE_BY_ERROR_CODE` in frontend/app/src/services/error-ui-state.ts that recognises ConceptInUseError, with its own `UiErrorStateKind`.

## Notes
UNDERDETERMINED, from the specification — rules/glossary/a-registered-concept-is-never-removed now gives ConceptInUseError four distinct references (capability-concept, evidence-concept, citation-concept, hypothesis-revision-collects), and rules/integration/a-submitted-removal-states-its-outcome-to-the-operator requires the condition the api named to be stated apart from every other condition. The criteria only ask for a state kind unique to the code ConceptInUseError; none asks that the reference the error reports survive into the answered state. A reading that would still pass every criterion: uiStateForApiError returns a bare state such as { kind: 'concept-in-use' } for any ApiError whose code is ConceptInUseError and drops the reference the error reports, collapsing all four conditions into one indistinguishable state; this meets all three criteria but no surface reading that state can tell the operator which condition the api named.
REMAINDER, from the specification — rules/glossary/a-registered-concept-is-never-removed has clauses no criterion here reaches: registering adds or replaces and never removes; the four refusal conditions with the HTTP 409 status; that a concept is never removed any other way; and that a removal takes the concept's own accepts declaration and leaves every subject-type term in place. Each is the backend glossary's behaviour, not the frontend error-code map's. It belongs to: The glossary backend's remove-concept and register-concepts implementation, not this frontend map task.
REMAINDER, from the specification — rules/integration/a-submitted-removal-states-its-outcome-to-the-operator has clauses no criterion here reaches: stating a successful removal, stating that nothing was removed on a refusal, stating the refusals of capability and connector-configuration removals, and stating neither outcome before the api has answered. It belongs to: The removal-surface tasks for the concept, capability and connector-configuration surfaces that render a submitted removal's outcome.
ADVISORY, from the specification — rules/glossary/a-registered-concept-is-never-removed says the refusal is "an HTTP 409 response reporting a ConceptInUseError" but never says ConceptInUseError is the literal value of the response's error-code field, the way constraints/a-domain-error-unmapped-by-status-is-refused-generically and constraints/a-malformed-request-is-refused-with-a-validation-error name INTERNAL_ERROR and VALIDATION_ERROR. The criteria read the error's name as the code; confirm this against the delivered backend's answer before keying the map on it.
ADVISORY, from the specification — The third criterion (every previously-named error code keeps answering the same state kind) is a regression guard with no direct candidate backing it; its indirect backing is that rules/integration/a-submitted-removal-states-its-outcome-to-the-operator requires each condition to be stated apart from every other one, which keeping the existing mappings preserves.
ADVISORY, from the specification — constraints/a-domain-error-unmapped-by-status-is-refused-generically and constraints/a-malformed-request-is-refused-with-a-validation-error cover the backend's status map and wire shape, not the frontend's uiStateForApiError; its generic-error fallback is the "refusal whose condition the surface does not recognise" of rules/integration/a-submitted-removal-states-its-outcome-to-the-operator. constraints/a-successful-concept-removal-answers-with-no-content, rules/integration/a-removal-surface-offers-a-control-behind-a-further-explicit-act, rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing and domain/glossary/concept govern other parts of the removal flow, not this map.
