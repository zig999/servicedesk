---
title: "A hypothesis collects at least one concept"
summary: "The check that refuses a case holding a hypothesis that collects nothing."
rationale: "The scope named the validating rules as a set and left the cut inside them open, and this rule refuses a different case for a different reason than its neighbours, so it is its own task."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
objective: "A case holding a hypothesis that collects no concept is refused by this check, and a case whose every hypothesis collects at least one concept is not refused by it."
criteria:
  - "A case holding one hypothesis that collects no concept is refused by this check."
  - "A case whose every hypothesis collects at least one concept is not refused by this check."
  - "A case whose only failing hypothesis is not the one it lists earliest is still refused by this check."
depends_on:
  - task/case-validator/validation-run
  - task/published-case/case-structure
nodes:
  - node: rule/knowledge/hypothesis-collects-at-least-one-concept
    digest: sha256:abd47448fabd44ecaa627082d5e4a7d8cb8db6a3968c051bd1a1c32588de5b25
  - node: definition/knowledge/hypothesis
    digest: sha256:9bf1a22e47265a35f85bc3332bfcd216434359f95eb169e0c8e4ef33ce823b34
  - node: definition/knowledge/draft-case
    digest: sha256:d462aa67ef753d09497e314fa00d0d9b5279bf0c5cea0063c6dd12a2e1bdcced
  - node: aggregate/knowledge/cases
    digest: sha256:cb2f4e40c9d78a66b2b0001e1ba2ed7f45e5bd5f833e89fed97e0ef5dec113c8
  - node: rule/knowledge/a-validation-answers-with-every-refusal
    digest: sha256:889848c729ee77b4fd4e51b6a436b0080eeaf208532749a45126011704fe21fa
---

## What it is
The structural check standing behind the base's statement that a hypothesis collecting nothing could never cite anything.
A refusal decided per hypothesis, over every hypothesis of the case.

## Notes

The third criterion fixes that the check reads every hypothesis rather than the one it reaches soonest.
UNDERDETERMINED, from the binding — the every-refusal rule names this check by name, saying it walks a case with no hypothesis at all without failing and simply refuses nothing, and no criterion reaches that clause; what passes is a check that satisfies all three criteria as written but raises or aborts when handed a case whose hypothesis list is empty or absent, instead of walking it without failing and refusing nothing.
REMAINDER, from the binding — the every-refusal rule's statement clauses, that a validation runs every check whatever any earlier one decided and answers with every refusal those checks produced, reach no criterion of this task, which delivers one check and not the run; they belong to the validation-run task under the same epic.
REMAINDER, from the binding — the aggregate states a case is published whole or not at all, and this check reads the whole case but publishes nothing; the publication-wholeness clause belongs to the publication act, which this plan does not hold.
From the binding — no bound node states what a refusal of this check carries, whether it names the failing hypothesis or is bare; the criteria are satisfiable either way, and the shape of one refusal is a form decision the base does not constrain.
The pin was restated deliberately rather than re-bound: the base moved by the five decision nodes, the capability's new output_schema attribute and the corrected citation prose, and none of this task's bound nodes changed its declared gaps or anything a criterion here reads — the lines added to their Rules sections point at rules bound elsewhere in this plan. The validator's totality check over every bound node's open gaps holds that judgment, and it refuses this task if the reading is wrong.
