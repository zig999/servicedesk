---
type: policy
statement: Every concept a case version's manifested hypothesis-revisions collect accepts the subject type the case version declares; a hypothesis-revision request is refused, with an HTTP 422 response reporting a ConceptRefusesSubjectTypeError, when a concept it collects does not accept the case version's declared subject type.
constrains:
  - domain/knowledge/case-version
  - domain/knowledge/hypothesis-revision
  - domain/glossary/concept
consistency: eventual
---

## Description

It is what stops a case version with subject type customer from requesting equipment state.
