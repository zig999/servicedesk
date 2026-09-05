---
title: Manifest entries state their pinned revision's own state, on both presentation surfaces
summary: Tests over version-manifest-screen.tsx and case-version-editor-ready-view.tsx prove that every manifest entry on both surfaces states its pinned hypothesis-revision's draft-or-released state, unconditioned on the case version's own state or the selector being open, with all pre-existing fields intact and no badge shown when the pin cannot be resolved from the revisions listing; a third test proves the release-checklist crash this task's own fixture surfaced now answers "not satisfied" instead of throwing.
implementation: sha256:c6225673daa73fd9504cbec86d32dda8998ca50b7f29de1d66bcc2ce7382586f
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/case-version-release-gate-ui-show-each-manifest-entrys-pinned-revision-state-suite-3
tests:
- file: src/routes/version-manifest-screen-pinned-revision-state.spec.ts
  name: VersionManifestScreen -- a row's pinned-revision state (criteria 1 and 4) > states released for a row whose pinned revision is released in its hypothesis's revisions listing
  proves: 'Criterion: ''An entry pinning a revision in released state states released...'', and criterion 1 (the version-manifest screen states the pinned revision''s own state)'
  fails_when: RevisionSelect stops rendering the matched revision's state, always shows "Draft" regardless of the listing's answer, or stops matching by the row's own pinned revision number
- file: src/routes/version-manifest-screen-pinned-revision-state.spec.ts
  name: VersionManifestScreen -- a row's pinned-revision state (criteria 1 and 4) > states draft for a row whose pinned revision is draft in its hypothesis's revisions listing
  proves: 'Criterion: ''...and an entry pinning one in draft state states draft.'''
  fails_when: RevisionSelect stops rendering "Draft" for a draft-pinned row, or renders "Released" regardless of the listing's answer
- file: src/routes/version-manifest-screen-pinned-revision-state.spec.ts
  name: VersionManifestScreen -- the pinned-revision-state statement's visibility with the Select closed (criterion 3) > keeps the state statement visible while the row's Select stands closed, without needing it opened
  proves: 'Criterion: ''That statement is shown without the curator having to open the entry''s revision selector.'''
  fails_when: The state badge moves inside the Select's own listbox/popover instead of sitting beside the trigger, so it disappears while the Select is closed
- file: src/routes/version-manifest-screen-pinned-revision-state.spec.ts
  name: VersionManifestScreen -- the pinned-revision-state statement on a released version (criterion 2) > still states the pinned revision's own state when the case version itself is released
  proves: 'Criterion: ''That statement is shown whatever the case version''s own state is, draft or released'' -- the released-version half; the draft-version half is proven by the two tests above, whose fixtures carry no explicit version state and so default to draft.'
  fails_when: The badge is hidden or suppressed once the version's own state is released (e.g. by reusing rowsDisabled to hide rather than merely disable)
- file: src/routes/version-manifest-screen-pinned-revision-state.spec.ts
  name: VersionManifestScreen -- the pinned revision number stays exactly as before (criterion 5) > keeps the Select's own value as the bare pinned revision number, unaffected by the state statement beside it
  proves: 'Criterion: ''The pinned revision number, and every other field the entry already showed, are unchanged.'''
  fails_when: The Select's own trigger text stops being the bare revision number (e.g. the state label leaks into it, or the value is reformatted)
