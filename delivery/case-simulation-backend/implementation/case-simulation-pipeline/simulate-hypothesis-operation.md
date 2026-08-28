---
title: POST /v1/simulate/hypothesis narrows the shared engine to one named hypothesis
summary: A new simulate-hypothesis DTO, route, controller, narrower pipeline and production
  factory restrict collection and judgment to one named hypothesis's own manifest entry and return
  exactly one evaluation with no outcome or assessment resolved.
task: sha256:5b070b2e8648ff6e1f77d4d8ed62528bea8fc6eaafa30168b5c234c5a0df6e03
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/case-simulation-pipeline-simulate-hypothesis-operation-build-2
files:
- path: src/errors/hypothesis-not-in-manifest.error.ts
  effect: New file. Exports HypothesisNotInManifestError, the name-message-context business error
    raised where a simulate-hypothesis request names a hypothesis the pinned case version's
    manifest holds no entry for, following HypothesisRevisionCollectsNoConceptError's and
    SubjectCarriesNoAttributeError's own established shape.
- path: src/errors/status-map.ts
  effect: Adds HypothesisNotInManifestError mapped to HTTP 404 in STATUS_BY_ERROR_CLASS, and
    updates the header comment's own decided-fact list and 404 grouping to cite this task and
    rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused, the same
    citation convention already kept for CapabilityIdentityNotFoundError and the other three
    specification-fixed statuses. Every prior entry and every other function is unchanged.
- path: src/case/case-resolution.ts
  effect: Adds manifestEntryNamed, a new exported function alongside byPrecedence, collectionPlan,
    requiresEvaluationOf and resolveOutcome, answering the named hypothesis's own current manifest
    entry or throwing the new HypothesisNotInManifestError where none matches. Adds the one import
    that error needs. Every existing function's own body is unchanged.
- path: src/investigation/investigation-pipeline.ts
  effect: Widens maxElapsedMs and JUDGMENT_STAGE_BUDGET_MS from module-private to exported, each
    with one added doc sentence explaining the reuse, so simulate-hypothesis-pipeline.ts can call
    the identical arithmetic and budget constant rather than restating either. No other export, no
    function body and no behavior changes.
- path: src/investigation/simulate-hypothesis-pipeline.ts
  effect: New file. Exports SimulateHypothesisPipelineOptions, SimulateHypothesisDurations,
    SimulateHypothesisPipelineResult and runSimulateHypothesisPipeline, which calls buildSubject,
    then case-resolution.ts's own manifestEntryNamed, then narrows the given case to a single-entry
    manifest and calls collectEvidence and judgeHypotheses against that narrowed case unchanged,
    answering exactly one evidence array, one Evaluation and a collection-and-judgment-only
    durations record. Never calls resolveAndNarrow, draftAssessment or
    investigation-pipeline.ts's own runInvestigationPipeline.
- path: src/factories/production-simulate-hypothesis.factory.ts
  effect: New file. Exports ProductionHypothesisSimulationDependencies,
    ProductionHypothesisSimulationCall and createProductionHypothesisSimulationRunner, which
    constructs capabilities, connector-configurations and one fresh, cache-free
    HttpDeclarativeObservationSource, plus the real, Anthropic-backed AnthropicHypothesisEvaluator,
    once per call to the outer factory, and returns a closure that stamps (now, deadline) and calls
    runSimulateHypothesisPipeline. Never imports or calls runDiagnosis, createDiagnoseRunner,
    createProductionDiagnoseRunner or createSimulationRunner.
- path: src/http/dto/simulate-hypothesis.dto.ts
  effect: New file. Exports simulateHypothesisRequestSchema and SimulateHypothesisRequestDto
    (case, subject, requester, hypothesis) and simulateHypothesisResponseSchema and
    SimulateHypothesisResponseDto (evidence, one evaluation, durations with no writing field),
    following simulate-case.dto.ts's own convention exactly, with its own locally duplicated
    citation, usage, evaluation, evidence and subject schemas.
