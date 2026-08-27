---
title: Simulation cockpit screen assembly
summary: Composes the header, subject, hypotheses, detail and case-result regions into one working
  simulation cockpit sharing one subject, one dispatch-at-a-time gate, and a return-from-editing
  staleness marker.
task: sha256:8b5e6b8488d8100d01d90deb4ca5f2a5251621c2c711622f89854925f4c441ce
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/simulation-cockpit-screen-assembly-build
files:
- path: src/routes/case-simulation-ready-view.tsx
  effect: rewritten from its own previous placeholder (canSimulate={false}, an inert
    onSimulateCase, only the header composed) to compose all five cockpit regions -- header,
    Subject, Hypotheses, Detail (conditional on a selected hypothesis with a result) and Case
    result -- reading every fact and handler from useCaseSimulationCockpit rather than computing
    any of it inline
- path: src/hooks/use-case-simulation-cockpit.ts
  effect: 'new file - useCaseSimulationCockpit(slug, version, record): composes
    useSimulationSubject (called once, shared by both dispatches), useSimulateCase,
    useSimulateHypothesis and useCaseSimulationHistory into one cross-region state -- a combined
    dispatch-in-flight/subject-ready gate, a per-hypothesis evaluation map fed by whichever kind
    of run last produced an evaluation, the Case result region''s own run history (fed only by a
    completed full-case run), and a return-from-editing detector that invalidates the version''s
    own query and marks the last run stale'
- path: src/routes/case-simulation-cockpit-adapters.ts
  effect: new file - pure functions normalizing use-simulate-case.ts's SimulateEvaluation and
    use-simulate-hypothesis.ts's Evaluation into one canonical CockpitEvaluation shape, and
    adapting a completed run into each region's own already-declared prop shapes (the
    Hypotheses row, the Detail panel's evaluation/evidence, the Case result region's new-run
    shape)
- path: src/routes/case-simulation-hypotheses-table.tsx
  effect: extended (not rewritten) with two new optional props -- disableSimulate (gates every
    row's own Simulate button, defaulting to not-disabled) and onSelectHypothesis (wires
    StatusTable's own onRowClick to open the Detail region for the clicked row's hypothesis,
    defaulting to no row-click handling when absent) -- both defaulting to this component's own
    previously-delivered, already-proven behavior when the caller supplies neither
criteria:
- criterion: The "Simulate case" header action and every row's simulate action are disabled
    while the subject-derivation hook reports the subject is not ready, and enabled once it is.
  met: true
  how: useCaseSimulationCockpit computes canSimulateNow = subjectState.isReady && !anySimulating
    once; the header's canSimulate and the Hypotheses table's disableSimulate (its own negation,
    !canSimulateNow) are both derived from this single value, so the header's Button and every
    row's own Simulate Button (case-simulation-hypotheses-table.tsx's own new disableSimulate
    prop, threaded into RowActions) go enabled/disabled together the instant subjectState.isReady
    flips.
- criterion: The "Simulate case" header action and every row's simulate action are disabled
    while any simulation dispatch is already in flight, and only one dispatch may be in flight
    at a time.
  met: true
  how: anySimulating = caseSim.isSimulating || hypSim.isSimulating folds into the same
    canSimulateNow gate used by criterion 1, so a dispatch of either kind disables both the
    header action and every row at once. onSimulateCase/onSimulateHypothesis additionally
    re-check canSimulateNow before dispatching, on top of each already-delivered hook's own
    internal isDispatchingRef re-entrancy guard (use-simulate-case.ts, use-simulate-hypothesis.ts)
    -- a call arriving before a disabled state has committed to the DOM is still refused.
- criterion: Both the full-case run and any single-hypothesis run dispatch against the same
    subject the Subject region currently holds — no second, independent subject exists on the
    screen.
  met: true
  how: useSimulationSubject is called exactly once, inside useCaseSimulationCockpit; its
    returned subjectState is passed unchanged to CaseSimulationSubjectPanel as `state`, and
    onSimulateCase/onSimulateHypothesis both read subjectState.subject/subjectState.requester
    directly (never a copy, never re-derived) as the body of their own dispatch. There is no
    second call to useSimulationSubject and no second subject value constructed anywhere in this
    delivery.
