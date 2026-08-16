---
type: invariant
statement: A case version may be discarded only while in draft state; a released version is never removed.
constrains:
  - domain/knowledge/case-version
---

## Description

Nothing ever pinned a version that was never released, so discarding one loses no investigation's replay; discarding a released version would lose exactly that.
Discarding removes the version and its own manifest entries, never the hypothesis-revisions they referenced — a revision that only an abandoned draft ever adopted simply keeps existing, referenced by nothing.
