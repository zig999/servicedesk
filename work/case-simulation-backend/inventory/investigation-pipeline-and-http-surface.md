---
title: Investigation pipeline, judgment/consolidation ports, and diagnose HTTP surface
summary: The one pipeline (run-diagnosis.ts) and its composition roots, ports/adapters and HTTP wiring that simulate-case, simulate-hypothesis and the diagnose release gate must extend rather than duplicate.
sources:
  - work/case-simulation-backend/intake/scope.md
area:
  - src/src/investigation
  - src/src/http
  - src/src/http/dto
  - src/src/factories
  - src/src/errors
  - src/src/config
  - src/src/case
modules:
  - name: run-diagnosis
    path: src/src/investigation/run-diagnosis.ts
    role: touched
  - name: evidence-collection-stage
    path: src/src/investigation/evidence-collection-stage.ts
    role: touched
  - name: judgment-stage
    path: src/src/investigation/judgment-stage.ts
    role: touched
  - name: hypothesis-evaluator-port
    path: src/src/investigation/hypothesis-evaluator.port.ts
    role: touched
  - name: assessment-consolidator-port
    path: src/src/investigation/assessment-consolidator.port.ts
    role: touched
  - name: anthropic-hypothesis-evaluator-adapter
    path: src/src/investigation/anthropic-hypothesis-evaluator.adapter.ts
    role: touched
  - name: anthropic-assessment-consolidator-adapter
    path: src/src/investigation/anthropic-assessment-consolidator.adapter.ts
    role: touched
  - name: fake-hypothesis-evaluator-adapter
    path: src/src/investigation/fake-hypothesis-evaluator.adapter.ts
    role: touched
  - name: fake-assessment-consolidator-adapter
    path: src/src/investigation/fake-assessment-consolidator.adapter.ts
    role: touched
  - name: evidence-value-object
    path: src/src/investigation/evidence.ts
    role: touched
  - name: evaluation-value-object
    path: src/src/investigation/evaluation.ts
    role: touched
  - name: cost-value-object
    path: src/src/investigation/cost.ts
    role: depends-on
  - name: durations-value-object
    path: src/src/investigation/durations.ts
    role: depends-on
  - name: resolve-and-narrow-input
    path: src/src/investigation/resolve-and-narrow-input.ts
    role: depends-on
  - name: judgment-stage-citation-validation
    path: src/src/investigation/citation-validation.ts
    role: depends-on
  - name: diagnose-controller
    path: src/src/http/diagnose.controller.ts
    role: touched
  - name: diagnose-routes
    path: src/src/http/diagnose.routes.ts
    role: touched
  - name: diagnose-dto
    path: src/src/http/dto/diagnose.dto.ts
    role: depends-on
  - name: test-connector-dto
    path: src/src/http/dto/test-connector.dto.ts
    role: adjacent
  - name: build-app
    path: src/src/http/build-app.ts
    role: touched
  - name: build-app-factory
    path: src/src/factories/build-app.factory.ts
    role: touched
  - name: diagnose-server-factory
    path: src/src/factories/diagnose-server.factory.ts
    role: touched
  - name: production-diagnose-factory
    path: src/src/factories/production-diagnose.factory.ts
    role: touched
  - name: diagnose-factory
    path: src/src/factories/diagnose.factory.ts
    role: depends-on
  - name: status-map
    path: src/src/errors/status-map.ts
    role: touched
  - name: case-version-not-draft-at-release-error
    path: src/src/errors/case-version-not-draft-at-release.error.ts
    role: adjacent
  - name: case-query-service
    path: src/src/case/case-query.service.ts
    role: depends-on
  - name: case-domain-model
    path: src/src/case/case.ts
    role: depends-on
  - name: env-config
    path: src/src/config/env.ts
    role: touched
