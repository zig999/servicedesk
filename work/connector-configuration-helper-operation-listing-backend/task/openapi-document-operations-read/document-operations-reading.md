---
title: Read every operation a fetched OpenAPI document declares
summary: A backend reading that fetches an operator-named document link and answers
  every path and upper-cased method pair the document declares, or refuses.
objective: Given an operator-named OpenAPI document link, the backend answers every
  operation the fetched document declares as a path and an upper-cased HTTP method
  pair, and refuses the read where the link cannot be fetched or the document cannot
  be read as OpenAPI 3.x.
criteria:
- A fetched document declaring one path /items with a get operation and a post operation
  under it is read as two entries, one naming /items with GET and one naming /items
  with POST.
- Every entry's method is upper-cased whatever case the document's own path-item key
  named it under.
- Every entry names the path exactly as the document declares it.
- Every operation the document declares is answered in one answer, the read accepting
  no page, cursor, offset or limit and truncating nothing.
- A read whose named link fails with a network failure, a timeout, or a response outside
  the 2xx range is refused naming the fetch failure, with no parse attempted and no
  operations read.
- The fetch is abandoned as a timeout where the named link has not answered within
  60000 milliseconds, delivered by the existing IOpenApiDocumentFetcher port rather
  than by a second timeout introduced here.
- A read whose fetched document declares swagger 2.0 is refused naming the declared
  version, and no operations are read.
- A read whose fetched document's text parses as neither JSON nor YAML is refused
  naming what failed to parse, and no operations are read.
- A read whose fetched document parses but declares no version at all -- neither
  an openapi field nor a swagger field -- is refused naming that the document declares
  no version, that naming distinct from a parse failure and from a declared-but-unsupported
  version, and no operations are read.
- A YAML OpenAPI 3.x document is read into the same operations a JSON document of
  the same content is read into, the serialization decided by parsing the fetched
  text and never by any content type the response declared.
- The document fetch is issued inside this backend reading through IOpenApiDocumentFetcher,
  and the reading offers no parameter by which a caller supplies already-fetched document
  text.
- The reading parses through the unit task/openapi-document-operations-read/shared-openapi-document-parse-step
  established, holding no parse or version-refusal code of its own.
- The reading generates no connector configuration draft and issues no register-connector
  call.
depends_on:
- task/openapi-document-operations-read/shared-openapi-document-parse-step
rationale: Separated from the HTTP surface because the reading and its refusals answer
  to the document, while the route, its request validation and its wiring answer to
  how the operation is published — two reasons to change across one seam. Kept as
  one task rather than split between listing and refusals because the refusals are
  what this one read does when the document cannot be read, not a second outcome.
implements:
- domain/integration/openapi-operation
- domain/integration/openapi-document-operations
- contracts/integration/openapi-document-operations
- rules/integration/an-openapi-operations-method-is-upper-cased
- rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read
- rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read
- scenarios/integration/a-swagger-2-document-refuses-the-operations-read
- constraints/the-openapi-document-is-fetched-by-the-backend
sources:
- work/connector-configuration-helper-operation-listing-backend/intake/scope.md
---

## What it is
The domain reading behind read-openapi-document-operations.
It fetches the operator-named link server-side, parses it, and turns the document's declared path-item operations into path and upper-cased method pairs.
It refuses at the fetch stage and at the parse stage the same way the draft operation already refuses at those stages.

## Notes
The specification's decision log already records that this read is deliberately not paginated under constraints/listings-are-paged, the operation set being bounded by one freshly fetched document.
Decision, beyond the covers — stand: constraints/listings-are-paged pages a persisted, caller-independent collection; a document's operation set is bounded by, and fetched fresh from, one operator-supplied link, the same bounded shape domain/integration/connector-configuration-draft's own unresolved and generated_credentials attributes already take unpaged — this read is not a list operation that constraint reaches, and the specification's own decision log already records the reasoning at its point of decision.
The inventory warns that reusing the fetcher incorrectly would silently drop the sixty-second timeout, which is why the timeout is a criterion on this task rather than an assumption.
UNDERDETERMINED, from the specification — rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read refuses any declared version outside OpenAPI 3.x, not only Swagger 2.0, and no criterion reaches a document declaring, say, openapi 4.0.0 or swagger 1.2. Implementation should refuse every out-of-range version, not only the 2.0 case the criteria spell out.
UNDERDETERMINED, from the specification — the same rule also refuses a document that parses and declares OpenAPI 3.x but is not otherwise well-formed (for example, a paths member that is not an object); no criterion reaches that clause beyond the version check.
UNDERDETERMINED, from the specification — rules/integration/an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document requires the fetch-failure and unreadable-document refusals to be distinguishable from each other and never answered as an unnamed refusal; no criterion here holds the reading to raising two distinguishable error values (OpenApiDocumentNotFetchedError and OpenApiDocumentNotReadableError) rather than one undifferentiated refusal — that rule was left out of this task's implements as an HTTP-surface statement, but the reading is what must actually raise the two distinguishable values for the HTTP task to map.
ADVISORY, from the specification — the four draft-only candidates (rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft, rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document, rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-draft, scenarios/integration/a-swagger-2-document-refuses-the-draft) govern draft-connector-configuration-from-openapi, not this reading, and are excluded from implements; constraints/a-malformed-request-is-refused-with-a-validation-error and constraints/a-domain-error-unmapped-by-status-is-refused-generically are system-wide route shapes belonging to task/openapi-document-operations-read/read-operations-http-operation.
