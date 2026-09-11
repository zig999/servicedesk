---
target: backend
title: Accept GET for read-openapi-document-operations
summary: The read-openapi-document-operations route now accepts GET with the link as a query parameter,
  matching what the frontend sends, instead of only POST with a body.
task: sha256:4e42e5c1a025ddbb8fe719b64b9b8c5367c3a97de6a33b003d64eb51fc859f6e
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/get-vs-post-mismatch-accept-get-for-read-openapi-document-operations-build-3
files:
- path: src/http/read-openapi-document-operations.routes.ts
  effect: registers app.get instead of app.post, parses request.query against the query schema, and forwards
    the parsed link unchanged
- path: src/http/dto/read-openapi-document-operations.dto.ts
  effect: 'declares readOpenApiDocumentOperationsQuerySchema ({link: string, min length 1}) over a query
    object, replacing the request-body schema'
- path: src/http/read-openapi-document-operations.controller.ts
  effect: accepts the query DTO instead of the body DTO; calls the same reader unchanged
criteria:
- criterion: A GET request to /v1/read-openapi-document-operations naming a fetchable, well-formed OpenAPI
    3.x document link as the link query parameter answers HTTP 200 with that document's operations.
  met: true
  how: the route is registered under app.get; the handler parses request.query, and the unchanged reader
    answers every operation the document declares
- criterion: A GET request naming the same route no longer answers HTTP 404 for want of a registered handler.
  met: true
  how: app.get replaces app.post at the same path, so a GET request now reaches a registered handler
- criterion: A GET request naming an unfetchable link as the link query parameter is refused exactly as
    an-unfetchable-openapi-link-refuses-the-operations-read already states.
  met: true
  how: the controller and reader are unchanged; only the transport that reaches them changed, so the existing
    fetch-failure refusal path is unaffected
- criterion: A GET request naming a malformed or unsupported document's link as the link query parameter
    is refused exactly as a-malformed-or-unsupported-openapi-document-refuses-the-operations-read already
    states.
  met: true
  how: same reasoning as above — the parse/version refusal path is unchanged by this transport fix
- criterion: A GET request naming no link query parameter at all is refused as a malformed request.
  met: true
  how: zod's safeParse over request.query fails on the missing required 'link' key; the handler answers
    HTTP 400 with error code VALIDATION_ERROR, a message naming the query as what failed, and a non-empty
    details list naming the missing field — satisfying constraints/a-malformed-request-is-refused-with-a-validation-error's
    whole shape, not only the criterion's looser wording
nodes:
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  encoded_at:
  - src/http/read-openapi-document-operations.routes.ts
  how: a request naming no link query parameter (or an empty one) is refused with HTTP 400, error code
    VALIDATION_ERROR, a message naming the query as what failed, and a non-empty details list — the query
    clause of this constraint; the route declares no path segment and no body once the link moved to the
    query string, so the constraint's path and body clauses are not this file's to answer
- node: contracts/integration/openapi-document-operations
  encoded_at:
  - src/http/read-openapi-document-operations.routes.ts
  - src/http/dto/read-openapi-document-operations.dto.ts
  - src/http/read-openapi-document-operations.controller.ts
  how: the read-openapi-document-operations operation is now reached over GET with the link as a query
    parameter — the same operation the contract already names, its transport corrected to match what the
    frontend sends
- node: domain/integration/openapi-document-operations
  how: unchanged by this task — the already-delivered reader still answers every operation the fetched
    document declares, whole; this task only changes how the link travels to it
inferences:
- inferred: the query schema requires link to be a non-empty string (z.string().min(1)), refusing both
    an absent key and an empty value the same way
  from: the equivalent already-delivered POST body schema for this same operation used the identical string/min(1)
    shape; the transport changed, not the validation rule
---

## What it is

Fixes the HTTP transport mismatch between the already-delivered frontend (GET, query parameter) and the already-delivered backend route (POST, body) for read-openapi-document-operations — the backend now accepts GET, matching the frontend.

## Notes

None.
