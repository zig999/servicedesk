---
title: simulate-hypothesis-deadline-input-hotfix, review
summary: What three passes found over the source and tests making the simulate-hypothesis runner take
  now/deadline from its caller; the captured suite run passed clean, so no failures pass ran.
reviewed:
- src/factories/production-simulate-hypothesis.factory.ts
- src/http/simulate-hypothesis.controller.ts
- src/__tests__/unit/factories/production-simulate-hypothesis.factory.spec.ts
- src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
tasks:
- task/simulate-hypothesis-deadline-input-hotfix/deadline-taken-from-caller-and-propagated
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run passed clean, so there was no failure to diagnose
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
coverage:
- criterion: createProductionHypothesisSimulationRunner's returned function accepts now and deadline as
    part of its call argument, the same way createSimulationRunner's returned function already does —
    neither is computed internally from Date.now() or a module constant.
  state: covered
  tests:
  - file: src/__tests__/unit/factories/production-simulate-hypothesis.factory.spec.ts
    name: passes the caller-given now and deadline through to runSimulateHypothesisPipeline unchanged,
      never computing either itself
  - file: src/__tests__/unit/factories/production-simulate-hypothesis.factory.spec.ts
    name: propagates whatever (now, deadline) pair each call supplies, never reusing the first call's
      own pair for a second call carrying different values
  - file: src/__tests__/unit/factories/production-simulate-hypothesis.factory.spec.ts
    name: ProductionHypothesisSimulationCall carries exactly subjectType, subjectAttributes, case, requester,
      hypothesis, now and deadline — no capabilities, glossary, observationSource, evaluator or poolSize
      field
  - file: src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
    name: computes now and a deadline the specification-declared twenty seconds later, immediately before
      calling runSimulateHypothesis, and includes both in the call it sends
  why: The type test claims more than this criterion states (an exact seven-field shape, where the criterion
    asks only that now and deadline be accepted); the clause 'the same way createSimulationRunner's returned
    function already does' is compared by nothing in the set. Both are noted for a reader routing this
    rather than as gaps.
- criterion: The TOTAL_DEADLINE_BUDGET_MS module constant no longer exists in production-simulate-hypothesis.factory.ts.
  state: covered
  tests:
  - file: src/__tests__/unit/factories/production-simulate-hypothesis.factory.spec.ts
    name: declares no TOTAL_DEADLINE_BUDGET_MS constant of its own, unlike production-simulate.factory.ts
      and production-diagnose.factory.ts
  why: The test reads the factory's own source text and asserts the identifier does not appear, which
    is the criterion's own terms.
- criterion: The now and deadline this runner is given reach runSimulateHypothesisPipeline unchanged,
    so each of the pipeline's own stages still receives the minimum of its nominal budget and the time
    remaining before that same propagated deadline — the deadline this task's runner accepts is never
    merely accepted and left unused.
  state: partial
  tests:
  - file: src/__tests__/unit/factories/production-simulate-hypothesis.factory.spec.ts
    name: passes the caller-given now and deadline through to runSimulateHypothesisPipeline unchanged,
      never computing either itself
  - file: src/__tests__/unit/factories/production-simulate-hypothesis.factory.spec.ts
    name: propagates whatever (now, deadline) pair each call supplies, never reusing the first call's
      own pair for a second call carrying different values
  why: 'The first half (not dropped) is exercised. The second half is not: runSimulateHypothesisPipeline
    is replaced by a hoisted mock that records its argument and resolves a fixed result, so nothing in
    this set observes a pipeline stage receiving any budget at all -- see this review''s own standard-conformance
    finding on the same mock.'
- criterion: Every other wiring production-simulate-hypothesis.factory.ts performs (capabilities, glossary,
    connector configurations, observation source, evaluator, poolSize) is unchanged.
  state: partial
  tests:
  - file: src/__tests__/unit/factories/production-simulate-hypothesis.factory.spec.ts
    name: passes the caller-given poolSize through to runSimulateHypothesisPipeline, unchanged
  - file: src/__tests__/unit/factories/production-simulate-hypothesis.factory.spec.ts
    name: always wires a real AnthropicHypothesisEvaluator, never a caller-substituted implementation
  - file: src/__tests__/unit/factories/production-simulate-hypothesis.factory.spec.ts
    name: constructs the Anthropic client once when the runner is created, never again on either of two
      later calls
  why: 'Two of the six named wirings (poolSize, evaluator) are exercised at the pipeline call. Capabilities,
    glossary and connector configurations are exercised by nothing -- the factory could pass a different
    registry, glossary or connector configurations and every test here would still pass. ''Unchanged''
    also has no baseline in this set: no test compares the wiring against what the factory built before
    the hotfix.'
findings:
- pass: conformance
  file: src/http/simulate-hypothesis.controller.ts
  where: line 9 (module constant) and lines 24-32 (the now/deadline computed for the call to runSimulateHypothesis)
  evidence: 'const TOTAL_DEADLINE_BUDGET_MS = 20_000; ... const now = Date.now(); ... deadline: now +
    TOTAL_DEADLINE_BUDGET_MS,'
  cost: The simulate-hypothesis endpoint's own total deadline is fixed at twenty seconds in this file,
    but the only node stating a twenty-second declared total (rules/investigation/an-answer-arrives-within-the-declared-deadline)
    states it of a diagnosis and constrains domain/investigation/investigation -- a record contracts/investigation/case-simulation.md
    says simulate-hypothesis explicitly never writes. A reader who wants to know what simulate-hypothesis's
    own deadline is has nowhere in the specification to look; the figure lives only in this file.
  correction: a node stating simulate-hypothesis's own total deadline (or one stating the figure holds
    across the whole investigation/simulation engine, not just diagnosis) would give this constant something
    to answer to.
