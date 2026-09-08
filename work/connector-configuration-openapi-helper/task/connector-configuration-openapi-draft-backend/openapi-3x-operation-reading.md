---
title: Read a fetched document as OpenAPI 3.x, or refuse it
summary: The version gate and the parse of the fetched text, refusing a document that does not parse or does not declare OpenAPI 3.x, and exposing the chosen operation's method, parameter names, request-body field names and security schemes exactly as the document gives them.
rationale: The scope states the parse and version refusal without saying where the reading of the operation's parts sits; I put them in one task because a reader that admits a document is the same decision as a reader that refuses one, and one seam is crossed either way.
sources:
  - intake/scope.md
objective: A fetched document is read into the chosen operation's own method, parameter names, request-body field names and security schemes, or the request is refused naming what failed to parse, which version was declared, or which path-and-method pairing the document declares no operation for.
criteria:
  - A document declaring swagger 2.0 refuses the request with an HTTP 422 response reporting an OpenApiDocumentNotReadableError, naming the declared version.
  - A document declaring a version that is not OpenAPI 3.x refuses the request the same way, naming the version it declared.
  - Text that does not parse as a document at all refuses the request the same way, naming what failed to parse.
  - A document that parses and declares OpenAPI 3.x but declares no operation at the named path and HTTP method refuses the request with an HTTP 422 response reporting an OpenApiOperationNotFoundError, naming that path and that method.
  - The OpenApiDocumentNotReadableError and OpenApiOperationNotFoundError values are two distinct error values, and neither is ever reported as the other.
  - An OpenAPI 3.x document declaring the named operation yields the chosen operation's own HTTP method.
  - An OpenAPI 3.x document declaring the named operation yields the chosen operation's parameter names, their own declared location (path, query, header or cookie) and their positions exactly as the document spells them, merging a path item's own parameters with the operation's own by name and location and following any $ref to its target first.
  - An OpenAPI 3.x document declaring the named operation yields the chosen operation's request-body field names -- the keys of the top-level properties object of the schema declared under the media type application/json, and none where that content declares no application/json entry, none nested, and none at all where that schema is an array or another non-object -- exactly as the document spells them.
  - An OpenAPI 3.x document declaring the named operation yields the security scheme names required by the first requirement object of the security field in effect (the operation's own where declared, else the document's top-level), with each scheme's own declared kind and, for an API key, the name and location (header, query or cookie) it is carried in.
  - No name read from the document is lower-cased, normalized or separator-rewritten on the way out of the reader.
implements:
  - rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft
  - rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-draft
  - rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  - rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
  - rules/integration/a-connector-configuration-draft-states-the-chosen-operations-method
  - scenarios/integration/a-swagger-2-document-refuses-the-draft
---

## What it is

The anti-corruption reading between an OpenAPI document and this system's own vocabulary.
It is the only place a version is judged, and the only place a document's own names enter the draft path.

## Notes

Byte-exact name preservation is load-bearing for the placeholder resolution that reads this task's output, which is why it is a criterion here rather than left to the consumer.
Parameter merging, $ref resolution, the application/json-only request-body schema and the security-field precedence are all read the way OpenAPI 3.x itself already defines them, not a preference this specification states — decided directly rather than through a blind judge, since each has exactly one correct answer fixed by the format this reader parses.
REMAINDER, from the specification — the fetch-failure refusal itself (OpenApiDocumentNotFetchedError) reaches no criterion of this task, which produces no fetch-failure refusal. Belongs to the task implementing rules/integration/an-unfetchable-openapi-link-refuses-the-draft.
REMAINDER, from the specification — every placement clause of rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it beyond what a parameter's declared location is, that request-body field names come only from the top-level properties of the application/json schema, and that an API key scheme declares a name and location — the drafted address composition, query/headers/Cookie keys, the resolved-or-brace-form value at each position, and the placement of each generated credential — reaches no criterion here. Belongs to the task that composes the draft's configuration text from what this reader exposes.
REMAINDER, from the specification — rules/integration/a-connector-configuration-draft-states-the-chosen-operations-method is named here only for "the method is the chosen operation's own as the document names it"; that the draft's configuration declares a method key, that its value is upper-cased, and that a registered configuration's method is never drafted in its place reach no criterion here. Belongs to the task that composes the draft's configuration text.
ADVISORY, from the specification — criterion 9 requires the reader to expose a non-reducible security scheme's own kind (OAuth2, OpenID Connect among them) rather than drop it, since reducibility and the unresolved reason belong to the credential-generation task and cannot be decided downstream from a scheme the reader never exposed.
ADVISORY, from the specification — constraints/a-malformed-request-is-refused-with-a-validation-error, constraints/the-openapi-document-is-fetched-by-the-backend and constraints/the-domain-depends-on-no-infrastructure are candidates this task does not reach: this task's refusals are domain refusals at HTTP 422, not the route's HTTP 400 shape refusal or the fetch itself.
REMAINDER, from the specification — confirmed unchanged on re-bind after rules/integration/a-connector-configuration-draft-response-carries-no-capability and rules/integration/a-drafted-connector-configuration-is-answered-as-a-read were added to the epic's covers; both govern the successful answer of draft-connector-configuration-from-openapi, and no criterion of this task assembles or answers a draft. Belongs to the task that answers draft-connector-configuration-from-openapi.
UNDERDETERMINED, from the specification — criteria 1-3 name only two unreadable conditions (a declared version that is swagger 2.0 or otherwise not OpenAPI 3.x, and text that does not parse at all) and leave open a document that parses to an object declaring no version field at all, which rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft still refuses. Implementation: a document parsing to an object that declares neither an openapi nor a swagger version field refuses the request the same way, naming that no version was declared.
UNDERDETERMINED, from the specification — criterion 9's "the operation's own where declared" leaves open whether an operation's own empty security array counts as declared, which rules/integration/a-connector-configuration-draft-names-a-generated-credential-for-a-reducible-security-scheme resolves (no scheme required rather than falling back to the document's top level). Implementation: an operation's own empty security array is read as declared and in effect, yielding no required scheme, rather than as absent.
UNDERDETERMINED, from the specification — no criterion states which serializations a fetched OpenAPI document is read from. rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft now decides it: the document is read as OpenAPI 3.x in either of the two serializations the format itself defines — JSON and YAML — the serialization decided by parsing the fetched text itself and never by any content type the response declared, a document served as YAML read exactly as one served as JSON, and text parsing as neither serialization refused the same way as an unparseable document. Implementation: the reader accepts both a JSON-parsed and a YAML-parsed document as equally well-formed, decides the serialization by attempting to parse the text rather than by inspecting any response header, and reports the OpenApiDocumentNotReadableError refusal for text that parses as neither.
