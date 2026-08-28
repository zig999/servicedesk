---
title: No-cache simulation composition/factory
summary: A new simulate.factory.ts wires runInvestigationPipeline as a distinct, unconditional assembly
  whose own observation source is a freshly constructed HttpDeclarativeObservationSource, never a caller-supplied
  port that could be a caching decorator.
task: sha256:0a55533b5b40e0db08af97ac32323934a21e4e62dd1caa11677224be7a29a8fd
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/case-simulation-pipeline-no-cache-simulation-composition-build
files:
- path: src/factories/simulate.factory.ts
  effect: New file. Exports SimulationDependencies (connection, evaluator, consolidator, poolSize, defaultConsolidationRegister),
    SimulationCall (InvestigationPipelineOptions minus the fields this factory wires) and createSimulationRunner(),
    which builds capabilities and connectorConfigurations from the given connection, constructs one HttpDeclarativeObservationSource
    from them, and returns a closure that calls runInvestigationPipeline with those plus the caller-supplied
    evaluator/consolidator/poolSize/defaultConsolidationRegister, answering the whole InvestigationPipelineResult
    (evidence, evaluations, resolved, assessment, cost, durations, prompts). Never imports or calls runDiagnosis,
    createDiagnoseRunner or createProductionDiagnoseRunner.
criteria:
- criterion: A simulation composition/factory exists, parallel to production-diagnose.factory.ts, wiring
    the shared pipeline function and its adapters without any observation-cache layer.
  met: true
  how: simulate.factory.ts sits beside production-diagnose.factory.ts and diagnose.factory.ts in src/factories/,
    at the same composition-root layer, and its createSimulationRunner calls investigation-pipeline.ts's
    own runInvestigationPipeline with capabilities, an HttpDeclarativeObservationSource, and the given
    evaluator/consolidator/poolSize/defaultConsolidationRegister. No cache decorator or layer exists anywhere
    in this tree (confirmed against production's own real composition, diagnose-server.factory.ts, and
    this initiative's own inventory notes), and none is introduced here.
- criterion: The composition is a distinct assembly rather than a conditional inside the production composition
    — no branch chooses a cached path for simulation.
  met: true
  how: simulate.factory.ts is a wholly new file; production-diagnose.factory.ts and diagnose.factory.ts
    are untouched by this delivery. createSimulationRunner contains exactly one code path — no flag, no
    conditional, no configuration value that would ever select between a cached and an uncached observation
    source — the observation source it constructs is the only one it ever offers.
- criterion: The composition constructs each adapter once per call to the outer factory.
  met: true
  how: capabilities, connectorConfigurations and the HttpDeclarativeObservationSource instance are all
    constructed inside createSimulationRunner's own body — the outer factory call — and closed over by
    the returned closure; no adapter is constructed inside that closure, so a call to the returned function
    never reconstructs any of them, the same once-per-deployment discipline createDiagnoseRunner and createProductionDiagnoseRunner
    already keep for their own leaf dependencies.
- criterion: Nothing the composition collects is capable of entering a cache, whether or not a cache layer
    exists elsewhere in the tree.
  met: true
  how: createSimulationRunner accepts no externally-built IObservationSource at all — the one parameter
    that a caching decorator implementing the same published port could otherwise be substituted through
    does not exist on SimulationDependencies. The only observation source this factory ever produces is
    the concrete HttpDeclarativeObservationSource it constructs itself, from capabilities and connector-configuration
    reads that carry no caching semantics of their own. This holds regardless of whether a cache layer
    is later added to diagnose's own, separate observation-source composition (diagnose-server.factory.ts),
    since this file imports, constructs or falls back to nothing from that composition.
nodes:
- node: contracts/investigation/case-simulation
  encoded_at:
  - src/factories/simulate.factory.ts
  how: createSimulationRunner wires "the same engine a diagnosis runs" (collection, judgment, resolution,
    consolidation) through the identical runInvestigationPipeline diagnose's own composition calls, and
    its SimulationCall carries no narrative or ticket_ref field, matching this contract's own "neither
    operation carries a narrative or a ticket reference." The returned InvestigationPipelineResult is
    the whole record (evidence, evaluations, resolved, assessment, cost, durations, prompts) rather than
    only an Assessment, matching "returns the whole record back." This task builds only the shared composition
    simulate-case and simulate-hypothesis will call — the two operations' own HTTP surface (routes, controllers,
    the narrowing simulate-hypothesis applies) is not built here; see deferred below.
