---
title: Named error kind for the missing-description refusal
summary: The central error-ui-state table gains a named UiErrorState kind for the backend's ConceptDescriptionRequiredError, with wording left to the consuming screen.
rationale: Cut as its own task because the error table is a shared seam with more than one consumer, and the convention holds that the table gains kinds and never wording; the scope stated the surfacing, not this cut.
sources:
- intake/scope.md
objective: An ApiError carrying code ConceptDescriptionRequiredError resolves through the central error-ui-state table to its own named UiErrorState kind.
criteria:
- An ApiError whose code is ConceptDescriptionRequiredError maps to a named UiErrorState kind distinct from the generic failure kind.
- The new table entry carries no user-facing wording.
- Every ApiError code the table already names keeps mapping to its existing kind.
implements:
- rules/glossary/a-concept-declares-its-description
- scenarios/glossary/a-concept-with-no-description-is-refused
---

## What it is
One entry in the one central ApiError-code-to-UI-state table, the seam the inventory says never to duplicate.

## Notes
The inventory notes UiErrorState was deliberately shaped as an object so a state could later grow data such as which field a 422 named; this entry is the case that comment anticipated.
