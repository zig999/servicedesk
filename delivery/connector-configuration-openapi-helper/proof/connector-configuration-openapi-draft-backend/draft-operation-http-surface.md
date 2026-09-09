---
title: HTTP surface for draft-connector-configuration-from-openapi
summary: Proves the POST /v1/draft-connector-configuration-from-openapi operation
  dispatches through its composed dependencies, refuses malformed bodies and each
  of the three named document/operation failures with their own code and exact details,
  and answers a success body carrying exactly the five allowed fields with no capability
  or credential-value leak.
implementation: sha256:0015804484b8108aa25623b2406c190a1e078fb4512bb684e80eceec92ab9fec
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-openapi-draft-backend-draft-operation-http-surface-suite
tests:
- file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  name: answers 200 with exactly connector, configuration, unresolved and generated_credentials
    -- and no method_mismatch key at all -- for an operation with no parameters, no
    security scheme and no configuration currently registered for the connector
  proves: Criterion 7 (success shape) and the UNDERDETERMINED entry on the exact five-field
    set.
  fails_when: An implementation adds any field beyond the five named ones, omits one
    of the four always-present fields, includes method_mismatch when none stands,
    or answers a status other than 200.
- file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  name: adds method_mismatch, alongside exactly the same four other fields and no
    other key, when a different method is currently registered for the connector
  proves: Criterion 7's method_mismatch inclusion, and the same UNDERDETERMINED exact-field-set
    entry for the branch where method_mismatch is present.
  fails_when: The response omits method_mismatch when the registered and drafted methods
    differ, mis-shapes it, or carries any field beyond the five named ones.
- file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  name: carries a generated credential naming only its own generated name and security
    scheme -- never a value field -- when the operation requires an apiKey security
    scheme
  proves: Criterion 8 -- the response never carries a credential value; each generated_credentials
    entry is exactly { name, security_scheme }.
  fails_when: A generated_credentials entry gains a third key or drops name or security_scheme.
- file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  name: names the unresolved parameter by its own name and reason, unchanged, when
    no capability is registered for the connector at all
  proves: Criterion 7's unresolved-item shape and domain/integration/connector-configuration-draft-unresolved-item's
    { name, reason } passthrough at the HTTP surface.
  fails_when: An unresolved item reaching the response drops its name or reason, or
    the item never appears at all.
  demonstrates: domain/integration/connector-configuration-draft-unresolved-item
- file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  name: carries no capability name, version or count anywhere in the response, even
    though two capabilities are registered against the drafted connector
  proves: Criterion 9 and rules/integration/a-connector-configuration-draft-response-carries-no-capability.
  fails_when: The response gains a field naming, versioning or counting a capability
    when capabilities are registered against the connector.
  demonstrates: rules/integration/a-connector-configuration-draft-response-carries-no-capability
- file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  name: reaches its own controller and answers only through the injected document
    fetcher and registry -- never a fetcher or registry it constructs itself -- for
    a link that resolves to nothing over a real network
  proves: Criterion 1 -- a request is dispatched through the composed documentFetcher
    and registry rather than a fetcher or registry the route constructs on its own.
  fails_when: The route ignores the injected dependencies, so the response no longer
    reflects the stubbed document, or the injected dependencies are not called with
    the request's own link and connector.
- file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  name: accepts a method field naming no standard HTTP verb, matching it case-insensitively
    against the document's own declared operation key
  proves: The implementation's own inference that link, path and method are validated
    only as non-empty strings, with no HTTP-method enum or other format constraint.
  fails_when: The DTO starts rejecting a non-standard method string, or the route
    stops matching it case-insensitively against the document.
- file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  name: refuses with 400, code VALIDATION_ERROR and a non-empty details list when
    a field is missing from the body, without reaching the document fetcher (it.each
    over connector, link, path, method)
  proves: Criterion 2 -- a request whose body fails the route's declared shape is
    refused 400 with VALIDATION_ERROR, the uniform message and a non-empty details
    list, and never reaches the document fetcher.
  fails_when: Any of the four required fields becomes optional, the status or code
    changes, details comes back empty, or the document fetcher is invoked despite
    the failed validation.
- file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  name: refuses with 400 and a non-empty details list for a request whose body is
    empty entirely
  proves: Criterion 2's absent-input edge case.
  fails_when: An empty body is accepted, or answered with an empty details array.
