---
title: 'Review of live-engine-mvp: real LLM adapters, fixture, composition and HTTP surface'
summary: 'Four passes over the nine tasks and forty-three files delivering the live diagnose engine: coverage,
  specification conformance, standard conformance, and failures (not run — the captured build/suite passed
  clean).'
reviewed:
- src/config/env.ts
- src/errors/invalid-environment.error.ts
- src/factories/diagnose-server.factory.ts
- src/factories/production-diagnose.factory.ts
- src/fixtures/capability/capability.json
- src/fixtures/case/intermittent-connection-outage/1.json
- src/fixtures/glossary/action.json
- src/fixtures/glossary/concept.json
- src/fixtures/glossary/outcome.json
- src/fixtures/glossary/recipient.json
- src/fixtures/glossary/subject-attribute.json
- src/fixtures/glossary/subject-type.json
- src/fixtures/observations.json
- src/http/build-app.ts
- src/http/diagnose.controller.ts
- src/http/diagnose.routes.ts
- src/http/dto/diagnose.dto.ts
- src/http/error-handler.middleware.ts
- src/index.ts
- src/investigation/anthropic-assessment-consolidator.adapter.ts
- src/investigation/anthropic-hypothesis-evaluator.adapter.ts
- src/investigation/fake-hypothesis-evaluator.adapter.ts
- src/investigation/hypothesis-evaluator.port.ts
- src/investigation/judgment-stage.ts
- src/__tests__/integration/factories/diagnose-server.factory.spec.ts
- src/__tests__/integration/factories/production-diagnose.factory.spec.ts
- src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
- src/__tests__/integration/http/diagnose-e2e.spec.ts
- src/__tests__/unit/config/env.spec.ts
- src/__tests__/unit/dependency-manifest.spec.ts
- src/__tests__/unit/factories/production-diagnose.factory.spec.ts
- src/__tests__/unit/fixtures/case-fixture-glossary-and-capability-coverage.spec.ts
- src/__tests__/unit/fixtures/case-fixture-observations.spec.ts
- src/__tests__/unit/fixtures/case-fixture-shape.spec.ts
- src/__tests__/unit/http/build-app.spec.ts
- src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
- src/__tests__/unit/investigation/anthropic-hypothesis-evaluator-modules.spec.ts
- src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
- src/__tests__/unit/investigation/assessment-consolidator-modules.spec.ts
- src/__tests__/unit/investigation/hypothesis-evaluator-modules.spec.ts
- src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
- src/__tests__/unit/investigation/judgment-stage.spec.ts
- src/__tests__/unit/investigation/observation-source-modules.spec.ts
tasks:
- task/hypothesis-judgment-adapter/declare-runtime-dependencies
- task/hypothesis-judgment-adapter/widen-evaluator-port-with-case-context
- task/hypothesis-judgment-adapter/anthropic-hypothesis-evaluator
- task/assessment-consolidation-adapter/anthropic-assessment-consolidator
- task/case-fixture/author-diagnose-fixture-case
- task/diagnose-composition-root/remove-withdrawn-dedup-layer
- task/diagnose-composition-root/wire-diagnose-runner
- task/http-surface/diagnose-http-endpoint
- task/http-surface/end-to-end-diagnose-proof
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/live-engine-mvp-review) passed every step clean, so there was no failure
    to diagnose
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
coverage:
- criterion: package.json's dependencies list @anthropic-ai/sdk, matching STK-11's authorization to call
    the model only through it.
  state: covered
  tests:
  - file: src/__tests__/unit/dependency-manifest.spec.ts
    name: the dependency manifest declares @anthropic-ai/sdk as a dependency
  - file: src/__tests__/unit/dependency-manifest.spec.ts
    name: the dependency manifest pins @anthropic-ai/sdk to ^0.32.0
