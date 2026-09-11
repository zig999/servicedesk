---
title: Publish read-openapi-document-operations over HTTP
summary: The read is exposed as the published operation the contract names, wired
  into the built app with its request validation and its refusals mapped to status.
objective: The operation read-openapi-document-operations is published on the built
  app, accepting a request that names one OpenAPI document link and answering the
  fetched document's declared operations as path and method pairs, with its refusals
  reaching the client as refusals rather than as generic failures.
criteria:
- A request naming one OpenAPI document link is answered with every operation the
  fetched document declares, each entry carrying a path and an upper-cased method.
- The request body is validated by a zod schema in src/src/http/dto, following the
  project's routes/controller/dto triplet rather than a shape of its own.
- A request naming no document link, or naming one that is not a string, is rejected
  by the route handler as a VALIDATION_ERROR with HTTP 400, and no fetch is issued.
- The controller maps the validated DTO and its injected dependencies onto the reading
  and holds no logic of its own.
- The route plugin factory is registered in src/src/http/build-app.ts's routePluginFactories
  and its dependencies composed in src/src/factories/build-app.factory.ts, so the
  operation is reachable on an app built by the factory with no further wiring.
- Every error class this operation can raise already has an entry in src/src/errors/status-map.ts's
  STATUS_BY_ERROR_CLASS, so no refusal falls through to the generic handler.
- The operation registers nothing and issues no register-connector call.
depends_on:
- task/openapi-document-operations-read/document-operations-reading
rationale: Cut from the reading because it changes the published seam and nothing
  behind it; the scope names the contract to expose but leaves the split between the
  reading and its publication to the planning.
implements:
- domain/integration/openapi-operation
- domain/integration/openapi-document-operations
- contracts/integration/openapi-document-operations
- rules/integration/an-openapi-operations-method-is-upper-cased
- rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read
- rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read
- rules/integration/an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
- scenarios/integration/a-swagger-2-document-refuses-the-operations-read
- constraints/the-openapi-document-is-fetched-by-the-backend
- constraints/a-malformed-request-is-refused-with-a-validation-error
- constraints/a-domain-error-unmapped-by-status-is-refused-generically
sources:
- work/connector-configuration-helper-operation-listing-backend/intake/scope.md
---

## What it is
The HTTP surface of the contract contracts/integration/openapi-document-operations names.
It is the routes, controller, dto and build-app wiring triplet the project already uses for draft-connector-configuration-from-openapi, applied to the new read.

## Notes
The inventory records that OpenAPI refusals are already mapped to 422 in STATUS_BY_ERROR_CLASS, so reusing the existing refusal error classes keeps this operation's refusals mapped without inventing a status the specification does not state.
No frontend module is touched: the scope is backend-only and the fetch stays server-side per constraints/the-openapi-document-is-fetched-by-the-backend.
UNDERDETERMINED, from the specification — no criterion forces the operation to actually refuse a fetch failure or an unreadable document rather than answering an empty operations list; a handler swallowing every failure into HTTP 200 with an empty array satisfies every criterion as written. Implementation must let the two refusals rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read and rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read state actually propagate as refusals.
UNDERDETERMINED, from the specification — no criterion fixes the status or which error value each of the two refusals maps to; rules/integration/an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document requires both mapped to HTTP 422, OpenApiDocumentNotFetchedError for the fetch failure and OpenApiDocumentNotReadableError for the unreadable document, never interchanged.
UNDERDETERMINED, from the specification — no criterion holds the "declares no version" naming distinct from the parse-failure and unsupported-version namings at the HTTP surface; the three must stay told apart per rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read.
REMAINDER, from the specification — the sixty-second fetch-abandonment clause of rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read and the JSON/YAML-parse-by-content clause of rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read belong to task/openapi-document-operations-read/document-operations-reading, the reading this task's controller only maps onto.
ADVISORY, from the specification — the four draft-only candidates (rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document, rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft, rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-draft, scenarios/integration/a-swagger-2-document-refuses-the-draft) govern draft-connector-configuration-from-openapi and are excluded from implements; the operations-read's own status/error-value pair is a separate decision, never interchangeable with the draft's however alike the two read.
