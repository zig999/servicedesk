---
title: Diagnose HTTP endpoint over Fastify
summary: A Fastify server exposes POST /v1/diagnose, reading a case by slug/version through createCaseQuery,
  calling the production diagnose runner with a subject/narrative/requester/optional-ticket_ref from the
  body, and answering with the assessment, backed by a FakeObservationSource seeded once at startup from
  the fixture's own observations.json.
task: sha256:0b29a70ba2c44ad25c00e99dfcd213a189dc8984534c55c821e48e080dc0c85b
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/http-surface-diagnose-http-endpoint-build
files:
- path: src/config/env.ts
  effect: parses process.env once into the Env type this HTTP surface needs — port, data directories,
    observations fixture file, model config, pool size, register, prompt_version — throwing InvalidEnvironmentError
    naming every violated field together
- path: src/errors/invalid-environment.error.ts
  effect: a typed error raised when process.env fails validation
- path: src/http/dto/diagnose.dto.ts
  effect: declares the request DTO (case, subject, narrative, requester, optional ticket_ref) and response
    DTO (outcome, referral, optional determining_hypothesis, text)
- path: src/http/diagnose.controller.ts
  effect: reads the pinned case, assembles the diagnose call, invokes the runner, returns the assessment
    unchanged
- path: src/http/diagnose.routes.ts
  effect: registers POST /v1/diagnose as a Fastify plugin, validating the body against the request schema
    before calling the controller
- path: src/http/error-handler.middleware.ts
  effect: the one place an uncaught error becomes a transport status
- path: src/http/build-app.ts
  effect: constructs one Fastify instance with the error handler and route registered, never calling .listen()
- path: src/factories/diagnose-server.factory.ts
  effect: wires createCaseQuery and createProductionDiagnoseRunner from Env, seeds a FakeObservationSource
    from the fixture, hands everything to buildApp
- path: src/index.ts
  effect: now the process's sole entry point — loads Env, builds the server, calls .listen(); previously
    an inert substrate
- path: src/fixtures/glossary/subject-attribute.json
  effect: new fixture declaring the one subject-attribute name (contract-number) a diagnose call's HTTP-supplied
    subject may use
criteria:
- criterion: A request whose body names an existing case by slug and version, a subject type, a subject
    attribute-value set, a narrative and a requester returns, in the same HTTP response, the assessment
    the diagnose call produced.
  met: true
  how: diagnose.routes.ts registers POST /v1/diagnose; the request schema requires exactly those fields
    (ticket_ref optional); the handler validates, awaits the controller, and answers with the resolved
    assessment in the same reply
- criterion: The response body carries outcome, referral and text — and determining_hypothesis where the
    resolved outcome names one — and never a verdict, a citation or an evidence item.
  met: true
  how: the response schema declares exactly those four fields, mirroring Assessment's own type; the controller
    returns the pipeline's Assessment object unchanged
- criterion: Two requests naming the same case, subject, narrative and requester each receive their own
    freshly run assessment; the endpoint returns no cached, joined or reused result.
  met: true
  how: the controller generates a fresh id per call and invokes the runner fresh every time; no memoization
    exists anywhere in this HTTP layer
- criterion: A request whose ticket reference is absent still receives an assessment, and a request that
    supplies one is accepted the same way.
  met: true
  how: ticket_ref is optional in the request schema; an absent value is supplied to the pipeline as an
    empty string, running the identical code path as a supplied one
- criterion: The endpoint reads no authentication or authorization header; the requester named in the
    request body is exactly the requester the diagnose call runs under.
  met: true
  how: nothing in this HTTP layer reads request.headers; the requester comes exclusively from body.requester,
    passed straight through
- criterion: HTTP is served through Fastify and no second HTTP framework.
  met: true
  how: build-app.ts imports only fastify; no other HTTP or router package is imported anywhere in this
    layer
nodes:
- node: contracts/system/guided-diagnosis
  encoded_at:
  - src/http/dto/diagnose.dto.ts
  - src/http/diagnose.controller.ts
  - src/http/diagnose.routes.ts
  how: the request DTO names exactly this capability's own inputs and the route answers synchronously
    with an assessment in the same response; the deadline/degradation/always-recorded guarantees are already
    encoded, unchanged, inside the pipeline this route calls
- node: contracts/investigation/diagnosis
  encoded_at:
  - src/http/diagnose.controller.ts
  - src/http/diagnose.routes.ts
  - src/http/dto/diagnose.dto.ts
  how: the synchronous entry made reachable over HTTP; every call is fresh at this layer too, since the
    controller stamps a new id and adds no cache; ticket_ref is carried through, never branched on
