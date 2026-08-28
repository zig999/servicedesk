---
title: Review of case-simulation-backend
summary: 'What four passes found over all ten tasks of case-simulation-backend, delivered end to end:
  the shared investigation pipeline extraction, the no-cache simulation composition, the two simulate-case/simulate-hypothesis
  HTTP operations, the draft-diagnose release gate, and the four investigation-telemetry tasks widening
  the judgment/consolidation ports and reporting real usage, elapsed time and cost.'
reviewed:
- src/investigation/investigation-pipeline.ts
- src/investigation/run-diagnosis.ts
- src/factories/simulate.factory.ts
- src/http/dto/simulate-case.dto.ts
- src/http/simulate-case.controller.ts
- src/http/simulate-case.routes.ts
- src/factories/production-simulate.factory.ts
- src/investigation/investigation-factory.ts
- src/http/build-app.ts
- src/factories/build-app.factory.ts
- src/factories/diagnose-server.factory.ts
- src/errors/hypothesis-not-in-manifest.error.ts
- src/errors/status-map.ts
- src/case/case-resolution.ts
- src/investigation/simulate-hypothesis-pipeline.ts
- src/factories/production-simulate-hypothesis.factory.ts
- src/http/dto/simulate-hypothesis.dto.ts
- src/http/simulate-hypothesis.controller.ts
- src/http/simulate-hypothesis.routes.ts
- src/errors/case-version-not-released.error.ts
- src/http/diagnose.controller.ts
- src/investigation/anthropic-hypothesis-evaluator.adapter.ts
- src/investigation/anthropic-assessment-consolidator.adapter.ts
- src/factories/diagnose.factory.ts
- src/investigation/evidence.ts
- src/investigation/evidence-collection-stage.ts
- migrations/0011-investigation-evidence-elapsed-ms.sql
- src/persistence/relational-investigation-store.repository.ts
- src/investigation/fake-hypothesis-evaluator.adapter.ts
- src/investigation/fake-assessment-consolidator.adapter.ts
- src/investigation/usage.ts
- src/investigation/evaluation.ts
- src/investigation/hypothesis-evaluator.port.ts
- src/investigation/assessment-consolidator.port.ts
- src/investigation/judgment-stage.ts
- src/investigation/draft-assessment-text.ts
- src/__tests__/unit/investigation/investigation-pipeline.spec.ts
- src/__tests__/unit/factories/simulate.factory.spec.ts
- src/__tests__/unit/http/simulate-case.controller.spec.ts
- src/__tests__/unit/factories/production-simulate.factory.spec.ts
- src/__tests__/unit/http/build-app.spec.ts
- src/__tests__/integration/factories/simulate-case-server.factory.spec.ts
- src/__tests__/unit/errors/status-map.spec.ts
- src/__tests__/unit/investigation/simulate-hypothesis-pipeline.spec.ts
- src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
- src/__tests__/unit/factories/production-simulate-hypothesis.factory.spec.ts
- src/__tests__/integration/factories/simulate-hypothesis-server.factory.spec.ts
- src/__tests__/unit/http/diagnose.controller.spec.ts
- src/__tests__/unit/http/diagnose.routes.spec.ts
- src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
- src/__tests__/integration/factories/diagnose-server.factory.spec.ts
- src/__tests__/unit/investigation/run-diagnosis.spec.ts
- src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
- src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
- src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
- src/__tests__/integration/http/diagnose-e2e.spec.ts
- src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
- src/__tests__/unit/investigation/judgment-stage.spec.ts
- src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
- src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
- src/__tests__/unit/investigation/draft-assessment-text.spec.ts
- src/__tests__/unit/factories/production-diagnose.factory.spec.ts
- src/__tests__/integration/factories/production-diagnose.factory.spec.ts
- src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
- src/__tests__/unit/investigation/citation-validation.spec.ts
- src/__tests__/unit/investigation/investigation-factory.spec.ts
- src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
- src/__tests__/integration/persistence/schema-migrations.spec.ts
tasks:
- task/case-simulation-pipeline/extract-shared-investigation-pipeline
- task/case-simulation-pipeline/no-cache-simulation-composition
- task/case-simulation-pipeline/simulate-case-operation
- task/case-simulation-pipeline/simulate-hypothesis-operation
- task/diagnose-release-gate/refuse-diagnosis-of-a-draft-case-version
- task/investigation-telemetry/anthropic-adapters-report-real-usage-and-timing
- task/investigation-telemetry/diagnose-reports-real-cost-and-durations
- task/investigation-telemetry/evidence-collection-measures-elapsed-ms
- task/investigation-telemetry/fake-adapters-return-zeroed-usage-and-timing
- task/investigation-telemetry/widen-judgment-and-consolidation-ports
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/case-simulation-backend
failures_counted: 1
coverage:
- criterion: A shared function exists that runs buildSubject → collectEvidence → judgeHypotheses → resolveAndNarrow
    → draftAssessment and returns evidence, evaluations, resolved, assessment, cost, durations and prompts
    as one record.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/investigation-pipeline.spec.ts
    name: answers one record carrying evidence, evaluations, resolved, assessment, cost, durations and
      prompts together, for one confirmed hypothesis
  - file: src/__tests__/unit/investigation/investigation-pipeline.spec.ts
    name: runs buildSubject before collecting any evidence or judging any hypothesis, refusing an empty
      subject attribute set without reaching either stage
