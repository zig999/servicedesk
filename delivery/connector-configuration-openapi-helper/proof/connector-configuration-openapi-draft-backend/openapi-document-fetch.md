---
title: OpenAPI document fetch -- unit proof of fetch-failure refusal, timeout bound,
  unparsed success and 422 mapping
summary: Unit tests over OpenApiDocumentFetcher, OpenApiDocumentNotFetchedError and
  the status-map/error-handler pair prove every stated criterion -- 404, any non-2xx
  status, network failure, the 60000ms timeout boundary, no body parse on any refusal,
  exact error-context shape, unparsed 2xx body text, and the 422 envelope the shared
  handler answers with -- leaving the frontend-placement half of the placement criterion
  and the redirect inference unproven for stated reasons.
implementation: sha256:4afeded5789c2833f9a46f919297d58d653e609261e208b9e524994f1f579ec9
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:247b750872a938cbf46d5981405859e9690866d43cf9e858cc8b31d62428ac47
run: run/connector-configuration-openapi-draft-backend-openapi-document-fetch-suite-4
tests:
- file: src/__tests__/unit/connector-registry/openapi-document-fetcher.adapter.spec.ts
  name: refuses a link answering HTTP 404 with OpenApiDocumentNotFetchedError naming
    status-outside-2xx and the answered status
  proves: A link answering HTTP 404 refuses the request with an error naming the fetch
    failure.
  fails_when: fetchOpenApiDocument stops throwing OpenApiDocumentNotFetchedError for
    a 404 answer, or throws it without kind 'status-outside-2xx' and status 404 in
    context.
- file: src/__tests__/unit/connector-registry/openapi-document-fetcher.adapter.spec.ts
  name: refuses a link answering a different non-2xx status (503) the same way, carrying
    that status rather than only ever 404
  proves: A link answering any status outside the 2xx range refuses the request with
    that same fetch-failure error.
  fails_when: the adapter special-cases 404 rather than checking response.ok generally,
    or fails to carry 503 as the status for a different non-2xx answer.
- file: src/__tests__/unit/connector-registry/openapi-document-fetcher.adapter.spec.ts
  name: never reads the response body on a non-2xx answer, refusing before any parse
    is attempted
  proves: No parse of a response body is attempted on any of those four refusals (the
    status-outside-2xx branch, the only one of the four that ever holds a Response
    instance to parse).
  fails_when: fetchOpenApiDocument calls response.text() (or any other body reader)
    before or instead of throwing on a non-2xx answer.
- file: src/__tests__/unit/connector-registry/openapi-document-fetcher.adapter.spec.ts
  name: refuses a rejected outbound call with OpenApiDocumentNotFetchedError naming
    network-failure, preserving the original rejection as cause
  proves: A network failure reaching the link refuses the request with the fetch-failure
    error; and the details-shape half of carrying the link exactly as named and which
    of network-failure, timeout or status-outside-2xx occurred, and nothing else of
    the fetch, for the network-failure kind (context equals exactly {link, kind},
    no status field).
  fails_when: a rejected httpClient call stops being wrapped as OpenApiDocumentNotFetchedError,
    is classified with the wrong kind, carries an extra field in context, or drops
    the original rejection as cause.
- file: src/__tests__/unit/connector-registry/openapi-document-fetcher.adapter.spec.ts
  name: abandons the fetch as a timeout once 60000ms elapse with no answer, refusing
    with kind timeout
  proves: A link that has not answered within 60000 milliseconds of the fetch beginning
    refuses the request with the fetch-failure error, the fetch abandoned as a timeout.
  fails_when: the adapter does not abort at 60000ms, or abandons the call without
    raising OpenApiDocumentNotFetchedError with kind 'timeout'.
- file: src/__tests__/unit/connector-registry/openapi-document-fetcher.adapter.spec.ts
  name: does not abandon the fetch before the full 60000ms deadline elapses
  proves: the 60000ms figure is the actual bound rather than an approximation -- pins
    the lower edge of the stated timeout boundary.
  fails_when: the fetch settles to a timeout refusal before the full 60000ms has elapsed.
- file: src/__tests__/unit/connector-registry/openapi-document-fetcher.adapter.spec.ts
  name: yields a 2xx response's body text to its caller exactly, without parsing it
    as JSON
  proves: A link answering a 2xx response yields that response's body text to its
    caller unparsed.
  fails_when: fetchOpenApiDocument returns anything other than the exact raw body
    string for a 2xx answer, including a JSON-parsed value.
