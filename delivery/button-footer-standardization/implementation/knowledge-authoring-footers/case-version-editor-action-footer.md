---
title: Case version editor action footer, its release-conditions disclosure, and Cancel's own-origin return
summary: Moves the case version editor's Release, Discard, Save and Cancel row into the shared ButtonFooter, replaces the release checklist with the single manifest-pin condition the specification names, and fixes Cancel to return to whichever surface the editing was actually reached from.
task: sha256:1cdfd05cd775c8a659fdff1460c668cfd7220fa3a1a9f29cea7cea9d9a5897b8
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/knowledge-authoring-footers-case-version-editor-action-footer-build-2
files:
- path: src/routes/case-version-editor-ready-view.tsx
  effect: Renders Release, Discard, Save changes and Cancel through the shared ButtonFooter as the last element of its fragment; adds a persistent Release conditions section outside any dialog listing each condition as met, not met or not yet decided; narrows the Release dialog's own content to the refusal violations alone; Cancel becomes a button wired to the state's cancel action rather than a link to a fixed route; the unused link import and one prose comment go with the edit, this file being delivered whole.
- path: src/hooks/use-edit-draft-version-form.ts
  effect: Computes the manifest-pin release condition from the draft's own manifest and each entry's pinned revision state, exposing it as the release conditions and the refusal payload as the violations; adds a cancel action backed by the router's own history to the ready phase.
- path: src/hooks/use-new-draft-version-form.ts
  effect: Adds the same cancel action to its own pre-creation ready phase, the post-creation phase inheriting it by delegation; two prose comments go with the edit, one of them replaced by an explicit early return so an empty catch needs no comment to satisfy the linter.
- path: src/hooks/use-manifest-pinned-revision-states.ts
  effect: Filters out any manifest entry lacking a readable pinned hypothesis name before building either query set or the returned state map, so such an entry issues no request and is simply absent from the map, which is already the hook's own fallback for not-yet-answered, instead of dereferencing it unchecked and crashing the whole editor.
- path: src/services/release-checklist.ts
  effect: Replaces the three-item checklist builder with a release condition carrying one of three statuses, and a function stating the manifest-pin condition as not yet decided while any entry's pinned-revision read has not resolved, unmet where any resolved entry is not released, and met otherwise including vacuously for an empty manifest; the refusal extraction for the release act is unchanged.
criteria:
- criterion: case-version-editor-ready-view renders its action row through ButtonFooter rather than through its own end-aligned flex row.
  met: true
  how: The former end-aligned flex div around Release, Discard, Save and Cancel is now ButtonFooter, composing the shared component rather than a bespoke row.
- criterion: Save changes still carries `form={CASE_VERSION_EDITOR_FORM_ID}` and still submits the editor's form from outside the `<form>` element.
  met: true
  how: The Save button is unchanged, still carrying the form id as a submit button inside the new footer, and the form-fields component's own form element was not touched.
- criterion: Cancel leaves the editing without submitting it, writes no change to the version, leaves the version's declared attributes and every manifest entry exactly as they were, and returns the curator to the surface the editing was reached from.
  met: true
  how: Cancel is now a secondary button wired to the state's cancel action, issuing no request either way. That action is the router's own history back, implemented once in the edit hook, covering an existing draft's or a released version's editing, and once in the new-draft hook's pre-creation phase, the post-creation phase inheriting the first by delegation. Verified against the route tree that exactly two files link into this ready view — the case detail screen's version listing and the case simulation header's edit link — and the history return honours whichever of the two actually opened the editing, where the previous fixed destination matched only the first.
- criterion: Asking to release issues no release; a release is issued only where the curator, having asked, states in a further act that the release is to be performed.
  met: true
  how: The Release trigger only opens its dialog; the release is issued exclusively by that dialog's own confirming button, unchanged by this task.
- criterion: Asking to discard issues no discard; a discard is issued only where the curator, having asked, states in a further act that the discard is to be performed and reproduces the case's own slug in that act, and an act reproducing no slug or a slug that is not the case's issues no discard.
  met: true
  how: The discard confirmation's slug gating is unchanged, still disabling the confirming control until the typed value equals the case's own slug exactly.
