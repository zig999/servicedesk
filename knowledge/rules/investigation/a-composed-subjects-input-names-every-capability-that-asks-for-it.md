---
type: policy
statement: >-
  Alongside each input a-composed-subject-presents-every-case-input-requirement presents, the
  interface names every capability that requirement holds — each by its own name and version,
  together with that capability's own connector — never only one of them where more than one
  currently-registered capability asks for the same attribute.
constrains:
  - domain/investigation/subject
  - domain/knowledge/case-input-requirement
  - domain/integration/capability
consistency: eventual
---

## Description

Each input names its own askers because the requirement already holds every one of them (`domain/knowledge/case-input-requirement`, at cardinality 1..*, derived by `a-case-versions-input-requirements-are-derived`), and because a value the composer leaves empty degrades exactly those capabilities' own observations rather than the call (`a-simulated-subject-missing-a-requirement-degrades-not-refuses`, `an-unresolvable-observation-ends-unavailable`): a composer who can see which observations depend on an input can weigh leaving it empty, and one asker named among several would hide the rest. Two capabilities ask for one attribute whenever they answer two different concepts the collection plan reaches, since a concept more than one capability answers contributes no attribute at all.

A capability's name, version and connector are each that capability's own declared fact, reached through the requirement's reference to it and restated nowhere here — the same restraint `domain/knowledge/case-input-requirement` already holds by declaring neither.
