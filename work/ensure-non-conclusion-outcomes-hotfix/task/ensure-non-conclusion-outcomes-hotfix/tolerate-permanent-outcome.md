---
title: withNonConclusionOutcomes no longer replaces the whole outcomes table to add what is missing
summary: Fixes GlossaryService.withNonConclusionOutcomes crashing with a GlossaryStoreError whenever writeTerms's own whole-table replace hits an outcome release-immutability elsewhere in this database has already made permanent.
objective: Ensuring the two non-conclusion outcomes exist never requires removing or rewriting any outcome row that already exists, so a released case version's own permanent reference to some other outcome (via fallback_outcome or resolution_outcome) never causes this path to fail — while every outcome's own declared attributes stay exactly what they already were, and the ordinary case (nothing yet permanently referenced) behaves exactly as it does today.
criteria:
  - Calling GlossaryService.readVocabularyTerm (or any path that reaches withNonConclusionOutcomes) against a database where some outcome other than the two non-conclusion ones is permanently referenced by a released case version's fallback_outcome or a released hypothesis-revision's resolution_outcome does not throw, and both non-conclusion outcomes are present among the held outcomes afterward.
  - Calling it against a database where both non-conclusion outcomes are already present and every outcome remains freely removable behaves exactly as it does today — no outcome row's own name changes.
  - Calling it against a database where one or both non-conclusion outcomes are missing, and every currently-held outcome remains freely removable, still seeds exactly the missing one(s), leaving every other currently-held outcome's own name unchanged.
implements:
  - domain/glossary/outcome
  - rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  - rules/knowledge/a-case-version-is-written-once
  - domain/knowledge/hypothesis-revision
sources:
  - intake/scope.md
---

## What it is

A corrective increment: writeTerms's own whole-table replace semantics, correct and intentional for genuine vocabulary-authoring, was never a safe mechanism for withNonConclusionOutcomes's own narrower "ensure these two exist" need, and the mismatch went unnoticed until release-immutability elsewhere in this persistent database made some outcome row permanent for the first time.

## Notes

None.
