---
title: Subject field disables through isBlocked, not unconditionally
summary: Proof that case-version-editor-form-fields.tsx's subject field is enabled on an unblocked draft,
  disabled for each of isBlocked's four stated reasons, and no longer labeled as fixed.
implementation: sha256:144872136621d44611945c0795612236838be54755ba6dc172fe4a8cf4307e44
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/subject-field-fixed-bug-subject-follows-isblocked-suite-2
tests:
- file: src/routes/case-version-editor-screen.spec.ts
  name: pre-populates title, when_to_use, subject, consolidation register and fallback outcome/referral
    from the loaded version, with subject enabled while the draft is not blocked
  proves: Given a draft case version whose form is not blocked (not saving, not in conflict, not released),
    the subject field's input is enabled.
  fails_when: the subject Input renders with the disabled attribute present while loaded from an unblocked
    draft (no save in flight, no conflict, record.state not released, no mid-session release) — the pre-fix
    unconditional-disabled behavior.
- file: src/routes/case-version-editor-screen-subject-field.spec.ts
  name: disables the subject input while a Save PATCH request is in flight, and re-enables it once the
    save completes
  proves: Given a case version whose form is blocked (isBlocked is true, for any of its stated reasons),
    the subject field's input is disabled, the same as every other declared-attribute field. — the status
    === 'saving' reason.
  fails_when: the subject Input lacks the disabled attribute while the Save PATCH is pending, or still
    carries it once the PATCH resolves.
- file: src/routes/case-version-editor-screen-subject-field.spec.ts
  name: disables the subject input once Save answers 409 CaseVersionNotDraftError
  proves: Given a case version whose form is blocked (isBlocked is true, for any of its stated reasons),
    the subject field's input is disabled, the same as every other declared-attribute field. — the status
    === 'conflict' reason.
  fails_when: the subject Input remains enabled after Save answers a 409 CaseVersionNotDraftError, i.e.
    the conflict status stops disabling it.
- file: src/routes/case-version-editor-screen-subject-field.spec.ts
  name: disables the subject input once Release is confirmed in this same session
  proves: Given a case version whose form is blocked (isBlocked is true, for any of its stated reasons),
    the subject field's input is disabled, the same as every other declared-attribute field. — the mid-session
    isReleased reason.
  fails_when: the subject Input stays enabled after the Release dialog is confirmed and closes in the
    same session.
- file: src/routes/case-version-editor-screen-view-released.spec.ts
  name: renders title, when_to_use, subject, fallback outcome/referral and consolidation_register from
    the GET response, each disabled
  proves: Given a case version whose form is blocked (isBlocked is true, for any of its stated reasons),
    the subject field's input is disabled, the same as every other declared-attribute field. — the record.state
    === 'released' (already released on load) reason. Pre-existing, written for task/version-editor/view-released-version-read-only
    and already asserting the subject input's disabled state specifically; reused here rather than duplicated
    because it already proves this reason under this task's own criterion, unmodified by this delivery.
  fails_when: the subject Input loaded from a version whose own state is already released does not carry
    the disabled attribute.
- file: src/routes/case-version-editor-screen-subject-field.spec.ts
  name: shows no label text implying the subject field cannot be edited
  proves: The subject field's label no longer states or implies that the field is fixed.
  fails_when: any text matching /fixed/i is present anywhere in the mounted CaseVersionEditorScreen once
    the subject field's own display value has loaded — including a reverted (fixed) qualifier on the subject
    label.
- file: src/routes/case-version-editor-screen-subject-field.spec.ts
  name: labels the subject field exactly 'Subject type', with no parenthetical qualifier
  proves: the implementation record's inference that the corrected label reads exactly 'Subject type'
    with no parenthetical qualifier of any kind.
  fails_when: the accessible name of the subject input's label is anything other than the exact string
    'Subject type' — including a reverted 'Subject type (fixed)' or any other parenthetical addition.
not_applicable:
- edge_case: two Save/Release operations against the same subject field at once
  why: no node or criterion this task implements states concurrent-operation behavior for the form; isBlocked's
    own race handling (which PATCH wins, whether a second Save can fire while one is in flight) is already
    this screen's existing save/release test files' own concern, not something this corrective task's
    criteria add to.
- edge_case: a boundary at either end of a range, or an empty/duplicate collection
  why: isBlocked is a boolean gate and the subject field is a single scalar input, not a range or a collection
    — neither edge case has a value to raise here.
- edge_case: a dependency that fails or answers slowly
  why: the only dependency this task's own behavior touches is the same fetch already stood in for by
    case-version-editor-screen.test-support.ts's stub; a slow or failing Save/Release response is already
    exercised by the in-flight and conflict tests above, which are this task's own instances of exactly
    that case.
untested:
- whether every other declared-attribute field disables and re-enables in lockstep with subject at the
  exact same instant during a save-in-flight, a conflict, or a mid-session release — each new test in
  case-version-editor-screen-subject-field.spec.ts checks only the subject input at each of those states;
  the claim that the same isBlocked expression drives every field simultaneously rests on reading the
  source (case-version-editor-form-fields.tsx renders disabled={isBlocked} identically for title, when_to_use,
  consolidation_register and every fallback field) plus this screen's own pre-existing save/release/discard
  spec files, which already check other fields under those same states — no test in this delivery or its
  proof asserts subject alongside a second field within one assertion.
---

## What it is

The proof for subject-follows-isblocked: the subject field is enabled on an unblocked draft,
disabled for each of isBlocked's four stated reasons, and no longer labeled as fixed.

## Notes

The suite red twice before this proof: run/subject-field-fixed-bug-subject-follows-isblocked-suite
failed on four assertions in NewCaseDraftScreen's own spec files, a different screen sharing this
task's own source through case-version-editor-form-fields.tsx — diagnosed as a test cause, on tests
owned by the closed frontend-bootstrap initiative. That was answered by a separate corrective task
(task/new-case-draft-screen-stale-subject-tests/subject-tests-match-shared-fix), delivered first.
run/subject-field-fixed-bug-subject-follows-isblocked-suite-2, captured after that delivery landed,
passes in full.
