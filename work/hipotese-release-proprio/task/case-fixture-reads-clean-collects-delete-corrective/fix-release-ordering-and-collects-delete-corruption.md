---
title: Fix case-fixture-reads-clean.spec.ts's own release ordering and its destructive collects-survive-DELETE test
summary: case-fixture-reads-clean.spec.ts's own insertFixtureCase releases the case version before releasing the manifested hypothesis-revisions and bypasses the declared release operation with raw SQL, and its collects-survive-DELETE test permanently removes the shared canonical fixture's own collects rows instead of leaving them intact.
rationale: 'A wrong behavior observed by running the captured suite twice: the second run traced a 20-failure cascade across 7 files, including this initiative''s own seed.spec.ts, to this exact test''s own destructive DELETE, and the execution-contract-binder''s own fresh reading during planning additionally found this file''s insertFixtureCase carries the identical release-ordering defect corrected in src/seed.ts and diagnose-server.factory.spec.ts.'
sources:
- intake/case-fixture-reads-clean-collects-delete-corrective-scope.md
objective: case-fixture-reads-clean.spec.ts releases every manifested hypothesis-revision through the declared lifecycle operation before releasing the case version, and its collects-survive-DELETE test proves the collects-survive guarantee without leaving the shared canonical fixture in a state any other test or file observes as corrupted.
criteria:
- Running this file's own beforeAll (ensureFixtureSeeded/insertFixtureCase) against a database holding none of the fixture's rows completes without throwing CaseVersionNotReleasableError.
- insertFixtureCase releases each manifested revision by calling the already-declared lifecycle release operation, never a raw SQL statement writing hypothesis_revisions.state.
- Running case-fixture-reads-clean.spec.ts's own full test file, then reading the shared canonical fixture case's manifested hypothesis-revisions' own collects afterward, finds every one of them present and matching the fixture document.
- An ordinary DELETE aimed at a released hypothesis-revision's own collects rows leaves those rows unchanged, consistent with the DB-level protection rules/knowledge/a-released-hypothesis-revision-is-never-altered names for this exact behavior — the collects-survive test asserts the rows read back unchanged, not that the DELETE itself is refused with an error.
- Running this file followed by any other file that reads the same canonical fixture case (e.g. seed.spec.ts) does not raise CaseNotValidError over that case declaring no hypothesis.
implements:
- domain/knowledge/hypothesis-revision
- rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
- rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
- rules/knowledge/a-released-hypothesis-revision-is-never-altered
- rules/knowledge/validation-runs-at-every-read
---

## What it is

Fixes case-fixture-reads-clean.spec.ts's own two defects together: its insertFixtureCase's release ordering and raw-SQL bypass, and its collects-survive-DELETE test's corruption of the shared canonical fixture.

## Notes

UNDERDETERMINED, from the specification — no criterion constrains what insertFixtureCase does when a manifested revision is already in released state; an unconditional release over every manifested revision satisfies every criterion as written while rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle refuses that exact call on a second invocation. Passes: this file's own insertFixtureCase already guards on "const alreadyStored = await store.assembleVersion(SLUG, VERSION); if (alreadyStored !== undefined) { return; }" before ever reaching the release calls, so this task's own fix (confined to the internal release ordering) never reaches that path on a second run — the same mitigation the sibling seed.ts task relies on.
ADVISORY, from the specification — criterion 5's CaseNotValidError rests on rules/knowledge/a-case-has-at-least-one-hypothesis, outside this epic's covers; the criterion is a negative assertion (the failure must not occur), so nothing is blocked, but citing that rule by name would require growing the epic's claim.
Decision, beyond the covers — stand: rules/knowledge/a-case-has-at-least-one-hypothesis is not cited; criterion 5 states only that the failure must not occur, never asserting or exercising what that rule's own refusal requires, so growing this epic's claim to cite a rule this task does not implement, only avoids provoking, would misstate what this task answers for.
REMAINDER, from the specification — rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions' placement-never-refused clause is not exercised by any criterion here; it belongs to the task delivering place-hypothesis on the case-lifecycle contract.
REMAINDER, from the specification — the same rule's violation-naming clause is not exercised by any criterion here; it belongs to the task delivering the case-version release gate.
REMAINDER, from the specification — rules/knowledge/a-released-hypothesis-revision-is-never-altered's criterion/resolution/state refusal clause is not exercised by any criterion here, which is scoped explicitly to the collects branch; it belongs to the task delivering the revise/overwrite path's refusal against a released hypothesis-revision.
REMAINDER, from the specification — rules/knowledge/validation-runs-at-every-read's replay clause is not exercised by any criterion here; it belongs to the investigation act's replay work.
