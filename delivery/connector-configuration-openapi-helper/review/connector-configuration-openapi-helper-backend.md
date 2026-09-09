---
target: backend
title: connector-configuration-openapi-draft-backend review
summary: Coverage, specification-conformance, standard-conformance and failures passes over the 8-task
  connector-configuration-openapi-draft-backend epic's 33 files -- the backend half of the connector-configuration-openapi-helper
  initiative.
reviewed:
- package.json
- src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
- src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
- src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
- src/__tests__/unit/connector-registry/openapi-document-fetcher.adapter.spec.ts
- src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
- src/__tests__/unit/connector-registry/registered-method-comparison.spec.ts
- src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
- src/__tests__/unit/errors/openapi-document-not-fetched.error.spec.ts
- src/__tests__/unit/errors/openapi-document-not-readable.error.spec.ts
- src/__tests__/unit/errors/openapi-operation-not-found.error.spec.ts
- src/__tests__/unit/errors/status-map.spec.ts
- src/__tests__/unit/http/build-app.spec.ts
- src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
- src/__tests__/unit/http/error-handler.middleware.spec.ts
- src/connector-registry/connector-configuration-draft-generation.ts
- src/connector-registry/connector-configuration-draft.ts
- src/connector-registry/generated-credential-placeholders.ts
- src/connector-registry/js-yaml.d.ts
- src/connector-registry/openapi-document-fetcher.adapter.ts
- src/connector-registry/openapi-document-fetcher.port.ts
- src/connector-registry/openapi-operation-reader.ts
- src/connector-registry/registered-method-comparison.ts
- src/connector-registry/subject-placeholder-resolution.ts
- src/errors/openapi-document-not-fetched.error.ts
- src/errors/openapi-document-not-readable.error.ts
- src/errors/openapi-operation-not-found.error.ts
- src/errors/status-map.ts
- src/factories/build-app.factory.ts
- src/http/build-app.ts
- src/http/draft-connector-configuration-from-openapi.controller.ts
- src/http/draft-connector-configuration-from-openapi.routes.ts
- src/http/dto/draft-connector-configuration-from-openapi.dto.ts
tasks:
- task/connector-configuration-openapi-draft-backend/draft-domain-shape
- task/connector-configuration-openapi-draft-backend/openapi-document-fetch
- task/connector-configuration-openapi-draft-backend/openapi-3x-operation-reading
- task/connector-configuration-openapi-draft-backend/registered-method-comparison
- task/connector-configuration-openapi-draft-backend/subject-placeholder-resolution
- task/connector-configuration-openapi-draft-backend/generated-credential-placeholders
- task/connector-configuration-openapi-draft-backend/draft-generation-service
- task/connector-configuration-openapi-draft-backend/draft-operation-http-surface
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
coverage:
- criterion: The unresolved-reason vocabulary admits exactly no-capability-registered, no-matching-input-schema-property,
    security-scheme-not-reducible-to-a-credential and drafted-key-occupied-by-another-security-scheme.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
    name: admits exactly the four vocabulary reasons the specification enumerates, and no other value
- criterion: A value outside that vocabulary is rejected rather than carried as an unresolved reason.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
    name: refuses an unresolved item whose reason is not one of the four vocabulary values
  why: 'The test body carries no runtime assertion at all -- it is a @ts-expect-error assignment followed
    by void invalid. What makes it able to fail is the registry''s own typecheck step (npm run typecheck
    -> tsc --noEmit, whose include covers the spec files): widening reason to a bare string leaves the
    directive unused and errors there. A vitest run alone would report nothing either way.'
- criterion: A connector configuration draft declares a connector, a configuration, an unresolved list
    and a generated-credentials list, each of the two lists present and possibly empty.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
    name: accepts a draft whose unresolved and generated-credentials lists are both empty, since resolving
      every operation reference and declaring no security scheme are each a legitimate outcome
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
    name: refuses a draft that omits its unresolved or generated-credentials list instead of declaring
      it present and empty
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
    name: declares no capability field on the draft, so a generator resolves any number of capability
      references — including none — without the type ever exposing the count
  why: Both list tests' runtime assertions read back literals the test itself just assigned, so they hold
    whatever the type says; the criterion is decided by the typecheck step -- the empty-list assignment
    must compile and the omitted-list assignment must not.
- criterion: A connector configuration draft admits a method mismatch as an optional element and is valid
    without one.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
    name: accepts a draft with no method_mismatch, leaving the field absent rather than defaulted
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
    name: declares no capability field on the draft, so a generator resolves any number of capability
      references — including none — without the type ever exposing the count
  why: 'Same mechanism: the optionality is decided by the typecheck step (the assignment compiling, and
    the exact-type assertion declaring method_mismatch?), not by a vitest assertion.'
- criterion: A connector configuration draft admits any number of capability references, including none.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
    name: declares no capability field on the draft, so a generator resolves any number of capability
      references — including none — without the type ever exposing the count
  why: 'Covered only negatively, and with excess: the expectTypeOf assertion closes the draft to exactly
    five fields -- a totality no criterion of this task states, which breaks the day a sibling task legitimately
    adds a field to the draft type. It fails if the type ever bounds capability references, which is what
    makes it bear; it is a compile-time assertion decided by the typecheck step.'
- criterion: An unresolved item carries a name and exactly one reason drawn from the vocabulary.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
    name: declares an unresolved item as exactly a name and a single reason, never a set of reasons
  why: expectTypeOf erases at runtime; the assertion is decided by the typecheck step rather than by a
    vitest run.
- criterion: A generated credential carries the generated name and the security scheme's own name.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
    name: declares a generated credential as exactly the generated name and the security scheme's own
      name
  why: expectTypeOf erases at runtime; the assertion is decided by the typecheck step rather than by a
    vitest run.
- criterion: A method mismatch carries the registered method and the operation's method as two separate
    named values.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
    name: declares a method mismatch as exactly the registered method and the operation's method, as two
      separate fields
  why: expectTypeOf erases at runtime; the assertion is decided by the typecheck step rather than by a
    vitest run.
- criterion: No module of the draft's domain shape imports a framework, a driver or a provider client.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
    name: the draft's domain module carries no import statement at all, naming no framework, driver or
      provider client
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
    name: exports no runtime guard function alongside the closed vocabulary — only the vocabulary array
      itself carries a runtime value
  why: The scan reads one file at a hard-coded path, so the totality over "no module of the draft's domain
    shape" holds only because all five elements resolve from that file. The second assertion claims the
    module exports exactly one runtime value, a totality no criterion of this task states.
