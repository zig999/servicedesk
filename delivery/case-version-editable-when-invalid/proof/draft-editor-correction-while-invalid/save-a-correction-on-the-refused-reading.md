---
target: frontend
title: Save a correction on the refused reading -- proof
summary: Route-level tests over the not-valid phase's now-functional Save changes button prove that a
  correction submitted on the refused reading is issued as an update-draft, that its accepted answer refills
  the form's declared attributes (including clearing an absent consolidation_register), and that a 200
  answer shows no save-failure notice.
implementation: sha256:d2c08b62080327195a840f7fc706acea0a3c6fd4901a96cc8aee9b26d00dd60b
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/draft-editor-correction-while-invalid-save-a-correction-on-the-refused-reading-full-2
tests:
- file: src/routes/case-version-editor-screen-refused-draft-save.spec.ts
  name: CaseVersionEditorScreen -- submitting a correction on the refused reading issues an update-draft
    carrying the edited title (criterion 1) > sends a PATCH to this same version carrying the changed
    title, together with the rest of the draft's own record, when Save changes is clicked on the not-valid
    reading
  proves: Criterion 1 -- on the not-valid reading of a draft whose manifest holds no entry, submitting
    a changed title issues an update-draft carrying that title
  fails_when: Save changes on the not-valid phase issues no PATCH, or issues one whose body omits the
    edited title or carries only the changed field instead of the form's whole content
- file: src/routes/case-version-editor-screen-refused-draft-save.spec.ts
  name: CaseVersionEditorScreen -- an accepted update-draft on the refused reading refills the form from
    its own answer (criterion 2) > shows the title the 200 answer carries, not the title as typed, once
    the update-draft accepted on the not-valid reading settles
  proves: Criterion 2 -- an update-draft answered HTTP 200 on that reading leaves the form holding the
    title the answer carries
  fails_when: the form keeps showing the locally typed title instead of the title the 200 answer carries,
    or shows neither
- file: src/routes/case-version-editor-screen-refused-draft-save.spec.ts
  name: CaseVersionEditorScreen -- an accepted update-draft on the refused reading answering no consolidation_register
    leaves the form holding none (criterion 3) > states that the version declares no consolidation register
    once a 200 answer carrying no consolidation_register settles, though the draft held one before the
    submit
  proves: Criterion 3 -- an update-draft answered HTTP 200 with no consolidation_register on that reading
    leaves the form holding no consolidation_register value
  fails_when: the "declares no consolidation register" statement fails to appear after a 200 answer that
    carries no consolidation_register, because the field still holds its pre-submit value
- file: src/routes/case-version-editor-screen-refused-draft-save.spec.ts
  name: CaseVersionEditorScreen -- an accepted update-draft on the refused reading shows no save-failure
    notice (criterion 4) > issues no toast error once a 200 answer carrying no manifest settles for an
    update-draft submitted on the not-valid reading
  proves: Criterion 4 -- an update-draft answered HTTP 200 whose body carries no manifest shows no save-failure
    notice
  fails_when: toast.error is called after a 200 answer, i.e. the success path is mistaken for or coupled
    to the failure path
- file: src/routes/case-version-editor-screen-refused-draft-save.spec.ts
  name: CaseVersionEditorScreen -- a correction on the refused reading is issued whichever validator rule
    is the one failing, never only when the manifest is the empty one (UNDERDETERMINED entry 1) > still
    sends the PATCH when the declared-attributes record answers a manifest holding an entry, refuting
    a gate keyed to a-case-has-at-least-one-hypothesis specifically
  proves: UNDERDETERMINED entry 1 in the task's Notes
  fails_when: an editor that issues the update-draft on the not-valid reading only when the failing rule
    is a-case-has-at-least-one-hypothesis, disabling or skipping submit for a draft whose manifest already
    holds an entry
- file: src/routes/case-version-editor-screen-refused-draft-save.spec.ts
  name: CaseVersionEditorScreen -- an accepted correction on the refused reading refills every declared
    attribute from the answer, not the title alone (UNDERDETERMINED entry 2) > shows the when_to_use the
    200 answer carries, not the value locally typed before submit, refuting an editor that keeps the form's
    pre-submit when_to_use
  proves: UNDERDETERMINED entry 2 in the task's Notes
  fails_when: an editor that takes only the title (and clears an absent register) from the answer but
    keeps the form's pre-submit value for when_to_use
- file: src/routes/case-version-editor-screen-refused-draft-save.spec.ts
  name: CaseVersionEditorScreen -- the not-read-back-as-a-case statement stays after an accepted correction
    over a draft whose manifest still holds no entry (UNDERDETERMINED entry 3) > still shows the not-read-back-as-a-case
    banner once the update-draft settles, refuting an editor that moves to its ordinary ready state on
    an accepted answer alone
  proves: UNDERDETERMINED entry 3 in the task's Notes
  fails_when: an editor that refills the form and moves to its ordinary ready state, clearing the not-reading-back
    mark, on an accepted answer over a draft whose manifest still holds no entry
not_applicable:
- edge_case: the shared patchMutation's conflict (409 CaseVersionNotDraftError), case-not-found (404)
    and generic-failure (500) branches, as reached from the not-valid phase's own submit
  why: no criterion of this task states not-valid-specific behavior for these branches; the branch code
    is the exact same shared function already proven from the ready phase (case-version-editor-screen-save.spec.ts),
    and this task's own criteria 1-4 name only the 200 answer
- edge_case: concurrent double-submission guarding (isSubmittingRef) as reached from the not-valid phase
  why: preserved, unchanged shared logic per the implementation record's own preserved list; no criterion
    of this task states it
- edge_case: triggering the same submit through onFieldBlur rather than through the Save changes button
  why: onFieldBlur and onSubmit are the same shared submit function; the trigger mechanism is not a dimension
    the criteria distinguish, so a second test over the same call path would be the same evidence twice
untested:
- 'rules/knowledge/an-accepted-update-draft-answers-its-versions-own-stored-declared-attributes -- this
  task''s own Notes record this as a REMAINDER: the rule''s wire-answer clauses are the backend''s own
  behavior, taken as given here. No frontend test can decide that whole fact; it belongs to task/draft-correction-while-invalid/answer-update-draft-from-the-drafts-own-record.'
- rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case
  -- the node's own statement conjoins presenting the draft's declared attributes (owned by the prior
  load/present tasks) with accepting an update-draft over them on this reading (this task's own share).
  No single test decides the conjunction whole.
- rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case --
  unchanged by this task; the node's own fact was already decided by the prior task's proof (use-edit-draft-version-form-not-valid-marking.spec.ts,
  criterion 15); this task adds no new test for it.
- scenarios/knowledge/a-case-with-no-hypothesis-is-still-open-for-editing -- the scenario's given/when/then
  spans the presenting steps (owned by the load/present tasks, already tested there) and the submission
  step this task owns. No test in this proof decides the scenario whole.
- domain/knowledge/case-version -- a broad aggregate-root description; no finite test decides this whole
  domain fact from an editor-wiring task.
---

## What it is

Route-level tests over the not-valid phase's now-functional Save changes button, proving submission, form refill, absent-register clearing and no false failure notice.

## Notes

None.