- criterion: Before any release is attempted, and without the curator opening any further control, the action surface itself states for every release condition the draft may still fail whether the draft currently meets it, a met condition stated as met and an unmet one as unmet.
  met: true
  how: A new section labelled Release conditions renders directly on the ready view, outside the dialog, whenever release is offered, listing every condition with an explicit met, not met or not yet decided label, visible without the dialog ever being opened.
- criterion: A release condition whose inputs the surface has not read is stated as not yet decided for that draft, never as met and never as unmet.
  met: true
  how: The condition function returns the undecided status whenever any manifest entry's pinned-revision read has not resolved, whether still pending, failed, or the entry itself carrying no readable hypothesis name for the pinned-state hook to query at all, rendered as not yet decided and never merged into met or unmet.
- criterion: The condition the surface states is that every manifest entry of the draft references a released hypothesis revision.
  met: true
  how: The sole disclosed condition's label is an exported constant naming exactly that, replacing the previous three unrelated checklist items.
- criterion: The Discard draft control is offered only while the version being edited is a draft.
  met: true
  how: The unchanged draft-and-not-released gate still governs whether the Discard trigger renders inside the footer.
- criterion: A version being read in its released state offers no Save changes control and no Release control.
  met: true
  how: The unchanged read-only and can-release gates still hide Save and Release respectively, and they also hide the new conditions disclosure, which shares the can-release gate.
- criterion: On the new case draft screen, while no answer for the created version's own record has arrived, the surface offers no act issuing a release, a discard or an update-draft over that version, and states that the version is still being read.
  met: true
  how: 'Unaffected by this task: the new case draft screen renders only its loading statement for that phase, covering both before creation and the interval after creation before the created version''s own read resolves, and never mounts the ready view, so no Release, Discard or Save control exists in that interval.'
nodes:
- node: rules/knowledge/an-abandoned-case-version-edit-writes-nothing
  encoded_at:
  - src/routes/case-version-editor-ready-view.tsx
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-new-draft-version-form.ts
  how: Cancel issues no mutation and leaves the draft's attributes and manifest untouched, and now returns the curator to the surface the editing was actually reached from through the router's own history rather than to a single hardcoded route, for both origins verified against the route tree.
- node: rules/knowledge/releasing-or-discarding-a-draft-case-version-takes-a-further-explicit-act
  encoded_at:
  - src/routes/case-version-editor-ready-view.tsx
  - src/services/discard-confirmation.ts
  how: Release and Discard remain reachable only through their own confirmation dialogs, with the discard's confirm additionally gated on the reproduced slug; opening either trigger issues nothing.
- node: rules/knowledge/a-surface-offering-release-states-which-release-conditions-the-draft-meets
  encoded_at:
  - src/routes/case-version-editor-ready-view.tsx
  - src/hooks/use-edit-draft-version-form.ts
  - src/services/release-checklist.ts
  how: A persistent, dialog-independent disclosure states the met, unmet or undecided status of every condition before any release attempt and without the curator opening any further control.
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  encoded_at:
  - src/services/release-checklist.ts
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-manifest-pinned-revision-states.ts
  how: The condition is derived from each manifest entry's own pinned hypothesis-revision state, stating unmet only where a resolved entry's state is not released, and not yet decided for an entry the hook cannot even identify a hypothesis for.
- node: rules/knowledge/only-a-draft-case-version-may-be-discarded
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  how: The preserved draft-and-not-released gate.
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  how: The preserved can-release and read-only gates keyed off the version's own state, governing which acts a draft versus a released version offers; this task changes no lifecycle transition itself.
- node: rules/knowledge/a-newly-created-draft-offers-no-act-before-its-own-record-arrives
  encoded_at:
  - src/routes/new-case-draft-screen.tsx
  - src/hooks/use-new-draft-version-form.ts
  how: 'Unaffected by this task: the pre-existing phase gating already withholds every act until the created version''s own read resolves, and is preserved.'
- node: rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record
  encoded_at:
  - src/hooks/use-new-draft-version-form.ts
  - src/routes/new-case-draft-screen.tsx
  how: 'Unaffected by this task: the loading statement during the same interval, rather than any echoed submitted value, is pre-existing and preserved.'
inferences:
- inferred: The release-conditions disclosure states exactly one condition today, the manifest-pin condition, retiring the pre-existing three-item checklist.
  from: The disclosure rule's own Description, which names that as the one condition gating at release today, together with validation-runs-at-every-read, which excludes the structural and coherence checks the three retired items covered from the disclosed set.