- node: rules/investigation/a-simulation-writes-no-investigation
  encoded_at:
  - src/factories/simulate.factory.ts
  how: createSimulationRunner calls runInvestigationPipeline directly and never buildInvestigation, writeWithinDeadline
    or runDiagnosis, so no investigation is ever written and no store is even reachable from this module
    (SimulationDependencies carries no store field). Its own observation-source construction is fixed
    internally to a concrete, cache-free adapter with no externally-supplied alternative, so nothing this
    composition collects can enter a cache — this rule's second half — by construction rather than by
    a runtime choice.
- node: scenarios/investigation/a-draft-case-version-is-simulated
  how: 'Honored, not separately encoded here: this scenario''s own "collects, judges, resolves, drafts,
    returns every evaluation/evidence/cost/durations, writes no investigation" is exactly what runInvestigationPipeline
    already does and this factory calls unchanged. Whether a draft (as opposed to a released) case version
    is accepted is decided at the case-read boundary — case-query.service.ts''s own readCase already runs
    full validation regardless of a version''s state and raises no state-based error today (this initiative''s
    own inventory notes) — which this task does not touch. The HTTP entry point that reads the case version
    and calls this factory belongs to the two simulate-*-operation tasks, deferred below.'
- node: scenarios/investigation/a-simulation-never-enters-the-cache
  encoded_at:
  - src/factories/simulate.factory.ts
  how: 'No cache exists in this tree today, so today nothing a simulation collects could be read back
    regardless of this delivery. What this factory adds is the structural guarantee going forward: it
    never accepts, imports or falls back to any externally-built IObservationSource, so a caching decorator
    introduced later for diagnose''s own, separate observation-source composition (diagnose-server.factory.ts)
    has no path into this file at all — this factory''s own instance is always its own freshly constructed
    HttpDeclarativeObservationSource, never a shared or substitutable one.'
inferences:
- inferred: The factory constructs its own HttpDeclarativeObservationSource internally (from a given DatabaseConnection)
    rather than accepting observationSource as a caller-supplied IObservationSource dependency the way
    createDiagnoseRunner accepts every adapter.
  from: Criterion 4's own "structurally impossible … regardless of whether a cache layer exists elsewhere
    in the tree" — a guarantee no type signature can express over a bare IObservationSource parameter,
    since a caching decorator would satisfy that identical published port and this module's own code could
    never tell the two apart; the only construction-level guarantee available within this task's own scope
    is to name the concrete, cache-free class directly and accept no substitute.
- inferred: evaluator, consolidator, poolSize and defaultConsolidationRegister remain caller-supplied,
    generic dependencies (SimulationDependencies), never fixed to a concrete provider inside this factory.
  from: The task's own "What it is" text and the inventory's must_not_duplicate entry for diagnose.factory.ts,
    both stating this factory should mirror createDiagnoseRunner's generic per-context wiring rather than
    production-diagnose.factory.ts's Anthropic-fixing shape; none of these three fields carries the cache-structural
    concern criterion 4 raises, so the generic convention is followed for them unchanged.
- inferred: The file is named simulate.factory.ts and its export createSimulationRunner, mirroring diagnose.factory.ts's
    own createDiagnoseRunner rather than a production-* name.
  from: The task's own explicit instruction to mirror createDiagnoseRunner's generic shape for this factory's
    own design, rather than production-diagnose.factory.ts's shape, for which simulate.factory.ts/createDiagnoseRunner's
    own naming pair is the established sibling.
