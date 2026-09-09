---
target: backend
title: OpenAPI document fetch -- its own port, adapter and fetch-failure error
summary: A dependency-injected, 60-second-bounded fetch of an operator-named OpenAPI
  document link, behind its own port, refusing with a new OpenApiDocumentNotFetchedError
  (mapped to HTTP 422) on any network failure, timeout or non-2xx status and attempting
  no parse, and handing back unparsed body text on a 2xx answer.
task: sha256:3474b7c8359a2726a43ff3f43d30bb22eedab7ccc70b4f61d6e0defa00b8b021
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:247b750872a938cbf46d5981405859e9690866d43cf9e858cc8b31d62428ac47
run: run/connector-configuration-openapi-draft-backend-openapi-document-fetch-build
files:
- path: src/errors/openapi-document-not-fetched.error.ts
  effect: Declares OpenApiDocumentFetchOutcome (the network-failure | timeout | status-outside-2xx
    discriminated union, the last carrying a status) and OpenApiDocumentNotFetchedError,
    a one-class-per-file Error subclass whose readonly context carries exactly the
    link plus that outcome (and, only for status-outside-2xx, the status) and whose
    message is built from the outcome without embedding any underlying network/client
    error text; its constructor takes an optional native ErrorOptions so the real
    rejection can be preserved as `cause` without entering `context`.
- path: src/connector-registry/openapi-document-fetcher.port.ts
  effect: Declares IOpenApiDocumentFetcher, the port this task promised -- one method,
    fetchOpenApiDocument(link) => Promise<string>, named in domain terms so nothing
    above it depends on how the document is actually retrieved.
- path: src/connector-registry/openapi-document-fetcher.adapter.ts
  effect: Implements IOpenApiDocumentFetcher over global fetch (optionally injected
    as httpClient), aborting the call after its own OPENAPI_DOCUMENT_FETCH_TIMEOUT_MS
    = 60_000 via AbortController; throws OpenApiDocumentNotFetchedError with kind
    'status-outside-2xx' (carrying the answered status) whenever response.ok is false,
    with kind 'timeout' when the abort fired, and with kind 'network-failure' for
    any other rejection reaching the httpClient call, wrapping the original rejection
    as `cause` in every throw and calling response.text() only after response.ok is
    confirmed -- so no branch ever parses or otherwise reads a response body before
    it is known to be a 2xx answer.
- path: src/errors/status-map.ts
  effect: Adds the OpenApiDocumentNotFetchedError import and one entry mapping it
    to 422 in STATUS_BY_ERROR_CLASS, the one place a domain error's transport status
    is decided; every existing mapping is otherwise untouched.
criteria:
- criterion: A link answering HTTP 404 refuses the request with an error naming the
    fetch failure.
  met: true
  how: '404 is outside the 2xx range, so OpenApiDocumentFetcher.fetchOpenApiDocument''s
    `!response.ok` branch throws OpenApiDocumentNotFetchedError with { kind: ''status-outside-2xx'',
    status: 404 } before any body read.'
- criterion: A link answering any status outside the 2xx range refuses the request
    with that same fetch-failure error.
  met: true
  how: The same `!response.ok` check (Response.ok is exactly the 200-299 test) covers
    every non-2xx status, always raising the one OpenApiDocumentNotFetchedError class
    with kind 'status-outside-2xx' and the answered status.
- criterion: A network failure reaching the link refuses the request with the fetch-failure
    error.
  met: true
  how: issuedResponse's catch classifies any rejection where the controller's own
    signal was not aborted as kind 'network-failure' and throws OpenApiDocumentNotFetchedError,
    wrapping the original rejection as `cause`.
- criterion: A link that has not answered within 60000 milliseconds of the fetch beginning
    refuses the request with the fetch-failure error, the fetch abandoned as a timeout.
  met: true
  how: setTimeout(() => controller.abort(), OPENAPI_DOCUMENT_FETCH_TIMEOUT_MS) with
    the constant set to 60_000 aborts the in-flight fetch; the resulting rejection
    is classified as kind 'timeout' (controller.signal.aborted is true) and raised
    as the same error class.
