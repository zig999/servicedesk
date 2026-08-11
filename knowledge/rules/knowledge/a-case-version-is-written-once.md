---
type: invariant
statement: A case version is written once and never altered; revising a case writes a new version.
constrains:
  - domain/knowledge/case
---

## Description

It is what slug and version pin: with no digest over the content, a version that could be rewritten would leave every investigation that pinned it naming a procedure other than the one that ran.
Curation is therefore additive — the next version, never an edit to the last — which is also what keeps every earlier version readable.