- criterion: package.json's dependencies list fastify, matching STK-03's authorization as the only HTTP
    framework this standard permits.
  state: covered
  tests:
  - file: src/__tests__/unit/dependency-manifest.spec.ts
    name: the dependency manifest declares fastify as a dependency
  - file: src/__tests__/unit/dependency-manifest.spec.ts
    name: the dependency manifest pins fastify to ^5.0.0
- criterion: The two additions are the only new dependencies; no database driver or ORM package is introduced
    (constraints/the-mvp-persists-to-no-database).
  state: covered
  tests:
  - file: src/__tests__/unit/dependency-manifest.spec.ts
    name: the dependency manifest's dependencies hold exactly @anthropic-ai/sdk, fastify and zod
  - file: src/__tests__/unit/dependency-manifest.spec.ts
    name: the dependency manifest declares no database driver
- criterion: npm install succeeds and the existing typecheck, lint and test steps still pass with both
    declared.
  state: uncovered
  why: Nothing in the given test set exercises npm install, the typecheck step or the lint step; a vitest
    test cannot assert its own suite's pass/fail as a criterion of itself, so this is a build/CI-level
    fact none of the listed tests reaches.
- criterion: IHypothesisEvaluator.evaluate() declares parameters for the hypothesis's criterion, its own
    evidence, and the pinned case's title and when_to_use.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
    name: answers the confirmed verdict with exactly the citations seeded for it
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: passes the same pinned case's own title and when_to_use, grouped as CaseContext, to every hypothesis
      judged in one judgeHypotheses() call — never a different context per hypothesis
  why: Coverage rests on tests that pass a three-argument evaluate() call and would fail to compile or
    to match content if the signature narrowed; no test independently inspects the interface declaration
    itself.
- criterion: judgment-stage.ts's first evaluate() call and its retry both pass the same case's title and
    when_to_use the judgeHypotheses() call itself was given, unchanged.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: passes the pinned case's own title and when_to_use, unchanged, to both the first evaluate()
      call and the retry it forces
- criterion: FakeHypothesisEvaluator and every existing test constructing an evaluate() call compile and
    run against the widened signature, with judgment-stage.spec.ts and hypothesis-evaluator.port.spec.ts
    still passing.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
    name: answers the confirmed verdict with exactly the citations seeded for it
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: answers exactly one evaluation per required hypothesis, in the case's declared order, none omitted
      or duplicated
  why: Every test in both files calls evaluate() (directly or through judgeHypotheses) with the widened
    three-argument shape; each would fail to compile or run against a narrower signature.
- criterion: The adapter's prompt-assembly step is a pure function of the hypothesis's criterion, its
    evidence, and the case's title and when_to_use — the same four inputs produce byte-identical prompt
    content across two calls.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: sends byte-identical prompt content across two calls carrying the same criterion, evidence and
      case context
- criterion: The provider request grants the model no tools.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: declares no tools field on the provider request
  - file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
    name: asks the model with no tools field in the request
  why: This exact sentence is stated identically by both the hypothesis-evaluator and the assessment-consolidator
    tasks; one entry answers for both, each proven by its own adapter's own test.
- criterion: The criterion, the evidence, and the case's title and when_to_use sit inside one delimited
    data block; no other hypothesis's criterion and no subject attribute-value enters the prompt.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: carries the given criterion, evidence observation, case title and case when_to_use inside one
      delimited block
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: escapes reserved XML characters in the criterion so the closed data block cannot be broken out
      of
  why: The block-placement test uses toContain, proving the four given values appear but not that nothing
    else does; exclusion of another hypothesis's criterion and subject attribute-values rests only on
    evaluate()'s fixed parameter shape, with no adversarial test constructing a call that could carry
    them.
- criterion: A confirmed or refuted answer is returned with at least one citation; an answer the model
    does not ground in the given evidence is returned as inconclusive with a reason — the adapter never
    throws for any of the three verdicts and never infers beyond what the evidence supports.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: parses a well-formed confirmed answer into the confirmed verdict with its citations
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    name: answers inconclusive with reason no-data, citing exactly the evidence items whose result is
      not ok
