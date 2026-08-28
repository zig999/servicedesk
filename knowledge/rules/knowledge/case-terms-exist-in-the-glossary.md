---
type: policy
statement: Every subject type, concept, outcome, action and recipient a case version or its manifested hypothesis-revisions name exists in the glossary; a hypothesis-revision naming a concept the glossary does not hold is refused with HTTP 404 reporting ConceptNotInGlossaryError.
constrains:
  - domain/knowledge/case-version
  - domain/knowledge/hypothesis-revision
  - domain/glossary/subject-type
  - domain/glossary/concept
  - domain/glossary/outcome
  - domain/glossary/action
  - domain/glossary/recipient
consistency: eventual
---

## Description

The glossary is the published language; a case version naming a term it does not hold is naming nothing.
