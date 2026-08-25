---
type: policy
statement: The glossary holds the two non-conclusion outcomes, inconclusive-no-data and inconclusive-hypotheses-exhausted, before the first case version validates; ensuring them adds whichever of the two is missing and removes or rewrites no outcome already held, and an outcome a released case version or a released hypothesis revision names is never removed from the glossary.
constrains:
  - domain/glossary/outcome
  - domain/knowledge/case-version
consistency: eventual
---

## Description

Only a subset of the vocabularies must exist before the first case version: its recipients, its actions, and the two outcomes of non-conclusion.
The rest is discovered by writing cases.
