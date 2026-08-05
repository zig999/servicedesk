---
title: "The evaluation of one hypothesis"
summary: "The verdict on one named hypothesis, carrying why it could not decide when the verdict is inconclusive, and keeping the verdict it received whatever an earlier hypothesis did."
rationale: "The scope named the resolution behaviour but not the evaluation it reads, and the evaluation changes for what a verdict records while the resolution changes for how a winner is chosen, so the record is cut out rather than written inside the behaviour that consumes it; the citing obligation is wholly the citations task's, because splitting it out and still stating part of it here would leave one rule demonstrated in two places; an earlier wording about an evaluation reaching no verdict was withdrawn by the decomposer, because a verdict is always carried and the undecided case is the inconclusive one."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
objective: "An evaluation records the verdict on exactly one hypothesis of a case and keeps that verdict, carrying why it could not decide when the verdict it carries is inconclusive."
criteria:
  - "An evaluation reads back the name of the one hypothesis it decided."
  - "An evaluation carries exactly one hypothesis name."
  - "An evaluation constructed without a verdict is refused."
  - "An evaluation reads back the verdict it received."
  - "An evaluation whose verdict is inconclusive reads back why it could not decide."
  - "An evaluation reads back the verdict it received even when a hypothesis the case lists earlier has already confirmed."
depends_on:
  - task/published-case/case-structure
nodes:
  - definition/investigation/evaluation
  - definition/knowledge/hypothesis
  - definition/knowledge/case
  - rule/knowledge/hypotheses-are-ordered-by-precedence
base: sha256:3d7bf173f490f874dc387c6acbeaad9dd61bc643027fe81035bded739b3586af
waived:
  - gap: rule/knowledge/hypotheses-are-ordered-by-precedence#examples
    why: "The gap is that no example order can be given because which cause dominates which is a fact only specialists affirm; this task needs only that a case lists its hypotheses in a declared order and that an earlier confirmation never supersedes a later evaluation, so the absent example order does not reach the objective or any criterion."
---

## What it is

The record a resolution reads, holding one verdict against one hypothesis of a published case.
The identification of the hypothesis by the name that is unique within its case, which is what evaluations are indexed by.
The verdict as a part the record always carries, with the inconclusive verdict as the base's own way of saying that nothing was decided.
The retention of a verdict once received, so a verdict is not suppressed by another hypothesis having won.

## Notes

The criteria say nothing about citations, so the obligation to cite is stated once, in the task cut out for it.
The retention criterion is what keeps a verdict from being made suppressible without failing anything the task states.
BLOCKING, from the binding — the invariant that makes an inconclusive verdict declare its reason sits outside this epic's claim, so criterion 5 rests on a fact the bound definition carries in prose while the rule that makes it mandatory is unbindable here.
BLOCKING, from the binding — the bound evaluation definition states that a confirming or refuting evaluation cites at least one concept and field, and no criterion here answers it, so criteria 3, 4 and 6 can be demonstrated over a decided evaluation carrying no citation, which the base refuses.
From the binding — the clause that a case's declared order is the affirmed precedence is case-authoring scope and reaches no criterion here.
