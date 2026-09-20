---
target: frontend
title: Case-level Debug block for the consolidation call's record
summary: A Debug block under Case result, with a Prompt tab reused/parameterized from
  the per-hypothesis Debug, showing the shown run's consolidation prompt, token usage,
  elapsed_ms and register, and a shown-run selection the block reads from.
task: sha256:3b0f9884ce6cb6a6de2f998de1f713d4d719e5b36d060d163d28c1497ffb9231
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/case-run-record-consolidation-debug-build
files:
- path: src/routes/case-simulation-case-result-panel.tsx
  effect: added a Debug section (Tabs/TabsList/TabsTrigger/TabsContent, one Prompt
    tab) rendering CaseSimulationCaseResultDebugTab for the shown run; introduced
    shownRunId state and a derived shownRun (falls back to the last run), rebound
    outcome/referral/determining, the stale marker and the customer text box from
    lastRun to shownRun; added a Show/Shown toggle button per entry in Runs this session
- path: src/routes/case-simulation-case-result-debug-tab.tsx
  effect: new file. Renders a stats line (register, input/output tokens, elapsed_ms)
    when consolidationCall.called is true, followed by the reused CaseSimulationDetailPromptTab
    for the prompt itself
- path: src/routes/case-simulation-detail-prompt-tab.tsx
  effect: widened the judgmentCall prop's type from SimulationJudgmentCall to a new
    exported structural union PromptTabCall ({called:true; prompt:string} | {called:false}),
    which both SimulationJudgmentCall and CaseResultConsolidationCall satisfy structurally;
    added an optional notCalledMessage prop defaulting to the existing hardcoded hypothesis
    message
criteria:
- criterion: After a case simulation run, a Debug block is presented under the Case
    result section.
  met: true
  how: a Debug heading plus a Tabs block is rendered inside the same section as soon
    as runs.length > 0
- criterion: The block presents the consolidation prompt the run's assessment carries,
    whole.
  met: true
  how: shownRun.consolidationCall is passed to the reused CaseSimulationDetailPromptTab,
    which renders call.prompt verbatim with no transformation
- criterion: The block presents the consolidation call's input token count and its
    output token count.
  met: true
  how: the stats line renders consolidationCall.usage.inputTokens and .outputTokens
    directly
- criterion: The block presents the consolidation call's elapsed_ms.
  met: true
  how: the stats line renders consolidationCall.elapsedMs
- criterion: The block presents the register that call used, as one of formal or plain.
  met: true
  how: the stats line renders the register prop, passed as shownRun.register
- criterion: The values presented are the shown run's own, so selecting an earlier
    run in the session history presents that run's consolidation record.
  met: true
  how: shownRunId state and derived shownRun wire the Debug block and the rest of
    the panel's shown-run fields from one shown run, switched by a new per-run Show
    button
nodes:
- node: contracts/investigation/case-simulation
  how: this task adds no operation; it presents detail the contract already says simulate-case
    returns and faces to the curator
- node: rules/investigation/a-simulation-session-retains-its-runs-and-shows-one
  encoded_at:
  - src/routes/case-simulation-case-result-panel.tsx
  how: the rule's selection clause is answered by shownRunId/shownRun in the panel,
    which sources every currently-rendered part of the panel from one shown run, switched
    by the new per-run Show control
- node: rules/investigation/a-presented-consolidation-prompt-is-shown-whole
  encoded_at:
  - src/routes/case-simulation-detail-prompt-tab.tsx
  - src/routes/case-simulation-case-result-debug-tab.tsx
  how: the reused CaseSimulationDetailPromptTab renders call.prompt exactly as carried,
    with no masking or truncation
- node: domain/investigation/assessment
  encoded_at:
  - src/routes/case-simulation-case-result-debug-tab.tsx
  how: the four call-level facts this task's criteria require are exactly the four
    this node declares required on every assessment
- node: domain/investigation/usage
  encoded_at:
  - src/routes/case-simulation-case-result-debug-tab.tsx
  how: input_tokens/output_tokens are presented as CaseResultUsage's own inputTokens/outputTokens
- node: domain/knowledge/consolidation-register
  encoded_at:
  - src/routes/case-simulation-case-result-debug-tab.tsx
  how: the register value rendered is one of the two enumeration values this node
    fixes, read straight from the shown run's own register field
inferences:
- inferred: The Debug block's shown-run selection mechanism (shownRunId state and
    the per-run Show/Shown button) had to be introduced by this task, not merely consumed
    from an existing one.
  from: this task's own Notes carry no REMAINDER excusing the retention/selection
    clauses, unlike sibling tasks which explicitly defer that clause to this one
- inferred: The rest of the panel's already-displayed fields now read from the same
    shown run as the Debug block.
  from: the rule's own text presenting every part of the shown run alike, as one coherent
    record
- inferred: The concrete UI control for selecting an earlier run (a Show/Shown toggle
    button) is a how, left to this delivery.
  from: no node or reference names a control shape for this selection
- inferred: A defensive not-called message for the case-level consolidation call is
    UI copy for a branch this task's own Notes state is unreachable in practice.
  from: this task's own Notes stating a case run always carries all four fields
- inferred: case-simulation-detail-prompt-tab.tsx's judgmentCall prop keeps its existing
    name rather than being renamed.
  from: the existing spec file's own two tests construct their call with the literal
    key judgmentCall
preserved:
- case-simulation-detail-prompt-tab.spec.ts's two existing tests keep passing unchanged,
  since the widened prop type is structurally satisfied by the same values those tests
  already construct.
- case-simulation-case-result-panel.spec.ts's existing assertions about the last run
  keep holding, since shownRun defaults to lastRun whenever no run has been explicitly
  selected.
- case-simulation-case-result-panel-compare.spec.ts's checkbox-driven compare-selection
  and Compare-button behavior are untouched.
deferred:
- what: A case-level evidence tab and a case-level raw-JSON tab beside the new Prompt
    tab.
  why: out of this task's own criteria; task/evidence-detail/case-evidence-display
    and task/case-run-record/raw-payload own those additions, both depending on this
    task
- what: A case-level cost-totals/durations line or tab.
  why: task/case-run-record/run-totals's own scope, cut apart deliberately
- what: Whether the shown-run selection should reset to the newest run whenever a
    fresh simulation completes while an earlier run is explicitly shown.
  why: no criterion of this task or its siblings addresses this interaction; the specification
    is silent on it
---

## What it is
The case-level mirror of the per-hypothesis Debug's Prompt tab, for the one call that produces the text the requester would see, plus the shown-run selection mechanism the whole Case result panel now reads from.

## Notes
This task introduced the shown-run concept (shownRunId/shownRun) that its sibling tasks (run-totals, raw-payload, case-evidence-display) depend on for their own "selecting an earlier run" criteria, since no earlier task's Notes claimed that clause.
