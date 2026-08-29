---
type: invariant
statement: The registry refuses to register or update a concept with no description, with an HTTP 422 response reporting a ConceptDescriptionRequiredError.
constrains:
  - domain/glossary/concept
---

## Description

A concept is the vocabulary a capability's evidence and a hypothesis's citation both draw on; a name with no stated meaning is a published term nobody can read.
