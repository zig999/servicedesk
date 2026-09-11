---
target: backend
title: The extracted OpenAPI parse-and-version-refusal unit, tested directly, with the draft operation's
  preserved behavior evidenced from the tests already standing over it
summary: Five new tests exercise readOpenApiDocument's own contract directly (whole-document return, both
  parse failures, both version refusals, the new paths well-formedness check), and the unmodified openapi-operation-reader
  and draft-connector-configuration-from-openapi suites are cited as the standing evidence that the draft
  operation's behavior is unchanged.
implementation: sha256:4030758342bc43a86e175be007dafc8f268296d4f8ba9a91b0bfea29cc9bde9d
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/openapi-document-operations-read-shared-openapi-document-parse-step-suite
tests:
- file: src/__tests__/unit/connector-registry/openapi-document-reader.spec.ts
  name: returns the fetched document parsed whole, with every top-level member and every path it declares,
    performing no path or method lookup
  proves: A single unit in src/src/connector-registry accepts a fetched document's text, parses it as
    JSON and then as YAML, and returns the parsed OpenAPI document without performing any path or method
    lookup. (and, jointly, that the unit does not refuse a fetched document that parses as a well-formed
    OpenAPI 3.x document.)
  fails_when: readOpenApiDocument throws for this well-formed document, or returns anything other than
    the document's own full parsed shape -- e.g. a single extracted operation, a subset of its top-level
    members, or a value narrowed to one path.
- file: src/__tests__/unit/connector-registry/openapi-document-reader.spec.ts
  name: refuses text that parses as neither JSON nor YAML, naming the fetched document text as what failed
    to parse
  proves: That unit refuses text that parses as neither JSON nor YAML, naming what failed to parse.
  fails_when: 'readOpenApiDocument stops throwing OpenApiDocumentNotReadableError with context { kind:
    ''unparseable'', detail: ''the fetched document text'' } for text that fails to parse under both JSON.parse
    and the YAML loader.'
- file: src/__tests__/unit/connector-registry/openapi-document-reader.spec.ts
  name: refuses a document whose declared openapi version is present but outside the 3.x line, naming
    the declared version
  proves: That unit refuses a parsed document whose declared version is present but is not OpenAPI 3.x,
    naming the declared version, and returns no document.
  fails_when: 'readOpenApiDocument stops throwing OpenApiDocumentNotReadableError with context { kind:
    ''unsupported-version'', declaredVersion: ''2.5.0'' } for a document declaring openapi: ''2.5.0''.'
- file: src/__tests__/unit/connector-registry/openapi-document-reader.spec.ts
  name: refuses a document declaring neither an openapi nor a swagger field, naming that no version was
    declared
  proves: That unit refuses a parsed document that declares no version at all, naming that the document
    declares no version, distinct from a parse failure and from a declared-but-unsupported version, and
    returns no document.
  fails_when: 'readOpenApiDocument stops throwing OpenApiDocumentNotReadableError with context exactly
    { kind: ''no-version-declared'' } for a document with a paths member but no openapi or swagger field.'
