---
type: policy
statement: An observation reaches the domain expressed in the glossary's vocabulary, never in the source system's.
constrains:
  - domain/investigation/evidence
  - domain/glossary/concept
consistency: eventual
---

## Description

The normalization is the one thing standing between the source systems' vocabulary and the domain's; technological leakage happens in the response, not in the call.
