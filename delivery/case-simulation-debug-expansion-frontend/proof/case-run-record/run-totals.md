---
target: frontend
title: Run totals presented in the case result Debug block
summary: Tests the new CaseSimulationCaseResultTotalsTab and its wiring into the panel's
  Debug tabs, covering the run's cost, its durations (including the no-writing boundary
  and the total-is-not-a-stage-sum requirement), and that the shown figures follow
  the shown run.
implementation: sha256:5fcdb5b5caf2f40f98f73249ccda1603b1e3c64d7dedb4022456c33cd1831afa
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/case-run-record-run-totals-suite
tests:
- file: src/routes/case-simulation-case-result-totals-tab.spec.ts
  name: 'CaseSimulationCaseResultTotalsTab -- the run''s own cost totals (criteria
    1, 2): renders the run''s total call count and its total input and output token
    counts'
  proves: criteria 1 and 2
  fails_when: the block stops presenting the run's total call count, total input tokens,
    or total output tokens
- file: src/routes/case-simulation-case-result-totals-tab.spec.ts
  name: 'CaseSimulationCaseResultTotalsTab -- durations shown as the run''s own recorded
    figures (criterion 3; UNDERDETERMINED -- total is not a stage sum): renders the
    run''s collection, judgment and total durations, with total taken from the run''s
    own recorded total rather than the sum of the stages it also shows'
  proves: criterion 3, and the excluded stage-summing implementation
  fails_when: the block stops presenting collection/judgment/total, or computes the
    shown total by summing stages instead of reading the run's own recorded totalMs
- file: src/routes/case-simulation-case-result-totals-tab.spec.ts
  name: 'CaseSimulationCaseResultTotalsTab -- no writing figure when the run recorded
    none (criterion 4): shows no writing figure at all for a run whose durations carry
    no writingMs, rather than a zero'
  proves: criterion 4
  fails_when: the block shows any writing figure, including a zero, for a run whose
    durations carry no writingMs
- file: src/routes/case-simulation-case-result-panel-totals.spec.ts
  name: 'CaseSimulationCaseResultPanel -- the Totals tab reflects the shown run (criterion
    5): presents the earlier run''s own cost and durations once that run is shown,
    in place of the last run''s'
  proves: criterion 5
  fails_when: the Totals tab keeps showing the previously-shown run's cost after an
    earlier run's Show button is clicked
not_applicable:
- edge_case: A run record with a missing or partial cost or durations value.
  why: CaseResultRun declares both cost and durations as non-optional fields, and
    every returned run record carries both
- edge_case: A dependency failing or answering slowly, or two operations racing against
    one subject at once.
  why: the component performs no fetch, mutation or async operation of its own
- edge_case: A duplicate or reordered run in the session's run list.
  why: run identity, ordering and selection mechanics are the concern of other tasks
untested:
- 'contracts/investigation/case-simulation: this task''s UI renders only the cost/durations
  portion of the simulate-case side of the record; a test asserting that slice would
  assert part of the identity as if it were the whole.'
- 'rules/investigation/a-simulation-session-retains-its-runs-and-shows-one: this task''s
  own Notes mark the evidence/evaluations/assessment portions and the retention/selection
  mechanics as REMAINDER belonging to other tasks; this task''s test demonstrates
  only that the cost/durations slice follows the shown run.'
- 'rules/investigation/a-simulated-hypothesis-returns-the-runs-cost-and-durations:
  this task ships no simulate-hypothesis Debug surface, and the implementation record
  itself notes this node is honored by inheritance, not reached by any code this task
  added.'
- 'domain/investigation/cost: the node''s fact includes a computation invariant (N
  hypotheses cost N judgment calls plus one writing call, linear in hypotheses) that
  this component has no hypothesis count to check against; the tests here demonstrate
  only that the three attributes are rendered unmodified.'
- 'domain/investigation/durations: the node''s fact includes a backend measurement
  invariant about when and how total was produced, which a frontend rendering test
  cannot observe; the tests here demonstrate the total is rendered as given and that
  writing''s presence is conditional, but not the measurement invariant itself.'
---

## What it is
The proof for task/case-run-record/run-totals: that the case result Debug's Totals tab presents the shown run's own call count, token totals, and stage durations (with the no-writing boundary and the total-is-not-a-stage-sum requirement both covered), and that it follows the shown-run selection.

## Notes
None.
