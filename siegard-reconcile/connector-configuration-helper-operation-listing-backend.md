---
contract_version: siegard-reconcile/5
title: Backend review — Configuration Helper operation listing
summary: Tasks task/openapi-document-operations-read/shared-openapi-document-parse-step, task/openapi-document-operations-read/document-operations-reading
  and task/openapi-document-operations-read/read-operations-http-operation, delivered under initiative
  connector-configuration-helper-operation-listing-backend, extract the OpenAPI parse/version-refusal
  step, add the operations-read domain reading, and publish it over HTTP as read-openapi-document-operations.
target: backend
files:
- path: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
  change: written by the delivery of task/openapi-document-operations-read/document-operations-reading
- path: src/__tests__/unit/connector-registry/openapi-document-reader.spec.ts
  change: written by the delivery of task/openapi-document-operations-read/shared-openapi-document-parse-step
- path: src/__tests__/unit/http/build-app.spec.ts
  change: written by the delivery of task/openapi-document-operations-read/read-operations-http-operation
- path: src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
  change: written by the delivery of task/openapi-document-operations-read/read-operations-http-operation
- path: src/connector-registry/openapi-document-operations-reader.ts
  change: written by the delivery of task/openapi-document-operations-read/document-operations-reading
- path: src/connector-registry/openapi-document-reader.ts
  change: written by the delivery of task/openapi-document-operations-read/shared-openapi-document-parse-step
- path: src/connector-registry/openapi-operation-reader.ts
  change: written by the delivery of task/openapi-document-operations-read/shared-openapi-document-parse-step
- path: src/factories/build-app.factory.ts
  change: written by the delivery of task/openapi-document-operations-read/read-operations-http-operation
- path: src/http/build-app.ts
  change: written by the delivery of task/openapi-document-operations-read/read-operations-http-operation
- path: src/http/dto/read-openapi-document-operations.dto.ts
  change: written by the delivery of task/openapi-document-operations-read/read-operations-http-operation
- path: src/http/read-openapi-document-operations.controller.ts
  change: written by the delivery of task/openapi-document-operations-read/read-operations-http-operation
- path: src/http/read-openapi-document-operations.routes.ts
  change: written by the delivery of task/openapi-document-operations-read/read-operations-http-operation
nodes:
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  conforms: true
  how: 'src/http/read-openapi-document-operations.routes.ts: held at the safeParse branch — return reply.code(400).send({
    error: { code: ''VALIDATION_ERROR'', message: ''the request body failed validation'', details: issues
    } });'
  encoded_at:
  - src/http/read-openapi-document-operations.routes.ts
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  conforms: true
  how: 'src/connector-registry/openapi-document-operations-reader.ts: held at the only fetch of the link
    in this reading (line 24) — const documentText = await documentFetcher.fetchOpenApiDocument(link);

    src/factories/build-app.factory.ts: held at composes a server-side OpenApiDocumentFetcher instance
    for the operation — const dependencies: ReadOpenApiDocumentOperationsControllerDependencies = { documentFetcher:
    new OpenApiDocumentFetcher() };

    src/http/read-openapi-document-operations.controller.ts: held at the fetch runs only through the injected
    documentFetcher this controller forwards, never issuing one itself — readOpenApiDocumentOperations({
    link: body.link, documentFetcher: dependencies.documentFetcher })'
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
  - src/factories/build-app.factory.ts
  - src/http/read-openapi-document-operations.controller.ts
