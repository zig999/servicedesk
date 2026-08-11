---
type: invariant
statement: A stored version is a case for new diagnoses only while every validator rule holds at the moment it is read; a replay reads the pinned version without revalidation.
constrains:
  - domain/knowledge/case
---

## Description

Validation is what decides whether a stored version exists as a case, and it runs at every read — at the authoring write and at each load by the engine — with no intermediate gate.
Replay is the declared exception: an old investigation reads the exact version it pinned, because reproducibility pins content, not current validity.
It is also what keeps a draft out of the domain now that no branch holds one: an unfinished version does not validate, so it is not a case, and nothing has to mark it as not ready.