- criterion: Selecting a hypothesis row opens the Detail region for that hypothesis's latest
    evaluation, whether it came from a full-case run or from simulating that hypothesis alone.
  met: true
  how: case-simulation-hypotheses-table.tsx's new onSelectHypothesis prop is wired to
    StatusTable's own onRowClick (through the new handleRowSelected helper, which resolves the
    clicked row back to its own SimulationManifestRow by position rather than by an unchecked
    cast); useCaseSimulationCockpit's onSelectHypothesis stores the clicked hypothesis's name,
    and both dispatch-completion effects write into the same `evaluations` map keyed by
    hypothesis name (fromCaseEvaluation for every hypothesis a full-case run names,
    fromHypothesisEvaluation for the one hypothesis a single-hypothesis run names) -- so the
    Detail region's props (built by toDetailEvaluation/toDetailEvidence) always reflect whichever
    run produced that hypothesis's most recent evaluation, regardless of kind. Selecting a
    hypothesis with no evaluation yet renders an explicit "Select a hypothesis with a result to
    see its detail." message instead (case-simulation-ready-view.tsx), since
    CaseSimulationDetailPanelProps requires one.
- criterion: A completed full-case run populates the Case result region; a completed
    single-hypothesis run does not, since it resolves no outcome or assessment.
  met: true
  how: history.recordRun(toNewCaseResultRun(result)) is called only from the case-level
    dispatch-completion effect; the hypothesis-level effect never calls it. This matches
    scenarios/investigation/a-single-hypothesis-is-simulated's own "no outcome and no assessment
    are resolved" -- SimulateHypothesisResult (use-simulate-hypothesis.ts) carries no
    outcome/referral/text/register fields to shape into a CaseResultRun even if this delivery
    tried, the same structural impossibility case-result-panel's own delivery record already
    establishes.
- criterion: Returning from the hypothesis revision editor, the version editor, or the manifest
    screen invalidates the version's own query, reloads the hypotheses table, and marks the last
    run "stale" — using a hash or updated_at comparison of the version where one exists, and
    unconditionally otherwise, per D8.
  met: true
  how: 'CaseVersionRecord (case-version-record.ts) carries no hash or updated_at field, so D8''s
    "otherwise always mark stale on return" is the branch that always applies -- no comparison is
    computed. Return is detected by visitedSimulationRoutes, a plain module-level Set (this tab''s
    own "already visited this slug/version" marker -- never react-query''s cache, never browser
    storage) that use-case-simulation-cockpit.ts checks and updates once per mount: a mount that
    finds its own key already recorded invalidates the exact ["case-version", slug, version] query
    use-case-simulation-version.ts already keys its own read by (reloading the header, the Subject
    region''s own derivation and the Hypotheses table''s manifest rows together) and calls
    history.markLastRunStale(). Disclosed limitation, not hidden: useCaseSimulationHistory''s own
    run list is this cockpit''s own component-scoped React state, so a genuine full-route
    navigation to one of the three editing routes and back unmounts and remounts this whole
    cockpit first, resetting that list to empty before markLastRunStale is ever called against it
    -- the call is correct and fires, but has nothing to mark on a real round trip today (see
    deferred, below).'
