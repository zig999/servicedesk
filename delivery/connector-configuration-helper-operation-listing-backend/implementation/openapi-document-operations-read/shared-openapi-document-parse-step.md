---
target: backend
title: Extract the OpenAPI parse-and-version-refusal step into a shared unit
summary: A new readOpenApiDocument unit in connector-registry holds the JSON-then-YAML parse and the OpenAPI
  3.x version refusal (including a paths-shape well-formedness check), and readOpenApiOperation now delegates
  to it instead of holding that logic itself.
task: sha256:142130512dff98f48dc3e389156eeec17dab5183daac2e568a1c19538acafb03
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/openapi-document-operations-read-shared-openapi-document-parse-step-build
files:
- path: src/connector-registry/openapi-document-reader.ts
  effect: New module exporting the OpenApiDocument type and readOpenApiDocument(documentText), which parses
    text as JSON then YAML, refuses text that parses as neither (naming "the fetched document text"),
    refuses an unsupported or absent openapi/swagger version (naming the declared version, or naming no-version-declared
    distinctly), refuses a document whose paths member is present but is not an object, and otherwise
    returns the parsed document -- with no path or method lookup of any kind. All refusals raise OpenApiDocumentNotReadableError,
    reusing its existing 'unparseable' | 'unsupported-version' | 'no-version-declared' reasons.
- path: src/connector-registry/openapi-operation-reader.ts
  effect: readOpenApiOperation now obtains its document via readOpenApiDocument(documentText) and holds
    only the path/method lookup, $ref resolution, parameter/request-body/security-scheme reading and server
    resolution it already held. The former parsedOpenApiDocument, parsedAsJsonOrYaml, parsedAsYaml and
    refuseUnsupportedVersion functions and the js-yaml import are removed from this file; the notReadable
    helper, OpenApiDocumentNotReadableError import, PlainObject type and every other function are unchanged.
criteria:
- criterion: A single unit in src/src/connector-registry accepts a fetched document's text, parses it
    as JSON and then as YAML, and returns the parsed OpenAPI document without performing any path or method
    lookup.
  met: true
  how: readOpenApiDocument in openapi-document-reader.ts does exactly this and nothing else; operationEntry
    (path/method lookup) lives only in openapi-operation-reader.ts and is never called from the new unit.
- criterion: That unit refuses text that parses as neither JSON nor YAML, naming what failed to parse.
  met: true
  how: parsedOpenApiDocument/parsedAsJsonOrYaml/parsedAsYaml try JSON.parse then js-yaml's load, and throw
    notReadable('the fetched document text') -- the same message the code carried before extraction --
    when neither succeeds or the result is not a plain object.
- criterion: That unit refuses a parsed document whose declared version is present but is not OpenAPI
    3.x, naming the declared version, and returns no document.
  met: true
  how: 'refuseUnsupportedVersion throws OpenApiDocumentNotReadableError({ kind: ''unsupported-version'',
    declaredVersion }) for a non-"3."-prefixed openapi field or any swagger field, before readOpenApiDocument''s
    return statement is reached.'
- criterion: That unit refuses a parsed document that declares no version at all -- neither an openapi
    field nor a swagger field -- naming that the document declares no version, that naming distinct from
    a parse failure and from a declared-but-unsupported version, and returns no document.
  met: true
  how: 'refuseUnsupportedVersion''s final branch throws OpenApiDocumentNotReadableError({ kind: ''no-version-declared''
    }) -- a third, distinct discriminant from ''unparseable'' and ''unsupported-version'' -- when neither
    field is a string.'
- criterion: That unit does not refuse a fetched document that parses as a well-formed OpenAPI 3.x document.
  met: true
  how: A document that parses to a plain object, declares a 3.x openapi version, and whose paths member
    (when present) is itself a plain object passes all three checks and is returned; every existing fixture
    in openapi-operation-reader.spec.ts and draft-connector-configuration-from-openapi.routes.spec.ts
    fits this shape and continues to resolve.
- criterion: readOpenApiOperation obtains its parsed document from that unit and holds no parsing, version-checking
    or version-refusal code of its own.
  met: true
  how: readOpenApiOperation's body opens with `const document = readOpenApiDocument(documentText);` and
    the file no longer defines parsedOpenApiDocument, parsedAsJsonOrYaml, parsedAsYaml or refuseUnsupportedVersion,
    nor imports js-yaml.
- criterion: A draft requested from a fetched document declaring swagger 2.0 is still refused naming the
    declared version, and no draft is generated.
  met: true
  how: 'readOpenApiOperation delegates parsing to readOpenApiDocument, whose refuseUnsupportedVersion
    throws OpenApiDocumentNotReadableError({ kind: ''unsupported-version'', declaredVersion: ''2.0'' })
    before any operation lookup, so generateConnectorConfigurationDraft''s await of readOpenApiOperation
    rejects and no draft is produced -- unchanged from before the extraction.'
- criterion: A draft requested from a fetched document whose text parses as neither JSON nor YAML is still
    refused naming what failed to parse.
  met: true
  how: The same parsedOpenApiDocument path now lives in openapi-document-reader.ts and is reached identically
    through readOpenApiOperation, throwing the same OpenApiDocumentNotReadableError with detail "the fetched
    document text".
