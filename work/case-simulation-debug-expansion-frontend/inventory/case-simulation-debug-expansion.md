---
title: Case simulation Debug surface
summary: The frontend module rendering the case-simulation screen's Debug tabs, evidence
  display, and per-run history, where the proposal's additions land.
area:
- frontend/app/src/routes
- frontend/app/src/hooks
modules:
- name: case-simulation-case-result-panel
  path: frontend/app/src/routes/case-simulation-case-result-panel.tsx
  role: touched
- name: case-simulation-case-result-types
  path: frontend/app/src/routes/case-simulation-case-result-types.ts
  role: touched
- name: case-simulation-detail-panel
  path: frontend/app/src/routes/case-simulation-detail-panel.tsx
  role: touched
- name: case-simulation-detail-evidence-tab
  path: frontend/app/src/routes/case-simulation-detail-evidence-tab.tsx
  role: touched
- name: case-simulation-detail-prompt-tab
  path: frontend/app/src/routes/case-simulation-detail-prompt-tab.tsx
  role: adjacent
- name: case-simulation-detail-types
  path: frontend/app/src/routes/case-simulation-detail-types.ts
  role: touched
- name: case-simulation-cockpit-adapters
  path: frontend/app/src/routes/case-simulation-cockpit-adapters.ts
  role: touched
- name: case-simulation-hypotheses-table-row
  path: frontend/app/src/routes/case-simulation-hypotheses-table-row.ts
  role: depends-on
- name: case-simulation-hypotheses-table
  path: frontend/app/src/routes/case-simulation-hypotheses-table.tsx
  role: adjacent
- name: use-case-simulation-history
  path: frontend/app/src/hooks/use-case-simulation-history.ts
  role: touched
- name: use-case-simulation-cockpit
  path: frontend/app/src/hooks/use-case-simulation-cockpit.ts
  role: touched
- name: use-simulate-case
  path: frontend/app/src/hooks/use-simulate-case.ts
  role: touched
- name: use-simulate-hypothesis
  path: frontend/app/src/hooks/use-simulate-hypothesis.ts
  role: depends-on
conventions:
- statement: A Debug block is a Tabs (@tui/ui/tabs) with a TabsList/TabsTrigger/TabsContent
    per concern, defaultValue on the first tab.
  seen_at: frontend/app/src/routes/case-simulation-detail-panel.tsx
- statement: A JSON debug tab renders the raw payload with JSON.stringify(value, null,
    2) inside a <pre className="rounded-md border border-border bg-muted p-3 text-sm
    font-mono overflow-x-auto">.
  seen_at: frontend/app/src/routes/case-simulation-detail-panel.tsx
- statement: Wire-shaped fields use snake_case in the Simulate* hook types (use-simulate-case.ts,
    use-simulate-hypothesis.ts); the same field is renamed to camelCase in the Detail*/Simulation*
    UI types under routes/, with the renaming done in case-simulation-cockpit-adapters.ts.
  seen_at: frontend/app/src/routes/case-simulation-cockpit-adapters.ts
- statement: A to* adapter function in case-simulation-cockpit-adapters.ts maps one
    wire type to one UI/history type field-by-field, dropping fields it does not carry
    forward rather than passing the object through.
  seen_at: frontend/app/src/routes/case-simulation-cockpit-adapters.ts
- statement: A history entry type (NewCaseResultRun) is Omit<CaseResultRun, "id" |
    "ranAt" | "stale">; the hook (useCaseSimulationHistory.recordRun) fills the three
    omitted fields when appending.
  seen_at: frontend/app/src/hooks/use-case-simulation-history.ts
- statement: An optional numeric/duration field absent from an older or partial response
    is typed with ? (e.g. writing?, writingMs?) and rendered conditionally rather
    than defaulted to 0.
  seen_at: frontend/app/src/routes/case-simulation-hypotheses-table.tsx
- statement: A judgment/consolidation call that may not have happened is modeled as
    a discriminated union on a called boolean (SimulationJudgmentCall), not as all-optional
    fields, and the tab component branches on it.
  seen_at: frontend/app/src/routes/case-simulation-detail-types.ts
- statement: An evidence item's free-text observation is pretty-printed via a try/catch
    JSON.parse then JSON.stringify, falling back to the raw string, and shown inside
    a collapsed <details>.
  seen_at: frontend/app/src/routes/case-simulation-detail-evidence-tab.tsx
must_not_duplicate:
- what: Observation pretty-printing (prettyPrintObservation, try/parse/stringify with
    fallback)
  at: frontend/app/src/routes/case-simulation-detail-evidence-tab.tsx
- what: The evidence-result status-dot mapping (EVIDENCE_RESULT_CELL) and CaseSimulationStatusDot
    component it feeds
  at: frontend/app/src/routes/case-simulation-detail-evidence-tab.tsx
- what: The Tabs/TabsList/TabsTrigger/TabsContent composition pattern for a Debug
    block, already built for the per-hypothesis panel
  at: frontend/app/src/routes/case-simulation-detail-panel.tsx