- criterion: The adapter imports @anthropic-ai/sdk for the call and no other HTTP client library.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator-modules.spec.ts
    name: imports exactly one external package — @anthropic-ai/sdk — and no other HTTP client library
  - file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
    name: imports @anthropic-ai/sdk for the call
  - file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
    name: imports no other HTTP client library beside @anthropic-ai/sdk
  why: This exact sentence is stated identically by both the hypothesis-evaluator and the assessment-consolidator
    tasks; one entry answers for both, each proven by its own adapter's own tests.
- criterion: The adapter's prompt-assembly step is a pure function of the given evaluations, evidence
    and consolidation register — the same three inputs produce byte-identical prompt content across two
    calls.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
    name: produces byte-identical prompt content across two calls given the same evaluations, evidence
      and register, even passed as freshly-constructed copies
- criterion: The evaluations, the evidence and the register sit inside one delimited data block; no hypothesis's
    own criterion and no case when_to_use enters the prompt.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
    name: wraps exactly the given evaluations, evidence and register in one <CONSOLIDATION_DATA> block
  why: The data-block test is an exact-string match against JSON.stringify of exactly the three permitted
    fields, and consolidate()'s own signature makes a fourth field structurally unreachable.
- criterion: consolidate() returns the text alone — never an outcome, a referral or a determining hypothesis,
    none of which this call is given enough to decide.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
    name: returns exactly the model's own text content, trimmed of surrounding whitespace
- criterion: The case document validates without a coherence violation when read through the knowledge
    context's own case-reading path against the fixture's own glossary and capability data.
  state: covered
  tests:
  - file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
    name: reads the fixture case whole, with no coherence violation, through the real case-query wiring
      over the fixture's own glossary and capability data
- criterion: The case declares at least one hypothesis, each with a non-empty criterion stating exactly
    one falsifiable claim, at least one collected concept, and a resolution pairing one outcome with one
    referral.
  state: covered
  tests:
  - file: src/__tests__/unit/fixtures/case-fixture-shape.spec.ts
    name: declares at least one hypothesis, each with a non-empty single-sentence criterion, at least
      one collected concept, and a resolution pairing one outcome with one referral
  why: The one-falsifiable-claim requirement is exercised through a single-sentence structural regex;
    this is a mechanical proxy, not a semantic check of falsifiability, and the conformance pass separately
    found this proxy narrower than the specification's own permitted one-to-three-sentence range.
- criterion: No two of the case's own hypotheses share a name, and the case's declared order is stated
    as its own precedence.
  state: covered
  tests:
  - file: src/__tests__/unit/fixtures/case-fixture-shape.spec.ts
    name: names no two of its own hypotheses alike
  - file: src/__tests__/unit/fixtures/case-fixture-shape.spec.ts
    name: resolves to its first-declared hypothesis's own resolution when every hypothesis is confirmed
      at once, proving the fixture's declared array order is its own precedence
- criterion: Every subject type, concept, outcome, action and recipient the case and its hypotheses name
    exists in the fixture's own glossary vocabulary files, and the glossary's outcome vocabulary also
    carries the two non-conclusion outcomes.
  state: covered
  tests:
  - file: src/__tests__/unit/fixtures/case-fixture-glossary-and-capability-coverage.spec.ts
    name: names a subject type that exists in the fixture glossary's subject-type vocabulary
  - file: src/__tests__/unit/fixtures/case-fixture-glossary-and-capability-coverage.spec.ts
    name: carries both non-conclusion outcomes in its own outcome vocabulary file, ahead of any case reading
