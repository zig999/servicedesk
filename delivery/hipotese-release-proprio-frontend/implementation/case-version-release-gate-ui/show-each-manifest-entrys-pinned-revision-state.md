---
title: Show each manifest entry's pinned revision state on both manifest-presentation surfaces
summary: The version-manifest screen and the case-version editor's ready-view manifest table both now state, per entry, the draft-or-released state of the hypothesis-revision that entry pins, read from the hypothesis-revisions listing endpoint rather than from the case version's own state; the release checklist's collects check was also hardened against a manifest entry missing that field, a pre-existing defect this task's own test surfaced.
task: sha256:af15761df460771752836b169ad570d39bf85d0600ca1785a3600e8fa0ea9ebc
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/case-version-release-gate-ui-show-each-manifest-entrys-pinned-revision-state-build-2
files:
- path: src/hooks/use-hypothesis-revisions.ts
  effect: Exports a new HYPOTHESIS_REVISION_STATE_CELL constant -- a Record<HypothesisRevisionState, {color, label}> lookup ("draft" -> warning/"Draft", "released" -> success/"Released") -- reusing the same {color, label} StatusTable status-cell convention and the same visual tokens (bg-warning/bg-success) already used by hypothesis-revision-history.tsx's own local copy, so both manifest-presentation surfaces this task touches share one lookup instead of each inventing its own.
- path: src/hooks/use-manifest-pinned-revision-states.ts
  effect: New hook. Given a slug and a case version's manifest, batch-fetches each distinct hypothesis's revisions through the existing hypothesisRevisionsQueryOptions (the same query the listing screen and case-hypotheses-tab.tsx already use, via useQueries -- the established per-row-supplementary-data pattern already proven in case-hypotheses-tab.tsx), and answers a ReadonlyMap from each manifest entry's position to its pinned hypothesis-revision's own state, read by matching the entry's pinned revision number against the answered listing rather than against the case version's own state.
- path: src/routes/version-manifest-screen.tsx
  effect: RevisionSelect (rendered once per manifest row, in the draft-manifest builder) now also finds the pinned revision's own state from the same revisions array useManifestRowRevisions already fetches for that row, and renders a small colored-dot-plus-label badge (via HYPOTHESIS_REVISION_STATE_CELL) beside the existing Select trigger and "Newer revision available" marker, visible whether or not the Select is open and regardless of whether the version itself is draft or released.
- path: src/routes/case-version-editor-ready-view.tsx
  effect: Extracts the released-version's manifest table into a new ManifestTable subcomponent (mounted only inside the existing isReadOnly branch, so its data-fetching hook is never invoked while editing a draft), which calls useManifestPinnedRevisionStates and adds a new "State" column rendering each entry's pinned-revision state through the same HYPOTHESIS_REVISION_STATE_CELL lookup -- StatusTable renders the {color, label} value as the existing status-cell badge automatically. Every previously-shown field (position, hypothesis, revision, criterion) and the existing empty-manifest sentence are unchanged.
- path: src/services/release-checklist.ts
  effect: buildReleaseChecklist's conceptsAcceptSubject computation now reads entry.hypothesis_revision.collects into a local binding and checks Array.isArray on it before calling .every, treating a manifest entry whose hypothesis_revision carries no collects array as not satisfying that checklist item (returns false for that entry) instead of throwing "Cannot read properties of undefined (reading 'every')".
criteria:
- criterion: Every manifest entry any screen presenting a case version's manifest renders — the version-manifest screen and the case version editor's ready-view manifest table alike — states its pinned hypothesis-revision's own state, draft or released.
  met: true
  how: version-manifest-screen.tsx's RevisionSelect renders the state badge per row, and case-version-editor-ready-view.tsx's ManifestTable renders a new State column per row -- both sourced from the hypothesis-revisions listing's own state field, matched by the entry's pinned revision number.
