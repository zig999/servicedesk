---
title: Outcome
summary: What an investigation concluded, contributed by each confirmable hypothesis and registered globally.
ddd: value-object
identity:
  - name
sources:
  - intake/arquitetura-troubleshooting-v5.md
attributes:
  - name: name
    type: enum
    required: true
    values:
      - inconclusive-no-data
      - inconclusive-hypotheses-exhausted
gaps:
  - field: attributes.name.values.[]
    why: Every other outcome is contributed by a confirmable hypothesis of some case, and the material enumerates only the two of non-conclusion that must exist before the first case.
---

## What it is

An outcome is contributed rather than designed — each confirmable hypothesis of each case brings one, and the vocabulary registers it so that two cases cannot spell the same conclusion two ways.
Registering it globally is also what lets a report compare outcomes across cases.
Two outcomes of non-conclusion exist before any case does, because an investigation that confirms nothing still has to say which kind of nothing it reached.

## Rules

An outcome a case names must exist in the glossary.
