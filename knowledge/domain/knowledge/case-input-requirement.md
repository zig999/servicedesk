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
A capability referenced here already carries its own name, version, connector and the concept it answers; nothing here restates them, and nothing here carries what that capability's own input schema declares about this attribute — a property's own declared type and description are guidance for whoever displays an entry, never part of what the entry states — so an asking capability reaches whatever reads this entry, an interface assembling a subject included, by its identity alone.
A capability whose own stored input schema does not currently hold a well-formed shape stands in no entry's asking-capability place at all, since it is referenced by none (rules/knowledge/a-case-versions-input-requirements-are-derived); the read names it apart from the attributes instead, by identity, and that is the whole of what reaches the person composing a subject about it (contracts/knowledge/case-input-requirements, rules/investigation/a-composed-subjects-interface-discloses-a-malformed-capability).

## Responsibility

Name one subject attribute a case version's collection plan reaches, whether the case requires it or leaves it optional, and every capability currently asking for it.
