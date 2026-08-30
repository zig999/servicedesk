---
subject: rules/glossary/a-concept-declares-its-description
given:
  - an operator submits a concept registration naming no description
when:
  - register-concept processes the submission
then:
  - the registration is refused with an HTTP 422 response reporting ConceptDescriptionRequiredError
  - the glossary's held concepts are unchanged
  - the operator console tells the operator specifically that the description is missing, never only a generic failure notice — the exact wording stays the console's own
involves:
  - domain/glossary/concept
---

## Description

A concept with no stated meaning would publish a name nobody downstream — the glossary browser, a hypothesis's citation, a judgment prompt — could read.