- criterion: A link answering HTTP 404 refuses the request with an error naming the fetch failure.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-document-fetcher.adapter.spec.ts
    name: refuses a link answering HTTP 404 with OpenApiDocumentNotFetchedError naming status-outside-2xx
      and the answered status
- criterion: A link answering any status outside the 2xx range refuses the request with that same fetch-failure
    error.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-document-fetcher.adapter.spec.ts
    name: refuses a link answering a different non-2xx status (503) the same way, carrying that status
      rather than only ever 404
  - file: src/__tests__/unit/connector-registry/openapi-document-fetcher.adapter.spec.ts
    name: refuses a link answering HTTP 404 with OpenApiDocumentNotFetchedError naming status-outside-2xx
      and the answered status
- criterion: A network failure reaching the link refuses the request with the fetch-failure error.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-document-fetcher.adapter.spec.ts
    name: refuses a rejected outbound call with OpenApiDocumentNotFetchedError naming network-failure,
      preserving the original rejection as cause
- criterion: A link that has not answered within 60000 milliseconds of the fetch beginning refuses the
    request with the fetch-failure error, the fetch abandoned as a timeout.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-document-fetcher.adapter.spec.ts
    name: abandons the fetch as a timeout once 60000ms elapse with no answer, refusing with kind timeout
  - file: src/__tests__/unit/connector-registry/openapi-document-fetcher.adapter.spec.ts
    name: does not abandon the fetch before the full 60000ms deadline elapses
- criterion: No parse of a response body is attempted on any of those four refusals.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-document-fetcher.adapter.spec.ts
    name: never reads the response body on a non-2xx answer, refusing before any parse is attempted
  why: Only the status-outside-2xx refusal is observed, and only through a spy on response.text -- an
    adapter that read the body through response.json(), arrayBuffer() or any other reader before throwing
    would still pass. The 404 and 503 assertions use toMatchObject, so they add nothing here. The network-failure
    and timeout refusals hold no Response at all, so nothing observes a parse attempt on them.
- criterion: The fetch-failure error's details carry the link exactly as named and which of network-failure,
    timeout or status-outside-2xx occurred, the last carrying the status code answered, and nothing else
    of the fetch.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-document-fetcher.adapter.spec.ts
    name: refuses a rejected outbound call with OpenApiDocumentNotFetchedError naming network-failure,
      preserving the original rejection as cause
  - file: src/__tests__/unit/errors/openapi-document-not-fetched.error.spec.ts
    name: names itself OpenApiDocumentNotFetchedError and carries only the link and kind in context for
      a network failure
  - file: src/__tests__/unit/errors/openapi-document-not-fetched.error.spec.ts
    name: carries only the link and kind in context for a timeout, naming no status at all
  - file: src/__tests__/unit/errors/openapi-document-not-fetched.error.spec.ts
    name: carries the answered status in context for a status-outside-2xx outcome, alongside the link
      and kind
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotFetchedError with exactly link, kind and the answered
      status when the link answers outside 2xx
- criterion: A link answering a 2xx response yields that response's body text to its caller unparsed.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-document-fetcher.adapter.spec.ts
    name: yields a 2xx response's body text to its caller exactly, without parsing it as JSON
  - file: src/__tests__/unit/connector-registry/openapi-document-fetcher.adapter.spec.ts
    name: yields an empty string, not undefined or a thrown error, when a 2xx response carries an empty
      body
- criterion: The document fetch is issued only inside the backend, and no frontend module requests an
    OpenAPI document's own URL.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-document-fetcher.adapter.spec.ts
    name: imports no HTTP client library, reaching the network only through the platform global fetch
  - file: src/__tests__/unit/connector-registry/openapi-document-fetcher.adapter.spec.ts
    name: defaults its own HTTP client to the platform global fetch when the caller injects none
  why: The two tests show a backend module issues the fetch through the platform global fetch and pulls
    in no HTTP client library; neither bears on the exclusivity the criterion states. No test in the set
    reads any file outside src, so "no frontend module requests an OpenAPI document's own URL" is unexercised.
- criterion: The refusal is answered as an HTTP 422 response reporting an OpenApiDocumentNotFetchedError.
  state: covered
  tests:
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves OpenApiDocumentNotFetchedError to 422
  - file: src/__tests__/unit/http/error-handler.middleware.spec.ts
    name: answers a refused OpenAPI document fetch as HTTP 422 reporting OpenApiDocumentNotFetchedError,
      once it reaches the shared handler
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotFetchedError with exactly link and kind — no status
      key — when the link cannot be reached at all
- criterion: A document declaring swagger 2.0 refuses the request with an HTTP 422 response reporting
    an OpenApiDocumentNotReadableError, naming the declared version.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: refuses a document declaring swagger 2.0, naming the declared version
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves OpenApiDocumentNotReadableError to 422
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotReadableError naming the declared version, when the
      document declares an unsupported OpenAPI version
- criterion: A document declaring a version that is not OpenAPI 3.x refuses the request the same way,
    naming the version it declared.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: refuses a document declaring an openapi version outside 3.x, naming the version it declared
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves OpenApiDocumentNotReadableError to 422
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotReadableError naming the declared version, when the
      document declares an unsupported OpenAPI version
- criterion: Text that does not parse as a document at all refuses the request the same way, naming what
    failed to parse.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: refuses text that parses as neither JSON nor a YAML mapping, naming what failed to parse
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: refuses an empty document text the same way as any other text that does not parse
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: refuses a genuine YAML syntax error the same way as any other unparseable text, preserving it
      as the cause
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotReadableError naming what failed to parse, when the
      fetched text does not parse to a document
- criterion: A document that parses and declares OpenAPI 3.x but declares no operation at the named path
    and HTTP method refuses the request with an HTTP 422 response reporting an OpenApiOperationNotFoundError,
    naming that path and that method.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: refuses when the document declares no entry at all for the requested path, naming that path
      and method
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: refuses when the path exists but declares no operation under the requested method
  - file: src/__tests__/unit/errors/openapi-operation-not-found.error.spec.ts
    name: names itself OpenApiOperationNotFoundError and carries the requested path and method verbatim
      in context
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves OpenApiOperationNotFoundError to 422
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiOperationNotFoundError naming exactly the requested path and method,
      when the document declares no such operation