- criterion: That statement is shown whatever the case version's own state is, draft or released.
  met: true
  how: version-manifest-screen.tsx renders the badge regardless of state.isReleased (only interactivity is disabled, not visibility, following the existing rowsDisabled pattern already in this file). The ready-view's manifest table is, by this codebase's own pre-existing design, only ever shown at all once the version is released (confirmed by case-version-editor-screen-view-released.spec.ts's own "the manifest listing's own scope" test) -- a scope this task does not alter -- so between the two named surfaces the fact is shown in both a draft version's manifest (via the builder) and a released version's manifest (via the ready-view).
- criterion: That statement is shown without the curator having to open the entry's revision selector.
  met: true
  how: In version-manifest-screen.tsx the badge is a sibling of the Select trigger, not inside its listbox, so it is visible with the Select closed. The ready-view's table renders the state as a plain cell with no selector at all.
- criterion: An entry pinning a revision in released state states released and an entry pinning one in draft state states draft.
  met: true
  how: HYPOTHESIS_REVISION_STATE_CELL maps "released" to the label "Released" and "draft" to "Draft", the same two-state mapping already established for this exact fact in hypothesis-revision-history.tsx, applied to whichever value the hypothesis-revisions listing answered for the pinned revision.
- criterion: The pinned revision number, and every other field the entry already showed, are unchanged.
  met: true
  how: version-manifest-screen.tsx's Select value, options and the pre-existing "Newer revision available" marker are untouched; case-version-editor-ready-view.tsx's toManifestRow still emits position, hypothesis, revision and criterion exactly as before, with "state" added as a new field/column rather than replacing or altering any existing one.
nodes:
- node: rules/knowledge/a-presented-manifest-entry-states-its-pinned-revisions-state
  encoded_at:
  - src/hooks/use-hypothesis-revisions.ts
  - src/hooks/use-manifest-pinned-revision-states.ts
  - src/routes/version-manifest-screen.tsx
  - src/routes/case-version-editor-ready-view.tsx
  how: The rule requires every presented manifest entry to state its pinned hypothesis-revision's own state, read from that revision itself, unconditionally. use-manifest-pinned-revision-states.ts reads the state from the hypothesis-revisions listing (the revision's own aggregate, never the case version's state) by matching the entry's pinned revision number; version-manifest-screen.tsx and case-version-editor-ready-view.tsx both render that state for every entry they present, independent of the case version's own state, an attempted release, or whether a selector is open.
inferences:
- inferred: When the pinned revision is absent from the hypothesis-revisions listing the app obtained (a fetch still pending, a fetch that errored, or an edge case where the answered page omits the exact pinned revision), no state badge is shown for that entry rather than a placeholder or a stale guess.
  from: The rule's own consistency is stated as "eventual" rather than immediate, and this codebase already accepts the identical limitation for the adjacent "Newer revision available" marker built from the same data source (version-manifest-screen-newer-revision-marker.spec.ts and version-manifest-screen-revision-select.spec.ts both carry tests marked "UNDERDETERMINED, from the specification" for exactly this shape of gap), so the same acceptance is extended here rather than inventing a new fallback the specification does not state.
- inferred: The state badge's label wording ("Draft"/"Released") and its color tokens (bg-warning/bg-success) reuse the exact convention hypothesis-revision-history.tsx already established for this same fact on the adjacent revisions listing, rather than inventing new wording or new tokens.
  from: The specification rule itself says "Which control carries the statement, and its wording, are form and belong to the interface, not here" -- leaving wording to the interface -- and the inventory's must_not_duplicate section already flags the StatusTable status-cell {color,label} convention as the one to reuse.
- inferred: The ready-view's manifest table fetches each entry's pinned-revision state through a new batch hook (useManifestPinnedRevisionStates, one useQueries call per unique hypothesis) rather than adding a state field to the backend's read-case response, and that hook's mount is confined to a new ManifestTable subcomponent nested inside the pre-existing isReadOnly branch.
  from: The target source root for this task is frontend/app only, with no backend change authorized by this task, and CaseVersionEditorReadyView is also mounted for a draft version's own record (whose test fixture's manifest entries carry no hypothesis_revision.hypothesis field at all) -- calling the new hook unconditionally at that component's own top level would have read that missing field and thrown on every already-passing draft-phase test. Confining the hook to a component mounted only when isReadOnly is true keeps the existing rules of hooks intact and avoids that regression, following the same useQueries-per-row pattern already proven safe (including its unmocked-fetch error path) in case-hypotheses-tab.tsx.
- inferred: buildReleaseChecklist's "every collected concept accepts the case subject" check treats a manifest entry whose hypothesis_revision carries no collects array as not satisfying that checklist item (the whole check answers false) rather than throwing or vacuously answering true for that entry.
  from: The coordinator's failure-diagnostician traced a reproducible crash (Cannot read properties of undefined (reading 'every')) to this unguarded access, surfaced by this task's own test-author against a draft-version fixture whose manifest entry carries no hypothesis_revision.collects field, and asked for the entry to be "treated as not satisfying the checklist rather than throwing" -- the specification does not state what an entry with no declared collects should mean for this checklist item, so "not satisfying" (rather than vacuously satisfying) was chosen as the reading consistent with the checklist's own purpose of gating release on every entry's collects being subject-accepting, disclosed here as this task's own inference rather than left silent.
preserved:
- version-manifest-screen.tsx's existing Select behavior, options, disabled/loading states, and the pre-existing "Newer revision available" marker and its own tests.
- case-version-editor-ready-view.tsx's existing manifest table content (position, hypothesis, revision, criterion), its empty-manifest sentence, and its scoping to isReadOnly only.
- use-hypothesis-revisions.ts's existing HypothesisRevisionListItem type and hypothesisRevisionsQueryOptions/useHypothesisRevisions hooks, consumed unchanged by hypothesis-revision-history.tsx and case-hypotheses-tab.tsx.
- release-checklist.ts's existing checklist item labels, its fallbackTermsExist computation, and extractReleaseViolations, none of which were touched beyond the one unguarded access.
---
## What it is

One more fact rendered per manifest row on both presentation surfaces, read from the same revision-state data the listing screen already reads and matched by pinned revision number.
It changes nothing about what placement or release do; it only tells the curator, on the manifest itself, what a refused release would otherwise be the only way to learn.
A pre-existing unguarded property access in the release checklist, surfaced by this task's own test, was hardened.

## Notes

The first build attempt (run/case-version-release-gate-ui-show-each-manifest-entrys-pinned-revision-state-build) passed clean, but the first suite attempt's test step failed on two findings: a real, reproducible defect in src/services/release-checklist.ts (an unguarded `.every()` call on `hypothesis_revision.collects`, surfaced by this task's own test against a malformed fixture), and an unrelated one-off flake in src/hooks/use-capability-detail.spec.ts that did not reproduce on rerun (confirmed via three standalone runs plus a full-suite rerun) and is not a regression this delivery caused. The release-checklist.ts defect was fixed and this record was rewritten whole to include it.
