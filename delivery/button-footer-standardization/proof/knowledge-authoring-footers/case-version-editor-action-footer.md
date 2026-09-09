---
target: frontend
title: Case version editor action footer proof
summary: Tests that the editor's action row composes the shared footer, that its release-conditions disclosure states met, not met and not yet decided before any dialog opens, that Cancel returns to whichever screen the editing was actually reached from, and that the pre-creation draft screen withholds every control including Cancel until the created version's record answers.
implementation: sha256:8ff8d538cfbeb330436a69b2d194f183a708c30f71729ab2e326e9a4eebc0990
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/knowledge-authoring-footers-case-version-editor-action-footer-suite-2
tests:
- file: src/routes/case-version-editor-screen-action-footer.spec.ts
  name: the action row composes the shared ButtonFooter > renders Release, Discard, Save changes and Cancel inside one accessible group named Actions
  proves: The action row is rendered through ButtonFooter, an accessible group named Actions, carrying all four controls rather than a bespoke end-aligned div.
  fails_when: The action row reverts to a bespoke container with no such group, or any of the four controls renders outside it.
- file: src/routes/case-version-editor-screen-action-footer.spec.ts
  name: the action row composes the shared ButtonFooter > still offers Cancel inside that same group when the version is read-only, even though Save and Release are withheld
  proves: Cancel's visibility is independent of the read-only gate that hides Save and Release, so a released version can still be left.
  fails_when: Cancel becomes hidden or moves outside the group when the version is released, or Save and Release wrongly remain visible.
- file: src/routes/case-version-editor-screen-cancel.spec.ts
  name: Cancel returns the curator to the screen the editing was actually reached from > navigates back to the case simulation cockpit it was opened from, rather than a fixed destination such as the case detail route
  proves: Cancel's destination is the router's own history, generic over whichever screen opened the editing, rather than a hardcoded route.
  fails_when: Cancel navigates to a fixed destination instead of honouring the actual previous history entry.
- file: src/routes/case-version-editor-screen-cancel.spec.ts
  name: Cancel returns the curator to the screen the editing was actually reached from > issues no update request when Cancel is clicked after a field was edited
  proves: Cancel abandons a dirty edit without submitting it.
  fails_when: Clicking Cancel after an edit issues the update request.
- file: src/routes/new-case-draft-screen-cancel.spec.ts
  name: Cancel on a not-yet-created draft returns to the screen it was opened from > navigates back to the case detail screen it was opened from, rather than a fixed destination
  proves: The pre-creation ready phase's own Cancel is likewise history-based and origin-generic rather than hardcoded.
  fails_when: Cancel on the blank new-draft form navigates to a fixed destination instead of the screen it was actually opened from.
- file: src/routes/new-case-draft-screen-cancel.spec.ts
  name: Cancel on a not-yet-created draft returns to the screen it was opened from > issues no create request when Cancel is clicked after the form was filled in
  proves: Cancel abandons a filled-in, not-yet-created draft without creating it.
  fails_when: Clicking Cancel after filling the form issues the create request.
- file: src/routes/new-case-draft-screen-cancel.spec.ts
  name: the interval before a created draft's own record resolves offers no control at all > renders no Cancel button, and no button at all, only the still-being-read statement
  proves: 'The task''s underdetermined note, over the implementation it names as passing every criterion while still failing the rule: one that keeps rendering Cancel, or any other control, during that interval.'
  fails_when: A Cancel button, or any other button, renders during the interval between a successful create and the follow-up read resolving.
- file: src/routes/case-version-editor-screen-release-checklist.spec.ts
  name: the release conditions disclosure, before any release is attempted > states the manifest-pin condition as met without the curator ever opening the Release dialog
  proves: The condition is disclosed on the surface itself, before any release attempt and without opening any dialog.
  fails_when: The condition is absent from the persistent surface, or appears only once the Release dialog is opened.
- file: src/routes/case-version-editor-screen-release-checklist.spec.ts
  name: the release conditions disclosure, before any release is attempted > discloses exactly the one manifest-pin condition today, no other item
  proves: The implementation record's inference that the disclosure states exactly one condition today, retiring the three-item checklist.
  fails_when: A second condition item is disclosed alongside the manifest-pin one.
- file: src/routes/case-version-editor-screen-release-checklist.spec.ts
  name: the release conditions disclosure, before any release is attempted > states the condition as not met once a manifested hypothesis revision reads back as still a draft
  proves: The disclosed condition is exactly that every manifest entry references a released hypothesis revision, and states not met when one does not.
  fails_when: A manifested entry that is not released is nonetheless stated as met, or the condition text does not name the manifest-pin rule.
- file: src/routes/case-version-editor-screen-release-checklist.spec.ts
  name: the release conditions disclosure, before any release is attempted > states the condition as met, vacuously, for a manifest holding no entry
  proves: The implementation record's inference that an empty manifest states the condition as met.
  fails_when: An empty manifest is stated as not met or not yet decided instead of met.
