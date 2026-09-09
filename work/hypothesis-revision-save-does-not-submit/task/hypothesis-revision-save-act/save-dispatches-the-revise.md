---
title: Save dispatches the revise
summary: The hypothesis revision screen's save control reaches the revise, in the DOM shape the running application
  actually has.
objective: A curator's save on the hypothesis revision screen, in the DOM shape the running application has, issues
  a revise request for the hypothesis the route names and states to the curator the revision number the content
  was saved as.
criteria:
- With the footer slot present, so the portal the application takes is taken, the screen's save control has the
  screen's own form as its form owner.
- With the footer slot present and every field of the composition filled, activating the save control issues a revise
  request for the hypothesis the route names.
- With the footer slot present and a revise answered, the revision number that answer states is stated to the curator.
- With the footer slot present, activating the abandon control issues no revise request, leaves the hypothesis's
  existing revisions and its case's draft version exactly as they were, and returns the curator to the screen the
  composition was opened from.
implements:
- domain/knowledge/hypothesis
- domain/knowledge/hypothesis-revision
- rules/knowledge/a-revise-answers-the-revision-number-it-saved
- rules/knowledge/an-abandoned-revision-composition-writes-nothing
sources:
- intake/scope.md
---

## What it is

The correction of one wrong behavior observed by running the delivered system: the save control on the hypothesis revision screen dispatches nothing, because it is a submit control that owns no form once the app shell's footer portal moves it out of the form's DOM subtree.
The proof owed is a proof that fails when the defect returns, which means mounting the screen with the footer slot present so the portal the application takes is actually taken.

## Notes

The objective was written as "issues exactly one revise request" and the two words were removed before this file was written, because no specification node states a duplicate-dispatch guarantee and a task node is not a second home for a fact the specification does not hold.
No criterion moved with that removal.

UNDERDETERMINED, from the specification — no criterion reaches rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move, whose statement says a curator who has just revised a hypothesis is offered a route to that case's draft version's manifest whenever the revision written is higher than the one that draft's entry pinned immediately before, and whenever that draft's manifest holds no entry for the hypothesis at all.
This task's objective stops at issuing the revise and stating the revision number, so the offer a completed revise owes is unanswered here.
Passes: a save control that dispatches the revise and displays the answered revision number, and never offers any route to the case's draft version's manifest, in either of the two branches the rule requires the offer in.

UNDERDETERMINED, from the specification — criterion 4 tests only an activated abandon control, and does not reach the availability clause of rules/knowledge/an-abandoned-revision-composition-writes-nothing, which states that abandonment is available for as long as the composition has not been submitted and turns on nothing else: not on whether a submit would have replaced the hypothesis's highest existing revision in place or created its next revision, and not on how much of the composition was filled in.
Passes: a screen whose abandon control is present only while the composition is still empty, hidden or disabled once fields are filled, or present only in one of the two save branches, since every criterion here is stated with the abandon control activated.

UNDERDETERMINED, from the specification — criterion 2 requires only that activating save issues a revise request for the hypothesis the route names, and no criterion states that the request carries the composition's content, which rules/knowledge/a-hypothesis-declares-a-criterion, rules/knowledge/a-hypothesis-collects-at-least-one-concept and rules/knowledge/every-position-declares-a-resolution state a revise must hold, in the shape domain/knowledge/hypothesis-revision's own attributes declare.
Passes: a save control that dispatches a revise request naming the route's hypothesis while carrying none of the filled composition, which satisfies criterion 2 as written and which the specification refuses as a revise.

REMAINDER, from the specification — the refusal clauses of four covered Rules reach no criterion of this task: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft, including its HTTP 409 CaseHoldsNoDraftError and its reading of the subject type from the draft version and nowhere else; rules/knowledge/a-concept-accepts-the-declared-subject-type and its HTTP 422 ConceptRefusesSubjectTypeError; rules/knowledge/case-terms-exist-in-the-glossary and its HTTP 404 ConceptNotInGlossaryError; and the collects-none refusal of rules/knowledge/a-hypothesis-collects-at-least-one-concept.
Every criterion here is stated over a filled composition and an answered revise, so none of those refusals is exercised.
Belongs: the revise-hypothesis operation's own validation and refusal answers, server-side, and whatever task states what this screen discloses when a revise is refused.

REMAINDER, from the specification — rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased states where a revise's write lands, in place on the hypothesis's own highest existing revision, or as its next revision where that one is released, with revision 1 for a hypothesis holding none, and no criterion of this task addresses the landing.
Belongs: the revise-hypothesis operation's own write placement, delivered server-side.

REMAINDER, from the specification — the second clause of rules/knowledge/a-revise-answers-the-revision-number-it-saved, that the number is the whole of what the answer says about which revision was written and the answer holds no field whose value differs between an in-place replacement and a created next revision, is a condition on the answer's shape that criterion 3 does not reach.
Belongs: the revise-hypothesis answer's shape, delivered server-side with that operation.

ADVISORY, from the specification — criterion 1 and the footer-slot precondition of criteria 2 to 4 rest on no covered node, because both governing Rules place the control's identity outside themselves: an-abandoned-revision-composition-writes-nothing says which control carries the abandonment, its wording and where it sits are form and belong to the interface, and a-revise-answers-the-revision-number-it-saved says the same of which control carries the number.
Those criteria are backed by the running application's own DOM, recorded in the scope, and never by a node in implements.

ADVISORY, from the specification — no covered node states a duplicate-dispatch guarantee, and what a second dispatch would do is decided by rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased, which no criterion of this task reaches.
