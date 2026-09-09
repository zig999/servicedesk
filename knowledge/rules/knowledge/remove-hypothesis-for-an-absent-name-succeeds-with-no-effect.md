---
type: invariant
statement: >-
  Remove-hypothesis asked for a hypothesis name the manifest does not currently hold succeeds
  with no effect, never refused for the name's absence.
constrains:
  - domain/knowledge/case-version
  - domain/knowledge/manifest-entry
---

## Description

The refusal `a-case-has-at-least-one-hypothesis` states is over a manifest a removal would leave holding none; a name never held removes nothing to begin with, so no removal is attempted and no floor is threatened.
