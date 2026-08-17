---
title: seed.spec.ts tolerates release-immutability already having made rows permanent
summary: Fixes seed.spec.ts's own beforeAll throwing when either the shared fixture case, or one of the two non-conclusion outcomes, already stands permanently referenced by an earlier, legitimate release elsewhere in this persistent database.
objective: seed.spec.ts's assertGenuinelyEmpty accepts the fixture case (intermittent-connection-outage, version 1) already existing in released state, and either non-conclusion outcome (inconclusive-no-data, inconclusive-hypotheses-exhausted) already standing permanently referenced by a released hypothesis-revision anywhere in this database, as expected preconditions rather than failures — while every other assertion in the file, and every it(), stays exactly as strict as it is today.
criteria:
  - Running seed.spec.ts's full test file against a database where the fixture case already stands released from an earlier run does not throw in beforeAll, and every one of the file's own existing it() assertions still passes.
  - Running seed.spec.ts's full test file against a database where a non-conclusion outcome already stands permanently referenced by another file's own legitimately released hypothesis-revision does not throw in beforeAll, and every one of the file's own existing it() assertions still passes.
  - Running seed.spec.ts's full test file against a database where the fixture case has never been seeded at all, and neither non-conclusion outcome is referenced by anything, still passes exactly as it does today.
  - No existing assertion in this file is weakened to tolerate an incorrect outcome — assertGenuinelyEmpty's own case-existence check and its own non-conclusion-outcomes check may each additionally tolerate a row that already exists solely because release-immutability elsewhere in this database made it permanent, but neither check tolerates any other unexpected state, and no it() assertion in the file changes.
implements:
  - domain/knowledge/case-version
  - rules/knowledge/a-case-version-is-written-once
  - domain/knowledge/hypothesis-revision
sources:
  - intake/scope.md
---

## What it is

A corrective increment: seed.spec.ts's own precondition check was written before release-immutability made the shared fixture case permanent once genuinely released, and never updated once that became this project's own correct, standing behavior.

## Notes

None.
