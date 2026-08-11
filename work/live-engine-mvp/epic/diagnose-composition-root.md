---
title: One composition root runs the real pipeline, fresh, every time
summary: A production factory wires the real judgment and consolidation adapters into the existing synchronous pipeline and calls it directly, never through the window-based dedup layer the specification withdrew.
rationale: >-
  The scope's front 4 explicitly leaves what the composition root needs to the plan, and its
  closing note leaves what to do with the withdrawn dedup code to the plan as well. I decided the
  composition root keeps its observation source as an externally-supplied parameter, the same
  way the existing createDiagnoseRunner already does for all three ports, rather than committing
  to a concrete one of its own — the survey's own risk flagged that building a real
  corporate-records connector under this plan risks duplicating a different, prior task-set's
  already-declared remainder for that exact port, and nothing in this scope's stated objective
  (real LLM calls and an HTTP entry) requires one — the domain's other stores (persistence,
  glossary, capability registry) are already real and file-backed, so no further infrastructure
  adapter is cut here. I also decided the withdrawn dedup code is deleted rather than left
  orphaned, since the amended diagnosis contract states every call is fresh and this project's
  own rule forbids code that states a domain fact the specification no longer holds.
covers:
  - contracts/investigation/diagnosis
  - constraints/diagnosis-answers-synchronously
  - constraints/the-domain-depends-on-no-infrastructure
  - constraints/the-mvp-persists-to-no-database
  - constraints/the-deadline-is-an-absolute-propagated-instant
  - rules/investigation/collection-runs-in-the-requester-scope
  - rules/investigation/an-answer-arrives-within-the-declared-deadline
sources:
  - intake/scope.md
---

## What it is

One new factory assembles the real adapters this plan builds into the already-existing synchronous runner.
The code that joined calls within a window, a rule the specification withdrew today, is removed rather than left reachable or orphaned.

## Notes

None.