- node: contracts/glossary/glossary-authoring
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at elsewhere in this file, pre-existing and untouched
    by this delivery — This delivery''s diff against this file is purely additive (one import, one routePluginFactories/BuildAppDependencies
    entry, or one wiring function and one spread); nothing this pre-existing binding depends on was removed
    or reshaped.

    src/http/build-app.ts: held at elsewhere in this file, pre-existing and untouched by this delivery
    — This delivery''s diff against this file is purely additive (one import, one routePluginFactories/BuildAppDependencies
    entry, or one wiring function and one spread); nothing this pre-existing binding depends on was removed
    or reshaped.'
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: contracts/integration/capability-registry
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at elsewhere in this file, pre-existing and untouched
    by this delivery — This delivery''s diff against this file is purely additive (one import, one routePluginFactories/BuildAppDependencies
    entry, or one wiring function and one spread); nothing this pre-existing binding depends on was removed
    or reshaped.

    src/http/build-app.ts: held at elsewhere in this file, pre-existing and untouched by this delivery
    — This delivery''s diff against this file is purely additive (one import, one routePluginFactories/BuildAppDependencies
    entry, or one wiring function and one spread); nothing this pre-existing binding depends on was removed
    or reshaped.'
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: contracts/integration/connector-configuration-draft
  conforms: true
  how: 'src/http/build-app.ts: held at elsewhere in this file, pre-existing and untouched by this delivery
    — This delivery''s diff against this file is purely additive (one import, one routePluginFactories/BuildAppDependencies
    entry, or one wiring function and one spread); nothing this pre-existing binding depends on was removed
    or reshaped.'
  encoded_at:
  - src/http/build-app.ts
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at elsewhere in this file, pre-existing and untouched
    by this delivery — This delivery''s diff against this file is purely additive (one import, one routePluginFactories/BuildAppDependencies
    entry, or one wiring function and one spread); nothing this pre-existing binding depends on was removed
    or reshaped.'
  encoded_at:
  - src/factories/build-app.factory.ts
- node: contracts/integration/openapi-document-operations
  conforms: true
  how: 'src/connector-registry/openapi-document-operations-reader.ts: held at readOpenApiDocumentOperations,
    the reading the contract''s operation calls — export async function readOpenApiDocumentOperations(options:
    ReadOpenApiDocumentOperationsOptions): Promise<OpenApiDocumentOperations> { ... }

    src/factories/build-app.factory.ts: held at readOpenApiDocumentOperationsDependencies, spread into
    buildAppDependencies()''s return — function readOpenApiDocumentOperationsDependencies(): Pick<BuildAppDependencies,
    ''readOpenApiDocumentOperations''> { ... }

    src/http/build-app.ts: held at routePluginFactories''s appended entry and BuildAppDependencies''s
    readOpenApiDocumentOperations field — (dependencies) => createReadOpenApiDocumentOperationsRoutesPlugin(dependencies.readOpenApiDocumentOperations),

    src/http/read-openapi-document-operations.controller.ts: held at handleReadOpenApiDocumentOperationsRequest,
    the controller for the contract''s operation — export async function handleReadOpenApiDocumentOperationsRequest(...)

    src/http/read-openapi-document-operations.routes.ts: held at createReadOpenApiDocumentOperationsRoutesPlugin,
    registering POST /v1/read-openapi-document-operations — app.post(`${API_PREFIX}/read-openapi-document-operations`,
    (request, reply) => readOpenApiDocumentOperationsHandler(dependencies, request, reply));'
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
  - src/http/read-openapi-document-operations.controller.ts
  - src/http/read-openapi-document-operations.routes.ts
