---
type: policy
statement: Every attribute a subject's attribute-values name exists in the glossary.
constrains:
  - domain/investigation/subject
  - domain/investigation/subject-attribute-value
  - domain/glossary/subject-attribute
consistency: eventual
---

## Description

The glossary is the published language; an attribute name the entry point assembles that the glossary does not hold is not a name at all — the same discipline case-terms-exist-in-the-glossary already holds a case to, applied here because a subject's attribute-values are never declared by a case: the entry point resolves and assembles them at request time, so no case-time check ever reaches them.