- criterion: The OpenApiDocumentNotReadableError and OpenApiOperationNotFoundError values are two distinct
    error values, and neither is ever reported as the other.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: keeps OpenApiDocumentNotReadableError and OpenApiOperationNotFoundError as two distinct values,
      neither an instance of the other
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: maps OpenApiDocumentNotFetchedError, OpenApiDocumentNotReadableError and OpenApiOperationNotFoundError
      all to 422, pinning distinct as specific rather than mutually exclusive across all three
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiOperationNotFoundError naming exactly the requested path and method,
      when the document declares no such operation
- criterion: An OpenAPI 3.x document declaring the named operation yields the chosen operation's own HTTP
    method.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: returns the operation's own method key exactly as the document spells it, regardless of the
      requested method's own casing
- criterion: An OpenAPI 3.x document declaring the named operation yields the chosen operation's parameter
    names, their own declared location (path, query, header or cookie) and their positions exactly as
    the document spells them, merging a path item's own parameters with the operation's own by name and
    location and following any $ref to its target first.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: merges the path item's own parameters with the operation's own, exposing every parameter from
      both
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: follows a parameter's $ref to its target before exposing its name and location
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: keeps a single parameter when the operation redeclares a path item parameter under the same
      name and location
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: exposes a parameter as exactly its name and declared location, with no separate position field
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: returns an empty parameter list when neither the path item nor the operation declares any
  why: '"their positions exactly as the document spells them" is left unexercised as a clause of its own.
    The merge assertion compares an order-insensitive Set of name|location pairs plus a length, so scrambling
    the merged parameters'' declared order fails nothing; and the reader exposes no position at all --
    the delivery reads "position" as identical to the declared location, an inference the criterion does
    not state.'
