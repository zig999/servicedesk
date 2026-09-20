---
target: frontend
title: CaseResultRun carries its own run's durations, cost, consolidation record and
  payload
summary: Widens CaseResultRun/NewCaseResultRun with the run's durations, cost, a discriminated
  consolidation-call record and the raw simulate-case payload, fills all of it in
  toNewCaseResultRun from the simulate-case response, and completes five pre-existing
  test fixtures that construct these types.
task: sha256:765a39ee4918eb8fd5ecd36ed084db65669a33b12d49c8fd3470b2503dbb9ec2
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/case-run-record-run-carries-its-record-build-2
files:
- path: src/routes/case-simulation-case-result-types.ts
  effect: declares CaseResultUsage, CaseResultCost and CaseResultConsolidationCall
    (a discriminated union on `called`), and widens CaseResultRun with required durations,
    cost, consolidationCall and rawResponse fields
- path: src/routes/case-simulation-cockpit-adapters.ts
  effect: 'adds a toCost adapter (SimulateCaseResult -> CaseResultCost) and extends
    toNewCaseResultRun to also fill durations (via the existing toDurations adapter),
    cost (via toCost), consolidationCall (built as { called: true, usage, elapsedMs,
    prompt } from the response''s assessment) and rawResponse (the whole SimulateCaseResult,
    unmodified)'
- path: src/hooks/use-case-simulation-history.spec.ts
  effect: its local newRun() fixture builder now sets durations, cost, consolidationCall
    and rawResponse defaults so every literal built through it satisfies the widened
    NewCaseResultRun type
- path: src/routes/case-simulation-case-result-compare.spec.ts
  effect: its local makeRun() fixture builder gained the same four defaults to satisfy
    the widened CaseResultRun type
- path: src/routes/case-simulation-case-result-panel-compare.spec.ts
  effect: its local makeRun() fixture builder gained the same four defaults
- path: src/routes/case-simulation-case-result-panel.spec.ts
  effect: its local makeRun() fixture builder gained the same four defaults
- path: src/routes/case-simulation-case-result-types.spec.ts
  effect: its local makeRun() fixture builder gained the same four defaults
criteria:
- criterion: CaseResultRun declares fields for the run's durations, its cost, the
    consolidation call's prompt, usage, elapsed_ms and register, and the whole payload
    the simulate call returned.
  met: true
  how: 'CaseResultRun now carries durations (SimulationDurations, reused), cost (CaseResultCost),
    consolidationCall (CaseResultConsolidationCall, carrying prompt, usage and elapsedMs
    when called: true), the pre-existing required register field, and rawResponse:
    unknown for the whole payload.'
- criterion: toNewCaseResultRun fills each of those fields from the simulate-case
    response it is given.
  met: true
  how: toNewCaseResultRun sets durations via toDurations(result), cost via toCost(result),
    consolidationCall from result.assessment.usage/elapsed_ms/prompt, and rawResponse
    to the whole result object it received.
- criterion: After two case simulation runs in one session, the earlier entry still
    carries its own durations, cost, consolidation record and payload, unchanged by
    the later run.
  met: true
  how: useCaseSimulationHistory.recordRun appends a freshly built object to an array
    via setRuns((previous) => [...previous, newRun]); no prior entry is read back
    into, mutated by, or shared with a later call.
- criterion: Every existing producer of a run entry constructs the widened shape,
    so no call site is left building an incomplete run.
  met: true
  how: The sole production producer (toNewCaseResultRun, called from use-case-simulation-cockpit.ts)
    already constructs the full widened shape, and the five pre-existing test-fixture
    producers (local makeRun/newRun builders in the five spec files listed above)
    were completed to construct it too, after the build's typecheck flagged them as
    incomplete.
- criterion: A run entry recorded from a simulate-hypothesis call, which resolves
    no assessment, carries no consolidation record rather than an invented one.
  met: true
  how: 'CaseResultConsolidationCall is a discriminated union ({ called: true, usage,
    elapsedMs, prompt } or { called: false }) rather than a bag of optional fields,
    so a producer built from a source carrying no assessment can state { called: false
    } directly instead of inventing placeholder values; toNewCaseResultRun itself
    only ever consumes SimulateCaseResult, whose assessment is required, so it always
    produces { called: true, ... }.'
nodes:
- node: contracts/investigation/case-simulation
  encoded_at:
  - src/routes/case-simulation-cockpit-adapters.ts
  how: simulate-case's returned record (evidence, evaluations, assessment, cost, durations)
    is what toNewCaseResultRun now reads durations/cost/consolidation-call from in
    full, rather than only outcome/referral/text/register/hypotheses as before
- node: rules/investigation/a-simulation-session-retains-its-runs-and-shows-one
  encoded_at:
  - src/routes/case-simulation-case-result-types.ts
  - src/routes/case-simulation-cockpit-adapters.ts
  how: only the "a run entry carries its own record" half this task's criteria bind
    to is answered — each CaseResultRun now carries its own cost and durations values,
    fixed at record time; the rule's retention, single-shown-run and selection clauses
    reach no criterion of this task and are unaddressed
- node: rules/investigation/a-simulated-hypothesis-returns-the-runs-cost-and-durations
  how: not implemented here — this task only consumes such a record and produces none;
    unaddressed, per this task's own Notes
