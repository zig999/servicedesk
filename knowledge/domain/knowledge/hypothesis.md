---
type: aggregate-root
attributes:
  - name: name
    type: string
    required: true
relationships:
  - target: domain/knowledge/case
    type: reference
    cardinality: "1"
operations:
  - revise
---

## Description

One falsifiable claim's own stable identity within its case, named uniquely across every version the case ever holds — past, current or future.
Its content — the criterion it states, what it collects and the resolution that follows its confirmation — belongs to its revisions, never to this identity directly: revising a hypothesis never changes this name. While its own highest existing revision is itself still in draft state, revising replaces that revision's content in place; once that revision is released, revising instead adds a new revision for a case version's manifest to adopt.

## Responsibility

Name one falsifiable claim for as long as the case exists, and either replace its own highest revision's content in place or originate the next revision, whichever that revision's own state calls for, when its content changes.
