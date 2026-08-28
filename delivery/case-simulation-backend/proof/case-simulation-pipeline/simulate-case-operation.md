---
title: Proof for POST /v1/simulate returning the complete record without writing an investigation
summary: Unit tests against handleSimulateCaseRequest and createProductionSimulationRunner directly, plus a real-composition integration proof against createDiagnoseHttpServer, together proving every one of this task's eight criteria and excluding the UNDERDETERMINED cache-reuse implementation its own Notes name.
implementation: sha256:13b8a25024d24451b0035586d3d3cacbf91f516a6d497b41c9e356e55e8a70df
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/case-simulation-pipeline-simulate-case-operation-suite-2
tests:
  - file: src/__tests__/unit/http/simulate-case.controller.spec.ts
    name: returns the complete record — evidence, evaluations, resolved, assessment, cost and durations — for a draft-state pinned case version, unchanged
    proves: "A simulate-case call over a case version in draft state returns the complete record — evidence, evaluations, resolved outcome, assessment, cost and durations."
    fails_when: handleSimulateCaseRequest ever branches on the pinned case's declared state, drops a field runSimulate answered, or answers something other than exactly evidence/evaluations/resolved/assessment/cost/durations for a draft-state case
  - file: src/__tests__/unit/http/simulate-case.controller.spec.ts
    name: returns the complete record likewise for a released-state pinned case version
    proves: "A simulate-case call over a case version in released state likewise returns the complete record."
    fails_when: the same six fields are not answered unchanged for a released-state case
  - file: src/__tests__/unit/http/simulate-case.controller.spec.ts
    name: reads the pinned case through readCase with no branch on its declared state, calling runSimulate for a draft version exactly as it would for a released one
    proves: the implementation's own disclosed inference that neither subject refusal — and no other logic — is gated behind pinnedCase.state
    fails_when: a draft-state call and a released-state call reach runSimulate a different number of times, or one reaches it and the other does not
  - file: src/__tests__/unit/http/simulate-case.controller.spec.ts
    name: "SimulateCaseControllerDependencies declares exactly caseQuery, glossary and runSimulate — no store, event bus or other write-capable dependency the controller could call"
    proves: "No investigation is written and no investigation-completed event is emitted by a simulate-case call."
    fails_when: SimulateCaseControllerDependencies is widened to carry a store, an event emitter, or any other field beyond caseQuery, glossary and runSimulate
  - file: src/__tests__/unit/http/simulate-case.controller.spec.ts
    name: answers exactly what runSimulate resolved, calling neither a store nor any other dependency beyond caseQuery.readCase and glossary.readVocabularyTerm
    proves: "No investigation is written and no investigation-completed event is emitted by a simulate-case call. (the behavioral half, alongside the structural test above)"
    fails_when: the controller calls readCase, readVocabularyTerm or runSimulate more than once each, or calls any function this test did not name
  - file: src/__tests__/unit/http/simulate-case.controller.spec.ts
    name: refuses a request whose subject carries no attribute-value at all, throwing exactly a SubjectCarriesNoAttributeError, before runSimulate is ever called
    proves: "A subject with no attribute-values is refused, applying the same rule diagnose applies."
    fails_when: an empty-attribute subject is accepted, or SubjectCarriesNoAttributeError is not the exact type thrown, or runSimulate is called anyway
  - file: src/__tests__/unit/http/simulate-case.controller.spec.ts
    name: refuses a request naming a subject attribute the glossary does not hold, throwing exactly a SubjectAttributeNotInGlossaryError, before runSimulate is ever called
    proves: "A subject attribute-value naming an attribute outside the glossary is refused, applying the same rule diagnose applies."
    fails_when: a glossary-violating attribute is accepted, or a different error type is thrown, or runSimulate is called anyway
  - file: src/__tests__/unit/http/simulate-case.controller.spec.ts
    name: names the offending attribute on the thrown refusal, applying the same rule diagnose applies rather than a fixed message
    proves: the glossary refusal reuses investigation-factory.ts's own refuseAttributesNotInGlossary unchanged, naming the real offending attribute rather than a placeholder
    fails_when: the thrown error's own context does not name the specific ungoverned attribute the request supplied
  - file: src/__tests__/unit/http/simulate-case.controller.spec.ts
    name: "reuses case-query's own CaseNotFoundError unchanged for an unknown case slug or version, before runSimulate is ever called"
    proves: "An unknown case slug or version is refused, reusing case-query's own errors."
    fails_when: the controller catches or replaces CaseNotFoundError instead of letting it propagate unchanged, or calls runSimulate anyway
  - file: src/__tests__/unit/http/simulate-case.controller.spec.ts
    name: "reuses case-query's own CaseNotValidError unchanged for an incoherent case version, before runSimulate is ever called"
    proves: "An unknown case slug or version is refused, reusing case-query's own errors. (the sibling case-query refusal, CaseNotValidError)"
    fails_when: the controller catches or replaces CaseNotValidError instead of letting it propagate unchanged, or calls runSimulate anyway
  - file: src/__tests__/unit/http/simulate-case.controller.spec.ts
    name: "answers exactly evidence, evaluations, resolved, assessment, cost and durations — no narrative and no ticket_ref field, and no prompts field either"
    proves: "The response carries no narrative field and no ticket reference field."
    fails_when: the answered object carries a narrative field, a ticket_ref field, or InvestigationPipelineResult's own separate prompts field
  - file: src/__tests__/unit/factories/production-simulate.factory.spec.ts
    name: passes the caller-given connection, pool size and default consolidation register through to createSimulationRunner, unchanged
    proves: production-simulate.factory.ts wires the already-delivered no-cache composition (simulate.factory.ts) rather than reimplementing or bypassing it
    fails_when: any of the three pass-through fields is dropped, substituted or rebuilt before reaching createSimulationRunner
  - file: src/__tests__/unit/factories/production-simulate.factory.spec.ts
    name: always wires a real AnthropicHypothesisEvaluator and AnthropicAssessmentConsolidator, never a caller-substituted implementation
    proves: production-simulate.factory.ts fixes the real, Anthropic-backed adapters rather than leaving them caller-choosable, mirroring production-diagnose.factory.ts
    fails_when: a caller-supplied evaluator or consolidator reaches createSimulationRunner instead of the two Anthropic adapters this factory constructs itself
  - file: src/__tests__/unit/factories/production-simulate.factory.spec.ts
    name: computes the deadline as its own start instant plus the specification-declared twenty-second budget, and propagates that exact pair to the wired runner
    proves: the implementation's own disclosed inference that a production simulation call stamps the same 20-second TOTAL_DEADLINE_BUDGET_MS production-diagnose.factory.ts already stamps
    fails_when: the propagated deadline is not exactly now + 20000, or now is read anywhere but at call time
  - file: src/__tests__/unit/factories/production-simulate.factory.spec.ts
    name: "stamps a fresh (now, deadline) pair on a second call, never the first call's own pair"
    proves: the same 20-second-deadline inference, over a second call rather than only the first
    fails_when: a second call reuses the first call's own now/deadline pair instead of stamping a fresh one
  - file: src/__tests__/unit/factories/production-simulate.factory.spec.ts
    name: constructs the Anthropic client once when the runner is created, never again on either of two later calls
    proves: the per-deployment, not per-request, construction convention this factory shares with production-diagnose.factory.ts
    fails_when: the Anthropic constructor is invoked again on a second or third call to the returned runner
  - file: src/__tests__/unit/factories/production-simulate.factory.spec.ts
    name: constructs both Anthropic-backed adapters with the credential resolved from the environment alone, since ProductionSimulationDependencies exposes no apiKey field of its own
    proves: ProductionSimulationDependencies carries no credential field, mirroring ProductionDiagnoseDependencies
    fails_when: the Anthropic constructor is called with anything other than the environment-resolved apiKey, or ProductionSimulationDependencies gains a credential field of its own
  - file: src/__tests__/unit/factories/production-simulate.factory.spec.ts
    name: "imports nothing from diagnose.factory.ts, production-diagnose.factory.ts, run-diagnosis.ts or investigation-factory.ts, so no branch of diagnose's own write path is reachable from here"
    proves: "No investigation is written and no investigation-completed event is emitted by a simulate-case call. (production-simulate.factory.ts's own structural share of the guarantee)"
    fails_when: production-simulate.factory.ts's own source ever imports one of these four write-path modules
  - file: src/__tests__/unit/factories/production-simulate.factory.spec.ts
    name: imports no module resembling a cache or a caching observation-source decorator
    proves: the UNDERDETERMINED entry's own exclusion — a simulate-case implementation reusing diagnose's own cache is foreclosed at this factory
    fails_when: production-simulate.factory.ts's own source imports a module whose basename names a cache or a caching observation-source decorator
  - file: src/__tests__/unit/factories/production-simulate.factory.spec.ts
    name: "imports HttpDeclarativeObservationSource nowhere: the observation source this run collects through is exactly simulate.factory.ts's own freshly constructed, cache-free instance, never one this factory builds or supplies itself"
    proves: the UNDERDETERMINED entry's own exclusion — production-simulate.factory.ts constructs no observation source of its own that could be shared with diagnose's own cache-eligible one
    fails_when: production-simulate.factory.ts's own source imports HttpDeclarativeObservationSource, or any other observation-source module, directly
  - file: src/__tests__/unit/factories/production-simulate.factory.spec.ts
    name: "ProductionSimulationDependencies carries exactly connection, poolSize, defaultConsolidationRegister, evaluatorModel, evaluatorMaxTokens, consolidatorModel and consolidatorMaxTokens — no observation-source field of its own"
    proves: the UNDERDETERMINED entry's own exclusion, at the type level — nothing this factory's own caller could pass in is an observation source or a cache
    fails_when: ProductionSimulationDependencies is widened to accept an observationSource field or any other field beyond the seven named
  - file: src/__tests__/unit/factories/production-simulate.factory.spec.ts
    name: "ProductionSimulationCall carries exactly subjectType, subjectAttributes, case and requester — no now, deadline, narrative, ticket_ref, id, prompt_version, model, glossary or store field"
    proves: production-simulate.factory.ts's own published call shape matches simulate.factory.ts's own SimulationCall minus the two fields this factory itself stamps, carrying nothing persistence-only
    fails_when: ProductionSimulationCall gains a field beyond subjectType, subjectAttributes, case and requester
  - file: src/__tests__/unit/factories/production-simulate.factory.spec.ts
    name: "propagates a rejection from the wired runner to this factory's own caller, unchanged"
    proves: a dependency (the wired simulation runner) that fails is surfaced rather than swallowed or transformed
    fails_when: a rejection from the wired runner is caught, replaced or turned into a resolved value
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: "reaches simulate-case's own controller through the identical routePlugins()/BuildAppDependencies/buildAppDependencies() convention every other route in this file is proven through, on the very first request a freshly built app instance ever receives, answering exactly the complete record runSimulate resolved — no narrative or ticket_ref field"
    proves: "The route is registered following the routePlugins()/BuildAppDependencies/buildAppDependencies() convention and is reachable through diagnose-server.factory.ts's composition for a real process. (the routePlugins()/BuildAppDependencies/buildAppDependencies() half)"
    fails_when: POST /v1/simulate answers 404 through buildApp(), or answers anything other than exactly evidence, evaluations, resolved, assessment, cost and durations matching what runSimulate resolved (excluding runSimulate's own separate prompts field, which simulateCaseResponseSchema never carries onto the wire)
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: refuses with 400 a simulate-case request whose subject carries no attribute at all, at the wire, before the route ever reaches its own controller
    proves: "A subject with no attribute-values is refused, applying the same rule diagnose applies. (the DTO-boundary half, at the wire)"
    fails_when: an empty-attribute simulate-case request answers anything other than 400 at the route
  - file: src/__tests__/integration/factories/simulate-case-server.factory.spec.ts
    name: "reaches simulate-case's own controller through createDiagnoseHttpServer's real composition and answers 200 with the complete record — evidence, evaluations, resolved, assessment, cost and durations — for a released-state pinned case version"
    proves: 'The route is registered following the routePlugins()/BuildAppDependencies/buildAppDependencies() convention and is reachable through diagnose-server.factory.ts''s composition for a real process (the real-process half), and A simulate-case call over a case version in released state likewise returns the complete record, against a real process'
    fails_when: a real POST /v1/simulate against createDiagnoseHttpServer(env) fails to reach 200, answers a different set of fields, answers empty evidence for a case with a real collection plan, or carries a narrative or ticket_ref field
  - file: src/__tests__/integration/factories/simulate-case-server.factory.spec.ts
    name: answers 200 with the complete record likewise for a draft-state pinned case version, never released
    proves: "A simulate-case call over a case version in draft state returns the complete record — evidence, evaluations, resolved outcome, assessment, cost and durations — against a real process and a genuinely-still-draft version"
    fails_when: a real POST /v1/simulate against a draft-state pinned version fails to reach 200 or answers a different set of fields
  - file: src/__tests__/integration/factories/simulate-case-server.factory.spec.ts
    name: writes no investigation row for the requester a real simulate-case call ran under, even though the call itself succeeds
    proves: "No investigation is written and no investigation-completed event is emitted by a simulate-case call. (the strongest available evidence — a direct read of the real investigations table after a real, successful call)"
    fails_when: a row appears in the investigations table under the requester a real simulate-case call ran under
not_applicable:
  - edge_case: two simulate-case calls against one subject at once
    why: simulate-case writes no state at all (no store, no event) and each call's own runSimulate closure carries nothing shared across calls beyond the once-constructed, stateless adapters production-simulate.factory.ts already proves are reused read-only; two concurrent calls cannot observe or affect one another differently from two sequential ones, and no criterion states a concurrency guarantee to test
  - edge_case: a duplicate or already-existing simulate-case request
    why: simulate-case has no uniqueness constraint of its own — it writes nothing a second call could collide with
  - edge_case: a numeric boundary on the case version or pagination
    why: no criterion of this task states a range; version is a plain positive integer at the DTO boundary, already proven by diagnoseRequestSchema's identical caseRefSchema convention, and simulate-case has no listing or pagination surface of its own
  - edge_case: an operation attempted against a case-version state that forbids simulate-case
    why: contracts/investigation/case-simulation and this task's own criteria 1 and 2 state explicitly that a case version in either declared state is open to simulation — there is no forbidding state to test a refusal against
untested:
  - "Whether the empty-attribute and glossary-violation refusals (criteria 4 and 5) behave identically over a draft-state pinned case version, not only a released one — every refusal test in simulate-case.controller.spec.ts uses heldCase()'s own default released state; the implementation record's own inference that neither refusal is state-gated is exercised only for the happy-path draft/released pair (criteria 1 and 2), never for the refusal path against a draft version specifically."
  - "The exact transport status a production simulate-case call answers for a glossary-violation refusal (SubjectAttributeNotInGlossaryError), a bypassed-DTO empty-attribute refusal (SubjectCarriesNoAttributeError) or an incoherent case version (CaseNotValidError) — none of the three appears in src/errors/status-map.ts, and neither the task's own criteria nor any specification node this task implements states one; this proof asserts the exact error type/instance the controller propagates, which is what the criteria actually require, and leaves the wire status of these three specifically unproven since nothing decided it."
divergences:
  - cites: TST-04
    file: src/__tests__/integration/factories/simulate-case-server.factory.spec.ts
    departure: this file's own name corresponds to no single production file — its subject is createDiagnoseHttpServer (diagnose-server.factory.ts), the composition root diagnose-server.factory.spec.ts already mirrors and already owns.
    why: appending this task's own three real-composition tests (and the draft-case fixture they need) into diagnose-server.factory.spec.ts itself was tried first and reverted — that file is large, shared by every diagnose integration scenario, and changing its beforeAll/afterAll for a sibling route's own new draft-case fixture risks every diagnose test it already proves for a benefit this task alone needs. A standalone file seeds and tears down its own state independently and, since vitest.config.ts's own fileParallelism:false runs every test file strictly sequentially, never races diagnose-server.factory.spec.ts's own identical use of the same released fixture regardless of which file runs first.
---

## What it is

Unit-level proof against handleSimulateCaseRequest directly (simulate-case.controller.spec.ts, mirroring diagnose.controller.spec.ts's own established shape) and against createProductionSimulationRunner directly (production-simulate.factory.spec.ts, mirroring production-diagnose.factory.spec.ts's own established shape), covering all eight of this task's criteria and the structural exclusion its own UNDERDETERMINED note names; a companion reachability test added to build-app.spec.ts (mirroring that file's own existing route-reachability convention); and a real, end-to-end integration proof against createDiagnoseHttpServer(env) — reaching a real PostgreSQL database, a real HttpDeclarativeObservationSource and a mocked Anthropic client, exactly the convention diagnose-server.factory.spec.ts already establishes — for criterion 8's own "for a real process" and the strongest available evidence that no investigation row is ever written. Three already-delivered test files (build-app.spec.ts, diagnose-e2e.spec.ts, diagnose-persistence-deadline-e2e.spec.ts) received the minimal companion `simulateCase` stub/dependency their own literals now require, since BuildAppDependencies and BuildAppDependenciesInputs both gained that field — no behavior of theirs changed, and no new test was written over what they already proved.

## Notes

The UNDERDETERMINED entry this task's own Notes carry — a simulate-case implementation whose collection stage reuses diagnose's own cache — is excluded two ways for the files this task delivers: (1) already-delivered, already-proven structurally by simulate.factory.spec.ts's own criterion-4 tests (SimulationDependencies accepts no observationSource field at all, confirmed by a `@ts-expect-error` literal, so nothing any caller supplies could ever be a cache), which this task's controller and production-simulate.factory.ts call into unchanged; and (2) newly proven here, over this task's own new file, by production-simulate.factory.spec.ts's import-scan and type-level tests, confirming production-simulate.factory.ts never imports HttpDeclarativeObservationSource, a cache-shaped module, or any of diagnose's own write-path modules, and that neither ProductionSimulationDependencies nor ProductionSimulationCall exposes a field an observation source or a cache could ever travel through. Together these foreclose the named implementation entirely for the source this task actually wrote; no test asserts a negative over code outside this task's own files, since that reads outside a task's own totality.
