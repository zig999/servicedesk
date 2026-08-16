---
type: invariant
statement: The declared order of a case version's manifest is the precedence the experts affirm.
constrains:
  - domain/knowledge/case-version
  - domain/knowledge/manifest-entry
---

## Description

Which cause dominates which is a domain fact, verified by human review rather than by the validator.
The declared order is each manifest entry's own position, declared rather than arranged, so nothing about how a case version is stored or read back can change what the experts affirmed.
Two hypotheses confirming frequently in the same investigation is the signal that the declared order is wrong.
