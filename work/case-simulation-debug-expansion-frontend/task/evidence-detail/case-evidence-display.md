---
title: The case result Debug shows the run's evidence
summary: Every evidence item a case run collected is presented in the case-level Debug,
  with the same per-item detail the per-hypothesis tab gives.
objective: The case result Debug presents one entry per evidence item the shown run
  collected, each carrying that item's concept, result, observed_at, ttl, inputs and
  capability payload notes.
criteria:
- After a case simulation run, the case result Debug presents one entry for each evidence
  item that run returned.
- An evidence item whose result is not ok is presented with its result, and no observation
  is claimed for it.
- Each entry presents that item's observed_at, ttl, inputs and capability payload
  notes.
- Each entry presents concept_description and field semantics from the item's own
  snapshot, issuing no glossary or capability-registry read.
- The entries presented are the shown run's own, so selecting an earlier run in the
  session history presents that run's evidence.
depends_on:
- task/evidence-detail/evidence-adapter-fields
- task/case-run-record/consolidation-debug
rationale: The scope names the case-level Debug as a second place evidence is displayed
  while enumerating only three tabs for it, so cutting the evidence display as a task
  of its own is mine; it sits in this epic rather than the case-run epic because it
  changes for the same reason the other evidence tasks do, and it depends across epics
  on the block that holds it.
sources:
- work/case-simulation-debug-expansion-frontend/intake/scope.md
implements:
- contracts/investigation/case-simulation
- domain/investigation/evidence
- rules/investigation/a-presented-evidence-items-inputs-are-shown-with-a-resolved-credential-masked
- rules/investigation/an-evidence-item-whose-result-is-not-ok-records-an-empty-observation
- rules/investigation/a-simulation-session-retains-its-runs-and-shows-one
- rules/investigation/an-evidence-items-observed-at-is-a-utc-instant
- rules/investigation/an-evidence-items-ttl-is-counted-in-seconds-from-its-own-observation
- rules/investigation/presentation-reads-the-evidence-snapshot
---

## What it is
The case-level counterpart of the per-hypothesis Evidence tab, covering every concept the run collected rather than one hypothesis's own.
A case run collects the deduplicated union of its manifested revisions' concepts, so this is the only place the curator sees all of them at once.

## Notes
The inventory records that both Debug surfaces consume the same adapter output, so this display reuses the per-hypothesis evidence rendering parameterized rather than duplicated.
REMAINDER, from the specification — rules/investigation/an-evidence-item-that-sent-no-inputs-records-an-empty-object states only what a collection records into an evidence item's inputs; no criterion of this task records an evidence item.
Belongs to: the act that writes a collected evidence item's inputs (evidence collection).
REMAINDER, from the specification — rules/investigation/an-evidence-item-whose-result-is-not-ok-records-an-empty-observation is implemented here only through its reader clause; its recording clause reaches no criterion of this task.
Belongs to: the act that writes a collected evidence item's observation (evidence collection).
REMAINDER, from the specification — rules/investigation/a-simulation-session-retains-its-runs-and-shows-one's retention machinery and its evaluations/assessment/cost/durations clauses reach no criterion of this task; only the evidence part and run selection are answered here.
Belongs to: the sibling tasks of this epic that hold the session run history and the other case-result Debug sections.
UNDERDETERMINED, from the specification — Criterion 3 requires each entry to present "that item's observed_at" without saying in which time reference it is rendered, while rules/investigation/an-evidence-items-observed-at-is-a-utc-instant states observed_at is "carried as UTC ... never a local-zone reading of that moment".
A passing implementation that would defeat this as written: an entry that renders the item's observed_at in the viewer's local time zone.
UNDERDETERMINED, from the specification — Criterion 2 requires a non-ok item to be "presented with its result", but rules/investigation/an-evidence-item-whose-result-is-not-ok-records-an-empty-observation states the reader "learns what happened from that item's own result and result_detail instead", and result_detail appears in no criterion.
A passing implementation that would defeat this as written: an entry for a timeout, denied or unavailable item that shows the result value alone and omits result_detail.
