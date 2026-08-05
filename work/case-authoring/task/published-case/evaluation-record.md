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
  - rule/investigation/an-inconclusive-evaluation-declares-its-reason
base: sha256:d70b575981a26bad78e7258ae5219fa37ab23226539ea0652b36aab85e92b092
waived:
  - gap: definition/knowledge/case#attributes.version.derivation
    why: "This task records the verdict on one hypothesis and never publishes or identifies a case; nothing on its path reads or sets the case version."
  - gap: definition/knowledge/case#attributes.content_hash.derivation
    why: "The evaluation references its hypothesis by name; pinning the case by content belongs to the investigation that replays it, not to recording one verdict."
  - gap: definition/knowledge/case#attributes.no_hypothesis_confirmed.selection
    why: "The fallback resolution applies when no hypothesis confirmed; this task resolves no outcome, and criterion 6 turns on an earlier confirmation rather than on none confirming."
---

## What it is
The record a resolution reads, holding one verdict against one hypothesis of a published case.
The identification of the hypothesis by the name that is unique within its case, which is what evaluations are indexed by.
The verdict as a part the record always carries, with the inconclusive verdict as the base's own way of saying that nothing was decided.
The retention of a verdict once received, so a verdict is not suppressed by another hypothesis having won.

## Notes

The criteria say nothing about citations, so the obligation to cite is stated once, in the task cut out for it.
The retention criterion is what keeps a verdict from being made suppressible without failing anything the task states.
BLOCKING, from the binding — the bound invariant makes the reason mandatory for an inconclusive verdict while the evaluation holds its reason as not required, and criterion 5 only reads a reason back, so no criterion refuses an inconclusive evaluation carrying none and the rule's obligation reaches nothing on this task's own construction path.
From the binding — the one-evaluation-per-hypothesis rule is left unbound, because its statement quantifies over an investigation that no criterion here can satisfy or violate; the epic needs an investigation-level task binding it or an uncovered entry.
From the binding — the precedence rule is left unbound, because criterion 6's content is stated outright on the evaluation and the case, and the rule's own statement is not falsifiable in this task.
From the binding — name-as-identity here rests only on the hypothesis's own identity, since the rule scoping name uniqueness to a case sits outside the candidates.
