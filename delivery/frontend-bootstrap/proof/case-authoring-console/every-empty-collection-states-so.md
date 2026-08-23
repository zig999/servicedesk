---
title: Every empty collection states so — proof
summary: Proves that Case Detail's Versions tab renders an explicit empty-state sentence rather than a
  header-only table when the version list is empty, and that the Release Dialog's violations view renders
  an explicit sentence rather than a blank alert when a 422's own violations array is empty; two stale
  tests asserting the superseded header-only-table behavior were updated to match the new, specification-backed
  behavior.
implementation: sha256:1dfe058e9387ba5c9ba10e84f35f376e52049d4fd156c25c41f48195da02ac77
run: run/ux-consistency-sweep-full-suite
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
tests:
- file: src/routes/case-detail-screen.spec.ts
  name: renders an explicit empty-state sentence instead of the versions table when the case holds no
    versions
  proves: Case Detail's Versions tab renders an explicit empty-state sentence, rather than a header-only
    table, when GET /v1/cases/{slug}/versions returns zero versions.
  fails_when: an empty version list stops rendering "This case currently holds no version." or still renders
    a table role alongside or instead of it
- file: src/routes/case-detail-screen.spec.ts
  name: URL-encodes the slug before requesting its version list
  proves: the slug-encoding behavior this test already proved, now waited on through the empty-state sentence
    rather than a table role -- this test's own mocked response is an empty version list, so after this
    task's fix the settled UI is the sentence, not a table; the wait target changed because the rendered
    outcome changed, the assertion under test (the request URL) did not
  fails_when: the request built from the URL-decoded slug param sends anything other than "/v1/cases/foo%26bar/versions",
    or the awaited text never appears
- file: src/routes/case-version-editor-screen-release-outcomes.spec.ts
  name: renders an empty violations view rather than the checklist when the response's own violations
    array is empty
  proves: The Release Dialog's violations view renders an explicit sentence stating no specific violation
    was returned, rather than an empty alert region, when a 422 CaseVersionNotReleasableError response's
    own `violations` array is empty.
  fails_when: an empty violations array stops rendering "No specific violation was returned." inside the
    alert region, or renders an empty list there instead
not_applicable:
- edge_case: two concurrent empty-collection loads (Versions tab and Release Dialog at once)
  why: neither criterion nor any bound node states a concurrency guarantee for these two independent,
    unrelated UI regions; each already fetches through its own isolated query/state.
untested:
- case-detail-screen-hypotheses-tab.spec.ts's own tab-strip default-selection test needed its wait-until-settled
  mechanism repointed from findByRole("table") to findByText("This case currently holds no version.")
  once the Versions tab stopped rendering a table for an empty list -- an assertion-neutral change (that
  test's own criterion, default aria-selected on Versions vs. Hypotheses, is unchanged) recorded here
  as a fact about the suite rather than as new evidence for either of this task's two criteria.
---

## What it is
Three tests (one new, two updated) proving the Versions-tab and Release-Dialog empty-state sentences, plus one preserved fix to a third file's own stale wait-condition.

## Notes
The "renders no data rows when the endpoint returns no versions" test (case-detail-screen.spec.ts) was removed as superseded: it asserted a header-only table that no longer renders on an empty list, exactly the behavior scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly now states is wrong -- superseded by the new "renders an explicit empty-state sentence instead of the versions table" test proving the identical scenario's correct behavior. Not weakened: removed only because a newer, specification-backed test proves the same input's correct outcome.