conventions:
  - statement: "A stage never reads the system clock or measures duration/cost internally — every caller-owned timing/counting value arrives as an explicit parameter, and no stage today reports elapsed_ms or usage of its own."
    seen_at: src/src/investigation/run-diagnosis.ts
  - statement: "A pipeline stage's own options type is assembled by a private helper (collectEvidenceOptions, judgeHypothesesOptions) rather than inlined at the call site, keeping runDiagnosis's own body within the project's line/parameter bounds."
    seen_at: src/src/investigation/run-diagnosis.ts
  - statement: "A port's evaluate()/consolidate() call never throws for a domain outcome — every ending, including a provider failure, becomes a typed data value (inconclusive/judgment-failure) rather than a rejection."
    seen_at: src/src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - statement: "An Anthropic-backed adapter reads its model as a required constructor parameter (never a literal or invented default) and falls back to process.env.ANTHROPIC_API_KEY only when no apiKey is given."
    seen_at: src/src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - statement: "A fake adapter behind a published port is driven entirely by test-seeded fixtures, keyed by whatever scalar (or serialized bundle) distinguishes one call, and throws a plain Error for an unseeded key rather than inventing an answer."
    seen_at: src/src/investigation/fake-hypothesis-evaluator.adapter.ts
  - statement: "A production composition-root factory (createProductionDiagnoseRunner) fixes the concrete Anthropic adapters and the deadline budget, delegates everything else unchanged to the generic per-context factory (createDiagnoseRunner), and constructs each adapter exactly once per call to the outer factory, not per request."
    seen_at: src/src/factories/production-diagnose.factory.ts
  - statement: "A generic per-context factory (createDiagnoseRunner) accepts every adapter/port as a caller-supplied dependency and returns a closure that still takes only the per-call fields (DiagnoseCall = RunDiagnosisOptions minus the wired fields)."
    seen_at: src/src/factories/diagnose.factory.ts
  - statement: "A controller does no business decision of its own: it reads the pinned case through ICaseQuery, assembles the one composition call's still-missing fields, and returns the pipeline's own answer unchanged; it constructs no dependency itself (ARC-01/ARC-02)."
    seen_at: src/src/http/diagnose.controller.ts
  - statement: "A route module validates the raw body with a zod schema before the controller is reached (400 VALIDATION_ERROR naming every issue), sits under the /v1 prefix, and is registered as a Fastify plugin closed over its own ...ControllerDependencies."
    seen_at: src/src/http/diagnose.routes.ts
  - statement: "A wire DTO is a zod schema plus its own z.infer type, named for the use case, spelled independently of the domain type it mirrors so the domain stays free of transport concerns."
    seen_at: src/src/http/dto/diagnose.dto.ts
  - statement: "Adding a route means adding it to BuildAppDependencies, to the routePlugins() list, and to buildAppDependencies()'s composition — never a new ad hoc call site outside that loop."
    seen_at: src/src/http/build-app.ts
  - statement: "A domain error refusing an operation because of the named resource's current state is a small, focused class (name, constructor args, message) mapped once by class in status-map.ts (STATUS_BY_ERROR_CLASS) — never a status chosen inline in a handler."
    seen_at: src/src/errors/status-map.ts
  - statement: "A refusal over case-version state gets its own error class rather than reusing CaseVersionNotDraftError, because the message and doc comment state a specific business reason that reuse would misstate."
    seen_at: src/src/errors/case-version-not-draft-at-release.error.ts
  - statement: "Every configuration value the process needs is read once, at startup, through envSchema (zod) — no value is read from process.env a second place."
    seen_at: src/src/config/env.ts