- criterion: A YAML OpenAPI 3.x document still yields the same draft a JSON document of the same content
    yields, the serialization decided by parsing the text and never by a declared content type.
  met: true
  how: parsedAsJsonOrYaml still tries JSON.parse first and falls back to js-yaml's load with no content-type
    read anywhere in either file, so a YAML and a JSON document of the same content parse to the same
    object and readOpenApiOperation returns the same OpenApiOperationReading -- the existing "reads a
    document served as YAML exactly as one served as JSON" test exercises this unchanged.
- criterion: A draft requested for a path and method pairing the fetched document declares no operation
    for is still refused with OpenApiOperationNotFoundError naming that path and that method.
  met: true
  how: operationEntry, untouched by this extraction, still throws `new OpenApiOperationNotFoundError(path,
    method)` when the resolved path item holds no operation for the requested method, after the document
    it receives has already passed readOpenApiDocument's checks.
- criterion: No error class, message or context readOpenApiOperation previously raised is renamed, retyped
    or dropped.
  met: true
  how: OpenApiDocumentNotReadableError and OpenApiOperationNotFoundError are unchanged classes; every
    message and every context shape ('unparseable'/detail, 'unsupported-version'/declaredVersion, 'no-version-declared',
    path/method) is produced with the identical wording and shape as before the extraction, only from
    a different file.
- criterion: The existing tests covering draft-connector-configuration-from-openapi pass with no test
    amended to accommodate the extraction.
  met: true
  how: Neither draft-connector-configuration-from-openapi.routes.spec.ts nor openapi-operation-reader.spec.ts
    imports or references openapi-document-reader.ts; both call readOpenApiOperation exactly as before,
    and every fixture they use (all declaring paths as a plain object) passes the new unit's checks the
    same way the old inline checks did.
nodes:
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft
  encoded_at:
  - src/connector-registry/openapi-document-reader.ts
  - src/errors/openapi-document-not-readable.error.ts
  how: The unparseable, unsupported-version and no-version-declared refusals this rule states are all
    raised from the extracted unit before any document is returned to a caller; the rule's own "or parses
    as one of them but is not a well-formed OpenAPI document" clause is additionally answered by the paths-shape
    check, per this task's own note directing that a document whose paths member is not even an object
    be refused the same way, not only the version case the stated criteria spell out.
- node: rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-draft
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
  - src/errors/openapi-operation-not-found.error.ts
  how: operationEntry's lookup and its OpenApiOperationNotFoundError throw are untouched by the extraction;
    they still run only after readOpenApiDocument has already returned a document that parsed and declared
    OpenAPI 3.x, preserving this rule's own condition.
- node: rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  encoded_at:
  - src/connector-registry/openapi-document-reader.ts
  - src/errors/openapi-document-not-readable.error.ts
  how: This task moves none of the fetch stage or the status-map wiring; it only relocates the unreadable-document
    half of the distinction (OpenApiDocumentNotReadableError) into its own unit, keeping the same error
    value the surface already maps to 422, so the distinction this rule states continues to hold unchanged.
- node: scenarios/integration/a-swagger-2-document-refuses-the-draft
  encoded_at:
  - src/connector-registry/openapi-document-reader.ts
  how: refuseUnsupportedVersion, now inside the extracted unit, still throws OpenApiDocumentNotReadableError
    naming '2.0' for a swagger-2.0 document before any draft logic runs, so the given/when/then this scenario
    states is unchanged by the extraction.
inferences:
- inferred: The unit's well-formedness check beyond version is narrowed to "a document's paths member,
    when present, must be a plain object", checked after the version check, refusing with the 'unparseable'
    reason and detail "the document's paths member".
  from: The task's own note on rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft,
    which names exactly this example ("a document whose paths member is not even an object") as the gap
    a version-only check would leave, and directs raising the same OpenApiDocumentNotReadableError for
    it -- narrower guidance than a full structural validation of the document, which no node states.
- inferred: isPlainObject is kept as a small private helper duplicated in both openapi-document-reader.ts
    and openapi-operation-reader.ts rather than exported and shared from one of them.
  from: Neither the inventory nor the standard names a shared-utilities module for connector-registry,
    and every existing file in this module (openapi-operation-reader.ts itself) already defines its own
    private predicates rather than importing them from a sibling.
preserved:
- Every refusal readOpenApiOperation raised before the extraction (OpenApiDocumentNotReadableError with
  its three context shapes, and OpenApiOperationNotFoundError with path and method), unchanged in class,
  message and context.
- The $ref resolution, parameter merging, request-body field reading, security-scheme reading and server
  resolution readOpenApiOperation performs after the document is parsed.
- 'The YAML-equals-JSON equivalence: the serialization is still decided only by attempting JSON.parse
  then YAML, never by a declared content type.'
- The consumers of readOpenApiOperation -- connector-configuration-draft-generation.ts and the draft-connector-configuration-from-openapi
  controller -- call it with the same signature and receive the same OpenApiOperationReading shape.
---

## What it is

The parse-and-version-refusal half of openapi-operation-reader.ts is now its own unit, openapi-document-reader.ts, that a document-wide operations listing and the single-operation lookup both call.

## Notes

A paths-member well-formedness check was added to the extracted unit beyond the version check the task's criteria spell out, per the task's own UNDERDETERMINED note on this point.
The no-version-declared refusal reuses OpenApiDocumentNotReadableError rather than a new error class, per the task's own UNDERDETERMINED note and the cited decision-log entry.
isPlainObject is duplicated as a small private predicate in the new file rather than shared, matching this module's existing convention of no shared-utilities import.