- criterion: Every concept the case's hypotheses collect accepts the case's own declared subject type
    and has a registered read-only capability declaring an output schema and a timeout; at least one concept's
    registration states an explicit ttl.
  state: covered
  tests:
  - file: src/__tests__/unit/fixtures/case-fixture-glossary-and-capability-coverage.spec.ts
    name: answers every concept the fixture hypotheses collect with a registered read-only capability
      declaring an output schema and an integer timeout
  - file: src/__tests__/unit/fixtures/case-fixture-glossary-and-capability-coverage.spec.ts
    name: states an explicit ttl on at least one collected concept's registration in the fixture glossary
- criterion: The case's fallback declares its own resolution, distinct from any hypothesis's own.
  state: covered
  tests:
  - file: src/__tests__/unit/fixtures/case-fixture-shape.spec.ts
    name: declares a fallback resolution distinct from every one of its hypotheses' own
  why: Covered as written, but the conformance pass separately found this asserted distinctness is not
    itself a specification requirement — see the conformance findings.
- criterion: The case declares an explicit consolidation register (formal or plain) rather than leaving
    it undeclared.
  state: covered
  tests:
  - file: src/__tests__/unit/fixtures/case-fixture-shape.spec.ts
    name: declares an explicit consolidation register rather than leaving it undeclared
- criterion: The case document is stored as one plain JSON document at <directory>/<slug>/1.json, its
    slug equal to the file's own name.
  state: covered
  tests:
  - file: src/__tests__/unit/fixtures/case-fixture-shape.spec.ts
    name: is stored as exactly one file under its own slug directory, named 1.json
  - file: src/__tests__/unit/fixtures/case-fixture-shape.spec.ts
    name: declares a slug equal to the name of the directory that holds it
- criterion: For every concept the case's hypotheses collect, a canned observation outcome exists, usable
    to seed a stand-in observation source so the whole pipeline can run against this case without a live
    corporate-records connection.
  state: covered
  tests:
  - file: src/__tests__/unit/fixtures/case-fixture-observations.spec.ts
    name: carries a canned observation outcome, one of the four evidence-result endings, for every concept
      the fixture case's hypotheses collect
  - file: src/__tests__/unit/fixtures/case-fixture-observations.spec.ts
    name: seeds the real stand-in observation source with the canned outcome for every collected concept
      and reads each one back unchanged through observe-concept
- criterion: diagnose.ts, idempotency-key.ts, idempotency-lease-store.ts, idempotency-resolution.ts, diagnosis-run-registry.ts
    and diagnose-entry-point.factory.ts no longer exist in the tree.
  state: uncovered
  why: This is a tree-shape fact; nothing in the given test set performs a filesystem existence check
    against these six paths.
- criterion: Their own five spec files (diagnose.spec.ts, idempotency-key.spec.ts, idempotency-resolution.spec.ts,
    idempotency-lease-store.spec.ts, diagnosis-run-registry.spec.ts) no longer exist.
  state: uncovered
  why: No test in the given set checks for the absence of these five spec files.
- criterion: No remaining file imports any of the six removed modules, and the project still type-checks
    and its existing suite still passes.
  state: partial
  tests:
  - file: src/__tests__/unit/factories/production-diagnose.factory.spec.ts
    name: imports nothing from diagnose.ts, idempotency-key.ts, idempotency-lease-store.ts, idempotency-resolution.ts,
      diagnosis-run-registry.ts or diagnose-entry-point.factory.ts
  why: The cited test checks only production-diagnose.factory.ts's own import specifiers, not every remaining
    file in the tree; neither the typecheck outcome nor the whole-suite pass is asserted by any test —
    both are captured directly by this review's own run instead.
- criterion: One factory function assembles createDiagnoseRunner's own DiagnoseDependencies with the real
    Anthropic-backed judgment and consolidation adapters always wired, and the caller's own observation
    source, pool size, data directories and default consolidation register passed through unchanged.
  state: covered
  tests:
  - file: src/__tests__/unit/factories/production-diagnose.factory.spec.ts
    name: passes the caller-given observation source, pool size, data directories and default consolidation
      register through to the wired dependencies, unchanged
  - file: src/__tests__/unit/factories/production-diagnose.factory.spec.ts
    name: always wires a real AnthropicHypothesisEvaluator and AnthropicAssessmentConsolidator, never
      a caller-substituted implementation
