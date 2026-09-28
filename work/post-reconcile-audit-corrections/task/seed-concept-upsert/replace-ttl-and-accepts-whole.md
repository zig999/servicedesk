---
title: Re-seeding a concept replaces its ttl and its accepted subject types
summary: Fixes seedConcepts to write a concept's ttl and accepted subject types the way the glossary store's
  own write path does, instead of an independent upsert that only updates description and only adds accepted
  subject types.
sources:
- intake/seed-concept-upsert-scope.md
objective: Re-seeding a concept fixture against a store that already holds that concept's name leaves
  the store holding exactly the ttl and exactly the accepted subject types the fixture currently states.
criteria:
- Re-seeding a concept whose ttl differs from the value the store already holds under that name leaves
  the store holding the fixture's ttl.
- Re-seeding a concept whose fixture no longer names a subject type the store already records as accepted
  leaves the store not accepting that subject type.
- Re-seeding a concept whose fixture names a subject type the store does not yet record as accepted leaves
  the store accepting that subject type.
implements:
- domain/glossary/concept
- rules/glossary/a-registered-concept-is-never-removed
---

## What it is

Replaces seedConcepts' hand-rolled upsert (which updates only description and only adds newly-named accepted subject types) with the glossary store's own write path, so re-seeding a concept already held under a name replaces its ttl and its accepted subject types whole, per rules/glossary/a-registered-concept-is-never-removed and domain/glossary/concept.

## Notes

UNDERDETERMINED, from the specification -- no criterion covers rules/glossary/a-registered-concept-is-never-removed's "removes no concept already held" clause: nothing requires that a concept the store holds but the fixture does not name survives re-seeding. Passes: a seedConcepts that clears the concepts table (or deletes every concept absent from the fixture) before inserting each fixture concept -- every criterion here passes while concepts the fixture omits are wrongly removed.
UNDERDETERMINED, from the specification -- no criterion covers the rule's "adds a concept at a new name" clause: nothing requires that seeding a concept at a name the store does not yet hold adds it. Passes: a seedConcepts that only updates and replaces accepts for names already present, writing nothing for a new name.
UNDERDETERMINED, from the specification -- the rule says registering "replaces the concept already held at that name" whole, and domain/glossary/concept declares description as a required attribute alongside ttl and accepts; no criterion holds description to the fixture on re-seed. Passes: a seedConcepts that replaces ttl and accepts from the fixture but no longer writes description on conflict.
REMAINDER, from the specification -- the rule's removal-refusal clauses (ConceptInUseError, the reference and details it carries, what a removal does and does not take with it) reach no criterion here; seeding never performs an explicit removal.
Belongs: the concept-removal operation (glossary-authoring's remove-concept) and the task that implements its refusal.
ADVISORY, from the binder -- the fact this task rests on was found already stated in rules/glossary/a-registered-concept-is-never-removed and written into domain/glossary/concept's own Responsibility during this same corrective increment, with no entry added to the log of decisions (the fact was found already stated elsewhere in the specification, not read from intake/, so the rule for when a stated outcome is logged as read does not require one here).
