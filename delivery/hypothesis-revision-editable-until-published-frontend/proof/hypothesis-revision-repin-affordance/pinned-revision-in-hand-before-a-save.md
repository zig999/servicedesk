---
title: Proof for the draft manifest entry's pinned revision on the hypothesis-editing form
summary: What proves task/hypothesis-revision-repin-affordance/pinned-revision-in-hand-before-a-save,
  written against its implementation record.
implementation: sha256:6d6e3f7ef2ababf8e548dae0507181a97896f968846a6131facda91bcb182f21
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/hypothesis-revision-repin-affordance-pinned-revision-in-hand-before-a-save-suite-3
tests:
- file: src/hooks/use-hypothesis-revision-form-pinned-revision.spec.ts
  name: "useHypothesisRevisionForm — the draft's pinned revision for the hypothesis being revised (criterion
    1) > reports the revision number the draft's own manifest entry pins for that hypothesis"
  proves: With a draft case version whose manifest entry for the hypothesis being revised pins revision
    2, the form reports 2 as that hypothesis's pinned revision.
  fails_when: pinnedRevisionFor stops matching the manifest entry by hypothesis name, or the ready phase
    stops exposing its revision as pinnedRevision.
- file: src/hooks/use-hypothesis-revision-form-pinned-revision.spec.ts
  name: "useHypothesisRevisionForm — no manifest entry for the hypothesis being revised (criterion 2) >
    reports null rather than a number when the manifest holds entries for other hypotheses only"
  proves: Where the hypothesis being revised has no entry in that draft case version's manifest, the form
    reports no pinned revision for it rather than a number.
  fails_when: pinnedRevisionFor returns a number (for example the entry belonging to a different hypothesis)
    instead of null when no manifest entry names the hypothesis being revised.
- file: src/hooks/use-hypothesis-revision-form-pinned-revision.spec.ts
  name: "useHypothesisRevisionForm — no manifest entry for the hypothesis being revised (criterion 2) >
    also reports null when the draft's manifest holds no entries at all"
  proves: Where the hypothesis being revised has no entry in that draft case version's manifest, the form
    reports no pinned revision for it rather than a number -- the edge of that criterion where the manifest
    is empty rather than merely lacking a matching entry.
  fails_when: pinnedRevisionFor throws or returns anything but null when manifest is an empty array.
- file: src/hooks/use-hypothesis-revision-form-pinned-revision.spec.ts
  name: "useHypothesisRevisionForm — a hypothesis identity that does not exist yet (criterion 3) > reports
    no pinned revision when opened for a hypothesis not yet created"
  proves: Where the screen is opened for a hypothesis identity that does not exist yet, the form reports
    no pinned revision.
  fails_when: pinnedRevisionFor consults the manifest instead of short-circuiting to null when hypothesisName
    is null, and returns a number for a manifest entry that happens to exist for some other hypothesis
    name.
- file: src/hooks/use-hypothesis-revision-form-pinned-revision.spec.ts
  name: "useHypothesisRevisionForm — a pin the answered revisions page does not carry (criterion 4) > still
    reports the manifest's own pinned number even though the paged revisions list never carries it"
  proves: Where the draft's manifest entry pins a revision number that the answered page of that hypothesis's
    revisions does not carry, the form still reports that pinned revision number.
  fails_when: pinnedRevision is derived from or filtered against revisionsQuery's paged data instead of
    read straight off the manifest entry, so a pin outside the loaded page would be dropped or altered.
- file: src/hooks/use-hypothesis-revision-form-pinned-revision.spec.ts
  name: "useHypothesisRevisionForm — no path beyond what opening the screen already requested (criterion
    5) > computes the pinned revision from the same request set the screen already issues, requesting
    nothing further"
  proves: Opening the screen requests no path it does not request today.
  fails_when: A new request path appears in requestedGetUrls beyond the version, revisions and three glossary
    paths already issued today, or the version path is fetched more than once.
- file: src/hooks/use-hypothesis-revision-form-pinned-revision.spec.ts
  name: "useHypothesisRevisionForm — the case-version read failing (criterion 6) > reports the load-error
    phase, carrying no pinned revision, rather than any state carrying one"
  proves: Where the case-version read fails, the form reports its existing load-error state rather than
    any state carrying a pinned revision.
  fails_when: The hook resolves to the ready phase (or any phase exposing a pinnedRevision field) instead
    of load-error when the version fetch throws, or the load-error phase gains a pinnedRevision field.
not_applicable:
- edge_case: The manifest holding two entries naming the same hypothesis.
  why: rules/knowledge/a-hypothesis-is-manifested-at-most-once-in-a-case-version rules this state out for
    every manifest this form reads; a test constructing it would assert behavior over a shape the domain
    never produces, and the implementation record already notes pinnedRevisionFor's find() relies on that
    invariant rather than enforcing it.
- edge_case: The case's own draft resolution (no draft in state, or more than one).
  why: The task's own Notes mark this UNDERDETERMINED and outside its candidate set -- the screen is reached
    only through routes already scoped to the case's current draft, so this read-only form is never exercised
    against a case holding zero drafts; a test here would exercise a guarantee a different epic's task
    already carries.
untested:
- Whether hypothesis-revision-screen.tsx renders pinnedRevision anywhere, since the implementation record's
  own deferred entry states that rendering and the repin comparison are the sibling task's objective, not
  this one's.
---

## What it is
Seven Vitest cases in use-hypothesis-revision-form-pinned-revision.spec.ts, one per criterion the task
states, each rendering useHypothesisRevisionForm against a stubbed fetch and asserting pinnedRevision (or
its absence) in the phase the hook settles into. use-hypothesis-revision-form.test-support.ts supplies the
shared fixtures -- caseVersionResponse, manifestEntry, revisionsPage, the fetch stub and the ready/load-error
phase narrowing -- kept in this task's own new file rather than folded into the existing suite's support
module, since none of its existing fixtures modeled a manifest.

## Notes
The suite this proof ran under (run/hypothesis-revision-repin-affordance-pinned-revision-in-hand-before-a-save-suite-3)
followed two unrelated fixes landed on main after this task's implementation was written and merged into
this branch before this run: hypothesis-revision-screen.test-support.ts's mocked case-version response now
includes manifest: [], and the two case-simulation-detail spec files assert the corrected "tokens in / tokens
out" wording. Neither fix touches a file this task's tests exercise or a criterion this record answers.
A single unrelated failure (use-connector-configuration-detail-validity.spec.ts, criterion 1) appeared in
one full-suite run of the eight-step registry and did not reproduce either running that file alone or running
the whole suite again immediately after; it is a pre-existing flake in a file this task's implementation
and tests never touch, not a regression this delivery introduced, and the recorded run (suite-3) is a run
where every step, including npm test, passed.
