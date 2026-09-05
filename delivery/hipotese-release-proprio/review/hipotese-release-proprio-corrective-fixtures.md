---
title: 'hipotese-release-proprio: three corrective fixes to the shared release-ordering bug — review'
summary: Coverage, specification-conformance, and standard-conformance passes over the three corrective deliveries (seed.ts, diagnose-server.factory.spec.ts, case-fixture-reads-clean.spec.ts) that fixed the same release-ordering defect and its shared-fixture-corruption consequence; the failures pass did not run because the captured whole-change run passed cleanly.
reviewed:
- src/seed.ts
- src/__tests__/integration/seed.spec.ts
- src/__tests__/unit/seed.spec.ts
- src/__tests__/integration/factories/diagnose-server.factory.spec.ts
- src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
tasks:
- task/seed-release-ordering-corrective/release-each-manifested-revision-before-the-case-version
- task/diagnose-server-factory-fixture-release-ordering-corrective/release-each-manifested-revision-before-the-case-version
- task/case-fixture-reads-clean-collects-delete-corrective/fix-release-ordering-and-collects-delete-corruption
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/hipotese-release-proprio-corrective-fixtures) passed cleanly across every step; there was no failure to diagnose
coverage:
- criterion: Running seed.ts (or seed.spec.ts's runSeedScript) against a database holding none of the fixture's rows completes without throwing CaseVersionNotReleasableError.
  state: covered
  tests:
  - file: src/__tests__/integration/seed.spec.ts
    name: the case is stored, once seed.ts has run against a database this file had confirmed lacked it beforehand
  - file: src/__tests__/integration/seed.spec.ts
    name: leaves every hypothesis-revision the released version's manifest references with its own state released, once seed.ts has run
  - file: src/__tests__/integration/seed.spec.ts
    name: reads the seeded version back whole, matching every field the fixture document itself declares — not only the case's root and its hypotheses' names
  why: 'The stated precondition is established in-file: beforeAll runs wipeFixtureOwnedRows and then assertGenuinelyEmpty, which throws unless the fixture case and the non-conclusion outcomes are genuinely absent, before calling runSeedScript(1). A CaseVersionNotReleasableError out of seed.ts would abort that beforeAll and every named test would fail. The failure is not error-class specific — any throw from seed.ts fails the same tests.'
- criterion: Every hypothesis-revision the seeded case version's manifest references reads back with its own state released, once seed.ts has run.
  state: covered
  tests:
  - file: src/__tests__/integration/seed.spec.ts
    name: leaves every hypothesis-revision the released version's manifest references with its own state released, once seed.ts has run
  - file: src/__tests__/integration/seed.spec.ts
    name: leaves every manifested hypothesis-revision with exactly the revision number and state it already read, having run seed.ts yet again against the case version it already released
- criterion: The seeded case version itself reads back with its own state released.
  state: covered
  tests:
  - file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
    name: seeds the fixture case version itself as released, once beforeAll has run
  - file: src/__tests__/integration/seed.spec.ts
    name: leaves every hypothesis-revision the released version's manifest references with its own state released, once seed.ts has run
  - file: src/__tests__/integration/seed.spec.ts
    name: the case is stored, once seed.ts has run against a database this file had confirmed lacked it beforehand
- criterion: seed.ts contains no raw SQL statement writing hypothesis_revisions.state; each manifested revision's release is performed by calling lifecycle.releaseHypothesisRevision.
  state: partial
  tests:
  - file: src/__tests__/unit/seed.spec.ts
    name: writes no raw SQL statement that sets hypothesis_revisions.state
  - file: src/__tests__/unit/seed.spec.ts
    name: releases each manifested revision by calling lifecycle's own releaseHypothesisRevision operation
  why: Both tests grep seed.ts's source text rather than exercise its behavior. The first matches only /UPDATE\s+hypothesis_revisions\s+SET\s+state/i, so a raw write of that column in any other form passes it, leaving the 'no raw SQL statement writing hypothesis_revisions.state' half only partly exercised. The second asserts the substring lifecycle.releaseHypothesisRevision( appears somewhere in the file; it passes with a single call, a call on an unreached branch, or a call covering one manifested revision out of several, so 'each manifested revision's release is performed by' that call is unexercised.
- criterion: Running seed.ts a second time against a database it has already seeded resolves without rejecting and creates no second case version.
  state: covered
  tests:
  - file: src/__tests__/integration/seed.spec.ts
    name: resolves without rejecting when seed.ts is run a second time against a database it has already seeded
  - file: src/__tests__/integration/seed.spec.ts
    name: holds no second case version, having run seed.ts a second time in a row against the version it already released
  - file: src/__tests__/integration/seed.spec.ts
    name: leaves every manifested hypothesis-revision with exactly the revision number and state it already read, having run seed.ts yet again against the case version it already released
- criterion: Running this file's own beforeAll against a database holding none of the fixture's rows completes without throwing CaseVersionNotReleasableError.
  state: partial
  tests:
  - file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
    name: seeds the fixture case version itself as released, once beforeAll has run
  - file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
    name: seeds every hypothesis-revision the fixture case version's manifest references as released, once beforeAll has run
  why: A throw out of beforeAll fails every test in the file, so the 'completes without throwing' half is exercised — but the stated precondition, a database holding none of the fixture's rows, is nowhere established. Unlike seed.spec.ts, this file performs no wipe and no emptiness check before seeding, and insertFixtureCase returns early when store.assembleVersion(SLUG, VERSION) already answers.
- criterion: Every hypothesis-revision the seeded case version's manifest references reads back with its own state released, once this file's own beforeAll has run.
  state: covered
  tests:
  - file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
    name: seeds every hypothesis-revision the fixture case version's manifest references as released, once beforeAll has run
- criterion: This file's own fixture-seeding helper releases each manifested revision by calling the already-declared lifecycle release operation, never a raw SQL statement writing hypothesis_revisions.state.
  state: uncovered
  why: 'Nothing in the set exercises the means by which the helper releases. The two released-state tests in this file observe only the outcome: replacing releaseManifestedRevisions'' lifecycle.releaseHypothesisRevision loop with a raw UPDATE hypothesis_revisions SET state = ''released'' would leave both of them passing unchanged. There is no counterpart here to unit/seed.spec.ts''s source-text checks.'
- criterion: Every test in this file that depends on the seeded fixture runs (none is skipped by a beforeAll crash), given a database holding none of the fixture's rows beforehand.
  state: partial
  tests:
  - file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
    name: answers 200 with exactly the fixture case's own declared fallback outcome, referral and drafted text — no verdict, citation, evidence item or determining_hypothesis — for a request naming the seeded canonical subject
  - file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
    name: seeds every hypothesis-revision the fixture case version's manifest references as released, once beforeAll has run
  why: 'That no test is skipped by a beforeAll crash is a property of the run, reported by the runner, not something any assertion in the set states. The ''given a database holding none of the fixture''s rows beforehand'' half is unexercised for the same reason as the file''s first criterion: no wipe, no emptiness assertion, and insertFixtureCase''s early return means an already-seeded database takes a different path entirely.'
- criterion: Running this file's own beforeAll (ensureFixtureSeeded/insertFixtureCase) against a database holding none of the fixture's rows completes without throwing CaseVersionNotReleasableError.
  state: partial
  tests:
  - file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
    name: releases a freshly drafted case version without throwing CaseVersionNotReleasableError, once its own manifested hypothesis-revision has already been released through the lifecycle operation
  - file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
    name: reads the fixture case whole, with no coherence violation, through the real case-query wiring over the fixture's own glossary and capability data
  - file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
    name: reads back every hypothesis-revision the released case version's manifest references with its own state released
  why: 'The release-ordering sequence the criterion turns on is exercised directly and would fail if it stopped holding — but over a case the ordering test owns exclusively under a randomUUID slug, not over ensureFixtureSeeded/insertFixtureCase. For the seeding path the criterion actually names, only the indirect signal exists: a throw in beforeAll fails the file''s tests. The precondition ''a database holding none of the fixture''s rows'' is not established anywhere in the file.'
- criterion: insertFixtureCase releases each manifested revision by calling the already-declared lifecycle release operation, never a raw SQL statement writing hypothesis_revisions.state.
  state: uncovered
  why: No test exercises how insertFixtureCase releases. The manifest-state test observes only that the manifested revisions read back released, which a raw UPDATE hypothesis_revisions SET state would satisfy identically; nothing reads this file's own source the way unit/seed.spec.ts reads seed.ts's.
- criterion: Running case-fixture-reads-clean.spec.ts's own full test file, then reading the shared canonical fixture case's manifested hypothesis-revisions' own collects afterward, finds every one of them present and matching the fixture document.
  state: partial
  tests:
  - file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
    name: reads the shared canonical fixture case whole with no CaseNotValidError, and with every hypothesis still collecting at least one concept, once this file's own collects-survive-DELETE test has already run
  - file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
    name: reads every manifest entry's revision back collecting at least one concept
  why: 'The presence half is exercised — the last test runs after the collects-delete test and asserts every hypothesis collects at least one concept — but ''matching the fixture document'' is not: neither test opens the fixture JSON, and both assert only collects.length >= 1, so a read-back that dropped one of two collected concepts, or returned a different concept name, passes.'
- criterion: An ordinary DELETE aimed at a released hypothesis-revision's own collects rows leaves those rows unchanged, consistent with the DB-level protection rules/knowledge/a-released-hypothesis-revision-is-never-altered names for this exact behavior — the collects-survive test asserts the rows read back unchanged, not that the DELETE itself is refused with an error.
  state: covered
  tests:
  - file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
    name: leaves a released hypothesis-revision's own collects in place after an ordinary DELETE against those exact rows is attempted, exercised against a case this test owns exclusively rather than the shared canonical fixture every other file also reads
  - file: src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
    name: reads back each of two released hypothesis-revisions' own collects exactly as given, never empty, even after an ordinary DELETE against those exact rows is attempted
  - file: src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
    name: releases a new draft that inherits an earlier released version's own manifest without refusing through the structural "collects no concept" problem, even though an ordinary DELETE against the inherited revision's own collects row was already attempted
- criterion: Running this file followed by any other file that reads the same canonical fixture case (e.g. seed.spec.ts) does not raise CaseNotValidError over that case declaring no hypothesis.
  state: partial
  tests:
  - file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
    name: reads the shared canonical fixture case whole with no CaseNotValidError, and with every hypothesis still collecting at least one concept, once this file's own collects-survive-DELETE test has already run
  why: What is exercised is a read of the canonical fixture later in the same file, after the collects-delete test. The criterion's actual subject — another file reading the same canonical case after this one has run — is exercised by nothing in the set. No test sequences across files, and this file's own afterAll deletes the canonical fixture's rows, so seed.spec.ts wipes and re-seeds its own copy.
findings:
- pass: conformance
  file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  where: line 414, inside the 'persists real, non-zero cost and durations...' test
  evidence: expect(written?.durations_collection).toBeGreaterThan(0);
  cost: If the observation/collection stage ever genuinely completes within one millisecond of wall-clock time — a span the specification explicitly says is honestly reported as 0 rather than floored to 1 — this assertion fails and misreports a correct, spec-conforming measurement as a defect, encoding a stricter floor on durations.collection than the domain ever imposes.
  correction: Assert toBeGreaterThanOrEqual(0) (or drop the lower-bound assertion on collection) rather than requiring a strictly positive value.
- pass: standard
  file: src/__tests__/integration/seed.spec.ts
  where: wipeFixtureOwnedRows (lines 93-115) and cleanupSeededRows (lines 150-171)
  evidence: await deleteTolerantly(connection, 'DELETE FROM hypothesis_revision_collects WHERE case_slug = $1', [SLUG]); await deleteTolerantly(connection, 'DELETE FROM case_version_hypotheses WHERE case_slug = $1', [SLUG]); ... (repeated verbatim in both functions)
  cost: The two functions carry the same eleven-statement deletion sequence twice in one file; a table added to the teardown cascade has to be remembered and repeated in the other, and nothing signals when the two silently drift apart.
  correction: Factor the shared deletion sequence into one helper both wipeFixtureOwnedRows and cleanupSeededRows call.
  cites: MNT-03
- pass: standard
  file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  where: PlacedRevision, placeFixtureHypotheses, releaseManifestedRevisions and insertFixtureCase (lines 150-213)
  evidence: 'async function placeFixtureHypotheses(lifecycle: CaseLifecycleOperations, fixture: CaseFixtureDocument, version: number): Promise<readonly PlacedRevision[]> {'
  cost: This is the same type and the same two functions seed.ts already declares to revise, place and release each manifested hypothesis-revision before releasing the case version. A change to that release sequence has to be made in seed.ts and remembered here independently.
  correction: Export the sequence from seed.ts (or a shared fixture-seeding module) and have this spec call it instead of re-declaring it.
  cites: MNT-03
- pass: standard
  file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  where: FOREIGN_KEY_VIOLATION, isForeignKeyViolation and deleteTolerantly (lines 215-227)
  evidence: const FOREIGN_KEY_VIOLATION = '23503';
  cost: The identical constant and two functions already exist in seed.spec.ts. A change to which Postgres error code counts as a tolerable foreign-key conflict has to be made in both files.
  correction: Move the FK-tolerant delete helper into a module both spec files import.
  cites: MNT-03
- pass: standard
  file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  where: insertTerms (line 92)
  evidence: await connection.query(`INSERT INTO ${table} (name) VALUES ($1) ON CONFLICT DO NOTHING`, [name]);
  cost: The table name is concatenated into the SQL text through template-literal interpolation rather than being a fixed literal.
  correction: Replace the parameterized-table call with one literal INSERT statement per table, or switch to a lookup of pre-written statements keyed by table name.
  cites: STK-05
- pass: standard
  file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  where: PlacedRevision, placeFixtureHypotheses, releaseManifestedRevisions and insertFixtureCase (lines 83-146)
  evidence: 'async function placeFixtureHypotheses(lifecycle: CaseLifecycleOperations, fixture: CaseFixtureDocument, version: number): Promise<readonly PlacedRevision[]> {'
  cost: The same type and two functions are declared a third time, matching seed.ts and diagnose-server.factory.spec.ts verbatim; the case-fixture release sequence now has three places to keep in step rather than one to call.
  correction: Call the shared fixture-seeding sequence seed.ts or a shared module owns, rather than re-declaring it here.
  cites: MNT-03
- pass: standard
  file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  where: FOREIGN_KEY_VIOLATION, isForeignKeyViolation and deleteTolerantly (lines 159-171)
  evidence: const FOREIGN_KEY_VIOLATION = '23503';
  cost: The identical constant and two functions already exist in seed.spec.ts and are repeated again in diagnose-server.factory.spec.ts; the FK-tolerance policy now lives in three copies that a fix must reach in step.
  correction: Move the FK-tolerant delete helper into a module every spec needing it imports.
  cites: MNT-03
- pass: standard
  file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  where: insertTerms (line 34)
  evidence: await connection.query(`INSERT INTO ${table} (name) VALUES ($1) ON CONFLICT DO NOTHING`, [name]);
  cost: As in diagnose-server.factory.spec.ts, the destination table name is built into the query text by interpolation rather than supplied as a literal.
  correction: Write one literal INSERT per table instead of interpolating the table name into the query text.
  cites: STK-05
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
reconciliation: siegard-reconcile/hipotese-release-proprio-corrective-fixtures.md
---

## What it is

Evidence from three independent passes over the three corrective deliveries that fixed the release-ordering defect duplicated across seed.ts, diagnose-server.factory.spec.ts and case-fixture-reads-clean.spec.ts, plus case-fixture-reads-clean.spec.ts's own destructive collects-DELETE test. The failures pass did not run: the captured whole-change run passed cleanly (1876/1876 tests).

## Notes

The same duplicated fixture-seeding sequence (PlacedRevision, placeFixtureHypotheses, releaseManifestedRevisions, insertFixtureCase) now exists nearly verbatim in three files — seed.ts, diagnose-server.factory.spec.ts and case-fixture-reads-clean.spec.ts — each independently corrected to the same ordering by three separate corrective tasks. The standard pass flagged this duplication (MNT-03) in both test files; consolidating it into one shared module is a natural follow-up, disclosed here rather than acted on.
