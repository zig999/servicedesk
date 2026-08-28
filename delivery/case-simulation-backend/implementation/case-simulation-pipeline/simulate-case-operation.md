---
title: POST /v1/simulate -- simulate-case controller, route, DTO and production composition
summary: A new simulate-case.dto.ts/controller/route pair reads the pinned case (either state) through
  ICaseQuery, applies diagnose's own subject-glossary and at-least-one-attribute rules, calls the already-delivered
  no-cache composition through a new production-simulate.factory.ts, and returns evidence/evaluations/resolved/assessment/cost/durations
  unchanged, wired into build-app.ts/build-app.factory.ts/diagnose-server.factory.ts's existing registration
  convention.
task: sha256:d6cfe01bcbf6cf6b1e07051e930e0c48a31bd08a79a9d267ec05b8aac07b5b3f
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/case-simulation-pipeline-simulate-case-operation-build-4
files:
- path: src/http/dto/simulate-case.dto.ts
  effect: New file. Exports simulateCaseRequestSchema/SimulateCaseRequestDto (case, subject, requester
    -- no narrative, no ticket_ref) and simulateCaseResponseSchema/SimulateCaseResponseDto, following
    diagnose.dto.ts's own convention exactly. The response schema mirrors every value object the shared
    record carries -- evidence, evaluations (discriminated on verdict, with citations, usage, elapsed_ms
    and prompt), the resolved outcome, the assessment, cost and durations -- deliberately excluding InvestigationPipelineResult's
    own separate prompts field, which neither the contract nor this task's own criteria name.
- path: src/http/simulate-case.controller.ts
  effect: New file. Exports SimulateCaseControllerDependencies (caseQuery, glossary, runSimulate) and
    handleSimulateCaseRequest, which reads the pinned case through ICaseQuery regardless of its declared
    state, builds the subject through subject.ts's own buildSubject (rules/investigation/a-subject-carries-at-least-one-attribute),
    checks it against the glossary through investigation-factory.ts's own refuseAttributesNotInGlossary
    (rules/investigation/a-subject-attribute-is-drawn-from-the-glossary), then calls runSimulate and answers
    its evidence/evaluations/resolved/assessment/cost/durations unchanged.
- path: src/http/simulate-case.routes.ts
  effect: New file. Exports createSimulateCaseRoutesPlugin, registering POST /v1/simulate under the same
    /v1 prefix diagnose.routes.ts uses, validating the raw body against simulateCaseRequestSchema (400
    VALIDATION_ERROR on failure) before handing it to handleSimulateCaseRequest and answering 200 with
    its result.
- path: src/factories/production-simulate.factory.ts
  effect: New file. Exports ProductionSimulationDependencies, ProductionSimulationCall and createProductionSimulationRunner,
    which wires simulate.factory.ts's own createSimulationRunner with the real, Anthropic-backed AnthropicHypothesisEvaluator
    and AnthropicAssessmentConsolidator, stamps (now, deadline) per call the same way production-diagnose.factory.ts
    does for diagnose, and never imports or calls runDiagnosis, createDiagnoseRunner or createProductionDiagnoseRunner.
- path: src/investigation/investigation-factory.ts
  effect: refuseAttributesNotInGlossary is now exported (previously module-private), with a doc-comment
    addition explaining why; its own body, its call site inside buildInvestigation, and every other export
    are byte-for-byte unchanged. This is the one reuse point simulate-case.controller.ts calls to apply
    rules/investigation/a-subject-attribute-is-drawn-from-the-glossary without duplicating its logic,
    since simulate.factory.ts's own createSimulationRunner never reaches buildInvestigation at all.