- criterion: Calling the assembled runner runs collection, judgment, consolidation and writing directly
    through createDiagnoseRunner/runDiagnosis; it imports nothing from diagnose.ts, idempotency-key.ts,
    idempotency-lease-store.ts, idempotency-resolution.ts, diagnosis-run-registry.ts or diagnose-entry-point.factory.ts.
  state: covered
  tests:
  - file: src/__tests__/unit/factories/production-diagnose.factory.spec.ts
    name: imports nothing from diagnose.ts, idempotency-key.ts, idempotency-lease-store.ts, idempotency-resolution.ts,
      diagnosis-run-registry.ts or diagnose-entry-point.factory.ts
  - file: src/__tests__/integration/factories/production-diagnose.factory.spec.ts
    name: reaches the mocked Anthropic client when a call runs, confirming the real adapters are wired
      rather than a swappable fake
- criterion: Two calls given the same case, subject, narrative and requester each run the whole pipeline
    again and are each written as their own investigation; neither call returns, reuses or joins the other's
    result.
  state: covered
  tests:
  - file: src/__tests__/integration/factories/production-diagnose.factory.spec.ts
    name: writes two independent investigation records for two calls sharing the same case, subject, narrative
      and requester
  - file: src/__tests__/integration/factories/production-diagnose.factory.spec.ts
    name: collects evidence again for the second of two calls with identical inputs, rather than reusing
      the first call's own result
- criterion: The factory computes the request's absolute deadline as its own start instant plus the specification's
    declared total budget, and propagates that same (now, deadline) pair to the wired runner, never leaving
    a stage to read the system clock itself.
  state: partial
  tests:
  - file: src/__tests__/unit/factories/production-diagnose.factory.spec.ts
    name: computes the deadline as its own start instant plus the specification-declared twenty-second
      budget, and propagates that exact pair to the wired runner
  - file: src/__tests__/unit/factories/production-diagnose.factory.spec.ts
    name: stamps a fresh (now, deadline) pair on a second call, never the first call's own pair
  why: The deadline's computation and propagation to the (mocked) wired runner are asserted directly,
    but nothing proves no stage downstream of that boundary independently reads the system clock instead
    — the mocked boundary hides what createDiagnoseRunner itself does internally.
- criterion: The factory passes the caller-given requester straight through to the wired observation source
    on every call it makes, substituting none of its own.
  state: covered
  tests:
  - file: src/__tests__/integration/factories/production-diagnose.factory.spec.ts
    name: passes the given requester straight through to the observation source, substituting none of
      its own
- criterion: The factory module, and everything it wires, imports no database client or driver — every
    store behind it is the existing file-backed one.
  state: covered
  tests:
  - file: src/__tests__/unit/factories/production-diagnose.factory.spec.ts
    name: imports no database client or driver
  - file: src/__tests__/unit/dependency-manifest.spec.ts
    name: the dependency manifest declares no database driver
- criterion: A request whose body names an existing case by slug and version, a subject type, a subject
    attribute-value set, a narrative and a requester returns, in the same HTTP response, the assessment
    the diagnose call produced.
  state: covered
  tests:
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: answers 200 with the assessment the diagnose call produced, for a request naming an existing
      case, subject, narrative and requester
  - file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
    name: answers 200 with exactly the fixture case's own declared fallback outcome, referral and drafted
      text — no verdict, citation, evidence item or determining_hypothesis — for a request naming the
      seeded canonical subject
- criterion: The response body carries outcome, referral and text — and determining_hypothesis where the
    resolved outcome names one — and never a verdict, a citation or an evidence item.
  state: covered
  tests:
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: carries exactly outcome, referral, determining_hypothesis and text when the resolved outcome
      names a determining hypothesis
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: omits determining_hypothesis and carries no verdict, citation or evidence field when the resolved
      outcome names none