- what: The wire-to-UI field-renaming adapter functions (toDetailEvidence, toDetailEvaluation,
    toDetailJudgmentCall, toDurations, toNewCaseResultRun) — new fields extend these,
    they are not re-derived elsewhere
  at: frontend/app/src/routes/case-simulation-cockpit-adapters.ts
- what: The durations-line rendering convention (conditional writingMs, joined with
    ·)
  at: frontend/app/src/routes/case-simulation-hypotheses-table.tsx
risks:
- risk: toDetailEvidence() is the single conversion point from SimulateEvidenceItem/hypothesis
    Evidence to DetailEvidenceItem; both the existing per-hypothesis Debug and the
    proposed case-level Debug consume its output, so widening it (adding inputs/observed_at/ttl/capability_payload_notes)
    changes what both surfaces receive.
  consumers:
  - frontend/app/src/routes/case-simulation-detail-evidence-tab.tsx
  - frontend/app/src/hooks/use-case-simulation-cockpit.ts
- risk: CaseResultRun/NewCaseResultRun are read by the case-result panel, the compare
    view, and constructed by recordRun; adding required fields to carry durations/cost/consolidation-debug
    per run breaks every call site that builds or narrows this type unless the fields
    are added as optional or every producer is updated together.
  consumers:
  - frontend/app/src/routes/case-simulation-case-result-panel.tsx
  - frontend/app/src/routes/case-simulation-case-result-compare.tsx
  - frontend/app/src/hooks/use-case-simulation-history.ts
  - frontend/app/src/hooks/use-case-simulation-cockpit.ts
- risk: lastCaseResult in use-case-simulation-cockpit.ts is currently the only place
    the full SimulateCaseResult (needed for the case-level JSON tab and Consolidation
    tab) is held; a raw-JSON tab for a past run in "Runs this session" needs that
    data captured per-run at recordRun time, not read back off lastCaseResult after
    a later run has replaced it.
  consumers:
  - frontend/app/src/hooks/use-case-simulation-cockpit.ts
  - frontend/app/src/routes/case-simulation-case-result-panel.tsx
rationale: The scope names these exact files as "most directly implicated" from an
  earlier codebase reading; this survey re-read each one to confirm the current shape
  and record it as inventory rather than take the scope's list on faith.
sources:
- work/case-simulation-debug-expansion-frontend/intake/scope.md
---

## What it is
The case-simulation route's Debug surface: a per-hypothesis Debug panel (Evidence/Prompt/JSON tabs) already built, a "Case result" panel with no Debug of its own yet, and the cockpit hook and adapter layer that feed both from the backend's SimulateCaseResult/SimulateHypothesisResult responses.
case-simulation-cockpit-adapters.ts is the one seam where every wire field (snake_case, from use-simulate-case.ts / use-simulate-hypothesis.ts) is renamed and narrowed into the UI-facing camelCase types (case-simulation-detail-types.ts, case-simulation-case-result-types.ts, case-simulation-hypotheses-table-row.ts).
SimulateEvidenceItem (in use-simulate-case.ts) already carries inputs, observed_at, and ttl; toDetailEvidence() reads none of the three into DetailEvidenceItem.
SimulateAssessment already carries usage, elapsed_ms, and prompt for the consolidation step; no adapter or component reads any of them today.
SimulateCaseResult.cost (calls, input_tokens, output_tokens) is present on the response type but is not referenced anywhere under routes/ or hooks/.
CaseResultRun (the shape "Runs this session" stores) carries only outcome/referral/text/register/hypotheses/stale — no durations, cost, or consolidation debug fields, and toNewCaseResultRun() does not populate any.
capability_payload_notes (named in the proposal as a domain-level required evidence attribute) does not appear anywhere in use-simulate-case.ts, use-simulate-hypothesis.ts, or the adapters — it is not merely dropped in conversion, it was never added to the frontend's wire types at all.

## Notes
The per-hypothesis Debug's Evidence/Prompt/JSON tab composition in case-simulation-detail-panel.tsx is the direct template the proposal asks the case-level Debug to mirror; reusing its Tabs structure and the CaseSimulationDetailEvidenceTab/CaseSimulationDetailPromptTab components (parameterized rather than duplicated) keeps the two Debug blocks from diverging.
SimulationDurations.writingMs is already optional and conditionally rendered in DurationsLine (case-simulation-hypotheses-table.tsx), which is the existing precedent for how an optional numeric field from a partial run should be displayed — relevant to how a case-level Cost line/tab would handle a run where assessment fields might be absent.
The evidence type is duplicated in full between SimulateEvidenceItem (use-simulate-case.ts) and Evidence (use-simulate-hypothesis.ts) — both would need the same new fields (capability_payload_notes plus whatever inputs decision is made) added in parallel, since neither imports the other.
No test files were opened in this survey beyond noting case-simulation-hypotheses-table.spec.ts exists alongside the table component, following this codebase's colocated .spec.ts convention; a plan touching these modules should expect a sibling spec file per touched component/hook.
