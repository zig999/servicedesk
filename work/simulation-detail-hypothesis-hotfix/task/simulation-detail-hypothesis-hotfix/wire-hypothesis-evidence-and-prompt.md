---
title: Wire hypothesis-simulation evidence and judgment-call data through to the Detail
  panel
summary: A single-hypothesis simulation's own evidence and prompt/usage/elapsed_ms,
  already present in the dispatch response, currently never reach the Detail panel's
  Evidence and Prompt tabs.
objective: On the case-simulation screen, after simulating one hypothesis (POST /v1/simulate/hypothesis),
  the Detail panel's Evidence tab shows that response's own evidence, and the Prompt
  tab shows the real prompt whenever the underlying evaluation actually carries prompt/usage/elapsed_ms
  -- falling back to its existing "never called" message only when the evaluation
  genuinely carries none of them (the no-data case).
criteria:
- Simulating a single hypothesis whose response carries one or more evidence items
  renders those items in the Detail panel's Evidence tab, the same way a full-case
  simulation's own evidence already renders there.
- Simulating a single hypothesis whose response carries no evidence (an empty array)
  renders the Evidence tab's existing empty-state content, not an error.
- Simulating a single hypothesis whose evaluation carries prompt, usage and elapsed_ms
  renders the Prompt tab showing that real prompt text, not the "Judgment was never
  called for this hypothesis." placeholder.
- Simulating a single hypothesis whose evaluation carries no prompt, no usage and
  no elapsed_ms (an inconclusive evaluation with reason no-data) still renders the
  Prompt tab's existing "Judgment was never called for this hypothesis." placeholder.
- Simulating a full case (POST /v1/simulate) whose per-hypothesis evaluation carries
  prompt, usage and elapsed_ms renders that hypothesis's own Prompt tab showing the
  real prompt, the same fix applying to the case-level path since case-simulation-cockpit-adapters.ts's
  toDetailJudgmentCall serves both.
- Neither the Evidence tab's nor the JSON tab's own existing rendering of a full-case
  simulation's evidence changes.
- The concept Select's own identity and the rest of the Detail panel (verdict dot,
  citations list, criterion text, stale indicator) are unaffected.
implements:
- domain/investigation/evaluation
- domain/investigation/evidence
- domain/investigation/evaluation-reason
- contracts/investigation/case-simulation
sources:
- intake/scope.md
---

## What it is
Two files: use-case-simulation-cockpit.ts (must stop discarding a hypothesis-sourced response's own evidence) and case-simulation-cockpit-adapters.ts (toDetailJudgmentCall must stop unconditionally answering no call happened).

## Notes
Advisory, from the execution-contract-binder -- domain/investigation/investigation governs nothing this task's objective or criteria need.
Its Description ties model and prompt_version to the aggregate a diagnose call writes, and contracts/investigation/case-simulation itself states neither simulate-case nor simulate-hypothesis ever writes an investigation.
Since this task's whole scope is what a simulate response already carries before any investigation record could exist, nothing on domain/investigation/investigation is read, written, or rendered by the criteria here; the epic's own uncovered entry records why that candidate is not implemented.