- path: src/http/simulate-hypothesis.controller.ts
  effect: New file. Exports SimulateHypothesisControllerDependencies and
    handleSimulateHypothesisRequest, which reads the pinned case through ICaseQuery, builds the
    subject through subject.ts's own buildSubject, checks it against the glossary through
    investigation-factory.ts's own refuseAttributesNotInGlossary, then calls runSimulateHypothesis
    and answers its evidence, evaluation and durations unchanged.
- path: src/http/simulate-hypothesis.routes.ts
  effect: New file. Exports createSimulateHypothesisRoutesPlugin, registering POST
    /v1/simulate/hypothesis under the same /v1 prefix diagnose.routes.ts and simulate-case.routes.ts
    use, validating the raw body against simulateHypothesisRequestSchema before handing it to
    handleSimulateHypothesisRequest and answering 200 with its result.
- path: src/http/build-app.ts
  effect: BuildAppDependencies gains a new required field, simulateHypothesis, and one more entry,
    createSimulateHypothesisRoutesPlugin(dependencies.simulateHypothesis), is appended to
    routePluginFactories, following the file's own one-list, one-loop registration convention.
    Header-comment counts updated from twenty-seven to twenty-eight routes; every prior entry and
    routePlugins() itself unchanged.
- path: src/factories/build-app.factory.ts
  effect: BuildAppDependenciesInputs gains a new required field, simulateHypothesis
    (SimulateHypothesisControllerDependencies), which buildAppDependencies() now destructures and
    spreads into its returned BuildAppDependencies alongside diagnose and simulateCase. Every other
    helper function is untouched.
- path: src/factories/diagnose-server.factory.ts
  effect: createDiagnoseHttpServer now also builds a production hypothesis-simulation runner
    (createProductionHypothesisSimulationRunner) and a fresh glossary-query read, assembles
    SimulateHypothesisControllerDependencies from the same caseQuery diagnose and simulate-case
    already built plus those two, and passes it into buildAppDependencies() alongside diagnose and
    simulateCase, so POST /v1/simulate/hypothesis is reachable from createDiagnoseHttpServer(env)
    for a real process. A new helper, hypothesisSimulationRunnerDependencies(), assembles
    ProductionHypothesisSimulationDependencies from the same env fields
    simulationRunnerDependencies() already reads for simulate-case, keeping
    createDiagnoseHttpServer's own body within MNT-01's line bound. Every existing line of
    diagnose's and simulate-case's own wiring is unchanged.
criteria:
- criterion: A simulate-hypothesis call restricts collection to only the concepts the named
    hypothesis's own revision collects.
  met: true
  how: runSimulateHypothesisPipeline builds a narrowedCase whose own manifest holds exactly the
    named hypothesis's own manifest entry (case-resolution.ts's manifestEntryNamed), then calls
    evidence-collection-stage.ts's own collectEvidence unchanged against that narrowedCase —
    collectionPlan(narrowedCase) reads only that one entry's own hypothesis-revision's own collects,
    never the case-wide union runInvestigationPipeline passes.
- criterion: Exactly one evaluation returns, for the named hypothesis.
  met: true
  how: requiresEvaluationOf(narrowedCase) names exactly the one hypothesis in narrowedCase's own
    single-entry manifest, so judgment-stage.ts's own judgeHypotheses judges exactly that one
    hypothesis and answers exactly one Evaluation; onlyEvaluationOf() throws rather than silently
    accepting more or fewer, and simulateHypothesisResponseSchema's own evaluation field is a
    single object rather than an array, encoding exactly one evaluation at the type level.
- criterion: No resolved outcome and no assessment are returned.
  met: true
  how: runSimulateHypothesisPipeline never calls resolveAndNarrow or draftAssessment at all, unlike
    investigation-pipeline.ts's own runInvestigationPipeline; simulateHypothesisResponseSchema
    declares no resolved and no assessment field, and handleSimulateHypothesisRequest returns only
    evidence, evaluation and durations.