- node: contracts/knowledge/case-input-requirements
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at elsewhere in this file, pre-existing and untouched
    by this delivery — This delivery''s diff against this file is purely additive (one import, one routePluginFactories/BuildAppDependencies
    entry, or one wiring function and one spread); nothing this pre-existing binding depends on was removed
    or reshaped.

    src/http/build-app.ts: held at elsewhere in this file, pre-existing and untouched by this delivery
    — This delivery''s diff against this file is purely additive (one import, one routePluginFactories/BuildAppDependencies
    entry, or one wiring function and one spread); nothing this pre-existing binding depends on was removed
    or reshaped.'
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at elsewhere in this file, pre-existing and untouched
    by this delivery — This delivery''s diff against this file is purely additive (one import, one routePluginFactories/BuildAppDependencies
    entry, or one wiring function and one spread); nothing this pre-existing binding depends on was removed
    or reshaped.

    src/http/build-app.ts: held at elsewhere in this file, pre-existing and untouched by this delivery
    — This delivery''s diff against this file is purely additive (one import, one routePluginFactories/BuildAppDependencies
    entry, or one wiring function and one spread); nothing this pre-existing binding depends on was removed
    or reshaped.'
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: domain/integration/connector-configuration-registry
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at elsewhere in this file, pre-existing and untouched
    by this delivery — This delivery''s diff against this file is purely additive (one import, one routePluginFactories/BuildAppDependencies
    entry, or one wiring function and one spread); nothing this pre-existing binding depends on was removed
    or reshaped.

    src/http/build-app.ts: held at elsewhere in this file, pre-existing and untouched by this delivery
    — This delivery''s diff against this file is purely additive (one import, one routePluginFactories/BuildAppDependencies
    entry, or one wiring function and one spread); nothing this pre-existing binding depends on was removed
    or reshaped.'
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: domain/integration/openapi-document-operations
  conforms: true
  how: 'src/connector-registry/openapi-document-operations-reader.ts: held at OpenApiDocumentOperations
    type and readOpenApiDocumentOperations (lines 11-13, 20-27) — return { operations: operationsDeclaredBy(document)
    };

    src/http/read-openapi-document-operations.controller.ts: held at same return, unmodified — return
    readOpenApiDocumentOperations({ link: body.link, documentFetcher: dependencies.documentFetcher });

    src/http/read-openapi-document-operations.routes.ts: held at answers 200 with the controller''s result
    unchanged — return reply.code(200).send(result);'
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
  - src/http/read-openapi-document-operations.controller.ts
  - src/http/read-openapi-document-operations.routes.ts
  decided_by: test
  step: test
  proof:
  - src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
  - src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
- node: domain/integration/openapi-operation
  conforms: true
  how: 'src/connector-registry/openapi-document-operations-reader.ts: held at OpenApiOperation type and
    operationsAt (lines 6-9, 36-43) — export type OpenApiOperation = Readonly<{ path: string; method:
    string; }>;

    src/http/read-openapi-document-operations.controller.ts: held at returns readOpenApiDocumentOperations''s
    result unchanged — return readOpenApiDocumentOperations({ link: body.link, documentFetcher: dependencies.documentFetcher
    });'
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
  - src/http/read-openapi-document-operations.controller.ts
  decided_by: test
  step: test
  proof:
  - src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
  - src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
- node: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
  conforms: false
  how: 'no named file holds this fact now: src/connector-registry/openapi-operation-reader.ts read `nowhere`
    — This file only reads parameter names and locations (parametersOf/requestBodyFieldNamesOf/requiredSecuritySchemesOf);
    it assembles no address, query, header or body value for a draft -- that placement is connector-configuration-draft-generation.ts''s,
    outside this file set.'
  observed_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-connector-configuration-draft-states-the-chosen-operations-method
  conforms: false
  how: 'no named file holds this fact now: src/connector-registry/openapi-operation-reader.ts read `nowhere`
    — readOpenApiOperation returns method: operationKey, which is method.toLowerCase() (line 83) -- lower-cased,
    never upper-cased. Upper-casing this value into a draft is a fact of connector-configuration-draft-generation.ts,
    outside this file set. This binding predates the extraction and no longer matches what this file does.'
  observed_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at elsewhere in this file, pre-existing and untouched
    by this delivery — This delivery''s diff against this file is purely additive (one import, one routePluginFactories/BuildAppDependencies
    entry, or one wiring function and one spread); nothing this pre-existing binding depends on was removed
    or reshaped.'
  encoded_at:
  - src/factories/build-app.factory.ts
