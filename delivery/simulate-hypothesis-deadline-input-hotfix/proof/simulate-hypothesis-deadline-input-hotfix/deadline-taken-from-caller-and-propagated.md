---
implementation: sha256:8697718f8bd73e0a8629a716f87f7febd74c818367696237e90eeb893ca88b69
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/simulate-hypothesis-deadline-input-hotfix-deadline-taken-from-caller-and-propagated-suite
title: Proof for production-simulate-hypothesis.factory.ts's runner taking now/deadline from its caller
summary: Corrects the pre-existing production-simulate-hypothesis.factory.ts spec to the new caller-supplied-deadline
  behavior (unblocking typecheck) and adds tests proving the four criteria and the two recorded inferences,
  including the controller's own now/deadline computation.
tests:
- file: src/__tests__/unit/factories/production-simulate-hypothesis.factory.spec.ts
  name: passes the caller-given now and deadline through to runSimulateHypothesisPipeline unchanged, never
    computing either itself
  proves: createProductionHypothesisSimulationRunner's returned function accepts now and deadline as part
    of its call argument, the same way createSimulationRunner's returned function already does — neither
    is computed internally from Date.now() or a module constant.
  fails_when: the runner ignores or overrides the caller-given now/deadline -- e.g. computing them itself
    from Date.now() or a constant -- so the wired call's now/deadline stop equalling the caller's own
    5_000/45_000
- file: src/__tests__/unit/factories/production-simulate-hypothesis.factory.spec.ts
  name: propagates whatever (now, deadline) pair each call supplies, never reusing the first call's own
    pair for a second call carrying different values
  proves: The now and deadline this runner is given reach runSimulateHypothesisPipeline unchanged (and,
    jointly with the previous test, that neither value is computed or cached internally)
  fails_when: the second call's wired now/deadline do not match what was passed into that second call
    -- e.g. the runner reuses the first call's pair, or stamps its own value regardless of input
- file: src/__tests__/unit/factories/production-simulate-hypothesis.factory.spec.ts
  name: declares no TOTAL_DEADLINE_BUDGET_MS constant of its own, unlike production-simulate.factory.ts
    and production-diagnose.factory.ts
  proves: The TOTAL_DEADLINE_BUDGET_MS module constant no longer exists in production-simulate-hypothesis.factory.ts.
  fails_when: a declaration named TOTAL_DEADLINE_BUDGET_MS reappears anywhere in the module's source text
- file: src/__tests__/unit/factories/production-simulate-hypothesis.factory.spec.ts
  name: ProductionHypothesisSimulationCall carries exactly subjectType, subjectAttributes, case, requester,
    hypothesis, now and deadline — no capabilities, glossary, observationSource, evaluator or poolSize
    field
  proves: createProductionHypothesisSimulationRunner's returned function accepts now and deadline as part
    of its call argument (type-level restatement, corrected from the prior version which asserted the
    opposite -- that now/deadline were excluded)
  fails_when: ProductionHypothesisSimulationCall stops requiring now/deadline (reverts to omitting them),
    or gains/loses any other field of the listed shape
- file: src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
  name: computes now and a deadline the specification-declared twenty seconds later, immediately before
    calling runSimulateHypothesis, and includes both in the call it sends
  proves: the relocated computation keeps the exact same figures and timing the removed code used -- a
    twenty-second (20_000 ms) budget added to Date.now() taken immediately before the call (the implementation's
    second recorded inference), and, jointly with the type test above, that the runner's caller (the controller)
    is what now supplies the values the factory no longer invents (the implementation's first recorded
    inference)
  fails_when: the controller stops sending now/deadline in its call to runSimulateHypothesis, sends a
    now not taken close to the call instant, or sends a deadline that is not exactly now + 20_000
- file: src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
  name: passes the request's own subjectType, subjectAttributes, case, requester and hypothesis to runSimulateHypothesis,
    alongside the now and deadline it computes
  proves: adding now/deadline to the call the controller sends does not disturb the other fields of that
    same call -- subjectType, subjectAttributes, the pinned case, requester and hypothesis all still reach
    runSimulateHypothesis unchanged
  fails_when: any of subjectType, subjectAttributes, case, requester or hypothesis stops reaching runSimulateHypothesis,
    or reaches it altered, once now/deadline were added to the call object
not_applicable:
- edge_case: two concurrent invocations of the runner racing on a shared deadline
  why: now/deadline are ordinary parameters of each call, never module or closure state the runner mutates
    between calls -- nothing this task changed introduces or removes shared mutable state a race could
    corrupt, and the "fresh pair per call" test already shows two sequential calls stay independent
- edge_case: an absent or malformed now/deadline reaching the runner
  why: no criterion states a runtime validation for these fields; ProductionHypothesisSimulationCall's
    own type now requires both as numbers, and the sole caller (the controller) always supplies them computed
    from Date.now() -- there is no code path this task adds that receives them absent
- edge_case: a deadline at or before now (an already-expired or zero-width budget)
  why: no criterion of this task governs that ordering; it is simulate-hypothesis-pipeline.ts's own bounding
    behavior, untouched by this task and already exercised by simulate-hypothesis-pipeline.spec.ts's existing
    "measures judgment's own deadline..." test over a tight deadline
- edge_case: runSimulateHypothesisPipeline or runSimulateHypothesis rejecting or answering slowly
  why: already covered by the pre-existing, untouched "propagates a rejection from the wired pipeline
    call" test (factory) and "propagates a HypothesisNotInManifestError raised by runSimulateHypothesis"
    test (controller); this task changed neither rejection path
untested:
- 'constraints/the-deadline-is-an-absolute-propagated-instant''s first clause -- one absolute deadline
  recorded at the request''s own entry point -- stays unproven here: the controller still invents a fixed
  twenty-second figure one layer up rather than recording or accepting one absolute deadline at simulate-hypothesis''s
  own request entry. The implementation record''s own nodes entry and the task''s UNDERDETERMINED note
  both place this outside this factory-and-controller task''s scope, so no test in this proof settles
  it.'
---

## What it is

The proof for production-simulate-hypothesis.factory.ts's runner taking now/deadline from its
caller: the factory no longer invents its own deadline, and its sole caller
(simulate-hypothesis.controller.ts) now supplies the same twenty-second budget.

## Notes

The pre-existing production-simulate-hypothesis.factory.spec.ts asserted the old behavior (now/deadline
excluded from the call type) and was corrected to the new caller-supplied-deadline shape -- the change
that unblocked npm run typecheck.
