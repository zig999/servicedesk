---
type: policy
statement: A curator's simulation surface retains the runs made during a session and shows one of them
  at a time, presenting every part of the shown run — its evidence, its evaluations, its assessment, its
  cost and its durations alike — from that run's own returned record, so that selecting an earlier run
  from the session's history presents that run's record in place of the one shown.
constrains:
  - domain/investigation/evidence
  - domain/investigation/evaluation
  - domain/investigation/assessment
  - domain/investigation/cost
  - domain/investigation/durations
consistency: eventual
---

## Description

A simulation writes no investigation, emits no event and lets nothing it collects reach a cache (rules/investigation/a-simulation-writes-no-investigation), so the record a run returns is the only account of that run that will ever exist: the moment the surface drops it, nothing anywhere can answer what that run collected, what it judged, what it cost or how long it took. Keeping the session's runs is what lets a curator compose a subject, run it, change one attribute, run it again and read the two against each other — the comparison the curator's own entry to the engine exists for (contracts/investigation/case-simulation).

Presenting the shown run from its own record is the load-bearing half. A surface that lists runs but draws what it shows from whatever the most recent call returned states, of the run named beside those figures, something that run never returned — evidence a later call collected, a cost no part of it incurred, a consolidation prompt it never sent. The honesty rules/investigation/presentation-reads-the-evidence-snapshot demands of one evidence item against a live registry is the same demand made here of a whole run against its siblings.

The retention is the session's and no store's: nothing outlives the curator leaving, and nothing retained here is ever read back into a later collection — a retained run is a record on a screen, never a cached observation (scenarios/investigation/a-simulation-never-enters-the-cache). The history named here is the one rules/investigation/a-simulation-result-is-stale-once-its-source-changes already reads a shown result as coming from, and the result its scenarios mark stale is whichever run this rule has the surface showing.