- path: src/http/build-app.ts
  effect: BuildAppDependencies gained a new required field, simulateCase, and the route now also registers
    through createSimulateCaseRoutesPlugin(dependencies.simulateCase), following the file's own stated
    one-list, one-loop registration convention (ARC-02) rather than a standalone call site. Adding this
    twenty-seventh entry pushed routePlugins() one line past the standard's MNT-01 max-lines-per-function
    bound (30), caught by the standard's own lint step; fixed by lifting the flat factory list out of
    routePlugins() into a module-level constant, routePluginFactories (one arrow function per route,
    same order, each still calling the same createXRoutesPlugin against the same dependencies.x field
    as before), so routePlugins() itself is now a three-line `routePluginFactories.map(...)` call. Every
    one of the prior twenty-six registrations, and simulateCase's own, calls the identical factory against
    the identical dependency field, in the identical order; nothing registered, or the order things are
    registered in, changed.
- path: src/factories/build-app.factory.ts
  effect: BuildAppDependenciesInputs gained a new required field, simulateCase (SimulateCaseControllerDependencies),
    which buildAppDependencies() now destructures and spreads into its returned BuildAppDependencies alongside
    diagnose. composeResources() and every other route's own dependency assembly are untouched.
- path: src/factories/diagnose-server.factory.ts
  effect: createDiagnoseHttpServer now also builds a glossary query (glossary.factory.ts's own createGlossaryQuery)
    and a production simulation runner (createProductionSimulationRunner), assembles SimulateCaseControllerDependencies
    from the same caseQuery diagnose already built plus that glossary and runner, and passes it into buildAppDependencies()
    alongside diagnose -- so POST /v1/simulate is reachable from createDiagnoseHttpServer(env) for a real
    process. A new helper, simulationRunnerDependencies(), assembles ProductionSimulationDependencies
    from the same env fields runnerDependencies() already reads, keeping createDiagnoseHttpServer's own
    body within MNT-01's line bound. Every existing line of diagnose's own wiring is unchanged.
criteria:
- criterion: A simulate-case call over a case version in draft state returns the complete record — evidence,
    evaluations, resolved outcome, assessment, cost and durations.
  met: true
  how: handleSimulateCaseRequest never reads or branches on pinnedCase.state -- unlike diagnose.controller.ts's
    own release-state gate -- so a draft version is read through ICaseQuery and passed straight into runSimulate
    exactly as a released one would be; the controller returns evidence/evaluations/resolved/assessment/cost/durations
    off createSimulationRunner's own InvestigationPipelineResult unchanged.
- criterion: A simulate-case call over a case version in released state likewise returns the complete
    record.
  met: true
  how: Same code path as the draft case above -- no state check exists anywhere in this delivery, so a
    released version is handled identically.
- criterion: No investigation is written and no investigation-completed event is emitted by a simulate-case
    call.
  met: true
  how: Neither the controller, the route nor production-simulate.factory.ts ever imports or calls runDiagnosis,
    createDiagnoseRunner, createProductionDiagnoseRunner or buildInvestigation; production-simulate.factory.ts
    calls only simulate.factory.ts's own createSimulationRunner, which itself calls only runInvestigationPipeline
    (already delivered, already proven to write nothing and know nothing about writing).
- criterion: A subject with no attribute-values is refused, applying the same rule diagnose applies.
  met: true
  how: simulateCaseRequestSchema's own subjectSchema requires attributes.min(1), refusing an empty set
    with 400 before the controller is ever reached -- the same DTO-level enforcement diagnoseRequestSchema
    already keeps. The controller additionally calls subject.ts's own buildSubject before calling runSimulate,
    the same defense-in-depth call diagnose's own buildInvestigation already makes, so SubjectCarriesNoAttributeError
    is still reachable even were the DTO ever bypassed.
- criterion: A subject attribute-value naming an attribute outside the glossary is refused, applying the
    same rule diagnose applies.
  met: true
  how: handleSimulateCaseRequest calls investigation-factory.ts's own refuseAttributesNotInGlossary (exported
    by this task for this reuse) against the built subject and the given IGlossaryQuery before ever calling
    runSimulate -- the identical function diagnose's own buildInvestigation already calls, raising the
    identical SubjectAttributeNotInGlossaryError, applying the same rule diagnose applies, only earlier
    in this composition since simulate never reaches buildInvestigation at all.