- criterion: Two requests naming the same case, subject, narrative and requester each receive their own
    freshly run assessment; the endpoint returns no cached, joined or reused result.
  state: covered
  tests:
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: answers each of two requests naming the same case, subject, narrative and requester with that
      call's own resolved assessment, never a cached or joined value
  - file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
    name: writes two independent investigation records for two requests naming the same case, subject,
      narrative and requester
- criterion: A request whose ticket reference is absent still receives an assessment, and a request that
    supplies one is accepted the same way.
  state: covered
  tests:
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: supplies the empty string as ticket_ref to the diagnose call when the request names none
  - file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
    name: answers 200 when the request supplies no ticket_ref
- criterion: The endpoint reads no authentication or authorization header; the requester named in the
    request body is exactly the requester the diagnose call runs under.
  state: covered
  tests:
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: answers 200 for a request carrying no headers at all, reading no authentication or authorization
      header
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: runs the diagnose call under exactly the body's own requester, even when the request carries
      an authorization header naming a different identity
- criterion: HTTP is served through Fastify and no second HTTP framework.
  state: covered
  tests:
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: imports fastify, and no second HTTP or router framework, across build-app, the route, the controller,
      the error handler and the DTO
- criterion: The test sends one HTTP request to the diagnose endpoint naming the fixture case, a subject,
    a narrative and a requester, and asserts the HTTP response carries the assessment.
  state: covered
  tests:
  - file: src/__tests__/integration/http/diagnose-e2e.spec.ts
    name: writes an investigation to the file-backed store for the request, readable back through createInvestigationStore,
      before asserting anything about the HTTP response — and the response then carries the fixture case's
      own resolved fallback assessment
- criterion: The test substitutes fakes behind the published hypothesis-evaluator and assessment-consolidator
    ports, so the run makes no call to the Anthropic API.
  state: covered
  tests:
  - file: src/__tests__/integration/http/diagnose-e2e.spec.ts
    name: imports @anthropic-ai/sdk nowhere across every file this test's own composition reaches, so
      the run above never made or could make a call to the Anthropic API
- criterion: Running the test requires no ANTHROPIC_API_KEY or other live network credential to be present.
  state: covered
  tests:
  - file: src/__tests__/integration/http/diagnose-e2e.spec.ts
    name: imports @anthropic-ai/sdk nowhere across every file this test's own composition reaches, so
      the run above never made or could make a call to the Anthropic API
  why: The suite's beforeEach deletes ANTHROPIC_API_KEY for the test's duration as setup, not assertion;
    the import-sweep test is what would actually fail if a live credential became necessary.
- criterion: The test asserts an investigation was written for the request — read back from the file-backed
    investigation store — before it asserts anything about the HTTP response.
  state: covered
  tests:
  - file: src/__tests__/integration/http/diagnose-e2e.spec.ts
    name: writes an investigation to the file-backed store for the request, readable back through createInvestigationStore,
      before asserting anything about the HTTP response — and the response then carries the fixture case's
      own resolved fallback assessment
findings:
- pass: standard
  file: src/__tests__/unit/factories/production-diagnose.factory.spec.ts
  where: the module mock declared before the imports, and its own header comment
  cites: TST-03
  evidence: 'vi.mock(''../../../factories/diagnose.factory.js'', () => ({ createDiagnoseRunner: createDiagnoseRunnerMock
    }));'
  cost: createDiagnoseRunner composes the whole diagnose pipeline — hypothesis judgment, consolidation,
    evidence collection — which is business logic, not a store, a network call, a filesystem or an external
    service; the file's own header even names it "the already-delivered pipeline it wires" while calling
    the mock "the boundary this factory composes against." With that pipeline replaced wholesale, this
    suite can pass even if createDiagnoseRunner's own real behavior breaks, since nothing here ever calls
    the real implementation.
  correction: drive this suite's wiring assertions off the real createDiagnoseRunner (as the sibling integration
    spec already does), or restrict the module mock to the actual external boundary (the Anthropic client)
    rather than the internal pipeline function.
