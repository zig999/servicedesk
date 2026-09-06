---
title: Hypothesis revision action footer
summary: The hypothesis revision form's action row rendered through the shared ButtonFooter, with the Cancel this form has never had.
rationale: I cut this family as one task including its new Cancel, because the scope makes a default Cancel part of adopting the footer, and I kept it apart from the case version editor because this form has no slot and no Cancel today while that one has both.
sources:
- intake/scope.md
objective: The hypothesis revision form's action row is rendered by the shared ButtonFooter, carrying Save hypothesis and a Cancel that abandons the composition without saving.
criteria:
- hypothesis-revision-form-fields renders its Save hypothesis button through ButtonFooter rather than through its own end-aligned flex row.
- The footer carries a Cancel that abandons the composition before it is submitted, writing no revision and leaving the hypothesis's existing revisions and its case's draft version exactly as they were, and returns the curator to the screen the composition was opened from.
- The Cancel is offered for as long as the composition has not been submitted, and neither its presence nor its enablement turns on how much of the composition was filled in.
- Submitting the form still saves the hypothesis revision through the same call it made before.
- The form still renders hypothesis name, criterion, collects and resolution, with their validation unchanged.
- The subject type is shown read-only and read from the case's draft version and from nowhere else.
- While the case's draft version record has not answered, the form states that the version is still being read and states no attribute of it, presenting neither a partial content nor an empty one as the version's.
- After a save, the screen states the revision number the revise answered, and states nothing further distinguishing a revise that replaced the highest existing revision in place from one that created the next.
- After a save, the route to the draft's manifest is offered where the draft's manifest held no entry for the hypothesis and where the revision written is higher than the revision that entry pinned immediately before, and is not offered where the revise wrote into the very revision that entry already pins.
implements:
- contracts/knowledge/case-lifecycle
- domain/knowledge/case-version
- domain/knowledge/hypothesis
- domain/knowledge/hypothesis-revision
- rules/knowledge/an-abandoned-revision-composition-writes-nothing
- rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
- rules/knowledge/a-revise-answers-the-revision-number-it-saved
- rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move
- rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record
depends_on:
- task/shared-action-footer/button-footer-component
---

## What it is
The new hypothesis screen and the revise hypothesis screen, both reached through hypothesis-revision-screen, getting the shared footer and a Cancel.
It is the only family in this plan where both the footer slot and the Cancel are new.

## Notes
UNDERDETERMINED, from the specification — the availability criterion carries only one of the two exclusions an-abandoned-revision-composition-writes-nothing states, omitting that abandonment does not turn on whether a submit would have replaced the highest existing revision in place or created the next; that branch is readable on the surface before any submit.
The implementation that passes renders Cancel only while the hypothesis's highest existing revision is still draft, hiding it once that revision is released, so a curator composing against a released revision has no way out.
REMAINDER, from the specification — three clauses of a-hypothesis-is-revised-only-against-its-cases-draft reach no criterion here: that a hypothesis is revised only while its case holds a draft, the HTTP 409 CaseHoldsNoDraftError refusal, and that a subject type carried on the request is accepted and left without effect.
They belong to the task delivering the revise-hypothesis operation of contracts/knowledge/case-lifecycle.
REMAINDER, from the specification — the clause of a-draft-versions-content-is-presented-only-from-its-own-record forbidding the creating request's submitted values from being presented as the version's content reaches no criterion here, this form issuing no create-draft.
It belongs to the surface that creates a draft case version.
ADVISORY, from the specification — the binder disclosed the reading behind naming a-draft-versions-content-is-presented-only-from-its-own-record here: its statement is scoped to a newly created draft's content while this form presents the case's standing draft, and it was bound on the expression's quantifier, which every version created through create-draft satisfies.
Where the intended scope is narrower than the expression quantifies, the criterion over the not-yet-answered interval has no node behind it, and a reviewer holding the delivery to this node will meet the same wording.
