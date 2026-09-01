---
title: production-simulate-hypothesis.factory.ts's runner takes now/deadline from its caller
summary: production-simulate-hypothesis.factory.ts's returned runner now accepts now and deadline from
  its caller instead of computing them from a removed TOTAL_DEADLINE_BUDGET_MS constant, and the sole
  caller (simulate-hypothesis.controller.ts) now supplies the same twenty-second budget it used to invent
  inside the factory, so the pipeline's own stage bounding is unchanged.
task: sha256:ab30f6926399818c3fd0476c698ccf5cacfbda2392bab2b4d78d85b12fb21da8
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/simulate-hypothesis-deadline-input-hotfix-deadline-taken-from-caller-and-propagated-build-2
files:
- path: src/factories/production-simulate-hypothesis.factory.ts
  effect: createProductionHypothesisSimulationRunner's returned function now takes now and deadline as
    part of its call argument (ProductionHypothesisSimulationCall no longer omits them from SimulateHypothesisPipelineOptions)
    and forwards them unchanged into runSimulateHypothesisPipeline via the existing spread, instead of
    computing them itself from Date.now() and a module constant; the TOTAL_DEADLINE_BUDGET_MS constant
    no longer exists in this file, and every other wiring it performs (capabilities, glossary, connector
    configurations, observation source, evaluator, poolSize) is untouched.
- path: src/http/simulate-hypothesis.controller.ts
  effect: handleSimulateHypothesisRequest now computes now (Date.now()) and a deadline twenty seconds
    out, via a local TOTAL_DEADLINE_BUDGET_MS constant, immediately before calling dependencies.runSimulateHypothesis,
    and includes both in the call object it sends -- supplying the values the factory's runner no longer
    invents on its own. Every other field the call sends, the dependencies' shape, and the response envelope
    returned are unchanged.
criteria:
- criterion: createProductionHypothesisSimulationRunner's returned function accepts now and deadline as
    part of its call argument, the same way createSimulationRunner's returned function already does —
    neither is computed internally from Date.now() or a module constant.
  met: true
  how: ProductionHypothesisSimulationCall's Omit no longer excludes 'now' | 'deadline', so both are required
    fields of the call object the returned function receives; the function body no longer calls Date.now()
    or references any local constant, and passes ...call straight through to runSimulateHypothesisPipeline
    -- exactly the shape createSimulationRunner's returned function already has in simulate.factory.ts.
- criterion: The TOTAL_DEADLINE_BUDGET_MS module constant no longer exists in production-simulate-hypothesis.factory.ts.
  met: true
  how: The constant declaration was deleted from the file along with the computation that used it; no
    other declaration of that name remains in this file.
- criterion: The now and deadline this runner is given reach runSimulateHypothesisPipeline unchanged,
    so each of the pipeline's own stages still receives the minimum of its nominal budget and the time
    remaining before that same propagated deadline — the deadline this task's runner accepts is never
    merely accepted and left unused.
  met: true
  how: 'The returned function''s only change is where now/deadline originate; they still reach runSimulateHypothesisPipeline
    through the same ...call spread as every other call field. simulate-hypothesis-pipeline.ts itself
    is untouched by this task: it still passes options.now/options.deadline into collectEvidence unchanged,
    and still bounds judgeHypotheses by Math.min(options.deadline, judgmentBeginsAtMs + JUDGMENT_STAGE_BUDGET_MS),
    so both stages are still bounded by the minimum of their nominal budget and the time remaining before
    the caller-given deadline.'
- criterion: Every other wiring production-simulate-hypothesis.factory.ts performs (capabilities, glossary,
    connector configurations, observation source, evaluator, poolSize) is unchanged.
  met: true
  how: createCapabilityQuery, createGlossaryQuery, createConnectorConfigurationRegistry, the HttpDeclarativeObservationSource
    construction, the AnthropicHypothesisEvaluator construction and dependencies.poolSize are all still
    built and passed exactly as before; only the now and deadline fields of the object passed to runSimulateHypothesisPipeline
    changed.
