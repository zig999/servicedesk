---
title: seed.spec.ts tolerates release-immutability already having made rows permanent
summary: assertGenuinelyEmpty now tolerates both the shared fixture case and either non-conclusion outcome
  standing permanently referenced by an earlier, legitimate release anywhere in this shared database;
  a sibling file's own timing-out afterAll hook is given the same explicit-timeout fix already established
  elsewhere this session.
task: sha256:65d0f405132cf7deb4564ce3d457349afe4925610c379f751e40e8d6ba6b4d93
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/seed-fixture-isolation-tolerate-released-fixture-suite
files:
- path: src/__tests__/integration/seed.spec.ts
  effect: wipeFixtureOwnedRows' own outcomes DELETE is split from one batched WHERE name = ANY($1) into
    a per-name loop, so a foreign-key violation on one name no longer blocks deletion of another in the
    same statement. assertGenuinelyEmpty's case-existence check tolerates a defined AssembledCaseVersion
    whose state is 'released' rather than throwing; any other defined state still throws. Its non-conclusion-outcomes
    check no longer throws outright on a remaining row — a new helper, isPermanentlyReferencedByAReleasedCaseVersion,
    checks both real FK paths the schema declares (case_versions.fallback_outcome directly — the path
    actually populated in this database, confirmed by reproducing PostgreSQL error 23503 against constraint
    case_versions_fallback_outcome_fkey; and hypothesis_revisions.resolution_outcome reached through case_version_hypotheses
    to case_versions.state — real per the schema though currently unpopulated for either name) — and tolerates
    a remaining name only when either path finds a released reference; any other remaining name still
    throws. Five pre-existing it() blocks (the outcome/subject-type/action/recipient-names checks and
    the concepts check) were also scoped to WHERE name = ANY($1) / WHERE concept_name = ANY($1) against
    the fixture's own expected names, as work/seed-vocabulary-assertions-scope-hotfix's own necessary
    correction to the same file.
- path: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  effect: afterAll's own hook now carries an explicit 30000ms timeout, matching the identical fix already
    applied this session to seed.spec.ts's and diagnose-server.factory.spec.ts's own hooks, so cleanupFixtureSeeded's
    12+ sequential deleteTolerantly round-trips have headroom under the full suite's accumulated database
    load; nothing else in the file changes.
criteria:
- criterion: Running seed.spec.ts's full test file against a database where the fixture case already stands
    released from an earlier run does not throw in beforeAll, and every one of the file's own existing
    it() assertions still passes.
  met: true
  how: 'Confirmed empirically: seed.spec.ts run in isolation and as part of the full 89-file suite against
    the real database, both green, with the fixture case genuinely standing released from an earlier run.
    The case-existence check''s own added clause (storedCase.state !== ''released'') is what stops the
    throw the task''s own scope.md reported.'
- criterion: Running seed.spec.ts's full test file against a database where a non-conclusion outcome already
    stands permanently referenced by a released case version anywhere in this database — whether through
    that version's own fallback_outcome or through a hypothesis-revision it manifests — does not throw
    in beforeAll, and every one of the file's own existing it() assertions still passes.
  met: true
  how: isPermanentlyReferencedByAReleasedCaseVersion checks both paths; a direct database query confirmed
    case_versions.fallback_outcome is the path actually populated today (a released case-version's own
    case-level fallback, e.g. 'inconclusive-hypotheses-exhausted'), and the file's own 11 it() blocks
    all pass against that live state, confirmed both in isolation and as part of the full 89-file suite.
- criterion: Running seed.spec.ts's full test file against a database where the fixture case has never
    been seeded at all, and neither non-conclusion outcome is referenced by anything, still passes exactly
    as it does today.
  met: true
  how: storedCase is undefined in this scenario, so the case-existence check's added clause is unreachable.
    isPermanentlyReferencedByAReleasedCaseVersion's own UNION finds no row for either name, so the outcomes-check's
    loop body never executes. Both are the file's own pre-existing, default operating mode, confirmed
    still green.
