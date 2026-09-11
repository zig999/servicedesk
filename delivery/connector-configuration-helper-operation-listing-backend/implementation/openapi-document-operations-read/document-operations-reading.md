---
target: backend
task: sha256:8b33f15ee77eb1d34b49fe4258d7afd32ae416bd7cec653a11bb14c8674cd9a4
title: The domain reading behind read-openapi-document-operations
summary: A new connector-registry unit fetches an operator-named OpenAPI document link through the existing
  IOpenApiDocumentFetcher port, parses it through the shared parse step, and answers every path-item operation
  it declares as a path-and-upper-cased-method pair, or lets the fetch or parse refusal already raised
  by those units propagate unchanged.
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/openapi-document-operations-read-document-operations-reading-build
files:
- path: src/connector-registry/openapi-document-operations-reader.ts
  effect: 'New module exporting OpenApiOperation ({path, method}), OpenApiDocumentOperations ({operations}),
    and the async readOpenApiDocumentOperations({link, documentFetcher}), which awaits documentFetcher.fetchOpenApiDocument(link),
    passes the fetched text through readOpenApiDocument, and turns every path-item key in the parsed document
    paths member that names one of the eight OpenAPI HTTP methods (case-insensitively) into a {path, method:
    UPPERCASE} entry, in the document own path and key order; holds no fetch timeout, no JSON/YAML parsing
    and no version check of its own.'
criteria:
- criterion: A fetched document declaring one path /items with a get operation and a post operation under
    it is read as two entries, one naming /items with GET and one naming /items with POST.
  met: true
  how: operationsAt reads Object.keys(pathItem) in the path item's own declared order and maps each recognized
    method key to {path, method}; a path item declaring get then post under /items yields [{path:'/items',method:'GET'},{path:'/items',method:'POST'}]
    in that order.
- criterion: Every entry's method is upper-cased whatever case the document's own path-item key named
    it under.
  met: true
  how: isOpenApiMethodKey compares key.toLowerCase() against the fixed OPENAPI_PATH_ITEM_METHODS list,
    and the emitted method is always key.toUpperCase(), so a key spelled Get, GET or get all produce method
    GET.
- criterion: Every entry names the path exactly as the document declares it.
  met: true
  how: The path field of each entry is the untouched string key from Object.entries(document.paths), never
    rewritten, trimmed or normalized.
- criterion: Every operation the document declares is answered in one answer, the read accepting no page,
    cursor, offset or limit and truncating nothing.
  met: true
  how: ReadOpenApiDocumentOperationsOptions carries only link and documentFetcher; operationsDeclaredBy
    flatMaps every path in document.paths with no slicing, no limit and no cursor, returning the whole
    array in one resolved promise.
- criterion: A read whose named link fails with a network failure, a timeout, or a response outside the
    2xx range is refused naming the fetch failure, with no parse attempted and no operations read.
  met: true
  how: readOpenApiDocumentOperations awaits documentFetcher.fetchOpenApiDocument(link) before calling
    readOpenApiDocument at all; a rejection from the existing OpenApiDocumentFetcher (network failure,
    timeout or status-outside-2xx) propagates out of this function unchanged, and operationsDeclaredBy
    is never reached.
- criterion: The fetch is abandoned as a timeout where the named link has not answered within 60000 milliseconds,
    delivered by the existing IOpenApiDocumentFetcher port rather than by a second timeout introduced
    here.
  met: true
  how: This file defines no AbortController, no setTimeout and no timeout constant; the 60_000ms abandonment
    lives only in the existing, unmodified OpenApiDocumentFetcher adapter behind the IOpenApiDocumentFetcher
    parameter this function receives and calls as-is.
- criterion: A read whose fetched document declares swagger 2.0 is refused naming the declared version,
    and no operations are read.
  met: true
  how: 'readOpenApiDocument''s refuseUnsupportedVersion throws OpenApiDocumentNotReadableError({kind:
    ''unsupported-version'', declaredVersion: ''2.0''}) before readOpenApiDocumentOperations''s return
    statement is reached, so operationsDeclaredBy never runs.'
- criterion: A read whose fetched document's text parses as neither JSON nor YAML is refused naming what
    failed to parse, and no operations are read.
  met: true
  how: 'readOpenApiDocument''s parsedOpenApiDocument path throws OpenApiDocumentNotReadableError({kind:
    ''unparseable'', detail: ''the fetched document text''}) before any paths member is read.'
- criterion: A read whose fetched document parses but declares no version at all -- neither an openapi
    field nor a swagger field -- is refused naming that the document declares no version, that naming
    distinct from a parse failure and from a declared-but-unsupported version, and no operations are read.
  met: true
  how: 'readOpenApiDocument''s refuseUnsupportedVersion final branch throws OpenApiDocumentNotReadableError({kind:
    ''no-version-declared''}), a third discriminant distinct from ''unparseable'' and ''unsupported-version'',
    reached only when neither an openapi nor a swagger field is a string; no operations are read past
    that throw.'
- criterion: A YAML OpenAPI 3.x document is read into the same operations a JSON document of the same
    content is read into, the serialization decided by parsing the fetched text and never by any content
    type the response declared.
  met: true
  how: readOpenApiDocument tries JSON.parse then js-yaml's load with no content-type read anywhere; a
    YAML and a JSON document of the same content parse to the same plain object, so operationsDeclaredBy
    produces the identical operations array from either.
