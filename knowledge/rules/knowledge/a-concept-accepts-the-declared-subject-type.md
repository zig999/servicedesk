---
type: policy
statement: Every concept in a case's collections accepts the subject type the case declares.
constrains:
  - domain/knowledge/case
  - domain/knowledge/hypothesis
  - domain/glossary/concept
consistency: eventual
---

## Description

It is what stops a case with subject type customer from requesting equipment state.
