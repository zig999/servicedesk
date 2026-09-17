---
title: The glossary no longer holds a subject-attribute vocabulary
summary: Removal of subject-attribute from the vocabulary list, the store's table map, the coherence role
  map, the seed and its fixture, and the destructive migration that drops the table and the foreign key
  holding recorded attribute-values to it.
rationale: 'Cut apart from the check removal because these tasks change what the published language holds
  rather than what the investigation refuses, and because their reason to change is the glossary''s own
  four-vocabulary shape. The two tasks split code from schema: a migration is delivered and falsified
  against the applied schema, not against a type.'
sources:
- work/subject-attribute-glossary-removal-backend/intake/scope.md
covers:
- rules/glossary/a-vocabulary-holds-each-name-once
- rules/glossary/a-glossary-read-by-an-unheld-name-is-refused
- domain/knowledge/consolidation-register
- constraints/the-stored-schema-mirrors-the-declared-model
- constraints/the-schema-replays-from-its-scripts
- domain/investigation/subject-attribute-value
uncovered:
- node: domain/knowledge/consolidation-register
  why: It fixes the two registers a consolidation may be written in and names a discovered vocabulary
    only by way of contrast; no backend file derives anything from that contrast, so the removal leaves
    the enumeration and every path reading it untouched.
---

## What it is
The half of the removal that lives in the published language and its storage: the vocabulary list, the three parallel maps keyed off it, the seed and fixture, and the table itself.
It claims the two glossary refusals that from here on answer for four vocabularies rather than five, the storage constraint that removing subject_attributes answers to, and the schema-replay constraint the new migration must hold. (domain/glossary/_context states the four-vocabulary published language this leaves standing, but its identity cannot be named in `covers` — an underscore segment the plan contract's pattern does not admit; it is read for context, never claimed.)

## Notes
Both tasks build on the check removal, since refuseAttributesNotInGlossary names the vocabulary by a literal the type would no longer admit.
The table drop is deliberately not folded into the code task: it is falsified by running migrations and inspecting the schema, and it must not run while any code still maps a vocabulary onto that table.