- node: rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  conforms: true
  how: 'src/connector-registry/openapi-document-reader.ts: held at produces the OpenApiDocumentNotReadableError
    value this rule requires the HTTP surface to report for an unreadable document — function notReadable(detail:
    string, cause?: unknown): OpenApiDocumentNotReadableError { return new OpenApiDocumentNotReadableError({
    kind: ''unparseable'', detail }, ...); }'
  encoded_at:
  - src/connector-registry/openapi-document-reader.ts
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft
  conforms: false
  how: 'the fact left part of its ground: still held in src/connector-registry/openapi-document-reader.ts,
    and src/connector-registry/openapi-operation-reader.ts read `nowhere` — readOpenApiOperation now delegates
    entirely to readOpenApiDocument(documentText) (line 46) for parsing and version refusal; the parsedOpenApiDocument/refuseUnsupportedVersion
    functions this rule once bound here were removed by this delivery''s own shared-parse-step task and
    now live only in openapi-document-reader.ts. — a binding asserts the file answers for the node, so
    the pair that stopped holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/connector-registry/openapi-document-reader.ts
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read
  conforms: true
  how: 'src/connector-registry/openapi-document-operations-reader.ts: held at delegates to readOpenApiDocument
    (line 25), holding no parse or version-refusal code of its own — const document = readOpenApiDocument(documentText);

    src/http/read-openapi-document-operations.controller.ts: held at same unguarded propagation — no try/catch
    anywhere in this file'
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
  - src/http/read-openapi-document-operations.controller.ts
  decided_by: reading
  remainder: testable
  remainder_why: one input -- a request whose fetched document declares an out-of-range version other
    than 2.0 (e.g. openapi 4.0.0) -- against one expected result, a 422 naming that declared version at
    this route.
- node: rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-draft
  conforms: true
  how: 'src/connector-registry/openapi-operation-reader.ts: held at operationEntry (lines 80-89) — if
    (!isPlainObject(rawOperation)) { throw new OpenApiOperationNotFoundError(path, method); }'
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/an-openapi-operations-method-is-upper-cased
  conforms: true
  how: 'src/connector-registry/openapi-document-operations-reader.ts: held at operationsAt''s map (line
    42) — method: method.toUpperCase()'
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
  decided_by: test
  step: test
  proof:
  - src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
  - src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
- node: rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read
  conforms: true
  how: 'src/connector-registry/openapi-document-operations-reader.ts: held at the fetch await, before
    any parse (line 24) — const documentText = await documentFetcher.fetchOpenApiDocument(link);

    src/http/read-openapi-document-operations.controller.ts: held at no try/catch; the reading''s rejection
    propagates unchanged — export async function handleReadOpenApiDocumentOperationsRequest(...): Promise<OpenApiDocumentOperations>
    { return readOpenApiDocumentOperations(...); }'
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
  - src/http/read-openapi-document-operations.controller.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'one input against one expected result for each remaining case at this route: a fetcher
    rejecting with a timeout kind, and one rejecting with a status-outside-2xx kind, each answered 422
    naming that kind.'
- node: scenarios/integration/a-swagger-2-document-refuses-the-draft
  conforms: false
  how: 'the fact left part of its ground: still held in src/connector-registry/openapi-document-reader.ts,
    and src/connector-registry/openapi-operation-reader.ts read `nowhere` — The swagger-2.0 refusal this
    file once raised directly now lives in readOpenApiDocument (openapi-document-reader.ts), reached only
    through delegation (line 46). — a binding asserts the file answers for the node, so the pair that
    stopped holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/connector-registry/openapi-document-reader.ts
  - src/connector-registry/openapi-operation-reader.ts
- node: scenarios/integration/a-swagger-2-document-refuses-the-operations-read
  conforms: true
  how: 'src/connector-registry/openapi-document-operations-reader.ts: held at reached through readOpenApiDocument''s
    own swagger-2.0 refusal — const document = readOpenApiDocument(documentText);

    src/http/read-openapi-document-operations.controller.ts: held at reached through the same unguarded
    propagation — no try/catch anywhere in this file'
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
  - src/http/read-openapi-document-operations.controller.ts
  decided_by: test
  step: test
  proof:
  - src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
  - src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