- criterion: diagnose's own composition calls this shared function and then adds buildInvestigation and
    writeWithinDeadline.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/investigation-pipeline.spec.ts
    name: imports none of the five stage-owning modules into run-diagnosis.ts, since its only route to
      any of the five stages is through investigation-pipeline.ts
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: does not resolve until persistence has actually written the investigation, then resolves with
      the written investigation's own assessment
- criterion: No stage's own logic (collectEvidence, judgeHypotheses, resolveAndNarrow, draftAssessment,
    buildSubject) is duplicated between diagnose's composition and the shared function.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/investigation-pipeline.spec.ts
    name: imports none of the five stage-owning modules into run-diagnosis.ts, since its only route to
      any of the five stages is through investigation-pipeline.ts
- criterion: A diagnose request that succeeded before this extraction still returns the identical response
    after it.
  state: covered
  tests:
  - file: src/__tests__/integration/http/diagnose-e2e.spec.ts
    name: writes an investigation to the real, relational store for the request, readable back through
      RelationalInvestigationStore, before asserting anything about the HTTP response — and the response
      then carries the fixture case's own resolved fallback assessment
  - file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
    name: answers 200 with exactly the fixture case's own declared fallback outcome, referral and drafted
      text — no verdict, citation, evidence item or determining_hypothesis — for a request naming the
      seeded canonical subject
- criterion: The response to a diagnose request still leaves only after the investigation is written.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: does not resolve until persistence has actually written the investigation, then resolves with
      the written investigation's own assessment
- criterion: A simulation composition/factory exists, parallel to production-diagnose.factory.ts, wiring
    the shared pipeline function and its adapters without any observation-cache layer.
  state: covered
  tests:
  - file: src/__tests__/unit/factories/simulate.factory.spec.ts
    name: builds capabilities and the connector-configuration registry from the given connection, and
      constructs its own observation source from exactly those two
  - file: src/__tests__/unit/factories/simulate.factory.spec.ts
    name: wires runInvestigationPipeline with the freshly constructed capabilities and observation source,
      and the caller-given evaluator, consolidator, poolSize and defaultConsolidationRegister, unchanged
- criterion: The composition is a distinct assembly rather than a conditional inside the production composition
    — no branch chooses a cached path for simulation.
  state: covered
  tests:
  - file: src/__tests__/unit/factories/simulate.factory.spec.ts
    name: imports nothing from diagnose.factory.ts, production-diagnose.factory.ts or run-diagnosis.ts,
      so no branch inside the production composition or its own write step is reachable from here
- criterion: The composition constructs each adapter once per call to the outer factory.
  state: covered
  tests:
  - file: src/__tests__/unit/factories/simulate.factory.spec.ts
    name: constructs capabilities, the connector-configuration registry and its own observation source
      exactly once when the runner is created, before the returned runner is ever invoked
  - file: src/__tests__/unit/factories/simulate.factory.spec.ts
    name: never reconstructs capabilities, the connector-configuration registry or its own observation
      source on either of two calls to the returned runner
- criterion: Nothing the composition collects is capable of entering a cache, whether or not a cache layer
    exists elsewhere in the tree.
  state: covered
  tests:
  - file: src/__tests__/unit/factories/simulate.factory.spec.ts
    name: SimulationDependencies carries exactly connection, evaluator, consolidator, poolSize and defaultConsolidationRegister
      — no observation-source parameter of its own
  - file: src/__tests__/unit/factories/simulate.factory.spec.ts
    name: refuses a SimulationDependencies literal that also supplies an externally-built observation
      source
- criterion: A simulate-case call over a case version in draft state returns the complete record — evidence,
    evaluations, resolved outcome, assessment, cost and durations.
  state: covered
  tests:
  - file: src/__tests__/unit/http/simulate-case.controller.spec.ts
    name: returns the complete record — evidence, evaluations, resolved, assessment, cost and durations
      — for a draft-state pinned case version, unchanged
  - file: src/__tests__/integration/factories/simulate-case-server.factory.spec.ts
    name: answers 200 with the complete record likewise for a draft-state pinned case version, never released
