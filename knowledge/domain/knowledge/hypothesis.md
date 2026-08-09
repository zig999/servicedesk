---
type: entity
aggregate: case
attributes:
  - name: name
    type: string
    required: true
  - name: criterion
    type: string
    required: true
  - name: collects
    type: domain/glossary/concept
    required: true
    many: true
  - name: resolution
    type: resolution
    required: true
---

## Description

One falsifiable claim about the subject's situation, named uniquely within its case.
Its investigation is the pair collects plus criterion, inline in the case file.
The criterion is short business prose — one to three sentences — and it is the one field where the expert's nuance is the value, refactorable only by curation.

## Responsibility

State what to collect and what confirms the claim, and declare the resolution that follows its confirmation.