- file: src/__tests__/unit/connector-registry/openapi-document-reader.spec.ts
  name: refuses a document whose paths member is not a plain object, even though its declared version
    is a supported OpenAPI 3.x one
  proves: UNDERDETERMINED, from the specification -- rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft
    refuses a document that parses as one of the two serializations but is not a well-formed OpenAPI document,
    and no criterion reaches that clause beyond the version check; a unit checking only parse success
    and version, accepting a document whose paths member is not even an object, would pass every stated
    criterion.
  fails_when: readOpenApiDocument accepts (returns, rather than refuses) a document whose declared version
    is OpenAPI 3.x but whose paths member is not an object -- exactly the implementation the task's UNDERDETERMINED
    note names as passing every stated criterion while leaving that clause of the rule unanswered.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: refuses a document declaring swagger 2.0, naming the declared version
  proves: A draft requested from a fetched document declaring swagger 2.0 is still refused naming the
    declared version, and no draft is generated.
  fails_when: readOpenApiOperation (and therefore the draft it feeds) stops refusing a swagger:2.0 document,
    or stops naming '2.0' as the declared version in the refusal's context.
  demonstrates: scenarios/integration/a-swagger-2-document-refuses-the-draft
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: refuses text that parses as neither JSON nor a YAML mapping, naming what failed to parse
  proves: A draft requested from a fetched document whose text parses as neither JSON nor YAML is still
    refused naming what failed to parse.
  fails_when: readOpenApiOperation stops refusing unparseable text, or stops naming 'the fetched document
    text' in the refusal.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: reads a document served as YAML exactly as one served as JSON, deciding the serialization only
    by parsing the text
  proves: A YAML OpenAPI 3.x document still yields the same draft a JSON document of the same content
    yields, the serialization decided by parsing the text and never by a declared content type.
  fails_when: a YAML document and a JSON document of the same content stop producing the identical OpenApiOperationReading.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: refuses when the document declares no entry at all for the requested path, naming that path and
    method
  proves: A draft requested for a path and method pairing the fetched document declares no operation for
    is still refused with OpenApiOperationNotFoundError naming that path and that method. (the path-absent
    boundary)
  fails_when: readOpenApiOperation stops refusing, or stops naming the exact path and method, when the
    document declares no entry at all for the requested path.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: refuses when the path exists but declares no operation under the requested method
  proves: A draft requested for a path and method pairing the fetched document declares no operation for
    is still refused with OpenApiOperationNotFoundError naming that path and that method. (the method-absent-under-an-existing-path
    boundary)
  fails_when: readOpenApiOperation stops refusing, or stops naming the exact path and method, when the
    path exists but the requested method is absent under it.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: refuses a document that parses to an object declaring neither an openapi nor a swagger field,
    naming that no version was declared
  proves: UNDERDETERMINED, from the specification -- no criterion binds the 'declares no version' refusal
    to reusing OpenApiDocumentNotReadableError rather than a new error class of its own, though the rule's
    own decision log states that naming lands inside the one unreadable-document refusal already stated,
    taking no further error value.
  fails_when: 'the no-version-declared refusal is raised through any error class other than OpenApiDocumentNotReadableError
    -- the test''s helper rethrows anything else, failing the test -- or its context stops being exactly
    { kind: ''no-version-declared'' }.'
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: keeps OpenApiDocumentNotReadableError and OpenApiOperationNotFoundError as two distinct values,
    neither an instance of the other
  proves: No error class, message or context readOpenApiOperation previously raised is renamed, retyped
    or dropped.
  fails_when: OpenApiDocumentNotReadableError and OpenApiOperationNotFoundError stop being two distinct
    classes (e.g. one becomes an instance of the other), or either one's name is changed.
- file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  name: returns the operation's own method key exactly as the document spells it, regardless of the requested
    method's own casing
  proves: readOpenApiOperation obtains its parsed document from that unit and holds no parsing, version-checking
    or version-refusal code of its own. (the observable half of the criterion -- correct delegation)
  fails_when: readOpenApiOperation stops returning a correct reading for a well-formed document, which
    would follow if its delegation to readOpenApiDocument were broken or duplicated incorrectly.
- file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  name: answers 422 reporting OpenApiDocumentNotReadableError naming what failed to parse, when the fetched
    text does not parse to a document
  proves: The existing tests covering draft-connector-configuration-from-openapi pass with no test amended
    to accommodate the extraction, exercised here at the full draft-request level for the unparseable-text
    refusal.
  fails_when: a draft request over an unparseable fetched document stops answering 422 with OpenApiDocumentNotReadableError
    naming 'the fetched document text'.
- file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  name: answers 422 reporting OpenApiOperationNotFoundError naming exactly the requested path and method,
    when the document declares no such operation
  proves: The existing tests covering draft-connector-configuration-from-openapi pass with no test amended
    to accommodate the extraction, exercised here at the full draft-request level for the operation-not-found
    refusal.
  fails_when: a draft request for a path/method pairing the document declares no operation for stops answering
    422 with OpenApiOperationNotFoundError naming that exact path and method.