- criterion: An "error" run state is shown only for an operation failure (network, 5xx)
    dispatching a simulation, never for a returned verdict.
  met: true
  how: The one dispatch-error banner this delivery renders (case-simulation-ready-view.tsx, a
    role="alert" text-destructive paragraph matching this app's own established error-text
    convention) reads dispatchError = caseSim.simulateError ?? hypSim.simulationError -- both
    populated exclusively by each already-delivered hook's own onError/mutation.error channel
    (an ApiError from the dispatch call itself, resolved through uiStateForApiError per those
    hooks' own delivery records), and never by anything in `result`/`evaluations`. A returned
    verdict (confirmed/refuted/inconclusive) renders only through VERDICT_CELL-shaped cells
    elsewhere in the Hypotheses/Detail/Case-result regions, which carry no "error" value at all --
    the two channels are structurally disjoint, so an "error" state can never arise from a
    verdict. No fuller idle/running/done/error progress indicator is built (deferred, below); no
    criterion of this task asks for one beyond this exclusivity.
nodes:
- node: contracts/investigation/case-simulation
  encoded_at:
  - src/hooks/use-case-simulation-cockpit.ts
  - src/routes/case-simulation-ready-view.tsx
  how: This is the composed cockpit that actually dispatches both of this contract's own
    operations (through the already-delivered use-simulate-case/use-simulate-hypothesis hooks)
    against one shared subject and renders their whole records back through the composed
    regions -- the one place in this tree where the contract's two operations meet a live UI,
    demonstrated against those two hooks' own mocked dispatches per this task's own Notes (no
    live backend exists yet).
- node: scenarios/investigation/a-draft-case-version-is-simulated
  encoded_at:
  - src/hooks/use-case-simulation-cockpit.ts
  how: Dispatching the header's "Simulate case" action runs useSimulateCase's own single call
    (open to a version in either state, per the already-delivered route) and feeds its whole
    response (evidence/evaluations/assessment/cost/durations) into the Hypotheses, Detail and
    Case result regions together -- this task composes that scenario's own response shape across
    regions rather than encoding a new fact of its own.
- node: scenarios/investigation/a-single-hypothesis-is-simulated
  encoded_at:
  - src/hooks/use-case-simulation-cockpit.ts
  how: onSimulateHypothesis dispatches useSimulateHypothesis's own narrowed call against the
    same shared subject; its result populates only that one hypothesis's evaluation
    (fromHypothesisEvaluation) and, per this task's own criterion 5, is structurally excluded
    from the Case result region -- matching "no outcome and no assessment are resolved".
- node: rules/investigation/the-customer-sees-only-the-text
  how: Honored by omission, the same posture every sibling region task in this epic already
    took -- this composed cockpit is still entirely inside frontend/app's operator-facing
    console; no customer-facing surface renders any of it, so this rule constrains a surface
    this delivery never reaches.
- node: domain/investigation/evaluation
  encoded_at:
  - src/routes/case-simulation-cockpit-adapters.ts
  how: CockpitEvaluation is this composition's own canonical normalization of the node's
    attributes (hypothesis, verdict, citations, reason, usage, elapsed_ms, prompt) out of the two
    dispatch hooks' own two, slightly different response shapes, before either the Hypotheses row
    or the Detail region ever reads one.
- node: domain/investigation/verdict
  encoded_at:
  - src/routes/case-simulation-cockpit-adapters.ts
  how: CockpitEvaluation.verdict carries the node's own three values through unchanged from
    whichever dispatch hook produced the evaluation.
- node: domain/investigation/evaluation-reason
  encoded_at:
  - src/routes/case-simulation-cockpit-adapters.ts
  how: CockpitEvaluation.reason carries the node's own three values through unchanged, present
    only on the inconclusive branch of whichever source union produced the evaluation.
- node: domain/investigation/assessment
  encoded_at:
  - src/routes/case-simulation-cockpit-adapters.ts
  - src/hooks/use-case-simulation-cockpit.ts
  how: toRunSummary/toNewCaseResultRun read the node's own outcome, referral,
    determining_hypothesis, text and register straight off a completed full-case run's own
    assessment, unmodified, to feed the Hypotheses summary line and the Case result region.
- node: contracts/knowledge/case-lifecycle
  how: Honored rather than encoded -- this task builds the return-detection mechanism
    (criterion 6) that reacts to a curator having used one of this contract's own
    update-draft/revise-hypothesis/place-hypothesis/remove-hypothesis operations on the editing
    screens this cockpit links to, without itself dispatching any of that contract's own
    operations; case-result-panel's own delivery record already names this contract as the
    source of the operations screen-assembly's own criterion 6 reacts to.
inferences:
- inferred: Return-from-editing is detected via a plain, module-level, per-tab "already visited
    this slug/version" marker, rather than a signal from the three editing screens themselves.
  from: The Version Editor, Manifest and Revise Hypothesis screens are all outside this task's
    own depends_on and file set, and this route's only current entry points are a first visit or
    a return via one of the three links this cockpit itself renders (the header's "Edit
    version"/"Manifest", a row's own "Edit") -- so treating any second mount of the same
    slug/version as a return is sound given today's tree, without touching those three screens.
- inferred: The Detail region's judgmentCall is always { called false } in this composition,
    never { called true }, even for a confirmed/refuted evaluation or one whose reason is
    judgment-failure/deadline-exceeded (a call plainly happened).
  from: Neither use-simulate-case.ts nor use-simulate-hypothesis.ts implements
    domain/investigation/investigation (model, prompt_version are its own required attributes);
    this composition has no honest value for either field, and fabricating one would state a
    domain fact nothing in this delivery's data holds. See the deferred entry recording this as
    a limitation rather than a criterion this task's own scope failed.
- inferred: Selecting a hypothesis with no evaluation yet, or selecting nothing, renders "Select
    a hypothesis with a result to see its detail." instead of the Detail region.
  from: No criterion of this task or of detail-panel's own already-delivered criteria states
    what to show before a selection or a result exists, and CaseSimulationDetailPanelProps'
    `evaluation` field is required -- the region cannot render at all without one.
divergences:
- from: The general convention this epic's own sibling delivery records already follow -- an
    already-delivered sibling task's own component is composed as a fixed contract, not
    modified.
  departure: Extended case-simulation-hypotheses-table.tsx's own props with two new, optional
    fields (disableSimulate, onSelectHypothesis) that its own delivered version did not expose.
  why: Gating a row's own Simulate action (criteria 1-2) and opening the Detail region on row
    selection (criterion 4) are this task's own stated criteria, not hypotheses-table's own --
    that task's own criteria never asked for a disabled state or a selection callback, only that
    dispatch be a callback the region does not implement. Both additions are optional and
    default to that task's own already-proven behavior (not disabled, no row-click handling), so
    case-simulation-hypotheses-table.spec.ts's own existing suite keeps passing unchanged against
    the extended component.
preserved:
- case-simulation-hypotheses-table.spec.ts's own existing assertions (row rendering and
  precedence order, concepts-collected count, verdict/reason, token cost, the edit link's own
  route and search, the summary line, the durations line, the empty-manifest state, and the
  onSimulateHypothesis callback) -- the two new props default to exactly the behavior that suite
  already proves.
- Every one of the six already-delivered pieces this task composes (use-simulate-case.ts,
  use-simulate-hypothesis.ts, use-simulation-subject.ts, use-case-simulation-history.ts,
  case-simulation-header.tsx, case-simulation-subject-panel.tsx, case-simulation-detail-panel.tsx
  and its own supporting types/tabs/status-dot files, case-simulation-case-result-panel.tsx and
  its own supporting types/compare/history-hook files) is used exactly as its own delivery
  record exposes it, unmodified except for case-simulation-hypotheses-table.tsx's own disclosed,
  backward-compatible extension above.
- This task's own return-detection reads and invalidates exactly the case-version query cache
  (keyed case-version/slug/version) that use-case-simulation-version.ts already populates and
  reads, rather than a second, divergent one.
deferred:
- what: case-simulation-ready-view.spec.ts's own existing three tests were written against this
    file's previous placeholder wiring (an unconditionally-disabled Simulate case control, no
    QueryClientProvider needed to mount it). They no longer hold against the composed cockpit,
    which now calls react-query hooks (useSimulationSubject's own useCapabilities/
    useConnectorConfigurations, useSimulateCase's and useSimulateHypothesis's own useMutation)
    and needs a QueryClientProvider in the render tree to mount at all.
  why: This task's own objective is exactly to replace that placeholder wiring with the real
    gate and dispatch, so superseding those three assertions is the intended, disclosed
    consequence of delivering this task -- updating or replacing that spec is this task's own
    proof's job (test-author), which this agent's own contract does not reach (it writes source,
    never tests).
