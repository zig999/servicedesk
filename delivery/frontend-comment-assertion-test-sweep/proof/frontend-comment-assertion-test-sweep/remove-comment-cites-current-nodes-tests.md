---
title: Comment-assertion tests removed, prior behavioral coverage undisturbed
summary: Cites two pre-existing, unmodified behavioral tests as evidence that deleting the two whole
  files asserting a removed comment's literal prose left the domain facts those comments used to describe
  still proven; this removal-only task authorizes no new test.
implementation: sha256:c40142fed51c8ac63424b5ee3a2a59de2b0e195f140fbc79ef16d904b1f87c1f
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/frontend-comment-assertion-test-sweep-remove-comment-cites-current-nodes-tests-suite
tests:
- file: src/routes/cases-list-screen.spec.ts
  name: renders an explicit 'No version yet' state and a dash for last-updated for a case currently
    holding zero versions, rather than an invented state or timestamp
  proves: This pre-existing, unmodified test continues to run and pass after cases-list-screen-comment-cites-the-current-nodes.spec.ts
    was deleted, showing that the zero-version CaseSummary derivation (domain/knowledge/case-summary,
    rules/knowledge/a-case-summary-is-derived-from-its-existing-versions) that the deleted JSDoc comment
    above `type CaseSummary =` used to cite is still correct -- the removal took away a test of the
    comment's wording, never the only test of the behavior itself.
  fails_when: fetchCaseSummary/CasesListScreen stops rendering "No version yet" and "—" for a case whose
    version count is zero -- e.g. it renders an invented state or a fabricated timestamp instead --
    whether or not this task's removal is what disturbed it.
- file: src/routes/case-simulation-detail-panel.spec.ts
  name: shows the judgment summary line on the default (Evidence) tab, but not once the Prompt tab is
    selected
  proves: This pre-existing, unmodified test continues to run and pass after case-simulation-detail-panel-comment-cites-the-current-nodes.spec.ts
    was deleted, showing that the model/promptVersion/usage/elapsedMs grouping (domain/investigation/evaluation,
    domain/investigation/investigation) the deleted comment's "Criterion 6" paragraph used to describe
    is still correct and still tab-scoped -- the removal took away a test of the comment's wording,
    never the only test of the judgment summary itself.
  fails_when: CaseSimulationDetailPanel stops showing the "Judgment ..." summary line on the default
    Evidence tab, or keeps showing it once the Prompt tab is selected -- whether or not this task's
    removal is what disturbed it.
not_applicable:
- edge_case: Absent or empty input to a newly-introduced code path
  why: This task introduces no production code path and no new input-accepting behavior; it only deletes
    two whole test files. There is no absent/empty-input case for a test to raise.
- edge_case: A boundary at each end of a stated range
  why: No range-bounded behavior is added or changed; the surviving zero-version boundary test cited
    above already covers the one boundary that exists, unmodified.
- edge_case: A duplicate where uniqueness is claimed
  why: No uniqueness rule is added, removed or altered by deleting two comment-assertion test files.
- edge_case: An operation attempted against state that forbids it
  why: No state machine or refusal rule is touched by this deletion.
- edge_case: A dependency that fails or answers slowly
  why: No dependency-facing code changed; nothing here reads a network, a clock or storage differently
    than before.
- edge_case: Two operations against one subject at once
  why: No concurrency-sensitive code changed.
- edge_case: A spec file reduced to holding zero tests
  why: Does not apply here the way it did for an in-place edit -- the two files this task touches are
    removed from the tree entirely rather than emptied, so there is no leftover zero-test spec file
    for the suite's own handling of that case to reach.
untested:
- src/routes/cases-list-screen-comment-cites-the-current-nodes.spec.ts is deleted entirely (all 5 of
  its tests) -- the file no longer exists, so no test can be cited; the deletion itself is verifiable
  only from the tree and the implementation record's own account of it, not from a test.
- src/routes/case-simulation-detail-panel-comment-cites-the-current-nodes.spec.ts is deleted entirely
  -- the file no longer exists, so no test can be cited; the deletion itself is verifiable only from
  the tree and the implementation record's own account of it, not from a test.
- No production source file changes, and no other test file changes -- a claim about which files this
  delivery touched at all, verifiable only against the implementation record's own `files` list and
  a diff of the tree, not by a test written inside a spec file.
- Running the full frontend suite (npm test) after the removals passes, with no remaining test weakened,
  skipped, or rewritten to tolerate comment content the removed tests used to check -- the two tests
  cited above would each individually fail on a regression in the behavior they exercise, but no single
  test establishes that no test anywhere in the suite was weakened, skipped or rewritten; that totality
  rests on the captured suite run at run/frontend-comment-assertion-test-sweep-remove-comment-cites-current-nodes-tests-suite
  and a line-by-line diff review of the tree.
---

## What it is

Proves the frontend comment-assertion test sweep by citing two pre-existing behavioral tests --
one per deleted file's own screen -- that continue to pass unmodified and would fail on a
regression to the behavior the deleted comment used to describe. No new test is written: this
task adds no runtime behavior, and a test scanning test files for comment-prose absence would
recreate the exact convention this task retires.

## Notes

None.