- criterion: An unknown case slug or version is refused, reusing case-query's own errors.
  met: true
  how: handleSimulateCaseRequest calls dependencies.caseQuery.readCase(body.case.slug, body.case.version)
    with no try/catch of its own, so CaseNotFoundError and CaseNotValidError propagate unchanged -- the
    same errors diagnose.controller.ts's own identical call already relies on, no new error class introduced.
- criterion: The response carries no narrative field and no ticket reference field.
  met: true
  how: Neither field appears anywhere in simulateCaseResponseSchema/SimulateCaseResponseDto or in the
    object handleSimulateCaseRequest returns (evidence, evaluations, resolved, assessment, cost, durations)
    -- none of the six ever carried either field, and the request schema itself accepts neither.
- criterion: The route is registered following the routePlugins()/BuildAppDependencies/buildAppDependencies()
    convention and is reachable through diagnose-server.factory.ts's composition for a real process.
  met: true
  how: createSimulateCaseRoutesPlugin(dependencies.simulateCase) is one more entry in build-app.ts's own
    routePluginFactories list, which routePlugins() maps over unchanged; simulateCase is one more field
    of BuildAppDependencies and of build-app.factory.ts's
    own BuildAppDependenciesInputs, spread into buildAppDependencies()'s answer exactly as diagnose already
    is; and createDiagnoseHttpServer builds the real SimulateCaseControllerDependencies (a real ICaseQuery,
    a real IGlossaryQuery, and createProductionSimulationRunner's real, Anthropic-backed runner) and hands
    it into buildAppDependencies() before returning buildApp()'s instance -- the same composition path
    diagnose already proves reachable for a real process.
nodes:
- node: contracts/investigation/case-simulation
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/simulate-case.controller.ts
  - src/http/simulate-case.routes.ts
  - src/factories/production-simulate.factory.ts
  how: 'This is the simulate-case operation''s own published HTTP surface: it reads the case through the
    same engine diagnose runs (createSimulationRunner, calling the identical runInvestigationPipeline),
    accepts a case version in either state, answers the whole record back (evidence, evaluations, resolved
    outcome, assessment, cost, durations), and carries no narrative or ticket reference anywhere in its
    request or response. simulate-hypothesis, the contract''s other operation, is not built here -- see
    deferred below.'
- node: rules/investigation/a-simulation-writes-no-investigation
  how: 'Honored, not separately encoded here: enforced structurally by the already-delivered no-cache-simulation-composition
    (simulate.factory.ts), which this task''s controller and production-simulate.factory.ts call into
    and never bypass -- neither file imports or calls runDiagnosis, createDiagnoseRunner, createProductionDiagnoseRunner
    or buildInvestigation.'
- node: scenarios/investigation/a-draft-case-version-is-simulated
  encoded_at:
  - src/http/simulate-case.controller.ts
  how: handleSimulateCaseRequest reads the pinned case and calls runSimulate with no state check at all,
    so a draft-state case version is collected, judged, resolved and drafted exactly as a released one,
    and the response carries every evaluation, every evidence item, the cost and the durations -- no investigation
    written.
- node: scenarios/investigation/a-simulation-never-enters-the-cache
  how: 'Honored, not separately encoded here: enforced by simulate.factory.ts''s own already-delivered
    construction (a freshly built, cache-free HttpDeclarativeObservationSource with no externally-supplied
    IObservationSource parameter). production-simulate.factory.ts, this task''s own new file, supplies
    only the connection and the Anthropic evaluator/consolidator to that factory -- never an observation
    source of its own -- so nothing this task adds could reopen a path into a cache.'
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/simulate-case.controller.ts
  how: 'Enforced twice, mirroring diagnose''s own defense in depth: subjectSchema''s own attributes.min(1)
    refuses an empty set at the DTO boundary (400) before the controller is ever reached, and the controller''s
    own call to subject.ts''s unchanged buildSubject re-enforces the same invariant immediately before
    calling runSimulate.'
- node: rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  encoded_at:
  - src/http/simulate-case.controller.ts
  - src/investigation/investigation-factory.ts
  how: The controller calls investigation-factory.ts's own refuseAttributesNotInGlossary (exported by
    this task, body unchanged) against the built subject and the given IGlossaryQuery, ahead of the call
    to runSimulate -- the identical function and identical typed error (SubjectAttributeNotInGlossaryError)
    diagnose's own buildInvestigation already raises for this rule.
