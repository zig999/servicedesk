Scope, as the human stated it: "pode desenvolver a proposta" — develop the proposal recorded
alongside this file (`proposal.md`).

The proposal: expand what the Debug the case simulation screen
(`/cases/:slug/versions/:version/simulate`) gives the Operator after a case-level simulation
runs. It has three parts:

1. Add a Debug block under "Case result" mirroring the per-hypothesis Debug (Evidence / Prompt /
   JSON tabs), with:
   - a Consolidation tab: the assessment's prompt, usage (tokens in/out), elapsed_ms and register;
   - a Cost tab or line: the case-level totals (`cost.calls`, `cost.input_tokens`,
     `cost.output_tokens`), alongside the existing durations;
   - a JSON tab: the full raw case-level simulation result (evidence + evaluations + assessment +
     cost + durations), as the per-hypothesis JSON tab already does for one hypothesis.
2. Enrich the evidence display (both the existing per-hypothesis Debug and the new case-level
   Debug) with the evidence fields the backend already carries but the frontend currently drops:
   `observed_at`, `ttl`, and `inputs`. Whether `inputs` should be shown was left as an open
   question in the proposal (possible sensitivity depending on the connector) — resolve it during
   planning.
3. Persist this data per run, not only for the latest one: extend the "Runs this session" history
   so each run in the list carries its own durations, cost and consolidation debug fields, not
   only whatever `lastCaseResult` in the cockpit hook happens to hold at the moment.

All of this is data the backend already computes and returns on every simulate call — the
specification's own `contracts/investigation/case-simulation` states plainly that
`simulate-case` "returns the whole record back: evidence per concept, evaluation per hypothesis
with its citations, the resolved outcome, the assessment, cost and durations — the detail
`rules/investigation/the-customer-sees-only-the-text` keeps from the customer, faced to the
curator instead." The screen this proposal touches is exactly that curator-facing surface — this
is not a new domain fact, it is surfacing what the specification already commits to showing the
Operator (the "curator") on this screen.

Two additional gaps, found while grepping the specification against what the frontend currently
carries, belong in the same scope: `domain/investigation/evidence` also declares a required
`capability_payload_notes` attribute (the producing capability's own payload notes, snapshotted
at collection time) that the frontend's evidence types drop entirely today — it is not
mentioned anywhere in `frontend/app/src/hooks/use-simulate-case.ts`,
`frontend/app/src/hooks/use-simulate-hypothesis.ts`, or the adapters between them and the Debug
components. It belongs on the same evidence-enrichment axis as `observed_at`/`ttl`/`inputs`.

Files most directly implicated (frontend/app, from the earlier codebase reading):
- `frontend/app/src/routes/case-simulation-case-result-panel.tsx` — the "Case result" section,
  currently with no Debug at all.
- `frontend/app/src/routes/case-simulation-detail-panel.tsx`,
  `case-simulation-detail-evidence-tab.tsx`, `case-simulation-detail-prompt-tab.tsx` — the
  existing per-hypothesis Debug this proposal mirrors and also enriches.
- `frontend/app/src/routes/case-simulation-detail-types.ts` — the `SimulationEvidenceItem` /
  `SimulationJudgmentCall` types that would carry the enriched fields.
- `frontend/app/src/routes/case-simulation-cockpit-adapters.ts` — `toDetailEvidence()`, which
  currently discards `inputs`, `observed_at`, `ttl` (and never carried
  `capability_payload_notes`), and the various `to*` functions that would need to carry
  durations/cost/consolidation debug fields onto a run.
- `frontend/app/src/routes/case-simulation-case-result-types.ts` (`CaseResultRun`),
  `frontend/app/src/hooks/use-case-simulation-history.ts` (`NewCaseResultRun`,
  `recordRun`) — where a run's history entry would need to carry the added fields.
- `frontend/app/src/hooks/use-case-simulation-cockpit.ts` — where `lastCaseResult` is today the
  only place this data is reachable, and where the case-level Debug's props would be assembled.
- `frontend/app/src/hooks/use-simulate-case.ts` — the `SimulateEvidenceItem` /
  `SimulateAssessment` / `SimulateCaseResult` types the backend response is typed as; this is
  where `capability_payload_notes` would be added.

Not in scope: any backend change — the backend (`src`) already returns every field named above;
nothing here changes what the backend computes or sends. Not in scope: anything about the
customer-facing text itself, or about diagnosis (only simulation, the curator's own route, is
touched).