- criterion: A hypothesis name absent from the version's manifest is refused with an HTTP 404
    response reporting a HypothesisNotInManifestError.
  met: true
  how: case-resolution.ts's own manifestEntryNamed throws the new HypothesisNotInManifestError
    where no manifest entry matches the named hypothesis, before either stage ever runs;
    status-map.ts's STATUS_BY_ERROR_CLASS maps that class to 404, citing
    rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused in its own
    header comment, so error-handler.middleware.ts answers 404 for it exactly as it already does
    for the seven existing 404 entries.
- criterion: A subject with no attribute-values is refused, applying the same rule diagnose
    applies.
  met: true
  how: simulateHypothesisRequestSchema's own subjectSchema requires attributes.min(1), refusing an
    empty set with 400 before the controller is ever reached; handleSimulateHypothesisRequest
    additionally calls subject.ts's own buildSubject before calling runSimulateHypothesis, the same
    defense-in-depth call simulate-case.controller.ts already makes, so SubjectCarriesNoAttributeError
    stays reachable even were the DTO ever bypassed.
- criterion: A subject attribute-value naming an attribute outside the glossary is refused,
    applying the same rule diagnose applies.
  met: true
  how: handleSimulateHypothesisRequest calls investigation-factory.ts's own
    refuseAttributesNotInGlossary against the built subject and the given IGlossaryQuery before
    ever calling runSimulateHypothesis — the identical function diagnose's own buildInvestigation
    and simulate-case's own controller already call, raising the identical
    SubjectAttributeNotInGlossaryError, only earlier in this composition since
    simulate-hypothesis-pipeline.ts never reaches buildInvestigation either.
- criterion: No investigation is written and nothing collected enters a cache.
  met: true
  how: Neither the controller, the route, simulate-hypothesis-pipeline.ts nor
    production-simulate-hypothesis.factory.ts ever imports or calls runDiagnosis,
    createDiagnoseRunner, createProductionDiagnoseRunner, buildInvestigation or
    writeWithinDeadline; production-simulate-hypothesis.factory.ts constructs its own fresh
    HttpDeclarativeObservationSource from capabilities and connector-configuration reads and
    accepts no externally-supplied IObservationSource at all, the same structural cache-freedom
    simulate.factory.ts already established for the full pipeline, so nothing this run collects is
    capable of entering a cache.
- criterion: "The response's durations carry collection and judgment; writing is absent, since
    this operation never reaches consolidation."
  met: true
  how: runSimulateHypothesisPipeline's own durationsOf computes collection as the largest of every
    collected concept's own Evidence.elapsed_ms and judgment as the one evaluation's own elapsed_ms
    (0 where no call happened, for example a no-data degradation) — both reusing
    investigation-pipeline.ts's own exported maxElapsedMs rather than restating it;
    SimulateHypothesisDurations and simulateHypothesisResponseSchema's own durationsSchema declare
    exactly collection, judgment and total, with no writing field at all, since this operation
    never makes the one consolidation call that would populate it.
- criterion: "The route is registered following the routePlugins()/BuildAppDependencies/buildAppDependencies() convention and is reachable through diagnose-server.factory.ts's composition for a real process."
  met: true
  how: createSimulateHypothesisRoutesPlugin(dependencies.simulateHypothesis) is one more entry in
    build-app.ts's own routePluginFactories list, which routePlugins() maps over unchanged;
    simulateHypothesis is one more field of BuildAppDependencies and of build-app.factory.ts's own
    BuildAppDependenciesInputs, spread into buildAppDependencies()'s answer exactly as simulateCase
    already is; and createDiagnoseHttpServer builds the real SimulateHypothesisControllerDependencies
    (the same caseQuery instance diagnose and simulate-case already built, a fresh
    createGlossaryQuery read, and createProductionHypothesisSimulationRunner's real,
    Anthropic-backed runner) and hands it into buildAppDependencies() before returning buildApp()'s
    instance — the same composition path diagnose and simulate-case already prove reachable for a
    real process.
