---
implementation: sha256:d5abc982389fc0b10e6b8d9eb08b7d77e23860ec9bc03ae7d6b9c3858d6a088b
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/case-simulation-pipeline-no-cache-simulation-composition-suite-3
title: Proof for no-cache simulation composition/factory
summary: Fourteen tests over simulate.factory.ts, mocking runInvestigationPipeline and the three adapters
  it composes (capability query, connector-configuration registry, HttpDeclarativeObservationSource) as
  the boundaries this factory wires without owning -- proving the wiring, the construct-once discipline,
  the absence of any observation-source parameter (at the type level, since nothing at runtime could tell
  a caching decorator apart from the real adapter), and the absence of any import into the production
  composition's own modules.
tests:
- file: src/__tests__/unit/factories/simulate.factory.spec.ts
  name: builds capabilities and the connector-configuration registry from the given connection, and constructs
    its own observation source from exactly those two
  proves: 'A simulation composition/factory exists, wiring the shared pipeline function and its adapters.
    (the observation-source construction half: HttpDeclarativeObservationSource is built from exactly
    the capabilities and connector-configuration registry this factory itself constructed)'
  fails_when: createSimulationRunner builds HttpDeclarativeObservationSource from anything other than
    the capabilities and connector-configuration registry it just constructed from the given connection,
    or skips constructing either of them
- file: src/__tests__/unit/factories/simulate.factory.spec.ts
  name: wires runInvestigationPipeline with the freshly constructed capabilities and observation source,
    and the caller-given evaluator, consolidator, poolSize and defaultConsolidationRegister, unchanged
  proves: 'A simulation composition/factory exists, wiring the shared pipeline function and its adapters
    without any observation-cache layer. (the pipeline-wiring half: every one of the six wired dependencies
    is exactly the instance this factory holds, never a copy or a substitute)'
  fails_when: the object passed to runInvestigationPipeline carries a capabilities, observationSource,
    evaluator, consolidator, poolSize or defaultConsolidationRegister that is not the exact instance this
    factory constructed or received
- file: src/__tests__/unit/factories/simulate.factory.spec.ts
  name: passes the call's own subjectType, subjectAttributes, case, requester, now and deadline through
    to runInvestigationPipeline unchanged
  proves: the composition forwards every field of the caller's own SimulationCall to runInvestigationPipeline
    unchanged, so a simulate-*-operation task calling the returned runner reaches the shared engine with
    exactly what it supplied
  fails_when: any of subjectType, subjectAttributes, case, requester, now or deadline is dropped, copied
    or replaced on its way into the wired pipeline call
- file: src/__tests__/unit/factories/simulate.factory.spec.ts
  name: answers exactly what runInvestigationPipeline resolved with, the whole record unchanged
  proves: contracts/investigation/case-simulation's own "returns the whole record back" -- the runner
    answers the identical InvestigationPipelineResult runInvestigationPipeline resolved with, never a
    narrowed or reshaped copy
  fails_when: the runner's own resolved value is not reference-identical to what runInvestigationPipeline
    resolved with
- file: src/__tests__/unit/factories/simulate.factory.spec.ts
  name: imports nothing from diagnose.factory.ts, production-diagnose.factory.ts or run-diagnosis.ts,
    so no branch inside the production composition or its own write step is reachable from here
  proves: The composition is a distinct assembly rather than a conditional inside the production composition
    -- no branch chooses a cached path for simulation, because no path into the production composition's
    own modules exists at all from this file
  fails_when: simulate.factory.ts's own source text comes to import diagnose.factory.js, production-diagnose.factory.js
    or run-diagnosis.js by their exact compiled basename
- file: src/__tests__/unit/factories/simulate.factory.spec.ts
  name: constructs capabilities, the connector-configuration registry and its own observation source exactly
    once when the runner is created, before the returned runner is ever invoked
  proves: The composition constructs each adapter once per call to the outer factory. (construction happens
    at outer-factory-call time, never deferred to the first invocation of the returned runner)
  fails_when: any of the three adapters is constructed more than once, or is constructed only once the
    returned runner is first called rather than when createSimulationRunner itself is called
- file: src/__tests__/unit/factories/simulate.factory.spec.ts
  name: never reconstructs capabilities, the connector-configuration registry or its own observation source
    on either of two calls to the returned runner
  proves: The composition constructs each adapter once per call to the outer factory. (two calls to the
    same returned runner reconstruct nothing)
  fails_when: a second call to the returned runner causes createCapabilityQuery, createConnectorConfigurationRegistry
    or HttpDeclarativeObservationSource to be invoked again
- file: src/__tests__/unit/factories/simulate.factory.spec.ts
  name: passes the very same capabilities and observation-source instances into both of two calls to runInvestigationPipeline
  proves: the once-per-outer-call construction is actually reused across invocations, not merely uncounted
    -- both calls to runInvestigationPipeline receive reference-identical capabilities and observationSource
  fails_when: the second call's wired capabilities or observationSource is not reference-identical to
    the first call's