- criterion: No parse of a response body is attempted on any of those four refusals.
  met: true
  how: None of the four throwing paths (404/other-status, network-failure, timeout)
    ever calls response.json(), response.text() or any other body reader; the only
    body read (response.text()) sits strictly after the `!response.ok` check has passed.
- criterion: The fetch-failure error's details carry the link exactly as named and
    which of network-failure, timeout or status-outside-2xx occurred, the last carrying
    the status code answered, and nothing else of the fetch.
  met: true
  how: 'OpenApiDocumentNotFetchedError''s context is built as `{ link, ...outcome
    }` where outcome is exactly `{ kind: ''network-failure'' }`, `{ kind: ''timeout''
    }` or `{ kind: ''status-outside-2xx'', status }` -- no underlying error message,
    no response body and no other field ever enters context, which is what error-handler.middleware.ts
    serializes as the response''s `details`.'
- criterion: A link answering a 2xx response yields that response's body text to its
    caller unparsed.
  met: true
  how: Once response.ok is true, fetchOpenApiDocument returns `await response.text()`
    -- the raw body string, never passed through JSON.parse or any other reader.
- criterion: The document fetch is issued only inside the backend, and no frontend
    module requests an OpenAPI document's own URL.
  met: true
  how: The fetcher and its port live under src/connector-registry (backend source
    only); no file under frontend/ was created, modified, or references an OpenAPI
    document link -- a repository-wide search for openapi/OpenApi under frontend/
    found no matches before this change and this delivery added none.
- criterion: The refusal is answered as an HTTP 422 response reporting an OpenApiDocumentNotFetchedError.
  met: true
  how: status-map.ts now maps OpenApiDocumentNotFetchedError to 422, and error-handler.middleware.ts's
    existing generic path (statusForError + domainEnvelope, unchanged by this task)
    answers any thrown instance of it as HTTP 422 with code OpenApiDocumentNotFetchedError
    and details from its context, once a caller reaches the shared handler -- the
    caller itself (a route) is out of this task's scope, per its own Notes.
nodes:
- node: rules/integration/an-unfetchable-openapi-link-refuses-the-draft
  encoded_at:
  - src/connector-registry/openapi-document-fetcher.adapter.ts
  - src/errors/openapi-document-not-fetched.error.ts
  how: The adapter refuses before any parse on all three named causes (network failure,
    the stated 60000ms timeout, a status outside 2xx), each raising the one OpenApiDocumentNotFetchedError
    and naming the fetch failure; no draft-shaped value is ever produced from a document
    that was never received, since the method either returns raw text or throws.
- node: rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  encoded_at:
  - src/errors/openapi-document-not-fetched.error.ts
  - src/errors/status-map.ts
  how: This task encodes the fetch-failure half this rule states -- HTTP 422, OpenApiDocumentNotFetchedError,
    and its details limited to link, kind and (for status-outside-2xx) status, nothing
    else of the fetch. The rule's comparative half -- that this value and OpenApiDocumentNotReadableError
    are two distinct values and neither is ever reported as the other -- is only observable
    once that sibling error exists, which is the malformed/unsupported-document task's
    own error and not introduced here (per this task's own REMAINDER note); OpenApiDocumentNotFetchedError's
    identity and status entry are written so that distinctness holds once that error
    is added.
- node: scenarios/integration/an-unreachable-openapi-link-refuses-the-draft
  encoded_at:
  - src/connector-registry/openapi-document-fetcher.adapter.ts
  how: given a link answering HTTP 404, when fetchOpenApiDocument is called, the `!response.ok`
    branch is taken (404 is outside 2xx) so the request is refused with OpenApiDocumentNotFetchedError
    naming the fetch failure and response.text() (the only parse this file could attempt)
    is never reached.
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  encoded_at:
  - src/connector-registry/openapi-document-fetcher.adapter.ts
  how: The fetch is issued only from src/connector-registry (backend source), behind
    IOpenApiDocumentFetcher, using no HTTP library beyond native global fetch; no
    frontend file was touched or added, so the fitness's dependency-and-network-call
    audit over the frontend module finds nothing to report -- though this task performs
    no such audit itself, only the placement it checks.
inferences:
- inferred: fetchOpenApiDocument(link) takes link as a bare string rather than a wrapped
    value object, despite the general preference for a value object over a primitive
    for a constrained concept.
  from: 'The existing connector-registry domain surface already takes analogous identifiers
    as bare strings (e.g. ConnectorConfigurationRegistryService.readConnectorConfiguration(connector:
    string), IConnectorConfigurationQuery.readConnectorConfiguration(connector: string));
    an operator-supplied link carries no further constraint this specification states
    beyond being the string the request named, so wrapping it would introduce a type
    nothing in the tree or the specification asks for.'
- inferred: A *.adapter.ts file under a domain module is exempt from the no-I/O rule
    even though that rule's own applies_to selector (under connector-registry, suffix
    .ts, nested true) does not itself carve out .adapter.ts files the way the layering
    rule's statement text does.
  from: src/investigation/http-declarative-observation-source.adapter.ts already performs
    real fetch calls from inside a domain module directory and is shipped, passing,
    pre-existing code; this is the same exception the layering rule states explicitly
    for adapter files, read together with the no-I/O rule as one port-and-adapter
    convention rather than as two rules pulling in different directions.
- inferred: OpenApiDocumentNotFetchedError's own field for structured detail is named
    `context` (not `details`), and its constructor accepts an optional native ErrorOptions
    carrying `cause`.
  from: Every existing one-class-per-file error under errors/ (e.g. ConnectorUnreachableError,
    MalformedHttpConnectorConfigurationError) uses exactly this shape, and error-handler.middleware.ts's
    domainEnvelope already reads `error.context` generically to populate the response's
    `details` -- introducing a differently named field would silently stop reaching
    the client.
- inferred: 'Native fetch''s default redirect handling (follow, then check the final
    response''s status) is left unchanged rather than set to `redirect: ''manual''`
    or otherwise special-cased.'
  from: Neither the specification nodes nor the existing connector-http-issuer.ts
    (which also lets fetch redirect by default) state or handle a redirect distinctly
    from any other status a link might answer with.
divergences:
- from: The inventory's must_not_duplicate entry naming src/http-connector/connector-http-issuer.ts's
    issueConnectorHttpCall/AbortController pattern as the timeout-bounded fetch issuer
    for any new outbound document-fetch call.
  departure: This task writes its own AbortController + setTimeout timeout logic in
    openapi-document-fetcher.adapter.ts instead of calling issueConnectorHttpCall.
  why: 'issueConnectorHttpCall''s shape is bound to an AssembledConnectorRequest (a
    resolved connector call''s method, headers, query and body) and to a capability''s
    own configurable budget; this fetch takes a bare document link with a specification-fixed
    60000ms deadline unrelated to any capability, so reusing that function would mean
    constructing a fake connector request just to fit its shape. The task''s own Notes
    already state this directly: the existing timeout-bounded issuer serves a connector
    call with a capability''s own budget, so this fetch carries its own deadline rather
    than borrowing that one.'
preserved:
- Every existing entry in status-map.ts's STATUS_BY_ERROR_CLASS continues to map its
  error class to the same status it did before this change; the edit only adds an
  import and one new map entry.
deferred:
- what: Wiring OpenApiDocumentFetcher into a build-app factory and calling it from
    a service or controller.
  why: No consumer of this port exists yet in this task's own scope; draft-generation-service
    (which depends_on this task) composes the fetch with document reading, subject/credential
    resolution and method comparison, and draft-operation-http-surface is where the
    resulting refusal actually reaches an HTTP caller through the shared error-handler
    middleware.
---

## What it is

The one dependency-injected retrieval of the document's raw text, behind its own port, and the one refusal that belongs to retrieval alone.

## Notes

None.
