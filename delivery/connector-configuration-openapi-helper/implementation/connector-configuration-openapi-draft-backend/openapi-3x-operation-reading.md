---
title: OpenAPI 3.x operation reading -- the version gate and the anti-corruption reader
summary: A pure reading module parses a fetched OpenAPI document as JSON or YAML,
  gates its declared version, locates the named path-and-method operation, and exposes
  its method, merged parameters, application/json request-body field names and first-in-effect
  security schemes, refusing through two new distinct domain errors mapped to HTTP
  422.
task: sha256:a1cdbc659136618375a0e2d3e54f2fad9f7cb07ed917734328bec2f567690409
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-openapi-draft-backend-openapi-3x-operation-reading-build
installed:
- js-yaml
files:
- path: src/connector-registry/js-yaml.d.ts
  effect: 'Ambient module declaration exposing js-yaml''s `load(input: string): unknown`
    to the TypeScript compiler, since the installed js-yaml 4.3.1 ships no type declarations
    of its own and @types/js-yaml is not an authorized package; follows the existing
    src/persistence/pg.d.ts precedent of a minimal local declaration for exactly what
    is used.'
- path: src/errors/openapi-document-not-readable.error.ts
  effect: New one-class-per-file domain error `OpenApiDocumentNotReadableError`, carrying
    a discriminated `context` of kind 'unparseable' (with a `detail` naming what failed
    to parse), 'unsupported-version' (with the `declaredVersion` string as the document
    gave it) or 'no-version-declared'; its constructor accepts `ErrorOptions` so a
    caught parse exception can be attached as `cause`.
- path: src/errors/openapi-operation-not-found.error.ts
  effect: New one-class-per-file domain error `OpenApiOperationNotFoundError`, carrying
    the requested `path` and `method` verbatim as its `context`.
