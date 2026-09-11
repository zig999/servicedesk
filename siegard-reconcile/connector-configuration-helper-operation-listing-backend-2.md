---
contract_version: siegard-reconcile/5
title: connector-configuration-helper-operation-listing-backend-2
summary: Second review over the backend initiative — the original 3 tasks (openapi-document-operations-read
  epic) plus the corrective GET-vs-POST transport fix delivered afterward.
target: backend
files:
- path: src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
  change: written by the delivery of task/openapi-document-operations-read/document-operations-reading
- path: src/__tests__/unit/connector-registry/openapi-document-reader.spec.ts
  change: written by the delivery of task/openapi-document-operations-read/shared-openapi-document-parse-step
- path: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  change: pre-existing, unmodified by this delivery
- path: src/__tests__/unit/http/build-app.spec.ts
  change: one assertion updated by the delivery of task/get-vs-post-mismatch/accept-get-for-read-openapi-document-operations
- path: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  change: pre-existing, unmodified by this delivery
- path: src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
  change: written by the delivery of task/openapi-document-operations-read/read-operations-http-operation,
    rewritten by the delivery of task/get-vs-post-mismatch/accept-get-for-read-openapi-document-operations
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
  change: written by the delivery of task/openapi-document-operations-read/read-operations-http-operation,
    rewritten by the delivery of task/get-vs-post-mismatch/accept-get-for-read-openapi-document-operations
- path: src/http/read-openapi-document-operations.controller.ts
  change: written by the delivery of task/openapi-document-operations-read/read-operations-http-operation,
    rewritten by the delivery of task/get-vs-post-mismatch/accept-get-for-read-openapi-document-operations
- path: src/http/read-openapi-document-operations.routes.ts
  change: written by the delivery of task/openapi-document-operations-read/read-operations-http-operation,
    rewritten by the delivery of task/get-vs-post-mismatch/accept-get-for-read-openapi-document-operations
nodes:
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  conforms: true
  how: 'src/http/read-openapi-document-operations.routes.ts: held at readOpenApiDocumentOperationsHandler
    — safeParse over request.query; on failure answers 400 with code VALIDATION_ERROR, a message naming
    the query, and a non-empty details list'
  encoded_at:
  - src/http/read-openapi-document-operations.routes.ts
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  conforms: true
  how: 'src/connector-registry/openapi-document-operations-reader.ts: held at ReadOpenApiDocumentOperationsOptions
    — declares only link and documentFetcher; no parameter accepts already-fetched text

    src/factories/build-app.factory.ts: held at OpenApiDocumentFetcher() instantiation — the same backend-side
    fetcher adapter class the draft operation uses, with its own 60s-timeout behavior

    src/http/read-openapi-document-operations.controller.ts: held at nowhere in this file — this file
    implements no fact of this node; it is part of the plan''s node set read on every file of this review,
    per the staging step'
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
  - src/factories/build-app.factory.ts
  - src/http/read-openapi-document-operations.controller.ts
- node: contracts/glossary/glossary-authoring
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at elsewhere in the module, unrelated to this delivery
    — a stale trace binding predating this delivery, belonging to a different operation this file also
    wires (capability registry, glossary authoring, case lifecycle, connector configuration registry)
    — this delivery''s own tasks neither implement nor touch this node''s fact, and this return does not
    clear it

    src/http/build-app.ts: held at elsewhere in the module, unrelated to this delivery — a stale trace
    binding predating this delivery, belonging to a different operation this file also wires (capability
    registry, glossary authoring, case lifecycle, connector configuration registry) — this delivery''s
    own tasks neither implement nor touch this node''s fact, and this return does not clear it'
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: contracts/integration/capability-registry
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at elsewhere in the module, unrelated to this delivery
    — a stale trace binding predating this delivery, belonging to a different operation this file also
    wires (capability registry, glossary authoring, case lifecycle, connector configuration registry)
    — this delivery''s own tasks neither implement nor touch this node''s fact, and this return does not
    clear it

    src/http/build-app.ts: held at elsewhere in the module, unrelated to this delivery — a stale trace
    binding predating this delivery, belonging to a different operation this file also wires (capability
    registry, glossary authoring, case lifecycle, connector configuration registry) — this delivery''s
    own tasks neither implement nor touch this node''s fact, and this return does not clear it'
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: contracts/integration/connector-configuration-draft
  conforms: true
  how: 'src/http/build-app.ts: held at elsewhere in the module, unrelated to this delivery — a stale trace
    binding predating this delivery, belonging to a different operation this file also wires (capability
    registry, glossary authoring, case lifecycle, connector configuration registry) — this delivery''s
    own tasks neither implement nor touch this node''s fact, and this return does not clear it'
  encoded_at:
  - src/http/build-app.ts
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at elsewhere in the module, unrelated to this delivery
    — a stale trace binding predating this delivery, belonging to a different operation this file also
    wires (capability registry, glossary authoring, case lifecycle, connector configuration registry)
    — this delivery''s own tasks neither implement nor touch this node''s fact, and this return does not
    clear it'
  encoded_at:
  - src/factories/build-app.factory.ts