nodes:
- node: contracts/investigation/case-simulation
  encoded_at:
  - src/http/dto/simulate-hypothesis.dto.ts
  - src/http/simulate-hypothesis.controller.ts
  - src/http/simulate-hypothesis.routes.ts
  - src/factories/production-simulate-hypothesis.factory.ts
  - src/investigation/simulate-hypothesis-pipeline.ts
  how: This is the contract's own second operation, simulate-hypothesis — it narrows the same
    engine's own collection and judgment stages to what one named hypothesis revision collects and
    judges, alone, and resolves no outcome, since one hypothesis does not resolve a case. The
    response carries evidence, one evaluation and durations, never a narrative or a ticket
    reference, matching the contract's own text that neither operation carries a narrative or a
    ticket reference.
- node: rules/investigation/a-simulation-writes-no-investigation
  encoded_at:
  - src/investigation/simulate-hypothesis-pipeline.ts
  - src/factories/production-simulate-hypothesis.factory.ts
  how: runSimulateHypothesisPipeline calls only buildSubject, collectEvidence and judgeHypotheses
    — never buildInvestigation, writeWithinDeadline or runDiagnosis — and
    production-simulate-hypothesis.factory.ts constructs its own observation source internally,
    accepting no externally-supplied IObservationSource, so nothing this run collects can enter a
    cache.
- node: rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused
  encoded_at:
  - src/case/case-resolution.ts
  - src/errors/hypothesis-not-in-manifest.error.ts
  - src/errors/status-map.ts
  how: manifestEntryNamed raises the new HypothesisNotInManifestError where the named hypothesis is
    not in the pinned case version's manifest, and status-map.ts maps that class to HTTP 404,
    citing this node in its own header comment as the fact deciding the status.
- node: scenarios/investigation/a-simulation-never-enters-the-cache
  encoded_at:
  - src/factories/production-simulate-hypothesis.factory.ts
  how: production-simulate-hypothesis.factory.ts builds its own fresh
    HttpDeclarativeObservationSource from capabilities and connector-configuration reads inside
    createProductionHypothesisSimulationRunner, and never accepts, imports or falls back to any
    externally-built IObservationSource — the same structural guarantee simulate.factory.ts
    already established for the full pipeline, so a caching decorator introduced later for
    diagnose's own composition has no path into this file.
- node: scenarios/investigation/a-single-hypothesis-is-simulated
  encoded_at:
  - src/investigation/simulate-hypothesis-pipeline.ts
  - src/case/case-resolution.ts
  how: Given a case version whose manifest holds more than one hypothesis, narrowing options.case
    to a single-entry narrowedCase before calling collectEvidence and judgeHypotheses means only
    that hypothesis-revision's own collects are observed and exactly one Evaluation returns, with
    no resolved outcome and no assessment ever computed — the precedence and totality machinery
    (collectionPlan, requiresEvaluationOf, resolveOutcome) that normally runs over the whole
    manifest never sees more than the one entry.
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  encoded_at:
  - src/http/dto/simulate-hypothesis.dto.ts
  - src/http/simulate-hypothesis.controller.ts
  how: Enforced twice, mirroring simulate-case's own defense in depth — subjectSchema's own
    attributes.min(1) refuses an empty set at the DTO boundary before the controller is reached,
    and the controller's own call to subject.ts's unchanged buildSubject re-enforces the same
    invariant immediately before calling runSimulateHypothesis.
- node: rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  encoded_at:
  - src/http/simulate-hypothesis.controller.ts
  how: The controller calls investigation-factory.ts's own refuseAttributesNotInGlossary (already
    exported for this reuse) against the built subject and the given IGlossaryQuery, ahead of the
    call to runSimulateHypothesis — the identical function and identical typed error diagnose's
    own buildInvestigation and simulate-case's own controller already raise for this rule.
- node: domain/investigation/citation
  encoded_at:
  - src/http/dto/simulate-hypothesis.dto.ts
  how: citationSchema mirrors Citation's own two fields (concept, field) exactly, for the one
    evaluation's own citations in the response — duplicated locally the same way
    simulate-case.dto.ts's own citationSchema already is.