- criterion: An OpenAPI 3.x document declaring the named operation yields the chosen operation's request-body
    field names -- the keys of the top-level properties object of the schema declared under the media
    type application/json, and none where that content declares no application/json entry, none nested,
    and none at all where that schema is an array or another non-object -- exactly as the document spells
    them.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: exposes the top-level property names of the application/json request-body schema, in the order
      the document declares them
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: reads no request-body field names when the content declares no application/json entry
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: reads no request-body field names when the application/json schema is an array rather than an
      object
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: reads only the schema's own top-level property names, never a nested object's own properties
- criterion: An OpenAPI 3.x document declaring the named operation yields the security scheme names required
    by the first requirement object of the security field in effect (the operation's own where declared,
    else the document's top-level), with each scheme's own declared kind and, for an API key, the name
    and location (header, query or cookie) it is carried in.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: exposes the scheme names required by the operation's own first security requirement, with an
      API-key scheme's own name and location
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: falls back to the document-level security field when the operation declares none at all
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: uses only the first requirement object when the security field lists more than one, ignoring
      the rest
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: exposes an http security scheme's own kind and its own scheme sub-field
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: exposes a non-reducible security scheme's own kind (oauth2) rather than dropping it
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: treats the operation's own empty security array as declared and in effect, requiring no scheme
      rather than falling back to the document's top level
- criterion: No name read from the document is lower-cased, normalized or separator-rewritten on the way
    out of the reader.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: merges the path item's own parameters with the operation's own, exposing every parameter from
      both
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: follows a parameter's $ref to its target before exposing its name and location
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: exposes the top-level property names of the application/json request-body schema, in the order
      the document declares them
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: exposes the scheme names required by the operation's own first security requirement, with an
      API-key scheme's own name and location
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: returns the operation's own method key exactly as the document spells it, regardless of the
      requested method's own casing
- criterion: Where a configuration registered under the connector name declares method GET and the operation
    declares POST, the draft's method_mismatch names registered GET and operation POST.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/registered-method-comparison.spec.ts
    name: names registered GET and operation POST when a configuration registered under the connector
      name declares GET and the operation declares POST
- criterion: Where a configuration registered under the connector name declares method GET and the operation's
    own method is the lower-case path-item key get, the draft states no method_mismatch, since the two
    are the same method once each is upper-cased.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/registered-method-comparison.spec.ts
    name: states no method_mismatch when the operation's own method is the lower-case path-item key get
      and the registered configuration declares GET
- criterion: Where the registered configuration's declared method, upper-cased, equals the operation's
    method upper-cased, the draft states no method_mismatch.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/registered-method-comparison.spec.ts
    name: states no method_mismatch when the registered configuration's declared method upper-cased equals
      the operation's method upper-cased, whatever case either source gave it
- criterion: Where no connector configuration is registered under the connector name, the draft states
    no method_mismatch whatever the operation's method is.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/registered-method-comparison.spec.ts
    name: states no method_mismatch, whatever the operation method is, when no connector configuration
      is registered under the connector name
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: states no method_mismatch field at all when nothing is registered for the connector
- criterion: Where the configuration registered under the connector name declares no method in its own
    text, the draft states no method_mismatch whatever the operation's method is.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/registered-method-comparison.spec.ts
    name: states no method_mismatch, whatever the operation method is, when the configuration registered
      under the connector name declares no method in its own text
  - file: src/__tests__/unit/connector-registry/registered-method-comparison.spec.ts
    name: treats a method key present in the registered text but holding a non-string value the same as
      no method being declared
- criterion: A method_mismatch reports both its registered and operation values upper-cased, even where
    the registered configuration's own text or the operation's own document spelling was lower-case.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/registered-method-comparison.spec.ts
    name: reports both its registered and operation values upper-cased even where the registered configuration's
      own text and the operation's own spelling were both lower-case
- criterion: The comparison reads the method from the registered configuration's own text rather than
    from any capability attribute.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/registered-method-comparison.spec.ts
    name: names registered GET and operation POST when a configuration registered under the connector
      name declares GET and the operation declares POST
  - file: src/__tests__/unit/connector-registry/registered-method-comparison.spec.ts
    name: states no method_mismatch, whatever the operation method is, when the configuration registered
      under the connector name declares no method in its own text
  - file: src/__tests__/unit/connector-registry/registered-method-comparison.spec.ts
    name: declares no capability parameter at all -- the registry, the connector name and the operation
      method are its whole signature
  why: 'The substance is carried by the behavioural tests. The signature test carries excess: it pins
    the exact parameter tuple, so it also fails the day a legitimate fourth parameter unrelated to any
    capability is added, and it binds the shape of the code rather than where the method was read from.'
- criterion: The comparison reads the configuration registered under that name live at generation time
    rather than from a copy held elsewhere.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/registered-method-comparison.spec.ts
    name: answers according to whatever the registry currently holds rather than a snapshot resolved before
      the connector was registered
- criterion: The configuration registered under the connector name stands unchanged after the comparison.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/registered-method-comparison.spec.ts
    name: leaves the configuration registered under the connector name unchanged after computing the comparison
- criterion: Where no capability is currently registered naming the draft's connector, every parameter
    and request-body field name is named unresolved with reason no-capability-registered.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
    name: names every parameter and request-body field name unresolved with no-capability-registered when
      no capability is registered at all
  - file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
    name: names every name unresolved with no-capability-registered when only a capability naming a different
      connector is registered
- criterion: Where no capability is currently registered naming the draft's connector, no ${subject:...}
    placeholder is generated at all.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
    name: generates no ${subject:...} placeholder text anywhere in the placement when no capability is
      registered
- criterion: Where every capability currently registered for the connector declares an input-schema property
    whose key equals the name byte-for-byte, ${subject:<name>} is placed at that name's own position (inside
    the address for a path parameter, a query key for a query parameter, a headers key for a header parameter,
    inside the Cookie header's value for a cookie parameter, a body key for a top-level request-body field),
    where at least one capability is currently registered for the connector.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
    name: places ${subject:<name>} at a path parameter's own position inside the substituted path
  - file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
    name: places ${subject:<name>} as a query parameter's own key value
  - file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
    name: places ${subject:<name>} as a headers key value, with no Cookie key when no cookie parameter
      is present
  - file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
    name: places ${subject:<name>} inside the Cookie header's own value for a single cookie parameter
  - file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
    name: places ${subject:<name>} as a top-level request-body field's own key value
  - file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
    name: joins two cookie-carried parameters into one Cookie header value separated by '; ', never dropping
      one of them or writing a second Cookie-like key
- criterion: Where at least one capability is currently registered for the connector and any one of them
    declares no input-schema property key equal to the name, the name is named unresolved with reason
    no-matching-input-schema-property.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
    name: names a name unresolved with no-matching-input-schema-property when the one registered capability
      does not declare that property
  - file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
    name: names a name unresolved with no-matching-input-schema-property when only one of two registered
      capabilities fails to declare it
- criterion: A name differing from a declared property only by case or by separator -- customerId against
    a declared customer_id -- is named unresolved with reason no-matching-input-schema-property and generates
    no placeholder.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
    name: treats customerId as unresolved against a declared customer_id, generating no placeholder
- criterion: No name reaches two outcomes -- each parameter and request-body field name is either placed
    as a placeholder or named exactly once in the unresolved list.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
    name: names a name occupying two positions exactly once in the unresolved list, holding the brace
      form at both of its positions
  - file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
    name: resolves a name occupying two positions consistently, placing the same placeholder at both of
      its positions and naming it in neither unresolved entry
- criterion: The resolution names every capability currently registered for the connector it read, and
    names none where none is registered.
  state: unauditable
  tests:
  - file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
    name: discloses none of the registered capabilities it read on the returned placement, whether one
      or several are registered
  - file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
    name: names a name unresolved with no-matching-input-schema-property when only one of two registered
      capabilities fails to declare it
  - file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
    name: names every name unresolved with no-capability-registered when only a capability naming a different
      connector is registered
  why: '"names" cannot be read well enough to look for, and the two readings are contradictory: under
    a disclosure reading the module deliberately discloses nothing (proven), under a consults reading
    it''s about every registered capability being taken into account (also proven). This audit does not
    settle which the criterion asked for.'
- criterion: The resolution reads the registered capabilities through the existing capability read and
    the existing declared-input-schema-shape reader, introducing no second lookup or second schema reader.
  state: uncovered
  why: 'Nothing in the set can distinguish the existing readers from a second one: every test injects
    its own capabilitiesReader fake and asserts only the returned placement, so a module parsing the schema
    with a reader of its own would produce byte-identical output and pass every test here. The task''s
    own proof records this as untested.'
- criterion: The placeholder text emitted is the existing ${subject:<name>} form, produced through the
    existing placeholder token vocabulary rather than a second one.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
    name: places ${subject:<name>} as a query parameter's own key value
  - file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
    name: places ${subject:<name>} at a path parameter's own position inside the substituted path
  - file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
    name: places ${subject:<name>} as a top-level request-body field's own key value
  why: The emitted form is pinned to the exact text ${subject:<name>}, so the first half holds. The second
    half -- produced through the existing placeholder token vocabulary rather than a second one -- goes
    unexercised.
- criterion: An unresolved parameter or field still stands at its own position, holding its own name in
    the document's brace form {name}.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
    name: names a name unresolved with no-matching-input-schema-property when the one registered capability
      does not declare that property
  - file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
    name: names a name occupying two positions exactly once in the unresolved list, holding the brace
      form at both of its positions
  - file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
    name: treats customerId as unresolved against a declared customer_id, generating no placeholder
  why: The brace form is asserted at the query, path and header positions only. An unresolved cookie-carried
    parameter's brace form and an unresolved request-body field's brace form are exercised nowhere.
- criterion: An API key scheme carried in a header becomes a ${credential:<name>} placeholder at a drafted
    headers key named by that header -- an API key in header X-Api-Key places that placeholder under the
    headers key X-Api-Key.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
    name: places an API key header scheme's placeholder at its own header key, disclosing the generated
      name in generated_credentials
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: embeds a header-located security-scheme credential at the header key the scheme declares
- criterion: An API key scheme carried in a query parameter becomes a ${credential:<name>} placeholder
    at a drafted query key named by that parameter.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
    name: places an API key query scheme's placeholder at its own query key
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: embeds a query-located security-scheme credential at the query key the scheme declares
- criterion: An API key scheme carried in a cookie becomes a ${credential:<name>} placeholder inside the
    value of the drafted headers key Cookie, as that cookie's own name, an equals sign and the placeholder,
    joined by "; " to any other cookie-carried part of the same call.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
    name: appends an API key cookie scheme's placeholder as its own raw cookie segment rather than a joined
      Cookie header value
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: embeds a cookie-located security-scheme credential inside the Cookie header value even when
      no cookie parameter is declared
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: rebuilds the joined Cookie header from the subject resolution's own segments, dropping only
      a displaced parameter's own segment and appending the credential's own segment
  why: 'Covered across two files rather than one: the credential module itself returns raw, unjoined segments,
    so the criterion''s cookie-value join is proven only by the two draft-generation tests.'
- criterion: An HTTP basic scheme becomes exactly one ${credential:<name>} placeholder, drafted as the
    whole value of the headers key Authorization, prefixed by the literal text "Basic ", unless that key
    is already claimed per the collision criterion below.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
    name: 'places an HTTP basic scheme''s placeholder as the whole Authorization header value, prefixed
      by Basic '
  - file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
    name: keeps only the first of two schemes colliding on the Authorization header key, naming the second
      unresolved with drafted-key-occupied-by-another-security-scheme
  - file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
    name: recognizes HTTP basic and bearer schemes case-insensitively
- criterion: An HTTP bearer scheme becomes exactly one ${credential:<name>} placeholder, drafted as the
    whole value of the headers key Authorization, prefixed by the literal text "Bearer ", unless that
    key is already claimed per the collision criterion below.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
    name: 'places an HTTP bearer scheme''s placeholder as the whole Authorization header value, prefixed
      by Bearer '
  - file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
    name: treats an API key scheme declaring header Authorization as colliding with an HTTP basic scheme
      on that same key
- criterion: Where more than one required scheme would occupy the whole value of the drafted headers key
    Authorization (an HTTP basic scheme, an HTTP bearer scheme, or an API key declaring header Authorization
    as its own location), only the first of them in the order the requirement object names its schemes
    becomes a placeholder and holds that key; every other one is named unresolved with reason drafted-key-occupied-by-another-security-scheme,
    generating no placeholder and no generated_credentials entry.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
    name: keeps only the first of two schemes colliding on the Authorization header key, naming the second
      unresolved with drafted-key-occupied-by-another-security-scheme
  - file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
    name: treats an API key scheme declaring header Authorization as colliding with an HTTP basic scheme
      on that same key
- criterion: The generated name is the connector's own name and the scheme's own name, each with every
    character outside A-Z0-9 replaced by an underscore, joined by an underscore, and upper-cased -- connector
    erp-http with scheme apiKeyHeader generates ERP_HTTP_APIKEYHEADER.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
    name: places an API key header scheme's placeholder at its own header key, disclosing the generated
      name in generated_credentials
  - file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
    name: folds case before replacing characters outside A-Z0-9, rather than replacing lower-case letters
      away before the fold
- criterion: Every generated name is disclosed in the draft's generated_credentials paired with the security
    scheme's own name from the document.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
    name: places an API key header scheme's placeholder at its own header key, disclosing the generated
      name in generated_credentials
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: holds every generated credential paired with its own security scheme's name, unmodified from
      the credential generation
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: carries a generated credential naming only its own generated name and security scheme — never
      a value field — when the operation requires an apiKey security scheme
- criterion: No credential value read from environment configuration appears anywhere in the generated
    placeholder or in generated_credentials.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
    name: never carries a value read from environment configuration in the generated placeholder or in
      generated_credentials
- criterion: Any security scheme not reducible to one credential value -- an OAuth2 scheme and an OpenID
    Connect scheme among them -- is named unresolved with reason security-scheme-not-reducible-to-a-credential
    and generates no placeholder.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
    name: names an OAuth2 scheme and an OpenID Connect scheme unresolved with security-scheme-not-reducible-to-a-credential,
      generating no placeholder for either
  - file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
    name: names a mutualTLS scheme and an HTTP scheme using an unrecognized sub-scheme unresolved with
      the same reason, neither assumed reducible
- criterion: Where the security field in effect for the operation is an empty array, names no scheme,
    or is declared at neither the operation nor the document's top level, no placeholder is generated
    and no security scheme is named unresolved.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
    name: generates no placeholder and names no scheme unresolved when the operation requires no security
      scheme at all
  - file: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
    name: treats the operation's own empty security array as declared and in effect, requiring no scheme
      rather than falling back to the document's top level
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: answers 200 with exactly connector, configuration, unresolved and generated_credentials — and
      no method_mismatch key at all — for an operation with no parameters, no security scheme and no configuration
      currently registered for the connector
  why: 'The middle condition -- a security field in effect that names no scheme, security: [{}] -- is
    exercised nowhere: no fixture in the set supplies one.'
- criterion: The placeholder text emitted is the existing ${credential:<name>} form, produced through
    the existing placeholder token vocabulary rather than a second one.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
    name: places an API key header scheme's placeholder at its own header key, disclosing the generated
      name in generated_credentials
  - file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
    name: places an API key query scheme's placeholder at its own query key
  why: The emitted form is pinned to the exact text ${credential:<name>}. That it is produced through
    the existing placeholder token vocabulary rather than a second one is unexercised.
- criterion: The draft's configuration is well-formed JSON object text.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: produces a configuration text that parses as a well-formed JSON object
- criterion: The draft's configuration declares a method whose value is the chosen operation's own HTTP
    method, upper-cased.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: upper-cases the operation's own method however the caller requested it
- criterion: The draft's configuration's address is composed from the first entry of the servers array
    in effect for the operation (the operation's own, else its path item's, else the document's top level),
    with any trailing slash removed, followed by the operation's own path -- or the path alone where no
    servers array is in effect or it holds no entry.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: composes the address from the operation's own first server entry over the path item's and the
      document's, trimming a trailing slash
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: falls back to the path item's own first server entry when the operation declares none
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: falls back to the document's own top-level first server entry when neither the operation nor
      the path item declares one
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: composes the address from the path alone when no servers array is in effect anywhere
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: uses only the first entry of the servers array in effect when it lists more than one
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: treats the operation's own explicitly empty servers array as in effect, composing the path alone
      rather than falling back to the path item's own servers
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: treats a servers entry declaring no url as absent, using the next entry that declares one
- criterion: The draft's configuration holds query, headers and body where the operation's parameters
    or request body declare them, each part placed at the position rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
    fixes for its own location (path, query, header, cookie or body).
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: embeds a resolved path parameter inside the drafted address at its own position
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: places a resolved query parameter at its own query key
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: places a resolved header parameter at its own header key
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: places a resolved cookie parameter inside the joined Cookie header value
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: places a resolved request-body field at its own top-level body key
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: omits the query, headers and body keys entirely when the operation declares no parameter or
      request-body field for any of them
- criterion: The draft's configuration states no responseMap key.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: never states a responseMap or a statusMap key, however much of the draft resolves
- criterion: The draft's configuration states no statusMap key.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: never states a responseMap or a statusMap key, however much of the draft resolves
- criterion: The draft's configuration embeds every subject placeholder the resolution placed, each at
    the position of the parameter or request-body field it was placed for.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: embeds a resolved path parameter inside the drafted address at its own position
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: places a resolved query parameter at its own query key
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: places a resolved header parameter at its own header key
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: places a resolved cookie parameter inside the joined Cookie header value
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: places a resolved request-body field at its own top-level body key
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: embeds a parameter reached only through the operation-reading task's own $ref resolution
- criterion: The draft's configuration embeds every credential placeholder the generation produced, each
    at the position the security scheme declared or, for a scheme with no location of its own, in the
    headers as that rule fixes.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: embeds a header-located security-scheme credential at the header key the scheme declares
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: embeds a query-located security-scheme credential at the query key the scheme declares
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: embeds a cookie-located security-scheme credential inside the Cookie header value even when
      no cookie parameter is declared
  why: 'The three declared-location branches are each asserted. The criterion''s second half -- a scheme
    with no location of its own, landing in the headers as the rule fixes -- is never composed into a
    draft: Authorization placement is asserted only against generateCredentialPlaceholders directly.'
- criterion: An unresolved parameter or field still stands at its own position, holding its own name in
    the document's brace form.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: leaves an unresolved parameter at its own position holding its own name in brace form
  why: Only a query-located unresolved parameter is asserted in the composed configuration. Path, header,
    cookie and body positions are unexercised at this service.
- criterion: The draft's unresolved list holds every parameter, request-body field and security scheme
    the operation named that resolved to no placeholder, and nothing else, each carrying the reason the
    resolving task assigned it.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: lists exactly the parameters, request-body fields and security schemes that resolved to no placeholder,
      and nothing that resolved
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: resolves a security-scheme/parameter key collision by replacing whatever the subject resolution
      produced for that name -- a successful placeholder or an unresolved entry for a different reason
      -- with the drafted-key-occupied reason, never duplicating either entry
- criterion: The draft's generated_credentials holds every generated credential the credential-generation
    task produced, each paired with its security scheme's own name.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: holds every generated credential paired with its own security scheme's name, unmodified from
      the credential generation
- criterion: The draft's method_mismatch is exactly as the method-comparison task computed it, present
    or absent.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: states a method_mismatch exactly as the method-comparison task computed it, when the operation's
      method differs from what is registered
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: states no method_mismatch field at all when nothing is registered for the connector
- criterion: The draft names the connector it was generated for.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: names the connector it was generated for, exactly as passed in
- criterion: A draft where nothing at all resolved is still generated and returned rather than refused.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: generates and returns a draft, rather than refusing, when every parameter resolves to nothing
      and no security scheme reduces to a credential
- criterion: Generating a draft issues no register-connector call.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: leaves every connector configuration registered before a draft is generated byte-identical after
      it, issuing no register-connector call
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: creates no connector configuration record under any name -- registered or not -- merely by generating
      a draft
- criterion: Every connector configuration registered before a draft is generated stands byte-identical
    after it.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
    name: leaves every connector configuration registered before a draft is generated byte-identical after
      it, issuing no register-connector call
- criterion: The operation is registered in the built application and a request reaching it is dispatched
    through the composed dependencies rather than constructing its own.
  state: covered
  tests:
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: reaches its own controller rather than answering 404, for the draft-connector-configuration-from-openapi
      route
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: reaches its own controller and answers only through the injected document fetcher and registry
      — never a fetcher or registry it constructs itself — for a link that resolves to nothing over a
      real network
- criterion: A request whose body fails the route's declared shape is refused HTTP 400 with error code
    VALIDATION_ERROR, a message naming which of path, query or body failed, and a non-empty details list.
  state: covered
  tests:
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: refuses with 400, code VALIDATION_ERROR and a non-empty details list when %s is missing from
      the body, without reaching the document fetcher
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: refuses with 400 and a non-empty details list for a request whose body is empty entirely
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: refuses with 400 a request whose connector is an empty string
- criterion: A request naming an unfetchable document link is answered HTTP 422 reporting OpenApiDocumentNotFetchedError,
    whose details name the link exactly as named and which of network-failure, timeout or status-outside-2xx
    occurred, carrying the answered status where it named status-outside-2xx, and nothing else of the
    fetch.
  state: covered
  tests:
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotFetchedError with exactly link and kind — no status
      key — when the link cannot be reached at all
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotFetchedError with exactly link and kind — no status
      key — when the link times out
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotFetchedError with exactly link, kind and the answered
      status when the link answers outside 2xx
- criterion: A request naming a document that does not parse or does not declare OpenAPI 3.x is answered
    HTTP 422 reporting OpenApiDocumentNotReadableError, naming what failed to parse or which version was
    declared.
  state: covered
  tests:
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotReadableError naming what failed to parse, when the
      fetched text does not parse to a document
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotReadableError naming the declared version, when the
      document declares an unsupported OpenAPI version
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotReadableError naming that no version was declared, when
      the document declares neither openapi nor swagger
- criterion: A request naming a path and method the document declares no operation for is answered HTTP
    422 reporting OpenApiOperationNotFoundError, naming that path and method.
  state: covered
  tests:
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiOperationNotFoundError naming exactly the requested path and method,
      when the document declares no such operation
- criterion: None of the three draft refusals is ever answered as HTTP 500 with code INTERNAL_ERROR.
  state: covered
  tests:
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotFetchedError with exactly link and kind — no status
      key — when the link cannot be reached at all
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiDocumentNotReadableError naming what failed to parse, when the
      fetched text does not parse to a document
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: answers 422 reporting OpenApiOperationNotFoundError naming exactly the requested path and method,
      when the document declares no such operation
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: maps OpenApiDocumentNotFetchedError, OpenApiDocumentNotReadableError and OpenApiOperationNotFoundError
      all to 422, pinning distinct as specific rather than mutually exclusive across all three
- criterion: A successful request answers HTTP 200, never 201, 202 or 204, with the draft's connector,
    its configuration, its unresolved list (present as an empty list where nothing is unresolved) with
    each item's name and reason, its generated credentials (present as an empty list where none were generated)
    each paired with the security scheme's own name, and its method mismatch where one stands, and no
    other field.
  state: covered
  tests:
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: answers 200 with exactly connector, configuration, unresolved and generated_credentials — and
      no method_mismatch key at all — for an operation with no parameters, no security scheme and no configuration
      currently registered for the connector
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: adds method_mismatch, alongside exactly the same four other fields and no other key, when a
      different method is currently registered for the connector
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: names the unresolved parameter by its own name and reason, unchanged, when no capability is
      registered for the connector at all
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: carries a generated credential naming only its own generated name and security scheme — never
      a value field — when the operation requires an apiKey security scheme
- criterion: The response never carries a credential value.
  state: partial
  tests:
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: carries a generated credential naming only its own generated name and security scheme — never
      a value field — when the operation requires an apiKey security scheme
  - file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
    name: never carries a value read from environment configuration in the generated placeholder or in
      generated_credentials
  why: Only the generated_credentials entries are closed. The configuration text is unasserted in the
    one secured-document test; a resolved credential value substituted into the drafted configuration
    would pass every route test.
- criterion: The response never carries any capability's name, version or count, whatever is registered
    naming the draft's connector.
  state: covered
  tests:
  - file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
    name: carries no capability name, version or count anywhere in the response, even though two capabilities
      are registered against the drafted connector
findings:
- pass: conformance
  file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  where: the test titled "the draft's domain module carries no import statement at all, naming no framework,
    driver or provider client", lines 94-103
  evidence: "const importSpecifiers = [...source.matchAll(/(?:from|import)\\s*\\(?\\s*['\"]([^'\"]+)['\"\
    ]/g)];\n\n  expect(importSpecifiers).toEqual([]);"
  cost: The constraint permits infrastructure to reach the domain through ports — it bans only a framework,
    driver or provider-client import, not every import. This test instead asserts the module carries zero
    import statements of any kind, so a legitimate port import added to connector-configuration-draft.ts
    later would fail this test even though the specification's own fitness criterion ("finds no framework,
    driver or client package") admits it. A future reader who hits this failure will read the test's bare-zero
    rule as the constraint itself rather than the narrower one the node actually states.
  correction: Assert only that no matched import specifier names a framework, driver or provider-client
    package (or otherwise scope the check to the constraint's own terms), rather than asserting the specifier
    list is empty outright.
- pass: conformance
  file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
  where: the test 'recognizes HTTP basic and bearer schemes case-insensitively', lines 224-231
  evidence: "it('recognizes HTTP basic and bearer schemes case-insensitively', () => {\n  const placement\
    \ = generateCredentialPlaceholders({\n    connector: 'erp-http',\n    requiredSecuritySchemes: [httpScheme('mixedCaseBasic',\
    \ 'BASIC')],\n  });\n\n  expect(placement.headers.Authorization).toBe('Basic ${credential:ERP_HTTP_MIXEDCASEBASIC}');\n\
    });"
  cost: the rule and its Description name only "an HTTP basic scheme" and "an HTTP bearer scheme" as reducible,
    and the formal expression tests "s http basic"/"s http bearer" without saying whether the OpenAPI
    document's own scheme string is matched exactly or case-insensitively; this test locks in case-insensitive
    matching (and the production code mirrors it with httpScheme.toLowerCase()), so a reader checking
    whether a document spelling its scheme "BASIC" or "Basic" is honored by the draft finds the answer
    only here, in a test and its mirrored implementation, and a later change dropping the normalization
    would contradict no documented rule
  correction: state, in the rule or its Description, whether an HTTP security scheme's scheme value is
    read case-insensitively when deciding it reduces to basic or bearer, the way the security-field-in-effect
    and $ref readings are each stated as following OpenAPI 3.x's own definitions
- pass: conformance
  file: src/__tests__/unit/connector-registry/registered-method-comparison.spec.ts
  where: the test at lines 122-128, "treats a method key present in the registered text but holding a
    non-string value the same as no method being declared"
  evidence: "it('treats a method key present in the registered text but holding a non-string value the\
    \ same as no method being declared', async () => {\n  const registry = readerAnswering(registeredWithText('erp-http',\
    \ JSON.stringify({ method: 123 })));\n\n  const mismatch = await registeredMethodMismatch(registry,\
    \ 'erp-http', 'POST');\n\n  expect(mismatch).toBeUndefined();\n});"
  cost: The rule this test proves states only two conditions for "the registered configuration's own text
    declares a method" versus "declares no method" — present or absent. Whether a method key present but
    holding a non-string JSON value (a number here) counts as declaring one is answered nowhere in the
    rule's statement, its expression, or its decision-log entries for this node; this test settles it
    by itself, silently choosing the same outcome as absence. A reader who wants to know what a connector
    configuration is allowed to declare for method, or why a non-string value is safe to ignore rather
    than refuse, finds the answer only in this test and the code it drives, not in the specification the
    rule claims to be proving.
  correction: State, in the rule's statement or expression, what counts as "the registered configuration's
    own text declares a method" when the method key is present but not a string — whether that counts
    as declaring one, as declaring none, or refuses some other way — so this test proves an outcome the
    specification itself decided rather than one decided in the test.
- pass: conformance
  file: src/__tests__/unit/errors/openapi-document-not-readable.error.spec.ts
  where: the third test, lines 17-21, 'carries only the kind in context for a no-version-declared outcome,
    naming no other field'
  evidence: "const error = new OpenApiDocumentNotReadableError({ kind: 'no-version-declared' });\n\n \
    \ expect(error.context).toEqual({ kind: 'no-version-declared' });"
  cost: The node requires this refusal to name what failed to parse or which version was declared; this
    test locks in a third outcome that names neither, so an operator who gets a document declaring no
    version at all is told less than the node promises every reader of this refusal, and the gap is discoverable
    only by reading this test rather than the specification.
  correction: Either carry a field naming what is missing (e.g. that no version was declared, as the fact
    actually named) so the case satisfies the node's disjunctive disclosure, or fold this case into 'unsupported-version'/'unparseable'
    with the field that disjunction already requires — decided in the specification, not left to this
    test alone.
- pass: conformance
  file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  where: the test titled "accepts a method field naming no standard HTTP verb, matching it case-insensitively
    against the document's own declared operation key", lines 185-193
  evidence: 'built.fetchOpenApiDocument.mockResolvedValueOnce(JSON.stringify({ openapi: ''3.0.0'', paths:
    { ''/widgets'': { purge: {} } } }));

    const response = await app.inject({ method: ''POST'', url: ROUTE_URL, payload: validBody({ method:
    ''Purge'' }) });

    expect(response.statusCode).toBe(200);'
  cost: this test is the only place in the tree that decides how a request's own named method is matched
    against the document's declared operation key -- folding case and accepting a verb outside the closed
    GET/POST/PUT/PATCH/DELETE set an-openapi-document-declaring-no-such-operation-refuses-the-draft and
    a-connector-configuration-draft-states-the-chosen-operations-method are silent on; a reader who wants
    to know whether that lookup is case-sensitive or which verbs it accepts finds the answer only in this
    assertion, not in any rule
  correction: state, in an-openapi-document-declaring-no-such-operation-refuses-the-draft or a sibling
    rule, whether the request's named method is compared against the document's own operation key case-sensitively
    or case-insensitively, and whether an operation key outside the closed HTTP-verb vocabulary is honored