- file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  name: answers 200 with exactly connector, configuration, unresolved and generated_credentials -- and
    no method_mismatch key at all -- for an operation with no parameters, no security scheme and no configuration
    currently registered for the connector
  proves: The existing tests covering draft-connector-configuration-from-openapi pass with no test amended
    to accommodate the extraction, exercised here at the full draft-request level for the well-formed-document
    happy path.
  fails_when: a draft request over a well-formed OpenAPI 3.x document stops answering 200 with the draft
    it always produced.
not_applicable:
- edge_case: A uniqueness violation over the parsed document
  why: readOpenApiDocument reads one fetched text and returns one document; there is no collection or
    constraint over which two documents could conflict.
- edge_case: Two operations against one subject at once (a concurrency race)
  why: readOpenApiDocument is a pure synchronous function over its own input with no shared mutable state;
    nothing here is held between calls for two calls to race over.
- edge_case: A dependency that fails, is unavailable or answers slowly
  why: the unit performs no I/O of any kind -- it parses text already in hand; the fetch that produced
    that text is the already-delivered fetch stage this task's own Notes mark as untouched.
- edge_case: An operation attempted against state that forbids it
  why: there is no persisted state a call to readOpenApiDocument reads or writes; each call is decided
    entirely by the text it is given.
untested:
- 'rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft states, as one fact,
  that a document parsing as one of the two serializations but not a well-formed OpenAPI document is refused.
  No finite test decides that clause whole: the implementation narrows it to one example (a non-object
  paths member), exactly as the task''s own UNDERDETERMINED note directs and as the implementation record''s
  own inference records; a document malformed in any other way a well-formed OpenAPI document forbids
  (e.g. an operation entry that is not an object, a non-string HTTP method key, a $ref shaped as something
  other than a string) is not refused by anything this unit checks, and no test here or in the existing
  suite decides it. Left as a reading on duty, matching what the task''s own note already flagged rather
  than closing it.'
- rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-draft states one fact
  bundling two refusal boundaries (an absent path; a path present with the requested method absent under
  it) and a success condition (the operation found is the one every other draft rule reads). Each of the
  three is individually protected by a separate pre-existing test in openapi-operation-reader.spec.ts,
  a file this task leaves entirely untouched, but no single test in the tree decides the fact whole in
  one place. Writing a new consolidated test over logic this task did not change would only re-assert
  what those tests already establish under a different name, so this is left as a reading on duty rather
  than pinned by a new test.
- rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document states,
  as one comparative fact, that the two refusals are told apart and answered under their own error values.
  Each half is separately exercised across several pre-existing tests in draft-connector-configuration-from-openapi.routes.spec.ts,
  a file this task did not touch, but no single test decides the whole comparative fact, and this task
  relocates only the unreadable-document half's internal file, touching none of the status-mapping wiring
  the contrast itself depends on. Left as a reading on duty.
divergences:
- cites: MNT-03
  file: src/__tests__/unit/connector-registry/openapi-document-reader.spec.ts
  departure: A small notReadableErrorThrownBy catch-and-rethrow helper is defined locally in this file,
    duplicating the same shape already defined as readableErrorThrownBy in the sibling openapi-operation-reader.spec.ts,
    rather than importing one shared helper.
  why: No shared test-utilities module exists for connector-registry's tests -- the implementation itself
    duplicates isPlainObject across the two production files rather than sharing it, citing this module's
    existing convention of no shared-utilities import -- and every existing spec file in this project
    defines its own local assertion helpers rather than importing one from a sibling spec file.
---

## What it is

Five tests over readOpenApiDocument's own contract, plus the standing, unmodified openapi-operation-reader and draft-connector-configuration-from-openapi suites cited as evidence that the extraction changed nothing about the draft operation's behavior.

## Notes

None.
