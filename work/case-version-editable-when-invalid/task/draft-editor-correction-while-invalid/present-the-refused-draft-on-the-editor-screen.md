---
title: Present the refused draft on the editor screen
summary: The editor screen renders the ready view over the not-valid state, with a
  non-blocking statement that the version does not read back as a case.
rationale: The scope states that the ready view is reused with a non-blocking
  warning. This task is cut apart from the hook because it consumes the state
  interface the hook task changes. The statement is required to differ from the
  load-error statement because
  a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
  requires the two to be told apart.
sources:
  - work/case-version-editable-when-invalid/intake/scope-frontend.md
objective: Where the editor's state marks a draft as not reading back as a case,
  the editor screen presents that draft's form together with a statement that it
  does not read back as a case.
criteria:
  - Where the editor's state carries the not-reading-back mark, the screen
    presents the title field holding the state's title.
  - Where the editor's state carries the not-reading-back mark, the screen
    states that the version does not read back as a case.
  - That statement differs from the statement the screen presents where the
    version's read did not complete.
  - Where the editor's state carries the not-reading-back mark, the screen's
    form fields are enabled.
  - Where the editor's state carries the not-reading-back mark, the screen
    presents the Save changes control.
  - Where the editor's state carries the not-reading-back mark, the screen
    presents the Cancel control.
  - Where the editor's state carries the not-reading-back mark, the screen
    carries a route to the same version's manifest.
  - Where the editor's state carries the not-reading-back mark and no
    consolidation_register, the screen states that the version declares no
    consolidation register.
  - Where the editor's state carries no not-reading-back mark, the screen
    states nothing about the version not reading back as a case.
depends_on:
  - task/draft-editor-correction-while-invalid/load-a-refused-drafts-own-record-into-the-editor-state
implements:
  - rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case
  - rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
  - rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading
  - rules/knowledge/an-abandoned-case-version-edit-writes-nothing
  - scenarios/knowledge/a-case-with-no-hypothesis-is-still-open-for-editing
---

## What it is

This is the change to case-version-editor-screen.tsx and case-version-editor-ready-view.tsx that renders the form, instead of the dead end, on a reading where the draft does not read back as a case.

## Notes

The statement's colour, wording and placement are left to implementation, as the scope states. ConflictBanner is the existing pattern to model it on.
UNDERDETERMINED, from the specification — the criteria check only the title field and the absent-register statement; nothing checks when_to_use, subject, the fallback's outcome and referral, or a present consolidation_register. Passes despite: a screen that fills only the title and states the absent register, but leaves when_to_use, subject and the fallback empty, or shows a present register blank.
UNDERDETERMINED, from the specification — the editing rule requires the surface to accept an update-draft over the attributes "on this same reading, whichever validator rule is the one failing"; the criteria only require the Save changes control to be present and fields enabled, not that using it issues an update-draft. Passes despite: a screen that shows Save changes and enabled fields, but the control is disabled or using it issues no update-draft.
UNDERDETERMINED, from the specification — the version-keyed rule forbids stating authored_at, state, released_at or any manifest entry as the content at that identity; no criterion stops the not-valid view from showing more than the form. Passes despite: a screen that shows the ready view unchanged under the not-reading-back mark, including a state badge, authored_at, or manifest entries left over from an earlier read.
REMAINDER, from the specification — the editing rule's clause on where the editor's state gets its values (never another version, never case-query's whole-case assembly) is not this task's; this task's criteria take the state's title as given. Belongs to: the task that fills the editor's state from read-case-version.
REMAINDER, from the specification — the manifest-route rule's presence on the pending and failed readings is not tested here, only the refused reading. Belongs to: the editor's in-flight, failed and ready readings, which must not be narrowed by this task.
REMAINDER, from the specification — an-abandoned-case-version-edit-writes-nothing's writes-nothing and return-to-origin clauses are not tested beyond the Cancel control's presence. Belongs to: the editor's already-delivered Cancel act.
ADVISORY, from the specification — though the editing-surface rule's own Description sets the editing surface apart from the version-keyed surface, the editing surface is itself reached by slug together with version number, which is the version-keyed rule's own condition; criteria 3 and 9 rest on the version-keyed rule read that way, not excluded by the Description.
ADVISORY, from the specification — the scenario's `involves` names a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case, which is not among the candidates; the version-keyed rule, which is a candidate, is the one that actually governs this version-keyed editing surface, so nothing needs to be added to the claim.
