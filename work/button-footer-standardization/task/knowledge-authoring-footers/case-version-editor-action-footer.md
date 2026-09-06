---
title: Case version editor action footer
summary: The case version editor's Release, Discard, Save changes and Cancel rendered through the shared ButtonFooter.
rationale: I cut this family as one task with no Cancel work of its own, because the scope states this screen's Cancel already exists and is only moved into the component; I kept it apart from the hypothesis revision form because its row carries two confirmed acts and a Save that submits from outside its own form element.
sources:
- intake/scope.md
objective: The case version editor's action row is rendered by the shared ButtonFooter, carrying the Release, Discard, Save changes and Cancel controls the version's own state admits.
criteria:
- case-version-editor-ready-view renders its action row through ButtonFooter rather than through its own end-aligned flex row.
- Save changes still carries `form={CASE_VERSION_EDITOR_FORM_ID}` and still submits the editor's form from outside the `<form>` element.
- Cancel leaves the editing without submitting it, writes no change to the version, leaves the version's declared attributes and every manifest entry exactly as they were, and returns the curator to the surface the editing was reached from.
- Asking to release issues no release; a release is issued only where the curator, having asked, states in a further act that the release is to be performed.
- Asking to discard issues no discard; a discard is issued only where the curator, having asked, states in a further act that the discard is to be performed and reproduces the case's own slug in that act, and an act reproducing no slug or a slug that is not the case's issues no discard.
- Before any release is attempted, and without the curator opening any further control, the action surface itself states for every release condition the draft may still fail whether the draft currently meets it, a met condition stated as met and an unmet one as unmet.
- A release condition whose inputs the surface has not read is stated as not yet decided for that draft, never as met and never as unmet.
- The condition the surface states is that every manifest entry of the draft references a released hypothesis revision.
- The Discard draft control is offered only while the version being edited is a draft.
- A version being read in its released state offers no Save changes control and no Release control.
- On the new case draft screen, while no answer for the created version's own record has arrived, the surface offers no act issuing a release, a discard or an update-draft over that version, and states that the version is still being read.
implements:
- rules/knowledge/an-abandoned-case-version-edit-writes-nothing
- rules/knowledge/releasing-or-discarding-a-draft-case-version-takes-a-further-explicit-act
- rules/knowledge/a-surface-offering-release-states-which-release-conditions-the-draft-meets
- rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
- rules/knowledge/only-a-draft-case-version-may-be-discarded
- rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
- rules/knowledge/a-newly-created-draft-offers-no-act-before-its-own-record-arrives
- rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record
depends_on:
- task/shared-action-footer/button-footer-component
---

## What it is
The case version editor screen and the new case draft screen, which share this ready view, reaching their actions through the shared footer.
It is the one family whose Cancel already exists and is only moved.

## Notes
UNDERDETERMINED, from the specification — no criterion states that the leaving stays offered while the created version's record has not answered, which a-newly-created-draft-offers-no-act-before-its-own-record-arrives requires by saying nothing there withholds the leaving or any route the specification owes.
The implementation that passes renders no control at all in that interval, Cancel included, showing only the still-being-read statement.
REMAINDER, from the specification — the refusal clauses of a-case-version-moves-through-its-declared-lifecycle, the HTTP 409 CaseVersionNotDraftError and CaseVersionNotDraftAtReleaseError answers, reach no criterion of this task.
They belong to the backend lifecycle acts and to whatever task presents a refused call's own message.
REMAINDER, from the specification — the clauses of a-released-case-version-manifests-only-released-hypothesis-revisions stating that placing an entry is never refused for a draft revision, and that a release so attempted is refused naming every such hypothesis, reach no criterion here.
They belong to the place-hypothesis act and the release act's own refusal.
REMAINDER, from the specification — the clauses of a-draft-versions-content-is-presented-only-from-its-own-record about the source of presented content and the creating request's echoed values reach no criterion here.
They belong to the task rendering the new case draft screen's content.
REMAINDER, from the specification — the clause of only-a-draft-case-version-may-be-discarded that a released version is never removed reaches no criterion here.
It belongs to the discard act itself.
ADVISORY, from the specification — no criterion requires the Release or the Discard control to be offered at all on a draft, so a footer carrying only Save changes and Cancel satisfies the release and discard criteria vacuously; the candidates state the acts exist and none states which surface must offer them, so this is the objective asserting what the criteria never hold anything to.
ADVISORY — the slug the discard's further act carries stands in the specification against the reading of the blind judge that decided the fact, which refused it; the human running this planning made that call, and the decision log carries both readings.
