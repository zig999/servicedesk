---
target: frontend
title: Save owns its form again under the footer portal
summary: The hypothesis revision screen's submit control keeps the screen's own form as its DOM form owner even when ButtonFooter
  portals it into the app shell's footer slot, restoring the save-to-revise dispatch the portal broke.
task: sha256:5fa64c7361f6f7cf567f8af74629bb83eb5054e5cc4e9e407f3318005b816967
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/hypothesis-revision-save-act-save-dispatches-the-revise-build-2
files:
- path: src/routes/hypothesis-revision-form-fields.tsx
  effect: exports HYPOTHESIS_REVISION_FORM_ID, stamps it as the id of the screen's own form, and passes it as the explicit
    form attribute of the Save hypothesis submit button, so the button's form owner is that form regardless of where ButtonFooter's
    createPortal renders the button's DOM subtree; also removes two prose comments predating this edit, per the no-comments
    rule this delivery applies to the whole file it writes
criteria:
- criterion: With the footer slot present, so the portal the application takes is taken, the screen's save control has the
    screen's own form as its form owner.
  met: true
  how: the form now carries id={HYPOTHESIS_REVISION_FORM_ID} and the submit Button carries form={HYPOTHESIS_REVISION_FORM_ID}.
    HTML's form-association algorithm resolves a submit control's form owner from an explicit form attribute by id lookup
    in the document, not by DOM ancestry, so the association survives ButtonFooter moving the button, and the group it sits
    in, into the app shell's footer slot node — a sibling of, not a descendant of, the form.
- criterion: With the footer slot present and every field of the composition filled, activating the save control issues a
    revise request for the hypothesis the route names.
  met: true
  how: with form ownership restored, activating the button now actually submits the form, running the onSubmit handler react-hook-form's
    handleSubmit wraps in use-hypothesis-revision-form.ts, unmodified, which POSTs to /v1/cases/{slug}/hypotheses carrying
    hypothesis_name, pre-filled from the route's hypothesisName by that hook's existing effect. That dispatch logic was already
    correct; the button simply could not reach it while it owned no form.
- criterion: With the footer slot present and a revise answered, the revision number that answer states is stated to the curator.
  met: true
  how: once the request reaches the server and reviseMutation succeeds, the existing success phase in hypothesis-revision-screen.tsx,
    unmodified and never itself rendered inside the portaled form, renders the sentence naming the saved revision. That render
    path does not depend on the footer slot or the form association this delivery fixed; it only required the request in the
    preceding criterion to actually fire.
- criterion: With the footer slot present, activating the abandon control issues no revise request, leaves the hypothesis's
    existing revisions and its case's draft version exactly as they were, and returns the curator to the screen the composition
    was opened from.
  met: true
  how: the abandon control is a type=button Button wired to state.onCancel, passed in as trailingActions and rendered inside
    the same ButtonFooter as Save. A type=button control runs no form-association algorithm at all — its onClick fires cancelComposition,
    which is router.history.back(), wherever in the DOM it renders — so it never called reviseMutation.mutate before this
    fix and still does not after it. No source change was needed or made for this criterion.
nodes:
- node: domain/knowledge/hypothesis
  how: governs the work — the revise request this delivery restored dispatches against the identity this node names, by hypothesis_name
    — but this delivery encoded no fact of its own about the aggregate; that shape already lived in use-hypothesis-revision-form.ts
    and hypothesis-revision-form-schema.ts before this task, untouched by it.
- node: domain/knowledge/hypothesis-revision
  how: 'the same relation as domain/knowledge/hypothesis: the composition''s fields already carry this aggregate''s declared
    attributes into the revise body, and this delivery restored the button''s ability to submit them, encoding nothing new
    about the aggregate itself.'
- node: rules/knowledge/a-revise-answers-the-revision-number-it-saved
  how: the rule's fact, that the curator is told the written revision number, is already encoded in hypothesis-revision-screen.tsx's
    success-phase render, untouched by this delivery. This task's fix only removed the DOM obstruction that kept the revise
    from ever reaching the point where that answer is produced; per the task's own ADVISORY note, which control carries the
    number and where it sits is form, outside this rule, and the form-ownership criterion answers to no covered node at all.
- node: rules/knowledge/an-abandoned-revision-composition-writes-nothing
  how: the policy's fact, that abandonment writes no revision and returns the curator to the opening screen, is encoded in
    use-hypothesis-revision-form.ts's cancelComposition and in the Cancel button's plain onClick wiring, both untouched by
    this delivery. The fix changes only the submit button's form association, and a type=button control's behavior never depended
    on DOM position, so this delivery encoded no new fact for this node either.
inferences:
- inferred: the form's own id string, "hypothesis-revision-form".
  from: no node or standard rule names an id value — it is arrangement, not a domain fact — so the literal was chosen to match
    the one existing precedent in this codebase for a submit control portaled outside its form's DOM subtree, case-version-editor-form-fields.tsx's
    exported CASE_VERSION_EDITOR_FORM_ID paired with case-version-editor-ready-view.tsx's form attribute on its own Save button.
preserved:
- the abandon control's existing writes-nothing and return-to-opening-screen behavior in use-hypothesis-revision-form.ts's
  cancelComposition, exercised without the footer slot by hypothesis-revision-screen-cancel.spec.ts
- the success-phase revision-number display in hypothesis-revision-screen.tsx
- every field's existing validation and error wiring, aria-invalid and aria-describedby, in hypothesis-revision-form-fields.tsx
- ButtonFooter's own dual behavior — an inline group when no footer slot is provided, a portal into it when one is — in button-footer.tsx
- the trailingActions slot's contract as an optional, caller-owned ReactNode
deferred:
- what: capability-form-fields.tsx and connector-configuration-form-fields.tsx render their own submit buttons inside the
    same ButtonFooter without pairing an explicit form id, the same latent defect this task corrected for the hypothesis revision
    screen.
  why: this task's objective and criteria name only the hypothesis revision screen; reaching those two other screens is a
    wider change than one corrective task covers.
- what: the two prose comments removed from hypothesis-revision-form-fields.tsx stated an accessibility rationale for the
    fieldset and legend, and named itself as an earlier task's inference disclosed in that task's own delivery record.
  why: the no-comments rule admits no refresh, only removal, and the reasoning already has its validated home in the record
    that first disclosed it.
---

## What it is

One wrong behavior corrected: the Save control on the hypothesis revision screen dispatched nothing, because the app shell's footer portal moved a submit control out of its form's DOM subtree and a submit control owns the form it descends from or the one it names.
It now names it, which is the pattern case-version-editor-form-fields.tsx and case-version-editor-ready-view.tsx already use against the same portal.

## Notes

The defect was observed by running the delivered system and measured in the browser: the control read type submit and not disabled, with a null form owner and no form attribute, so no submit event was ever fired and the form's handler was never invoked.
The form itself was sound, which was established by intercepting submit in the capture phase and calling requestSubmit, and stopping the event before React saw it so nothing was written.
Nothing about the request, the validation or the answer's display changed here; all three were already correct and unreachable.
This delivery's first attempt halted at a red build whose lint failure was in src/shared/components/button-footer.spec.ts, a file this delivery never touched and the trace binds nothing to, introduced by a direct commit on this freely-edited target where the project's own suite is what decides a tool-decided rule.
No record was written for that attempt, its runs keep their names under run/, and the lint was corrected as an act of its own before this attempt began.
Two prose comments were removed from the file this delivery writes, which the deferred entry above explains.
The removal is the whole of what the no-comments rule permits, and the accessibility reasoning they carried already sits in the delivery record of the task that first inferred it.
