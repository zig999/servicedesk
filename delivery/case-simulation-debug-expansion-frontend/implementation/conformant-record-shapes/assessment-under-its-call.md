---
target: frontend
title: Nest CaseResultRun's assessment inside its consolidation discriminant
summary: outcome, referral, determiningHypothesis, text and register now live only inside CaseResultRun's
  consolidationCall.called-true branch (alongside usage, elapsedMs and prompt), with the production builder,
  both render sites, the nine pre-existing fixture builders and the run-record assertion all updated to
  that shape, plus one additional real reader of the type fixed for the same reason.
task: sha256:fa601e97b32fa01fbd5df6e05fa0a22b29d84b6c38fcf05a62f460cb4271de9f
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/conformant-record-shapes-assessment-under-its-call-build
files:
- path: src/routes/case-simulation-case-result-types.ts
  effect: added CaseResultAssessmentCall discriminated union (called:true carrying outcome/referral/determiningHypothesis?/text/register/usage/elapsedMs/prompt;
    called:false carrying nothing) and retyped CaseResultRun.consolidationCall to it, removing the five
    fields as CaseResultRun's own top-level fields
- path: src/routes/case-simulation-cockpit-adapters.ts
  effect: toNewCaseResultRun now builds outcome/referral/determiningHypothesis/text/register only inside
    the consolidationCall object it constructs with called:true
- path: src/routes/case-simulation-case-result-panel.tsx
  effect: the outcome/referral/determining-hypothesis summary line, the customer-facing text box, the
    Debug > Prompt tab's props and the per-run list caption all now read from shownRun.consolidationCall
    only inside a called check, falling back to a NOT_CALLED_MESSAGE / "no consolidation call" text
- path: src/routes/case-simulation-case-result-types.spec.ts
  effect: makeRun's default now nests outcome/referral/text/register inside consolidationCall (called:true)
- path: src/routes/case-simulation-case-result-panel.spec.ts
  effect: added a local calledAssessment() helper; makeRun's default and every override of the five fields
    now go through it
- path: src/routes/case-simulation-case-result-panel-debug.spec.ts
  effect: added the same calledAssessment() helper; makeRun's default and both tests' consolidationCall
    overrides now go through it
- path: src/routes/case-simulation-case-result-panel-evidence.spec.ts
  effect: makeRun's default nests the five assessment fields inside consolidationCall
- path: src/routes/case-simulation-case-result-panel-json.spec.ts
  effect: same makeRun default change
- path: src/routes/case-simulation-case-result-panel-totals.spec.ts
  effect: same makeRun default change
- path: src/routes/case-simulation-case-result-panel-compare.spec.ts
  effect: same makeRun default change
- path: src/routes/case-simulation-case-result-compare.spec.ts
  effect: same makeRun default change
- path: src/hooks/use-case-simulation-history.spec.ts
  effect: added a local calledAssessment() helper and an outcomeOf() narrowing helper; newRun's default
    and every override now go through calledAssessment, and the two .map((run) => run.outcome) reads go
    through outcomeOf
- path: src/routes/case-simulation-cockpit-adapters-run-record.spec.ts
  effect: all three assertions of toNewCaseResultRun's output now expect the five assessment fields nested
    inside consolidationCall (called:true) rather than flat on the run
- path: src/hooks/use-case-simulation-cockpit-evaluations.spec.ts
  effect: its one direct read of a real CaseResultRun's .outcome now narrows on consolidationCall.called
    before reading .outcome
criteria:
- criterion: CaseResultRun in src/routes/case-simulation-case-result-types.ts declares outcome, referral,
    determiningHypothesis, text and register only within the called true branch of its consolidation discriminant.
  met: true
  how: CaseResultRun.consolidationCall is now typed CaseResultAssessmentCall, whose called:true member
    alone declares all five fields; CaseResultRun itself no longer declares any of them
- criterion: No branch of CaseResultRun states any of those five fields where the discriminant states
    that no consolidation call happened.
  met: true
  how: 'CaseResultAssessmentCall''s called:false member is { readonly called: false } and nothing else'
- criterion: register sits in the same branch as text, usage, elapsedMs and prompt, so one shape carries
    everything the one writing call produced.
  met: true
  how: all five of outcome/referral/determiningHypothesis/text/register sit in the same object literal
    as usage/elapsedMs/prompt inside CaseResultAssessmentCall's called:true member
