---
type: invariant
statement: A file is a case for new diagnoses only while every validator rule holds at the moment it is read; a replay reads the pinned version without revalidation.
constrains:
  - domain/knowledge/case
---

## Description

Validation is what decides whether the file exists as a case, and it runs at every read — at each commit, at each load by the engine — with no intermediate gate.
Replay is the declared exception: an old investigation reads the exact version it pinned, because reproducibility pins content, not current validity.
