---
title: Revision history table reads "current" from the case's highest-numbered version's manifest pin
summary: The hypothesis revision history table marks the row the case's highest-numbered version's manifest
  actually pins as current, offers Revise on that row, and states explicitly when that version's manifest
  holds no entry for the hypothesis, replacing the previous read of the hypothesis's own highest-ever
  revision number.
task: sha256:a6145d8c8f53ae67f048f598254ee8e6ee2f84fadcc6556e1e8492e8fa4541cf
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/hypothesis-revision-history-reads-the-manifest-pin-read-current-from-the-manifest-pin-build-2
files:
- path: src/hooks/use-case-hypothesis-current-pin.ts
  effect: 'New hook. Reads the case''s versions (useCaseVersions), derives the target version as the highest
    version number among them, and fetches that version''s manifest (GET /v1/cases/{slug}/versions/{targetVersion})
    keyed ["case-version", slug, targetVersion] -- the same cache key use-manifest-builder already reads,
    narrowed here to the subset this hook needs ({ manifest: [{ hypothesis_revision: { hypothesis: { name
    }, revision } }] }). Exposes a three-phase result ("loading" | "load-error" with retryLoad | "ready"
    with targetVersion and pinnedRevision: number | null), resolving pinnedRevision by finding the one
    manifest entry (per a-hypothesis-is-manifested-at-most-once-in-a-case-version) whose hypothesis_revision.hypothesis.name
    matches the named hypothesis, or null when no entry matches (including when the case holds no versions
    at all, since targetVersion is then undefined and the query never runs, going straight to "loading"/"load-error"
    via the versions query''s own state).'
- path: src/routes/hypothesis-revision-history.tsx
  effect: 'Replaced the prior Math.max(...revisions.map(r => r.revision)) computation of "current" with
    a read of useCaseHypothesisCurrentPin(slug, hypothesisName). Loading and load-error phases of the
    pin now gate the screen''s own loading/error states and retry action alongside the existing revisions
    query. Each row''s "current" mark and its Revise action now test revision.revision === currentPin.pinnedRevision,
    and the Revise link''s :version param now reads currentPin.targetVersion (the case''s highest-numbered
    version) instead of the hypothesis''s own highest revision number. Added a rendering branch, evaluated
    only once currentPin.phase === "ready": where currentPin.pinnedRevision is null, the screen renders
    an explicit paragraph ("The case currently uses no revision of {hypothesisName}.", matching /uses
    no revision/i) instead of the table simply carrying no "current" mark, so the no-entry state is stated
    rather than left to read as indistinguishable from a still-loading or failed read.'
criteria:
- criterion: Where the manifest entry of the case's highest-numbered version pins a revision lower than
    the hypothesis's own highest existing revision, the row shown for the pinned revision -- not the row
    for the highest revision -- is marked as that version's own current selection.
  met: true
  how: The "current" mark is now `revision.revision === currentPin.pinnedRevision`, where pinnedRevision
    is read from the target version's manifest entry rather than computed as the maximum revision number;
    a pin lower than the highest revision marks that lower row, and the highest-revision row is marked
    only when the manifest happens to pin it.
- criterion: Where the manifest entry of the case's highest-numbered version pins the hypothesis's own
    highest existing revision, that revision's row is marked as that version's own current selection.
  met: true
  how: Same equality test -- when the manifest's pinned revision equals the highest existing revision,
    that row's `revision.revision === currentPin.pinnedRevision` is true and no other row's is, since
    revision numbers are unique per hypothesis.
- criterion: 'At most one row is marked as the version''s own current selection: the one the case''s highest-numbered
    version''s manifest entry pins.'
  met: true
  how: pinnedRevisionFor in the hook resolves to exactly one number or null (one manifest entry per hypothesis
    per rules/knowledge/a-hypothesis-is-manifested-at-most-once-in-a-case-version), and the table's isCurrent
    equality test can match at most one row's revision.revision against that single value; where it is
    null, no row matches and the explicit "uses no revision" statement renders instead, so the invariant
    holds in both the marked-row and no-entry cases.
