---
type: invariant
statement: An investigation holds exactly one evaluation for every hypothesis its pinned case requires; inconclusive counts, silence does not.
constrains:
  - domain/investigation/investigation
  - domain/investigation/evaluation
---

## Description

The factory refuses an investigation whose evaluations do not cover requires-evaluation-of totally.
This is why a bad judgment response must degrade into an inconclusive evaluation rather than disappear.