- inferred: SimulationCall carries no narrative, ticket_ref, id, prompt_version, model, glossary or store
    field, and createSimulationRunner's own closure answers the whole InvestigationPipelineResult rather
    than only an Assessment.
  from: contracts/investigation/case-simulation's own explicit "returns the whole record back" and "neither
    operation carries a narrative or a ticket reference," together with investigation-pipeline.ts's own
    InvestigationPipelineOptions/InvestigationPipelineResult shapes, which already omit those persistence-only
    fields entirely.
divergences:
- from: the inventory's own must_not_duplicate entry (seen at src/factories/diagnose.factory.ts) stating
    the no-cache simulation factory should mirror createDiagnoseRunner's generic per-context wiring pattern
    -- adapters as caller-supplied dependencies -- for its own observation-source composition, rather
    than production-diagnose.factory.ts's Anthropic-fixing shape
  departure: 'src/factories/simulate.factory.ts does not accept observationSource as a caller-supplied
    dependency: it constructs its own HttpDeclarativeObservationSource internally from a given DatabaseConnection,
    and offers no parameter through which any other IObservationSource implementation — cached or not
    — could be substituted.'
  why: Criterion 4 requires that nothing this composition collects be capable of entering a cache "whether
    or not a cache layer exists elsewhere in the tree" — a guarantee no type signature can express over
    a bare IObservationSource parameter, since a caching decorator would satisfy that same published port
    and this module's own code could never tell the two apart. Fixing the concrete, cache-free adapter
    internally is the one construction-level guarantee available within this task's own scope; evaluator,
    consolidator, poolSize and defaultConsolidationRegister remain caller-supplied exactly as the inventory's
    convention describes, since none of them carries this same structural risk.
preserved:
- diagnose.factory.ts's and production-diagnose.factory.ts's own composition, construction-once discipline
  and exported surfaces (DiagnoseDependencies/DiagnoseCall/createDiagnoseRunner, ProductionDiagnoseDependencies/ProductionDiagnoseCall/createProductionDiagnoseRunner)
  — untouched; this delivery adds a new, separate file rather than editing either.
- investigation-pipeline.ts's own runInvestigationPipeline, InvestigationPipelineOptions and InvestigationPipelineResult
  — untouched; this factory only calls the function and derives its own Omit type from the options shape.
- run-diagnosis.ts's own runDiagnosis, RunDiagnosisOptions, and its write-then-respond behavior — untouched
  and never imported here.
deferred:
- what: The simulate-case and simulate-hypothesis HTTP surface (routes, controllers, DTOs) that would
    call createSimulationRunner, and simulate-hypothesis's own narrowing to one named hypothesis revision
    with no resolved outcome.
  why: this task's own four criteria ask only that the composition/factory exist, be distinct, construct
    once per call, and be structurally cache-free — not that a second caller be built; the predecessor
    task's own delivery record already named these as belonging to the two simulate-*-operation tasks.
- what: A real, production composition root (parallel to diagnose-server.factory.ts) that builds an actual
    DatabaseConnection and concrete evaluator/consolidator adapters and calls createSimulationRunner for
    a running process.
  why: out of this task's own scope, which is the composition/factory alone; wiring it for a real process
    is the concern of whichever task builds the simulate HTTP surface.
- what: Any case-version-state gating (draft vs released) a simulate operation might need before calling
    this factory.
  why: case-query.service.ts's own readCase already performs no state-based check regardless of version
    state (this initiative's own inventory notes), and this task does not touch case-query.service.ts;
    the read and any gating belong to the HTTP-surface tasks that resolve the case before calling this
    composition.
---

## What it is

A simulation-shaped sibling of production-diagnose.factory.ts, mirroring createDiagnoseRunner's own generic per-context wiring rather than production-diagnose.factory.ts's Anthropic-fixing shape for its own observation-source composition.

## Notes

None.
