---
type: value-object
attributes:
  - name: outcome
    type: domain/glossary/outcome
    required: true
  - name: referral
    type: domain/knowledge/referral
    required: true
  - name: determining_hypothesis
    type: string
  - name: text
    type: string
    required: true
---

## Description

The answer (the material's "parecer"): outcome, referral and determining hypothesis come from the case's resolve-outcome and are never decided here; the text is the only field the writing produces.
The writing receives narrowed input, so the text cannot contradict the outcome — it is never given the material to do so.
The determining hypothesis is absent when nothing confirmed and the fallback answered.

## Responsibility

Carry what the requester acts on, whole, and only after the record is written.