- criterion: A simulate-case call over a case version in released state likewise returns the complete
    record.
  state: covered
  tests:
  - file: src/__tests__/unit/http/simulate-case.controller.spec.ts
    name: returns the complete record likewise for a released-state pinned case version
  - file: src/__tests__/integration/factories/simulate-case-server.factory.spec.ts
    name: reaches simulate-case's own controller through createDiagnoseHttpServer's real composition and
      answers 200 with the complete record — evidence, evaluations, resolved, assessment, cost and durations
      — for a released-state pinned case version
- criterion: No investigation is written and no investigation-completed event is emitted by a simulate-case
    call.
  state: covered
  tests:
  - file: src/__tests__/unit/http/simulate-case.controller.spec.ts
    name: SimulateCaseControllerDependencies declares exactly caseQuery, glossary and runSimulate — no
      store, event bus or other write-capable dependency the controller could call
  - file: src/__tests__/integration/factories/simulate-case-server.factory.spec.ts
    name: writes no investigation row for the requester a real simulate-case call ran under, even though
      the call itself succeeds
- criterion: An unknown case slug or version is refused, reusing case-query's own errors.
  state: covered
  tests:
  - file: src/__tests__/unit/http/simulate-case.controller.spec.ts
    name: reuses case-query's own CaseNotFoundError unchanged for an unknown case slug or version, before
      runSimulate is ever called
  - file: src/__tests__/unit/http/simulate-case.controller.spec.ts
    name: reuses case-query's own CaseNotValidError unchanged for an incoherent case version, before runSimulate
      is ever called
- criterion: The response carries no narrative field and no ticket reference field.
  state: covered
  tests:
  - file: src/__tests__/unit/http/simulate-case.controller.spec.ts
    name: answers exactly evidence, evaluations, resolved, assessment, cost and durations — no narrative
      and no ticket_ref field, and no prompts field either
- criterion: The route is registered following the routePlugins()/BuildAppDependencies/buildAppDependencies()
    convention and is reachable through diagnose-server.factory.ts's composition for a real process.
  state: covered
  tests:
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: reaches simulate-case's own controller through the identical routePlugins()/BuildAppDependencies/buildAppDependencies()
      convention every other route in this file is proven through, on the very first request a freshly
      built app instance ever receives, answering exactly the complete record runSimulate resolved — no
      narrative or ticket_ref field
  - file: src/__tests__/integration/factories/simulate-case-server.factory.spec.ts
    name: reaches simulate-case's own controller through createDiagnoseHttpServer's real composition and
      answers 200 with the complete record — evidence, evaluations, resolved, assessment, cost and durations
      — for a released-state pinned case version
  - file: src/__tests__/integration/factories/simulate-hypothesis-server.factory.spec.ts
    name: reaches simulate-hypothesis's own controller through createDiagnoseHttpServer's real composition
      and answers 200 with exactly evidence, one evaluation and durations — collecting only the named
      hypothesis's own revision's concept, never the case's other hypothesis's own concept
- criterion: A simulate-hypothesis call restricts collection to only the concepts the named hypothesis's
    own revision collects.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/simulate-hypothesis-pipeline.spec.ts
    name: collects only the named hypothesis's own revision's concepts, never a concept only the case's
      other hypothesis collects
  - file: src/__tests__/integration/factories/simulate-hypothesis-server.factory.spec.ts
    name: reaches simulate-hypothesis's own controller through createDiagnoseHttpServer's real composition
      and answers 200 with exactly evidence, one evaluation and durations — collecting only the named
      hypothesis's own revision's concept, never the case's other hypothesis's own concept
- criterion: Exactly one evaluation returns, for the named hypothesis.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/simulate-hypothesis-pipeline.spec.ts
    name: answers exactly one evaluation, for the named hypothesis, judging its criterion exactly once
- criterion: No resolved outcome and no assessment are returned.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/simulate-hypothesis-pipeline.spec.ts
    name: carries exactly evidence, evaluation and durations — no resolved outcome and no assessment field,
      at the type level and on the actual answer
  - file: src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
    name: answers exactly evidence, evaluation and durations — no resolved, no assessment, no cost, no
      narrative and no ticket_ref field
- criterion: A hypothesis name absent from the version's manifest is refused with an HTTP 404 response
    reporting a HypothesisNotInManifestError.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/simulate-hypothesis-pipeline.spec.ts
    name: refuses with HypothesisNotInManifestError a hypothesis name absent from the case version's manifest,
      before collecting or judging anything
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves HypothesisNotInManifestError to 404
  - file: src/__tests__/integration/factories/simulate-hypothesis-server.factory.spec.ts
    name: refuses with 404 reporting HypothesisNotInManifestError, for a hypothesis name absent from the
      pinned case version manifest
