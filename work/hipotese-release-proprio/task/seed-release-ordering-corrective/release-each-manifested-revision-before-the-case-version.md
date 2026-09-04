---
title: Release each manifested revision before releasing the case version in seed.ts
summary: seed.ts's seedCase() releases the case version before releasing the manifested hypothesis-revisions, and moves each to released via a raw SQL UPDATE instead of the declared operation.
rationale: A wrong behavior observed by running seed.spec.ts against a genuinely empty database, which throws CaseVersionNotReleasableError — the case-version release gate this same initiative delivered refuses exactly this ordering.
sources:
- intake/seed-release-ordering-corrective-scope.md
objective: seed.ts releases every manifested hypothesis-revision, through the declared releaseHypothesisRevision operation, before releasing the case version that manifests it.
criteria:
- Running seed.ts (or seed.spec.ts's runSeedScript) against a database holding none of the fixture's rows completes without throwing CaseVersionNotReleasableError.
- Every hypothesis-revision the seeded case version's manifest references reads back with its own state released, once seed.ts has run.
- The seeded case version itself reads back with its own state released.
- seed.ts contains no raw SQL statement writing hypothesis_revisions.state; each manifested revision's release is performed by calling lifecycle.releaseHypothesisRevision.
- Running seed.ts a second time against a database it has already seeded resolves without rejecting and creates no second case version.
implements:
- rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
- rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
- domain/knowledge/hypothesis-revision
- domain/knowledge/hypothesis-revision-state
---

## What it is

The corrective reordering of seed.ts's seedCase(): every manifested hypothesis-revision is released through the declared operation before the case version itself is released.

## Notes

UNDERDETERMINED, from the specification — criterion 5 ("Running seed.ts a second time... resolves without rejecting and creates no second case version") does not itself say a second run leaves the already-released case version and its manifest entries unaltered; rules/knowledge/a-case-version-is-written-once forbids altering a released case version or the manifest entries it composes, and a second-run implementation that re-upserts the fixture's manifest onto the existing released version would satisfy every criterion as written while violating that invariant. Passes: seed.ts's existing alreadySeeded() guard already skips seedCase() entirely on a second run, so this task's fix (confined to seedCase()'s internal release ordering) does not reach or need to guard this path itself.
REMAINDER, from the specification — rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle's refusal clause (HTTP 409, HypothesisRevisionNotDraftAtReleaseError, carrying no further value) is not exercised by any criterion here; it belongs to the task exposing and refusing the hypothesis-revision release operation, not this seed-script task.
REMAINDER, from the specification — rules/glossary/the-non-conclusion-outcomes-precede-the-first-case's ensuring-before-first-case and outcome-preservation clauses are not exercised by any criterion here; they belong to the task covering seed.ts's glossary/outcome ensuring step, not this release-ordering task.
REMAINDER, from the specification — rules/knowledge/a-hypothesis-collects-at-least-one-concept's collects-no-concept refusal is not exercised by any criterion here; it belongs to the task covering hypothesis-revision authoring, not this seed release-ordering task.
REMAINDER, from the specification — rules/knowledge/validation-runs-at-every-read's validation-at-every-read and replay-exception clauses are not exercised by any criterion here, which reads back only stored state values; it belongs to the task implementing case-query's validated whole read, not this seed-script task.
ADVISORY, from the specification — constraints/a-case-is-read-whole and domain/glossary/outcome were read as candidates and deliberately excluded from implements: this task neither reads nor writes an outcome, and its releasing hypothesis-revisions apart from the case version is consistent with, not governed by, the case-query wholeness constraint.