- criterion: The document fetch is issued inside this backend reading through IOpenApiDocumentFetcher,
    and the reading offers no parameter by which a caller supplies already-fetched document text.
  met: true
  how: ReadOpenApiDocumentOperationsOptions declares only link (string) and documentFetcher (IOpenApiDocumentFetcher);
    there is no documentText or equivalent parameter, so the fetch inside this function is the only way
    text reaches it.
- criterion: The reading parses through the unit task/openapi-document-operations-read/shared-openapi-document-parse-step
    established, holding no parse or version-refusal code of its own.
  met: true
  how: The only parsing call is readOpenApiDocument(documentText), imported from openapi-document-reader.ts;
    this file contains no JSON.parse, no YAML load and no version-field check anywhere in its own body.
- criterion: The reading generates no connector configuration draft and issues no register-connector call.
  met: true
  how: This file imports nothing from connector-configuration-draft-generation.ts or any register-connector
    path, and returns only {operations}; it produces no ConnectorConfigurationDraft and calls no registry
    method.
nodes:
- node: domain/integration/openapi-operation
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
  how: 'OpenApiOperation is declared as Readonly<{path: string; method: string}>, and every entry operationsAt
    emits carries exactly those two attributes -- the path it is declared under and its method upper-cased.'
- node: domain/integration/openapi-document-operations
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
  how: 'readOpenApiDocumentOperations returns Readonly<{operations: readonly OpenApiOperation[]}>, holding
    every operation read fresh from one fetch of the operator-named link and answered whole, never as
    a paged listing.'
- node: contracts/integration/openapi-document-operations
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
  how: This task supplies the domain reading the contract's read-openapi-document-operations operation
    calls -- fetching the same operator-named document, generating no draft and issuing no register-connector
    call, exactly as the contract's own description states. Publishing it as the reachable HTTP operation
    is task/openapi-document-operations-read/read-operations-http-operation, per this task's own rationale
    separating the read from how it is published.
- node: rules/integration/an-openapi-operations-method-is-upper-cased
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
  how: isOpenApiMethodKey recognizes a path-item key against the eight OpenAPI HTTP method names case-insensitively,
    and every emitted entry method is that key own .toUpperCase() form, so the listing states GET/POST/etc.
    regardless of the case the document path-item key used.
- node: rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
  how: readOpenApiDocumentOperations awaits documentFetcher.fetchOpenApiDocument(link) fully before calling
    readOpenApiDocument, so a network failure, timeout or non-2xx status raised by the existing, unmodified
    OpenApiDocumentFetcher adapter propagates as OpenApiDocumentNotFetchedError and no parse is ever attempted;
    this task adds no fetch, no timeout and no refusal code of its own for this rule.
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
  how: readOpenApiDocumentOperations obtains its document exclusively through readOpenApiDocument (the
    shared parse-step unit already delivered), holding no parsing, version-checking or version-refusal
    code of its own; that unit already refuses unparseable text, any non-3.x openapi/swagger version and
    a no-version-declared document, each named distinctly, before this reading's own operationsDeclaredBy
    is ever reached.
- node: scenarios/integration/a-swagger-2-document-refuses-the-operations-read
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
  how: A fetched document declaring swagger 2.0 is refused by readOpenApiDocument's version check, naming
    the declared version '2.0', before this reading's own logic runs; no operations are ever produced
    for such a document, matching this scenario's given/when/then.
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
  how: The document link is fetched from this backend domain reading through the IOpenApiDocumentFetcher
    port; the function accepts only a link and a fetcher and offers no parameter for a caller to supply
    already-fetched text, so this reading is the one place the link is ever fetched.
inferences:
- inferred: The recognized path-item method keys are the eight OpenAPI 3.x Path Item Object HTTP fields
    -- get, put, post, delete, options, head, patch, trace -- matched case-insensitively.
  from: No node enumerates the set explicitly; it is the OpenAPI 3.x format's own fixed vocabulary that
    domain/integration/openapi-document-operations presupposes when it speaks of path-item operations,
    and the case-insensitive match follows directly from rules/integration/an-openapi-operations-method-is-upper-cased's
    own premise that a path-item key may be spelled in a case other than lower-case.
- inferred: A path item declared as a $ref pointer (rather than an inline object) is not resolved and
    yields no operations for that path.
  from: No node addresses path-item-level $ref for this listing, and only the single-operation lookup
    in openapi-operation-reader.ts resolves $ref -- a capability this task's own criteria never ask the
    operations listing to reuse.
- inferred: isPlainObject is kept as a small private predicate duplicated in this file rather than imported
    from openapi-document-reader.ts or openapi-operation-reader.ts.
  from: Neither the inventory nor the standard names a shared-utilities module for connector-registry,
    and the prior delivery over this same module (shared-openapi-document-parse-step) already made and
    recorded this same call for its own new file.
- inferred: Operations are listed in document declaration order -- the order document.paths own keys appear
    in, and within each path item the order its own method keys appear in -- rather than a fixed canonical
    method ordering.
  from: No node states an ordering requirement beyond every operation being answered in one answer; reading
    the document own key order (which Object.keys/Object.entries preserve for string keys) is the plainest
    reading of read that adds no ordering the document did not itself express.
---

## What it is

The domain reading behind read-openapi-document-operations: fetches an operator-named OpenAPI document link through IOpenApiDocumentFetcher, parses it through the shared parse step, and turns every recognized path-item operation into a path/upper-cased-method entry, answered whole.

## Notes

None.