- file: src/__tests__/unit/connector-registry/openapi-document-fetcher.adapter.spec.ts
  name: yields an empty string, not undefined or a thrown error, when a 2xx response
    carries an empty body
  proves: the empty-body edge case of the same 2xx-unparsed criterion is handled as
    ordinary text rather than as a special or absent case.
  fails_when: an empty 2xx body resolves to undefined, throws, or is coerced to any
    value other than the empty string.
- file: src/__tests__/unit/connector-registry/openapi-document-fetcher.adapter.spec.ts
  name: imports no HTTP client library, reaching the network only through the platform
    global fetch
  proves: half of 'The document fetch is issued only inside the backend' -- that no
    HTTP client library is introduced, consistent with constraints/the-openapi-document-is-fetched-by-the-backend.
  fails_when: the adapter's own source text comes to import axios, node-fetch, got,
    undici, superagent or request.
  demonstrates: constraints/the-openapi-document-is-fetched-by-the-backend
- file: src/__tests__/unit/connector-registry/openapi-document-fetcher.adapter.spec.ts
  name: defaults its own HTTP client to the platform global fetch when the caller
    injects none
  proves: the dependency-injection seam the task's own 'What it is' states -- an unconfigured
    fetcher still reaches the network through the real global fetch.
  fails_when: constructing OpenApiDocumentFetcher with no options stops calling the
    platform's own global fetch.
- file: src/__tests__/unit/errors/openapi-document-not-fetched.error.spec.ts
  name: names itself OpenApiDocumentNotFetchedError and carries only the link and
    kind in context for a network failure
  proves: the error-identity and exact-context half of carrying the link exactly as
    named and which of network-failure, timeout or status-outside-2xx occurred, and
    nothing else of the fetch, for the network-failure kind.
  fails_when: error.name is not 'OpenApiDocumentNotFetchedError', or context carries
    any field beyond link and kind for a network-failure outcome.
- file: src/__tests__/unit/errors/openapi-document-not-fetched.error.spec.ts
  name: carries only the link and kind in context for a timeout, naming no status
    at all
  proves: the same exact-context requirement for the timeout kind specifically.
  fails_when: context for a timeout outcome carries a status field or any field beyond
    link and kind.
- file: src/__tests__/unit/errors/openapi-document-not-fetched.error.spec.ts
  name: carries the answered status in context for a status-outside-2xx outcome, alongside
    the link and kind
  proves: the status-outside-2xx kind is the last carrying the status code answered,
    and nothing else.
  fails_when: context for a status-outside-2xx outcome omits the status, or carries
    any field beyond link, kind and status.
- file: src/__tests__/unit/errors/openapi-document-not-fetched.error.spec.ts
  name: preserves the underlying rejection as its own cause when one is given
  proves: the implementation's own inference that the constructor's ErrorOptions parameter
    preserves the real rejection as cause without entering context.
  fails_when: error.cause stops being the exact rejection instance passed in.
- file: src/__tests__/unit/errors/openapi-document-not-fetched.error.spec.ts
  name: constructs with no cause at all when none is given, rather than requiring
    one
  proves: the cause parameter is optional, matching every other one-class-per-file
    error under errors/.
  fails_when: constructing without a cause option throws, or error.cause resolves
    to anything other than undefined.
- file: src/__tests__/unit/errors/openapi-document-not-fetched.error.spec.ts
  name: builds its own message from the outcome alone, never embedding the underlying
    rejection's own text
  proves: the implementation's stated guarantee that the message is built from the
    outcome without embedding any underlying network/client error text.
  fails_when: the constructed message contains the underlying rejection's own message
    text.
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: resolves OpenApiDocumentNotFetchedError to 422
  proves: half of 'The refusal is answered as an HTTP 422 response reporting an OpenApiDocumentNotFetchedError'
    -- that the status map itself resolves this error class to 422.
  fails_when: statusForError stops resolving an OpenApiDocumentNotFetchedError instance
    to 422.
- file: src/__tests__/unit/http/error-handler.middleware.spec.ts
  name: answers a refused OpenAPI document fetch as HTTP 422 reporting OpenApiDocumentNotFetchedError,
    once it reaches the shared handler
  proves: The refusal is answered as an HTTP 422 response reporting an OpenApiDocumentNotFetchedError,
    end to end through the shared error-handling middleware, including the exact code,
    message and details an HTTP caller would see.
  fails_when: an OpenApiDocumentNotFetchedError reaching the shared handler stops
    answering 422, or its code/message/details envelope changes shape.
