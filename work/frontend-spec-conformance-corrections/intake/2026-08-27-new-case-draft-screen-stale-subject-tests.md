A follow-up to task/subject-field-fixed-bug/subject-follows-isblocked, found while delivering it:
the suite failed with 4 test failures, all in NewCaseDraftScreen's own spec files
(src/routes/new-case-draft-screen-seed.spec.ts, src/routes/new-case-draft-screen.spec.ts) — a
different screen from CaseVersionEditorScreen, the one that task's own criteria named.

Root cause, per the failure-diagnostician's own reading: case-version-editor-form-fields.tsx is
shared — it is rendered by case-version-editor-ready-view.tsx, which both CaseVersionEditorScreen
and NewCaseDraftScreen use. subject-follows-isblocked's fix (subject now disabled through
isBlocked, labeled "Subject type" rather than "Subject type (fixed)") is the one component both
screens share; there is no separate source for NewCaseDraftScreen's own subject field. The source
is already correct for both screens. What is wrong is four pre-existing test assertions, delivered
under the closed frontend-bootstrap initiative (delivery/frontend-bootstrap/implementation/
version-editor/{new-draft-creation,seed-new-draft-from-latest-released}.md), which still assert
the pre-fix behavior:

1. src/routes/new-case-draft-screen-seed.spec.ts:39 — asserts the subject input carries
   `disabled` on a seeded-from-released-version load.
2. src/routes/new-case-draft-screen-seed.spec.ts:86 — asserts the same for a glossary-seeded,
   no-released-version load.
3. src/routes/new-case-draft-screen.spec.ts:28 — asserts the same for a blank create form.
4. src/routes/new-case-draft-screen.spec.ts:53 — looks up the field by the pre-fix label text
   "Subject type (fixed)", which no longer exists.

frontend-bootstrap is closed (holds closure.md); its work and delivery roots are history and
never evolved again, so the ordinary proof-only re-delivery route (over the task that owns a
falsified assertion) does not apply — there is no live task to re-deliver against. The tests
themselves are ordinary files in the current target tree, and this initiative is where their
correction lands.

Scope: update the four assertions above to match the current, correct, shared behavior — the
subject input is not disabled while its screen's own isBlocked is false, and its label is
"Subject type". No source file changes; case-version-editor-form-fields.tsx already conforms via
task/subject-field-fixed-bug/subject-follows-isblocked's own delivery.
