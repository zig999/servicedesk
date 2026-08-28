---
type: value-object
attributes:
  - name: attribute
    type: domain/glossary/subject-attribute
    required: true
  - name: required
    type: boolean
    required: true
relationships:
  - target: domain/integration/capability
    type: reference
    cardinality: "1..*"
---

## Description

One subject attribute a case version's derived input requirements name: which glossary subject-attribute it is, whether the case cannot be diagnosed without it, and every currently-registered capability that asks for it — never fewer than one, since an attribute nobody currently asks for is not a requirement at all.
Held by no aggregate and stored nowhere, the same as domain/knowledge/case-summary: computed fresh at every read from the case version's own collection plan and the capabilities currently resolving it, never a fact any case version or capability carries as its own.
A capability referenced here already carries its own name, version, connector and the concept it answers; nothing here restates them.

## Responsibility

Name one subject attribute a case version's collection plan reaches, whether the case requires it or leaves it optional, and every capability currently asking for it.
