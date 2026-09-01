---
title: Simulate-hypothesis's factory takes now/deadline from its caller, like simulate-case's already
  does, and the pipeline still bounds each stage by it
summary: Fixes production-simulate-hypothesis.factory.ts to accept now and deadline as
  caller-supplied inputs, removing its own internal TOTAL_DEADLINE_BUDGET_MS constant, so
  simulate-hypothesis stops inventing an undecided total and instead follows the same pattern its
  sibling simulate.factory.ts already uses for simulate-case — with the accepted deadline still
  reaching and bounding the pipeline's own stages, never merely accepted and discarded.
objective: production-simulate-hypothesis.factory.ts's returned runner takes now and deadline from
  its caller, the same way simulate.factory.ts's returned runner already does, propagates them
  unchanged into simulate-hypothesis-pipeline.ts exactly as the sibling runner already propagates
  its own, and no longer computes or invents a total deadline of its own.
criteria:
- createProductionHypothesisSimulationRunner's returned function accepts now and deadline as part
  of its call argument, the same way createSimulationRunner's returned function already does —
  neither is computed internally from Date.now() or a module constant.
- The TOTAL_DEADLINE_BUDGET_MS module constant no longer exists in
  production-simulate-hypothesis.factory.ts.
- The now and deadline this runner is given reach runSimulateHypothesisPipeline unchanged, so each
  of the pipeline's own stages still receives the minimum of its nominal budget and the time
  remaining before that same propagated deadline — the deadline this task's runner accepts is
  never merely accepted and left unused.
- Every other wiring production-simulate-hypothesis.factory.ts performs (capabilities, glossary,
  connector configurations, observation source, evaluator, poolSize) is unchanged.
implements:
- constraints/the-deadline-is-an-absolute-propagated-instant
sources:
- intake/scope.md
---

## What it is

The corrective fix making production-simulate-hypothesis.factory.ts take now/deadline from its
caller instead of inventing a twenty-second constant internally, with the accepted deadline still
reaching and bounding simulate-hypothesis-pipeline.ts's own stages exactly as before.

## Notes

UNDERDETERMINED, from the binder — no criterion of this task constrains where the now/deadline
values this runner's caller supplies originate; a caller that itself invents the same constant one
layer up would still satisfy every criterion here without recording one absolute deadline at the
simulate-hypothesis request's own entry point, which
constraints/the-deadline-is-an-absolute-propagated-instant's first clause asks for. That is a fact
about the request's own entry point, outside this factory file's scope, and is not settled by this
task.
ADVISORY, from the binder — no candidate states a declared total deadline for simulate-hypothesis
specifically; once this task lands, the value bounding a simulate-hypothesis run is entirely
whatever its caller supplies, with no figure in the specification to hold that caller to. Worth
attention when the request-entry task is cut; it does not stop this one.
REMAINDER, from the specification — every clause of rules/investigation/a-simulation-writes-no-investigation
(engine reuse over any case-version state, no investigation written, nothing collected enters a
cache, nothing collected or judged is read by a diagnosis) goes unanswered by this task; those are
guarantees of the already-built simulate pipeline, not of a factory's parameter shape.
Decision, beyond the covers — stand: rules/investigation/a-simulation-writes-no-investigation is
not claimed in implements; this task changes no write, cache or read guarantee of the simulate
pipeline, only how its deadline input arrives.
REMAINDER, from the specification — both clauses of
rules/investigation/an-answer-arrives-within-the-declared-deadline (the diagnosis's own
twenty-second total and its margin below the caller's timeout) reach no criterion; the rule
quantifies over a diagnosis and constrains domain/investigation/investigation, which this
simulate-hypothesis change does not touch.
Decision, beyond the covers — stand: rules/investigation/an-answer-arrives-within-the-declared-deadline
is not claimed in implements; this task touches no diagnosis or its declared total, only
simulate-hypothesis's own factory.
Decision, beyond the covers — stand: domain/investigation/investigation is not claimed in
implements; this task touches no investigation record, only simulate-hypothesis's own factory.
