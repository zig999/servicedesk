---
title: Proof that a single-hypothesis simulation's evidence and prompt reach the Detail panel
summary: Three spec files prove the fix at three levels -- the composed hook, the adapters, and the rendered
  Detail panel -- covering all seven criteria of wire-hypothesis-evidence-and-prompt, including the case-sourced
  non-regression criteria.
implementation: sha256:39b3c1dd8c84d0f5ec9b0c8a885487c78999bb5aedb4f96a7d0700a67d5ea7a9
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/simulation-detail-hypothesis-hotfix-wire-hypothesis-evidence-and-prompt-suite-4
tests:
- file: src/hooks/use-case-simulation-cockpit-hypothesis-evidence-and-prompt.spec.ts
  name: 'useCaseSimulationCockpit -- this task''s own reproduction: a single-hypothesis response carrying
    real evidence and a real prompt (criteria 1 and 3) > reaches the Detail panel''s Evidence tab and
    Prompt tab with that response''s own real content, not the empty/placeholder state the bug left behind'
  proves: 'Criteria 1 and 3 together, at the real composed hook and rendered panel: dispatching a real
    simulate-hypothesis response carrying evidence and a full prompt/usage/elapsed_ms reaches both the
    Evidence tab ("billing-history") and the Prompt tab (the real prompt text, with the placeholder absent)
    through the actual onSimulateHypothesis -> onSelectHypothesis -> detail flow, not a hand-built fixture.'
  fails_when: the Evidence tab fails to show "billing-history", or the Prompt tab shows the placeholder
    text instead of (or alongside) the real prompt, once a real dispatch response carries both.
- file: src/hooks/use-case-simulation-cockpit-hypothesis-evidence-and-prompt.spec.ts
  name: useCaseSimulationCockpit -- a full-case run's own evidence still reaches a case-sourced selection
    unchanged (criterion 6, Evidence tab) > keeps reading a case-sourced selection's Evidence tab data
    from the run's own evidence array, not the newly-added per-evaluation field
  proves: Criterion 6's Evidence-tab half -- a case-sourced selection's detail.evidence still resolves
    from lastCaseResult.evidence, unaffected by the new per-evaluation evidence field this fix adds for
    the hypothesis-sourced path.
  fails_when: a case-sourced selection's detail.evidence stops matching the run's own evidence array,
    or starts reading the new per-evaluation field instead.
- file: src/hooks/use-case-simulation-cockpit-hypothesis-evidence-and-prompt.spec.ts
  name: useCaseSimulationCockpit -- a full-case run's own raw response still reaches a case-sourced selection
    unchanged (criterion 6, JSON tab) > keeps the selected evaluation's own raw wire object as the JSON
    tab's rawResponse, unaffected by the new evidence field this fix adds
  proves: Criterion 6's JSON-tab half -- rawResponse for a case-sourced selection is unaffected by this
    fix.
  fails_when: detail.rawResponse for a case-sourced selection stops matching the evaluation's own raw
    wire object.
- file: src/routes/case-simulation-cockpit-adapters-hypothesis-evidence-and-prompt.spec.ts
  name: fromHypothesisEvaluation -- carries the run's own evidence onto the normalized evaluation (criterion
    1) > carries a single-hypothesis run's own collected evidence item through, narrowed to the Detail
    region's own shape
  proves: Criterion 1 at the adapter level -- fromHypothesisEvaluation(evaluation, evidence) narrows the
    run's own evidence array onto CockpitEvaluation.evidence via toDetailEvidence.
  fails_when: normalized.evidence does not match the narrowed shape of the evidence array passed in as
    the second argument.
- file: src/routes/case-simulation-cockpit-adapters-hypothesis-evidence-and-prompt.spec.ts
  name: fromHypothesisEvaluation -- an empty run leaves the normalized evaluation's evidence an empty
    array (criterion 2) > normalizes an empty evidence array to an empty array rather than leaving the
    field undefined
  proves: Criterion 2 at the adapter level -- an empty evidence array normalizes to [], never undefined.
  fails_when: normalized.evidence is undefined (rather than []) when called with an empty evidence array.
- file: src/routes/case-simulation-cockpit-adapters-hypothesis-evidence-and-prompt.spec.ts
  name: toDetailJudgmentCall -- a real judgment call reaches the normalized evaluation (criterion 3) >
    answers called:true with the evaluation's own usage, elapsedMs and prompt when a hypothesis-sourced
    evaluation carries all three
  proves: Criterion 3 at the adapter level -- toDetailJudgmentCall answers called:true with the real usage/elapsedMs/prompt
    for a hypothesis-sourced evaluation carrying all three.
  fails_when: toDetailJudgmentCall answers called:false, or omits/misreports usage, elapsedMs or prompt,
    for an evaluation carrying all three.
- file: src/routes/case-simulation-cockpit-adapters-hypothesis-evidence-and-prompt.spec.ts
  name: toDetailJudgmentCall -- the no-data case still answers called:false (criterion 4) > answers called:false
    when a hypothesis-sourced evaluation carries none of usage, elapsed_ms and prompt / answers called:false
    when only some of the three are present, never a partial called:true
  proves: Criterion 4 at the adapter level -- an evaluation carrying none, or only some, of usage/elapsed_ms/prompt
    still answers called:false; the co-occurrence check is strict about all three.
  fails_when: toDetailJudgmentCall answers called:true for an evaluation missing any one of usage, elapsed_ms
    or prompt.