- criterion: A subject with no attribute-values is refused, applying the same rule diagnose applies.
  state: covered
  tests:
  - file: src/__tests__/unit/http/simulate-case.controller.spec.ts
    name: refuses a request whose subject carries no attribute-value at all, throwing exactly a SubjectCarriesNoAttributeError,
      before runSimulate is ever called
  - file: src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
    name: refuses a request whose subject carries no attribute-value at all, throwing exactly a SubjectCarriesNoAttributeError,
      before runSimulateHypothesis is ever called
- criterion: A subject attribute-value naming an attribute outside the glossary is refused, applying the
    same rule diagnose applies.
  state: covered
  tests:
  - file: src/__tests__/unit/http/simulate-case.controller.spec.ts
    name: refuses a request naming a subject attribute the glossary does not hold, throwing exactly a
      SubjectAttributeNotInGlossaryError, before runSimulate is ever called
  - file: src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
    name: refuses a request naming a subject attribute the glossary does not hold, throwing exactly a
      SubjectAttributeNotInGlossaryError, before runSimulateHypothesis is ever called
- criterion: No investigation is written and nothing collected enters a cache.
  state: covered
  tests:
  - file: src/__tests__/integration/factories/simulate-hypothesis-server.factory.spec.ts
    name: writes no investigation row for the requester a real simulate-hypothesis call ran under, even
      though the call itself succeeds
  - file: src/__tests__/unit/factories/production-simulate-hypothesis.factory.spec.ts
    name: imports no module resembling a cache or a caching observation-source decorator
- criterion: The response's durations carry collection and judgment; writing is absent, since this operation
    never reaches consolidation.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/simulate-hypothesis-pipeline.spec.ts
    name: carries durations with collection and judgment only, real non-zero measured values, and no writing
      field at all — neither in the type nor on the answer
  - file: src/__tests__/unit/investigation/simulate-hypothesis-pipeline.spec.ts
    name: answers a judgment duration of zero when no-data means the evaluator was never called at all
- criterion: A diagnose request naming a case version in draft state is refused with a new named domain
    error, following the CaseVersion*Error pattern in src/src/errors/, before collection, judgment or
    writing runs.
  state: covered
  tests:
  - file: src/__tests__/unit/http/diagnose.controller.spec.ts
    name: refuses a diagnose request naming a draft-state pinned case version by throwing exactly a CaseVersionNotReleasedError
  - file: src/__tests__/unit/http/diagnose.controller.spec.ts
    name: never calls runDiagnose — the sole entry into collection, judgment and writing — for a draft-state
      pinned version, so none of the three ever starts
  - file: src/__tests__/unit/http/diagnose.routes.spec.ts
    name: answers 409 with the CaseVersionNotReleasedError envelope, naming the pinned slug, version and
      state, for a draft-state pinned version
- criterion: The new error is registered in status-map.ts's STATUS_BY_ERROR_CLASS table, mapped to a status
    this project decides as its own engineering choice.
  state: covered
  tests:
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves CaseVersionNotReleasedError to 409
- criterion: A diagnose request naming a case version in released state is unaffected and proceeds exactly
    as before.
  state: covered
  tests:
  - file: src/__tests__/unit/http/diagnose.controller.spec.ts
    name: 'proceeds exactly as before for a released-state pinned version: calls runDiagnose once with
      every field assembled unchanged, and answers with its resolved Assessment'
  - file: src/__tests__/unit/http/diagnose.routes.spec.ts
    name: answers 200 with the resolved assessment, unchanged, for a released-state pinned version
- criterion: anthropic-hypothesis-evaluator.adapter.ts's evaluate() returns input_tokens and output_tokens
    read from the provider response's own usage, for any call that happened.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: answers a decided verdict carrying usage read exactly from the provider response's own message.usage,
      alongside the measured elapsed_ms and the sent prompt
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: reads a different usage value per call, exactly matching that call's own mocked response, rather
      than any fixed placeholder value
- criterion: anthropic-hypothesis-evaluator.adapter.ts's evaluate() returns elapsed_ms measured around
    its own provider call.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: measures elapsed_ms as the real wall-clock time the provider call itself took, rather than a
      fixed value
- criterion: anthropic-hypothesis-evaluator.adapter.ts's evaluate() returns the judgment prompt exactly
    as materialized for that call.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: reports elapsed_ms and the exact prompt sent, but never invents a usage field, when the provider
      call itself throws before any response arrives
- criterion: anthropic-assessment-consolidator.adapter.ts's consolidate() returns input_tokens, output_tokens
    and elapsed_ms from its own provider call, the same way.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
    name: answers usage read exactly from the provider response's own usage on a successful call
  - file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
    name: answers an elapsed_ms reflecting the real wall-clock time the provider call itself took, rather
      than a fixed value
- criterion: anthropic-assessment-consolidator.adapter.ts's consolidate() returns the consolidation prompt
    exactly as materialized for that call.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
    name: answers a prompt equal to exactly the same data block sent as the call's own user message content
