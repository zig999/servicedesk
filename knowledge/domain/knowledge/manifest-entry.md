---
type: value-object
attributes:
  - name: position
    type: integer
    required: true
relationships:
  - target: hypothesis-revision
    type: reference
    cardinality: "1"
---

## Description

One line of a case version's manifest: the precedence position this version places one hypothesis at, and exactly which revision of that hypothesis's content it uses.
Reordering two hypotheses between one version and the next changes only the position two manifest entries declare — never the revision either references, and never a fact any hypothesis-revision itself carries.

## Responsibility

Pin one hypothesis-revision at one position within one case version's declared precedence.