- file: src/routes/version-manifest-screen-pinned-revision-state.spec.ts
  name: VersionManifestScreen -- the state statement when the pin is absent from the answered page (this task's own inference) > shows no state statement for a row whose own pinned revision is absent from the page its revisions listing answered
  proves: 'Inference: ''When the pinned revision is absent from the hypothesis-revisions listing the app obtained ... no state badge is shown for that entry rather than a placeholder or a stale guess.'''
  fails_when: A badge (any label, a placeholder, or a stale guess) renders for a row whose pinned revision number matches no item in the answered page
- file: src/routes/version-manifest-screen-pinned-revision-state.spec.ts
  name: VersionManifestScreen -- the state statement before the revisions listing has answered (edge case) > shows no state statement on a row whose revisions listing has not yet answered
  proves: The same absent-data inference, for the pending-fetch edge case
  fails_when: A badge or a crash appears before the row's own hypothesis-revisions request has resolved
- file: src/routes/version-manifest-screen-pinned-revision-state.spec.ts
  name: VersionManifestScreen -- the state statement when the revisions listing fails (edge case) > shows no state statement, and no crash, on a row whose revisions listing answered with an error
  proves: The same absent-data inference, for the failed-fetch edge case
  fails_when: A badge renders on error data, or the row (and the Select it still must show, per version-manifest-screen-revision-select.spec.ts's own established contract) crashes instead of degrading gracefully
- file: src/routes/case-version-editor-screen-view-released-manifest-state.spec.ts
  name: CaseVersionEditorScreen -- the released manifest table's own State column (criteria 1 and 4) > states each entry's own pinned-revision state, released or draft, read from that hypothesis's own revisions listing
  proves: Criteria 1 and 4 on the ready-view surface, including that two rows resolve two different hypotheses' states independently rather than sharing one computed value
  fails_when: The new State column stops rendering, renders the wrong entry's state, or both rows collapse onto one shared state
- file: src/routes/case-version-editor-screen-view-released-manifest-state.spec.ts
  name: CaseVersionEditorScreen -- the released manifest table's own State column (criteria 1 and 4) > leaves the position, hypothesis, revision and criterion cells exactly as before, alongside the new state cell
  proves: 'Criterion 5, on the ready-view surface: the pinned revision number and every other previously-shown field are unchanged'
  fails_when: Adding the State column alters or removes the position, hypothesis, revision or criterion cell's own previously-shown value
- file: src/routes/case-version-editor-screen-view-released-manifest-state.spec.ts
  name: CaseVersionEditorScreen -- the released manifest table's state cell when the pin is absent from the answered page (this task's own inference) > shows no state cell for an entry whose pinned revision is absent from the page its hypothesis's revisions listing answered, while its other fields still render
  proves: The absent-pin inference, on the ready-view surface, alongside proof that the other fields still render for that same row
  fails_when: A state label renders for an unmatched pin, or the row's other fields stop rendering because the state lookup failed
- file: src/routes/case-version-editor-screen-view-released-manifest-state.spec.ts
  name: CaseVersionEditorScreen -- the released manifest table before any revisions listing has answered (edge case) > renders the manifest table's other fields immediately, with no state cell, before any hypothesis's revisions listing has answered
  proves: The absent-pin inference on the ready-view surface, for the pending-fetch edge case
  fails_when: The whole table (not just the state cell) waits on the revisions listing, or a state cell renders before that listing answers
- file: src/routes/case-version-editor-screen-view-released-manifest-state.spec.ts
  name: CaseVersionEditorScreen -- the released manifest table's state cell when a revisions listing fails (edge case) > shows no state cell, and no crash, for an entry whose hypothesis's revisions listing answered with an error, while its other fields still render
  proves: The absent-pin inference on the ready-view surface, for the failed-fetch edge case
  fails_when: The table crashes on a failed revisions fetch, or a stale/placeholder state cell renders
- file: src/routes/case-version-editor-screen-view-released-manifest-state.spec.ts
  name: CaseVersionEditorScreen -- the draft-version load with a malformed manifest fixture (this task's own inference) > renders no Manifest section, and issues no request for any hypothesis's revisions, for a draft version's own load whose manifest entries carry no hypothesis field at all
  proves: 'Inference: useManifestPinnedRevisionStates'' mount is confined to ManifestTable inside the pre-existing isReadOnly branch, so a draft version''s own load (whose manifest entries carry no hypothesis field) never invokes it. Strengthened beyond the original assertions with an explicit check that no request to any ''/revisions'' path was issued, matching the test''s own stated title.'
  fails_when: useManifestPinnedRevisionStates is called unconditionally at CaseVersionEditorReadyView's own top level (it would then read the missing hypothesis field and throw before this test's assertions run, or it would issue a GET to a hypothesis's revisions endpoint this fixture never named)
- file: src/routes/case-version-editor-screen-release-checklist.spec.ts
  name: CaseVersionEditorScreen -- the checklist's own concept item for an entry with no collects field (this task's own inference) > marks the concept item unsatisfied, not crashing and not vacuously satisfied, for a manifest entry whose hypothesis_revision carries no collects array at all
  proves: 'Inference: buildReleaseChecklist treats a manifest entry whose hypothesis_revision carries no collects array as not satisfying the concept-acceptance checklist item (answers false for that entry) rather than throwing or vacuously answering true -- the exact defect this task''s own test surfaced and the fix this record''s files entry for release-checklist.ts describes.'
  fails_when: The Array.isArray guard is removed (the dialog would throw instead of opening) or the guard resolves to true on a missing collects array instead of false (the checklist item would render checked instead of not-satisfied)
not_applicable:
- edge_case: The case-version editor's ready-view manifest table shown while the case version itself is in draft state
  why: This codebase's own pre-existing design (case-version-editor-screen-view-released.spec.ts's "the manifest listing's own scope" test, unchanged by this task) never renders that table at all until the version is released, so criterion 2's "whatever the case version's own state is" is not reachable on this surface in the draft direction; the version-manifest screen's own draft-default and explicit-released tests carry both directions of criterion 2 between the two named surfaces, as the implementation record's own "how" states.
- edge_case: An empty manifest on the version-manifest screen
  why: The screen's own pre-existing rule ("A case must keep at least one hypothesis") means this screen's manifest is never rendered with zero rows; nothing this task touches changes that floor.
- edge_case: An empty manifest on the ready-view table
  why: Pre-existing, unaffected behavior -- case-version-editor-screen-view-released.spec.ts already asserts the "This version's manifest holds no entry." sentence, and this task's own extraction of ManifestTable does not alter that branch.
- edge_case: Two manifest entries pinning the same hypothesis-revision, or the same hypothesis at two positions
  why: A case's manifest holding a duplicate hypothesis is excluded by rules this task does not touch; nothing here claims or depends on uniqueness across entries.
- edge_case: Two concurrent curators acting on the same manifest at once
  why: This task adds a read-only presentational fact with no new mutation; no criterion or inference names a race this behavior could expose.
untested:
- The exact color tokens (bg-warning for draft, bg-success for released) the implementation record's inference states are reused from hypothesis-revision-history.tsx's own convention. Every test above proves the label wording ('Draft'/'Released'), which is what the criteria state and what a screen reader announces; asserting the literal CSS class on the inline dot markup would bind the test to styling detail the criteria never name, so it is left unproven here.
- That HYPOTHESIS_REVISION_STATE_CELL is genuinely one shared lookup rather than two independently-defined maps that merely agree today -- a structural, not behavioral, claim no rendering-based test can distinguish from its alternative.
---
## What it is

Fifteen tests across three files prove the five criteria and three of the implementation's own recorded inferences, on both manifest-presentation surfaces named in this task, plus the pre-existing release-checklist defect this task's own fixture surfaced and the implementation fixed.

## Notes

Two earlier suite attempts (build/-build) failed and are answered by the implementation record's own Notes: a real, reproducible defect in release-checklist.ts (now fixed and proven here) and an unrelated one-off flake in use-capability-detail.spec.ts confirmed not to reproduce. This proof was written fresh against the revised implementation record.
