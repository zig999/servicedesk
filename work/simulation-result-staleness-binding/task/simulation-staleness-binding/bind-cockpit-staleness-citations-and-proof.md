---
title: Bind the cockpit's staleness citation and prove the changed-source behavior
summary: Replaces the stale "D8" citation with the two governing nodes and adds the test proving a return
  marks the shown result stale.
rationale: The scope bundles a comment citation fix in two files and one new test into a single ask against
  one already-delivered mechanism; splitting the citation update from the test would leave one half incomplete
  on its own -- a corrected citation with nothing newly proving what it now cites, or a new test whose
  header still names a closed initiative's own "D8" as authority -- so both stay one task, matching the
  scope's own "likely just one" reading of its single-file footprint.
sources:
- work/simulation-result-staleness-binding/intake/scope.md
objective: The cockpit's own criterion-6 mechanism and its spec file cite the two specification nodes
  as their authority in place of "D8", and the spec suite gains a test proving the mechanism's observable
  behavior -- a return marks the shown result stale -- that today's suite does not prove.
criteria:
- use-case-simulation-cockpit.ts's header comment's criterion-6 section cites rules/investigation/a-simulation-result-is-stale-once-its-source-changes
  and scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result by identity, and no longer
  cites "D8".
- use-case-simulation-cockpit-staleness.spec.ts's own header comment cites the same two nodes by identity
  in place of "D8".
- The staleness spec suite includes a test proving that a return mount for a previously-visited slug/version
  invokes history.markLastRunStale() -- the mechanism that marks the shown result stale -- as an assertion
  distinct from the existing assertion that only the version's query is invalidated.
- The three existing tests in use-case-simulation-cockpit-staleness.spec.ts (first-visit no-invalidate,
  return-visit invalidate, disclosed-limitation empty-history) continue to pass with no change to use-case-simulation-cockpit.ts's
  runtime behavior.
- The disclosed limitation -- that a genuine route unmount/remount resets the component-scoped run history
  before markLastRunStale has anything left to mark -- stays documented in the file's header comment and
  its own test, unresolved and unclaimed as fixed.
implements:
- rules/investigation/a-simulation-result-is-stale-once-its-source-changes
- scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result
---

## What it is

The task that updates the "D8" citation in use-case-simulation-cockpit.ts and its staleness spec's own header comments to name the two specification nodes.
The task that adds one test proving history.markLastRunStale() fires on a return mount, closing the gap between "invalidates the query" and "marks the result stale" that today's suite leaves unproven.
No behavior change: the delivered mechanism, its gating, and its disclosed limitation stay exactly as delivered.

## Notes

None.
