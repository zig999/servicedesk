---
type: value-object
attributes:
  - name: concept
    type: domain/glossary/concept
    required: true
  - name: field
    type: string
    required: true
---

## Description

The traceability a decided evaluation must carry: one concept and one field of the observation that grounded the verdict.
Machine-checkable by construction: the field must exist in the output schema of the capability that produced that evidence.

## Responsibility

Point at exactly one place in the evidence that grounds a verdict.
