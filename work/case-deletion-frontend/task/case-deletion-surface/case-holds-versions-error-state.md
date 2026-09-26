---
title: CaseHoldsVersionsError gets its own UI error state
summary: The sitewide error-code map and its closed kind union gain an entry for CaseHoldsVersionsError.
rationale: The scope does not state this cut. The survey found that CaseHoldsVersionsError is missing
  from UI_STATE_BY_ERROR_CODE and falls through to the generic state. Widening a closed union that every
  consumer of error-ui-state.ts reads is a seam of its own, so it is cut apart from the surface that consumes
  the new kind.
sources:
- intake/scope.md
objective: uiStateForApiError answers an ApiError carrying code CaseHoldsVersionsError with an error-state
  kind of its own.
criteria:
- uiStateForApiError, given an ApiError whose code is CaseHoldsVersionsError, does not answer the generic
  error state.
- The kind uiStateForApiError answers for CaseHoldsVersionsError is distinct from the case-not-found kind.
- uiStateForApiError, given an ApiError whose code is CaseNotFoundError, answers the case-not-found kind.
- uiStateForApiError, given an ApiError whose code no map entry names, answers the generic error state.
implements:
- rules/knowledge/a-case-deletion-surface-states-which-refusal-answered-its-delete
- rules/knowledge/a-case-deletion-refusal-the-surface-cannot-name-is-told-as-an-unrecognised-failure
---

## What it is
A new member of UiErrorStateKind and a new entry in UI_STATE_BY_ERROR_CODE in frontend/app/src/services/error-ui-state.ts.
It follows the same shape ConceptInUseError already has in that file.

## Notes
UNDERDETERMINED, from the specification — no criterion requires the CaseHoldsVersionsError kind to belong to no other error code, only that it differ from the generic and case-not-found kinds. Passes: mapping CaseHoldsVersionsError onto a kind another code already uses (for example a shared conflict kind), which then tells the refusal as that other condition rather than as the case still holding a version.
REMAINDER, from the specification — the wording each kind is told with (deleted; not deleted and still holding a version; no case answering the slug; unrecognised-reason with nothing further disclosed) reaches no criterion here, which only separates codes into kinds. Belongs to task/case-deletion-surface/case-delete-refusal-presentation.
ADVISORY, from the specification — this mapping is sitewide; criteria 3 and 4 are regression guards read only against the delete-surface reading, since case-not-found and the generic state elsewhere are governed by nodes outside this task's candidates.
ADVISORY, from the specification — rules/knowledge/a-case-holding-no-version-may-be-deleted, rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused and constraints/a-domain-error-unmapped-by-status-is-refused-generically state the wire refusals this mapping consumes but do not govern the mapping itself.
