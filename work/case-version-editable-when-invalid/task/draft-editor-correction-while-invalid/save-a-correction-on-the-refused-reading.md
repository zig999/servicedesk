---
title: Save a correction on the refused reading
summary: An update-draft submitted from the editor on the not-valid reading is
  issued, and its accepted answer refills the form.
rationale: Cut apart from loading because it builds on the backend's new
  update-draft answer, which is a different reason to change than the read that
  fills the form. The criteria use the scenario's given, a draft whose manifest
  holds no entry, so that the scenario the rule names can be shown on this task.
sources:
  - work/case-version-editable-when-invalid/intake/scope-frontend.md
objective: On a reading where a draft does not read back as a case, a correction
  the curator submits from the editor is issued as an update-draft, and its
  accepted answer is what the form then holds.
criteria:
  - On the not-valid reading of a draft whose manifest holds no entry,
    submitting a changed title issues an update-draft carrying that title.
  - An update-draft answered HTTP 200 on that reading leaves the form holding
    the title the answer carries.
  - An update-draft answered HTTP 200 with no consolidation_register on that
    reading leaves the form holding no consolidation_register value.
  - An update-draft answered HTTP 200 whose body carries no manifest shows no
    save-failure notice.
depends_on:
  - task/draft-editor-correction-while-invalid/load-a-refused-drafts-own-record-into-the-editor-state
  - task/draft-correction-while-invalid/answer-update-draft-from-the-drafts-own-record
implements:
  - rules/knowledge/an-accepted-update-draft-answers-its-versions-own-stored-declared-attributes
  - rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case
  - rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
  - scenarios/knowledge/a-case-with-no-hypothesis-is-still-open-for-editing
  - domain/knowledge/case-version
---

## What it is

This is the save path of the editor hook, used on the reading where the draft does not read back as a case.

## Notes

The backend changes update-draft's answer to carry only the draft's own declared attributes. The editor's valid readings consume that same answer.
Two criteria the decomposer originally cut — that an accepted save "leaves the save status clean" and "shows the time it was saved" — were dropped before binding: no candidate states either fact, and both test a client-side presentational mechanism (a dirty/clean flag, a displayed timestamp) rather than a domain behavior, which is exactly the kind of condition a criterion should not carry.
UNDERDETERMINED, from the specification — criterion 1 tests only a draft whose manifest holds no entry, so a gate keyed to that one failing rule specifically (rather than "whichever validator rule is the one failing") is never excluded. Passes despite: an editor that issues the update-draft on the not-valid reading only when the failing rule is a-case-has-at-least-one-hypothesis, disabling or skipping submit for a draft whose own title or subject is the failing value.
UNDERDETERMINED, from the specification — the criteria check only the refilled title and an absent register; the accepted answer also carries when_to_use, subject and the fallback's outcome and referral, which nothing here requires the form to take from the answer. Passes despite: an editor that takes only the title and clears an absent register from the answer, but keeps the form's pre-submit values for when_to_use, subject and the fallback.
UNDERDETERMINED, from the specification — no criterion says what the not-reading-back mark does once an accepted answer refills the form; a surface that keeps stating the version does not read back as a case after a successful correction, while the manifest is still empty, is not distinguished from one that clears the mark once out of the loop this task closes. Passes despite: an editor that refills the form and moves to its ordinary ready state, clearing the not-reading-back mark, on an accepted answer over a draft whose manifest still holds no entry.
REMAINDER, from the specification — the accepted-update-draft rule's own wire-answer clauses (HTTP 200, reading from the stored record, never through case-query's whole-case assembly, never a CaseVersionNotValidError) are the backend's, not the editor's reaction to them; this task's criteria take the HTTP 200 answer as given. Belongs to: task/draft-correction-while-invalid/answer-update-draft-from-the-drafts-own-record.
REMAINDER, from the specification — the editing-surface rule's explicit-absent-register statement is rendered from the editor's state, not decided by the save path. Belongs to: task/draft-editor-correction-while-invalid/present-the-refused-draft-on-the-editor-screen.
REMAINDER, from the specification — the same rule's presentation of the stored attributes when the editor first opens on the refused reading, before any submission, reaches no criterion here. Belongs to: task/draft-editor-correction-while-invalid/load-a-refused-drafts-own-record-into-the-editor-state.
ADVISORY, from the specification — update-draft is published by contracts/knowledge/case-lifecycle, which is not in the epic's covers; nothing here changes the request's shape, so the existing client call is enough, and the claim would only need to grow if the executor needed that contract's own terms.
Decision, beyond the covers — stand: contracts/knowledge/case-lifecycle is cited only as background naming update-draft's publisher, not as a fact this task implements; this task changes only what the editor does with the answer, not the request's shape.
