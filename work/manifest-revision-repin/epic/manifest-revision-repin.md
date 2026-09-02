---
title: Repinning a manifested hypothesis to another revision
summary: The manifest screen's per-row revision control, the write path that repins
  one manifest entry through the existing place operation, and the disclosure that
  a newer revision of a pinned hypothesis exists.
rationale: 'One epic rather than several — the four tasks answer one curator capability
  over one screen and one hook, and no second grouping would hold a task the others
  do not already reach. The covers slice is the part of the impact set this control
  actually answers to: what a manifest entry pins, what the draft may still compose,
  what the revisions listing answers, and the refusals a compose attempt can meet.
  The impact set''s investigation and revise-flow nodes reached the set through the
  scope''s found-by story rather than through what this control writes, and the six
  that a reviewer would plausibly expect here are answered in uncovered rather than
  dropped silently.'
sources:
- intake/scope.md
covers:
- contracts/system/case-authoring
- contracts/knowledge/case-lifecycle
- contracts/knowledge/case-query
- domain/knowledge/case-version
- domain/knowledge/manifest-entry
- domain/knowledge/hypothesis
- domain/knowledge/hypothesis-revision
- rules/knowledge/a-case-version-is-written-once
- rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
- rules/knowledge/a-hypothesis-position-is-unique-within-its-case
- rules/knowledge/hypotheses-are-ordered-by-precedence
- rules/knowledge/a-hypothesis-revision-number-is-never-reused
- rules/knowledge/validation-runs-at-every-read
- rules/knowledge/a-released-hypothesis-revision-is-never-altered
- rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
- rules/investigation/a-simulation-result-is-stale-once-its-source-changes
- scenarios/knowledge/a-released-version-keeps-its-original-revision
- scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result
- constraints/a-case-is-read-whole
- constraints/listings-are-paged
- constraints/a-malformed-request-is-refused-with-a-validation-error
- rules/knowledge/a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest
- rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown
- rules/knowledge/a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis
- rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
uncovered:
- node: constraints/listings-are-paged
  why: Every task under this epic reads a hypothesis's revisions through the existing,
    already-paged listing hook without changing pagination behavior itself; the paging
    constraint governs the listing operation backend implements, not this repin control.
- node: contracts/system/case-authoring
  why: This epic's tasks implement the finer-grained nodes case-authoring aggregates
    — manifest-entry, hypothesis-revision, case-version, and the two disclosure rules —
    and none of them answers to the system contract's own text directly.
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  why: Assigning a revision number happens only where a revision is created, in the
    revise-hypothesis operation this plan leaves unchanged; no task here creates a
    revision.
- node: rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
  why: This plan's tasks consume the hypothesis-revisions listing's answer; proving
    its answer order is delivered by the task implementing list-hypothesis-revisions
    itself, outside this epic.
- node: rules/knowledge/validation-runs-at-every-read
  why: No task under this epic performs a case-version read; the revisions listing
    and the manifest re-read this plan's tasks perform are not the validated case-version
    read this rule governs.
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  why: The control adopts an existing revision into a draft's manifest entry and never
    writes a revision's own content, so nothing it does can alter a revision a released
    version references.
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  why: Creating a revision is the revise flow, which the scope states stays unchanged;
    this plan only adopts revisions that already exist.
- node: scenarios/knowledge/a-released-version-keeps-its-original-revision
  why: Its then-clause asserts what reading an already-released version answers, which
    no part of this control writes; the repin appears only in its given-clause, as
    the draft-side edit the covered nodes already carry.
- node: rules/investigation/a-simulation-result-is-stale-once-its-source-changes
  why: The staleness mechanism already in the tree marks a shown run stale on returning
    to the cockpit, keyed on the return rather than on which of the version's screens
    the edit happened on, so a repin is already inside it and this plan changes no
    part of the cockpit.
- node: scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result
  why: Same mechanism, and the scenario's one moment is the return to the cockpit,
    which this plan leaves untouched.
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  why: It binds what a route answers a malformed request, and this plan writes no
    route — the manifest PUT and its declared body shape already stand.
---

## What it is
The slice of the specification a curator's repin of an already-manifested hypothesis answers to, and the four deliveries that make it reachable from the manifest screen.
It holds what a manifest entry pins, the freedom a draft version's manifest still has, the listing a hypothesis's revisions are read from, and the refusals a compose attempt against a non-draft version meets.

## Notes
The revisions listing is a paged answer, so what the control offers is bounded by what that listing answered rather than by everything the hypothesis holds.
The revisions query key is shared with the hypothesis-revision form on another screen, so anything this control writes into that cache entry is visible there too.