- criterion: diagnose.controller.ts no longer references UNMEASURED_COST or UNMEASURED_DURATIONS.
  state: covered
  tests:
  - file: src/__tests__/unit/http/diagnose.controller.spec.ts
    name: no longer references UNMEASURED_COST or UNMEASURED_DURATIONS anywhere in its own source
- criterion: The written investigation's cost.calls counts exactly one call per required hypothesis judged
    plus one consolidation call.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: counts cost.calls as one per hypothesis when every required hypothesis is actually judged, plus
      one for the consolidation call
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: counts cost.calls as exactly one — the consolidation call alone — when every required hypothesis
      degrades to no-data without ever calling the evaluator
- criterion: The written investigation's cost.input_tokens and cost.output_tokens equal the sum of every
    judgment call's own usage and the consolidation call's own usage.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: sums cost.input_tokens and cost.output_tokens across every judgment call's own usage and the
      consolidation call's own usage
- criterion: The written investigation's durations carry measured, non-constant values for collection,
    judgment, writing and total across two diagnose calls with different evidence/judgment timings.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: writes measured, non-constant durations across two diagnose calls whose evidence and judgment
      take different amounts of time
  - file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
    name: persists real, non-zero cost and durations for the judgment and consolidation calls, now that
      the Anthropic adapters themselves report real usage and elapsed_ms
- criterion: Every Evidence item evidenceOf constructs carries an elapsed_ms integer, whatever the result
    (ok, unavailable, denied, timeout).
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: carries a defined, non-negative integer elapsed_ms on every Evidence item, whatever its result
      (ok, unavailable, denied, timeout)
- criterion: elapsed_ms reflects the wall-clock time of that one concept's own collection attempt.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: measures elapsed_ms as each concept's own real collection duration, distinct per concept rather
      than one value shared across the whole stage
- criterion: No Evidence item is constructed without elapsed_ms once this task lands.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
    name: carries a defined, non-negative integer elapsed_ms on every Evidence item, whatever its result
      (ok, unavailable, denied, timeout)
  - file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
    name: sends the evidence item's own elapsed_ms as the evidence insert's own last param, not silently
      dropped from the row this store persists
- criterion: fake-hypothesis-evaluator.adapter.ts's evaluate() returns usage (input_tokens 0, output_tokens
    0) and elapsed_ms 0 for any seeded call.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
    name: answers the confirmed verdict with exactly the citations seeded for it, plus the deterministic
      zero-valued usage and elapsed_ms every answer now carries
  - file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
    name: overrides a seeded non-zero usage and elapsed_ms with the deterministic zero on every answer,
      while still carrying a seeded prompt through unchanged
- criterion: fake-assessment-consolidator.adapter.ts's consolidate() returns the same zero-valued usage
    and elapsed_ms, plus a placeholder prompt string.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
    name: answers a placeholder zero-valued usage, an elapsed_ms of 0 and an empty-string prompt, regardless
      of what text was seeded
- criterion: An unseeded key still throws a plain Error, unchanged from the fakes' own existing behavior.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
    name: throws naming the criterion rather than answering a default for a criterion nothing seeded
  - file: src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
    name: throws naming the unseeded call rather than answering a default text
- criterion: IHypothesisEvaluator.evaluate()'s return type declares an optional usage ({input_tokens,
    output_tokens}), an optional elapsed_ms and an optional prompt.
  state: uncovered
  why: No test asserts this at the type level (no expectTypeOf/@ts-expect-error on EvaluationOutcome).
    Several tests construct EvaluationOutcome literals that happen to omit usage/elapsed_ms/prompt, which
    only typechecks because the fields are optional, but each does so incidentally on the way to proving
    an unrelated behavior -- nothing treats the optionality itself as load-bearing, so a change making
    these fields required would surface as scattered compile failures rather than a named test failure.
- criterion: IAssessmentConsolidator.consolidate()'s return type declares usage, elapsed_ms and prompt,
    not optional.
  state: uncovered
  why: 'Nothing distinguishes required from optional for these three fields: every test literal happens
    to always supply all three, which would compile identically whether the fields were required or optional,
    and no test constructs or type-checks a literal that omits one.'
- criterion: An Evaluation built from a hypothesis whose judgment call happened carries the usage, elapsed_ms
    and prompt that call's own port response returned.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: attaches the usage, elapsed_ms and prompt a first call's own decided, structurally valid answer
      returned, onto the resulting Evaluation
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: attaches the retry's own usage, elapsed_ms and prompt — never the discarded first call's — onto
      the decided answer the retry accepted
- criterion: An Evaluation whose reason is no-data carries no usage, elapsed_ms or prompt.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: a no-data evaluation carries no usage, elapsed_ms or prompt key at all — judgment was never
      called for it
