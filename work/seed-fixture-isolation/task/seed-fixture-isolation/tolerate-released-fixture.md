---
title: seed.spec.ts tolerates an already-released fixture case
summary: Fixes seed.spec.ts's own beforeAll throwing when the shared fixture case already stands released from an earlier, legitimate run of another test file.
objective: seed.spec.ts's assertGenuinelyEmpty accepts the fixture case (intermittent-connection-outage, version 1) already existing in released state as an expected precondition rather than a failure, while every other assertion in the file — including the outcomes-emptiness check and every existing it() — stays exactly as strict as it is today.
criteria:
  - Running seed.spec.ts's full test file against a database where the fixture case already stands released from an earlier run does not throw in beforeAll, and every one of the file's own existing it() assertions still passes.
  - Running seed.spec.ts's full test file against a database where the fixture case has never been seeded at all still passes exactly as it does today.
  - No existing assertion in this file is weakened to tolerate an incorrect outcome — only assertGenuinelyEmpty's own case-existence check changes, to accept a released case as an expected state rather than a failing one; the outcomes-emptiness check is untouched.
implements:
  - domain/knowledge/case-version
  - rules/knowledge/a-case-version-is-written-once
sources:
  - intake/scope.md
---

## What it is

A corrective increment: seed.spec.ts's own precondition check was written before release-immutability made the shared fixture case permanent once genuinely released, and never updated once that became this project's own correct, standing behavior.

## Notes

None.
