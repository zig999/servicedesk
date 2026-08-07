---
title: "Hypothesis names are unique within a case"
summary: "The check that refuses the publication of a case whose declared hypotheses include two carrying the same name."
rationale: "The scope named the validating rules as a set and left the cut inside them open, and this rule refuses a different case for a different reason than its neighbours, so it is its own task."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
objective: "Hypotheses declared for one case, two of which share a name, are refused by this check, and hypotheses whose names are all distinct are not refused by it."
criteria:
  - "Hypotheses declared for one case, two of which carry the same name, are refused by this check."
  - "Hypotheses declared for one case, all carrying distinct names, are not refused by this check."
  - "Hypotheses declared separately for two cases, one in each carrying the same name, are each not refused by this check."
depends_on:
  - task/case-validator/validation-run
  - task/published-case/case-structure
nodes:
  - node: aggregate/knowledge/cases
    digest: sha256:cb2f4e40c9d78a66b2b0001e1ba2ed7f45e5bd5f833e89fed97e0ef5dec113c8
  - node: definition/knowledge/hypothesis
    digest: sha256:9bf1a22e47265a35f85bc3332bfcd216434359f95eb169e0c8e4ef33ce823b34
  - node: definition/knowledge/draft-case
    digest: sha256:d462aa67ef753d09497e314fa00d0d9b5279bf0c5cea0063c6dd12a2e1bdcced
  - node: rule/knowledge/hypothesis-name-is-unique-in-its-case
    digest: sha256:289d09e2bdc85e8277a0ebbfe746ac7205cd6419249425b8802f74436c085230
  - node: rule/knowledge/a-validation-answers-with-every-refusal
    digest: sha256:889848c729ee77b4fd4e51b6a436b0080eeaf208532749a45126011704fe21fa
---

## What it is
The structural check that keeps a hypothesis name usable as the index an evaluation is filed under.
A refusal decided over the hypotheses offered for one case, before any published case exists.
A uniqueness decided within one case, never across cases.

## Notes

The check reads hypotheses and the names they carry, and a hypothesis bearing any name is a valid hypothesis on its own, so nothing has to hold an invalid published case for this check to have something to refuse.
The third criterion is what makes the scope of the uniqueness falsifiable, since a check that refused across cases would pass the other two.
UNDERDETERMINED, from the binding — the criteria never state the comparison the check uses while the bound rule states it exactly, character for character, its example saying onu-offline and ONU-Offline are two names it does not refuse; what passes is a check comparing names case-insensitively or after normalisation, refusing a pair the rule's exact comparison explicitly does not.
UNDERDETERMINED, from the binding — the every-refusal rule requires every check to be safe over a malformed case, and no criterion exercises a case whose hypotheses list is absent or whose hypotheses lack names; what passes is a check that assumes a well-formed list and throws on one that is not, while every criterion as written supplies declared hypotheses.
REMAINDER, from the binding — the every-refusal rule's statement clauses, that a validation runs every check whatever an earlier one decided and answers with every refusal produced, reach no criterion of this task; they belong to the validation-run task that assembles the checks.
From the binding — no bound node states what a refusal carries, a message, an identifier or which check produced it; the base admits any refusal construct for criterion 1, and the every-refusal rule implies refusals are attributable to checks, so the shared refusal shape is a seam this check must agree on with the validation run.
The pin was restated deliberately rather than re-bound: the base moved by the five decision nodes, the capability's new output_schema attribute and the corrected citation prose, and none of this task's bound nodes changed its declared gaps or anything a criterion here reads — the lines added to their Rules sections point at rules bound elsewhere in this plan. The validator's totality check over every bound node's open gaps holds that judgment, and it refuses this task if the reading is wrong.
