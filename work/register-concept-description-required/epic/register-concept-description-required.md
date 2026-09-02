---
title: Register-concept body types description as optional though the specification requires it
summary: The single corrective task that makes RegisterConceptBodyDto's exported type require description,
  matching domain/glossary/concept's own attribute, without changing the runtime schema's behavior or
  the HTTP response the registry already gives for a missing description.
rationale: A corrective increment cuts no epic through survey/decomposition -- this is the structural
  container the validator still requires, holding only the one task claim.
covers:
- domain/glossary/concept
sources:
- intake/scope.md
- intake/scope-refinement.md
---

## What it is

A single-task epic for the corrective increment register-concept-description-required.

## Notes

None.
