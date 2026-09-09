---
type: invariant
statement: >-
  An attempt to remove one of a-released-hypothesis-revision-is-never-altered's collects is not
  refused with an error; it is accepted and left with no effect, so every collect this revision
  held before the attempt still reads back unchanged after it.
constrains:
  - domain/knowledge/hypothesis-revision
---

## Description

A revision's own content is what its own release promises to keep answering forever, and what every case version's manifest that comes to reference it then relies on in turn — a collect included, so a removal attempted against one leaves every collect the revision held unchanged, exactly as `a-released-hypothesis-revision-is-never-altered` leaves the criterion, the resolution and the state.
