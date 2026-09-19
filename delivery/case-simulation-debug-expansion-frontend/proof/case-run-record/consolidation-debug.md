---
target: frontend
title: Case-level Debug block for the consolidation call's record
summary: New tests over the shown run's consolidation prompt, token usage, elapsed_ms
  and register, and over the shown-run switch and the Debug block's presence, leaving
  the broader shown-run rule, the assessment record whole, and the case-simulation
  contract unproven where no finite frontend test can decide them.
implementation: sha256:b8699f4b2a3d8c886f309a155557fb9f96dbe5b2896d5cbb17592e2a063ef3b3
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/case-run-record-consolidation-debug-suite
tests:
- file: src/routes/case-simulation-case-result-debug-tab.spec.ts
  name: CaseSimulationCaseResultDebugTab -- the consolidation prompt shown whole (criterion
    2) > renders the consolidation call's own prompt exactly as carried, with no masking
    or truncation
  proves: 'criterion: the block presents the consolidation prompt the run''s assessment
    carries, whole'
  fails_when: the rendered prompt differs at all from the exact string the consolidation
    call's own record carries
  demonstrates: rules/investigation/a-presented-consolidation-prompt-is-shown-whole
- file: src/routes/case-simulation-case-result-debug-tab.spec.ts
  name: CaseSimulationCaseResultDebugTab -- the consolidation call's own usage and
    duration (criteria 3, 4) > renders exactly the consolidation call's own input
    token count, output token count and elapsed_ms
  proves: 'criteria: input/output token counts and elapsed_ms'
  fails_when: the rendered stats line shows different values than the consolidation
    call's own record
  demonstrates: domain/investigation/usage
- file: src/routes/case-simulation-case-result-debug-tab.spec.ts
  name: CaseSimulationCaseResultDebugTab -- the register the call actually used (criterion
    5) > renders %s exactly when that is the register the call actually used (formal,
    plain)
  proves: 'criterion: the block presents the register that call used'
  fails_when: either enumeration value fails to render as itself when that is the
    value the call actually used
  demonstrates: domain/knowledge/consolidation-register
- file: src/routes/case-simulation-case-result-panel-debug.spec.ts
  name: CaseSimulationCaseResultPanel -- the Debug block under Case result (criterion
    1) > presents a Debug block with a Prompt tab once a case simulation run has completed
  proves: 'criterion: after a case simulation run, a Debug block is presented under
    the Case result section'
  fails_when: no Debug heading or Prompt tab is rendered once at least one run has
    completed
- file: src/routes/case-simulation-case-result-panel-debug.spec.ts
  name: CaseSimulationCaseResultPanel -- the Debug block reflects the shown run (criterion
    6) > presents the earlier run's own consolidation record once that run is shown,
    in place of the last run's
  proves: 'criterion: the values presented are the shown run''s own'
  fails_when: clicking Show for an earlier run leaves the last run's own consolidation
    record displayed instead of switching
not_applicable:
- edge_case: An empty or an extremely long consolidation prompt.
  why: neither the criterion nor the node draws a boundary at a prompt's length or
    emptiness
- edge_case: Two Show clicks racing against each other, or a Show click firing while
    a fresh simulation is in flight.
  why: shown-run selection is synchronous local component state with no async boundary
    to race across; whether a fresh run resets the shown selection is a question the
    specification leaves silent, not an edge case this task's criteria reach
- edge_case: Interaction between the shown-run selection and the Compare view's own
    two-run checkbox selection.
  why: the implementation record's own preserved section states the Compare view is
    untouched by this task
untested:
- domain/investigation/assessment's fact, as the node states it whole, is an eight-attribute
  record; this proof's tests decide only the four call-level attributes this task's
  criteria name (usage, elapsed_ms, prompt, register); outcome, referral, determining_hypothesis
  and text are established by an earlier task's own tests.
- contracts/investigation/case-simulation names an API-level engine contract spanning
  the backend engine; no finite frontend test can decide that fact.
- rules/investigation/a-simulation-session-retains-its-runs-and-shows-one states the
  shown run presents every part alike -- evidence, evaluations, assessment, cost and
  durations; this task's own shipped files wire only the assessment-related fields
  and the new consolidation-call Debug block, with the rest assigned to sibling tasks,
  so no test scoped to this task's own delivery decides the rule's fact whole.
- 'The not-called branch of case-simulation-case-result-debug-tab.tsx is untested:
  the implementation record''s own inference states this branch is unreachable in
  practice, and no node states behavior for it, so a test over it would pin an inference
  rather than an obligation.'
---

## What it is
The proof for task/case-run-record/consolidation-debug: that the Debug block under Case result presents the shown run's consolidation prompt, usage, elapsed_ms and register, and that selecting an earlier run switches what it shows.

## Notes
None.
