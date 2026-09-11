---
target: backend
title: Configuration Helper operation listing — backend review
summary: 'Reviews the three tasks of epic openapi-document-operations-read: extracting the shared OpenAPI
  parse/version-refusal step, the operations-read domain reading, and its HTTP publication.'
reviewed:
- src/connector-registry/openapi-document-reader.ts
- src/connector-registry/openapi-operation-reader.ts
- src/connector-registry/openapi-document-operations-reader.ts
- src/http/dto/read-openapi-document-operations.dto.ts
- src/http/read-openapi-document-operations.controller.ts
- src/http/read-openapi-document-operations.routes.ts
- src/http/build-app.ts
- src/factories/build-app.factory.ts
- src/__tests__/unit/connector-registry/openapi-document-reader.spec.ts
- src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
- src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
- src/__tests__/unit/http/build-app.spec.ts
tasks:
- task/openapi-document-operations-read/shared-openapi-document-parse-step
- task/openapi-document-operations-read/document-operations-reading
- task/openapi-document-operations-read/read-operations-http-operation
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run passed clean, so nothing was diagnosed
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
coverage:
- criterion: A single unit in src/src/connector-registry accepts a fetched document's text, parses it
    as JSON and then as YAML, and returns the parsed OpenAPI document without performing any path or method
    lookup.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-document-reader.spec.ts
    name: returns the fetched document parsed whole, with every top-level member and every path it declares,
      performing no path or method lookup
- criterion: That unit refuses text that parses as neither JSON nor YAML, naming what failed to parse.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-document-reader.spec.ts
    name: refuses text that parses as neither JSON nor YAML, naming the fetched document text as what
      failed to parse
- criterion: That unit refuses a parsed document whose declared version is present but is not OpenAPI
    3.x, naming the declared version, and returns no document.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-document-reader.spec.ts
    name: refuses a document whose declared openapi version is present but outside the 3.x line, naming
      the declared version
- criterion: That unit refuses a parsed document that declares no version at all -- neither an openapi
    field nor a swagger field -- naming that the document declares no version, that naming distinct from
    a parse failure and from a declared-but-unsupported version, and returns no document.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-document-reader.spec.ts
    name: refuses a document declaring neither an openapi nor a swagger field, naming that no version
      was declared
- criterion: That unit does not refuse a fetched document that parses as a well-formed OpenAPI 3.x document.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-document-reader.spec.ts
    name: returns the fetched document parsed whole, with every top-level member and every path it declares,
      performing no path or method lookup
  why: 'Jointly proven by the same whole-document test: a document that were refused could not be returned
    whole.'
- criterion: readOpenApiOperation obtains its parsed document from that unit and holds no parsing, version-checking
    or version-refusal code of its own.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: returns the operation's own method key exactly as the document spells it, regardless of the
      requested method's own casing
  why: The observable half (readOpenApiOperation still resolves a well-formed document correctly through
    the new delegation) is exercised. Whether the file holds no parsing/version code of its own is a structural
    fact about the source, not a runtime behavior any test can falsify -- a duplicate, dead copy of the
    old inline logic sitting unused beside the delegation would pass this test identically.
- criterion: A draft requested from a fetched document declaring swagger 2.0 is still refused naming the
    declared version, and no draft is generated.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: refuses a document declaring swagger 2.0, naming the declared version
- criterion: A draft requested from a fetched document whose text parses as neither JSON nor YAML is still
    refused naming what failed to parse.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: refuses text that parses as neither JSON nor a YAML mapping, naming what failed to parse
- criterion: A YAML OpenAPI 3.x document still yields the same draft a JSON document of the same content
    yields, the serialization decided by parsing the text and never by a declared content type.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: reads a document served as YAML exactly as one served as JSON, deciding the serialization only
      by parsing the text
- criterion: A draft requested for a path and method pairing the fetched document declares no operation
    for is still refused with OpenApiOperationNotFoundError naming that path and that method.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: refuses when the document declares no entry at all for the requested path, naming that path
      and method
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: refuses when the path exists but declares no operation under the requested method
- criterion: No error class, message or context readOpenApiOperation previously raised is renamed, retyped
    or dropped.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: keeps OpenApiDocumentNotReadableError and OpenApiOperationNotFoundError as two distinct values,
      neither an instance of the other
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: refuses a document that parses to an object declaring neither an openapi nor a swagger field,
      naming that no version was declared
  why: Every context shape a test names (unparseable/detail, unsupported-version/declaredVersion, no-version-declared,
    the two class identities) is asserted somewhere, but the criterion claims a totality -- nothing at
    all renamed, retyped or dropped -- and no single assertion closes that whole claim; a context field
    no test currently reads could still change unnoticed.
