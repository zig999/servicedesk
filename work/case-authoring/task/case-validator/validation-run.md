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
  - definition/knowledge/case
base: sha256:3d7bf173f490f874dc387c6acbeaad9dd61bc643027fe81035bded739b3586af
unresolved:
  - question: "No node states whether a validation that refuses a case reports every refusal it collected or stops at the first. The rule nodes' examples say only that publication is refused, and the aggregate backs running the checks over the whole case without saying what the refusal answers with. Criterion 4 turns on this."
  - question: "No node describes a per-run registry of checks. The aggregate states the contract checks run over the whole case and never that the set is configurable or may be empty, so the base does not say whether a run with no check registered is a legitimate state. Criteria 1 and 5 turn on it."
---

## What it is

The one entry point through which a case is validated as one thing, alongside the hypotheses that belong to it.
The composition rule, in which a single refusal is enough to refuse the case and no refusal is lost behind another.
The seam every check in this epic is written against.

## Notes

The criteria are demonstrable with checks written for the demonstration, so nothing here waits on any particular rule's check being delivered.
BLOCKING, from the binding — criterion 4 asserts what the system answers, and no bound node states that every refusal is reported rather than the first; that is a fact the base must hold before the criterion is demonstrated.
From the binding — the aggregate's clause that a case is published whole or not at all reaches no criterion, because this task runs the checks and refuses but never publishes.
From the binding — the refusal this check names is a publication-time refusal, and the publish act itself lives in the publication lifecycle, outside this epic's claim. If this run is the publish gate, that node's open gap over who approves a publication reaches this task.
