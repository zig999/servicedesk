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
base: sha256:d70b575981a26bad78e7258ae5219fa37ab23226539ea0652b36aab85e92b092
unresolved:
  - question: "No node states whether a validation over a case reports every refusal it collected or stops at the first one \u2014 the base states only that each check refuses publication, never how a run carrying several of them answers."
  - question: "No node states that the checks over a case are registered per run rather than fixed as the base's publication invariants; the only registry the base holds is the capability registry. So nothing says whether no check registered or one check registered is a state the base admits, nor what a case is answered in it."
---

## What it is
The one entry point through which a case is validated as one thing, alongside the hypotheses that belong to it.
The composition rule, in which a single refusal is enough to refuse the case and no refusal is lost behind another.
The seam every check in this epic is written against.

## Notes

The criteria are demonstrable with checks written for the demonstration, so nothing here waits on any particular rule's check being delivered.
BLOCKING, from the binding — criterion 4 and the summary assert what the system answers over several refusals, and no bound node, and no node in the base, states that every refusal is reported rather than the first.
From the binding — the case under edit is what every publication check reads, so this task binds the draft; the published value and its three open gaps belong to the publication act rather than to this run.
From the binding — the seven publication-check rules are left unbound, because this task builds the run and encodes no individual check, and a record answering it could not answer them.
From the binding — two clauses of the bound nodes reach no criterion, both belonging to the publication act: that a case is published whole or not at all, and that a case under edit becomes published only through publication.