- node: domain/investigation/verdict
  encoded_at:
  - src/http/dto/simulate-hypothesis.dto.ts
  how: evaluationSchema discriminates on the verdict field's three literal values, the same closed
    set verdict.ts declares.
- node: domain/investigation/evidence-result
  encoded_at:
  - src/http/dto/simulate-hypothesis.dto.ts
  how: evidenceSchema's result field is z.enum(EVIDENCE_RESULTS), the same closed vocabulary
    evidence-result.ts declares, reused rather than redeclared.
- node: domain/investigation/evaluation-reason
  encoded_at:
  - src/http/dto/simulate-hypothesis.dto.ts
  how: evaluationSchema's inconclusive branch carries reason as z.enum(EVALUATION_REASONS), the
    same closed set evaluation-reason.ts declares, reused rather than redeclared.
- node: domain/investigation/subject
  encoded_at:
  - src/http/dto/simulate-hypothesis.dto.ts
  - src/http/simulate-hypothesis.controller.ts
  - src/investigation/simulate-hypothesis-pipeline.ts
  how: subjectSchema mirrors Subject's own shape (type, attributes) for the request body; the
    controller and runSimulateHypothesisPipeline each assemble the actual value through
    subject.ts's own unchanged buildSubject before validating and simulating.
- node: domain/investigation/subject-attribute-value
  encoded_at:
  - src/http/dto/simulate-hypothesis.dto.ts
  how: subjectAttributeValueSchema mirrors SubjectAttributeValue's own two fields (attribute,
    value) exactly.
- node: domain/investigation/assessment
  how: Honored by omission — simulateHypothesisResponseSchema declares no assessment field at
    all, and handleSimulateHypothesisRequest never calls draftAssessment; this task's own criteria
    and contracts/investigation/case-simulation's own text both state simulate-hypothesis resolves
    no outcome, so this node's own shape is never reached by this operation at all, unlike
    simulate-case's own partial-gap treatment.
- node: domain/investigation/evidence
  encoded_at:
  - src/http/dto/simulate-hypothesis.dto.ts
  how: evidenceSchema mirrors Evidence's own eleven fields exactly; the controller forwards the
    pipeline's own evidence array unchanged.
- node: domain/investigation/evaluation
  encoded_at:
  - src/http/dto/simulate-hypothesis.dto.ts
  - src/investigation/simulate-hypothesis-pipeline.ts
  how: evaluationSchema mirrors Evaluation's own discriminated shape exactly — confirmed and
    refuted each citing at least one citation, inconclusive carrying a reason and possibly-empty
    citations, usage/elapsed_ms/prompt optional on every branch — and
    simulate-hypothesis-pipeline.ts's own onlyEvaluationOf answers exactly one such value per
    call, never an array.
- node: domain/investigation/usage
  encoded_at:
  - src/http/dto/simulate-hypothesis.dto.ts
  how: usageSchema mirrors Usage's own two fields (input_tokens, output_tokens) exactly, used for
    the one evaluation's own optional usage.
- node: domain/investigation/durations
  encoded_at:
  - src/investigation/simulate-hypothesis-pipeline.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  how: SimulateHypothesisDurations and durationsSchema each carry exactly collection, judgment and
    total — never a writing field at all, honoring the node's own now-optional writing attribute
    (present exactly when a consolidation call happened) by declaring no slot for it, since this
    operation never makes that call.
- node: domain/knowledge/case-version
  encoded_at:
  - src/http/simulate-hypothesis.controller.ts
  how: The controller reads the pinned Case (case.ts, untouched) through ICaseQuery and passes it
    straight into runSimulateHypothesis; this task adds no new fact to Case's own shape and never
    rebuilds or revalidates it beyond what ICaseQuery already does.
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/case/case-resolution.ts
  - src/investigation/simulate-hypothesis-pipeline.ts
  how: manifestEntryNamed answers the named hypothesis's own current manifest entry, whose
    hypothesis_revision (its own collects and criterion) is exactly what narrowedCase's
    single-entry manifest carries forward into collectEvidence and judgeHypotheses.
