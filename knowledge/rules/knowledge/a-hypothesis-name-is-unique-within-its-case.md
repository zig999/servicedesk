---
type: invariant
statement: No two hypotheses of one case share a name.
constrains:
  - domain/knowledge/case
  - domain/knowledge/hypothesis
---

## Description

Evaluations are indexed by hypothesis name; a colliding name would overwrite a verdict in silence.
