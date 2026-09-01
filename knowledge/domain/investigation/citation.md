---
type: value-object
attributes:
  - name: concept
    type: domain/glossary/concept
    required: true
  - name: field
    type: string
---

## Description

The traceability a decided evaluation must carry: one concept and one field of the observation that grounded the verdict.
Machine-checkable by construction: where field is present, it must exist among that evidence item's own snapshotted field names (rules/investigation/a-cited-field-exists-in-the-capability-output-schema).
field is present when the citation grounds a confirmed or refuted verdict, pointing at exactly one place in the evidence; it is absent when the citation names only which evidence a no-data verdict cites, since that evidence's own item snapshotted no fields at all to point at.

## Responsibility

Point at exactly one place in the evidence that grounds a verdict.