- file: src/routes/case-version-editor-screen-release-checklist.spec.ts
  name: the release conditions disclosure, before any release is attempted > states not met, never not yet decided, once one manifested entry is confirmed unreleased even while a second entry's own read is still pending
  proves: A confirmed counterexample settles the universal condition as not met immediately, rather than being masked by another entry's still-pending read.
  fails_when: The condition reports not yet decided, or met, while one entry is already confirmed unreleased because an unrelated entry has not finished reading.
- file: src/routes/case-version-editor-screen-release-checklist.spec.ts
  name: a release condition whose inputs have not been read > states not yet decided, neither met nor not met, while the manifested revision's own read is still pending
  proves: A condition whose inputs have not been read is stated as not yet decided, never merged into met or not met.
  fails_when: A pending read is stated as met or as not met instead of not yet decided.
- file: src/routes/case-version-editor-screen-release-checklist.spec.ts
  name: a release condition whose inputs have not been read > states not yet decided rather than not met when the manifested revision's own read fails outright
  proves: The implementation record's inference that a failed read, not only a pending one, contributes not yet decided rather than not met.
  fails_when: A failed read is stated as not met, treating failure as a confirmed unreleased state, instead of not yet decided.
- file: src/routes/case-version-editor-screen-release-control.spec.ts
  name: opening the Release dialog > opens an in-place dialog with no navigation, stating the release description, with no violations before any attempt
  proves: The Release dialog still opens in place without navigating, and its content is narrowed to the description with no violations shown before any attempt.
  fails_when: Opening the dialog navigates away, or the dialog shows a violations alert before any release attempt was made.
- file: src/routes/case-version-editor-screen-release-outcomes.spec.ts
  name: a refusal answered over a version not in draft > closes the dialog and re-reads the version rather than showing a violations list, resetting for the next open
  proves: Reopening the dialog after that refusal shows no stale violations alert.
  fails_when: Reopening the dialog after that refusal still shows a violations alert.
- file: src/routes/case-version-editor-screen-release-outcomes.spec.ts
  name: resetting the dialog after Cancel closes a violations view > shows no violations, never the previous list, once Cancel closes a dialog that had shown a refusal's violations and it is reopened
  proves: Cancelling out of a violations view clears it, so reopening shows no stale alert.
  fails_when: Reopening the dialog after Cancel still shows the previous violations alert.
- file: src/routes/case-version-editor-screen-release-outcomes.spec.ts
  name: a release failure outside the two mapped refusals > leaves the dialog open with no violations shown and the confirming control usable again
  proves: An unmapped release failure leaves the dialog open and usable, without a stale or invented violations alert.
  fails_when: The dialog closes, or shows a violations alert, on a release failure outside the two mapped refusals.
not_applicable:
- edge_case: Clicking Cancel twice in quick succession
  why: Cancel issues no request of any kind, only a history navigation; there is no mutating call a double click could duplicate, and no criterion addresses double-invocation of a pure navigation.
- edge_case: A boundary at each end of a numeric range
  why: No criterion states a numeric range; the only quantity involved, the manifest entry count, is covered by the empty-manifest and the single and multi-entry cases already tested.
- edge_case: A duplicate where uniqueness is claimed
  why: No criterion claims uniqueness of anything Cancel or the disclosure produces.
untested:
- Whether Cancel, wired through the router's own history, actually round-trips correctly when reached from the two real production entry points the implementation record names is not verified by mounting those two screens end to end; these tests mount a synthetic placeholder route as the opened-from screen, proving the mechanism is origin-generic rather than proving those two integration points wire up correctly.
- The remainder notes the task's own Notes carry — the refusal clauses of the lifecycle rule, the never-refused-for-a-draft-revision and release-refusal clauses of the manifest rule, the source-of-presented-content clauses of the draft-content rule, and the released-version-never-removed clause of the discard rule — are left untested here because the task's own Notes state they reach no criterion of this task and belong elsewhere; that disclaimer is taken at face value rather than re-derived.
---

## What it is
Eighteen assertions over the densest task of this plan: the footer's composition, both Cancels and their origins, the release conditions in all three of their states, and the dialog's own reset behaviour across three refusal shapes.
Two of them are written to fail over exactly the implementations the task's note and the record's own inferences would otherwise let pass.

## Notes
The suite failed once first, at run/knowledge-authoring-footers-case-version-editor-action-footer-suite, and the diagnosis returned cause code rather than test.
A pre-existing spec over a malformed manifest fixture caught it: this delivery began calling the pinned-state hook over every loaded record's manifest to feed the release condition, where it had only ever run behind the read-only gate, and an entry missing its hypothesis crashed the editor into its error boundary before the form rendered.
No test was weakened to answer it; the source was corrected and that hook joined this delivery's file set.
The disclosure's three states are exercised apart, including the case where one entry is already confirmed unreleased while another is still being read, which is the one place a naive aggregate would report not yet decided over a settled counterexample.
