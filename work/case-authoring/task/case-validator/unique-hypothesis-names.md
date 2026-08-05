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
  - definition/knowledge/draft-case
  - definition/knowledge/hypothesis
  - rule/knowledge/hypothesis-name-is-unique-in-its-case
base: sha256:d70b575981a26bad78e7258ae5219fa37ab23226539ea0652b36aab85e92b092
unresolved:
  - question: "No node states how two hypothesis names are compared for sameness \u2014 whether letter case, surrounding whitespace or any normalisation is significant. The hypothesis types its name as a plain string and the rule states only that two hypotheses of one case must not share one, so the boundary between criterion 1 and criterion 2 is undecided in the base."
---

## What it is
The structural check that keeps a hypothesis name usable as the index an evaluation is filed under.
A refusal decided over the hypotheses offered for one case, before any published case exists.
A uniqueness decided within one case, never across cases.

## Notes

The check reads hypotheses and the names they carry, and a hypothesis bearing any name is a valid hypothesis on its own, so nothing has to hold an invalid published case for this check to have something to refuse.
The third criterion is what makes the scope of the uniqueness falsifiable, since a check that refused across cases would pass the other two.
From the binding — the published case is left unbound, because the case under edit now states what a publication check refuses, so the published value and its three open gaps are off this check's path.
From the binding — the publish trigger sits outside this epic's claim; the case under edit carries the fact that the check refuses it, so the criteria stand without the act.
From the binding — a fixture of two same-named hypotheses still has to be well-formed under the hypothesis's required parts, which is construction and not this check's judgment.
