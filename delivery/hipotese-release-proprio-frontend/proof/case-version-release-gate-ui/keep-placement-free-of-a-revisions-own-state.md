---
title: Manifest placement, repin and removal stay unaffected by a revision's own draft/released state
summary: Adds the missing fixtures -- a hypothesis-revisions listing that actually carries a state field -- needed to prove this task's five criteria, since every existing suite covering the manifest composition surface (revision-select, reorder, remove, use-manifest-builder-repin) exercises revisions with no state concept at all.
implementation: sha256:b9fdf72e40e98afa538599056e4621405166bbf5ffe94bdbd6ae45c2780b6301
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/case-version-release-gate-ui-keep-placement-free-of-a-revisions-own-state-suite
tests:
- file: src/routes/version-manifest-screen-draft-revision-placement.spec.ts
  name: VersionManifestScreen -- the revision selector's own options, over a revision listing carrying state (criterion 1) > offers a revision whose own state is draft as a selectable option, exactly like a released one
  proves: A manifest row's revision selector offers every revision the listing answers, including those whose own state is draft.
  fails_when: optionsWithPinnedRevision (or the Select it feeds) starts filtering out, or marking aria-disabled, an option whose backing revision's own state is draft -- i.e. the option for revision 4 stops appearing in the listbox, or appears with aria-disabled="true".
- file: src/routes/version-manifest-screen-draft-revision-placement.spec.ts
  name: VersionManifestScreen -- choosing a revision whose own state is draft (criteria 2 and 5) > issues the place request for the chosen draft revision, with no client-side refusal shown before the server answers
  proves: Choosing a revision whose own state is draft issues the place request rather than being stopped before it; and that this frontend does not itself refuse the placement (whether the request would be accepted is not asserted here).
  fails_when: repinIfChanged/row.onRepin/repinTo grows a branch that reads the chosen revision's own state and skips or defers placeMutation.mutate for a draft revision, so putCallCount stays 0 or the PUT body differs from { revision 4, position 1 }; or any client-rendered refusal (the released-by-someone-else banner or a row alert) appears before the server has answered.
- file: src/routes/version-manifest-screen-draft-revision-placement.spec.ts
  name: VersionManifestScreen -- an entry's own removal and repin controls, held against its pinned revision's own state (criterion 3) > leaves the Select and Remove controls enabled on a row pinning a draft revision, exactly as on a row pinning a released one
  proves: A manifest entry pinning a revision in draft state offers the same removal and repin controls as one pinning a revision in released state -- a difference in the entry's own disclosed state is never read as a difference in what the curator may do with the entry.
  fails_when: RevisionSelect's Select or RowActions' Remove button starts reading pinnedRevisionState (or an equivalent per-row state fact) into its disabled computation, so the row pinning the draft revision (H1) ends up disabled while the row pinning the released one (H2) does not, or vice versa.
- file: src/routes/version-manifest-screen-draft-revision-placement.spec.ts
  name: VersionManifestScreen -- removing an entry whose pinned revision's own state is draft (criterion 4) > issues the DELETE and removes the entry on the same terms as any other entry, once confirmed
  proves: Removing a manifest entry is offered on the same terms whatever the referenced revision's own state is.
  fails_when: row.onRemove/removeMutation gains a check on the referenced revision's own state that pre-empts, alters or delays the DELETE for a draft-pinned entry, so deleteCallCount stays below 1, the confirmation dialog behaves differently, or the entry is not removed from the rendered list after the 204.
not_applicable:
- edge_case: The server refusing a draft-revision placement (e.g. a hypothetical business rule rejecting it).
  why: Criterion 5 states explicitly that whether the request is accepted is the server's answer and is "not asserted by this task" -- asserting a particular server outcome here would test a fact this task's own criteria disclaim.
- edge_case: Two placement or removal requests racing against each other, or a request in flight while a second is attempted.
  why: This task changes nothing about concurrency handling -- isBusy/isBlocked and the disabling they drive are pre-existing behavior already proven, independent of a revision's own state, by version-manifest-screen-revision-select.spec.ts's and version-manifest-screen-reorder.spec.ts's own in-flight and blocked-draft tests. Nothing in this task's criteria asks for a state-specific concurrency behavior.
- edge_case: An empty hypothesis-revisions listing, or one where the revisions query is still loading or has errored.
  why: These are edge cases of the listing hook itself, already exercised (with no state field at all, and separately with one) by version-manifest-screen-revision-select.spec.ts and version-manifest-screen-pinned-revision-state.spec.ts; this task's own criteria are about whether a present item's own state gates anything, not about the listing's loading/error/empty behavior.
- edge_case: A manifest holding only one entry, where Remove is disabled by isOnlyEntry regardless of the pinned revision's own state.
  why: isOnlyEntry-driven disabling is existing, unrelated behavior already covered by version-manifest-screen-remove.spec.ts; this task's criterion 3 is about a difference in disclosed state never producing a difference in control availability, which a one-entry manifest cannot isolate since Remove is disabled there for every state alike.
untested:
- The implementation record's inference that no production source edit was required to satisfy this task's criteria is a claim about what the delivery touched, not about runtime behavior -- nothing a test render or interaction can observe distinguishes 'no edit was needed' from 'an edit was made but happens not to change behavior here'. That claim is checked against the diff itself, not against this suite.
---
## What it is

Four new tests, over a fixture that actually carries a hypothesis-revision's own state (which every pre-existing suite covering this surface omitted), prove that placement, repin and removal on the manifest composition surface are unaffected by that state.

## Notes

None.