- file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  name: refuses with 400 a request whose connector is an empty string
  proves: Criterion 2's empty-string edge case.
  fails_when: An empty string passes validation.
- file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  name: answers 422 reporting OpenApiDocumentNotFetchedError with exactly link and
    kind -- no status key -- when the link cannot be reached at all
  proves: Criterion 3 (network-failure branch), criterion 6, and the UNDERDETERMINED
    entry closing the fetch-failure details to exactly link, kind and status.
  fails_when: The details object carries a third key, drops link or kind, or the status
    stops being 422.
- file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  name: answers 422 reporting OpenApiDocumentNotFetchedError with exactly link and
    kind -- no status key -- when the link times out
  proves: Criterion 3 (timeout branch) and criterion 6.
  fails_when: The details object carries a third key, drops link or kind, or the status
    stops being 422.
- file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  name: answers 422 reporting OpenApiDocumentNotFetchedError with exactly link, kind
    and the answered status when the link answers outside 2xx
  proves: Criterion 3 (status-outside-2xx branch, carrying the answered status) and
    criterion 6.
  fails_when: The details object carries a fourth key, drops link, kind or status,
    or reports a different status than the one the link actually answered.
- file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  name: answers 422 reporting OpenApiDocumentNotReadableError naming what failed to
    parse, when the fetched text does not parse to a document
  proves: Criterion 4 (unparseable branch) and criterion 6.
  fails_when: The status, code or the named detail of what failed to parse changes.
- file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  name: answers 422 reporting OpenApiDocumentNotReadableError naming the declared
    version, when the document declares an unsupported OpenAPI version
  proves: Criterion 4 (unsupported-version branch) and criterion 6.
  fails_when: The declared version stops being named, or the status/code changes.
- file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  name: answers 422 reporting OpenApiDocumentNotReadableError naming that no version
    was declared, when the document declares neither openapi nor swagger
  proves: Criterion 4 (no-version-declared branch) and criterion 6.
  fails_when: This branch stops being distinguished from the other two, or the status/code
    changes.
- file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  name: answers 422 reporting OpenApiOperationNotFoundError naming exactly the requested
    path and method, when the document declares no such operation
  proves: Criterion 5 and criterion 6.
  fails_when: The path or method named in details stops matching exactly what the
    request sent, or the status/code changes.
- file: src/__tests__/unit/http/build-app.spec.ts
  name: reaches its own controller rather than answering 404, for the draft-connector-configuration-from-openapi
    route (it.each entry added to REGISTERED_ROUTE_REQUESTS)
  proves: Criterion 1's registration half -- the operation is wired into the built
    application's routePluginFactories/BuildAppDependencies alongside every other
    one, not merely available as a standalone plugin.
  fails_when: build-app.ts stops registering the plugin, or build-app.factory.ts stops
    composing draftConnectorConfigurationFromOpenApiDependencies, so the request answers
    404.
not_applicable:
- edge_case: Two operations against the same subject/connector at once (concurrency).
  why: The operation registers nothing and mutates no state; two concurrent requests
    are two independent computations with no shared write to interleave.
- edge_case: A dependency (capabilitiesReader, registry) rejecting or answering an
    unexpected shape with a generic, unmapped error.
  why: No criterion of this task names that behavior; constraints/a-domain-error-unmapped-by-status-is-refused-generically
    sits outside this epic's covers per the task's own ADVISORY note, and the fallback
    itself is already exercised generically elsewhere in this suite.
- edge_case: A duplicate/uniqueness violation.
  why: The operation registers nothing, so no uniqueness constraint applies to it.
untested:
- The implementation's inference that capabilitiesReader is hoisted into ComposedResources
  and constructed once, shared with connector-configuration-registry's own construction,
  rather than built a second time inside the new draft-dependencies function. This
  is a factory-level wiring choice invisible at the HTTP surface, so no HTTP-level
  test can distinguish the two.
- constraints/the-openapi-document-is-fetched-by-the-backend's no-frontend-fetch clause,
  and every rule the task's own Notes assign to the draft-generation, document-fetch
  and document-reading tasks of this epic -- this proof exercises them only as they
  surface through this route's HTTP behavior, per the task's own REMAINDER entries.
---

## What it is

Integration-style proof, through app.inject, of the published entrance to the draft and the three refusals an operator meets there.

## Notes

None.
