---
title: Recognise CapabilityCitedByEvidenceError as its own refusal
summary: The shared error-code map answering a state of its own for the refusal remove-capability
  raises when collected evidence names the capability.
rationale: Cut apart from the capability disclosure because the error-code map in
  error-ui-state.ts is shared by every surface, so changing it is its own seam, and
  the disclosure consumes it.
sources:
- work/delete-gaps-ui/intake/scope.md
objective: uiStateForApiError answers a state kind of its own for an ApiError whose
  code is CapabilityCitedByEvidenceError.
criteria:
- An ApiError whose code is CapabilityCitedByEvidenceError is answered with a state
  kind other than generic-error.
- The state kind answered for CapabilityCitedByEvidenceError is answered for no other
  error code the map names.
- Every error code the map named before this change answers the same state kind it
  answered before.
implements:
- rules/integration/a-submitted-removal-states-its-outcome-to-the-operator
- rules/integration/a-registered-capability-cited-by-evidence-is-never-removed
---



## What it is
An entry in `UI_STATE_BY_ERROR_CODE` in frontend/app/src/services/error-ui-state.ts that recognises CapabilityCitedByEvidenceError, with its own `UiErrorStateKind`.

## Notes
REMAINDER, from the specification — The clauses of rules/integration/a-submitted-removal-states-its-outcome-to-the-operator's statement that this task's criteria do not reach belong elsewhere: the success branch, the rest of the refusal branch (that nothing was removed and which refusal answered it), the clause that neither outcome is stated before the api has answered, and the concept and connector-configuration removals the rule also covers. It belongs to: The task or tasks that make each removal surface render the outcome of an issued removal (success, the refusal with its named condition, and no outcome while pending).
REMAINDER, from the specification — The server-side clauses of rules/integration/a-registered-capability-cited-by-evidence-is-never-removed reach no criterion here: the removal succeeds unless collected evidence names the capability; a refused removal answers HTTP 409 and the capability stays registered; a removal of an unregistered name and version is never refused, is answered like a removal that removed something, and names no error value of its own. It belongs to: The remove-capability route's own implementation on the publishing api, together with constraints/a-successful-capability-removal-answers-with-no-content for its 204 answer.
ADVISORY, from the specification — The criterion asking that the state kind answered for CapabilityCitedByEvidenceError be answered for no other error code the map names asks for more distinctness than the rule requires (only apart from every other condition the remove-capability route can name). No node forbids this; it is a design choice within what the rule allows.
ADVISORY, from the specification — The criterion treating generic-error as the fallback for an unrecognised code names generic-error nowhere in any candidate; that naming comes from the code, not from the specification.
ADVISORY, from the specification — domain/integration/capability, rules/integration/a-removal-surface-offers-a-control-behind-a-further-explicit-act, rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing, constraints/a-successful-capability-removal-answers-with-no-content, constraints/the-capability-identity-read-refuses-an-unregistered-identity, constraints/a-domain-error-unmapped-by-status-is-refused-generically and constraints/a-malformed-request-is-refused-with-a-validation-error govern nothing in this task; they sit next to the error-code map without being part of it.
