---
title: "Running the checks over one case"
summary: "One validation over one case that runs every check registered for it, refuses the case when any check refuses, and reports every refusal it collected."
rationale: "Every check in this epic is expressed against the same run and the same case, and a check that also decided how checks compose would join an interface to its consumers, so the composition is cut out as one task the checks build on."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
objective: "A validation over one case runs every check registered for that run and refuses the case exactly when at least one registered check refuses it."
criteria:
  - "A run with no check registered does not refuse the case it is given."
  - "A run whose every registered check refuses nothing does not refuse the case it is given."
  - "A run with one registered check that refuses the given case refuses that case."
  - "A run with two registered checks that both refuse the given case reports both refusals."
  - "A run reports no refusal that no registered check produced."
nodes:
  - aggregate/knowledge/cases
  - definition/knowledge/draft-case
  - rule/knowledge/a-validation-answers-with-every-refusal
base: sha256:992232efc4c5444049969a8ae991757bdc82865a72e1ba1deb144660cfb7251f
unresolved:
  - question: "No candidate node states what a refusal carries \u2014 whether it names the check or the rule that produced it, and where in the case \u2014 so the criterion about answering with that refusal, and the one about answering no refusal none of its checks produced, cannot be demonstrated as anything more than the count criterion already states."
---

## What it is
The one entry point through which a case is validated as one thing, alongside the hypotheses that belong to it.
The composition rule, in which a single refusal is enough to refuse the case and no refusal is lost behind another.
The seam every check in this epic is written against.

## Notes

The criteria are demonstrable with checks written for the demonstration, so nothing here waits on any particular rule's check being delivered.
BLOCKING, from the binding — the bound rule decides that a check must be safe over a malformed case, and that is on this task's own path since it runs every later check over a case an earlier one refused; criterion 4 requires only that later checks run, not that they survive.
From the binding — the seven check rules state their refusals as publication refusals while this task states them over a validation, and no candidate node relates the two acts; the publish trigger sits outside the claim and carries its own open gap.
From the binding — eighteen candidates are left unbound, each check rule being its own verdict rather than this task's aggregation; and no candidate node states what determines the set of checks a validation carries.
From the binding — the recipient-is-a-role rule can be bound by no task validating a case, because its own body states it holds over registration and that nothing verifies it; the epic likely needs it uncovered.
