---
title: Confirm manifest placement stays free of a revision's own state
summary: Verified that the manifest composition surface never reads a hypothesis-revision's own draft/released state as a gate on offering, choosing, removing or repinning a manifest entry, and made no source edit because none was needed.
task: sha256:c84002b3c5c0b21cbdf31a4ce4240da41805dacdbd4e900400c381fa25a7334c
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/case-version-release-gate-ui-keep-placement-free-of-a-revisions-own-state-build
files:
- path: src/routes/version-manifest-screen.tsx
  effect: RevisionSelect's optionsWithPinnedRevision maps every item useManifestRowRevisions answers into a Select option with no filter on state, and repinIfChanged calls row.onRepin for any chosen revision without checking its own state; RowActions' remove and move buttons derive their disabled state only from row.isOnlyEntry and the row-level disabled prop (driven by the case version's own blocked/busy/released condition), never from the entry's referenced revision's own state; pinnedRevisionState is read only to render the informational HYPOTHESIS_REVISION_STATE_CELL badge beside the Select, never to gate anything.
- path: src/hooks/use-manifest-builder.ts
  effect: repinTo and moveTo both call placeMutation.mutate unconditionally for whatever revision or position is supplied, and removeMutation.mutate is called unconditionally by onRemove; neither reads or inspects a referenced hypothesis-revision's own state, so no manifest-entry mutation is pre-empted client-side by that state.
- path: src/hooks/use-manifest-row-revisions.ts
  effect: useManifestRowRevisions exposes every revision the hypothesis-revisions listing hook answers (revisionsQuery.data?.data ?? []) unfiltered, so the revision selector on the manifest composition surface receives draft and released revisions alike.
- path: src/hooks/use-hypothesis-revisions.ts
  effect: HypothesisRevisionListItem's state field and HYPOTHESIS_REVISION_STATE_CELL lookup (added by the prior sibling task) are consumed by the manifest surface only for display, never imported into any gating condition on this surface.
criteria:
- criterion: A manifest row's revision selector offers every revision the listing answers, including those whose own state is draft.
  met: true
  how: optionsWithPinnedRevision (version-manifest-screen.tsx) builds one Select option per item in the revisions array useManifestRowRevisions returns, with no filter, exclusion or disabling based on the item's state; a draft revision appears as an option exactly like a released one.
- criterion: Choosing a revision whose own state is draft issues the place request rather than being stopped before it.
  met: true
  how: 'repinIfChanged (version-manifest-screen.tsx) calls row.onRepin(chosenRevision) whenever the chosen value differs from the currently pinned one, with no branch reading the chosen revision''s own state; row.onRepin resolves to use-manifest-builder.ts''s repinTo, which calls placeMutation.mutate({ hypothesisName, revision: chosenRevision, position: entry.position, kind: "repin" }) unconditionally, issuing the PUT to the existing place-hypothesis endpoint.'
- criterion: A manifest entry pinning a revision in draft state offers the same removal and repin controls as one pinning a revision in released state — a difference in the entry's own disclosed state is never read as a difference in what the curator may do with the entry.
  met: true
  how: RowActions' Remove button's disabled attribute is row.isOnlyEntry || disabled, and RevisionSelect's Select disabled attribute is the same shared disabled prop passed down from VersionManifestScreen's rowsDisabled (state.isBlocked || state.isBusy || state.isReleased -- all facts of the case version, never of the entry's referenced revision); pinnedRevisionState is read only to choose which HYPOTHESIS_REVISION_STATE_CELL badge to render beside the Select and is never consulted by either disabled computation.
- criterion: Removing a manifest entry is offered on the same terms whatever the referenced revision's own state is.
  met: true
  how: row.onRemove calls removeMutation.mutate({ hypothesisName }) with no reference to the entry's pinned revision or that revision's state, and RowActions' removeDisabled computation (row.isOnlyEntry || disabled) reads nothing about the referenced revision's own state either.
- criterion: The passing case here is only that this frontend does not itself refuse the placement; whether the request is accepted is the server's answer and is not asserted by this task.
  met: true
  how: No code on this surface short-circuits a repin or remove based on a revision's own draft/released state before the request is sent; the mutations' onError handlers only branch on errors the server actually returns (case-version-not-draft, manifest-position-occupied, or a generic failure), none of which are raised client-side from a revision's own state, and none of this task's source treats server acceptance as its own concern.
nodes:
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  encoded_at:
  - src/routes/version-manifest-screen.tsx
  - src/hooks/use-manifest-builder.ts
  - src/hooks/use-manifest-row-revisions.ts
  how: The rule states place-hypothesis is never refused by it, whatever state the referenced revision is in, reserving the state-based refusal for release alone. This frontend realizes that boundary by never reading a hypothesis-revision's own state anywhere in the placement/repin/removal code paths of the manifest composition surface -- the state field this rule's companion release-gate task reads is confined to that task's own release-refusal surfacing, and the display badge a sibling task added on this same surface is read-only, never a gate.
- node: scenarios/knowledge/placing-a-manifest-entry-is-never-refused-for-a-drafts-revision-state
  encoded_at:
  - src/routes/version-manifest-screen.tsx
  - src/hooks/use-manifest-builder.ts
  how: The scenario's then-clauses (place-hypothesis succeeds, the manifest holds the entry, the referenced revision's own state stays draft, unaffected) hold because repinTo/placeMutation issues the PUT for any revision number the curator picks from the unfiltered option list, and no code in this surface ever writes to or otherwise touches a hypothesis-revision's own state field -- the frontend has no code path capable of altering it from here.
inferences:
- inferred: No production source edit was required to satisfy this task's criteria.
  from: Tracing every consumer of a hypothesis-revision's own state field reachable from the manifest composition surface (version-manifest-screen.tsx's RevisionSelect and RowActions, use-manifest-builder.ts's placeMutation/removeMutation, use-manifest-row-revisions.ts) shows the field is read in exactly one place on this surface -- the informational badge the prior sibling task (case-version-release-gate-ui/show-each-manifest-entrys-pinned-revision-state) added -- and nowhere used to filter an option, disable a control, or block a mutation; the task's own "What it is" note anticipates exactly this outcome ("unchanged in what they offer... the one thing this task delivers is that nothing came to read that field as a gate").
preserved:
- version-manifest-screen.tsx's existing Select options, repin/move/remove behavior, disabled-state computation (rowsDisabled), and the pinned-revision-state display badge from the prior sibling task -- all untouched.
- use-manifest-builder.ts's existing placeMutation/removeMutation bodies, onSuccess/onError branches, and telemetry calls -- all untouched.
- use-manifest-row-revisions.ts's and use-hypothesis-revisions.ts's existing exports and consumers (hypothesis-revision-history.tsx, case-hypotheses-tab.tsx) -- all untouched.
- The existing test suites already covering this surface (version-manifest-screen-revision-select.spec.ts, version-manifest-screen-reorder.spec.ts, version-manifest-screen-remove.spec.ts, use-manifest-builder-repin.spec.ts), whose fixtures carry no revision-state concept at all -- consistent with placement having never been gated on it.
---
## What it is

No source was changed. The revision selector and the manifest row controls, unchanged in what they offer once the item type carries a state field, were verified to read that field only for the informational badge and never as a gate.

## Notes

Verified independently: grepped every reference to `.state` reachable from the manifest composition surface's source files and confirmed the only match on the revision's own state (version-manifest-screen.tsx:169) feeds the display badge alone, distinct from `isReleased` (use-manifest-builder.ts:172), which reads the case version's own state and predates this initiative.
