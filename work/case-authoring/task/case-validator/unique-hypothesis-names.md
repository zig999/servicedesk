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
  - aggregate/knowledge/cases
  - definition/knowledge/hypothesis
  - definition/knowledge/draft-case
  - rule/knowledge/hypothesis-name-is-unique-in-its-case
  - rule/knowledge/a-validation-answers-with-every-refusal
base: sha256:992232efc4c5444049969a8ae991757bdc82865a72e1ba1deb144660cfb7251f
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
