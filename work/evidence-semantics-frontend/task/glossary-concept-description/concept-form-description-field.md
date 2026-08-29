---
title: Concept form authors the description and surfaces its refusal
summary: The existing concept form gains the description field through create and edit, and a 422 ConceptDescriptionRequiredError reaches the operator as the typed state instead of the generic toast.
rationale: The field and its refusal path are one task because the refusal is the failure branch of the same submission the field creates; the typed kind and the read shape are dependencies because each is a seam delivered separately.
sources:
- intake/scope.md
- intake/material.md
objective: An operator authors a concept's description through the existing concept form, whose failure path renders the backend's missing-description refusal as its own typed state.
criteria:
- The concept form shows a description field populated with the concept's current description when editing.
- A submitted registration carries the description in the request body.
- conceptFormSchema requires a non-empty description, with the mirroring of the backend DTO disclosed in the module's header comment.
- A 422 ConceptDescriptionRequiredError response renders the screen's own wording for the missing description rather than the generic failure toast.
- A failure no criterion names still falls through to the existing generic toast.
depends_on:
- task/glossary-concept-description/concept-description-error-kind
- task/glossary-concept-description/browser-description-and-legacy-marker
implements:
- domain/glossary/concept
- rules/glossary/a-concept-declares-its-description
- scenarios/glossary/a-concept-with-no-description-is-refused
- contracts/glossary/glossary-authoring
- contracts/glossary/glossary-query
---

## What it is
The write side of the concept's description on the one existing concept form — one more field on that form, never a second form.

## Notes
The inventory's risk is that use-concept-form's onError assumes register-concept throws no domain error; this task is where that assumption stops being load-bearing.