- file: src/__tests__/unit/factories/simulate.factory.spec.ts
  name: constructs a fresh capabilities instance for a second call to the outer factory, never reusing
    the first call's own instance
  proves: once-per-call to the outer factory means exactly that -- a second, independent call to createSimulationRunner
    gets its own fresh capabilities instance rather than a module-level singleton reused across unrelated
    callers
  fails_when: two separate calls to createSimulationRunner produce the same capabilities instance
- file: src/__tests__/unit/factories/simulate.factory.spec.ts
  name: SimulationDependencies carries exactly connection, evaluator, consolidator, poolSize and defaultConsolidationRegister
    -- no observation-source parameter of its own
  proves: Nothing the composition collects is capable of entering a cache -- SimulationDependencies' own
    exact shape carries no parameter through which any IObservationSource, cached or not, could be supplied
  fails_when: SimulationDependencies gains, loses or renames a field, including an observationSource field
    of any name
- file: src/__tests__/unit/factories/simulate.factory.spec.ts
  name: refuses a SimulationDependencies literal that also supplies an externally-built observation source
  proves: the structural guarantee holds at the one boundary a runtime test cannot reach -- the compiler
    itself refuses a dependency object naming an observationSource, so nothing could ever substitute a
    caching decorator implementing the same published IObservationSource port
  fails_when: SimulationDependencies widens to accept an observationSource field, silently admitting the
    excess property this test asserts TypeScript refuses
- file: src/__tests__/unit/factories/simulate.factory.spec.ts
  name: SimulationCall carries exactly subjectType, subjectAttributes, case, requester, now and deadline
    -- no narrative, ticket_ref, id, prompt_version, model, glossary or store field
  proves: the implementation's own recorded inference that SimulationCall carries no persistence-only
    field, matching contracts/investigation/case-simulation's own "neither operation carries a narrative
    or a ticket reference"
  fails_when: SimulationCall gains any of narrative, ticket_ref, id, prompt_version, model, glossary or
    store, or loses one of its six declared fields
- file: src/__tests__/unit/factories/simulate.factory.spec.ts
  name: refuses a SimulationCall literal that also supplies a narrative
  proves: the same inference at the boundary a runtime test cannot reach -- the compiler refuses a call
    object naming a narrative field
  fails_when: SimulationCall widens to accept a narrative field
- file: src/__tests__/unit/factories/simulate.factory.spec.ts
  name: propagates a rejection from runInvestigationPipeline to the runner's own caller, unchanged
  proves: a failure inside the shared pipeline is neither swallowed nor rewrapped by this composition
    -- the returned runner's own promise rejects with the identical error runInvestigationPipeline rejected
    with
  fails_when: the runner's own rejection is not reference-identical to the pipeline's rejection, e.g.
    because it is caught, logged, wrapped or replaced with a generic error
not_applicable:
- edge_case: a cache layer actually reading back what this composition collected
  why: no cache exists anywhere in this tree today (confirmed against production's own real composition,
    diagnose-server.factory.ts, and this initiative's own inventory notes), so there is nothing for a
    runtime test to observe reading back a collected value; criterion 4's guarantee is that no such layer
    could ever be wired through this factory's own dependencies, which the type-level tests above prove
    instead
- edge_case: createSimulationRunner given a poolSize of zero or a negative deadline
  why: no criterion of this task states a validation guarantee over poolSize or deadline -- both are passed
    through to runInvestigationPipeline unchanged, and that pipeline's own validation (proved by investigation-pipeline.spec.ts,
    a separately delivered task) is what governs their acceptable range
- edge_case: two concurrent calls to the same returned runner
  why: no criterion of this task states a concurrency guarantee for the composition itself -- runInvestigationPipeline's
    own concurrency behavior is proved separately by its own spec, unaffected by how many times this factory's
    runner happens to be called
untested:
- Whether HttpDeclarativeObservationSource, once constructed with real capabilities and connector configurations
  (rather than the mocked stand-ins this file uses), actually observes a concept correctly over HTTP --
  that adapter's own behavior is proved by its own spec, unaffected by this task, which proves only that
  this factory constructs and wires it, never its internal correctness.
- Whether a real production composition root (parallel to diagnose-server.factory.ts) that builds an actual
  DatabaseConnection and concrete evaluator/consolidator adapters and calls createSimulationRunner for
  a running process exists or behaves correctly -- out of this task's own declared scope (its own implementation
  record's deferred section), left to whichever task builds the simulate HTTP surface.
---

## What it is

Fourteen tests over simulate.factory.ts proving the composition's wiring, its construct-once-per-outer-call discipline, and criterion 4's structural cache-freedom guarantee at the one boundary only the type checker can falsify (expectTypeOf plus a `@ts-expect-error` literal, following pagination.spec.ts's own established convention for this exact kind of fact) -- since no cache exists anywhere in this tree today for a runtime test to observe reading anything back.

## Notes

None.
