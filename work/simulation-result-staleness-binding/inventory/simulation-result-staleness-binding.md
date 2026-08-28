---
title: Cockpit staleness code already delivered; binding a citation and adding one test
summary: The return-from-editing staleness mechanism already implements the two nodes this scope binds;
  the area is the cockpit hook, its history hook, its version-record type and its stale-aware consumer.
area:
- frontend/app/src/hooks/use-case-simulation-cockpit.ts
- frontend/app/src/hooks/use-case-simulation-cockpit-staleness.spec.ts
- frontend/app/src/hooks/use-case-simulation-cockpit.test-support.ts
- frontend/app/src/hooks/use-case-simulation-history.ts
- frontend/app/src/services/case-version-record.ts
- frontend/app/src/routes/case-simulation-case-result-panel.tsx
modules:
- name: use-case-simulation-cockpit
  path: frontend/app/src/hooks/use-case-simulation-cockpit.ts
  role: touched
- name: use-case-simulation-cockpit-staleness-spec
  path: frontend/app/src/hooks/use-case-simulation-cockpit-staleness.spec.ts
  role: touched
- name: use-case-simulation-history
  path: frontend/app/src/hooks/use-case-simulation-history.ts
  role: depends-on
- name: case-version-record
  path: frontend/app/src/services/case-version-record.ts
  role: depends-on
- name: case-simulation-case-result-panel
  path: frontend/app/src/routes/case-simulation-case-result-panel.tsx
  role: adjacent
conventions:
- statement: A hook's own header comment states, per criterion, which mechanism proves it and cites the
    specification fact it answers to by name rather than restating the rule in prose.
  seen_at: frontend/app/src/hooks/use-case-simulation-cockpit.ts
- statement: A cross-cutting proof is split into sibling <hook>-<facet>.spec.ts files sharing one .test-support.ts
    fixture module, each spec file's own header comment stating which facet it proves and which it deliberately
    leaves to a sibling.
  seen_at: frontend/app/src/hooks/use-case-simulation-cockpit-staleness.spec.ts
- statement: A test file discloses a known limitation of the mechanism it proves as an explicit assertion
    of current behavior, not a silent gap.
  seen_at: frontend/app/src/hooks/use-case-simulation-cockpit-staleness.spec.ts
must_not_duplicate:
- what: The return-detection marker (visitedSimulationRoutes, a module-level Set keyed slug:version) and
    the unconditional markLastRunStale() call it triggers on a return mount
  at: frontend/app/src/hooks/use-case-simulation-cockpit.ts
- what: The staleness flag's own mutation (markLastRunStale, flips the last run's stale in place without
    appending)
  at: frontend/app/src/hooks/use-case-simulation-history.ts
- what: The existing criterion-6 proof structure (first-visit vs. return-visit describe blocks, the disclosed-limitation
    test) that any new stale-because-of-a-change test should sit beside
  at: frontend/app/src/hooks/use-case-simulation-cockpit-staleness.spec.ts
risks:
- risk: Rewording the file's header comment's D8 citation without touching behavior could still accidentally
    alter or drop the adjoining prose that documents the coarsest-reading justification (why no hash/updated_at
    comparison is computed), which a future reader relies on to understand why the code always marks stale.
  consumers:
  - frontend/app/src/hooks/use-case-simulation-cockpit.ts
- risk: CaseVersionRecord carries no hash/updated_at field today; a test asserting "stale because the
    version changed" can only simulate that fact via the same return-detection marker the code already
    uses, so an over-specified test could assert a distinction (version-changed vs. hypothesis-revision-changed)
    the delivered code cannot actually make, coupling the test to behavior the implementation does not
    have.
  consumers:
  - frontend/app/src/hooks/use-case-simulation-cockpit-staleness.spec.ts
- risk: case-simulation-case-result-panel.tsx renders lastRun.stale and each run's run.stale directly
    from history.runs; any change to how/when markLastRunStale fires changes what this panel shows a curator.
  consumers:
  - frontend/app/src/routes/case-simulation-case-result-panel.tsx
sources:
- work/simulation-result-staleness-binding/intake/scope.md
---

## What it is

The delivered `useCaseSimulationCockpit` hook already implements the return-from-editing staleness mechanism the scope's two specification nodes describe.
`use-case-simulation-cockpit-staleness.spec.ts` already proves first-visit-vs-return-visit detection and the query invalidation, plus one disclosed-limitation test about run-history reset on real navigation.
`CaseVersionRecord` (case-version-record.ts) carries no hash or `updated_at` field, which is why the delivered code always marks stale on a return mount rather than comparing versions.
The hook's own header comment currently cites "D8" from a closed initiative's intake material as its authority for criterion 6, rather than the two nodes this scope names.
`useCaseSimulationHistory.markLastRunStale()` (use-case-simulation-history.ts) is the one existing mutation that flips staleness, consumed for rendering by case-simulation-case-result-panel.tsx.

## Notes

The scope asks for no behavior change: a citation update in the header comment, one additional test proving the observable "stale because of a change" behavior, and binding the two nodes once delivered.
The survey found no other file in the target root citing "D8" besides the hook and its staleness spec's own comment.
No second implementation of return-detection or stale-marking exists elsewhere in the tree; the mechanism to reuse is exactly the one already in these two files.
