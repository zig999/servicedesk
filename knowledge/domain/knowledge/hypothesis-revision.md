---
type: aggregate-root
attributes:
  - name: revision
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
relationships:
  - target: domain/knowledge/hypothesis
    type: reference
    cardinality: "1"
---

## Description

One numbered state of a hypothesis's own content, referencing the hypothesis it belongs to.
Its investigation is the pair collects plus criterion; the criterion is short business prose — one to three sentences — and it is the one field where the expert's nuance is the value, refactorable only by curation.
Once any case version in released state manifests it, this content never changes again — a further edit always creates the next revision instead, leaving every version that already adopted this one reading exactly what it always read.

## Responsibility

State what to collect and what confirms the claim at this revision, and declare the resolution that follows its confirmation.