- node: contracts/integration/openapi-document-operations
  conforms: true
  how: 'src/connector-registry/openapi-document-operations-reader.ts: held at readOpenApiDocumentOperations()
    — fetches the operator-named link, generates no draft, issues no register-connector call

    src/factories/build-app.factory.ts: held at readOpenApiDocumentOperationsDependencies() — composes
    {documentFetcher: new OpenApiDocumentFetcher()} into buildAppDependencies()''s returned object

    src/http/build-app.ts: held at routePluginFactories entry — the new route plugin factory is registered
    through the same app.register() sweep as every other route

    src/http/dto/read-openapi-document-operations.dto.ts: held at nowhere in this file — this file implements
    no fact of this node; it is part of the plan''s node set read on every file of this review, per the
    staging step

    src/http/read-openapi-document-operations.controller.ts: held at handleReadOpenApiDocumentOperationsRequest
    — maps the validated query DTO and injected fetcher onto readOpenApiDocumentOperations unchanged,
    holding no logic of its own

    src/http/read-openapi-document-operations.routes.ts: held at createReadOpenApiDocumentOperationsRoutesPlugin
    — registers GET /v1/read-openapi-document-operations, the published operation''s HTTP surface'
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
  - src/http/dto/read-openapi-document-operations.dto.ts
  - src/http/read-openapi-document-operations.controller.ts
  - src/http/read-openapi-document-operations.routes.ts
- node: contracts/knowledge/case-input-requirements
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at elsewhere in the module, unrelated to this delivery
    — a stale trace binding predating this delivery, belonging to a different operation this file also
    wires (capability registry, glossary authoring, case lifecycle, connector configuration registry)
    — this delivery''s own tasks neither implement nor touch this node''s fact, and this return does not
    clear it

    src/http/build-app.ts: held at elsewhere in the module, unrelated to this delivery — a stale trace
    binding predating this delivery, belonging to a different operation this file also wires (capability
    registry, glossary authoring, case lifecycle, connector configuration registry) — this delivery''s
    own tasks neither implement nor touch this node''s fact, and this return does not clear it'
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at elsewhere in the module, unrelated to this delivery
    — a stale trace binding predating this delivery, belonging to a different operation this file also
    wires (capability registry, glossary authoring, case lifecycle, connector configuration registry)
    — this delivery''s own tasks neither implement nor touch this node''s fact, and this return does not
    clear it

    src/http/build-app.ts: held at elsewhere in the module, unrelated to this delivery — a stale trace
    binding predating this delivery, belonging to a different operation this file also wires (capability
    registry, glossary authoring, case lifecycle, connector configuration registry) — this delivery''s
    own tasks neither implement nor touch this node''s fact, and this return does not clear it'
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: domain/integration/connector-configuration-registry
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at elsewhere in the module, unrelated to this delivery
    — a stale trace binding predating this delivery, belonging to a different operation this file also
    wires (capability registry, glossary authoring, case lifecycle, connector configuration registry)
    — this delivery''s own tasks neither implement nor touch this node''s fact, and this return does not
    clear it

    src/http/build-app.ts: held at elsewhere in the module, unrelated to this delivery — a stale trace
    binding predating this delivery, belonging to a different operation this file also wires (capability
    registry, glossary authoring, case lifecycle, connector configuration registry) — this delivery''s
    own tasks neither implement nor touch this node''s fact, and this return does not clear it'
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: domain/integration/openapi-document-operations
  conforms: true
  how: 'src/connector-registry/openapi-document-operations-reader.ts: held at readOpenApiDocumentOperations()
    return — Readonly<{operations: readonly OpenApiOperation[]}>, answered whole from one fetch

    src/http/read-openapi-document-operations.controller.ts: held at nowhere in this file — this file
    implements no fact of this node; it is part of the plan''s node set read on every file of this review,
    per the staging step

    src/http/read-openapi-document-operations.routes.ts: held at nowhere in this file — this file implements
    no fact of this node; it is part of the plan''s node set read on every file of this review, per the
    staging step'
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
  - src/http/read-openapi-document-operations.controller.ts
  - src/http/read-openapi-document-operations.routes.ts
- node: domain/integration/openapi-operation
  conforms: true
  how: 'src/connector-registry/openapi-document-operations-reader.ts: held at OpenApiOperation type and
    operationsAt() — Readonly<{path: string; method: string}> emitted per recognized path-item key

    src/http/read-openapi-document-operations.controller.ts: held at nowhere in this file — this file
    implements no fact of this node; it is part of the plan''s node set read on every file of this review,
    per the staging step'
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
  - src/http/read-openapi-document-operations.controller.ts