- node: constraints/diagnosis-answers-synchronously
  encoded_at:
  - src/http/diagnose.routes.ts
  how: the handler awaits the controller and answers within the same request/response cycle — no job,
    no polling
- node: domain/investigation/assessment
  encoded_at:
  - src/http/dto/diagnose.dto.ts
  how: the response schema states this value object's wire shape exactly, reusing the already-implemented
    Assessment type as the value returned
inferences:
- inferred: the request/response wire shapes and the route path /v1/diagnose
  from: criterion 1's own literal enumeration of the request body's fields, Assessment's own four attributes
    for the response, and API-06's versioned-prefix rule; no specification node states an HTTP shape or
    path
- inferred: an absent ticket_ref is represented internally as the empty string when calling the diagnose
    pipeline
  from: RunDiagnosisOptions types ticket_ref as a required string; the contract states the ticket reference
    is never a matching key, so no downstream logic branches on its content
- inferred: the diagnose call's model field reuses the configured evaluatorModel; prompt_version, data
    directories, the observation fixture path, pool size and register are all read once from environment
    variables at startup
  from: production-diagnose.factory.ts's own established environment-read-once-at-startup convention
- inferred: cost and durations travel as zero-valued placeholders on every call
  from: no port this pipeline calls reports a token count, call count or stage timing today
- inferred: FakeObservationSource is seeded once at startup for one fixed, canonical subject (contract-number=CTR-0001)
  from: the task's own instruction to seed at startup from observations.json, which carries no subject
    of its own
- inferred: a new glossary fixture file declares "contract-number" so a diagnose call's subject can pass
    the already-implemented glossary check
  from: subject attribute-values are entry-point data, not case data, so the case-fixture task's own criteria
    never had to fill this vocabulary
- inferred: PORT defaults to 3000 when unset; every other environment variable is required with no default
  from: an operational default rather than a business decision — no specification node names a port
- inferred: the generic error handler maps any error already carrying a client-range statusCode to that
    status, and everything else to a fixed 500, with no per-domain-error status table
  from: no criterion of this task names a status for any failure path, and no specification node states
    a domain-error-to-status mapping
- inferred: no Fastify request/connection timeout is configured, leaving Fastify's own unlimited default
  from: wire-diagnose-runner's own deferred item — relating the deadline to an HTTP timeout — resolved
    by not cutting a request off before the pipeline's own budget and degradation logic can decide the
    outcome
- inferred: no dedicated .service.ts file — diagnose.controller.ts performs the whole request-to-call-to-response
    mapping itself
  from: every actual business decision is already computed deep in the already-delivered pipeline, so
    this controller has no business logic of its own to house separately
divergences:
- cites: DTO-03
  file: src/http/dto/diagnose.dto.ts
  departure: the DTO pair is named DiagnoseRequestDto/DiagnoseResponseDto rather than one of the rule's
    own listed CRUD examples
  why: this operation is "diagnose," not a CRUD verb, so no Create/Update example fits; Response is used
    verbatim, and Request is the narrowest name available for a non-CRUD inbound half
preserved:
- the already-delivered synchronous pipeline and its own full suite, unmodified
- createDiagnoseRunner/createProductionDiagnoseRunner and their own suites, unmodified — called as a black
  box
- createCaseQuery/CaseQueryService and their own suite, unmodified
- FakeObservationSource's own seed/observeConcept behavior and its own spec, unmodified — only a new seeding
  caller added
- the case-fixture task's own delivered files and their own four fixture spec files, all untouched — subject-attribute.json
  added beside them
deferred:
- what: a full domain-error-to-transport-status table
  why: no criterion of this task names a status for any failure path, and no specification node states
    a mapping
- what: rate limiting at the HTTP boundary
  why: no criterion requires it, and the package it would need is not in the authorized dependency list
- what: custom eslint encodings for the tool-decided layout rules the standard names
  why: no prior task established such an encoding either; new lint-rule engineering here risks a regression
    across the whole project
- what: a Fastify response schema and any npm start/build script
  why: no criterion requires response validation or a literal running process
---

## What it is

One route accepts a diagnose request and answers with the assessment the pipeline produced.
Its own server startup seeds a stand-in observation source from the fixture's own canned data.

## Notes

DTO-03 divergence disclosed above (naming). No status-mapping table, rate limiting or response schema added — none was required by this task's own criteria.
