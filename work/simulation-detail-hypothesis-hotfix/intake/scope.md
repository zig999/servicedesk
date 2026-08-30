# Corrective increment

One wrong behavior observed by running the delivered system: on the case simulation screen
(`/cases/$slug/versions/$version/simulate`), after simulating a single hypothesis (the
"Simulate" action scoped to one hypothesis row, dispatching `POST /v1/simulate/hypothesis`),
the Detail panel's Evidence and Prompt tabs both render empty/placeholder content, while the
JSON tab (which dumps the raw response verbatim) shows real evidence and a real prompt were
present in that same response.

Diagnosed causes, both in already-delivered code, neither behind a criterion any existing task
holds:

1. `frontend/app/src/hooks/use-case-simulation-cockpit.ts`, lines 207-215: `const result =
   hypSim.result; ... [result.evaluation.hypothesis]: fromHypothesisEvaluation(result.evaluation)`
   -- only `result.evaluation` is read from the hypothesis-simulation response; `result.evidence`
   (confirmed present on the wire type `SimulateHypothesisResult` in
   `frontend/app/src/hooks/use-simulate-hypothesis.ts`, lines 251-255: `{ evidence: readonly
   Evidence[]; evaluation: Evaluation; durations: Durations }`) is discarded and never reaches
   the Detail panel. Downstream, `frontend/app/src/routes/case-simulation-cockpit-adapters.ts`,
   lines 293-296, always answers `evidence: []` for a hypothesis-sourced evaluation
   (`selectedEvaluation.source !== "case"`), consistent with that discarding -- so a
   single-hypothesis simulation's own real evidence is invisible in the Detail panel's Evidence
   tab even though the dispatch response carried it.

2. `frontend/app/src/routes/case-simulation-cockpit-adapters.ts`, lines 205-207:
   `toDetailJudgmentCall()` unconditionally returns `{ called: false }`, regardless of whether
   the evaluation it is composed from actually carries `prompt`/`usage`/`elapsed_ms` (which
   `use-simulate-hypothesis.ts`'s own `Evaluation` type does carry, confirmed optional on both
   its branches). This makes the Prompt tab
   (`frontend/app/src/routes/case-simulation-detail-prompt-tab.tsx`, line 25: `if
   (!judgmentCall.called) return <p>Judgment was never called for this hypothesis.</p>`) always
   show that placeholder, even for an evaluation a judgment call genuinely happened for -- a
   materially false statement rendered to the operator. This same adapter also serves
   case-level (full-case) simulations, so the same false placeholder affects those too, though
   the human observed it via the single-hypothesis path.

Disclosed context: cause 2 is a pre-existing, deliberate deferral recorded in
`delivery/case-simulation-frontend/implementation/simulation-cockpit/detail-panel.md` -- the
adapter was left unconnected because neither dispatch hook returned `model`/`prompt_version` at
the time, and the delivery record disclosed `called: false` as a limitation rather than
fabricating a value. Nothing about that reasoning required also suppressing
`prompt`/`usage`/`elapsed_ms` when they ARE present; the "no `model`/`prompt_version`" gap is
orthogonal to whether a call happened at all -- confirmed against the specification:
`domain/investigation/investigation` is where `model`/`prompt_version` actually live (the
written diagnosis record), and neither `simulate-case` nor `simulate-hypothesis` ever writes an
investigation (`rules/investigation/a-simulation-writes-no-investigation`), so there genuinely
is no investigation-level `model`/`prompt_version` to surface for either kind of simulation --
that absence is real and stays. `domain/investigation/evaluation` states the actual governing
fact directly: "usage, elapsed_ms and prompt are the call's own record ... present exactly when
a call happened, absent when reason `no-data` means judgment was never called at all."

The fix: wire the discarded evidence through for a hypothesis-sourced evaluation, and make
`toDetailJudgmentCall` (or its caller) report `called: true` with the real
`prompt`/`usage`/`elapsed_ms` whenever the evaluation actually carries them, falling back to
`called: false` only when it does not (the genuine `no-data` case). This is a wrong behavior in
already-delivered code, not a specification change -- the specification does not say what these
two tabs must be, that is presentation, and the fix is restoring what the existing adapters were
already meant to carry through.