- node: domain/investigation/citation
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  how: citationSchema mirrors Citation's own two fields (concept, field) exactly, for every evaluation's
    own citations in the response.
- node: domain/investigation/verdict
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  how: evaluationSchema discriminates on the verdict field's three literal values, the same closed set
    verdict.ts declares.
- node: domain/investigation/evidence-result
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  how: evidenceSchema's result field is z.enum(EVIDENCE_RESULTS), the same closed vocabulary evidence-result.ts
    declares, reused rather than redeclared.
- node: domain/investigation/evaluation-reason
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  how: evaluationSchema's inconclusive branch carries reason as z.enum(EVALUATION_REASONS), the same closed
    set evaluation-reason.ts declares, reused rather than redeclared.
- node: domain/investigation/subject
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/simulate-case.controller.ts
  how: subjectSchema mirrors Subject's own shape (type, attributes) for the request body; the controller
    assembles the actual value through subject.ts's own unchanged buildSubject before validating and simulating.
- node: domain/investigation/subject-attribute-value
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  how: subjectAttributeValueSchema mirrors SubjectAttributeValue's own two fields (attribute, value) exactly.
- node: domain/investigation/assessment
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  how: 'Honored only in part, deliberately, the same gap extract-shared-investigation-pipeline''s own
    delivery record already disclosed and left open: assessmentSchema mirrors Assessment''s own actually-delivered
    shape (outcome, referral, determining_hypothesis, text) exactly. This node''s own schema separately
    requires register, usage, elapsed_ms and prompt as well, which Assessment itself still does not carry
    (draft-assessment-text.spec.ts''s own already-delivered guarantee, untouched by this task); none of
    this task''s own criteria ask for Assessment''s shape to widen, only for the shared record''s own
    assessment field to travel through unchanged, which it does. See this record''s own inferences below.'
- node: domain/investigation/evidence
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  how: evidenceSchema mirrors Evidence's own eleven fields exactly; the controller forwards the composition's
    own evidence array unchanged.
- node: domain/investigation/evaluation
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  how: evaluationSchema mirrors Evaluation's own discriminated shape -- confirmed and refuted each citing
    at least one citation, inconclusive carrying a reason and possibly-empty citations, usage/elapsed_ms/prompt
    optional on every branch, present exactly where a judgment call happened.
- node: domain/investigation/usage
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  how: usageSchema mirrors Usage's own two fields (input_tokens, output_tokens) exactly, used for each
    evaluation's own optional usage.
- node: domain/investigation/cost
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  how: costSchema mirrors Cost's own three fields exactly; the controller forwards the composition's own
    cost unchanged.
- node: domain/investigation/durations
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  how: durationsSchema mirrors Durations' own four fields exactly; the controller forwards the composition's
    own durations unchanged.
- node: domain/knowledge/case-version
  how: 'Honored, not separately encoded here: the controller reads the pinned Case (case.ts, untouched)
    through ICaseQuery and passes it straight into the simulation call; this task adds no new fact to
    Case''s own shape and never rebuilds or revalidates it beyond what ICaseQuery already does.'
