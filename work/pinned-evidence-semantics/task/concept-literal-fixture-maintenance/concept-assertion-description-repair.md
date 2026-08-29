---
title: Runtime .toEqual assertions reconciled with the required description
summary: 'Pre-existing .toEqual assertions comparing GlossaryService''s read-back
  Concept objects gain the description key their expected literals were missing, so
  each keeps passing once GlossaryService answers description: '''' for a registration
  naming none.'
rationale: This task implements no specification node — it repairs a runtime assertion
  mismatch the Concept widening introduces as a side effect, in files that test nothing
  about description. It is cut apart from the typecheck-repair task because it is
  a distinct failure mode the inventory flagged separately — a runtime value mismatch
  a compiler cannot catch — with its own falsifiable outcome (the suite step passing)
  that neither depends on nor is depended on by the typecheck-repair task's files.
sources:
- intake/pre-existing-concept-literals-scope.md
objective: Every pre-existing .toEqual assertion comparing a Concept-shaped literal
  built through a description-less ConceptRegistration continues to pass once GlossaryService
  answers description for that concept, by adding the matching description value to
  each assertion's expected literal.
criteria:
- The .toEqual assertions in src/src/__tests__/unit/glossary/glossary-query.port.spec.ts
  pass against GlossaryService's description-populated read-back.
- The .toEqual assertions in src/src/__tests__/integration/glossary/glossary-query.port.spec.ts
  pass against GlossaryService's description-populated read-back.
- The .toEqual assertions in src/src/__tests__/unit/glossary/glossary.service.spec.ts
  pass against GlossaryService's description-populated read-back.
- The .toEqual assertions in src/src/__tests__/unit/glossary/glossary.service.list-concepts.spec.ts
  pass against GlossaryService's description-populated read-back.
- No assertion in these four files changes in outcome beyond the added description
  key and its placeholder value.
- The suite step covering these four files passes.
---

## What it is
A pass over the four files the inventory names as holding a .toEqual assertion whose expected literal is missing description, now that a registration naming none reads back as description: ''.
Each expected literal gains the same description value the corresponding registration/fixture was given, and nothing else in the assertion changes.

## Notes
These sites compile today — the mismatch is only visible when the suite runs, never at typecheck — which is why they sit outside the typecheck-repair task's criteria.
None.