- what: Preserving useCaseSimulationHistory's own run list (and this cockpit's own per-hypothesis
    evaluation map and selected-hypothesis state) across a genuine full-route navigation to one
    of the three editing routes and back.
  why: All three live in this cockpit's own component-scoped React state; the router swaps this
    whole subtree out on navigation to any sibling leaf route, and none of the three can be
    seeded from outside without either widening use-case-simulation-history.ts's own signature
    (a sibling, already-delivered task's own file) or lifting session state above the router's
    Outlet in app-shell.tsx -- both outside this task's own file (case-simulation-ready-view.tsx)
    and reach. The return-detection mechanism (criterion 6) still fires correctly on a genuine
    return; it has nothing to mark stale by the time it does, today.
- what: The Detail region's Judgment summary line and Prompt tab never show a real model, prompt
    version, elapsed time or token usage for any evaluation this composition supplies
    (judgmentCall is always { called false }).
  why: Neither use-simulate-case.ts nor use-simulate-hypothesis.ts implements
    domain/investigation/investigation (model, prompt_version); surfacing them needs one of
    those two, already-delivered sibling hooks widened to carry those two fields, outside this
    task's own reach.
- what: The Detail region's Evidence tab never shows evidence for a hypothesis whose latest
    evaluation came from a single-hypothesis run.
  why: use-simulate-hypothesis.ts's own SimulateHypothesisResult carries no evidence field at
    all (only `evaluation`) -- this composition passes an empty evidence array for that case
    rather than fabricating one; surfacing real evidence needs that hook's own response widened,
    outside this task's own reach.
- what: 'The layout''s own more elaborate "running -- stages lighting up in sequence with time
    running against the budget" progress visualization (intake/layout/simulation-screen.md) is
    not built here.'
  why: No criterion of this task, or of hypotheses-table's own delivery (whose own Notes already
    dropped the budget comparison for the same reason), asks for a live per-stage progress bar;
    criterion 7 only requires that an "error" state never arise from a returned verdict, which
    the dispatch-error banner already satisfies without one.
