---
title: Case result panel
summary: A presentational Case-result region plus its own in-memory run-history hook -- the outcome/referral/determining
  line and customer-facing text box of the last full-case run, this session's run history with a
  Compare action, and a passive "stale" marker -- built as four new files under frontend/app/src,
  wired to nothing yet.
task: sha256:e556b420e3d1d525141f64cbc1700113b9438baeee63d13cef8ea1addcdd72fb
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/simulation-cockpit-case-result-panel-build
files:
- path: src/routes/case-simulation-case-result-types.ts
  effect: Declares CaseResultRun (one completed full-case run's own outcome, referral, determiningHypothesis?,
    text, register and per-hypothesis verdicts, plus this region's own id/ranAt/stale bookkeeping),
    CaseResultRunHypothesisVerdict, SimulationVerdict, SimulationReferral, SimulationConsolidationRegister,
    the VERDICT_CELL color table, and the pure helpers formatRunTime, toggleCompareSelection, resolveCompareRuns,
    verdictForHypothesis and hypothesisNamesAcross -- kept out of the two .tsx files' own JSX per
    MNT-01/ARC-03.
- path: src/hooks/use-case-simulation-history.ts
  effect: New file. Exports useCaseSimulationHistory(), a hook holding this session's own in-memory
    run list in plain useState (no query cache, no persistence, no network call anywhere in this
    file) and exposing { runs, recordRun, markLastRunStale }. recordRun appends one newly-completed
    full-case run (assigning id/ranAt/stale itself); markLastRunStale flips the current last run's
    own stale flag in place, appending nothing.
- path: src/routes/case-simulation-case-result-compare.tsx
  effect: Exports CaseSimulationCaseResultCompare, a presentational component rendering two given
    runs side by side, one row per hypothesis either run judged, each side's verdict shown through
    CaseSimulationStatusDot (VERDICT_CELL) or a plain placeholder when that run never judged that
    hypothesis.
- path: src/routes/case-simulation-case-result-panel.tsx
  effect: Exports CaseSimulationCaseResultPanel, the Case result region itself -- renders nothing
    until at least one run is supplied; otherwise the last run's outcome/referral/determining line
    (with a "Stale" status dot when marked), a customer-facing text box showing exactly text and
    register, a checkbox-selectable run-history list (@tui/ui/checkbox), and a "Compare" button
    (@tui/ui/button, enabled once exactly two runs are checked) that renders CaseSimulationCaseResultCompare
    for the two selected runs.
criteria:
- criterion: The region renders nothing until at least one full-case run has completed this session,
    and shows the outcome, the referral, and the determining hypothesis (absent when the fallback
    answered) once one has.
  met: true
  how: CaseSimulationCaseResultPanel returns null when runs.length === 0 before rendering anything
    else. Once runs holds at least one entry, the last run's own outcome, referral.action/referral.recipient
    and determiningHypothesis (rendered as the literal word "Fallback" when absent -- this task's
    own inference, below) render on one line. CaseResultRun's own determiningHypothesis field is
    optional, matching domain/investigation/assessment's own "absent when nothing confirmed and
    the fallback answered" -- a single-hypothesis run can never populate this region at all, since
    CaseResultRun requires outcome and referral, which such a run never resolves (scenarios/investigation/a-single-hypothesis-is-simulated).
- criterion: The customer-facing text box shows exactly assessment.text, labeled with assessment.register
    (the register the writing call actually used), and shows no other field of the record next to
    it.
  met: true
  how: The text box renders "Customer-facing text ({lastRun.register})" as its own label followed
    by {lastRun.text} verbatim, and nothing else of CaseResultRun (no outcome, referral, determiningHypothesis
    or hypotheses array) appears inside that box -- those render in the separate line above it,
    matching the criterion's own "next to it" as this box's own contents rather than the whole region.
- criterion: Every full-case run this session is kept in an in-memory list, never persisted, never
    sent to any endpoint, never entering any cache — satisfying rules/investigation/a-simulation-writes-no-investigation.
  met: true
  how: use-case-simulation-history.ts's useCaseSimulationHistory holds its whole run list in a single
    useState call. Nothing in that file calls apiFetch, useMutation, useQueryClient, invalidateQueries,
    localStorage or sessionStorage -- recordRun only ever calls setRuns with a new in-memory array,
    and markLastRunStale only ever maps the existing in-memory array. No other file this task writes
    holds any additional copy of a run.
- criterion: A "Compare" action shows two runs from the in-memory history side by side, hypothesis
    by hypothesis.
  met: true
  how: 'CaseSimulationCaseResultCompare takes exactly two runs and renders one row per hypothesis
    either run''s own `hypotheses` array names (case-simulation-case-result-types.ts''s own hypothesisNamesAcross,
    deduplicated), each row showing that hypothesis''s verdict on both sides (a plain "—" on whichever
    side never judged it). CaseSimulationCaseResultPanel gates the "Compare" button (disabled unless
    selectedRunIds.length === 2, via checkboxes on each history row) and renders the compare view
    only once exactly two runs are checked and the button has been clicked.'
- criterion: The last run is marked "stale" once told the version has changed underneath it, without
    requiring a new run to clear the marking itself.
  met: true
  how: markLastRunStale (use-case-simulation-history.ts) sets the current last run's own stale flag
    to true in place -- it never appends a run, so calling it needs no new simulation dispatch.
    CaseSimulationCaseResultPanel renders a "Stale" CaseSimulationStatusDot beside the outcome/referral/determining
    line whenever lastRun.stale is true. Calling markLastRunStale is task/simulation-cockpit/screen-assembly's
    own job (its own criterion 6, told by a hash/updated_at comparison on return from an editing
    screen); this task builds only the marking mechanism and its rendering.
nodes:
- node: contracts/investigation/case-simulation
  encoded_at:
  - src/routes/case-simulation-case-result-panel.tsx
  - src/routes/case-simulation-case-result-types.ts
  - src/hooks/use-case-simulation-history.ts
  how: This region renders the curator-facing half of simulate-case's own whole record this contract
    names that this task's own implements reaches -- the resolved outcome and the assessment (cost
    and durations are outside this task's own implements; see deferred below). CaseResultRun and
    useCaseSimulationHistory model a completed simulate-case run's own outcome/referral/determiningHypothesis/text/register
    and per-hypothesis verdicts; dispatching the operation itself is use-simulate-case's own job,
    already delivered, and this component takes a completed run's data through recordRun rather
    than depending on that hook directly.
- node: domain/investigation/assessment
  encoded_at:
  - src/routes/case-simulation-case-result-types.ts
  - src/routes/case-simulation-case-result-panel.tsx
  - src/hooks/use-case-simulation-history.ts
  how: CaseResultRun carries outcome, referral, determiningHypothesis (optional) as this node's own
    required outcome/referral plus its own optional determining_hypothesis, and text/register as
    its own required text/register. usage, elapsed_ms and prompt are deliberately not carried anywhere
    in this task's own files -- criterion 2's own "shows no other field of the record next to it".
- node: domain/investigation/evaluation
  encoded_at:
  - src/routes/case-simulation-case-result-types.ts
  - src/routes/case-simulation-case-result-compare.tsx
  how: CaseResultRunHypothesisVerdict narrows this node to hypothesis and verdict, exactly the two
    fields criterion 4's own hypothesis-by-hypothesis Compare view reads. citations, reason, usage,
    elapsed_ms and prompt are out of this task's own reach -- they belong to the Detail region and
    to case-simulation-hypotheses-table-row.ts's own row, both separate tasks.
- node: domain/investigation/verdict
  encoded_at:
  - src/routes/case-simulation-case-result-types.ts
  - src/routes/case-simulation-case-result-compare.tsx
  how: SimulationVerdict models this enumeration's own three values exactly; VERDICT_CELL maps each
    to a {color,label} rendered through CaseSimulationStatusDot in the Compare view (colors are
    this task's own inference, below).
- node: domain/knowledge/resolution
  encoded_at:
  - src/routes/case-simulation-case-result-types.ts
  how: CaseResultRun types outcome and referral as always co-required, never one without the other
    -- this node's own "pair one outcome with one referral" responsibility, mirrored structurally
    (not as a nested `resolution` field) the same way case-simulation-hypotheses-table-row.ts's
    own SimulationRunSummary already does, since domain/investigation/assessment's own attributes
    (which CaseResultRun follows) are themselves flat.
- node: domain/knowledge/referral
  encoded_at:
  - src/routes/case-simulation-case-result-types.ts
  - src/routes/case-simulation-case-result-panel.tsx
  how: SimulationReferral carries action and recipient exactly, this node's own two attributes;
    the outcome/referral/determining line renders both together as "Referral <action> / <recipient>".
- node: domain/knowledge/case-version
  how: 'Honored rather than encoded: this region reads none of this aggregate''s own attributes
    directly (identity, title, manifest, state all belong to the Header and Hypotheses regions,
    separate tasks). The `determiningHypothesis ?? "Fallback"` label names this aggregate''s own
    fallback concept ("The fallback is a disguised default hypothesis, explicit on purpose"), the
    same inference case-simulation-hypotheses-table-row.ts''s own SummaryLine already records; the
    `stale` marker this region carries is the passive counterpart of this aggregate''s own update-draft/place-hypothesis/remove-hypothesis
    mutating the manifest or the version''s own attributes underneath an already-completed run --
    the mutation itself belongs to the editing screens outside this task''s own reach.'
- node: contracts/knowledge/case-lifecycle
  how: 'Honored rather than encoded: markLastRunStale (use-case-simulation-history.ts) is the mechanism
    task/simulation-cockpit/screen-assembly calls once a curator returns from this contract''s own
    update-draft, revise-hypothesis, place-hypothesis or remove-hypothesis (screen-assembly''s own
    criterion 6 -- "using a hash or updated_at comparison ... and unconditionally otherwise, per
    D8"). This task builds the marking mechanism and its rendering, not the lifecycle operations
    or the return-navigation trigger themselves.'
- node: rules/investigation/a-simulation-writes-no-investigation
  encoded_at:
  - src/hooks/use-case-simulation-history.ts
  how: useCaseSimulationHistory holds its whole run history in plain useState -- no useQueryClient,
    no invalidateQueries, no apiFetch, no browser storage anywhere in this file -- so nothing this
    region keeps is ever persisted, sent to an endpoint, or read from a cache (criterion 3's own
    three clauses, each satisfied by the same absence).
- node: scenarios/investigation/a-draft-case-version-is-simulated
  encoded_at:
  - src/routes/case-simulation-case-result-panel.tsx
  - src/hooks/use-case-simulation-history.ts
  how: This region renders this scenario's own "drafts the assessment" and "the response carries
    ... the cost and the durations" (the assessment half only, per this task's own implements) for
    the Case result region specifically -- the outcome/referral/determining line and the customer-facing
    text -- once a caller (screen-assembly) records a completed run. "No investigation is written"
    is honored the same way as the rule above; the request itself, per-evidence detail and per-hypothesis
    evaluation detail are outside this region's own reach.
- node: scenarios/investigation/a-single-hypothesis-is-simulated
  encoded_at:
  - src/routes/case-simulation-case-result-types.ts
  - src/routes/case-simulation-case-result-panel.tsx
  how: CaseResultRun requires outcome and referral, which this scenario's own "no outcome and no
    assessment are resolved" means a single-hypothesis run never produces -- so a single-hypothesis
    run's own result cannot be shaped into a CaseResultRun at all, and recordRun (use-case-simulation-history.ts)
    has nothing to accept from one. This region is therefore structurally unreachable by a single-hypothesis
    run, matching task/simulation-cockpit/screen-assembly's own criterion 5 ("a completed single-hypothesis
    run does not [populate Case result]").
inferences:
- inferred: determiningHypothesis absent renders as the literal word "Fallback" rather than an empty
    or omitted line.
  from: domain/knowledge/case-version's own description naming "fallback" directly, and case-simulation-hypotheses-table-row.ts's
    own SummaryLine, already delivered in this same epic, recording the identical inference for
    the identical field.
- inferred: The Compare action's own selection mechanism is a checkbox per history row (gating a
    "Compare" button, enabled once exactly two are checked); checking a third drops the oldest of
    the two already held.
  from: No criterion of this task names a selection mechanism, only the resulting two-run side-by-side
    view (criterion 4) -- this is this task's own minimal, reviewable choice, using @tui/ui/checkbox,
    which the plan's own inventory (intake/scope.md's own TUI catalog listing) confirms this project's
    catalog already ships.
- inferred: id, ranAt and stale are assigned by useCaseSimulationHistory itself rather than supplied
    by the caller recording a run.
  from: Neither is a fact any specification node states -- both are this region's own bookkeeping
    (a stable list key, a client-observed time for the history list's own display, and the stale
    marker criterion 5 introduces) -- so the caller (screen-assembly) only ever supplies the domain
    facts a completed run actually carries.
- inferred: The Compare view orders its two columns by the runs' own chronological history order,
    never by the order the two were checked in.
  from: No criterion states an ordering; this is the least surprising reading against the history
    list's own display order (oldest first, "#1", "#2", "#3", ...), which resolveCompareRuns (case-simulation-case-result-types.ts)
    already preserves by filtering `runs` rather than reordering by `selectedIds`.
- inferred: domain/investigation/evaluation-reason is not carried on the Compare view's per-hypothesis
    row.
  from: This node is not part of this task's own `implements`, and no criterion of this task asks
    the Compare view to show a reason -- that belongs to case-simulation-hypotheses-table-row.ts's
    own row, a separate, already-delivered task.
deferred:
- what: Calling recordRun on a completed full-case dispatch, and calling markLastRunStale on return
    from the hypothesis-revision editor, the version editor or the manifest screen.
  why: task/simulation-cockpit/screen-assembly owns cross-region wiring and gating; its own criterion
    6 states the return-from-edit trigger explicitly. This task's own instructions ask for a fixture/props-driven
    region and its own history hook, independent of the not-yet-composed cockpit.
- what: A per-run token cost or elapsed-time figure in the history list or the Compare view, shown
    in intake/layout/simulation-screen.md's own reference ("#3 14:02 <o> 3.9k").
  why: domain/investigation/cost and domain/investigation/durations are not part of this task's
    own `implements` -- rendering either here would encode a fact from a node this task was not
    bound to, on behalf of a task (hypotheses-table) that already renders per-hypothesis cost from
    the node it does implement.
- what: domain/investigation/evaluation's own citations, reason, usage, elapsed_ms and prompt.
  why: They belong to the per-hypothesis Detail region (task/simulation-cockpit/detail-panel) and
    to case-simulation-hypotheses-table-row.ts's own row, both separate, already-delivered tasks.
---

## What it is

The "Case result" region of the case-simulation cockpit's layout (`intake/layout/simulation-screen.md`'s own "Case result" section, including D9's tokens-not-currency -- honored by construction, since this region shows no price of any kind -- and D10's in-memory-only history), plus its own new hook, `use-case-simulation-history.ts`, which is the one place this session's full-case run history actually lives. Four new files: the region's own pure types/helpers, the history hook, the Compare sub-view, and the panel itself. Presentational and fixture-driven per this epic's own established convention for a region task (`case-simulation-hypotheses-table.tsx`, `case-simulation-detail-panel.tsx`) -- no import of `CaseSimulationCaseResultPanel` or `useCaseSimulationHistory` exists anywhere yet; `task/simulation-cockpit/screen-assembly` composes both into the running cockpit.

## Notes

This agent holds no shell and could not run `sha256sum` to compute this record's own `task` pin -- the `task` field above is a placeholder stating the exact command the caller must run against `work/case-simulation-frontend/task/simulation-cockpit/case-result-panel.md`, with the result substituted in before this record is validated (`bin/deliver.py`) or bound into the trace. The `standard` pin above was supplied directly by the invocation that requested this delivery and is reproduced unchanged. No build, typecheck, lint or test step was run by this agent either, for the same reason (no shell) -- this record accordingly carries no `run` field, unlike this epic's other, already-completed implementation records; the caller is expected to run this project's own registry commands (`npm ci`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm test`, per `standards/frontend-typescript.yaml`) against the four files above before treating this delivery as complete, and to record that run's own directory once it passes.
Two environment gaps affected every prior task in this epic (the `frontend/tui` git submodule uninitialized, and its own `frontend/tui/frontend` npm dependencies never installed) -- neither was fixed or re-verified by this agent, for the same reason (no shell); the caller's own build step should expect to need the same two fixes this epic's other delivery records already describe in detail (e.g. `implementation/simulation-cockpit/hypotheses-table.md`'s own Notes) if they are not already standing in the tree.
