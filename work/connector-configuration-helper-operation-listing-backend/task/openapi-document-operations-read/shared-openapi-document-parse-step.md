---
title: Factor the OpenAPI parse and version refusal out of the operation lookup
summary: The JSON-then-YAML parse and the OpenAPI 3.x version refusal become one reusable
  unit, with the draft operation's behaviour unchanged.
objective: The parse of a fetched OpenAPI document's text and the refusal of anything
  that is not a well-formed OpenAPI 3.x document stand as one unit in src/src/connector-registry
  that callers other than the single-operation lookup can use, and the draft operation
  behaves exactly as it did before.
criteria:
- A single unit in src/src/connector-registry accepts a fetched document's text, parses
  it as JSON and then as YAML, and returns the parsed OpenAPI document without performing
  any path or method lookup.
- That unit refuses text that parses as neither JSON nor YAML, naming what failed
  to parse.
- That unit refuses a parsed document whose declared version is present but is not
  OpenAPI 3.x, naming the declared version, and returns no document.
- That unit refuses a parsed document that declares no version at all -- neither
  an openapi field nor a swagger field -- naming that the document declares no version,
  that naming distinct from a parse failure and from a declared-but-unsupported version,
  and returns no document.
- That unit does not refuse a fetched document that parses as a well-formed OpenAPI
  3.x document.
- readOpenApiOperation obtains its parsed document from that unit and holds no parsing,
  version-checking or version-refusal code of its own.
- A draft requested from a fetched document declaring swagger 2.0 is still refused
  naming the declared version, and no draft is generated.
- A draft requested from a fetched document whose text parses as neither JSON nor
  YAML is still refused naming what failed to parse.
- A YAML OpenAPI 3.x document still yields the same draft a JSON document of the same
  content yields, the serialization decided by parsing the text and never by a declared
  content type.
- A draft requested for a path and method pairing the fetched document declares no
  operation for is still refused with OpenApiOperationNotFoundError naming that path
  and that method.
- No error class, message or context readOpenApiOperation previously raised is renamed,
  retyped or dropped.
- The existing tests covering draft-connector-configuration-from-openapi pass with
  no test amended to accommodate the extraction.
rationale: 'Cut as its own task because the scope asks for a listing and the inventory
  reports the parse step is not reachable without one: extracting it is a change to
  delivered draft behaviour''s substrate, which has a different reason to change than
  what the new read lists, and it can be shown correct by the draft operation''s own
  existing behaviour before any listing exists.'
implements:
- rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft
- rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-draft
- rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
- scenarios/integration/a-swagger-2-document-refuses-the-draft
sources:
- work/connector-configuration-helper-operation-listing-backend/intake/scope.md
---

## What it is
The parse-and-version-refusal half of openapi-operation-reader.ts, separated from the path-and-method lookup it is currently entangled with.
It is the step a document-wide listing and the single-operation lookup both need, held once.

## Notes
The inventory names this entanglement explicitly and names changing draft behaviour as the risk the extraction carries, which is why most of the criteria here are preservation conditions on the draft operation.
The fetcher is not part of this extraction.
UNDERDETERMINED, from the specification — rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft refuses a document that parses as one of the two serializations but is not a well-formed OpenAPI document, and no criterion here reaches that clause beyond the version check; a unit checking only that the text parses and that a declared openapi field names a 3.x version, accepting a document whose paths member is not even an object, would pass every criterion as written. Implementation should raise the same OpenApiDocumentNotReadableError for a document that is not well-formed once the extraction lands, not only for the two conditions the criteria spell out.
UNDERDETERMINED, from the specification — no criterion binds the "declares no version" refusal to reusing OpenApiDocumentNotReadableError rather than a new error class of its own, though rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft's own decision log entry states that naming lands "inside the one unreadable-document refusal already stated, taking no further error value." Implementation should raise OpenApiDocumentNotReadableError for the no-version case too, never a third class.
REMAINDER, from the specification — the fetch-stage half of rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document (the HTTP 422 OpenApiDocumentNotFetchedError and its details) belongs to draft-connector-configuration-from-openapi's already-delivered fetch stage, untouched by this extraction.
ADVISORY, from the specification — the operations-read nodes (contracts/integration/openapi-document-operations, domain/integration/openapi-document-operations, domain/integration/openapi-operation, rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read, rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read, rules/integration/an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document, rules/integration/an-openapi-operations-method-is-upper-cased, scenarios/integration/a-swagger-2-document-refuses-the-operations-read) motivate this extraction but are implemented by task/openapi-document-operations-read/document-operations-reading, which consumes the unit this task produces.
ADVISORY, from the specification — constraints/the-openapi-document-is-fetched-by-the-backend is neighboured, not implemented: this task's unit takes already-fetched text and moves no fetch.