- path: src/connector-registry/openapi-operation-reader.ts
  effect: New pure reading module exporting `readOpenApiOperation(documentText, path,
    method)`. Parses the text as JSON, falling back to YAML, refusing (OpenApiDocumentNotReadableError)
    whatever parses as neither or parses to a non-object; gates the version via the
    document's own `openapi`/`swagger` field, refusing an unsupported or undeclared
    version; locates the operation at the named path and method (case-insensitive
    on the input method only, never on a name read from the document), refusing (OpenApiOperationNotFoundError)
    an absent path or method; and returns the operation's own method key, its merged
    path-item+operation parameters (name, location, $ref-resolved), its application/json
    request-body top-level property names, and the schemes named by the first requirement
    object of the security field in effect (operation's own, including an explicit
    empty array, else the document's top-level), each carrying its own declared kind
    and, for apiKey, its name and location. A local `resolveRef` follows any $ref
    (local JSON pointer) to its target, recursively, before any name/location/schema/kind
    is read.
- path: src/errors/status-map.ts
  effect: Registers OpenApiDocumentNotReadableError and OpenApiOperationNotFoundError
    at HTTP 422 alongside the pre-existing OpenApiDocumentNotFetchedError entry; no
    other entry changed.
- path: package.json
  effect: 'Adds "js-yaml": "^4.3.0" to dependencies, matching the version (4.3.1)
    already resolved transitively in package-lock.json.'
criteria:
- criterion: A document declaring swagger 2.0 refuses the request with an HTTP 422
    response reporting an OpenApiDocumentNotReadableError, naming the declared version.
  met: true
  how: refuseUnsupportedVersion in openapi-operation-reader.ts reads a string `swagger`
    field and throws OpenApiDocumentNotReadableError({kind:'unsupported-version',
    declaredVersion}); status-map.ts maps that class to 422.
- criterion: A document declaring a version that is not OpenAPI 3.x refuses the request
    the same way, naming the version it declared.
  met: true
  how: the same function's `openapi` branch throws the identical error/reason shape
    when the string doesn't start with 3..
- criterion: Text that does not parse as a document at all refuses the request the
    same way, naming what failed to parse.
  met: true
  how: parsedOpenApiDocument attempts JSON.parse then js-yaml's load; either failing
    to produce a plain object (including YAML's permissive scalar-string parse of
    arbitrary text) throws OpenApiDocumentNotReadableError({kind:'unparseable', detail:'the
    fetched document text'}).
- criterion: A document that parses and declares OpenAPI 3.x but declares no operation
    at the named path and HTTP method refuses the request with an HTTP 422 response
    reporting an OpenApiOperationNotFoundError, naming that path and that method.
  met: true
  how: operationEntry looks up document.paths[path] then the lower-cased method key
    on the (ref-resolved) path item; either absent or not a plain object throws OpenApiOperationNotFoundError(path,
    method), mapped to 422.
- criterion: The OpenApiDocumentNotReadableError and OpenApiOperationNotFoundError
    values are two distinct error values, and neither is ever reported as the other.
  met: true
  how: two separate classes in two separate files with distinct `name` values and
    distinct throw sites (parse/version gate vs. operation lookup); status-map.ts
    lists them as two separate map entries.
- criterion: An OpenAPI 3.x document declaring the named operation yields the chosen
    operation's own HTTP method.
  met: true
  how: OpenApiOperationReading.method is the exact path-item key that matched (the
    document's own lower-case verb spelling), returned unmodified -- no upper-casing,
    which the task's own Notes/REMAINDER assign to the composing task.
- criterion: An OpenAPI 3.x document declaring the named operation yields the chosen
    operation's parameter names, their own declared location (path, query, header
    or cookie) and their positions exactly as the document spells them, merging a
    path item's own parameters with the operation's own by name and location and following
    any $ref to its target first.
  met: true
  how: parametersOf/resolvedParameterList resolve $ref on every parameter entry first,
    then merge the path item's parameters with the operation's own, operation's own
    winning any name+location conflict, exposing {name, location} pairs verbatim.
- criterion: An OpenAPI 3.x document declaring the named operation yields the chosen
    operation's request-body field names -- the keys of the top-level properties object
    of the schema declared under the media type application/json, and none where that
    content declares no application/json entry, none nested, and none at all where
    that schema is an array or another non-object -- exactly as the document spells
    them.
  met: true
  how: requestBodyFieldNamesOf resolves the request body and its schema (both possibly
    $ref) and reads only Object.keys(schema.properties) at that single level, returning
    [] wherever content, the application/json entry, or a properties object is absent.
- criterion: An OpenAPI 3.x document declaring the named operation yields the security
    scheme names required by the first requirement object of the security field in
    effect (the operation's own where declared, else the document's top-level), with
    each scheme's own declared kind and, for an API key, the name and location (header,
    query or cookie) it is carried in.
  met: true
  how: 'requiredSecuritySchemesOf reads `operation.security !== undefined ? operation.security
    : document.security` (so an operation''s own empty array stays in effect per the
    task''s UNDERDETERMINED note), takes only the first requirement object''s own
    keys, and requiredSecurityScheme resolves each declaration (through $ref) to expose
    kind ''apiKey'' (with name/location), ''http'' (with the raw httpScheme sub-field,
    needed downstream to distinguish basic/bearer), or the raw ''oauth2''/''openIdConnect''/''mutualTLS''
    kind.'
- criterion: No name read from the document is lower-cased, normalized or separator-rewritten
    on the way out of the reader.
  met: true
  how: every exposed name (parameter name, request-body field key, security scheme
    requirement key, apiKey name, http scheme sub-field) is passed through untouched;
    the only lower-casing performed (method.toLowerCase()) is applied to the caller's
    requested method for lookup, never to a value read from the document.
nodes:
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft
  encoded_at:
  - src/errors/openapi-document-not-readable.error.ts
  - src/connector-registry/openapi-operation-reader.ts
  - src/connector-registry/js-yaml.d.ts
  - package.json
  - src/errors/status-map.ts
  how: The reader accepts both JSON and YAML, decided purely by attempting to parse
    the text (never by a content-type header, which this reader never even receives),
    treats a document served as YAML exactly as one served as JSON, and refuses through
    the single OpenApiDocumentNotReadableError value for every one of does-not-parse-as-either-serialization,
    parses-to-something-that-isn't-a-well-formed-OpenAPI-object, declares-no-version,
    declares-swagger-2.0 and declares-an-openapi-version-outside-3.x.
- node: rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-draft
  encoded_at:
  - src/errors/openapi-operation-not-found.error.ts
  - src/connector-registry/openapi-operation-reader.ts
  - src/errors/status-map.ts
  how: operationEntry refuses with OpenApiOperationNotFoundError(path, method) whenever
    the document's paths hold no entry for the path or the resolved path item holds
    no operation under the named method, producing no draft data of any kind (the
    function throws before any of parameters/body/security is read).
- node: rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  encoded_at:
  - src/errors/status-map.ts
  - src/errors/openapi-document-not-readable.error.ts
  - src/errors/openapi-operation-not-found.error.ts
  how: OpenApiDocumentNotReadableError is registered at HTTP 422, the same status
    the pre-existing OpenApiDocumentNotFetchedError already answers under, as two
    distinct named error values that are never interchanged; this task adds the readable-document
    side of that pairing (the fetch side was already delivered by the sibling fetch
    task) and additionally keeps the operation-not-found refusal on its own distinct
    value, per an-openapi-document-declaring-no-such-operation-refuses-the-draft's
    own reasoning that it is neither of the other two.
- node: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
  how: Only the portion this task owns -- parameter merging (path item union operation,
    operation's own winning conflicts by name+location), $ref resolution before any
    name/location/schema is read, and the application/json-only, top-level-properties-only
    request-body field reading -- is encoded; the drafted address/query/header/cookie
    composition, the brace-form and unresolved-position handling, and the generated-credential
    placement are the composing task's, named here only as the REMAINDER the task's
    own Notes already record.
- node: rules/integration/a-connector-configuration-draft-states-the-chosen-operations-method
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
  how: Only the method is the chosen operation's own as the document names it is encoded
    -- OpenApiOperationReading.method is the exact matched path-item key, unmodified;
    upper-casing it into the drafted configuration and never drafting a currently-registered
    method in its place are the composing task's, per this task's own REMAINDER.
- node: scenarios/integration/a-swagger-2-document-refuses-the-draft
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
  - src/errors/openapi-document-not-readable.error.ts
  how: refuseUnsupportedVersion's swagger branch is exactly this scenario's given/when/then
    -- a document naming a swagger field refuses, naming that declared version, and
    produces no operation reading.
inferences:
- inferred: A non-object parse result, a dangling or cyclic $ref, and a security-scheme
    declaration whose `type` is not one of OpenAPI's five recognized values are all
    folded into the same OpenApiDocumentNotReadableError (kind 'unparseable'), rather
    than inventing further distinct reasons or error values.
  from: The rule's own description states the parse failure and the unsupported-version
    failure already share one value because one rule states them as one refusal for
    one reason -- nothing partial is worth drafting from text the reader cannot take
    as OpenAPI 3.x -- the same reasoning covers any other way the text turns out not
    to be a well-formed OpenAPI 3.x document, and the task's own UNDERDETERMINED note
    already extends this same refusal to one unstated variant (no version field at
    all) on that same ground.
- inferred: Criterion 7's positions is read as identical to the parameter's declared
    location (path/query/header/cookie) rather than a distinct exposed field.
  from: OpenAPI's Parameter Object carries no positional data beyond name and `in`,
    and a-connector-configuration-draft-places-each-part-where-the-call-carries-it's
    own expression derives a parameter's call position purely from p.name and p.in.
- inferred: js-yaml's `load` is called directly inside the connector-registry domain
    module rather than behind a port/adapter.
  from: The inventory's own noted convention that connector-configuration-registry.service.ts
    already calls JSON.parse directly inside this same module on JSON-string fields;
    a port-and-adapter separation is read as targeting stateful external systems (database,
    model provider, observation source, clock), not a deterministic in-memory format
    parser.
- inferred: The http security scheme's own `scheme` sub-field (basic/bearer) is exposed
    as `httpScheme` alongside kind:'http', though criterion 9 names only kind and,
    for an API key, name and location.
  from: The task's own ADVISORY note that reducibility is decided downstream from
    what this reader exposes, and the sibling security-scheme rule (a-connector-configuration-draft-names-a-generated-credential-for-a-reducible-security-scheme)
    cannot tell a reducible basic/bearer scheme apart from any other 'http'-typed
    scheme without that sub-field.
- inferred: A local ambient module declaration (js-yaml.d.ts) was written rather than
    adding @types/js-yaml.
  from: js-yaml 4.3.1 (the version already resolved in package-lock.json) ships no
    .d.ts of its own, and @types/js-yaml is not in the authorized-packages list; src/persistence/pg.d.ts
    is the existing precedent for this exact shape of departure.
preserved:
- Every existing entry of STATUS_BY_ERROR_CLASS in src/errors/status-map.ts continues
  to resolve to its prior status; the two new entries were appended without reordering
  or altering any prior class or status.
- package.json's existing dependencies, devDependencies and scripts are unchanged
  apart from the new js-yaml line.
deferred:
- what: Wiring readOpenApiOperation into an HTTP route/controller, and building the
    actual draft (configuration text, placeholders, generated credentials) from what
    it exposes.
  why: Both belong to the task that answers draft-connector-configuration-from-openapi
    and to the credential-generation task, per this task's own REMAINDER notes; no
    controller or factory for the draft operation exists yet for this task to reach.
---

## What it is

The anti-corruption reading between an OpenAPI document and this system's own vocabulary -- the only place a version is judged, and the only place a document's own names enter the draft path.

## Notes

js-yaml was authorized in the project's own standard specifically for this task (siegard-standard commit), since the specification decided a fetched OpenAPI document may be served as JSON or YAML and the runtime holds no native YAML parser; package-lock.json was refreshed via `npm install` (run by the orchestrating session, since no agent here holds a shell) after package.json gained the dependency line.