unbound:
- src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
- src/__tests__/unit/connector-registry/openapi-document-reader.spec.ts
- src/__tests__/unit/http/build-app.spec.ts
- src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
- src/http/dto/read-openapi-document-operations.dto.ts
notes: 'Judged by 12 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/connector-configuration-helper-operation-listing-backend.returns/.

  Certified domain/integration/openapi-operation as decided by step `test`: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
  (reads a path declaring a get and a post operation into two entries naming that same path, one per method);
  src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts (answers 200 with exactly the
  fetched document''s every operation, each entry carrying exactly its own path and upper-cased method
  and no other key, and forwards the request''s own link unchanged to the injected fetcher, for a request
  naming one OpenAPI document link) would fail if the fact stopped holding.

  Certified domain/integration/openapi-document-operations as decided by step `test`: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
  (answers every operation across every path in one array, ignoring any page, cursor or limit-like field
  and truncating nothing); src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts (answers
  each of two requests naming a different link with that call''s own complete, freshly-read operations
  list -- never a cached or shortened one -- proving the read is neither cached across calls nor paged
  within one) would fail if the fact stopped holding.

  Certified rules/integration/an-openapi-operations-method-is-upper-cased as decided by step `test`: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
  (upper-cases every method regardless of the case the document''s own path-item key used); src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
  (upper-cases an operation''s method whatever case the fetched document''s own path-item key names it
  under) would fail if the fact stopped holding.

  Certification of rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read did not hold:
  the auditor answered `partial` — Only the network-failure fetch kind is exercised at this HTTP surface
  by the offered proof; the rule also names a timeout and a status-outside-2xx answer as fetch failures,
  and the sixty-second abandonment, neither exercised here -- both are tested only in openapi-document-operations-reader.spec.ts,
  a file not named as this node''s proof.. The node is decided by reading, and a certification standing
  on it from an earlier reconciliation is released by the bind. The remainder is testable: one input against
  one expected result for each remaining case at this route: a fetcher rejecting with a timeout kind,
  and one rejecting with a status-outside-2xx kind, each answered 422 naming that kind..

  Certification of rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read
  did not hold: the auditor answered `partial` — The three named conditions (unparseable, no-version-declared,
  swagger 2.0) are each exercised distinctly at this HTTP surface. The rule also refuses any other out-of-range
  declared version (e.g. openapi 4.0.0, swagger 1.2), which the offered proof does not exercise at this
  surface -- that case is tested only in openapi-document-operations-reader.spec.ts, a file not named
  as this node''s proof.. The node is decided by reading, and a certification standing on it from an earlier
  reconciliation is released by the bind. The remainder is testable: one input -- a request whose fetched
  document declares an out-of-range version other than 2.0 (e.g. openapi 4.0.0) -- against one expected
  result, a 422 naming that declared version at this route..

  Certified scenarios/integration/a-swagger-2-document-refuses-the-operations-read as decided by step
  `test`: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts (refuses a
  document declaring swagger 2.0, naming the declared version, with no operations read); src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
  (refuses the read, naming the declared version and reading no operations, when an OpenAPI document link
  answers a document declaring swagger 2.0) would fail if the fact stopped holding.

  Certification of scenarios/integration/a-swagger-2-document-refuses-the-draft held (src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  would fail if the fact stopped holding) and is not written: the judgment did not clear the node, and
  a test-decided binding rests on a reading that did.

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft,
  rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-draft, rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document,
  scenarios/integration/a-swagger-2-document-refuses-the-draft, domain/integration/openapi-operation,
  domain/integration/openapi-document-operations, contracts/integration/openapi-document-operations, rules/integration/an-openapi-operations-method-is-upper-cased,
  rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read, rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read,
  scenarios/integration/a-swagger-2-document-refuses-the-operations-read, constraints/the-openapi-document-is-fetched-by-the-backend,
  rules/integration/an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document,
  constraints/a-malformed-request-is-refused-with-a-validation-error, constraints/a-domain-error-unmapped-by-status-is-refused-generically
  were read on every file and answered for, and bound from nowhere here — a binding this record writes
  is one the trace already held.

  Candidates: 0 opened across 0 of 12 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/connector-configuration-helper-operation-listing-backend.returns/`, which are the evidence behind every entry above.
