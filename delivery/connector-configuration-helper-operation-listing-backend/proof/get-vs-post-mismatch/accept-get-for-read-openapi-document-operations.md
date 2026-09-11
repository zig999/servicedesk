---
target: backend
title: Proof for accepting GET on read-openapi-document-operations
summary: What proves task/get-vs-post-mismatch/accept-get-for-read-openapi-document-operations, written
  by rewriting the sibling task read-operations-http-operation own pre-existing tests from POST to GET,
  since no specification node ever fixed POST and the old assertions are now legitimately obsolete.
implementation: sha256:a51f9f4f169d52b4a50ebf48c432f37566ef0d54e55a82587ad10d1ab8d15a61
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/get-vs-post-mismatch-accept-get-for-read-openapi-document-operations-suite
tests:
- file: src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
  name: answers 200 with exactly the fetched document's every operation, each entry carrying exactly its
    own path and upper-cased method and no other key, and forwards the request's own link unchanged to
    the injected fetcher, for a request naming one OpenAPI document link
  proves: A GET request to /v1/read-openapi-document-operations naming a fetchable, well-formed OpenAPI
    3.x document link as the link query parameter answers HTTP 200 with that document's operations.
  fails_when: the route stops answering GET, stops reading link from the query string, or the answer omits
    or mis-shapes an operation
  demonstrates: contracts/integration/openapi-document-operations
- file: src/__tests__/unit/http/build-app.spec.ts
  name: reaches its own controller rather than answering 404, for the read-openapi-document-operations
    route
  proves: A GET request naming the same route no longer answers HTTP 404 for want of a registered handler.
  fails_when: the route is unregistered or registered under a different method than GET
- file: src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
  name: answers 422 reporting OpenApiDocumentNotFetchedError naming the fetch failure — never swallowing
    it into 200 with an empty operations list, and never falling through to the generic 500 handler —
    when the named link cannot be fetched at all
  proves: A GET request naming an unfetchable link as the link query parameter is refused exactly as an-unfetchable-openapi-link-refuses-the-operations-read
    already states.
  fails_when: a GET request with an unfetchable link answers anything but 422 with OpenApiDocumentNotFetchedError
- file: src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
  name: 'answers 422 reporting OpenApiDocumentNotReadableError naming its own distinct condition, never
    conflated with either of the other two, reading no operations, when $description (parametrized: unparseable
    text, no version declared, unsupported version)'
  proves: A GET request naming a malformed or unsupported document's link as the link query parameter
    is refused exactly as a-malformed-or-unsupported-openapi-document-refuses-the-operations-read already
    states.
  fails_when: a GET request over any of the three malformed/unsupported document shapes answers anything
    but 422 with OpenApiDocumentNotReadableError and the matching details
- file: src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
  name: refuses the read, naming the declared version and reading no operations, when an OpenAPI document
    link answers a document declaring swagger 2.0
  proves: A GET request naming a malformed or unsupported document's link as the link query parameter
    is refused exactly as a-malformed-or-unsupported-openapi-document-refuses-the-operations-read already
    states.
  fails_when: a GET request over a Swagger 2.0 document answers anything but 422 naming the declared version,
    or answers any operations
- file: src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
  name: refuses with 400 VALIDATION_ERROR naming the query as what failed, and issues no fetch, for a
    request naming no link query parameter at all
  proves: A GET request naming no link query parameter at all is refused as a malformed request.
  fails_when: a GET request with no link query parameter answers anything but 400 VALIDATION_ERROR naming
    the query, or issues a fetch
  demonstrates: constraints/a-malformed-request-is-refused-with-a-validation-error
- file: src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
  name: refuses with 400 VALIDATION_ERROR and issues no fetch, for a request whose link query parameter
    is empty
  proves: A GET request naming no link query parameter at all is refused as a malformed request.
  fails_when: a GET request with an empty link query parameter answers anything but 400 VALIDATION_ERROR,
    or issues a fetch
untested:
- domain/integration/openapi-document-operations — unchanged by this task; already proven by the sibling
  task document-operations-reading's own proof, which this task's tests do not re-derive
---

## What it is

Proves the transport fix by rewriting the sibling task read-operations-http-operation own routes spec and one build-app.spec.ts assertion from POST to GET — every other assertion in each file is unchanged.

## Notes

Build attempt -build (before this rewrite) and -build-2 (an intermediate fix with a default-parameter bug in the test helper) were both red — cause code, both times in this proof own test file rather than in the implementation: the first because the sibling tests still asserted POST, the second because a JS default-parameter gotcha (urlFor(undefined) silently substitutes the default argument, never reaching the branch meant for the no-link case) left one test asserting the wrong status. -build-3 passed clean, and -suite passed clean on the first attempt.