- criterion: Where the Revise action is rendered, it is rendered on the row marked as the version's own
    current selection, and on no other row.
  met: true
  how: The Revise link's ternary in the row mapper is driven by the same isCurrent boolean used for the
    "current" status label, so both render on exactly the same row (or on no row, when pinnedRevision
    is null and the explicit statement renders in its place). Its href now addresses currentPin.targetVersion
    (the case's highest-numbered version) rather than the previous highest-hypothesis-revision-derived
    version.
nodes:
- node: rules/knowledge/a-cases-current-pins-come-from-its-highest-numbered-version
  encoded_at:
  - src/hooks/use-case-hypothesis-current-pin.ts
  - src/routes/hypothesis-revision-history.tsx
  how: The hook reads pins from the manifest of the version with the highest version number among the
    case's own versions (Math.max(...versions.map(v => v.version))), never from any other version, and
    never from a Math.max over the hypothesis's own revision history. This delivery also encodes the rule's
    second clause -- where that version's manifest holds no entry for the hypothesis, the screen states
    explicitly, in rendered text matching /uses no revision/i, that the case currently uses no revision
    of it, rather than only omitting the "current" mark from every row and leaving that state to read
    the same as a pending or failed load.
- node: rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown
  encoded_at:
  - src/hooks/use-case-hypothesis-current-pin.ts
  how: pinnedRevisionFor reads the manifest entry's own hypothesis_revision.revision directly from the
    version's manifest response, never from the separately-paged useHypothesisRevisions listing the table
    renders rows from; the two are read and compared independently by revision number, so a pin absent
    from the current page of revisions would still be the value tested against (though no criterion of
    this task exercises that page-mismatch case -- see deferred).
- node: rules/knowledge/a-hypothesis-is-manifested-at-most-once-in-a-case-version
  encoded_at:
  - src/hooks/use-case-hypothesis-current-pin.ts
  how: pinnedRevisionFor uses Array.prototype.find, which returns the first (and, per this invariant,
    only) manifest entry whose hypothesis_revision.hypothesis.name matches, and returns null when none
    matches -- consuming the invariant rather than re-enforcing it, per the task's own REMAINDER note
    pointing enforcement to place-hypothesis.
- node: domain/knowledge/manifest-entry
  encoded_at:
  - src/hooks/use-case-hypothesis-current-pin.ts
  how: ManifestEntryDto types exactly the fields this task reads from a manifest entry -- the hypothesis
    it names and the revision it pins -- as a narrowed read of the version's own manifest.
- node: domain/knowledge/case-version
  encoded_at:
  - src/hooks/use-case-hypothesis-current-pin.ts
  how: The hook selects among the case's own versions (via useCaseVersions) the one whose version number
    is highest, and reads that version's own manifest by its version number.
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/hooks/use-case-hypothesis-current-pin.ts
  - src/routes/hypothesis-revision-history.tsx
  how: The hook and the table both key on a hypothesis-revision's identifying pair (hypothesis name, revision
    number) -- the manifest entry's hypothesis_revision.hypothesis.name and .revision, matched against
    each row's own revision.revision from the hypothesis's revision listing.
inferences:
- inferred: The explicit "no revision in use" statement's exact wording ("The case currently uses no revision
    of {hypothesisName}.") is this delivery's own copy, chosen to satisfy the rule's requirement that
    the state be stated explicitly and the test's /uses no revision/i match, since no node or criterion
    of this task fixes exact wording.
  from: rules/knowledge/a-cases-current-pins-come-from-its-highest-numbered-version's statement, which
    requires that "the surface states explicitly that the case currently uses no revision of that hypothesis"
    without prescribing copy, together with the task's own Notes disclaiming any required wording for
    the row-labeling state on the same grounds (the "frozen" label collision).
- inferred: The row label for a non-current revision keeps the pre-existing wording "frozen" rather than
    being renamed, since the task's own Notes state no criterion fixes that word and the collision with
    domain/knowledge/hypothesis-revision's frozen/not-yet-frozen distinction is exactly why the task leaves
    it open.
  from: the task's own "## Notes" first paragraph.