- pass: standard
  file: src/__tests__/unit/investigation/assessment-consolidator-modules.spec.ts
  where: importSpecifiersOf, isStandardLibrary, isForbiddenPackage, offendersAmong and the FORBIDDEN_PACKAGES
    list
  cites: MNT-03
  evidence: "function importSpecifiersOf(source: string): string[] {\n  return [...source.matchAll(IMPORT_SPECIFIER_PATTERN)].map((match)\
    \ => match[1]);\n}"
  cost: This exact helper set is retyped verbatim in hypothesis-evaluator-modules.spec.ts and observation-source-modules.spec.ts
    too; the file's own header even says it is "mirroring hypothesis-evaluator-modules.spec.ts's own own-file-list
    pattern" rather than sharing it. Adding a newly forbidden driver has to be repeated in every copy,
    and a copy a future editor misses keeps auditing against a stale rule set while looking like it still
    runs the same check.
  correction: factor the import-audit machinery into one shared test-support module the three spec files
    call.
- pass: standard
  file: src/config/env.ts
  where: envSchema, the whole set of boundary values this process parses at startup
  cites: EDG-06
  evidence: "const envSchema = z.object({\n  PORT: z.coerce.number().int().positive().default(3000),\n\
    \  CASE_DATA_DIRECTORY: z.string().min(1),\n  ...\n  PROMPT_VERSION: z.string().min(1),\n});"
  cost: No field here declares a configured request-body size ceiling, and nothing in build-app.ts passes
    a bodyLimit to Fastify() either, so the diagnose endpoint runs under whatever default the framework
    happens to pick rather than a limit this project chose and can point to.
  correction: add a configured payload-size field here (e.g. MAX_REQUEST_BODY_BYTES) and pass it as Fastify's
    bodyLimit when the app is built.
- pass: standard
  file: src/http/diagnose.routes.ts
  where: createDiagnoseRoutesPlugin, the whole route registration
  cites: EDG-07
  evidence: "export function createDiagnoseRoutesPlugin(dependencies: DiagnoseControllerDependencies):\
    \ FastifyPluginAsync {\n  return async function diagnoseRoutesPlugin(app: FastifyInstance): Promise<void>\
    \ {\n    app.post(`${API_PREFIX}/diagnose`, (request, reply) => diagnoseHandler(dependencies, request,\
    \ reply));\n  };\n}"
  cost: The one route this MVP exposes drives at least two paid model calls per request with no rate limit
    registered anywhere in this plugin or in build-app.ts; a caller with no reason to slow down can drive
    cost and load without bound.
  correction: register a rate-limit plugin (or an equivalent check) at this boundary, with a refusal that
    names when the caller may retry.
- pass: standard
  file: src/http/error-handler.middleware.ts
  where: the ErrorEnvelope type and both response bodies handleUnexpectedError sends
  cites: API-05
  evidence: 'type ErrorEnvelope = { readonly error: { readonly code: string; readonly message: string
    } };'
  cost: 'Neither the 4xx envelope nor the 500 envelope declares a details property at all, while diagnose.routes.ts''s
    own 400 response for a failed schema parse sends {error: {code, message, details}}. A client has to
    branch on whether details exists, exactly the case API-05''s own rationale says a single envelope
    removes.'
  correction: give ErrorEnvelope a details field (present, even if empty, on every path) so every error
    this service answers with is the same shape.