- node: domain/knowledge/case-version-state
  encoded_at:
  - src/http/simulate-case.controller.ts
  how: 'Honored by omission: unlike diagnose.controller.ts, handleSimulateCaseRequest reads pinnedCase.state
    through nothing at all -- it never branches on it -- so a simulation runs over a case version in either
    declared state, draft or released, exactly as contracts/investigation/case-simulation and scenarios/investigation/a-draft-case-version-is-simulated
    require.'
- node: domain/knowledge/hypothesis-revision
  how: 'Honored, not separately encoded here: reached only indirectly through the pinned Case''s own manifest,
    which this task never reads or rebuilds itself -- the already-delivered simulation composition is
    what reads hypothesis-revisions off the case to collect and judge.'
- node: domain/knowledge/manifest-entry
  how: Honored, not separately encoded here, for the same reason as domain/knowledge/hypothesis-revision
    above -- this task never reads or rebuilds the case's manifest itself.
- node: domain/knowledge/resolution
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  how: resolvedOutcomeSchema mirrors Resolution/ResolvedOutcome's own outcome-and-referral pair (plus
    the optional determining hypothesis) for the response's resolved field.
- node: domain/knowledge/referral
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  how: referralSchema mirrors Referral's own two fields (action, recipient) exactly, reused for both resolved.referral
    and assessment.referral.
inferences:
- inferred: Both subject refusals (at-least-one-attribute, glossary membership) run in the controller
    ahead of the call to runSimulate, rather than after the pipeline the way diagnose's own buildInvestigation
    checks them.
  from: simulate.factory.ts's own createSimulationRunner calls only runInvestigationPipeline and never
    buildInvestigation, so there is no later stage of this composition left to apply either check the
    way diagnose's own composition does; running them first also spares a glossary-violating or attribute-empty
    request the cost of a whole collection/judgment/consolidation run that would otherwise be refused
    only after paying for it.
- inferred: investigation-factory.ts's own refuseAttributesNotInGlossary is exported rather than reimplemented
    for this controller's own use.
  from: MNT-03 ("a block of logic that already exists somewhere in this project is called, not copied")
    and the fact that this function's own body is already exactly the check rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
    states; widening its visibility changes nothing about buildInvestigation's own existing callers or
    behavior.
- inferred: The response DTO carries exactly six fields (evidence, evaluations, resolved, assessment,
    cost, durations) and omits InvestigationPipelineResult's own separate prompts field.
  from: contracts/investigation/case-simulation's own "returns the whole record back" is itself enumerated
    as exactly evidence, evaluation, the resolved outcome, the assessment, cost and durations, and this
    task's own first criterion repeats the identical six-field list; neither names prompts, which extract-shared-investigation-pipeline's
    own delivery record discloses as an internal accommodation for domain/investigation/assessment's own
    not-yet-carried prompt fact, not a published simulate-case field.
- inferred: Assessment's own shape in the response stays exactly outcome, referral, determining_hypothesis
    and text -- register, usage, elapsed_ms and prompt are not added onto it here.
  from: draft-assessment-text.spec.ts's own already-delivered guarantee that Assessment carries none of
    the three call-record fields, unchanged since extract-shared-investigation-pipeline's own delivery
    record disclosed this exact gap as deliberately left open for a future task or a human decision; this
    task's own criteria ask only that the shared record's assessment field travel through unchanged, never
    that Assessment's own shape widen.
- inferred: A production simulation call stamps the same twenty-second total deadline budget (TOTAL_DEADLINE_BUDGET_MS
    = 20000) production-diagnose.factory.ts already stamps for diagnose.
  from: investigation-pipeline.ts's own identical per-stage nominal budgets (COLLECTION_STAGE_BUDGET_MS,
    JUDGMENT_STAGE_BUDGET_MS) already apply unchanged to a simulation run through the same runInvestigationPipeline,
    and no specification node names a distinct total for simulation -- reusing the one precedent already
    established for this identical pipeline rather than inventing an unrelated value.