- criterion: The existing tests covering draft-connector-configuration-from-openapi pass with no test
    amended to accommodate the extraction.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: (the file's own full suite, unmodified by this delivery)
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: (the file's own full suite, unmodified by this delivery)
  why: Evidenced by the git history showing neither file touched by this delivery, combined with the captured
    suite run answering green over both; a criterion about non-amendment and continued passing rather
    than a new assertion of its own.
- criterion: A fetched document declaring one path /items with a get operation and a post operation under
    it is read as two entries, one naming /items with GET and one naming /items with POST.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
    name: reads a path declaring a get and a post operation into two entries naming that same path, one
      per method
- criterion: Every entry's method is upper-cased whatever case the document's own path-item key named
    it under.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
    name: upper-cases every method regardless of the case the document's own path-item key used
- criterion: Every entry names the path exactly as the document declares it.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
    name: names each entry's path exactly as the document declares it, unaltered
- criterion: Every operation the document declares is answered in one answer, the read accepting no page,
    cursor, offset or limit and truncating nothing.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
    name: answers every operation across every path in one array, ignoring any page, cursor or limit-like
      field and truncating nothing
- criterion: A read whose named link fails with a network failure, a timeout, or a response outside the
    2xx range is refused naming the fetch failure, with no parse attempted and no operations read.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
    name: propagates the fetcher's own refusal unchanged for a network failure, a timeout, or a non-2xx
      status, attempting no parse
- criterion: The fetch is abandoned as a timeout where the named link has not answered within 60000 milliseconds,
    delivered by the existing IOpenApiDocumentFetcher port rather than by a second timeout introduced
    here.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
    name: resolves once the fetcher itself resolves, however long that takes, imposing no timeout of its
      own
  why: This test proves the half this task owns -- no second timeout is introduced here, the read still
    resolves 120 seconds in. The 60000ms abandonment itself is the pre-existing IOpenApiDocumentFetcher
    adapter's own behavior, tested in that adapter's own suite outside this file set.
- criterion: A read whose fetched document declares swagger 2.0 is refused naming the declared version,
    and no operations are read.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
    name: refuses a document declaring swagger 2.0, naming the declared version, with no operations read
- criterion: A read whose fetched document's text parses as neither JSON nor YAML is refused naming what
    failed to parse, and no operations are read.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
    name: refuses fetched text that parses as neither JSON nor YAML, naming what failed to parse
- criterion: A read whose fetched document parses but declares no version at all -- neither an openapi
    field nor a swagger field -- is refused naming that the document declares no version, that naming
    distinct from a parse failure and from a declared-but-unsupported version, and no operations are read.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
    name: refuses a document that parses but declares no version at all, naming that distinctly from a
      parse failure or an unsupported version
- criterion: A YAML OpenAPI 3.x document is read into the same operations a JSON document of the same
    content is read into, the serialization decided by parsing the fetched text and never by any content
    type the response declared.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
    name: reads a YAML OpenAPI 3.x document into the same operations as the equivalent JSON document
- criterion: The document fetch is issued inside this backend reading through IOpenApiDocumentFetcher,
    and the reading offers no parameter by which a caller supplies already-fetched document text.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
    name: answers strictly from whatever the injected fetcher resolves, with no alternate source for the
      document text
  why: The runtime half -- the answer varies strictly with what the injected fetcher resolves -- is exercised.
    The absence of an already-fetched-text parameter is a type-signature fact (ReadOpenApiDocumentOperationsOptions
    declares only link and documentFetcher), enforced by the compiler at typecheck rather than asserted
    by a runtime test.
- criterion: The reading parses through the unit task/openapi-document-operations-read/shared-openapi-document-parse-step
    established, holding no parse or version-refusal code of its own.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
    name: refuses a document declaring swagger 2.0, naming the declared version, with no operations read
  - file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
    name: refuses fetched text that parses as neither JSON nor YAML, naming what failed to parse
  - file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
    name: refuses a document that parses but declares no version at all, naming that distinctly from a
      parse failure or an unsupported version
  why: 'The behavioral half -- refusals match the shared unit''s own contract -- is exercised by the three
    refusal tests. That the file holds no parse or version-refusal code of its own is a structural fact
    about the source, not one any test can falsify on its own: a duplicated, unreachable copy of that
    logic would leave every one of these tests passing.'
- criterion: The reading generates no connector configuration draft and issues no register-connector call.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
    name: answers with exactly the operations it read, generating no connector configuration draft and
      issuing no register-connector call
  why: The test asserts the answer's own shape carries nothing beyond { operations }, which rules out
    a draft riding along in the same answer, but no test spies on or otherwise proves the absence of a
    call to any register-connector path; the function's own file imports no registry module at all, which
    is a structural fact rather than one this test demonstrates.
- criterion: A request naming one OpenAPI document link is answered with every operation the fetched document
    declares, each entry carrying a path and an upper-cased method.
  state: covered
  tests:
  - file: src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
    name: answers 200 with exactly the fetched document's every operation, each entry carrying exactly
      its own path and upper-cased method and no other key, and forwards the request's own link unchanged
      to the injected fetcher, for a request naming one OpenAPI document link
- criterion: The request body is validated by a zod schema in src/src/http/dto, following the project's
    routes/controller/dto triplet rather than a shape of its own.
  state: covered
  tests:
  - file: src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
    name: refuses with 400 VALIDATION_ERROR and issues no fetch, for a request naming no document link
      at all
  - file: src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
    name: refuses with 400 VALIDATION_ERROR and issues no fetch, for a request whose link is not a string
- criterion: A request naming no document link, or naming one that is not a string, is rejected by the
    route handler as a VALIDATION_ERROR with HTTP 400, and no fetch is issued.
  state: covered
  tests:
  - file: src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
    name: refuses with 400 VALIDATION_ERROR and issues no fetch, for a request naming no document link
      at all
  - file: src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
    name: refuses with 400 VALIDATION_ERROR and issues no fetch, for a request whose link is not a string
- criterion: The controller maps the validated DTO and its injected dependencies onto the reading and
    holds no logic of its own.
  state: partial
  tests:
  - file: src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
    name: answers 200 with exactly the fetched document's every operation, each entry carrying exactly
      its own path and upper-cased method and no other key, and forwards the request's own link unchanged
      to the injected fetcher, for a request naming one OpenAPI document link
  why: Every route-level test observes correct end-to-end behavior through the controller, consistent
    with a pure pass-through, but no test isolates the controller from the reading it forwards to; a controller
    that added conditional logic which happened to preserve every asserted outcome would not be caught.
- criterion: The route plugin factory is registered in src/src/http/build-app.ts's routePluginFactories
    and its dependencies composed in src/src/factories/build-app.factory.ts, so the operation is reachable
    on an app built by the factory with no further wiring.
  state: covered
  tests:
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: reaches its own controller rather than answering 404, for the read-openapi-document-operations
      route
- criterion: Every error class this operation can raise already has an entry in src/src/errors/status-map.ts's
    STATUS_BY_ERROR_CLASS, so no refusal falls through to the generic handler.
  state: covered
  tests:
  - file: src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotFetchedError naming the fetch failure -- never swallowing
      it into 200 with an empty operations list, and never falling through to the generic 500 handler
      -- when the named link cannot be fetched at all
  - file: src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotReadableError naming its own distinct condition, never
      conflated with either of the other two, reading no operations, when $description
- criterion: The operation registers nothing and issues no register-connector call.
  state: partial
  tests:
  - file: src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
    name: answers 200 with exactly the fetched document's every operation, each entry carrying exactly
      its own path and upper-cased method and no other key, and forwards the request's own link unchanged
      to the injected fetcher, for a request naming one OpenAPI document link
  why: No test spies on or otherwise proves the absence of a register-connector call; the controller,
    routes and dependency-wiring files import no registry path at all, a structural fact rather than one
    this test demonstrates.
findings:
- file: src/connector-registry/openapi-document-reader.ts
  where: lines 60-62, isPlainObject
  cites: MNT-03
  evidence: "function isPlainObject(value: unknown): value is OpenApiDocument {\n  return typeof value\
    \ === 'object' && value !== null && !Array.isArray(value);\n}"
  cost: The identical three-line predicate is now defined separately in openapi-document-reader.ts, openapi-operation-reader.ts
    and openapi-document-operations-reader.ts rather than shared from one; a future change to what counts
    as a plain object has to be found and applied in three places by hand, and nothing stops the three
    from silently drifting apart.
  correction: Export isPlainObject once (e.g. from openapi-document-reader.ts) and import it in openapi-operation-reader.ts
    and openapi-document-operations-reader.ts.
  pass: standard
- file: src/connector-registry/openapi-document-operations-reader.ts
  where: lines 49-51, isPlainObject
  cites: MNT-03
  evidence: "function isPlainObject(value: unknown): value is Readonly<Record<string, unknown>> {\n  return\
    \ typeof value === 'object' && value !== null && !Array.isArray(value);\n}"
  cost: A third, independently-typed copy of the same predicate this delivery already wrote once in openapi-document-reader.ts
    and left standing once more in openapi-operation-reader.ts; the module now carries three sources of
    truth for one three-line check.
  correction: Import isPlainObject from openapi-document-reader.ts instead of redefining it here.
  pass: standard
reconciliation: siegard-reconcile/connector-configuration-helper-operation-listing-backend.md
---

## What it is

The review of the three tasks that make up epic openapi-document-operations-read, over the whole change together rather than each task alone.

## Notes

None.
