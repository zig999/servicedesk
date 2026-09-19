---
title: The evidence adapter carries the snapshot forward
summary: toDetailEvidence stops dropping inputs, observed_at, ttl and capability_payload_notes
  on the way to the Debug surfaces.
objective: toDetailEvidence returns a DetailEvidenceItem carrying inputs, observed_at,
  ttl and capability_payload_notes from the response item it is given, instead of
  discarding them.
criteria:
- DetailEvidenceItem declares one field for each of inputs, observed_at, ttl and capability
  payload notes.
- toDetailEvidence, given a response evidence item carrying all four, returns a DetailEvidenceItem
  carrying each of the four values unchanged.
- toDetailEvidence derives those four values from its argument alone, issuing no glossary
  read and no capability-registry read.
- Given an item whose capability payload notes are empty, the returned item carries
  that emptiness rather than a substituted value.
- Given an item collected with no inputs, the returned item carries what the response
  sent rather than an invented placeholder.
depends_on:
- task/evidence-detail/evidence-wire-fields
rationale: Cut apart from both displays because the adapter is the one seam the inventory
  names as feeding two surfaces, and a task that widened the seam and its consumers
  in one breath could not be shown met without finishing both displays.
sources:
- work/case-simulation-debug-expansion-frontend/intake/scope.md
implements:
- domain/investigation/evidence
- rules/investigation/presentation-reads-the-evidence-snapshot
- rules/investigation/an-evidence-items-observed-at-is-a-utc-instant
- rules/investigation/an-evidence-items-ttl-is-counted-in-seconds-from-its-own-observation
- rules/investigation/an-evidence-item-that-sent-no-inputs-records-an-empty-object
---

## What it is
The single conversion point from a wire-shaped evidence item to the UI-facing item both Debug blocks read.
Widening it is what makes the four added attributes reachable by any surface at all.

## Notes
The inventory records this function as the place new fields extend rather than being re-derived elsewhere.
REMAINDER, from the specification — rules/investigation/an-evidence-item-whose-result-is-not-ok-records-an-empty-observation reaches no criterion of this task: observation is not among the four attributes this task's objective and criteria carry.
Belongs to: the collection act that records an evidence item's observation, result and result_detail.
REMAINDER, from the specification — rules/investigation/a-simulation-session-retains-its-runs-and-shows-one reaches no criterion of this task; the adapter maps one argument and addresses no run retention or selection.
Belongs to: the task implementing the simulation session's run history and run selection.
