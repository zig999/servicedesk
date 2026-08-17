---
title: Manifest entries read back with their own collects, not empty
summary: Fixes a defect where reading a case version's manifest through the real store answers every entry's collects as empty, though the revision was originated with a non-empty list.
objective: Reading a case version's manifest through ICaseStore.assembleVersion answers each manifest entry's hypothesis-revision with the exact collects list that revision was originated with, never empty when the revision was given a non-empty one.
criteria:
  - A case version released with two hypotheses revised with collects ["equipment-status"] and ["network-outage-flag"] respectively, then read back through case-query.service.ts's own readCase, answers each manifest entry's collects with exactly the concept it was given, never empty.
  - src/src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts and src/src/__tests__/integration/seed.spec.ts pass against the real database.
  - Releasing a draft whose hypotheses were revised with a non-empty collects list succeeds, never refused through the structural "collects no concept" problem for a manifest entry whose revision does declare one.
implements:
  - domain/knowledge/manifest-entry
  - domain/knowledge/hypothesis-revision
  - rules/knowledge/a-hypothesis-collects-at-least-one-concept
  - constraints/a-case-is-read-whole
  - domain/knowledge/case-version
sources:
  - intake/scope.md
---

## What it is

A corrective increment: one wrong behavior observed by running the delivered system (npm test),
answering to no criterion of any task under the closed case-lifecycle plan — that plan's own last
recorded suite run already showed this exact failure before it closed.

## Notes

None.