- pass: conformance
  file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  where: the three OpenApiDocumentNotReadableError detail assertions, lines 307, 320 and 333
  evidence: 'expect(body.error.details).toEqual({ kind: ''unparseable'', detail: ''the fetched document
    text'' });

    expect(body.error.details).toEqual({ kind: ''unsupported-version'', declaredVersion: ''2.0'' });

    expect(body.error.details).toEqual({ kind: ''no-version-declared'' });'
  cost: a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document spells out OpenApiDocumentNotFetchedError's
    own details field by field -- link, a closed three-value kind enum, an optional status -- but says
    nothing about what OpenApiDocumentNotReadableError's own details carry beyond "naming what failed
    to parse or which version was declared"; this file is where that shape -- a kind enum of 'unparseable',
    'unsupported-version' and 'no-version-declared', each paired with its own accompanying field ('detail'
    or 'declaredVersion', or neither) -- actually gets fixed, so the next reader who wants to know what
    a NotReadableError answer looks like has to read this test rather than the rule meant to answer that
  correction: state, in a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document (or
    a-malformed-or-unsupported-openapi-document-refuses-the-draft), what OpenApiDocumentNotReadableError's
    details carry -- the kind values it distinguishes and the field(s) accompanying each
- pass: conformance
  file: src/errors/openapi-document-not-readable.error.ts
  where: the OpenApiDocumentNotReadableReason union and the 'no-version-declared' branch of describeReason
  evidence: "| { readonly kind: 'no-version-declared' };\n\n...\n\n    case 'no-version-declared':\n \
    \     return 'the OpenAPI document declares no openapi or swagger version field';"
  cost: a-malformed-or-unsupported-openapi-document-refuses-the-draft draws this refusal's disclosure
    as a two-way split -- naming what failed to parse, or naming which version was declared -- and the
    decision log records that a third condition was deliberately declined for this same rule's neighbouring
    serialization question. This file instead carries a third, disjoint reason kind -- a document declaring
    no version field at all, distinct from both 'not well-formed' and 'declared version is wrong' -- with
    its own wording. A reader who wants to know every shape this refusal's detail can take has to read
    this error class rather than the node, and the distinction between 'unreadable' and 'no version at
    all' becomes a fact this file alone decided.
  correction: fold the no-version-declared case into the unparseable reason (a document with no openapi/swagger
    field is not a well-formed OpenAPI document) unless the specification is amended to state a third,
    separately-disclosed condition for this refusal.