- inferred: Neither subject refusal is gated behind pinnedCase.state -- both run identically whether the
    pinned case version is draft or released.
  from: contracts/investigation/case-simulation's own "open to a case version in either state" and scenarios/investigation/a-draft-case-version-is-simulated,
    neither of which names a state-dependent subject rule.
preserved:
- diagnose.controller.ts, diagnose.routes.ts, diagnose.dto.ts, run-diagnosis.ts, investigation-pipeline.ts
  and simulate.factory.ts -- none of these files was touched, and diagnose-server.factory.ts's own pre-existing
  diagnose wiring (connection, observationSource, caseQuery, runDiagnose, the diagnose object) is unchanged
  line for line.
- investigation-factory.ts's own buildInvestigation body, its call site of refuseAttributesNotInGlossary,
  and every other export -- unchanged; only refuseAttributesNotInGlossary's own visibility widened, proven
  by investigation-factory.spec.ts and investigation-factory-modules.spec.ts continuing to exercise the
  same behavior.
- run-diagnosis.spec.ts's own export-totality assertion over run-diagnosis.ts -- unaffected, since run-diagnosis.ts
  was not touched by this delivery.
- store-wiring.spec.ts's own assertion that createDiagnoseHttpServer takes exactly one parameter, env,
  and builds its connection from env.DATABASE_URL alone with no DataDirectory field anywhere -- preserved,
  since the function's exported signature is unchanged and no such string was introduced.
- build-app.ts's and build-app.factory.ts's own prior twenty-six route registrations, fields and composition
  order -- every one is untouched; simulateCase is appended, never inserted between or replacing an existing
  entry.
- BuildAppDependencies and BuildAppDependenciesInputs each gained a new required field (simulateCase),
  so three already-delivered test files that build full literals of these types -- src/__tests__/unit/http/build-app.spec.ts's
  own stubBuildAppDependencies(), and the buildAppDependencies({...}) calls in src/__tests__/integration/http/diagnose-e2e.spec.ts
  and diagnose-persistence-deadline-e2e.spec.ts -- will need a companion simulateCase field or stub added
  by this same task's own test-authoring pass to keep type-checking, exactly the same companion update
  every prior route-adding task's own delivery already made at these identical call sites (visible in
  each file's own header comments). This implementation does not edit those test files itself.
deferred:
- what: simulate-hypothesis and its own HTTP surface (route, controller, DTO), narrowing the same engine
    to one named hypothesis revision with no resolved outcome.
  why: contracts/investigation/case-simulation's other operation; this task's own criteria and "What it
    is" name only simulate-case, and no-cache-simulation-composition's own delivery record already deferred
    simulate-hypothesis to its own separate task.
- what: Widening domain/investigation/assessment's own shape to carry register, usage, elapsed_ms and
    prompt.
  why: draft-assessment-text.spec.ts, already delivered and passing, asserts the answered Assessment carries
    none of the three call-record fields; extract-shared-investigation-pipeline's own delivery record
    already disclosed this same gap as deliberately left open for a future task or a human decision, and
    this task's own criteria do not reach Assessment's shape either.
- what: Updating build-app.spec.ts, diagnose-e2e.spec.ts and diagnose-persistence-deadline-e2e.spec.ts
    with a simulateCase stub so they keep type-checking against the now-wider BuildAppDependencies/BuildAppDependenciesInputs.
  why: these are test files, not source; this task-implementer delivery writes source only, and the corresponding
    update belongs to this same task's own test-authoring pass -- disclosed above under preserved so it
    is not read as an unnoticed regression.
---

## What it is

A simulation-shaped sibling of diagnose's own HTTP surface: a new DTO, controller and route that read the pinned case (in either declared state) through ICaseQuery, apply the same subject/glossary rules diagnose applies, and call the already-delivered no-cache composition through a new production wiring factory -- registered into the existing routePlugins()/BuildAppDependencies/buildAppDependencies() convention and reachable through diagnose-server.factory.ts for a real process.

## Notes

None.
