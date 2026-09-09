---
type: invariant
statement: >-
  The discard's further act
  releasing-or-discarding-a-draft-case-version-takes-a-further-explicit-act states carries more
  than the statement: it is performed only where the curator reproduces the case's own slug, so
  that the act which destroys a version is one no curator reaches without naming what they are
  destroying.
constrains:
  - domain/knowledge/case-version
  - domain/knowledge/manifest-entry
---

## Description

The two acts are not protected identically, because what they destroy is not the same kind of thing. A release ends a draft by turning it into something that answers for investigations forever, and everything it produced remains readable: the version stands, its attributes stand, its manifest stands, and `only-a-released-case-version-is-diagnosed` makes it the thing diagnosis runs against. A discard ends a draft by removing it, taking its own manifest entries with it and spending its number for good (`a-case-version-number-is-never-reused`); what the curator composed is not frozen but gone, and no reading of any surface recovers it. So the discard's further act carries the case's own slug reproduced by the curator, and the release's does not: reproducing the slug is what makes the act one a curator cannot complete without naming the thing being destroyed, and a curator who cannot name it is a curator who did not mean to destroy it. That the case holds at most one draft (`a-case-has-at-most-one-draft`) settles which version a discard would take, and settles nothing about whether the curator meant to take it — the slug answers intent, not ambiguity.