- criterion: The hypothesis-evaluator adapters (Anthropic and fake) are byte-for-byte unchanged — their
    optional usage/elapsed_ms/prompt fields being absent still satisfies the widened return type.
  state: uncovered
  why: 'Both adapters were legitimately changed by later tasks in this same initiative: task/investigation-telemetry/anthropic-adapters-report-real-usage-and-timing
    rewired AnthropicHypothesisEvaluator to read real usage/elapsed_ms from the provider, and task/investigation-telemetry/fake-adapters-return-zeroed-usage-and-timing
    rewired FakeHypothesisEvaluator to always attach a zeroed usage/elapsed_ms rather than leaving them
    exactly as seeded. Nothing in the current test set proves ''byte-for-byte unchanged'' any longer;
    what remains instead proves the opposite for both adapters -- a fact the two sibling tasks'' own task
    text never came back to correct on this task''s own criterion wording.'
- criterion: The assessment-consolidator adapters (Anthropic and fake) change only enough to satisfy the
    widened, required ConsolidationOutcome return type — a placeholder usage of input_tokens 0 and output_tokens
    0, and elapsed_ms of 0, with prompt as whatever the adapter already had assembled before this task
    touched it. Neither adapter gains real provider-usage reading or real call timing here — that is task/investigation-telemetry/anthropic-adapters-report-real-usage-and-timing's
    and task/investigation-telemetry/fake-adapters-return-zeroed-usage-and-timing's own declared scope,
    and duplicating it here is exactly the over-reach this criterion now exists to rule out.
  state: uncovered
  why: task/investigation-telemetry/anthropic-adapters-report-real-usage-and-timing subsequently rewired
    AnthropicAssessmentConsolidator to read real provider usage and measure real elapsed_ms, exactly the
    outcome this criterion's own text names as belonging to that task's own scope and rules out here.
    Only the fake consolidator still keeps the zero/placeholder behavior; nothing in the current set proves
    'neither adapter gains real provider-usage reading or real call timing' for the Anthropic adapter
    any longer, and the remaining tests prove the opposite for it -- again a criterion whose wording was
    never revisited once the task it names came in and did exactly what it names.
findings:
- pass: conformance
  file: src/errors/status-map.ts
  where: the header comment's own 409-group enumeration, and the STATUS_BY_ERROR_CLASS entry [CaseVersionNotReleasedError,
    409]
  evidence: a diagnose request pinned to a draft-state case version (CaseVersionNotReleasedError, rules/investigation/only-a-released-case-version-is-diagnosed)
    -- this project's own engineering choice, the same way every other entry in this group already is,
    since this refusal's status is not something any specification node fixes
  cost: rules/investigation/only-a-released-case-version-is-diagnosed and scenarios/investigation/a-draft-case-version-refuses-diagnosis
    both stop at "the request is refused, naming that the version is not released" -- no status, no error
    name is stated in the specification. Every sibling refusal this same 409 group lists has its status
    and error name disclosed as a decided fact in decision-log.md; CaseVersionNotReleasedError's 409 has
    no such entry anywhere in the specification, so a reader checking the specification for what a client
    is told will not find it there -- only in this file, which itself now asserts the status is deliberately
    not a specification fact.
  correction: Decide the status/error-name pairing for a draft-state diagnose refusal in the specification
    (a decision-log entry against rules/investigation/only-a-released-case-version-is-diagnosed, mirroring
    the sibling refusals already disclosed there).
- pass: conformance
  file: src/http/dto/simulate-case.dto.ts
  where: assessmentSchema's own declaration
  evidence: assessmentSchema mirrors Assessment's own actually-delivered shape (outcome, referral, determining_hypothesis,
    text) exactly -- this task's own criteria do not ask for usage/elapsed_ms/prompt/register to be added
    onto it
  cost: contracts/investigation/case-simulation states simulate-case returns the whole record back including
    the assessment, and domain/investigation/assessment declares usage, elapsed_ms, prompt and register
    as required -- register in particular because a consolidation call always settles on some one register
    before producing text, so a reader is never meant to be left guessing which register is behind the
    text on hand. A curator calling simulate-case, built exactly for this kind of inspection, never learns
    which register or what the call cost, even though the node says that fact is never absent.
  correction: Widen assessmentSchema (and the Assessment value it mirrors) to require usage, elapsed_ms,
    prompt and register, per domain/investigation/assessment.
