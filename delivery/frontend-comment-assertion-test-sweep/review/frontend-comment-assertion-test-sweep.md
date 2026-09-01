---
title: Frontend comment-assertion test sweep, first review
summary: Coverage, specification conformance, standard conformance and the whole-change captured run
  over the two frontend test files deleted for asserting a removed production comment's prose.
reviewed:
- src/routes/cases-list-screen-comment-cites-the-current-nodes.spec.ts
- src/routes/case-simulation-detail-panel-comment-cites-the-current-nodes.spec.ts
tasks:
- task/frontend-comment-assertion-test-sweep/remove-comment-cites-current-nodes-tests
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run at run/frontend-comment-assertion-test-sweep passed every step; there was
    no failure to diagnose
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
coverage:
- criterion: frontend/app/src/routes/cases-list-screen-comment-cites-the-current-nodes.spec.ts is deleted
    entirely (all 5 of its tests, which assert the prose of a JSDoc comment that used to precede `type
    CaseSummary = ` in cases-list-screen.tsx and cited domain/knowledge/case-summary and rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
    -- that JSDoc no longer exists in the source).
  state: uncovered
  why: Nothing in the set asserts the absence of that spec file or the absence of the JSDoc above `type
    CaseSummary = ` in cases-list-screen.tsx; reinstating the file with all 5 of its comment-prose tests,
    or restoring the JSDoc, would leave every test in the set passing. The proof cites src/routes/cases-list-screen.spec.ts's
    test of the zero-version rendering the removed comment described, not of the deletion this criterion
    states.
- criterion: frontend/app/src/routes/case-simulation-detail-panel-comment-cites-the-current-nodes.spec.ts
    is deleted entirely (all of its tests reading the prose between the literal markers "Criterion 6"
    and "Criterion 7" that used to sit inside a comment in case-simulation-detail-panel.tsx and cited
    domain/investigation/evaluation and domain/investigation/investigation -- that comment block no
    longer exists in the source).
  state: uncovered
  why: Nothing in the set reads case-simulation-detail-panel.tsx for the "Criterion 6"/"Criterion 7"
    markers or for the absence of that spec file; restoring either would leave every test in the set
    green. The proof cites a test of the rendered judgment line and its tab scoping, the behavior the
    removed comment paragraph described, not the deletion this criterion states.
- criterion: No production source file changes, and no other test file changes.
  state: uncovered
  why: This is a claim about which files the delivery touched, and no test in the set observes the delivery's
    file set. A production source file elsewhere in frontend/app could change, or any other spec file
    could be edited, without either cited test failing. Verifiable from the diff and the implementation
    record's `files` list, which the proof itself states under `untested`.
- criterion: Running the full frontend suite (`npm test`) after the removals passes, with no remaining
    test weakened, skipped, or rewritten to tolerate comment content the removed tests used to check.
  state: uncovered
  why: Whether the whole suite passes is a property of a run, not of any test inside the set, and rests
    on the captured suite run rather than on an assertion. Whether some other test elsewhere was weakened,
    skipped or rewritten reaches every remaining spec file in frontend/app, which the two-file set cannot
    observe.
---

## What it is

The first review of the frontend-comment-assertion-test-sweep delivery: coverage, specification
conformance, standard conformance and the whole-change captured run over the two files this task
deleted.

## Notes

Every coverage entry reads `uncovered` -- not because a test is missing where one belongs, but
because this task's own criteria are almost entirely claims about absence (a test file no longer
existing, a comment block no longer existing, "no other file changed", "the suite passes") that no
test, new or existing, can exercise. The coverage-auditor's own findings say this plainly per
criterion; a person reading this record should weigh that against the diff and the captured run,
not against a coverage figure, since none is computed here. This is the identical shape the prior
backend-comment-assertion-test-sweep review already recorded for the same reason.

The conformance pass and the standard pass both report nothing to read: the two files in this
review's own file set are deletions, hold no surviving content, and state no domain fact and no
rule departure for either pass to find. Neither pass reports this as a clean reading of source --
both say plainly that there was no source left in the file set to read.

The failures pass did not run: the captured run at run/frontend-comment-assertion-test-sweep
passed every step (install, typecheck, lint, style, build, a11y, secret-scan, test), so there was
no failure to diagnose.

The trace check over this target (frontend/app) reports drift, but none of it is caused by this
delivery: the two files this task deleted carried no binding to unbind, and the reported drift is
pre-existing across other frontend and backend files, unrelated to this change. See the report for
the counts and routes.
