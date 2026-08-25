---
type: invariant
statement: A read of a vocabulary term by a name the named vocabulary does not hold is refused with an HTTP 404 response reporting a VocabularyTermNotHeldError, and a read of a concept by a name the glossary does not hold is refused with an HTTP 404 response reporting a ConceptNotHeldError.
constrains:
  - domain/glossary/concept
  - domain/glossary/subject-type
  - domain/glossary/subject-attribute
  - domain/glossary/outcome
  - domain/glossary/action
  - domain/glossary/recipient
---

## Description

An unheld name is not an ordinary empty result a caller could read as though something answered to it, but a refusal of its own — the same distinction a-connector-configuration-read-by-an-unregistered-name-is-refused draws for the registry.
The glossary's own resolution may answer the absence as ordinary data internally; the published read turns it into this refusal.