- node: rules/investigation/a-presented-consolidation-prompt-is-shown-whole
  encoded_at:
  - src/routes/case-simulation-cockpit-adapters.ts
  how: bound here only for carrying the prompt whole from the response into the record
    — toNewCaseResultRun copies result.assessment.prompt unmodified; the rule's rendering
    clauses reach no criterion of this task and are unaddressed
- node: domain/investigation/assessment
  encoded_at:
  - src/routes/case-simulation-case-result-types.ts
  - src/routes/case-simulation-cockpit-adapters.ts
  how: usage, elapsed_ms and prompt are now carried into CaseResultRun.consolidationCall;
    register was already carried and is unchanged
- node: domain/investigation/cost
  encoded_at:
  - src/routes/case-simulation-case-result-types.ts
  - src/routes/case-simulation-cockpit-adapters.ts
  how: the three required cost attributes are carried into CaseResultRun.cost via
    the new toCost adapter, camelCased per this codebase's wire-to-UI naming convention
- node: domain/investigation/durations
  encoded_at:
  - src/routes/case-simulation-case-result-types.ts
  how: CaseResultRun.durations reuses SimulationDurations, whose writingMs is already
    optional, matching this node's own conditional presence of writing
- node: domain/investigation/usage
  encoded_at:
  - src/routes/case-simulation-case-result-types.ts
  - src/routes/case-simulation-cockpit-adapters.ts
  how: the consolidation call's usage is carried into CaseResultConsolidationCall.usage
    when called is true
- node: domain/knowledge/consolidation-register
  encoded_at:
  - src/routes/case-simulation-case-result-types.ts
  how: register was already declared as a required CaseResultRun field before this
    task and is unchanged
inferences:
- inferred: The three new consolidation-call fields are grouped under a consolidationCall
    discriminated union on a called boolean, rather than added to CaseResultRun as
    three separate optional fields.
  from: the inventory's own recorded convention for SimulationJudgmentCall, and TYP-01/TYP-04
    of the standard
- inferred: CaseResultRun.durations reuses the existing SimulationDurations type and
    toDurations adapter rather than declaring a third, parallel durations shape.
  from: the inventory's must_not_duplicate entry naming toDurations as a seam to extend,
    not re-derive
- inferred: cost is camelCased to calls/inputTokens/outputTokens via a new toCost
    adapter, rather than kept as the wire's snake_case.
  from: the inventory's recorded wire-to-UI renaming convention
- inferred: rawResponse is the whole SimulateCaseResult object, named rawResponse,
    reusing the plain-payload naming precedent already used elsewhere in this module
    family (CockpitEvaluation.raw, CaseSimulationDetailPanelProps.rawResponse).
  from: existing naming precedent in case-simulation-cockpit-adapters.ts and case-simulation-detail-types.ts
- inferred: use-case-simulation-history.ts and use-case-simulation-cockpit.ts needed
    no production-code changes for this task.
  from: NewCaseResultRun is Omit<CaseResultRun, "id" | "ranAt" | "stale">, so widening
    CaseResultRun widens it automatically, and the single recordRun(toNewCaseResultRun(result))
    call site already forwards whatever shape the adapter produces
- inferred: Fixture default values added to the five spec files' local builders (durations/cost/consolidationCall/rawResponse)
    are arbitrary satisfying values rather than business facts.
  from: none of the five spec files assert on these four fields, confirmed by grep
    across all five before editing, so any value satisfying the type is behavior-neutral
    to every existing assertion
preserved:
- The append-only, non-mutating history array in useCaseSimulationHistory, which keeps
  an earlier entry's new fields intact after a later run completes.
- The single existing call site building a run entry (history.recordRun(toNewCaseResultRun(result))),
  left unmodified since the widening lives entirely inside the adapter it already
  calls.
- register's existing required, unconditional presence on CaseResultRun.
- Every existing assertion in the five spec files (outcome, referral, text, register,
  hypotheses, stale, id/ranAt shape, verdict comparisons, Compare-button gating, Stale
  marker), left unaffected since the new fixture defaults are additive and spread
  before any test's own overrides.
deferred:
- what: Wiring a simulate-hypothesis result into a recorded run entry, and adding
    cost/full durations to the simulate-hypothesis operation's own wire response.
  why: this task's own Notes name this as belonging to a separate task; no criterion
    here produces such a record
- what: Rendering the widened fields (a consolidation Debug block, a run-totals block,
    a raw-JSON tab) on the Case result panel.
  why: explicitly deferred by this task's own REMAINDER notes to the sibling tasks
    consolidation-debug, run-totals and raw-payload, all of which depend_on this task
---

## What it is
The shape behind "Runs this session" and the adapter and hook that mint it, widened to carry the run's own durations, cost, consolidation-call record and whole returned payload — not only outcome/referral/text/register/hypotheses/stale as before.

## Notes
This delivery's own producer (toNewCaseResultRun) constructs the widened shape completely; five pre-existing test fixtures across other tasks' spec files needed completing after the build's typecheck flagged them, and were fixed in place rather than worked around.
The consolidationCall field is a discriminated union on `called`, following this codebase's existing SimulationJudgmentCall convention, so a future producer built from a simulate-hypothesis result (which resolves no assessment) can state `{ called: false }` honestly instead of inventing placeholder values.
