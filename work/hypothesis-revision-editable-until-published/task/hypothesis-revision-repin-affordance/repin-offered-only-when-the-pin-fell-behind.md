---
title: The manifest-builder step is offered only where the save left the pin behind
summary: The hypothesis-editing screen's success surface offering the manifest-builder step only where the revision the save answered differs from the revision the draft pinned going into it.
rationale: Cut as one task rather than two because the overwrite branch and the create branch are one condition read from one comparison, and a screen that hid the offer without still making it would be the same decision half-delivered; the branch for a hypothesis holding no manifest entry is this planning's reading of the scope, which states the offer stands except where the save overwrote the already-pinned revision.
sources:
- intake/scope-frontend.md
depends_on:
- task/hypothesis-revision-repin-affordance/pinned-revision-in-hand-before-a-save
objective: After a save on the hypothesis-editing screen, the manifest-builder step is offered exactly where the revision the save answered differs from the revision the draft's manifest entry pinned going into that save.
criteria:
- After a save answering the same revision number the draft's manifest entry pinned going into it, the screen offers no manifest-builder step.
- After a save answering the same revision number the draft's manifest entry pinned going into it, the screen still states that the hypothesis was saved as that revision number.
- After a save answering a revision number higher than the one the draft's manifest entry pinned going into it, the screen offers the manifest-builder step.
- Activating the offered step navigates to the manifest of the draft case version the screen was opened on, at the same route it navigates to today.
- After a save of a hypothesis that had no entry in the draft case version's manifest, the screen offers the manifest-builder step.
- Three successive saves that each answer the revision number the draft's manifest entry pins leave the screen offering no manifest-builder step after each of them.
- The screen decides the offer from the two revision numbers alone, and offers the step where the answered revision is higher even though the save's answer carries no field distinguishing an overwrite from a created revision.
implements:
- rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move
- rules/knowledge/a-revise-answers-the-revision-number-it-saved
---

## What it is
The success surface comparing the revision the save answered against the revision the draft's manifest entry pinned going into it, and offering the repin route only where those two numbers differ.
A save that overwrote the pinned revision in place leaves the draft's entry pointing at exactly what was just written, so nothing is offered to repin.

## Notes
The survey reports the save's answer carries the hypothesis name and a revision number and no field saying whether a revision was created or overwritten, so the comparison is the only reading available.
The survey reports the manifest screen already decides a comparable disclosure by comparing two revision numbers in hand rather than by reading a flag from the server.
The survey reports existing specifications assert the manifest-builder button is always present after a save, and that no specification anywhere in the tree asserts a conditional one.
The survey reports the manifest builder's own repin call is reached today only by navigating to that screen, and no criterion here asks this screen to call it directly.
UNDERDETERMINED, from the specification — rules/knowledge/a-revise-answers-the-revision-number-it-saved states the saved revision number reaches the curator in both branches; only criterion 2 requires the screen to state it, solely for the save that answered the pinned revision. Criterion 3, covering the save answering a higher revision, requires only the manifest-builder step and nothing about the number. A criterion mirroring criterion 2 for the higher-revision save is missing.
REMAINDER, from the specification — no criterion of this task reaches any clause of rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased's statement (where the write lands, the create branch, revision 1 for a hypothesis holding none); this task's criteria take the answered revision number as given. This belongs to the task of the epic that delivers the revise operation's own behavior.
REMAINDER, from the specification — no criterion of this task reaches rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown's statement; this task consumes one pinned revision number already in hand and presents no manifest. This belongs to task/hypothesis-revision-repin-affordance/pinned-revision-in-hand-before-a-save, together with the epic's manifest-presentation work.
REMAINDER, from the specification — no criterion of this task reaches rules/knowledge/a-hypothesis-is-manifested-at-most-once-in-a-case-version's statement; the criteria rest on the two states that invariant guarantees but demonstrate nothing about enforcing it. This belongs to the epic's manifest-composition work — what place-hypothesis may write into a draft's manifest.
REMAINDER, from the specification — no criterion of this task reaches either clause of rules/knowledge/a-case-has-at-most-one-draft's statement; the criteria speak of "the draft case version the screen was opened on", which that rule makes unambiguous, but neither the uniqueness nor the refusal is demonstrated here. This belongs to the task delivering create-draft and its refusal.
ADVISORY, from the specification — scenarios/knowledge/a-draft-revision-is-overwritten-by-repeated-saves is a candidate whose then-clauses are all store-side facts (the highest revision still numbered 2, the draft's entry still pinning revision 2, no higher revision disclosed) that this screen neither writes nor can demonstrate, so it is left out of implements.
