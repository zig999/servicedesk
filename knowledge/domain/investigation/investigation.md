---
type: aggregate-root
attributes:
  - name: id
    type: string
    required: true
  - name: requester
    type: string
    required: true
  - name: ticket_ref
    type: string
    required: true
  - name: narrative
    type: string
    required: true
  - name: subject
    type: subject
    required: true
  - name: prompt_version
    type: string
    required: true
  - name: model
    type: string
    required: true
  - name: evidence
    type: evidence
    required: true
    many: true
  - name: evaluations
    type: evaluation
    required: true
    many: true
  - name: assessment
    type: assessment
    required: true
  - name: cost
    type: cost
    required: true
  - name: durations
    type: durations
    required: true
relationships:
  - target: domain/knowledge/case
    type: reference
    cardinality: "1"
    role: pinned-case
---

## Description

One diagnosis of one subject under one pinned case, written once and never mutated — an immutable result produced by a factory that cannot build an invalid instance.
The case reference is pinned by content — slug, version and hash — and, together with model, prompt version and the evidence, forms the replay pins.
No budget, no steps, no closing state: the end is a verifiable condition, not a state to maintain.

## Responsibility

Hold the complete record — narrative, evidence, evaluations, assessment, cost and stage durations — so the response can follow the record and an audit can replay it.
