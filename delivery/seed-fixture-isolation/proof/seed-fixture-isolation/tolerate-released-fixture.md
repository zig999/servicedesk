---
title: Proof for seed.spec.ts's tolerance of release-immutability already having made rows permanent
summary: The file's own 12 it() blocks (11 pre-existing plus one added by work/seed-already-seeded-guard-hotfix's
  own proof pass), confirmed passing by a real, comprehensive install-through-suite run, against the task's
  four criteria.
implementation: sha256:a9bbe587ac44302c7e8253067bed7ab69d2974d7e7d5e52b9cdda92bf8d84087
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/seed-fixture-isolation-tolerate-released-fixture-suite
tests:
- file: src/__tests__/integration/seed.spec.ts
  name: holds both non-conclusion outcomes, having run against a database this file had itself confirmed
    lacked them beforehand
  proves: criteria 1, 2 and 3
  fails_when: the outcomes table no longer holds both non-conclusion names once seed.ts has run
- file: src/__tests__/integration/seed.spec.ts
  name: holds exactly the fixture's own outcome names, the case-specific ones and the two non-conclusion
    ones together
  proves: criteria 1, 2 and 3 — scoped by work/seed-vocabulary-assertions-scope-hotfix's own necessary
    correction, referenced in criterion 4
  fails_when: the outcomes table, restricted to exactly the fixture's own expected names, diverges from
    those names once seed.ts has run
- file: src/__tests__/integration/seed.spec.ts
  name: holds exactly the fixture's own subject-type name, the one the curated case declares as its subject
  proves: criteria 1, 2 and 3
  fails_when: the subject_types table, restricted to the fixture's own expected name, diverges from it
    once seed.ts has run
- file: src/__tests__/integration/seed.spec.ts
  name: holds exactly the fixture's own subject-attribute name, even though the curated case document
    names no subject attribute of its own
  proves: criteria 1, 2 and 3
  fails_when: the subject_attributes table diverges from the fixture's own single expected name once seed.ts
    has run
- file: src/__tests__/integration/seed.spec.ts
  name: holds exactly the fixture's own action names, every one the curated case's hypotheses and fallback
    declare
  proves: criteria 1, 2 and 3
  fails_when: the actions table, restricted to the fixture's own expected names, diverges from them once
    seed.ts has run
- file: src/__tests__/integration/seed.spec.ts
  name: holds exactly the fixture's own recipient names, every one the curated case's hypotheses and fallback
    declare
  proves: criteria 1, 2 and 3
  fails_when: the recipients table, restricted to the fixture's own expected names, diverges from them
    once seed.ts has run
- file: src/__tests__/integration/seed.spec.ts
  name: holds every concept the curated case collects, each with the subject types it accepts and its
    ttl, matching the fixture exactly
  proves: criteria 1, 2 and 3
  fails_when: the concepts/concept_accepts rows, restricted to the fixture's own expected concept names,
    diverge from the fixture's own concept.json
- file: src/__tests__/integration/seed.spec.ts
  name: registers one read-only capability, with every attribute the fixture declares, for each of the
    two concepts the curated case collects
  proves: criteria 1, 2 and 3
  fails_when: the capabilities table diverges from the fixture's own capability.json once seed.ts has
    run
- file: src/__tests__/integration/seed.spec.ts
  name: the case is stored, once seed.ts has run against a database this file had confirmed lacked it
    beforehand
  proves: criteria 1, 2 and 3
  fails_when: assembleVersion answers undefined for the fixture slug/version once seed.ts has run
- file: src/__tests__/integration/seed.spec.ts
  name: reads the seeded version back whole, matching every field the fixture document itself declares
    — not only the case's root and its hypotheses' names
  proves: criteria 1, 2 and 3
  fails_when: the case read back through createCaseQuery diverges from the fixture's own committed document
- file: src/__tests__/integration/seed.spec.ts
  name: resolves without rejecting when seed.ts is run a second time against a database it has already
    seeded
  proves: criteria 1, 2 and 3
  fails_when: a second run of seed.ts against an already-seeded database rejects instead of resolving
- file: src/__tests__/integration/seed.spec.ts
  name: holds no second case version, having run seed.ts a second time in a row against the version it
    already released
  proves: criteria 1, 2 and 3, alongside work/seed-already-seeded-guard-hotfix's own criterion that the
    case is never re-drafted
  fails_when: a second case_versions row for this slug exists after a second run
- file: src/__tests__/integration/seed.spec.ts
  name: assertGenuinelyEmpty's own case-existence and non-conclusion-outcomes checks (current text on
    disk)
  proves: criterion 4's own tolerance boundary — neither check tolerates any state beyond a release-permanent
    one; a defined-but-non-released case, or an outcome row isPermanentlyReferencedByAReleasedCaseVersion
    answers false for, still throws
  fails_when: either check's own condition were loosened to tolerate a state or a row for any reason other
    than a confirmed release-permanent reference
not_applicable:
- edge_case: two test files racing on the fixture case or on a shared outcome name concurrently
  why: 'vitest.config.ts''s own fileParallelism: false rules out concurrent access to the shared connection
    within this suite''s own run; this task introduces no new concurrency'
- edge_case: DATABASE_URL absent or unreachable
  why: requireDatabaseUrl() is untouched by this task and already refuses before any of this file's own
    code runs
- edge_case: assembleVersion answering a partially-assembled version
  why: constraints/a-case-is-read-whole guarantees assembleVersion answers whole or undefined, never partial;
    this task adds no code path that could observe a partial result
untested:
- isPermanentlyReferencedByAReleasedCaseVersion's own second UNION branch (hypothesis_revisions.resolution_outcome
  → case_version_hypotheses → case_versions.state) has never actually returned a matching row in any run
  reported so far — the live mechanism confirmed by direct database query is case_versions.fallback_outcome
  instead. The branch typechecks and mirrors migration 0009's/0010's own established join shape, but its
  own correctness against real matching data is unconfirmed by any observed run.
- The 'draft' branch of assertGenuinelyEmpty's own case-existence check still throwing, against a database
  genuinely left in that state by a crashed prior run — provable by code inspection but not exercised
  by any existing it(), since no test manufactures a standing draft of this fixture.
---

## What it is

Twelve tests: eleven pre-existing it() blocks (five of them rescoped by a sibling corrective task's own necessary fix to the same file) plus one new test added while proving work/seed-already-seeded-guard-hotfix, all confirmed passing by one real, comprehensive install-through-suite execution.

## Notes

The task's own criteria 2 and 4 were revised after this record's first draft, once this same file's necessary rescoping (work/seed-vocabulary-assertions-scope-hotfix) and the live database mechanism (case_versions.fallback_outcome rather than a hypothesis-revision's resolution_outcome) were both confirmed. This record reflects the task file as it now stands, not an earlier draft.
