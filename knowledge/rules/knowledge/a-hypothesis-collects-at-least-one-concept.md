---
type: invariant
statement: Every hypothesis-revision collects at least one concept; a revision that would collect none is refused with an HTTP 422 response reporting a HypothesisRevisionCollectsNoConceptError.
constrains:
  - domain/knowledge/hypothesis-revision
---

## Description

A revision without collection can cite nothing, and the citation obligation on decided evaluations would be unsatisfiable for it.
