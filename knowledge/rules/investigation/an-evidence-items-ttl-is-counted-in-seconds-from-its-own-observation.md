---
type: invariant
statement: An evidence item's ttl is the number of seconds that item's observation was considered fresh for, counted from that item's own observed_at.
constrains:
  - domain/investigation/evidence
---

## Description

domain/investigation/evidence records observed_at and ttl beside one another without saying how the two are read together, and a bare integer answers neither question a reader of freshness has: in what unit the figure is counted, and from which instant. Fixing both makes the freshness window derivable from the item alone — it carries when it was captured and how long that capture stood — so a later reader, a person on an evidence surface or a judgment weighing a criterion that turns on recency, computes staleness without consulting anything outside the item.

Seconds are the unit domain/glossary/concept already publishes for the freshness tolerance a concept declares, so a freshness figure means one thing wherever this specification records it rather than changing unit between the vocabulary and the record.

This fixes what the recorded number means, never that anything acts on it: an item whose window has elapsed is still an item that was collected and recorded exactly as its result states, and nothing here refuses, re-collects or degrades it.
