---
title: seed.spec.ts's five whole-table vocabulary assertions scope to the fixture's own declared names
summary: Fixes seed.spec.ts's own outcome, subject-type, action, recipient and concept/concept_accepts assertions failing against another test file's own permanently-undeletable leftover rows in the same shared vocabulary tables, by filtering each query to the fixture's own declared names instead of reading the whole table.
objective: Each of seed.spec.ts's own five vocabulary assertions proves that the fixture's own declared outcome, subject-type, action, recipient and concept/concept_accepts rows are exactly correct, regardless of what other rows the same shared table also holds — never again asserting that the table holds nothing else.
criteria:
  - Running seed.spec.ts's full test file against a database where an unrelated outcome, subject-type, action, recipient, concept or concept_accepts row — one this fixture never declared — already stands permanently present (from another test file's own release-blocked cleanup) does not fail any of the five vocabulary assertions, and every one of them still confirms the fixture's own rows are exactly correct.
  - Running seed.spec.ts's full test file against a database holding none of this fixture's data and nothing unrelated in these tables either still passes exactly as it does today.
  - No assertion is weakened to tolerate an incorrect outcome for the fixture's own data — each of the five still fails if any of the fixture's own declared rows is missing, wrong, or carries an extra accepts/subject-type-value the fixture never declared.
implements:
  - domain/glossary/outcome
  - domain/glossary/subject-type
  - domain/glossary/action
  - domain/glossary/recipient
  - domain/glossary/concept
sources:
  - intake/scope.md
---

## What it is

A corrective increment: these five assertions were written when the shared vocabulary tables genuinely held nothing but one file's own fixture at a time — a premise a persistent, shared test database can no longer guarantee once any other file's own release-blocked cleanup leaves a permanent row behind.

## Notes

None.