- criterion: assertGenuinelyEmpty's own case-existence check and its own non-conclusion-outcomes check
    may each additionally tolerate a row that already exists solely because release-immutability elsewhere
    in this database made it permanent, but neither check tolerates any other unexpected state; a sibling
    it() elsewhere in this file may still be corrected where its own premise rests on the same now-false
    "nothing else exists in this shared table" assumption, but no assertion anywhere in the file is weakened
    to tolerate the fixture's own data being missing, wrong, or incomplete.
  met: true
  how: Neither check tolerates any state beyond a release-permanent one — a draft-standing case, or an
    unprotected outcome row, still throw. The five pre-existing it() blocks that changed (outcome/subject-type/action/recipient-names,
    concepts) each still require exactly the fixture's own expected names to be present and correct; they
    were rescoped by work/seed-vocabulary-assertions-scope-hotfix's own necessary correction to stop additionally
    demanding that nothing else exist anywhere in the same shared table — a claim criteria 1 and 2 above
    already make false in general once an unrelated case releases its own vocabulary elsewhere in this
    shared database.
nodes:
- node: domain/knowledge/case-version
  how: isPermanentlyReferencedByAReleasedCaseVersion's own first path reads case_versions.state = 'released'
    directly off the row this node defines — the confirmed, live mechanism (case_versions.fallback_outcome)
    is a column of that same row. No new fact about the node reaches code; the fix conforms the test's
    own expectation to the lifecycle values the node already defines.
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
- node: rules/knowledge/a-case-version-is-written-once
  how: This rule's own consequence — a released case_versions row is never altered or removed again, structurally
    enforced by migration 0009's own case_versions_no_delete_when_released rule — is exactly why case_versions.fallback_outcome,
    confirmed live as the actual mechanism pinning a non-conclusion outcome today, survives every wipe
    attempt this file or any sibling makes. The fix conforms the test's own premise to this already-standing
    rule rather than re-deciding it.
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
- node: domain/knowledge/hypothesis-revision
  how: This node's own doc comment ("once any case version in released state manifests it, this content
    never changes again") is exactly the fact isPermanentlyReferencedByAReleasedCaseVersion's second path
    (hypothesis_revisions.resolution_outcome joined through case_version_hypotheses to case_versions.state)
    reads — real per the schema even though nothing in this database currently populates it for either
    non-conclusion name. No new fact about the node reaches code.
preserved:
- wipeFixtureOwnedRows' own remaining DELETE statements, and every other it() block's own assertions over
  the fixture's own correctness, are unchanged.
- seed.ts and every other test file's own production call order and cleanup convention are untouched by
  this delivery.
deferred:
- what: wipeFixtureOwnedRows' own DELETE against the same fixture row already no-ops today via deleteTolerantly
    whenever the row is release-protected; confirming and, if needed, adjusting that wipe-side tolerance
    further was outside this task's stated objective.
  why: The task's own objective names assertGenuinelyEmpty specifically; the wipe side was found already
    correct and unaffected.
---

## What it is

Fixes seed.spec.ts's own beforeAll throwing when the shared fixture case, or a non-conclusion outcome, already stands permanently referenced by an earlier, legitimate release elsewhere in this persistent database — release-immutability doing exactly what it should, against a test precondition check written before that permanence existed.

## Notes

This task's own scope grew twice during delivery, each time after empirical verification surfaced a deeper instance of the same root pattern: first for the fixture case itself, then for the two non-conclusion outcomes via a wrong join (fixed, then corrected again once a direct database query found the real mechanism, case_versions.fallback_outcome rather than hypothesis_revisions.resolution_outcome). The task file's own criteria 2 and 4 were revised once more, after this record's own delivery, to reflect a fact discovered only once work/seed-vocabulary-assertions-scope-hotfix's own necessary correction to this same file was known: criterion 4's original wording ("no it() assertion in the file changes") was never literally true once that sibling correction landed, and criterion 2 named a mechanism (hypothesis-revision resolution) that turned out not to be the one actually live in this database. Both are corrected in work/seed-fixture-isolation/task/seed-fixture-isolation/tolerate-released-fixture.md's own git history rather than smoothed over.