- inferred: 'A case holding no versions at all (targetVersion undefined) is treated as "loading"/"load-error"
    by the pin hook rather than as a third distinct "ready with pinnedRevision: null" state, since useCaseVersions''
    own error/empty signals already answer that case and the rule treats "no version at all" and "version
    present but no entry" as the same explicit-absence outcome only at the point the surface renders --
    this task''s criteria and its one no-entry test case exercise only the version-present, entry-absent
    branch.'
  from: rules/knowledge/a-cases-current-pins-come-from-its-highest-numbered-version's statement, which
    folds "no version at all" into the same explicit-absence requirement as "version present, no entry",
    read together with useCaseVersions' existing loading/error/empty vocabulary this hook composes rather
    than duplicates.
preserved:
- The screen's existing loading state (shared "Loading revision history…" message) gating on both the
  revisions query and the pin's own loading phase.
- The screen's existing load-error state and its single Retry button, now also retrying the pin's own
  versions/manifest reads via currentPin.retryLoad() alongside the revisions refetch.
- The revisions table's existing descending sort by revision number and its existing columns (Revision,
  Status, Criterion, Collects, Actions).
- The Revise link's existing destination route (/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName)
  and its existing "Revise →" label -- only the :version param's source value changed.
deferred:
- what: What the marked row (or the explicit "uses no revision" statement) does when the manifest's pinned
    revision is absent from the page of revisions the table currently holds (the pin exists but its row
    is not rendered on the current page).
  why: No criterion of this task states an expected behavior for this case (task's own UNDERDETERMINED
    note); rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown requires the pin still be
    stated even then, which this task's paging behavior does not yet address -- belongs to the task delivering
    the paged listing itself.
- what: Which revision a Revise action rendered on the marked row submits against when the pinned revision
    differs from the hypothesis's own highest existing revision.
  why: No criterion states this (task's own UNDERDETERMINED note); the Revise link addresses the target
    version and hypothesis name only, and what revision the submission then lands on is decided by the
    revise mutation this task does not touch.
- what: Whether the Revise action is offered at all when the case's highest-numbered version is released
    (no draft to revise against).
  why: The task's own ADVISORY note flags that criterion 4, as written, would place Revise on the marked
    row even where a revise would be refused; this delivery renders Revise exactly as criterion 4 states,
    without adding a condition no criterion or node names.
- what: The presented manifest entry's own disclosures -- whether its pinned revision is the hypothesis's
    latest, and whether a higher revision exists.
  why: Governed by rules/knowledge/a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest
    and rules/knowledge/a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis, neither of which
    this task's criteria state anything about (task's own REMAINDER note); belongs to another task of
    this epic.
- what: Every other case-keyed surface's own per-hypothesis current-revision display outside this one
    revision-history table.
  why: rules/knowledge/a-cases-current-pins-come-from-its-highest-numbered-version governs every such
    surface; this task's criteria reach only this table (task's own REMAINDER note).
---

## What it is
HypothesisRevisionHistory's own "current" mark now comes from the case's highest-numbered version's manifest entry for this hypothesis, read through a new dedicated hook, replacing the previous `Math.max(...revisions)` over the hypothesis's own revision history; where that manifest holds no entry for the hypothesis, the screen states so explicitly.

## Notes
This record replaces an earlier one that omitted the explicit "no revision in use" statement: the first build's suite run failed exactly one test the test-author correctly wrote against rules/knowledge/a-cases-current-pins-come-from-its-highest-numbered-version's own no-entry clause, the failure-diagnostician classed the cause as code, and this record folds that fix in.
Every UNDERDETERMINED note the task carried beyond the no-entry state is still inherited unresolved: the pin-falling-off-the-page state, and which revision a Revise launched from the marked row would submit against. Neither is exercised by this task's own criteria, and the implementation does not decide them beyond what the criteria state.