- pass: conformance
  file: src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
  where: line 13 (EXPECTED_DEADLINE_BUDGET_MS) and the test at line 196
  evidence: const EXPECTED_DEADLINE_BUDGET_MS = 20_000; ... it('computes now and a deadline the specification-declared
    twenty seconds later, ...', ... expect(call?.deadline).toBe((call?.now ?? 0) + EXPECTED_DEADLINE_BUDGET_MS);
  cost: The test's own name asserts the twenty-second figure is 'the specification-declared' deadline
    for this operation, but no node declares a total deadline for simulate-hypothesis -- the twenty-seconds
    node that exists is stated of diagnosis, a different, investigation-writing operation. The suite now
    stands as authority for a fact the specification does not hold here.
  correction: the test's own name and the value it pins should not claim a specification declaration this
    operation's contract does not carry; either a node states simulate-hypothesis's own deadline and the
    test cites it correctly, or the test states plainly that the figure is this file's own constant.
- pass: standard
  file: src/__tests__/unit/factories/production-simulate-hypothesis.factory.spec.ts
  where: line 22, the module-level replacement of the simulation pipeline, with the stand-in hoisted at
    lines 10-21
  cites: TST-03
  evidence: 'vi.mock(''../../../investigation/simulate-hypothesis-pipeline.js'', () => ({ runSimulateHypothesisPipeline:
    runSimulateHypothesisPipelineMock })); ... const runSimulateHypothesisPipelineMock = vi.fn().mockImplementation((call)
    => { capturedPipelineCalls.push(call); return Promise.resolve({...}); });'
  cost: runSimulateHypothesisPipeline is this project's own simulation logic, not the store, the network,
    the filesystem or an external service. Because the whole module is replaced by a stand-in, the four
    claims these tests make about the deadline are claims about an argument captured from a stand-in,
    and they keep passing if the real pipeline stops accepting deadline, stops honoring it, or is deleted
    from the module entirely -- exactly the regression this change exists to prevent.
  correction: 'let the real runSimulateHypothesisPipeline run and stand in only at the boundaries it reaches
    (the Anthropic client, the DatabaseConnection this file already fakes, the HTTP observation source),
    so the deadline the factory passes is observed where it is used. Note: ARC-01 requires the collaborator
    be received rather than constructed, and a unit test of a pure wiring factory has little other way
    to observe delegation, so this rule and that one pull against each other here -- which gives is the
    standard''s owner''s to decide.'
- pass: standard
  file: src/http/simulate-hypothesis.controller.ts
  where: line 9, the budget constant, and line 24 and line 32 inside handleSimulateHypothesisRequest
  cites: ARC-04
  evidence: 'const TOTAL_DEADLINE_BUDGET_MS = 20_000; ... const now = Date.now(); ... now, deadline: now
    + TOTAL_DEADLINE_BUDGET_MS,'
  cost: How long a hypothesis simulation is allowed to take is a policy of the operation, and it is now
    decided in the HTTP handler. The runner the factory returns is callable by anything, and every caller
    that is not this handler reaches the pipeline with whatever deadline it invents, or with none.
  correction: have the controller map the request to a call and back only, and let the operation's own
    layer decide the budget and the clock for every caller alike.
- pass: standard
  file: src/http/simulate-hypothesis.controller.ts
  where: lines 21-23, the case pinning, subject construction and glossary refusal inside handleSimulateHypothesisRequest
  cites: ARC-04
  evidence: 'const { case: pinnedCase } = await dependencies.caseQuery.readCase(body.case.slug, body.case.version);
    const subject = buildSubject(body.subject.type, body.subject.attributes); await refuseAttributesNotInGlossary(subject,
    dependencies.glossary);'
  cost: The handler composes the operation rather than mapping to it. The factory-built runner reaches
    runSimulateHypothesisPipeline with no case pinning, no subject construction and no glossary refusal
    at all, so a caller that is not this handler runs a simulation over ungoverned attributes without
    anything refusing it.
  correction: move the composition into the service layer the pipeline already sits behind, and have the
    controller call it with the DTO's values and return what it answers.
- pass: standard
  file: src/http/simulate-hypothesis.controller.ts
  where: line 21, the case read, and line 29, the requester passed into the call
  cites: SEC-01
  evidence: 'const { case: pinnedCase } = await dependencies.caseQuery.readCase(body.case.slug, body.case.version);
    ... requester: body.requester,'
  cost: The handler reads a specific case, named by a slug and version the caller supplied, and checks
    nothing about whether this caller may read that case. The acting requester is also taken from the
    body, so whoever reaches the endpoint chooses both which case is simulated and the name the run is
    attributed to.
  correction: check in this handler, against the pinned case, that the acting principal may read it, before
    the pipeline is called, and take the requester from the verified credential rather than from the request
    body.
---

## What it is

The first review of simulate-hypothesis-deadline-input-hotfix: coverage over its four criteria,
specification conformance over the one node it implements, and standard conformance over the
project's own registry. The captured suite run passed clean, so the failures pass did not run.

## Notes

The specification-conformance pass confirms the gap the implementation's own record already
disclosed: no specification node states simulate-hypothesis's own total deadline, so the
twenty-second figure this task relocated from the factory to the controller answers to nothing in
the base -- and one test's own name claims it is "the specification-declared" figure when it is
not. The standard-conformance pass surfaced a security-relevant finding (SEC-01): the controller
reads a case by caller-supplied slug/version and takes the acting requester from the request body,
with no authorization check anywhere in this file set.