- node: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
  conforms: true
  how: 'src/connector-registry/openapi-operation-reader.ts: held at elsewhere in the module, unrelated
    to this delivery — a stale trace binding predating this delivery, belonging to a different operation
    this file also wires (capability registry, glossary authoring, case lifecycle, connector configuration
    registry) — this delivery''s own tasks neither implement nor touch this node''s fact, and this return
    does not clear it'
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-connector-configuration-draft-states-the-chosen-operations-method
  conforms: true
  how: 'src/connector-registry/openapi-operation-reader.ts: held at elsewhere in the module, unrelated
    to this delivery — a stale trace binding predating this delivery, belonging to a different operation
    this file also wires (capability registry, glossary authoring, case lifecycle, connector configuration
    registry) — this delivery''s own tasks neither implement nor touch this node''s fact, and this return
    does not clear it'
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at elsewhere in the module, unrelated to this delivery
    — a stale trace binding predating this delivery, belonging to a different operation this file also
    wires (capability registry, glossary authoring, case lifecycle, connector configuration registry)
    — this delivery''s own tasks neither implement nor touch this node''s fact, and this return does not
    clear it'
  encoded_at:
  - src/factories/build-app.factory.ts
- node: rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  conforms: true
  how: 'src/connector-registry/openapi-document-reader.ts: held at nowhere in this file — this file implements
    no fact of this node; it is part of the plan''s node set read on every file of this review, per the
    staging step'
  encoded_at:
  - src/connector-registry/openapi-document-reader.ts
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft
  conforms: true
  how: 'src/connector-registry/openapi-document-reader.ts: held at parsedOpenApiDocument / refuseUnsupportedVersion
    — throws OpenApiDocumentNotReadableError for unparseable text, unsupported version, no-version-declared,
    and a non-object paths member

    src/connector-registry/openapi-operation-reader.ts: held at nowhere in this file — this file implements
    no fact of this node; it is part of the plan''s node set read on every file of this review, per the
    staging step'
  encoded_at:
  - src/connector-registry/openapi-document-reader.ts
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read
  conforms: true
  how: 'src/connector-registry/openapi-document-operations-reader.ts: held at readOpenApiDocument(documentText)
    call — delegates all parse/version refusal to the shared unit; no parsing or version code of its own

    src/http/read-openapi-document-operations.controller.ts: held at nowhere in this file — this file
    implements no fact of this node; it is part of the plan''s node set read on every file of this review,
    per the staging step'
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
  - src/http/read-openapi-document-operations.controller.ts
- node: rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-draft
  conforms: true
  how: 'src/connector-registry/openapi-operation-reader.ts: held at operationEntry — throws new OpenApiOperationNotFoundError(path,
    method) when no operation is found for the pairing'
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/an-openapi-operations-method-is-upper-cased
  conforms: true
  how: 'src/connector-registry/openapi-document-operations-reader.ts: held at isOpenApiMethodKey / key.toUpperCase()
    — every emitted entry''s method is upper-cased regardless of the document''s own casing'
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
- node: rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read
  conforms: true
  how: 'src/connector-registry/openapi-document-operations-reader.ts: held at documentFetcher.fetchOpenApiDocument(link)
    awaited before parsing — a network failure, timeout or non-2xx status propagates as OpenApiDocumentNotFetchedError
    before any parse is attempted

    src/http/read-openapi-document-operations.controller.ts: held at nowhere in this file — this file
    implements no fact of this node; it is part of the plan''s node set read on every file of this review,
    per the staging step'
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
  - src/http/read-openapi-document-operations.controller.ts
- node: scenarios/integration/a-swagger-2-document-refuses-the-draft
  conforms: true
  how: 'src/connector-registry/openapi-document-reader.ts: held at refuseUnsupportedVersion — throws OpenApiDocumentNotReadableError({kind:''unsupported-version'',
    declaredVersion:''2.0''}) for a swagger:2.0 document

    src/connector-registry/openapi-operation-reader.ts: held at nowhere in this file — this file implements
    no fact of this node; it is part of the plan''s node set read on every file of this review, per the
    staging step'
  encoded_at:
  - src/connector-registry/openapi-document-reader.ts
  - src/connector-registry/openapi-operation-reader.ts
- node: scenarios/integration/a-swagger-2-document-refuses-the-operations-read
  conforms: true
  how: 'src/connector-registry/openapi-document-operations-reader.ts: held at readOpenApiDocument delegation
    — a swagger:2.0 document is refused by the shared unit''s version check before operationsDeclaredBy
    runs

    src/http/read-openapi-document-operations.controller.ts: held at nowhere in this file — this file
    implements no fact of this node; it is part of the plan''s node set read on every file of this review,
    per the staging step'
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
  - src/http/read-openapi-document-operations.controller.ts
unbound:
- src/__tests__/unit/connector-registry/openapi-document-operations-reader.spec.ts
- src/__tests__/unit/connector-registry/openapi-document-reader.spec.ts
- src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
- src/__tests__/unit/http/build-app.spec.ts
- src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
- src/__tests__/unit/http/read-openapi-document-operations.routes.spec.ts
notes: 'Judged by 14 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/connector-configuration-helper-operation-listing-backend-2.returns/.

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

  Candidates: 0 opened across 0 of 14 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/connector-configuration-helper-operation-listing-backend-2.returns/`, which are the evidence behind every entry above.