must_not_duplicate:
  - what: "buildSubject (subject assembly/validation, at-least-one-attribute invariant) — the one place a subject is built and validated."
    at: src/src/investigation/subject.ts
  - what: "evidenceByHypothesisOf (matches each required hypothesis's own collected evidence by concept) — the shared convention judgment-stage.ts and resolve-and-narrow-input.ts both rely on."
    at: src/src/investigation/run-diagnosis.ts
  - what: "collectEvidence and judgeHypotheses themselves, and their COLLECTION_STAGE_BUDGET_MS/JUDGMENT_STAGE_BUDGET_MS intersection convention — simulate-hypothesis narrows the input, not the stage logic."
    at: src/src/investigation/evidence-collection-stage.ts and src/src/investigation/judgment-stage.ts
  - what: "resolveAndNarrow / draftAssessment — reused unchanged by diagnose's own composition; simulate-case's response fields (resolved, assessment) come from calling the same stages, not reimplementing outcome/referral logic."
    at: src/src/investigation/resolve-and-narrow-input.ts and src/src/investigation/draft-assessment-text.ts
  - what: "createDiagnoseRunner's generic, per-context wiring pattern (adapters as caller-supplied dependencies, DiagnoseCall = RunDiagnosisOptions minus wired fields) — the no-cache simulation factory should mirror this shape, not production-diagnose.factory.ts's Anthropic-fixing shape, for its own observation-source composition."
    at: src/src/factories/diagnose.factory.ts
  - what: "STATUS_BY_ERROR_CLASS — the one table every domain error's transport status is added to; a new NotReleased-shaped error is registered here, never given an inline status in a controller or route."
    at: src/src/errors/status-map.ts
  - what: "The routePlugins()/BuildAppDependencies/buildAppDependencies() three-part registration convention — the two new routes are added the same way the prior nineteen were, never a standalone app.register() call."
    at: src/src/http/build-app.ts and src/src/factories/build-app.factory.ts
  - what: "The diagnoseRequestSchema subject/case-ref zod shapes — simulate-case's and simulate-hypothesis's own request DTOs should mirror these, the same way test-connector.dto.ts's subjectSchema already mirrors diagnose.dto.ts's rather than redeclaring the shape independently."
    at: src/src/http/dto/diagnose.dto.ts
risks:
  - risk: "run-diagnosis.ts's own RunDiagnosisOptions and its private helpers (collectEvidenceOptions, judgeHypothesesOptions, buildInvestigationOptions, evidenceByHypothesisOf) are shaped for the full diagnose pipeline including buildInvestigation/writeWithinDeadline; extracting stages 1–4 into a shared function changes this file's own exported surface and every one of its current callers must still compile and behave unchanged."
    consumers:
      - src/src/factories/diagnose.factory.ts
      - src/src/factories/production-diagnose.factory.ts
  - risk: "IHypothesisEvaluator.evaluate() and IAssessmentConsolidator.consolidate() changing their return shape to carry usage/elapsed_ms/prompt breaks every current implementer and caller of the port, not just the two Anthropic adapters."
    consumers:
      - src/src/investigation/judgment-stage.ts
      - src/src/investigation/anthropic-hypothesis-evaluator.adapter.ts
      - src/src/investigation/anthropic-assessment-consolidator.adapter.ts
      - src/src/investigation/fake-hypothesis-evaluator.adapter.ts
      - src/src/investigation/fake-assessment-consolidator.adapter.ts
  - risk: "Evidence gaining a required elapsed_ms field changes evidence-collection-stage.ts's own evidenceOf()/EvidenceEnding assembly and every place that constructs or reads an Evidence literal, including test fixtures."
    consumers:
      - src/src/investigation/evidence-collection-stage.ts
      - src/src/investigation/judgment-stage.ts (toEvidenceItems reads Evidence fields)
      - src/src/investigation/resolve-and-narrow-input.ts
  - risk: "diagnose.controller.ts's UNMEASURED_COST/UNMEASURED_DURATIONS placeholders are removed in favor of real accumulation; anything asserting the placeholder shape or values breaks."
    consumers:
      - src/src/http/diagnose.controller.ts
  - risk: "The release gate on diagnose (rejecting a draft version) changes handleDiagnoseRequest's behavior for any caller currently able to diagnose a draft version, and status-map.ts must carry the new error class or diagnose.controller.ts's error falls through to the unmapped 500 path."
    consumers:
      - src/src/http/diagnose.controller.ts
      - src/src/errors/status-map.ts
      - src/src/http/error-handler.middleware.ts
  - risk: "A no-cache simulation factory built parallel to production-diagnose.factory.ts, if it reuses createDiagnoseRunner's DiagnoseCall/RunDiagnosisOptions shape without adjustment, inherits every field runDiagnosis's shared pipeline function now requires — including store/persistence-shaped fields simulate-case and simulate-hypothesis must not actually invoke."
    consumers:
      - src/src/factories/diagnose.factory.ts
      - src/src/factories/production-diagnose.factory.ts
  - risk: "build-app.ts's BuildAppDependencies and build-app.factory.ts's ComposedResources/buildAppDependencies() are both exhaustive, hand-maintained lists; adding simulate-case and simulate-hypothesis without updating all three (routePlugins, BuildAppDependencies, buildAppDependencies) leaves a route unregistered or a type error, and the diagnose-server.factory.ts composition root is the one place a new simulation runner and its dependencies must be wired for a real process."
    consumers:
      - src/src/http/build-app.ts
      - src/src/factories/build-app.factory.ts
      - src/src/factories/diagnose-server.factory.ts