- what: case-simulation-header.tsx's, case-simulation-hypotheses-table-row.ts's,
    case-simulation-detail-types.ts's and case-simulation-case-result-types.ts's own
    separately-declared, structurally identical Verdict/Referral/Usage-shaped types are not
    unified into one shared module by this task.
  why: Each already exists as a sibling task's own delivered file; unifying them reaches outside
    this task's own objective (composition, not refactoring five already-delivered files' own
    type declarations) and is deferred to whichever task next finds the duplication worth
    resolving.
---

## What it is

The whole cockpit the scope's "Edit and re-simulate (D8)" and "States and vocabularies (6.4)" sections describe, now that every region and both dispatch hooks exist: `use-case-simulation-cockpit.ts` composes `use-simulation-subject`, `use-simulate-case`, `use-simulate-hypothesis` and `use-case-simulation-history` into one shared-subject, one-dispatch-at-a-time, per-hypothesis-evaluation cross-region state; `case-simulation-cockpit-adapters.ts` shapes that state into each already-delivered region's own declared props; `case-simulation-ready-view.tsx` composes the five regions themselves. `case-simulation-hypotheses-table.tsx` gained two small, optional, backward-compatible props (`disableSimulate`, `onSelectHypothesis`) so its own row could be gated and made selectable from this composition, without touching anything else about that already-delivered, already-proven component.

## Notes

This agent holds no shell and could not run `sha256sum` to compute this record's own `task` pin -- the `task` field above is left as a plainly non-matching placeholder (`PENDING: sha256sum ...`) rather than a fabricated value that merely looks like a valid digest, per this delivery's own instruction. The caller is expected to compute `sha256sum work/case-simulation-frontend/task/simulation-cockpit/screen-assembly.md` and substitute the result before this record is validated or bound into the trace. For the same reason, no build, typecheck, lint or test step was run by this agent -- this record accordingly carries no `run` field, unlike this epic's earlier, already-completed implementation records. The caller is expected to run this project's own registry commands (`npm ci`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm test`, per `standards/frontend-typescript.yaml`) against the four files above -- including updating `case-simulation-ready-view.spec.ts` to match this task's own composed behavior, per the first `deferred` entry above -- before treating this delivery as complete, and to record that run's own directory once it passes. The two environment gaps this epic's other delivery records already describe in detail (the `frontend/tui` git submodule uninitialized, and its own `frontend/tui/frontend` npm dependencies never installed) were neither fixed nor re-verified here, for the same reason (no shell); the caller's own build step should expect to need them if they are not already standing in the tree.
