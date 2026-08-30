---
title: Glossary concept description
summary: The glossary browser and concept form carry the concept's description — displayed, authored, its missing-description refusal surfaced as a typed state, and legacy concepts with an empty description marked for completion.
rationale: The two system constraints are claimed here so the impact set has one declared home for them, and both are left uncovered because they are backend behaviors this console only consumes.
sources:
- intake/scope.md
- intake/material.md
covers:
- domain/glossary/concept
- rules/glossary/a-concept-declares-its-description
- rules/glossary/a-concept-with-an-empty-description-is-read-as-awaiting-one
- scenarios/glossary/a-concept-with-no-description-is-refused
- contracts/glossary/glossary-authoring
- contracts/glossary/glossary-query
- constraints/a-malformed-request-is-refused-with-a-validation-error
- constraints/listings-are-paged
uncovered:
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  why: The 400 refusal shape is the backend's, delivered by the prior initiative; no surface in this scope changes how the console consumes it through the apiFetch envelope.
- node: constraints/listings-are-paged
  why: Paging is the backend's, already delivered; the console's list screens read only a page's data array by their stated convention, and this scope adds no pagination control.
---

## What it is
The operator-facing half of the concept's mandatory description: showing it, editing it, surfacing the backend's 422 refusal as its own state, and marking the legacy concepts whose description came back empty.

## Notes
Every backend behavior here — the description field on the DTO, the 422 ConceptDescriptionRequiredError — is consumed over the wire, never reimplemented.
