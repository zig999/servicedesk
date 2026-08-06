---
title: Evidence
summary: What one capability answered about one concept, or the recorded fact that it did not answer.
ddd: value-object
identity:
  - concept
sources:
  - intake/arquitetura-troubleshooting-v5.md
  - intake/decisoes-cinco-perguntas-2026-08-06.md
attributes:
  - name: concept
    type: ref
    target: definition/glossary/concept
    binding: by-identity
    required: true
  - name: capability
    type: ref
    target: definition/integration/capability
    binding: by-identity
    required: true
  - name: observed_at
    type: datetime
    required: true
  - name: ttl
    type: integer
    required: true
  - name: source
    type: string
    required: true
  - name: result
    type: enum
    required: true
    values:
      - ok
      - unavailable
      - denied
      - timeout
  - name: detail
    type: string
    required: false
gaps:
  - field: attributes.observation
    why: The material states an observation arrives normalised into the glossary's vocabulary and does not state its shape, which the capability's output schema gives per concept.
  - field: attributes.inputs
    why: The material states an evidence records the inputs it was produced from and does not state their shape.
  - field: attributes.retention
    why: The sixth lacuna is open — the material does not say how long an evidence is kept nor which personal data must be masked before it reaches a prompt.
---

## What it is

There is exactly one evidence per concept in an investigation, so the concept identifies it and it carries no identifier of its own.
An absent fact is a recorded fact — a capability that timed out, was unavailable, or refused produces an evidence saying so rather than an exception.
That is what lets a stage exhaust its deadline without aborting the investigation.

## Rules

An evidence reaches the domain in the glossary's vocabulary and never in the vocabulary of the system that produced it.
An evidence whose result is not ok still counts as the answer for its concept.
An investigation records exactly one evidence for every concept its case's hypotheses collect.
A concept the collection never attempted is recorded as an evidence carrying the timeout result, never as an absent evidence.