- pass: conformance
  file: src/investigation/draft-assessment-text.ts
  where: draftAssessment's own return value, and its own function-doc claim
  evidence: 'const base = { outcome: resolved.outcome, referral: resolved.referral, text }; -- the Assessment
    answered carries only outcome, referral, determining_hypothesis and text, citing domain/investigation/assessment
    as authority for that four-field shape'
  cost: domain/investigation/assessment requires usage, elapsed_ms, prompt and register on every assessment
    unconditionally, yet this function discards exactly those fields from the ConsolidationOutcome it
    just received and never carries the consolidationRegister it consolidated with into the value it returns.
    The comment cites domain/investigation/assessment as authority for a four-field shape, so a reader
    trusting this module's own comment will look no further for where usage/elapsed_ms/prompt/register
    belong.
  correction: Assemble the returned Assessment from resolved.outcome/referral/determining_hypothesis plus
    the consolidator's own text, usage, elapsed_ms and prompt, and the consolidationRegister actually
    used, matching domain/investigation/assessment's required attributes.
- pass: conformance
  file: src/persistence/relational-investigation-store.repository.ts
  where: IInvestigationRow's own assessment_* columns, INVESTIGATION_INSERT_TEXT, assessmentParams() and
    assessmentOf()
  evidence: 'The assessment''s own five columns, flattened (domain/investigation/assessment): outcome
    and, from its referral, action and recipient, then its optional determining_hypothesis and its text.'
  cost: domain/investigation/assessment requires usage, elapsed_ms, prompt and register on every assessment,
    but the investigations table carries no column for any of the four and this repository neither writes
    nor reads them back. rules/investigation/the-response-follows-the-record exists so the written record
    is the durable answer; an audit opening an already-written investigation later has no column to recover
    which register produced its text or what that call cost, even though the node says that fact is never
    absent.
  correction: Add columns for the assessment's usage (input_tokens/output_tokens), elapsed_ms, prompt
    and register, and carry them through investigationStatement/investigationParams and investigationOf/assessmentOf
    the way the other required attributes already are.
- pass: standard
  file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  where: requireDatabaseUrl(), lines 126-132
  cites: STK-08
  evidence: "function requireDatabaseUrl(): string {\n  const url = process.env.DATABASE_URL;\n  if (!url)\
    \ {\n    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to\
    \ run.');\n  }\n  return url;\n}"
  cost: the value that seeds this whole suite's real database connection reaches the process with no schema
    behind it -- a malformed URL surfaces however the pg driver happens to fail on it, rather than as
    a validation error naming the field, and the check this file substitutes (a bare truthiness test)
    is exactly the hand-written guard the rule says must not stand in for a schema at a boundary
  correction: read DATABASE_URL through config/env.ts's loadEnv, or extend that schema so a partial, test-only
    shape can still be validated by it
- pass: standard
  file: src/__tests__/integration/factories/production-diagnose.factory.spec.ts
  where: requireDatabaseUrl(), lines 76-82
  cites: STK-08
  evidence: "function requireDatabaseUrl(): string {\n  const url = process.env.DATABASE_URL;\n  if (!url)\
    \ {\n    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to\
    \ run.');\n  }\n  return url;\n}"
  cost: the same environment boundary this file reads to build its own real DatabaseConnection is never
    handed to the project's Zod-validated env schema, so the one place STK-08 says every environment read
    answers to is bypassed here too
  correction: read DATABASE_URL through config/env.ts's loadEnv rather than a hand-rolled presence check
- pass: standard
  file: src/__tests__/integration/factories/simulate-case-server.factory.spec.ts
  where: requireDatabaseUrl(), lines 92-98
  cites: STK-08
  evidence: "function requireDatabaseUrl(): string {\n  const url = process.env.DATABASE_URL;\n  if (!url)\
    \ {\n    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to\
    \ run.');\n  }\n  return url;\n}"
  cost: the URL this file hands to createDatabaseConnection and to baseEnv().DATABASE_URL never passes
    through the schema the standard requires every environment read to answer to, so a malformed value
    fails inside the driver rather than at the boundary the rule names
  correction: resolve DATABASE_URL through config/env.ts's loadEnv instead of a bare process.env read
- pass: standard
  file: src/__tests__/integration/factories/simulate-hypothesis-server.factory.spec.ts
  where: requireDatabaseUrl(), lines 68-74
  cites: STK-08
  evidence: "function requireDatabaseUrl(): string {\n  const url = process.env.DATABASE_URL;\n  if (!url)\
    \ {\n    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to\
    \ run.');\n  }\n  return url;\n}"
  cost: the same environment value that seeds this file's own real connection and baseEnv() is read straight
    from process.env with a hand-written presence check, never through the schema STK-08 requires for
    every environment boundary
  correction: resolve DATABASE_URL through config/env.ts's loadEnv instead of a bare process.env read
- pass: standard
  file: src/__tests__/integration/http/diagnose-e2e.spec.ts
  where: requireDatabaseUrl(), lines 76-82
  cites: STK-08
  evidence: "function requireDatabaseUrl(): string {\n  const url = process.env.DATABASE_URL;\n  if (!url)\
    \ {\n    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to\
    \ run.');\n  }\n  return url;\n}"
  cost: the connection this whole end-to-end proof is built over is seeded from an environment read with
    no schema behind it, so the one boundary check STK-08 asks for is missing exactly where a bad value
    would otherwise be caught with a named field rather than a generic driver failure
  correction: resolve DATABASE_URL through config/env.ts's loadEnv instead of a bare process.env read