- file: src/routes/case-simulation-cockpit-adapters-hypothesis-evidence-and-prompt.spec.ts
  name: toDetailJudgmentCall -- the same fix reaches a case-sourced evaluation too, since this adapter
    carries no source-specific branch (criterion 5) > answers called:true for a case-sourced evaluation
    carrying usage, elapsed_ms and prompt, exactly as it would for a hypothesis-sourced one
  proves: Criterion 5 -- the fix is source-agnostic; a case-sourced evaluation carrying all three fields
    gets the identical called:true treatment.
  fails_when: toDetailJudgmentCall answers differently for a case-sourced evaluation than a hypothesis-sourced
    one carrying the same usage/elapsed_ms/prompt.
- file: src/routes/case-simulation-detail-panel-hypothesis-evidence-and-prompt.spec.ts
  name: CaseSimulationDetailPanel -- a single-hypothesis run's own evidence reaches the Evidence tab (criterion
    1) > renders the collected evidence item a single-hypothesis simulation's response actually carried,
    the same way a full-case simulation's evidence already renders
  proves: Criterion 1 at the rendered panel, composed through the real adapters rather than a hand-built
    fixture.
  fails_when: the Evidence tab fails to show "billing-history" or "fetch-billing-account 1 → billing-connector"
    once fromHypothesisEvaluation/toDetailEvaluation compose real evidence into the panel's own props.
- file: src/routes/case-simulation-detail-panel-hypothesis-evidence-and-prompt.spec.ts
  name: CaseSimulationDetailPanel -- a single-hypothesis run with no evidence renders the empty state,
    not an error (criterion 2) > shows "No evidence collected for this hypothesis." rather than throwing
    or rendering nothing
  proves: Criterion 2 at the rendered panel -- an empty evidence array renders the existing empty-state
    text without throwing.
  fails_when: rendering throws, or the empty-state text is absent, for a normalized evaluation carrying
    an empty evidence array.
- file: src/routes/case-simulation-detail-panel-hypothesis-evidence-and-prompt.spec.ts
  name: CaseSimulationDetailPanel -- a single-hypothesis run's own real prompt reaches the Prompt tab
    (criterion 3) > shows the evaluation's own real prompt once the Prompt tab is selected, not the never-called
    placeholder
  proves: Criterion 3 at the rendered panel.
  fails_when: the Prompt tab shows the placeholder instead of (or alongside) the real prompt text once
    the composed props carry a called judgment.
- file: src/routes/case-simulation-detail-panel-hypothesis-evidence-and-prompt.spec.ts
  name: CaseSimulationDetailPanel -- a no-data single-hypothesis evaluation still shows the never-called
    placeholder (criterion 4) > keeps showing "Judgment was never called for this hypothesis." for an
    inconclusive, no-data evaluation carrying no usage/elapsed_ms/prompt
  proves: Criterion 4 at the rendered panel.
  fails_when: the placeholder text is absent for a no-data evaluation's Prompt tab.
- file: src/routes/case-simulation-detail-panel-hypothesis-evidence-and-prompt.spec.ts
  name: CaseSimulationDetailPanel -- the same fix reaches a full-case run's own Prompt tab (criterion
    5) > shows a case-sourced evaluation's own real prompt once the Prompt tab is selected
  proves: Criterion 5 at the rendered panel, for the case-sourced path composed through fromCaseEvaluation.
  fails_when: a case-sourced evaluation's real prompt fails to render on the Prompt tab.
- file: src/routes/case-simulation-detail-panel-hypothesis-evidence-and-prompt.spec.ts
  name: CaseSimulationDetailPanel -- the rest of the Detail panel stays correct once real evidence and
    judgment data flow through (criterion 7) > still shows the verdict, every citation, the hypothesis
    revision's own criterion text and the Stale indicator for a hypothesis-sourced evaluation that now
    also carries evidence and a judgment call
  proves: Criterion 7 -- the verdict dot, citations list, criterion text and stale indicator are unaffected
    by this fix, even once the same evaluation also carries real evidence and a real judgment call.
  fails_when: the verdict, a citation, the criterion text, or the Stale indicator fails to render for
    an evaluation that also carries evidence and judgment-call data.
not_applicable:
- edge_case: a single-hypothesis response carrying evidence but only a partial judgment call (e.g. usage
    and elapsed_ms present, prompt absent)
  why: already covered by the adapter-level edge-case test (toDetailJudgmentCall's strict co-occurrence
    check, case-simulation-cockpit-adapters-hypothesis-evidence-and-prompt.spec.ts); the rendered panel
    reads only toDetailEvaluation's own output, which that adapter test already proves cannot be a partial
    called:true.
---

## What it is
Proof, at three levels, that a single-hypothesis simulation's own evidence and prompt reach the Detail panel exactly as a full-case simulation's already do, without disturbing the case-sourced path.

## Notes
None.
