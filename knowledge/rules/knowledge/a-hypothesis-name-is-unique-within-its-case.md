---
type: policy
statement: No two hypotheses of one case share a name, across every version the case ever holds.
constrains:
  - domain/knowledge/case
  - domain/knowledge/hypothesis
consistency: eventual
---

## Description

Evaluations are indexed by hypothesis name; a colliding name would overwrite a verdict in silence.
