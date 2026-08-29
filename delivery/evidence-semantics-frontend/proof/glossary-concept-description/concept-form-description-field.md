---
title: Concept form description field — proof
summary: New tests prove the description field populates on edit, is required, and its own missing-description refusal reaches the operator by name; three sibling spec files from a closed initiative's own delivery are corrected (with the human's explicit authorization) since this task's own required description field legitimately widens the PUT body and the validation surface they exercise.
implementation: sha256:5a3d97781ef12c789cdb47c938d6e65530cde7bd921399ced250962d95f5eb17
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/glossary-concept-description-concept-form-description-field-suite-2
tests:
- file: src/routes/glossary-browser-screen-concept-form-description.spec.ts
  name: opens the Dialog with the Description field already holding that concept's own current description
  proves: Criterion 1 — the concept form shows a description field populated with the concept's current description when editing.
  fails_when: the Description Textarea is empty or holds anything other than the edited concept's own description when the edit Dialog opens.
- file: src/routes/glossary-browser-screen-concept-form-description.spec.ts
  name: blocks submission and issues no PUT when description is left empty, even though every other field is filled
  proves: Criterion 3 — conceptFormSchema requires a non-empty description.
  fails_when: a create submission with every other field valid but description empty still issues a PUT, or the Description field is not marked invalid with a linked error.
- file: src/routes/glossary-browser-screen-concept-form-description.spec.ts
  name: shows the concept-description-required message rather than the generic fallback, and keeps the Dialog open
  proves: Criterion 4 — a 422 ConceptDescriptionRequiredError response renders the screen's own wording for the missing description rather than the generic failure toast.
  fails_when: the toast shows the generic save-failure message instead of the specific one, or shows both, or the Dialog closes.
- file: src/routes/glossary-browser-screen-concept-form-save.spec.ts
  name: issues PUT /v1/glossary/concepts/{name} at the typed name, closes the Dialog, and the Concepts tab shows the new concept afterward (corrected)
  proves: Criterion 2 (a submitted registration carries the description in the request body) for a create submission, alongside this test's own pre-existing criterion (name/accepts/ttl).
  fails_when: the PUT body omits description, or the create flow's own already-proven behavior (name/accepts/ttl, dialog closing, the new row appearing) regresses.
- file: src/routes/glossary-browser-screen-concept-form-save.spec.ts
  name: issues PUT /v1/glossary/concepts/{name} at the existing name with the edited accepts and ttl, and the Concepts tab shows the change afterward (corrected)
  proves: Criterion 2 for an edit submission.
  fails_when: the PUT body omits description, or this test's own pre-existing edit behavior regresses.
- file: src/routes/glossary-browser-screen-concept-form-accepts.spec.ts
  name: submits every checked subject type, in the order each was checked, when more than one is selected (corrected)
  proves: Criterion 2 for a create submission with multiple accepts selected.
  fails_when: the PUT body omits description, or this test's own pre-existing accepts behavior regresses.
- file: src/routes/glossary-browser-screen-concept-form-accepts.spec.ts
  name: drops exactly the subject type that is unchecked, keeping the rest of an existing concept's own selection intact (corrected)
  proves: Criterion 2 for an edit submission that also changes accepts.
  fails_when: the PUT body omits description, or this test's own pre-existing accepts-drop behavior regresses.
- file: src/routes/glossary-browser-screen-concept-form-accepts.spec.ts
  name: blocks submission and issues no PUT when ttl is left empty, even though a subject type is selected (corrected)
  proves: This pre-existing ttl-required test's own assertion, no longer confused by a second, newly-required invalid field (description) triggering a second alert in the same dialog.
  fails_when: the ttl field's own invalid state and single alert stop being distinguishable now that description is also required.
untested:
- Whether the client-side description requirement is disclosed in conceptFormSchema.ts's own header comment (part of criterion 3's own wording) is documentation content, not observable runtime behavior a test can assert without string-matching source prose — left as an absence for a reviewer to confirm by reading the file directly.
not_applicable:
- edge_case: A description containing only whitespace.
  why: conceptFormSchema's own check is z.string().min(1) — a character-count check with no trim — and no criterion or node distinguishes whitespace from any other non-empty string; the same reasoning already applied to the sibling honest-degradation proofs in this plan.
- edge_case: Every other named ApiError code besides ConceptDescriptionRequiredError falling through to the generic toast.
  why: Already proven by the pre-existing, untouched 'a failed save' test in glossary-browser-screen-concept-form-save.spec.ts (a plain network Error), which this task does not touch; SAVE_FAILURE_MESSAGE_BY_KIND's own fallback (?? GENERIC_SAVE_FAILURE_MESSAGE) is the identical code path for a named ApiError code with no table entry as for a non-ApiError throw.
---

## What it is
The write side of the concept's description on the one existing concept form, proven the same way its sibling fields already are, plus the correction of three pre-existing tests whose own assertions this task's required field legitimately outgrew.

## Notes
Criterion 3's disclosure clause is left untested (see `untested`) — the requirement itself is proven; the header-comment disclosure is documentation a reviewer confirms by reading the file.
Four tests across two files delivered by task/concept-authoring/concept-create-edit-form (owned by the now-closed initiative capability-connector-authoring-frontend) broke against this task's own change: two create-flow tests never reached the PUT at all once description became required and were left unfilled, and two edit-flow tests asserted an exact PUT body now missing the new field. The framework's ordinary route for a sibling's legitimate widening falsifying an earlier assertion — a proof-only re-delivery of the owning task — is unavailable because that task's initiative is closed and writing new source against it is refused. The human was asked and explicitly authorized correcting the four tests directly as part of this task's own proof, rather than opening a corrective increment or leaving the suite red; the fixes fill the now-required Description field on the two create flows and add description to the two edit flows' expected PUT bodies, changing no other assertion. A fifth pre-existing test (ttl-required) also needed its own Description field filled, discovered only when the first attempt failed with two simultaneous alert roles in the same dialog.
The first suite run (glossary-concept-description-concept-form-description-field-suite) failed at the test step on two counts: the ttl-required test (not yet fixed) found two alert roles once description also went unfilled, and this proof's own criterion-4 test tried to click Save before the edit Dialog's async subject-type load resolved. Both fixed; suite-2 passed clean.