- inferred: A manifest entry whose pinned-revision read has failed, not only one still pending, contributes not-yet-decided rather than unmet.
  from: The rule's own restriction of not yet decided to inputs the surface has not read, extended to a failed read that likewise leaves the surface without an answer, and the three-state model this same screen already uses elsewhere.
- inferred: 'A manifest entry carrying no readable pinned hypothesis name at all is treated the same as one whose read has not resolved: skipped when building the queries so it issues no request, absent from the returned map, and contributing not-yet-decided to the aggregate condition, rather than being dereferenced unchecked or silently counted as met or unmet.'
  from: The same not-yet-decided reservation the rule states for an unread input, extended defensively because the API's declared TypeScript shape is not a runtime guarantee. It is the posture the pre-existing spec over a released version's manifest table already established and tests, now reached for a draft's own release condition once the pinned-state hook is called unconditionally rather than only behind the read-only gate.
- inferred: An empty manifest states the manifest-pin condition as met.
  from: The domain rule's own universal quantification over manifest entries, vacuously true for zero entries, which is the same literal reading that rule already states.
divergences:
- from: The inventory's own convention that where a Cancel must navigate rather than submit it is a secondary button wrapping a router link, seen at case-version-editor-ready-view.tsx:240, whose must-not-duplicate entry names that exact composition as the pattern a new default Cancel should reuse rather than re-derive.
  departure: Cancel on this screen no longer wraps a link to a fixed route; it is a secondary button wired to a cancel action implemented as the router's own history back.
  why: That convention was itself extracted from this file, on the premise that this screen's Cancel navigates to one fixed origin. The route tree shows two distinct files linking into this ready view, the case detail screen's version listing and the case simulation header's edit link, and the fixed destination returns the curator correctly only for the first. The criterion and the abandonment rule's own Description, which names a fixed destination as the wrong shape for exactly this reason, require the second origin to be honoured too, so the link-based composition the convention names is no longer correct on the very screen it was drawn from. The history-based answer is the one the hypothesis revision sibling already gave to the identical multiple-origin problem, adopted here for the same reason and requiring no change to either origin file.
preserved:
- The discard's further-act slug gating in the confirmation service.
- Release and Discard's own dialog and confirmation flow, aside from relocating into the footer and narrowing the release dialog's content to the refusal violations alone.
- Save changes' external-form submission through the editor's form id.
- Cancel's own visibility and enabled state, never disabled and turning on nothing but submission; only its destination mechanism changed.
- The new case draft screen's and the editor screen's own composition of the ready view, and the phase-gated withholding of every act before a created draft's record arrives.
- The case detail screen and the case simulation header, read to confirm the two origins and left untouched, the history-based return needing no change there.
- The pinned-state hook's own existing fallback for an entry absent from the map, unchanged; only which entries ever reach the map changed.
---

## What it is
The case version editor's action row through the shared footer, the release conditions disclosed on the surface itself rather than inside a dialog, and a Cancel that returns where the curator actually came from.
It is the densest task of this plan, eleven criteria over eight nodes.

## Notes
Criterion 3 was first recorded met, then corrected to unmet when this record's own deferred entry contradicted it, then met again after the human authorised fixing Cancel's destination rather than accepting the gap.
The verification behind that is worth keeping: exactly two files link into this ready view, and the fixed destination honoured only one of them.
The convention the divergence departs from was extracted from this very file, on a premise the route tree does not bear out; a convention the inventory evidenced is evidence of how the code does things, never proof that it does them right.
The three-item release checklist was retired rather than moved, because two of its items are structural checks that validation-runs-at-every-read already answers, and disclosing them here would reopen a gate that rule closed.
The third status, not yet decided, did not exist in this system before: it is what the disclosure rule requires for a condition whose inputs the surface has not read.
The suite failed once first, and the diagnosis returned cause code: this delivery began calling the pinned-state hook over every loaded record's manifest to feed the release condition, where it had only ever run behind the read-only gate, and a manifest entry missing its hypothesis crashed the whole editor into its error boundary before the form rendered.
That hook's own file was not in this delivery's original file set and its code had not changed; what changed was who calls it and under which conditions, which is a defect no diff of that file would have shown.