- node: domain/knowledge/manifest-entry
  encoded_at:
  - src/case/case-resolution.ts
  how: manifestEntryNamed reads theCase.manifest directly (the canonical source, never
    theCase.hypotheses) and answers one ManifestEntry — position plus hypothesis_revision —
    refusing where none matches the named hypothesis.
inferences:
- inferred: The response DTO's evaluation field is a singular object rather than an array.
  from: Criterion 2's own exactly one evaluation returns, together with
    scenarios/investigation/a-single-hypothesis-is-simulated's own exactly one evaluation returns,
    encoding the guarantee at the type level rather than leaving it a runtime-only fact.
- inferred: The durations schema and type carry no writing field at all, rather than an
    always-absent optional writing property.
  from: domain/investigation/durations' own now-optional writing attribute, present exactly when a
    consolidation call happened, together with this task's own settled Notes entry, and this
    operation never making that call at all.
- inferred: The narrowing to one hypothesis is achieved by handing collectEvidence and
    judgeHypotheses a Case whose manifest holds exactly the one named entry, rather than by
    inventing a concept-list or hypothesis-list parameter on either stage's own options type.
  from: Neither CollectEvidenceOptions nor JudgeHypothesesOptions declaring such a parameter, and
    case-resolution.ts's own collectionPlan and requiresEvaluationOf both reading theCase.manifest
    directly, so narrowing the manifest narrows both computations without touching either stage's
    own body, per MNT-03.
- inferred: manifestEntryNamed is placed in case-resolution.ts alongside byPrecedence,
    collectionPlan, requiresEvaluationOf and resolveOutcome, rather than inside the new pipeline
    module.
  from: case-resolution.ts already being the one module that owns every one of the case-version's
    own manifest-reading operations, and this lookup being exactly one more of them.
- inferred: maxElapsedMs and JUDGMENT_STAGE_BUDGET_MS are widened from module-private to exported
    in investigation-pipeline.ts, rather than restated in the new module.
  from: MNT-03 (a block of logic that already exists somewhere in this project is called, not
    copied), the same reasoning simulate-case-operation's own delivery already applied to widen
    refuseAttributesNotInGlossary's visibility, confirmed against no export-totality test scanning
    investigation-pipeline.ts's own exports.
- inferred: production-simulate-hypothesis.factory.ts collapses the generic composition and the
    production wiring into one file, rather than building a separate no-cache
    hypothesis-simulation composition/factory parallel to simulate.factory.ts.
  from: The task's own instructions naming exactly one new factory file for this wiring, and no
    depended-upon task having built a generic hypothesis-narrowing composition the way
    no-cache-simulation-composition built simulate.factory.ts for the full pipeline.
- inferred: A production simulate-hypothesis call stamps the same twenty-second total deadline
    budget (TOTAL_DEADLINE_BUDGET_MS = 20000) production-simulate.factory.ts already stamps for
    simulate-case.
  from: investigation-pipeline.ts's own identical per-stage nominal budgets
    (COLLECTION_STAGE_BUDGET_MS, JUDGMENT_STAGE_BUDGET_MS) already applying unchanged to this
    narrower run through the same stage functions, and no specification node naming a distinct
    total for a narrower simulation.
- inferred: hypothesisSimulationRunnerDependencies reads exactly the same env fields
    simulationRunnerDependencies already reads for simulate-case (POOL_SIZE, EVALUATOR_MODEL,
    EVALUATOR_MAX_TOKENS), minus the consolidator's own model and token-ceiling fields.
  from: This initiative's own established convention that no new Env field was needed for the
    sibling simulate-case-operation, and this operation needing a strict subset of that same
    construction-time configuration.
preserved:
- investigation-pipeline.ts's own runInvestigationPipeline, InvestigationPipelineOptions and
  InvestigationPipelineResult, and every other function's own body — unchanged; only maxElapsedMs
  and JUDGMENT_STAGE_BUDGET_MS gained an export keyword and one added doc sentence each, with no
  change to their own logic or value.
