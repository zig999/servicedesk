---
title: HTTP surface for POST /v1/diagnose
summary: Proves the six criteria of task/http-surface/diagnose-http-endpoint — request/response shape,
  freshness per call, ticket_ref optionality, header independence, and Fastify-only transport — split
  between a unit suite driving buildApp() with a stubbed pipeline seam and an integration suite driving
  the real createDiagnoseHttpServer over the real fixture case with only @anthropic-ai/sdk mocked.
implementation: sha256:873cae714f9d47c3c5424632c8f43a4d81c28d905fb5842e9cf3aafe9748b406
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/http-surface-diagnose-http-endpoint-suite
tests:
- file: src/__tests__/unit/http/build-app.spec.ts
  name: answers 200 with the assessment the diagnose call produced, for a request naming an existing case,
    subject, narrative and requester
  proves: a request whose body names an existing case by slug and version, a subject type, a subject attribute-value
    set, a narrative and a requester returns, in the same HTTP response, the assessment the diagnose call
    produced
  fails_when: the route fails to answer 200, or the controller answers with anything other than exactly
    what runDiagnose resolved
- file: src/__tests__/unit/http/build-app.spec.ts
  name: carries exactly outcome, referral, determining_hypothesis and text when the resolved outcome names
    a determining hypothesis
  proves: the response body carries determining_hypothesis where the resolved outcome names one
  fails_when: the response drops determining_hypothesis when present, or carries any key beyond the four
    declared ones
- file: src/__tests__/unit/http/build-app.spec.ts
  name: omits determining_hypothesis and carries no verdict, citation or evidence field when the resolved
    outcome names none
  proves: never a verdict, a citation or an evidence item
  fails_when: the response body gains a determining_hypothesis, verdict, citations or evidence key it
    was not given
- file: src/__tests__/unit/http/build-app.spec.ts
  name: answers each of two requests naming the same case, subject, narrative and requester with that
    call's own resolved assessment, never a cached or joined value
  proves: two requests each receive their own freshly run assessment
  fails_when: the second response echoes the first call's own resolved value instead of its own
- file: src/__tests__/unit/http/build-app.spec.ts
  name: invokes the diagnose call under a fresh id for each of two requests naming the same case, subject,
    narrative and requester
  proves: the controller runs the pipeline fresh under a new id every time, never memoizing
  fails_when: the controller reuses one id across two calls
- file: src/__tests__/unit/http/build-app.spec.ts
  name: supplies the empty string as ticket_ref to the diagnose call when the request names none
  proves: a request whose ticket reference is absent still receives an assessment
  fails_when: ticket_ref is forwarded as anything other than the empty string, or the request is refused
- file: src/__tests__/unit/http/build-app.spec.ts
  name: passes a given ticket_ref straight through to the diagnose call, unchanged
  proves: a request that supplies one is accepted the same way
  fails_when: a supplied ticket_ref is altered, dropped, or the request is refused
- file: src/__tests__/unit/http/build-app.spec.ts
  name: answers 200 for a request carrying no headers at all, reading no authentication or authorization
    header
  proves: the endpoint reads no authentication or authorization header
  fails_when: a header-less request is refused
- file: src/__tests__/unit/http/build-app.spec.ts
  name: runs the diagnose call under exactly the body's own requester, even when the request carries an
    authorization header naming a different identity
  proves: the requester named in the body is exactly the requester the diagnose call runs under
  fails_when: the requester passed to runDiagnose comes from a header instead of the body
- file: src/__tests__/unit/http/build-app.spec.ts
  name: imports fastify, and no second HTTP or router framework, across build-app, the route, the controller,
    the error handler and the DTO
  proves: HTTP is served through Fastify and no second HTTP framework
  fails_when: any of the five files stops importing fastify, or starts importing a second HTTP/router
    framework
- file: src/__tests__/unit/http/build-app.spec.ts
  name: refuses with 400 a request whose body names no narrative
  proves: the validation boundary enforces criterion 1's own literal field enumeration before the controller
    is reached
  fails_when: an incomplete body is accepted, or the controller is invoked anyway
- file: src/__tests__/unit/http/build-app.spec.ts
  name: refuses with 400 a request whose subject carries no attribute at all
  proves: the validation boundary enforces the subject's own at-least-one-attribute shape
  fails_when: a request with an empty attributes array is accepted