- pass: standard
  file: src/__tests__/unit/connector-registry/openapi-document-fetcher.adapter.spec.ts
  where: the whole file — every it(...) block
  cites: TST-05
  evidence: 'function newHttpClient(): ... { return vi.fn<...>(); } ... function aFetcher(httpClient):
    OpenApiDocumentFetcher { return new OpenApiDocumentFetcher({ httpClient: httpClient as unknown as
    typeof fetch }); }'
  cost: OpenApiDocumentFetcher is the one adapter this epic adds for talking to the network, and every
    one of its nine tests substitutes a fully mocked httpClient (including the "defaults its own HTTP
    client to the platform global fetch" test, which still mocks globalThis.fetch). Nothing in this suite
    ever issues a real HTTP request, so the adapter's actual behavior against the real technology it wraps
    -- timeouts, real response streaming, real non-2xx handling over an actual connection -- is proven
    against nothing it will meet in production.
  correction: Add one integration test that exercises fetchOpenApiDocument against a real HTTP endpoint
    (e.g. a locally spun-up test server or a recorded fixture server), verifying the port it implements,
    alongside the existing mocked unit tests.
- pass: standard
  file: src/__tests__/unit/connector-registry/openapi-document-fetcher.adapter.spec.ts
  where: it('does not abandon the fetch before the full 60000ms deadline elapses', ...)
  cites: TST-01
  evidence: "await vi.advanceTimersByTimeAsync(59_999);\n      expect(settled).toBe(false);\n\n      await\
    \ vi.advanceTimersByTimeAsync(1);\n      expect(settled).toBe(true);\n      await expect(promise).resolves.toBeInstanceOf(OpenApiDocumentNotFetchedError);"
  cost: The test acts (advances the clock), asserts, acts again, then asserts twice more, so its claim
    can't be read off in one arrange/act/assert pass -- a reader has to trace two separate act/assert
    cycles to know what the test is actually claiming about the timeout boundary.
  correction: Split into two tests -- one asserting the fetch is still pending at 59,999ms, another (or
    a follow-on within a clearly separated act phase) asserting it settles at 60,000ms -- each with its
    own single arrange/act/assert.
- pass: failures
  file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  where: '"persists real, non-zero cost and durations for the judgment and consolidation calls..." (line
    412)'
  evidence: "AssertionError: expected 9 to be greater than or equal to 10\n ❯ src/__tests__/integration/factories/diagnose-server.factory.spec.ts:412:41"
  cost: The suite reports non-green on a run over this epic's delivery, even though the failing assertion
    measures real wall-clock elapsed milliseconds in an unrelated pipeline (diagnose-server/investigation
    factory), not any file the connector-configuration-openapi-helper epic touched.
  correction: Not a defect in this epic's implementation or tests. The assertion depends on actual measured
    elapsed time from a mocked delay being >=10ms and observed 9ms -- a timing-sensitive assertion vulnerable
    to machine/scheduling variance. Whoever owns diagnose-server.factory.spec.ts should either widen the
    tolerance or make the mocked delay deterministic instead of relying on real elapsed wall-clock time
    crossing an exact millisecond threshold.
  cause: setup
failures_counted: 1
reconciliation: siegard-reconcile/connector-configuration-openapi-helper-backend.md
run: run/connector-configuration-openapi-helper-backend
---

## What it is

Evidence from four passes over the connector-configuration-openapi-draft-backend epic's delivery: whether the tests prove the tasks' criteria, whether the source states only what the specification holds, whether it follows the project's own standard, and why the one captured failure failed.

## Notes

None.
