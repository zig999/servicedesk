---
type: entity
aggregate: case
attributes:
  - name: name
    type: string
    required: true
  - name: position
    type: integer
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

One falsifiable claim about the subject's situation, named uniquely within its case and placed at one position in its case's precedence.
The position is declared rather than implied: it is the fact the case's own ordering used to carry by arrangement alone, and resolve-outcome reads it to find the first confirmed hypothesis.
Its investigation is the pair collects plus criterion, held inside its case and reached only through it.
The criterion is short business prose — one to three sentences — and it is the one field where the expert's nuance is the value, refactorable only by curation.

## Responsibility

State what to collect and what confirms the claim, and declare the resolution that follows its confirmation.