- pass: standard
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  where: noDataOutcome, near the evidence-to-citation mapping
  cites: MNT-03
  evidence: "function noDataOutcome(nonOkEvidence: readonly EvidenceItem[]): EvaluationOutcome {\n  return\
    \ {\n    verdict: 'inconclusive',\n    reason: 'no-data',\n    citations: nonOkEvidence.map((item):\
    \ Citation => ({ concept: item.concept, field: '' })),\n  };\n}"
  cost: 'The comment directly above this function calls it this codebase''s established convention (judgment-stage.ts''s
    own noDataEvaluation), which builds the identical mapping over the same non-ok-evidence shape. The
    convention is named, not called: if the empty-field choice for a non-ok citation ever changes, both
    copies have to be found and edited together.'
  correction: extract the non-ok-evidence-to-citation mapping into one shared helper both judgment-stage.ts
    and this adapter call.
- pass: standard
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  where: isRecord/isVerdict/isCitation/isCitationArray/parseJudgment
  cites: STK-08
  evidence: "function isRecord(value: unknown): value is Record<string, unknown> {\n  return typeof value\
    \ === 'object' && value !== null && !Array.isArray(value);\n}"
  cost: The model's own JSON answer — an external, untrusted boundary — is validated field by field through
    five hand-written type guards rather than one Zod schema. A hand-written guard and a schema disagree
    the moment a shape changes; widening or narrowing one of the three answer shapes means updating several
    guard functions in lockstep.
  correction: replace the isRecord/isVerdict/isCitation(Array)/parseJudgment chain with one Zod schema
    (a discriminated union over the three declared shapes) parsed once against the model's JSON text.
- pass: conformance
  file: src/__tests__/unit/fixtures/case-fixture-shape.spec.ts
  where: the SINGLE_SENTENCE regex and its use inside the "declares at least one hypothesis..." test
  evidence: 'const SINGLE_SENTENCE = /^[^.!?]+[.!?]$/;

    ...

    expect(hypothesis.criterion).toMatch(SINGLE_SENTENCE);'
  cost: domain/knowledge/hypothesis states the criterion is "short business prose — one to three sentences,"
    but this suite fails any hypothesis whose criterion runs to a second or third sentence, even though
    the specification's own node explicitly permits that range. The test's own docblock ties this check
    to rules/knowledge/one-falsifiable-claim-per-criterion, a rule that node itself says is "verified
    by human review, not by the validator" — never about sentence count — so a curator who writes a fully
    compliant two- or three-sentence criterion will see this suite fail over a shape the specification
    allows.
- pass: conformance
  file: src/__tests__/unit/fixtures/case-fixture-shape.spec.ts
  where: the file's header docblock and the "declares a fallback resolution distinct from every one of
    its hypotheses' own" test
  evidence: "const matchingHypotheses = theCase.hypotheses.filter(\n  (hypothesis) => JSON.stringify(hypothesis.resolution)\
    \ === JSON.stringify(theCase.fallback),\n);\n\nexpect(matchingHypotheses).toHaveLength(0);"
  cost: domain/knowledge/case says only that "a fallback claims nothing about the world" — nothing there,
    or in domain/knowledge/hypothesis or domain/knowledge/resolution, requires a fallback's resolution
    to differ from every hypothesis's own. A curator who authors a case whose fallback happens to share
    a resolution with one of its hypotheses would fail this suite over a rule the specification never
    stated.
---

## What it is

Nine tasks, forty-three files, reviewed together as one change: real Anthropic-backed judgment and consolidation adapters, a fictitious fixture case, a composition root, the removal of a withdrawn dedup layer, and an HTTP surface with its end-to-end proof.

## Notes

The coverage pass produced 45 entries (one per criterion bullet as the nine task files state them), 4 of them uncovered or partial — mostly build/tree-shape facts no unit test can reach, already captured directly by this review's own run instead.
The conformance pass's two findings and the coverage pass's own notes on two criteria converge on the same fixture-test file: two assertions in case-fixture-shape.spec.ts enforce shapes (a one-sentence criterion; a fallback resolution distinct from every hypothesis) that no specification node actually states — the fixture task's own delivered Notes already flagged the second of these as a design choice without a specification fact behind it.
The standard pass found no artifact this project presupposes and does not hold — package.json, tsconfig.json and eslint.config.js all stand.