- file: src/__tests__/unit/http/build-app.spec.ts
  name: answers 500 with a generic message, never the rejected call's own error text, when the diagnose
    call itself rejects
  proves: a failing dependency is handled as a transport error rather than leaking an internal detail
  fails_when: the original error's own message reaches the response body, or the process fails to answer
    at all
- file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  name: answers 200 with exactly the fixture case's own declared fallback outcome, referral and drafted
    text — no verdict, citation, evidence item or determining_hypothesis — for a request naming the seeded
    canonical subject
  proves: criteria 1 and 2, end to end, through the real case query, the real production runner and a
    mocked Anthropic client
  fails_when: the real pipeline's HTTP response differs in value from the case's own declared fallback,
    or carries any key beyond outcome/referral/text
- file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  name: writes two independent investigation records for two requests naming the same case, subject, narrative
    and requester
  proves: no cached, joined or reused result, observed as two persisted records rather than one
  fails_when: fewer than two investigation files exist in the data directory after two requests
- file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  name: answers 200 when the request supplies no ticket_ref
  proves: the absent-ticket_ref case, against the real wired server
  fails_when: the real server refuses a request with no ticket_ref
- file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  name: answers 200 when the request supplies a ticket_ref
  proves: the supplied-ticket_ref case, against the real wired server
  fails_when: the real server refuses a request that supplies one
- file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  name: answers 200 for a request carrying no headers at all
  proves: the no-auth criterion, against the real wired server
  fails_when: the real server refuses a header-less request
- file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  name: sends the caller-configured evaluator and consolidator models to the provider, both read once
    from this factory's own Env
  proves: the diagnose call's model fields reuse the configured models, read once from environment variables
    at startup
  fails_when: a value other than the configured models reaches the provider call
- file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  name: persists the zero-valued cost and duration placeholders this HTTP layer stamps, since nothing
    behind it measures either yet
  proves: cost and durations travel as zero-valued placeholders on every call
  fails_when: a non-zero or absent cost/durations value is persisted
- file: src/__tests__/unit/config/env.spec.ts
  name: defaults PORT to 3000 when the given environment names none
  proves: PORT defaults to 3000 when unset
  fails_when: loadEnv answers a different default, or throws for an otherwise-complete environment missing
    only PORT
- file: src/__tests__/unit/config/env.spec.ts
  name: parses the given PORT instead of the default when the environment names one
  proves: the default does not override a caller-given PORT
  fails_when: a supplied PORT is ignored in favor of 3000
- file: src/__tests__/unit/config/env.spec.ts
  name: throws InvalidEnvironmentError naming every missing field together, rather than only the first
    one it reaches
  proves: every other environment variable is required, with every violation named together
  fails_when: loadEnv fails to throw for missing required fields, or names only one of two simultaneously-missing
    fields
not_applicable:
- edge_case: a duplicate request receiving a joined or deduplicated result
  why: criterion 3 itself requires every call to run fresh, and the idempotency/window-dedup modules were
    removed from the tree the production factory now wires
- edge_case: two operations against one subject at once (true concurrency)
  why: nothing in this HTTP layer serializes or locks per-subject state; the sequential freshness/no-cache
    tests already establish the deterministic, observable proxy
- edge_case: a numeric boundary on case.version beyond the DTO's own positivity check
  why: no criterion of this task states a version range
- edge_case: a slow-answering dependency (a request-level timeout)
  why: the implementation deliberately configures no Fastify request timeout so the pipeline's own deadline/degradation
    logic decides the outcome
untested:
- the behavior of a request naming a subject FakeObservationSource was not seeded for — no criterion of
  this task states what the HTTP layer should answer for it, so this proof does not manufacture one
- independent pass-through proof that POOL_SIZE and PROMPT_VERSION specifically reach the wired pipeline
  from Env — exercised indirectly by a successful integration run, but not asserted directly at the provider
  boundary the way the model fields are
---

## What it is

A unit suite stubs the wired pipeline to prove the route/controller/DTO contract; an integration suite runs the real server against the real fixture case with only the Anthropic client mocked.

## Notes

The unit suite treats createProductionDiagnoseRunner's own returned callable as the boundary it stubs, mirroring production-diagnose.factory.spec.ts's own precedent of stubbing the already-delivered pipeline it wires and proving the real thing separately at the integration level.
