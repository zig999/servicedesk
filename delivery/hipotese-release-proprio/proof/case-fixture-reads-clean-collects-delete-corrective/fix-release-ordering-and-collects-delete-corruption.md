---
title: Additional release-ordering and cross-file-corruption proof for case-fixture-reads-clean.spec.ts
summary: New tests in case-fixture-reads-clean.spec.ts independently exercise the release-ordering fix (criteria 1, 2, 5) and the underdetermined second-invocation guard, distinct from the task-implementer's own rewritten collects-survive-DELETE test.
implementation: sha256:8f9189e0133aedeb6a4c03f973c78b7dd1714d6dfa83ebc7cc5bcf98ceacdc89
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/case-fixture-reads-clean-collects-delete-corrective-fix-release-ordering-and-collects-delete-corruption-suite-2
tests:
- file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  name: leaves a released hypothesis-revision's own collects in place after an ordinary DELETE against those exact rows is attempted, exercised against a case this test owns exclusively rather than the shared canonical fixture every other file also reads
  proves: Criteria 3 and 4 — an ordinary DELETE against a released hypothesis-revision's own collects rows leaves them unchanged, and no test in this file touches the shared canonical fixture's own collects rows anymore. Written by the task-implementer as part of the fix itself; cited here as it also serves as evidence for these two criteria.
  fails_when: The DB-level protection over hypothesis_revision_collects stops holding for a released revision (the DELETE actually removes the row), or the test is changed back to target the shared canonical fixture's own rows instead of an owned instance.
- file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  name: releases a freshly drafted case version without throwing CaseVersionNotReleasableError, once its own manifested hypothesis-revision has already been released through the lifecycle operation
  proves: Criterion 1's ordering guarantee, independent of the shared canonical fixture's persistent DB state — a freshly built case identity whose one manifested hypothesis-revision is released via lifecycle.releaseHypothesisRevision before lifecycle.release(slug, version) is called, mirroring insertFixtureCase's own corrected sequence.
  fails_when: The release ordering reverts (lifecycle.release is called before the manifested revision is released), so the manifest-only-released-revisions gate inside ReleaseOperation finds the revision still draft and lifecycle.release rejects with CaseVersionNotReleasableError instead of resolving.
- file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  name: refuses releasing an already-released manifested hypothesis-revision a second time with HypothesisRevisionNotDraftAtReleaseError, the exact refusal an unconditional release over every manifested revision on a second seeding run would meet without this file's own idempotency guard
  proves: 'The task''s own UNDERDETERMINED note about an unconditional release over every manifested revision on a second invocation. This test fails over exactly that named candidate implementation: it shows that calling lifecycle.releaseHypothesisRevision a second time against an already-released revision is refused, which is precisely why this file''s own pre-existing idempotency guard is load-bearing.'
  fails_when: lifecycle.releaseHypothesisRevision stops refusing a second release attempt against an already-released revision.
- file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  name: reads the shared canonical fixture case whole with no CaseNotValidError, and with every hypothesis still collecting at least one concept, once this file's own collects-survive-DELETE test has already run
  proves: Criterion 5 — placed as the last test in the file, it re-reads the shared canonical fixture case through the real case-query wiring after every earlier test in the file — including the collects-survive-DELETE test — has already executed, and finds it still structurally and coherently valid with every hypothesis still collecting at least one concept.
  fails_when: The collects-survive-DELETE test (or insertFixtureCase) again reaches into the shared canonical fixture's own manifest or collects rows and empties or removes them, so this final readCase either throws CaseNotValidError or returns a hypothesis whose collects array is empty.
not_applicable:
- edge_case: Concurrent writers racing to build an owned proof instance or the shared canonical fixture at once.
  why: Every owned instance in these new tests uses a randomUUID-suffixed slug, so two runs (or two tests) can never collide on identity; the shared canonical fixture is protected by its own pre-existing, unmodified idempotency guard that this task does not change.
- edge_case: Absent or malformed input to insertFixtureCase or the new proof helpers.
  why: These functions take no external caller-supplied input — they read this file's own fixture JSON and construct fixed, valid vocabulary values.
- edge_case: A dependency (database) that is slow or answers in an unexpected shape.
  why: This task's fix is entirely about call ordering and DELETE targeting against a real PostgreSQL integration database already required by every other test in this file.
untested:
- 'Criterion 2''s literal clause — that insertFixtureCase never issues a raw SQL statement writing hypothesis_revisions.state — has no black-box behavioral test that can discriminate it from a raw-SQL bypass writing the identical final value; this clause is a source-shape fact, confirmed only by reading the file directly: it contains no UPDATE, INSERT or raw SQL statement writing hypothesis_revisions.state anywhere.'
- 'That this file''s own actual beforeAll (ensureFixtureSeeded/insertFixtureCase), not an owned-instance proxy, completes without throwing CaseVersionNotReleasableError against a database genuinely holding none of the fixture''s own rows is not exercised by a new test: the shared test database is persistent across runs, so no test executed from within this file''s own suite controls whether insertFixtureCase''s own beforeAll invocation ever actually meets a database with zero pre-existing rows for SLUG/VERSION.'
---

## What it is

New tests independently exercising the release-ordering fix and the second-invocation idempotency guard, alongside the task-implementer's own rewritten collects-survive-DELETE test.

## Notes

Two earlier suite attempts (kept as run/case-fixture-reads-clean-collects-delete-corrective-fix-release-ordering-and-collects-delete-corruption-suite and -suite-2's own predecessor) failed with cause: setup — a stale, corrupted shared canonical fixture (released case version, zero hypotheses) left over from suite runs captured before this fix existed, and permanently un-deletable via ordinary means once released. Cleaned manually before this suite (the passing one) ran. Direct testing also confirmed the DB-level collects-DELETE protection genuinely holds; the corrupted fixture, not a missing migration, was the sole cause of every downstream failure.
