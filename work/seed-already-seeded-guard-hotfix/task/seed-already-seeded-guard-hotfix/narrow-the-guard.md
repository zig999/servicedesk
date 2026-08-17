---
title: seed.ts reseeds vocabularies, concepts and capabilities every run, gating only the case write on alreadySeeded()
summary: Fixes seed.ts skipping concept_accepts and capability reseeding forever once the case it gates on becomes permanently released, by making seedOutcomes/seedRemainingVocabularies additive (like ensure-non-conclusion-outcomes-hotfix's own insertMissingTerms) and narrowing alreadySeeded()'s own gate to cover only seedCase.
objective: Rerunning seed.ts against a database where the case already stands released, but where concept_accepts, capabilities, or any vocabulary row a sibling test file's own wipe removed are currently absent, still reseeds every one of them before verifySeededCase runs — while a database that already holds everything behaves exactly as it does today, and the case is never re-drafted or re-released once it already exists.
criteria:
  - Running seed.ts against a database where the case already stands released, and concept_accepts and capabilities for the fixture's own concepts are currently absent, reseeds both before verifySeededCase runs, and verifySeededCase does not throw.
  - Running seed.ts against a database where the case already stands released and every vocabulary, concept, concept_accepts and capability row it needs is already present behaves exactly as it does today — no write occurs, and verifySeededCase does not throw.
  - Running seed.ts against a database holding none of this fixture's data at all still seeds everything and succeeds exactly as it does today, including originating and releasing the case exactly once.
  - Running seed.ts a second time in a row against a database it just finished seeding does not attempt to re-draft or re-release the case, and does not throw.
implements:
  - domain/glossary/outcome
  - domain/glossary/concept
  - domain/integration/capability-registry
  - rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  - rules/knowledge/a-case-version-is-written-once
sources:
  - intake/scope.md
---

## What it is

A corrective increment: alreadySeeded()'s own all-or-nothing gate was correct while the case's own existence implied every vocabulary/concept/capability row it needs still existed too — a premise release-immutability elsewhere in this database has since made false, once a sibling test file's own wipe can remove those rows without the case's own permanence preventing it.

## Notes

None.
