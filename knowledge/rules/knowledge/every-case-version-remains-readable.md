---
type: invariant
statement: Every version of a case remains readable; the store keeps every version, not the last.
constrains:
  - domain/knowledge/case
---

## Description

Keeping only the latest version would silently destroy the reproducibility of old investigations, discovered only when somebody needs to audit one.
