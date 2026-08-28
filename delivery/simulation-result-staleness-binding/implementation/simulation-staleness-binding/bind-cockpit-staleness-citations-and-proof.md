---
title: Bind the cockpit's staleness citation to its two governing nodes
summary: Replaces the stale "D8" citation in both files' header comments with the identities of rules/investigation/a-simulation-result-is-stale-once-its-source-changes
  and scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result, with no change to any
  runtime behavior.
task: sha256:7d44e5377b6c3eac32f2923032d6817b53a2afa75bdc1d24eaa21150895514f8
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/simulation-staleness-binding-bind-cockpit-staleness-citations-and-proof-build
files:
- path: src/hooks/use-case-simulation-cockpit.ts
  effect: header comment's criterion-6 section now cites rules/investigation/a-simulation-result-is-stale-once-its-source-changes
    and scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result by identity in place
    of "D8"; the adjoining prose explaining why no hash/updated_at comparison is computed is unchanged,
    and no code below the comment (visitedSimulationRoutes, the return-detection effect, the markLastRunStale()
    call, the invalidateQueries call) was touched
- path: src/hooks/use-case-simulation-cockpit-staleness.spec.ts
  effect: file's own header comment now cites the same two nodes by identity in place of "D8"; the three
    existing tests (first-visit no-invalidate, return-visit invalidate, disclosed-limitation empty-history)
    are untouched
criteria:
- criterion: use-case-simulation-cockpit.ts's header comment's criterion-6 section cites rules/investigation/a-simulation-result-is-stale-once-its-source-changes
    and scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result by identity, and no
    longer cites "D8".
  met: true
  how: the criterion-6 block now reads "so rules/investigation/a-simulation-result-is-stale-once-its-source-changes's
    own allowance for 'the coarsest safe answer' -- exercised by scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result's
    own concrete 'returns to the cockpit' case -- is the branch that always applies here", and no "D8"
    substring remains in the file
- criterion: use-case-simulation-cockpit-staleness.spec.ts's own header comment cites the same two nodes
    by identity in place of "D8".
  met: true
  how: the file's top-of-file comment now reads "so rules/investigation/a-simulation-result-is-stale-once-its-source-changes's
    own allowance for 'the coarsest safe answer' -- exercised by scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result's
    own concrete 'returns to the cockpit' case -- is the only branch this cockpit can ever take", and
    no "D8" substring remains in the file
- criterion: The staleness spec suite includes a test proving that a return mount for a previously-visited
    slug/version invokes history.markLastRunStale() -- the mechanism that marks the shown result stale
    -- as an assertion distinct from the existing assertion that only the version's query is invalidated.
  met: false
  how: this delivery changed only the two files' header comments, as instructed; authoring a new test
    is a test-author judgment, made in its own pass against this record, not one this implementation record
    may make for it. The test-author pass that followed found the criterion unsatisfiable through this
    hook's own observable behavior without violating the project's own TST-01/TST-03 rules, and recorded
    that in the proof's own `untested` and `contested` fields rather than in this record.
- criterion: The three existing tests in use-case-simulation-cockpit-staleness.spec.ts (first-visit no-invalidate,
    return-visit invalidate, disclosed-limitation empty-history) continue to pass with no change to use-case-simulation-cockpit.ts's
    runtime behavior.
  met: true
  how: no line of executable code changed in either file -- only the comment block above the visitedSimulationRoutes
    mechanism and the file's own top-of-file comment were edited, so the three tests' own assertions are
    exercised against unchanged code, confirmed by the captured suite run
- criterion: The disclosed limitation -- that a genuine route unmount/remount resets the component-scoped
    run history before markLastRunStale has anything left to mark -- stays documented in the file's header
    comment and its own test, unresolved and unclaimed as fixed.
  met: true
  how: the header comment's paragraph on the limitation and the spec file's own limitation paragraph and
    its "disclosed limitation" describe block/test are untouched by this edit
nodes:
- node: rules/investigation/a-simulation-result-is-stale-once-its-source-changes
  encoded_at:
  - src/hooks/use-case-simulation-cockpit.ts
  - src/hooks/use-case-simulation-cockpit-staleness.spec.ts
  how: the rule's own text -- naming no mechanism and permitting "the coarsest safe answer" -- is what
    the delivered mechanism (already in place before this task) exercises by marking every return mount
    stale rather than comparing a hash or updated_at CaseVersionRecord does not carry; this task's own
    change is binding that fact by citing the rule's identity in place of "D8" in both files' header comments.
- node: scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result
  encoded_at:
  - src/hooks/use-case-simulation-cockpit.ts
  - src/hooks/use-case-simulation-cockpit-staleness.spec.ts
  how: the scenario's own "given a shown result, when the curator edits and returns to the cockpit, then
    the shown result is marked stale" is exactly the visitedSimulationRoutes-detected return mount calling
    history.markLastRunStale(), already delivered; this task's own change is citing the scenario's identity
    in both files' header comments in place of "D8".
preserved:
- the return-detection mechanism (visitedSimulationRoutes, a module-level Set keyed slug:version) in src/hooks/use-case-simulation-cockpit.ts
- the unconditional history.markLastRunStale() call on a detected return mount, and the queryClient.invalidateQueries
  call beside it
- the adjoining prose in both files explaining why the mechanism always marks stale (no hash or updated_at
  on CaseVersionRecord to compare against)
- the disclosed-limitation prose and its own test in src/hooks/use-case-simulation-cockpit-staleness.spec.ts
- the three existing tests in use-case-simulation-cockpit-staleness.spec.ts, unmodified
deferred:
- what: the task's own criterion that the staleness spec suite gain a new test proving a return mount
    invokes history.markLastRunStale() as an assertion distinct from the query-invalidation assertion
  why: writing a test is a judgment this framework assigns to a separate producer (test-author) in its
    own pass against this implementation record, never to the implementation pass that writes the source
    it will prove
---

## What it is

An implementation record for task/simulation-staleness-binding/bind-cockpit-staleness-citations-and-proof.
It replaces both files' stale "D8" citation with the two specification nodes now written for the
same fact, and changes no runtime behavior.

## Notes

The one task criterion this record leaves unmet -- adding the proof test -- is a proof-pass
criterion by its own nature; see the proof record's own `contested` entry for why the test-author
judged it unsatisfiable without violating the project's own TST-01/TST-03.
