---
title: Cockpit simulation staleness specification binding
summary: Binds the two newly-written staleness nodes -- the rule and its concrete scenario -- to the already-delivered
  cockpit mechanism that implements them.
rationale: The scope names five further impact-set nodes only because the rule's own `constrains` and
  the scenario's own `involves` reference them for domain vocabulary (assessment, evaluation, case-version,
  hypothesis-revision, the case-simulation contract) -- none of them is a node this initiative's work
  changes, adds proof for, or takes a position on, so `covers` names only the rule and the scenario the
  scope itself asks to bind; the plan does not claim the other five at all, rather than claiming and then
  excusing them, because nothing here touches what they state. A single epic holds the whole scope because
  the scope names one small, already-delivered, single-file change with no internal seam to separate.
sources:
- work/simulation-result-staleness-binding/intake/scope.md
covers:
- rules/investigation/a-simulation-result-is-stale-once-its-source-changes
- scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result
---

## What it is

The epic that binds rules/investigation/a-simulation-result-is-stale-once-its-source-changes and scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result to the cockpit's already-delivered return-from-editing staleness mechanism.
Its one task corrects a stale citation and adds the one test the delivered suite still lacks, with no change to runtime behavior.

## Notes

None.