nodes:
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  how: 'This task honors the node''s second clause without changing it: simulate-hypothesis-pipeline.ts,
    untouched by this task, still hands collectEvidence the propagated now/deadline unchanged and still
    bounds judgeHypotheses by Math.min(deadline, judgmentBeginsAtMs + JUDGMENT_STAGE_BUDGET_MS) -- each
    stage still receives the minimum of its nominal budget and the time remaining before the propagated
    deadline. The node''s first clause -- one absolute deadline recorded at the request''s own entry point
    -- is not settled by this task: the deadline is still invented as a fixed twenty-second figure, only
    one layer higher than before (in simulate-hypothesis.controller.ts rather than inside the factory).
    The binder''s own UNDERDETERMINED note names this exact gap and places it outside this factory file''s
    scope, not settled by this task.'
inferences:
- inferred: simulate-hypothesis.controller.ts, the sole caller of createProductionHypothesisSimulationRunner's
    returned function, is where now/deadline are now computed and supplied, since the runner's call type
    now requires both and nothing in the task names a different caller or origin for them.
  from: the binder's own UNDERDETERMINED note, which states that 'a caller that itself invents the same
    constant one layer up would still satisfy every criterion here' -- naming this exact resolution as
    compatible with the task while leaving where the request's own entry-point deadline should be recorded
    unsettled and out of this task's scope.
- inferred: the relocated computation keeps the exact same figures and timing the removed code used --
    a twenty-second (20_000 ms) budget added to Date.now() taken immediately before the call -- rather
    than any different value.
  from: the criterion requiring the accepted deadline to still reach and bound the pipeline's stages "exactly
    as before," which fixes both the value and the timing to what the deleted code already computed; and
    the identical pattern already used by production-simulate.factory.ts and production-diagnose.factory.ts
    (a local TOTAL_DEADLINE_BUDGET_MS = 20_000 computed immediately before the runner is called).
divergences:
- cites: ARC-04
  file: src/http/simulate-hypothesis.controller.ts
  departure: The controller now computes now/deadline (Date.now() plus a fixed budget) directly, rather
    than a service computing it.
  why: No service layer exists for this flow -- the controller already reads the case and checks the glossary
    directly, with no intervening service -- and this task's criteria name only production-simulate-hypothesis.factory.ts;
    introducing a service layer, or a new production-wrapper factory mirroring production-simulate.factory.ts
    to hold this one relocated computation, would add a structural layer the binder's own notes place
    outside this task's scope (the request-entry point's deadline origin is explicitly left unsettled
    here).
preserved:
- production-simulate-hypothesis.factory.ts's wiring of capabilities, glossary, connector configurations,
  the observation source, the evaluator and poolSize.
- simulate-hypothesis-pipeline.ts's bounding of collectEvidence and judgeHypotheses by the minimum of
  each stage's nominal budget and the time remaining before the propagated deadline.
- The simulate-hypothesis endpoint's actual runtime deadline -- twenty seconds from the instant the request
  reaches the controller -- unchanged in value and in when it is taken.
- SimulateHypothesisControllerDependencies's shape and the response envelope handleSimulateHypothesisRequest
  returns.
deferred:
- what: Recording one absolute deadline at simulate-hypothesis's own request entry point (or accepting
    one the request itself carries), rather than a caller one layer up reinventing the same twenty-second
    figure this task's own controller edit still does.
  why: The binder's UNDERDETERMINED note places this outside production-simulate-hypothesis.factory.ts's
    scope and says it is not settled by this task; it is the gap the same note's ADVISORY entry says is
    worth attention when a request-entry task is cut.
- what: Declaring a total deadline for simulate-hypothesis in the specification, so any caller computing
    one has a figure to be held to.
  why: The binder's ADVISORY note records that no candidate specification node states one for simulate-hypothesis
    specifically; deciding that figure is not this corrective task's to make.
---

## What it is

The corrective fix making production-simulate-hypothesis.factory.ts take now/deadline from its
caller instead of inventing a twenty-second constant internally, with the accepted deadline still
reaching and bounding simulate-hypothesis-pipeline.ts's own stages exactly as before.

## Notes

None.
