---
title: The per-hypothesis Evidence tab shows the whole item
summary: observed_at, ttl, inputs and capability payload notes appear per evidence
  item in the existing Debug panel.
objective: The per-hypothesis Debug's Evidence tab presents each item's observed_at,
  ttl, inputs and capability payload notes alongside what it already shows.
criteria:
- For each evidence item, the tab presents that item's observed_at as the UTC instant
  the item carries.
- For each evidence item, the tab presents its ttl as a count of seconds read from
  that item's own observed_at.
- For each evidence item, the tab presents the inputs that collection was issued with.
- For each evidence item, the tab presents the capability payload notes exactly as
  that item snapshotted them.
- An item whose capability payload notes are empty is presented with no notes rather
  than with text drawn from anywhere else.
- The tab presents concept_description and field semantics from the item's own snapshot
  and issues no glossary or capability-registry read to enrich, refresh or substitute
  for it.
depends_on:
- task/evidence-detail/evidence-adapter-fields
rationale: 'Showing inputs is the resolution of the open question the scope left to
  planning, and it is a resolution rather than a decision: contracts/investigation/case-simulation
  faces the whole record to the curator and rules/investigation/the-customer-sees-only-the-text
  puts the evidence on the operation''s side of that line, so withholding a required
  attribute from the curator would be the new fact about who may see what, and a new
  fact belongs to /analyse and not to this plan.'
sources:
- work/case-simulation-debug-expansion-frontend/intake/scope.md
implements:
- contracts/investigation/case-simulation
- domain/investigation/evidence
- rules/investigation/a-presented-evidence-items-inputs-are-shown-with-a-resolved-credential-masked
- rules/investigation/an-evidence-items-observed-at-is-a-utc-instant
- rules/investigation/an-evidence-items-ttl-is-counted-in-seconds-from-its-own-observation
- rules/investigation/presentation-reads-the-evidence-snapshot
---

## What it is
The Evidence tab of the Debug panel that opens when a hypothesis row is selected.
It already shows concept, result, capability and connector, elapsed time, concept description, field semantics and the raw observation.
This task adds the four attributes the response carried all along.

## Notes
The inventory names the observation pretty-printing and the result status-dot mapping as existing machinery this tab must reuse rather than duplicate.
UNDERDETERMINED, from the specification — rules/investigation/an-evidence-item-that-sent-no-inputs-records-an-empty-object states only what is recorded at collection (`{}` for a parameterless or never-issued call); nothing in this task's criteria fixes how the tab renders an item whose recorded inputs are that empty object.
A passing implementation that would defeat this as written: a tab that omits the inputs display entirely for every evidence item whose recorded inputs are `{}`, showing inputs only for items that carried parameters.
REMAINDER, from the specification — rules/investigation/an-evidence-item-whose-result-is-not-ok-records-an-empty-observation reaches no criterion of this task; no criterion addresses observation at all.
Belongs to: the collection act that records an evidence item's observation, result and result_detail.
REMAINDER, from the specification — rules/investigation/a-simulation-session-retains-its-runs-and-shows-one reaches no criterion of this task; this task's criteria are per-item within one shown run and say nothing about which run is shown or about run history.
Belongs to: the task covering the simulation surface's session run history — retaining the session's runs, showing one at a time, and swapping the shown run's record on selection.
