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
  - definition/knowledge/case
  - definition/knowledge/hypothesis
  - rule/knowledge/hypothesis-name-is-unique-in-its-case
base: sha256:3d7bf173f490f874dc387c6acbeaad9dd61bc643027fe81035bded739b3586af
unresolved:
  - question: "The construct this check reads before publication is the case under edit, which sits outside this epic's claim and whose attributes beyond its slug the base declares absent; no bound node states that a case under edit holds a list of hypotheses for this check to compare."
  - question: "No node states how two hypothesis names are compared for sameness \u2014 exact equality, or normalised for letter case or surrounding whitespace \u2014 so criterion 1's same name and criterion 2's distinct names have no stated boundary between them."
---

## What it is

The structural check that keeps a hypothesis name usable as the index an evaluation is filed under.
A refusal decided over the hypotheses offered for one case, before any published case exists.
A uniqueness decided within one case, never across cases.

## Notes

The check reads hypotheses and the names they carry, and a hypothesis bearing any name is a valid hypothesis on its own, so nothing has to hold an invalid published case for this check to have something to refuse.
The third criterion is what makes the scope of the uniqueness falsifiable, since a check that refused across cases would pass the other two.
BLOCKING, from the binding — the construct a pre-publication check reads is the case under edit, which this epic does not claim and whose shape beyond its slug the base declares absent, so the thing this check refuses is described by no node the task may bind.
