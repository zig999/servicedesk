---
title: Offer discard on the refused reading
summary: The editor offers the discard of a draft on the reading where it does not
  read back as a case, still behind the slug-reproducing confirmation.
rationale: Cut as its own task because the discard offer is governed by a
  different rule and changes for different reasons than correction. The editor
  must learn the version's state on this reading for the gate, and that ties the
  task to the hook and screen tasks it depends on.
sources:
  - work/case-version-editable-when-invalid/intake/scope-frontend.md
objective: On a reading where a draft does not read back as a case, the editor
  offers the curator the discard of that draft.
criteria:
  - On the not-valid reading of a draft whose manifest holds no entry, the
    editor offers the discard control.
  - On the not-valid reading of a released version, the editor offers no
    discard control.
  - On that reading of a draft, asking for the discard without confirming it
    issues no discard.
  - On that reading of a draft, confirming the discard with text other than
    the case's own slug issues no discard.
  - On that reading of a draft, confirming the discard reproducing the case's
    own slug issues a discard of that version.
  - A discard answered HTTP 204 on that reading shows no discard-failure
    statement.
depends_on:
  - task/draft-editor-correction-while-invalid/load-a-refused-drafts-own-record-into-the-editor-state
  - task/draft-editor-correction-while-invalid/present-the-refused-draft-on-the-editor-screen
implements:
  - rules/knowledge/a-discard-is-offered-and-accepted-while-its-drafts-current-read-does-not-answer-a-case
  - rules/knowledge/only-a-draft-case-version-may-be-discarded
  - rules/knowledge/releasing-or-discarding-a-draft-case-version-takes-a-further-explicit-act
  - rules/knowledge/a-draft-case-versions-discard-reproduces-the-cases-own-slug
  - scenarios/knowledge/a-case-with-no-hypothesis-is-still-discardable
  - constraints/a-successful-case-version-discard-answers-with-no-content
  - domain/knowledge/case-version
---

## What it is

This makes the existing discard control reachable on the editor's not-valid reading, gated on draft state alone.

## Notes

buildDiscardControlState and buildDiscardMutationOptions in frontend/app/src/services/discard-confirmation.ts are reused, not duplicated.
Today canDiscard reads record.state, which read-case-version's answer does not carry.
UNDERDETERMINED, from the specification — every criterion is fixed to a draft whose manifest holds no entry; nothing shows the offer on a not-valid reading caused by a different failing rule, such as a coherence failure over a non-empty manifest. Passes despite: an editor that shows the discard control only when the draft's manifest is empty, hiding it for any other not-valid reason.
REMAINDER, from the specification — the discard rule's acceptance clause, the server-side 204/no-body constraint, and the scenario's removal then-clauses reach no criterion here; this task covers only the editor's offer and confirmation. Belongs to: task/draft-discard-while-invalid/prove-discard-accepts-a-draft-failing-validation under the backend epic draft-discard-while-invalid, which already implements these nodes.
REMAINDER, from the specification — releasing-or-discarding-a-draft-case-version-takes-a-further-explicit-act's release clauses reach no criterion here; this task is about discard only. Belongs to: whatever task implements the editor's release offer and its confirmation.
ADVISORY, from the specification — no candidate says what the editor shows or where the curator is taken after an accepted discard; the negative criterion (no failure statement) can still be tested, and the rest is left to whatever the editor already does on its valid-reading path.
ADVISORY, from the specification — criterion 2 (no discard control on a released version) is backed by only-a-draft-case-version-may-be-discarded's "a released version is never removed"; which control carries the offer, its wording and where it sits are left to the interface.
