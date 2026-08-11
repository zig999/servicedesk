---
type: invariant
statement: No two cases share a slug.
constrains:
  - domain/knowledge/case
---

## Description

The slug is the case's identity, and it stopped being kept unique by the file system the moment the file stopped being the medium.
Two cases under one slug would give every investigation that pinned it two procedures to have run, and no pin could tell which.
