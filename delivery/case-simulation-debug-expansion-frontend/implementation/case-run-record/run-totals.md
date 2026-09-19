---
target: frontend
title: Case-level Debug gains a run-totals tab
summary: The case result Debug block adds a Totals tab presenting the shown run's
  own cost totals and stage durations, reading from CaseResultRun's already-carried
  cost and durations fields.
task: sha256:c2fefc7feb8d1fe31d1f1d215967f1b7b7e4323ddb617a28c87a99cab8fe5d22
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/case-run-record-run-totals-build
files:
- path: src/routes/case-simulation-case-result-totals-tab.tsx
  effect: new CaseSimulationCaseResultTotalsTab component; renders total calls and
    input/output token counts, then collection/judgment/(writing)/total durations,
    with writing shown only when durations.writingMs is defined; reads durations.totalMs
    directly rather than summing stage figures
- path: src/routes/case-simulation-case-result-panel.tsx
  effect: added a second Debug tab, Totals, beside the existing Prompt tab; its TabsContent
    renders CaseSimulationCaseResultTotalsTab with cost={shownRun.cost} and durations={shownRun.durations}
criteria:
- criterion: The block presents the run's total call count.
  met: true
  how: renders {cost.calls} calls from the shown run's CaseResultCost
- criterion: The block presents the run's total input token count and its total output
    token count.
  met: true
  how: renders {cost.inputTokens} tokens in / {cost.outputTokens} tokens out
- criterion: The block presents the run's collection, judgment and total durations.
  met: true
  how: renders durations.collectionMs, durations.judgmentMs and durations.totalMs
- criterion: A run that recorded no writing duration is presented with no writing
    figure rather than with a zero.
  met: true
  how: durations.writingMs !== undefined gates the writing segment, mirroring the
    existing DurationsLine convention
- criterion: The totals presented are the shown run's own, so selecting an earlier
    run in the session history presents that run's totals.
  met: true
  how: the panel passes shownRun.cost and shownRun.durations; clicking Show on an
    earlier run updates shownRunId, and the Totals tab re-renders from that run's
    own values
nodes:
- node: contracts/investigation/case-simulation
  encoded_at:
  - src/routes/case-simulation-case-result-totals-tab.tsx
  how: presents part of what simulate-case's own record already returns (cost, durations)
    to the curator
- node: rules/investigation/a-simulation-session-retains-its-runs-and-shows-one
  encoded_at:
  - src/routes/case-simulation-case-result-panel.tsx
  how: the Totals tab reads exclusively from shownRun, the same run object the rest
    of the panel already reads from
- node: rules/investigation/a-simulated-hypothesis-returns-the-runs-cost-and-durations
  how: not reached by this task's own code; honored by inheritance since the fields
    it requires are the same value-objects this component renders, not by any logic
    this task added
- node: domain/investigation/cost
  encoded_at:
  - src/routes/case-simulation-case-result-totals-tab.tsx
  how: rendered as-is with no recomputation
- node: domain/investigation/durations
  encoded_at:
  - src/routes/case-simulation-case-result-totals-tab.tsx
  how: rendered per its own stated shape and conditional-presence rule, with totalMs
    read directly rather than computed by summing stages
inferences:
- inferred: The totals land as a second Debug tab (Totals) alongside the existing
    Prompt tab, rather than as a line rendered outside the Tabs.
  from: the task's own rationale leaves this as form; the inventory's Tabs-per-concern
    convention was the closest precedent
- inferred: Tab label Totals and the two-line grouping (calls+tokens on one line,
    durations on a second line).
  from: no node names a label or visual grouping; chosen for readability following
    the existing DurationsLine's single-line-per-concern style
preserved:
- The existing Prompt tab (CaseSimulationCaseResultDebugTab) and its consolidationCall/register
  props, unchanged.
- Tabs defaultValue="prompt", so the panel opens on the same tab as before this change.
- The shownRun/shownRunId derivation and the Runs this session list/Show button behavior,
  untouched.
deferred:
- what: Presenting the shown run's evidence items, evaluations and assessment from
    its own record.
  why: the task's own Notes mark this REMAINDER, belonging to a different task
- what: Surfacing cost/durations for a simulate-hypothesis run's own Debug.
  why: outside this task's scope, which covers only the case-level Case result Debug
    block
---

## What it is
The one place a curator can learn what simulating the whole case cost, now landed as a second Debug tab beside the Prompt tab, reading from the shown run's own cost and durations.

## Notes
None.
