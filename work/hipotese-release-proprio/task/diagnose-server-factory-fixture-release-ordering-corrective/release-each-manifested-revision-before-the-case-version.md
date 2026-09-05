---
title: Release each manifested revision before releasing the case version in diagnose-server.factory.spec.ts
summary: diagnose-server.factory.spec.ts's own insertFixtureCase helper releases the case version before releasing the manifested hypothesis-revisions.
rationale: A wrong behavior observed by running the captured suite twice, which crashed this file entirely in beforeAll — the same defect delivered and corrected in src/seed.ts by a sibling corrective increment.
sources:
- intake/diagnose-server-factory-fixture-release-ordering-corrective-scope.md
objective: diagnose-server.factory.spec.ts's own fixture-seeding helper releases every manifested hypothesis-revision, through the declared lifecycle operation, before releasing the case version that manifests it.
criteria:
- Running this file's own beforeAll against a database holding none of the fixture's rows completes without throwing CaseVersionNotReleasableError.
- Every hypothesis-revision the seeded case version's manifest references reads back with its own state released, once this file's own beforeAll has run.
- The seeded case version itself reads back with its own state released.
- This file's own fixture-seeding helper releases each manifested revision by calling the already-declared lifecycle release operation, never a raw SQL statement writing hypothesis_revisions.state.
- Every test in this file that depends on the seeded fixture runs (none is skipped by a beforeAll crash), given a database holding none of the fixture's rows beforehand.
implements:
- domain/knowledge/hypothesis-revision
- domain/knowledge/hypothesis-revision-state
- rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
- rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
---

## What it is

The corrective reordering of diagnose-server.factory.spec.ts's own insertFixtureCase: every manifested hypothesis-revision is released through the declared operation before the case version itself is released.

## Notes

REMAINDER, from the specification — rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle's refusal clause (HTTP 409, HypothesisRevisionNotDraftAtReleaseError, carrying no further value) is not exercised by any criterion here; this helper only releases revisions it has just seeded in draft. It belongs to the task delivering the hypothesis-revision release operation and its endpoint.
REMAINDER, from the specification — rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions' clause "placing a manifest entry is never refused for referencing one in draft state" is not exercised by any criterion here; it belongs to the task implementing place-hypothesis over a case version's manifest.
REMAINDER, from the specification — the same rule's clause naming every violating hypothesis among CaseVersionNotReleasableError's violations is not exercised by any criterion here; it belongs to the task implementing the case version's release refusal and the violations CaseVersionNotReleasableError names.
REMAINDER, from the specification — domain/investigation/durations and rules/investigation/a-measured-duration-below-one-millisecond-is-zero, both bound to this file by an earlier, unrelated task, reach no criterion of this task, which concerns only release ordering inside one spec file's fixture-seeding helper.
ADVISORY, from the specification — criterion 3 ("The seeded case version itself reads back with its own state released") rests on the case version's own draft/released lifecycle, governed by rules/knowledge/a-case-version-moves-through-its-declared-lifecycle, which sits outside this epic's covers. Consistent with the sibling task task/seed-release-ordering-corrective/release-each-manifested-revision-before-the-case-version, which left the same node out for the identical criterion, this criterion is read as backed by the release-gate policy alone rather than growing the epic's claim again.
Decision, beyond the covers — stand: the sibling task answering the identical criterion already left rules/knowledge/a-case-version-moves-through-its-declared-lifecycle uncited, reading the criterion as backed by the release-gate policy this task does implement; growing this epic's claim for a node no criterion of this task exercises directly would only repeat that same non-decision.
