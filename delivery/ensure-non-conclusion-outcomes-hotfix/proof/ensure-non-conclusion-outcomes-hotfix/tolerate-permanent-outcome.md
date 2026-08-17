---
title: Proof for tolerate-permanent-outcome
summary: Fixes the two hand-written IGlossaryStore stand-ins to typecheck against the new insertMissingTerms
  member, then adds unit tests proving GlossaryService.withNonConclusionOutcomes no longer throws when
  some other outcome is permanently referenced and behaves exactly as before in the ordinary cases, plus
  one integration test proving RelationalGlossaryStore.insertMissingTerms itself tolerates the real permanently-referenced
  rows this shared database already holds.
implementation: sha256:1607f8e5a8691ebf5f12c86461b85ce4728836a1d47286ba8cb61be2a93f2844
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/ensure-non-conclusion-outcomes-hotfix-tolerate-permanent-outcome-suite
tests:
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: resolves a non-conclusion outcome without throwing even though some other outcome is now permanently
    referenced elsewhere, and leaves that other outcome held unchanged
  proves: Criterion 1 — readVocabularyTerm (via withNonConclusionOutcomes) does not throw when some other
    outcome is permanently referenced, and both non-conclusion outcomes end up held.
  fails_when: withNonConclusionOutcomes tops up through store.writeTerms (the old, reverted behavior)
    instead of store.insertMissingTerms — the stand-in's blockWriteTerms simulates the real foreign-key
    violation a whole-table replace would raise against a permanently referenced row.
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: leaves the outcome vocabulary exactly as held, with no name changed, when both non-conclusion
    outcomes are already present
  proves: Criterion 2 — when both non-conclusion outcomes are already present, the call behaves exactly
    as before.
  fails_when: the service performs any write (writeTerms or insertMissingTerms) even though nothing was
    missing.
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: seeds both missing non-conclusion outcomes beside another outcome that stays held with its own
    name unchanged
  proves: Criterion 3 — with an unrelated outcome held and both non-conclusion outcomes absent, the call
    seeds exactly the two missing ones and leaves the other held outcome's own name unchanged.
  fails_when: either non-conclusion outcome is left unseeded, an extra/renamed term appears, or the pre-existing
    unrelated row is dropped or renamed by the insert-missing path.
- file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  name: adds only the terms the outcomes table does not already hold, and leaves an already-held row untouched,
    even though the table already holds rows permanently referenced by released fixtures
  proves: That RelationalGlossaryStore.insertMissingTerms issues no DELETE and tolerates the outcomes
    table's real, already-existing permanently-referenced rows — the direct store-level counterpart of
    criterion 1, proven end-to-end rather than through a stand-in.
  fails_when: insertMissingTerms performs any delete/replace step before inserting, fails to add the genuinely
    missing term, or drops the already-held one.
not_applicable:
- edge_case: Concurrent/interleaved calls to insertMissingTerms racing each other
  why: the task's criteria describe a single caller against a database state, not concurrency; the real
    implementation's per-term ON CONFLICT DO NOTHING is the same idempotent-insert shape this codebase
    already relies on for this exact table.
- edge_case: A duplicate name inside the same insertMissingTerms call's own terms list
  why: withNonConclusionOutcomes never constructs such a list (NON_CONCLUSION_OUTCOMES holds two distinct
    names), so this input shape never arises on the path this task's criteria describe.
- edge_case: Empty terms array passed to insertMissingTerms
  why: withNonConclusionOutcomes only calls it when missing.length > 0, so this input never occurs on
    the criteria's own path.
untested:
- 'A full end-to-end integration test of GlossaryService.readVocabularyTerm against a real, freshly created
  released case_versions/hypothesis_revisions fixture that pins one specific outcome for the first time
  in this run: not written, because the unit-level test already proves the exact mechanism the criterion
  describes, and the integration test already proves RelationalGlossaryStore.insertMissingTerms''s own
  real tolerance against the outcomes table''s real, already-permanently-referenced rows on this shared
  database.'
---

## What it is

Three unit tests against a fixed InMemoryGlossaryStore stand-in proving the task's own three criteria, plus one integration test proving the same tolerance against the real, already-polluted database.

## Notes

None.
