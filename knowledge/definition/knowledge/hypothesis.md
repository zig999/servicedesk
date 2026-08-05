---
title: Hypothesis
summary: One falsifiable claim about what is wrong, with what must be collected to decide it and what follows if it holds.
ddd: value-object
aggregate: cases
identity:
  - name
sources:
  - intake/arquitetura-troubleshooting-v5.md
attributes:
  - name: name
    type: string
    required: true
  - name: collects
    type: list
    of: definition/glossary/concept
    binding: by-identity
    min_items: 1
    required: true
  - name: confirms_when
    type: string
    required: true
  - name: resolution
    type: ref
    target: definition/knowledge/resolution
    binding: embedded
    required: true
---

## What it is

The investigation of a hypothesis is the pair of what it collects and the criterion that decides it, and both sit inline in the case.
The criterion is prose because it is the one place a specialist's nuance is the value, and structuring it would hand curation back to a developer.
What replaces determinism there is traceability that a machine can check — an evaluation must cite a concept and a field, and the field must exist in the capability's output schema.

## Rules

A criterion states exactly one falsifiable claim, so a criterion holding when either of two things is true is two hypotheses.
A hypothesis collects at least one concept, because a hypothesis that collects nothing can cite nothing.
Two hypotheses of the same case never share a name.