not_applicable:
- edge_case: An absent or empty-string link value
  why: no criterion states a validation rule over the link's own well-formedness;
    the operator-named value is handed to fetchOpenApiDocument as given, and boundary
    validation of what a request may name is a route/DTO concern this task's own Notes
    place outside its scope.
- edge_case: The exact numeric boundary of the 2xx range itself (200, 299, 300)
  why: the adapter delegates 'is this a success' entirely to the platform's own Response.ok,
    which is native Fetch API semantics rather than logic this task wrote; the 404-and-503
    tests already show the refusal fires generically across the non-2xx space, and
    re-proving where the platform itself draws 200-299 would test the runtime, not
    this code.
- edge_case: A duplicate or uniqueness violation
  why: fetching one document by one link raises no uniqueness concern; nothing in
    this task's criteria states one.
- edge_case: An operation attempted against state that forbids it
  why: fetchOpenApiDocument holds no state machine of its own -- each call is a single
    stateless retrieval with nothing before or after it to forbid the attempt.
- edge_case: Two fetchOpenApiDocument calls issued concurrently against one fetcher
    instance
  why: each call constructs its own AbortController and its own timer entirely local
    to that call; the adapter holds no shared mutable state across invocations for
    a concurrent call to corrupt, so a single-call test already exercises everything
    a second concurrent call could touch.
untested:
- 'The ''no frontend module requests an OpenAPI document''s own URL'' half of the
  placement criterion is not proven by a test in this record: the target source root
  given for this proof is src (the backend), so no test here reads the frontend tree.
  No consumer wires IOpenApiDocumentFetcher to any caller yet (deferred to draft-generation-service
  per this task''s own Notes), so the fact is presently true only by there being no
  caller anywhere, backend or frontend, to observe -- a repo-wide scan over frontend/
  would need to be part of a proof scoped to that tree, or reasserted once a caller
  exists.'
- 'That native fetch''s default redirect-following behavior is deliberately left unchanged
  (the inference recorded against setting redirect: ''manual'') is unobservable at
  this adapter''s own unit-test boundary: the mocked httpClient in every test here
  stands in for the whole network call and never exercises the platform''s own redirect-following
  machinery, so no test distinguishes ''redirects follow by default'' from ''redirects
  are handled specially'' -- only an integration test against a real redirecting server
  would show the difference, and none is wired for this adapter.'
divergences:
- cites: TST-05
  file: src/__tests__/unit/connector-registry/openapi-document-fetcher.adapter.spec.ts
  departure: OpenApiDocumentFetcher, an adapter implementing IOpenApiDocumentFetcher,
    has no integration test against the real network (or a recorded-response fixture
    standing in for one); every test exercises it through a fully mocked httpClient.
  why: TST-05 names PostgreSQL for a *-store.repository.ts and a recorded-provider
    fixture for an Anthropic adapter as its own worked examples of the real technology,
    and the codebase's own existing precedent for this exact shape of adapter -- native-fetch-behind-an-injected-httpClient,
    e.g. http-declarative-observation-source.adapter.ts and connector-http-issuer.ts
    -- carries no real-network integration test either, only a mocked-httpClient unit
    spec. Writing a first-of-its-kind live-network integration test here would introduce
    a flake source (DNS, TLS, an operator's own document host) this project's existing
    HTTP-adapter tests deliberately avoid, and pin a convention no sibling file follows.
---

## What it is

Unit proof of the OpenAPI document fetch's own refusal, timeout bound, unparsed success path and 422 wire mapping.

## Notes

The first suite run (run/connector-configuration-openapi-draft-backend-openapi-document-fetch-suite) failed at test-unit with cause code -- an unhandled-rejection leak in the timeout tests, where the promise's rejection handler was attached only after awaiting vi.advanceTimersByTimeAsync(60_000) instead of synchronously with the promise's own creation; fixed by attaching .catch() in the same expression. The next suite run (...-suite-3) failed at the suite-role test step with cause setup -- one unrelated integration test (src/__tests__/integration/seed.spec.ts) was hit by a leftover fixture row another, concurrently-run integration suite wrote into the shared test database; nothing in this delivery's own file set was touched. The suite was re-run once more (...-suite-4) and passed clean, confirming the prior red was the shared-database flake the diagnosis named and not a regression this delivery introduced.