- pass: standard
  file: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  where: requireDatabaseUrl(), lines 72-78
  cites: STK-08
  evidence: "function requireDatabaseUrl(): string {\n  const url = process.env.DATABASE_URL;\n  if (!url)\
    \ {\n    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to\
    \ run.');\n  }\n  return url;\n}"
  cost: the delaying connection this file wraps around the real driver is seeded from a process.env read
    with no schema behind it, so the environment boundary STK-08 names answers to nothing here
  correction: resolve DATABASE_URL through config/env.ts's loadEnv instead of a bare process.env read
- pass: standard
  file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  where: requireDatabaseUrl(), lines 73-79
  cites: STK-08
  evidence: "function requireDatabaseUrl(): string {\n  const url = process.env.DATABASE_URL;\n  if (!url)\
    \ {\n    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to\
    \ run.');\n  }\n  return url;\n}"
  cost: the pool this whole suite runs its real writes and reads through is built from an environment
    read that never reaches the project's Zod schema, so a malformed URL is diagnosed only by whatever
    the driver happens to report
  correction: resolve DATABASE_URL through config/env.ts's loadEnv instead of a bare process.env read
- pass: standard
  file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  where: requireDatabaseUrl(), lines 101-107
  cites: STK-08
  evidence: "function requireDatabaseUrl(): string {\n  const url = process.env.DATABASE_URL;\n  if (!url)\
    \ {\n    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to\
    \ run.');\n  }\n  return url;\n}"
  cost: the connection every migration in this suite runs over is seeded from process.env with a bare
    truthiness check standing in for the schema STK-08 requires at this boundary
  correction: resolve DATABASE_URL through config/env.ts's loadEnv instead of a bare process.env read
- pass: failures
  file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
  where: answers an elapsed_ms reflecting the real wall-clock time the provider call itself took, rather
    than a fixed value (line 211)
  evidence: "AssertionError: expected 19 to be greater than or equal to 20\n ❯ src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts:211:30\n\
    \    211|   expect(outcome.elapsed_ms).toBeGreaterThanOrEqual(20);"
  cost: the suite fails intermittently on a run that changed nothing about how elapsed_ms is computed
    -- a reviewer chasing this finding lands on adapter code that already does exactly what domain/investigation/assessment
    states, and the wasted cycle repeats on every rerun that happens to land the setTimeout(20) tick a
    millisecond early against Date.now()'s own resolution
  correction: replace the real-timer race with a deterministic one -- install vi.useFakeTimers() (or a
    stubbed Date.now()) for this test, advance the fake clock past the mocked delay, and assert elapsed_ms
    against that controlled value instead of a hard >=20 floor over the real system clock; the node names
    no millisecond-boundary guarantee for the test to encode
  cause: test
---

## What it is

A single review over all ten tasks of case-simulation-backend, captured as one fresh install/typecheck/lint/secret-scan/test run over the whole merged tree rather than trusting each task's own isolated green run to compose. Coverage, specification conformance, standard conformance and the one test failure the fresh run surfaced were each judged independently, in a clean context, by the four passes this framework ships.

## Notes

The specification-conformance pass's four findings converge on one recurring gap already disclosed, not silently, across several of this initiative's own delivery records: domain/investigation/assessment requires usage, elapsed_ms, prompt and register, and Assessment's own actually-delivered shape still carries none of them -- a decision the widen-judgment-and-consolidation-ports task's own delivery record traced back to draft-assessment-text.spec.ts's own already-delivered, still-passing guarantee that Assessment carries exactly four fields, and left open for a future task or an explicit human decision each time it resurfaced. This review reports it again because a review reports what is there regardless of whether it was already known -- the disclosure is what makes it a known gap rather than an undiscovered one, not a reason to stop restating it.

The coverage pass's four uncovered criteria are two genuinely distinct kinds of gap. Criteria 1 and 2 of widen-judgment-and-consolidation-ports (optional vs. required fields on EvaluationOutcome/ConsolidationOutcome) were never proven at the type level by an expectTypeOf/@ts-expect-error pair, unlike the equivalent guarantees the later simulation-pipeline tasks did pin that way. Criteria 5 and 6 of the same task describe behavior (both hypothesis-evaluator adapters byte-for-byte unchanged; both consolidator adapters carrying only placeholder zero-valued usage/timing) that two later tasks in this same initiative (anthropic-adapters-report-real-usage-and-timing, fake-adapters-return-zeroed-usage-and-timing) deliberately superseded by design -- the task file's own criteria text was never revisited once the sibling tasks it names did exactly what it anticipated.