- case-resolution.ts's own byPrecedence, collectionPlan, requiresEvaluationOf and resolveOutcome —
  bodies untouched; only one new function, manifestEntryNamed, and one new import were added.
- simulate-case.dto.ts, simulate-case.controller.ts, simulate-case.routes.ts,
  production-simulate.factory.ts and simulate.factory.ts — none of these files was touched by this
  delivery.
- build-app.ts's prior twenty-seven registrations, fields and composition order — every one is
  untouched; simulateHypothesis is appended after simulateCase, never inserted between or
  replacing an existing entry.
- build-app.factory.ts's readDependencies, listDependencies, lifecycleDependencies,
  registrationDependencies, testConnectorDependencies and composeResources — untouched; only
  BuildAppDependenciesInputs and buildAppDependencies() gained the one new simulateHypothesis
  field.
- diagnose-server.factory.ts's existing diagnose and simulateCase wiring lines — unchanged line
  for line; only new lines were added for simulateHypothesis and one new helper function was
  appended after simulationRunnerDependencies.
- status-map.ts's twenty-one pre-existing entries and error-handler.middleware.ts's own
  fallback-to-500 behavior for an unmapped class — unchanged.
- BuildAppDependencies and BuildAppDependenciesInputs each gained a new required field,
  simulateHypothesis, so the same three already-delivered test files that build full literals of
  these types — build-app.spec.ts's own stubBuildAppDependencies(), and the
  buildAppDependencies() calls in diagnose-e2e.spec.ts and diagnose-persistence-deadline-e2e.spec.ts
  — will need a companion simulateHypothesis field or stub added by this same task's own
  test-authoring pass, the same companion update every prior route-adding task's own delivery
  already made at these identical call sites. This implementation does not edit those test files
  itself.
deferred:
- what: Building a separate, generic no-cache hypothesis-simulation composition/factory parallel
    to simulate.factory.ts, distinct from the production wiring.
  why: no depended-upon task built one the way no-cache-simulation-composition built
    simulate.factory.ts for the full pipeline, and this task's own instructions name exactly one
    new factory file, production-simulate-hypothesis.factory.ts, which already collapses both
    concerns into the one file the task names, so a second, unused generic layer would be code with
    no caller.
- what: Widening domain/investigation/assessment's own schema, or Assessment's own shape, to carry
    register, usage, elapsed_ms and prompt.
  why: extract-shared-investigation-pipeline's own delivery record already disclosed this gap as
    deliberately left open for a future task or a human decision, and this task's own criteria
    never reach Assessment's shape at all, since this operation never calls draftAssessment in the
    first place.
- what: Updating build-app.spec.ts, diagnose-e2e.spec.ts and
    diagnose-persistence-deadline-e2e.spec.ts with a simulateHypothesis stub so they keep
    type-checking against the now-wider BuildAppDependencies and BuildAppDependenciesInputs.
  why: these are test files, not source; this task-implementer delivery writes source only, and
    the corresponding update belongs to this same task's own test-authoring pass, disclosed above
    under preserved so it is not read as an unnoticed regression.
---

## What it is

simulate-hypothesis.dto.ts, the /v1/simulate/hypothesis route, a controller and a new,
narrower pipeline module that call collectEvidence restricted to the named revision's own
collects plus judgeHypotheses over that one required hypothesis, with no resolveAndNarrow or
draftAssessment call, wired for a real process through a new production-simulate-hypothesis.factory.ts.

## Notes

The eighth criterion's durations shape was BLOCKING through two earlier rounds of this task's own
binding, and was resolved via /analyse before this delivery began: domain/investigation/durations
now declares writing optional, present exactly when a consolidation call happened, mirroring
domain/investigation/evaluation's own conditional per-call attributes — already reflected in this
delivery's own durations shape, which carries no writing field at all.

The REMAINDER entry already recorded against this task (rules/investigation/the-response-follows-the-record
belongs to the diagnose entry point, which this task does not touch) is unchanged and required no
further action here.
