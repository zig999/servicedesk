---
type: policy
statement: Each concept resolves to exactly one capability; registering a capability for a concept that a capability of another identity already answers is refused with an HTTP 409 response reporting a ConceptAlreadyAnsweredError, and a concept read that finds more than one currently registered capability answering it is refused with an HTTP 500 response reporting a DuplicateConceptAnswerError rather than choosing one.
constrains:
  - domain/integration/capability
  - domain/glossary/concept
consistency: eventual
---

## Description

One to one until a second source of the same concept appears; the fallback resolution plan was cut and stays cut until it hurts.
