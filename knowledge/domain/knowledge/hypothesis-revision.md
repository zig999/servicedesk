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
  - name: state
    type: hypothesis-revision-state
    required: true
relationships:
  - target: domain/knowledge/hypothesis
    type: reference
    cardinality: "1"
operations:
  - release
---

## Description

One numbered state of a hypothesis's own content, referencing the hypothesis it belongs to.
Its investigation is the pair collects plus criterion; the criterion is short business prose — one to three sentences — and it is the one field where the expert's nuance is the value, refactorable only by curation.
Carries its own state, draft or released, moved once by its own release — a curator's action taken directly against this revision, answering to no case version and no manifest. Once released, this content never changes again — a further edit always creates the next revision instead, leaving every version that already adopted this one reading exactly what it always read. Before release, a further edit replaces its content in place, and its number stays exactly what it already was. A case version's manifest may point at this revision in either state; pointing at it moves neither.

## Responsibility

State what to collect and what confirms the claim at this revision, declare the resolution that follows its confirmation, and hold its own release: draft until a curator releases it, released and immutable from then on.