---

## What it is

The investigation pipeline that `diagnose` runs end to end, its published judgment/consolidation ports and their Anthropic/fake adapters, the HTTP surface (routes, controller, DTOs) exposing `diagnose`, and the composition-root factories (`diagnose.factory.ts`, `production-diagnose.factory.ts`, `build-app.factory.ts`, `diagnose-server.factory.ts`) that wire all of it for a real process.
`run-diagnosis.ts` is the one function the scope's stage extraction must change: `buildSubject → collectEvidence → judgeHypotheses → resolveAndNarrow → draftAssessment` are stages 1–4 to pull into a shared record-returning function, leaving `buildInvestigation`/`writeWithinDeadline` as `diagnose`'s own addition.
`IHypothesisEvaluator` and `IAssessmentConsolidator` are the two ports the scope must widen to carry `usage`, `elapsed_ms` and `prompt`, together with their two Anthropic adapters (which today discard `message.usage` and measure no latency) and two fakes (which return only the seeded outcome/text).
`evidence-collection-stage.ts`'s `evidenceOf`/`EvidenceEnding` machinery is where a per-concept `elapsed_ms` must be added to every `Evidence` this stage assembles.
`diagnose.controller.ts` writes hard-coded `UNMEASURED_COST`/`UNMEASURED_DURATIONS` today and holds no case-state check — both the release gate and the switch to real cost/durations land here.
`production-diagnose.factory.ts` is the one existing example of a no-cache-shaped, adapter-fixing composition the scope's new simulation factory must sit parallel to.
`build-app.ts`/`build-app.factory.ts`/`diagnose-server.factory.ts` are the three files that must all learn about two new routes for `simulate-case`/`simulate-hypothesis` to actually be reachable.

## Notes

No `/simulate` route, no `IObservationSource` cache layer, no `usage`/`elapsed_ms` field and no `NotReleased`-shaped error class exist anywhere in this tree today — every one of them is new.
`config/env.ts` declares no field this scope's construction section names as newly needed; the existing `EVALUATOR_MODEL`/`CONSOLIDATOR_MODEL`/`POOL_SIZE`/`DEFAULT_CONSOLIDATION_REGISTER`/`PROMPT_VERSION` already cover what a simulation composition would also need to read.
`case-query.service.ts`'s `readCase` already runs full structural/coherence validation regardless of a version's state and raises no error for a `draft` version today — it is the natural reuse point for both `simulate-case`'s and `simulate-hypothesis`'s own case reads, since the scope states no new state-based error applies to simulation.
`status-map.ts`'s three specification-fixed status codes (404/404/422) show the one place a status the specification does not decide would wrongly duplicate a fact the business owns; the new release-gate error's status is this project's own engineering decision and belongs in this same table, following its documented convention.
