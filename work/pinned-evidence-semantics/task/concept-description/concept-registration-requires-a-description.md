---
title: Concept registration refuses a submission naming no description
summary: register-concept refuses a registration with no description, with a typed
  422 error, and accepts one that states it.
rationale: This is the write-side half of the concept-description change, kept apart
  from persistence and from the read surface because it is independently demonstrable
  through the glossary's own store port without either — a fake store double is enough
  to prove the refusal and the acceptance.
sources:
- intake/scope.md
objective: A concept registration submitted with no description is refused, and one
  submitted with a description is held by the glossary against that concept's name.
criteria:
- A concept registration naming no description is refused with an HTTP 422 response
  reporting ConceptDescriptionRequiredError.
- A concept registration refused for naming no description leaves the glossary's held
  concepts unchanged.
- A concept registration naming a description succeeds, and the glossary's held concept
  for that name carries exactly that description.
implements:
- domain/glossary/concept
- rules/glossary/a-concept-declares-its-description
- scenarios/glossary/a-concept-with-no-description-is-refused
---

## What it is
The concept's own domain shape gains a required description attribute.
Registering a concept with no description is refused before anything is written.
Registering a concept with a description stores it exactly as given.

## Notes
None.