- criterion: A run for a narrowed simulate-hypothesis call, which resolves no outcome and no assessment,
    is expressible as a CaseResultRun without supplying any of those five fields.
  met: true
  how: 'with consolidationCall set to { called: false }, a CaseResultRun value type-checks while supplying
    none of the five fields anywhere'
- criterion: toNewCaseResultRun in src/routes/case-simulation-cockpit-adapters.ts builds the five assessment
    fields only inside the branch on which it sets called true.
  met: true
  how: the returned consolidationCall object literal sets called:true and, in that same literal, all five
    assessment fields alongside usage/elapsedMs/prompt
- criterion: src/routes/case-simulation-case-result-panel.tsx reads shownRun's outcome, referral, determiningHypothesis,
    text and register only after the discriminant states a consolidation call happened.
  met: true
  how: every read of these five fields is inside a shownRun.consolidationCall.called branch; the false
    branch reads none of them
- criterion: src/routes/case-simulation-case-result-compare.tsx reads those same five fields only after
    that same discriminant.
  met: true
  how: reviewed the file in full and grepped it for the five fields; it reads none of them anywhere, so
    the criterion holds vacuously and no source change was needed
- criterion: A shown run that carries no assessment presents no outcome, referral, determining hypothesis,
    text or register drawn from any other run of the session.
  met: true
  how: panel.tsx substitutes a static "No consolidation call was made for this run." message ("no consolidation
    call" in the per-run list caption) in place of the assessment block/props when consolidationCall.called
    is false; nothing is read from another run
- criterion: Each of the nine local makeRun and newRun fixture builders — in case-simulation-case-result-types.spec.ts,
    case-simulation-case-result-panel.spec.ts, case-simulation-case-result-panel-debug.spec.ts, case-simulation-case-result-panel-evidence.spec.ts,
    case-simulation-case-result-panel-json.spec.ts, case-simulation-case-result-panel-totals.spec.ts,
    case-simulation-case-result-panel-compare.spec.ts, case-simulation-case-result-compare.spec.ts and
    use-case-simulation-history.spec.ts — constructs its run with the five assessment fields inside the
    discriminated branch.
  met: true
  how: all nine builders now nest the five fields inside their consolidationCall literal's called:true
    branch; none declares any of the five as a top-level field any longer
- criterion: src/routes/case-simulation-cockpit-adapters-run-record.spec.ts asserts toNewCaseResultRun's
    output with the assessment nested and asserts the flat pre-correction shape nowhere.
  met: true
  how: all three assertions now expect the five fields nested under consolidationCall; none asserts them
    as top-level run properties
- criterion: The frontend type-checks with no error arising from CaseResultRun in any file that declares,
    builds or reads one.
  met: true
  how: walked every file importing case-simulation-case-result-types.ts (17 files) and every file reading
    caseResultRuns/shownRun/consolidationCall (18 files), correcting each that read/built the five fields
    at the old flat position, including one additional real reader outside the task's named ten (use-case-simulation-cockpit-evaluations.spec.ts);
    captured build's typecheck step passed
nodes:
- node: contracts/investigation/case-simulation
  encoded_at:
  - src/routes/case-simulation-case-result-types.ts
  how: 'simulate-hypothesis "resolves no outcome" is now expressible on the frontend''s own run type without
    inventing an assessment: CaseResultRun with consolidationCall { called: false } carries none of the
    five assessment fields'
- node: domain/investigation/assessment
  encoded_at:
  - src/routes/case-simulation-case-result-types.ts
  - src/routes/case-simulation-cockpit-adapters.ts
  how: CaseResultAssessmentCall's called:true branch carries exactly this node's own attributes, and toNewCaseResultRun
    maps a SimulateCaseResult's assessment into that same shape
- node: rules/investigation/the-consolidation-answer-states-its-register
  encoded_at:
  - src/routes/case-simulation-case-result-types.ts
  - src/routes/case-simulation-cockpit-adapters.ts
  how: register is declared in, and only in, the same object as text/usage/elapsedMs/prompt, and toNewCaseResultRun
    sets it there alongside them from the one assessment the writing call returned
- node: rules/investigation/a-simulation-session-retains-its-runs-and-shows-one
  encoded_at:
  - src/routes/case-simulation-case-result-panel.tsx
  - src/routes/case-simulation-case-result-compare.tsx
  - src/routes/case-simulation-case-result-types.ts
  how: only the assessment half of "presenting every part of the shown run from its own returned record"
    is this task's to answer (per its own REMAINDER note); panel.tsx now reads the assessment only from
    shownRun's own consolidationCall, substituting an explicit message rather than a borrowed value; compare.tsx
    already read none of these fields
- node: scenarios/investigation/a-single-hypothesis-is-simulated
  encoded_at:
  - src/routes/case-simulation-case-result-types.ts
  how: '"no outcome and no assessment are resolved" for a simulate-hypothesis call is now representable
    on CaseResultRun by consolidationCall: { called: false }, with none of the five assessment fields
    required or even permitted in that branch'
inferences:
- inferred: introduced a new exported type, CaseResultAssessmentCall, rather than widening the existing
    CaseResultConsolidationCall type in place
  from: case-simulation-case-result-debug-tab.tsx and its spec import CaseResultConsolidationCall by name
    and construct minimal called:true values; widening that shared type would force its fixture to supply
    fields it has no reason to know about, breaking a file outside this task's named scope. A called:true
    CaseResultAssessmentCall value structurally satisfies CaseResultConsolidationCall's called:true shape
- inferred: for a shown run whose consolidationCall states no call happened, panel.tsx substitutes a static
    message rather than hiding the block entirely or rendering empty-string/em-dash placeholders
  from: the task's own UNDERDETERMINED note names both options as reasonable and explicitly rules out
    an empty/em-dash placeholder as attributing an assessment the run never returned; a message was chosen
    over hiding the block so a curator sees why nothing is shown, echoing the existing NOT_CALLED_MESSAGE
    convention already in case-simulation-case-result-debug-tab.tsx
- inferred: fixed use-case-simulation-cockpit-evaluations.spec.ts's read of a real CaseResultRun's .outcome,
    though this file is not one of the task's named ten spec files
  from: the task's own last criterion is universal ("in any file that declares, builds or reads one"),
    and this file reads a genuine CaseResultRun produced by the real hook directly
preserved:
- selecting an earlier run from the session's history still shows that run's own evidence, totals, JSON
  payload and consolidation prompt/usage/elapsedMs unchanged; only the assessment fields' position on
  the type moved
- case-simulation-case-result-compare.tsx's verdict-only rendering is untouched and behaves identically
- case-simulation-case-result-debug-tab.tsx's own existing conditional rendering of register/usage/elapsedMs
  behind consolidationCall.called is untouched
- use-case-simulation-cockpit.ts, use-case-simulation-history.ts, case-simulation-hypotheses-table-row.ts
  and case-simulation-case-result-totals-tab.tsx were read and confirmed to touch no field this task moved
deferred:
- what: case-simulation-case-result-debug-tab.tsx keeps register as its own separate prop alongside consolidationCall
    (of the narrower, unchanged CaseResultConsolidationCall type), rather than reading register from a
    consolidationCall that already carries it.
  why: the task's Notes name this file explicitly as "not a file this task changes"; adopting the fuller
    nesting there, and retiring the now-parallel types, would widen this task beyond the production builder,
    the two render sites and the ten spec files it names
---

## What it is
CaseResultRun's assessment (outcome/referral/determiningHypothesis/text/register) moves inside its own consolidation discriminant, alongside usage/elapsedMs/prompt, so a run that never resolved one cannot be forced to invent it -- with the production builder, both render sites, the nine pre-existing fixture builders, the run-record assertion, and one additional genuine reader outside the task's named set, all updated in lockstep.

## Notes
The UNDERDETERMINED note on what a shown run with no consolidation call should present is answered by a disclosed choice: a static "No consolidation call was made for this run." message (panel body) / "no consolidation call" (per-run list caption), never a borrowed or invented value.
A new type, CaseResultAssessmentCall, was introduced rather than widening the existing CaseResultConsolidationCall in place, to avoid forcing case-simulation-case-result-debug-tab.tsx (outside this task's scope) to supply fields it has no reason to know about; the two types remain structurally compatible.
