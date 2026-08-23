---
title: Empty Versions list and empty violations list each render an explicit sentence
summary: Case Detail's Versions tab and the Release Dialog's violations view each gain an explicit empty-state
  branch, matching CaseHypothesesTab's existing pattern, so an empty collection is never rendered as a
  blank table or alert -- without suppressing the "New draft" link a different, already-delivered task's
  own criterion requires.
task: sha256:7886bbbfb9540fc8ff650877d14bb60e9d447f4b62be68c2055259e636de9506
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/ux-consistency-sweep-full-suite
files:
- path: src/routes/case-detail-screen.tsx
  effect: VersionsPanel's success-path return computes rows and hasDraft unconditionally (no early return
    on an empty list), so "New draft" still renders whenever none of the case's versions is in draft state
    -- including when the list is empty. The body renders the explicit sentence "This case currently holds
    no version." in place of the StatusTable specifically (no table role element at all) exactly when
    rows.length is zero, leaving the surrounding Link and fragment structure otherwise unchanged.
- path: src/routes/case-version-editor-ready-view.tsx
  effect: The violations-kind Release Dialog branch renders "No specific violation was returned." inside
    the existing role="alert" div when release.dialog.violations.length === 0, instead of an empty <ul>;
    the non-empty case's <ul>/<li> mapping is preserved exactly, only now reached conditionally.
criteria:
- criterion: Case Detail's Versions tab renders an explicit empty-state sentence, rather than a header-only
    table, when GET /v1/cases/{slug}/versions returns zero versions.
  met: true
  how: VersionsPanel (src/routes/case-detail-screen.tsx) renders "This case currently holds no version."
    in place of the StatusTable whenever rows.length === 0 -- no table role element renders at all in
    that case, and "New draft" still renders alongside it since hasDraft is computed unconditionally.
- criterion: The Release Dialog's violations view renders an explicit sentence stating no specific violation
    was returned, rather than an empty alert region, when a 422 CaseVersionNotReleasableError response's
    own `violations` array is empty.
  met: true
  how: src/routes/case-version-editor-ready-view.tsx's role="alert" region renders "No specific violation
    was returned." when release.dialog.violations.length === 0, and only the populated <ul> of violations
    otherwise.
nodes:
- node: scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly
  encoded_at:
  - src/routes/case-detail-screen.tsx
  how: The scenario requires that listing a case's versions when it currently holds none -- whether it
    never held one or its only draft was discarded -- states that explicitly rather than rendering an
    empty listing with nothing said about why. VersionsPanel's success path renders "This case currently
    holds no version." whenever the fetched data.data array is empty, with no branch distinguishing why
    it is empty (the list-case-versions response itself carries no such distinction), so both cases are
    told the identical explicit sentence.
- node: rules/knowledge/a-release-refusal-with-no-named-violation-says-so
  encoded_at:
  - src/routes/case-version-editor-ready-view.tsx
  how: The rule requires an explicit statement rather than a bare, unexplained empty refusal when release
    finds nothing specifically violated. case-version-editor-ready-view.tsx's role="alert" region renders
    "No specific violation was returned." when the 422's own violations array is empty.
preserved:
- VersionsPanel's loading state ("Loading version timeline…") and its error state ("Unable to load this
  case's version timeline." plus the Retry button calling refetch()) are untouched.
- '"New draft" still renders exactly when none of the fetched versions is in draft state (hasDraft, computed
  from data.data unchanged), and still links to "/cases/$slug/versions/new" with the same params -- this
  is task/version-editor/new-draft-creation''s own criterion, preserved rather than regressed by this
  task''s own fix.'
- A non-empty version list still renders through the same toRow/CASE_VERSIONS_COLUMNS/StatusTable path,
  unchanged in columns, row shape and the "Continue editing" per-draft-row Link.
- 'case-detail-screen-hypotheses-tab.spec.ts''s tab-strip default-selection test keeps passing once the
  Versions tab renders an empty-state sentence instead of a header-only table for a zero-length version
  list -- its wait-until-settled mechanism was repointed from findByRole("table") to findByText("This
  case currently holds no version."), an assertion-neutral change: the test''s own criterion (default
  aria-selected on Versions vs. Hypotheses) is unchanged, and no new behavior is claimed.'
---

## What it is
The correction named by four standing API-04 findings (one location restated three times, one distinct second location): cases-list-and-detail-onda-2.md, version-editor-onda-3.md, manifest-hypothesis-authoring-onda-4.md, version-editor-onda-5.md.
Two facts the specification did not state were decided by their own unstated-fact-decider, each blind to this task: what a curator reads when a case's own version listing is empty (scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly), and what a curator reads when a release refusal names no specific violation (rules/knowledge/a-release-refusal-with-no-named-violation-says-so). Both disclosed in decision-log.md.

## Notes
Case Detail's own Hypotheses tab (CaseHypothesesTab, same file) already implements this exact empty-state pattern correctly and is this task's own reference.
A first delivery attempt suppressed the "New draft" link entirely on an empty list, regressing a different, already-delivered task's own criterion (task/version-editor/new-draft-creation) -- caught by three pre-existing tests going red, corrected before this record was written. No test was weakened to force the suite green: the two stale tests this fix legitimately superseded (one asserting a header-only table that no longer renders, one incidentally waiting on that table before checking an unrelated URL-encoding assertion) were updated to match the new, specification-backed behavior, disclosed in the proof record rather than silently dropped.
