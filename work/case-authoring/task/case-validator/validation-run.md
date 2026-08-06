---
title: "Running the checks over one case"
summary: "One validation over one case that runs every check registered for it, refuses the case when any check refuses, and reports every refusal it collected."
rationale: "Every check in this epic is expressed against the same run and the same case, and a check that also decided how checks compose would join an interface to its consumers, so the composition is cut out as one task the checks build on."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
  - intake/escopo-revinculacao-cinco-decisoes.md
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
  - definition/knowledge/refusal
  - rule/knowledge/a-validation-answers-with-every-refusal
  - rule/knowledge/two-positions-are-two-refusals
base: sha256:d196ce9d9e4ee7f02c9a77beaa94aa21caab7c52084e0cc8cd8179fbb099a411
---

## What it is
The one entry point through which a case is validated as one thing, alongside the hypotheses that belong to it.
The composition rule, in which a single refusal is enough to refuse the case and no refusal is lost behind another.
The seam every check in this epic is written against.

## Notes

The criteria are demonstrable with checks written for the demonstration, so nothing here waits on any particular rule's check being delivered.
The counting rule is bound on the binder's own offer — its statement governs what a check produces and it declares no gap, and the run is the one place of this plan where refusals are counted at all, so the epic's claim over it is answered here rather than left to seven checks severally.
UNDERDETERMINED, from the binding — the criteria exercise at most one refusal per refusing check, while the every-refusal rule requires the answer to carry every refusal produced, including the two a single check produces at two positions, which the two-positions rule makes two and never one; what passes is a run collapsing the two refusals one check produced at two positions into one, which the base refuses.
UNDERDETERMINED, from the binding — no criterion states what a reported refusal carries, while the bound refusal construct requires the rule's identifier, the position where it sits at one, and the text for the curator; what passes is a run reporting refusals as opaque messages or a bare count, which the refusal definition refuses.
REMAINDER, from the binding — the every-refusal rule's clause that a check must be safe over a malformed case binds each check's own implementation, this task's checks being parameters of the run; it belongs to the tasks implementing the individual registered checks of this epic.
REMAINDER, from the binding — the aggregate states a case is published whole or not at all, and this task validates and refuses without publishing anything; the publishing clause belongs to the act that turns a case under edit into a published case, which this plan does not hold.
