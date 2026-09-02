---
title: The newer-revision-available marker on a pinned manifest row
summary: RevisionSelect now renders a text-only marker as a sibling of its own Label (not inside it) whenever
  the row's pinned revision is below the highest revision useManifestRowRevisions answered for that hypothesis,
  visible whether the Select stands open or closed and regardless of the row's disabled/released state.
task: sha256:92d9ad9101c9920bc8c903761a6dbbffe51874106358c92da93b1709a8bb2f31
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/manifest-revision-repin-newer-revision-indicator-build-2
files:
- path: src/routes/version-manifest-screen.tsx
  effect: RevisionSelect destructures highestRevision (in addition to revisions and isLoading) from its
    existing useManifestRowRevisions(slug, row.hypothesisName) call, computes hasNewerRevision = highestRevision
    !== undefined && row.revision < highestRevision, and renders a plain, non-interactive <span className="shrink-0
    text-sm text-warning"> reading "Newer revision available" as a sibling of <Label>...</Label> — both
    wrapped in a new flex items-center gap-2 div — shown only when hasNewerRevision is true. The Label's
    own content ({row.hypothesisName} then <Select>) is unchanged, so the label's computed accessible
    name is unaffected by the marker.
criteria:
- criterion: A row pinning revision 1 of a hypothesis whose revisions listing answered a highest revision
    of 2 shows the newer-revision marker.
  met: true
  how: hasNewerRevision evaluates highestRevision !== undefined && row.revision < highestRevision; with
    row.revision = 1 and highestRevision = 2 this is true, so the marker renders beside the Label.
- criterion: A row pinning the highest revision its revisions listing answered shows no marker.
  met: true
  how: When row.revision === highestRevision the comparison is false, so hasNewerRevision is false and
    the conditional marker block does not render.
- criterion: The marker is readable while the row's Select stands closed.
  met: true
  how: The marker is a sibling <span> of the Label/Select pair, not content inside Select's own conditionally-rendered
    dropdown; it sits in the same flex row, always present in the DOM once hasNewerRevision is true, whether
    or not the dropdown is open.
- criterion: The highest revision the marker is decided against is the one the revisions listing answered
    for that row's hypothesis, never the row's own pinned revision alone.
  met: true
  how: hasNewerRevision reads highestRevision from useManifestRowRevisions(slug, row.hypothesisName) and
    compares it against row.revision; it never derives a comparison basis from row.revision alone.
- criterion: A row whose revisions listing has not yet answered shows no marker.
  met: true
  how: While useManifestRowRevisions reports isLoading true, RevisionSelect returns early with a plain
    span, before hasNewerRevision or the marker block are reached. Once answered but highestRevision is
    undefined, hasNewerRevision's own undefined check keeps the marker absent too.
nodes:
- node: rules/knowledge/a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest
  encoded_at:
  - src/routes/version-manifest-screen.tsx
  how: 'hasNewerRevision and the conditional marker are the rule''s own statement: its absence states
    the pin is (as far as the listing answered) the highest, and its presence states a higher revision
    exists — both readable with the Select closed. The rule leaves "which control carries the statement"
    to the interface, so placing the marker as a sibling of the Select''s own Label rather than inside
    it is form, not a departure.'
- node: rules/knowledge/a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis
  encoded_at:
  - src/routes/version-manifest-screen.tsx
  how: The marker is computed independent of the disabled/isReleased flag threaded into RevisionSelect,
    so it renders identically on a draft or a released row; it is a bare span with no onClick, href, or
    role making it a control.
- node: domain/knowledge/manifest-entry
  how: This task adds no new attribute or relationship to manifest-entry's own model.
- node: domain/knowledge/hypothesis-revision
  how: This task adds no new fact to hypothesis-revision's own model; it reuses, unmodified, the existing
    latestRevisionOf reduction.
inferences:
- inferred: The marker's exact copy, "Newer revision available", and its text-warning styling.
  from: Both rules state disclosure must happen but neither states wording or visual treatment; text-warning
    reuses the same semantic color already used in case-detail-screen.tsx.
- inferred: The marker is placed as a sibling of the row's Label, inside a new flex row, rather than inside
    the Label or elsewhere in the Hypothesis cell.
  from: 'Rendering it as a Label descendant was tried first and reverted: @testing-library/dom''s label-text
    computation concatenates the text of every non-labelable-control descendant of a <label>, so a marker
    nested inside the Label corrupted the Select''s own accessible name whenever the marker was present,
    breaking every getByLabelText/findByLabelText lookup in this task''s own spec and the sibling row-revision-select
    spec. Moving the marker to a sibling position after </Label> removes it from that computation entirely.'
preserved:
- RevisionSelect's isLoading early return and its consequence that no Select and no marker render before
  the revisions listing answers.
- The Select's own props, the Label's accessible-name content (unchanged from before this task), and the
  useTriggerAriaLinkage effect.
- optionsWithPinnedRevision's guarantee that the pinned revision always appears as a Select option even
  when absent from the fetched revisions page.
- The revisionErrorMessage alert block, and RowActions/toStatusRow's threading of the single rowsDisabled
  flag into every row.
- version-manifest-screen-newer-revision-marker.spec.ts and version-manifest-screen-revision-select.spec.ts,
  both left untouched; the placement fix addresses their failures through the implementation file alone.
---

## What it is
A text-only "Newer revision available" marker rendered as a sibling of the row's Label/Select pair (not nested inside the Label, which would corrupt its accessible name), shown whenever the pinned revision is below the highest revision useManifestRowRevisions answered for that hypothesis.
It reads independent of the row's disabled/released state and is absent until the revisions listing has actually answered.

## Notes
Per the task's own UNDERDETERMINED notes: the comparison basis is the highest revision the listing answered, which coincides with the hypothesis's true highest only for a first-page (offset 0) read; and the marker is deliberately inert (no onClick/href/role), never itself an adoption control.
First attempt placed the marker inside the Label and broke every getByLabelText/findByLabelText lookup in this file and the sibling row-revision-select spec (label text became "H1Newer revision available"); corrected by moving it to a sibling position.
