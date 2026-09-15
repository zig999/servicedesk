---
title: Refuse a schema draft request under HTTP 422 with each condition's own error value
summary: Refuse an unfetchable link, an unreadable or unsupported document, and a document declaring no such operation, each under HTTP 422 with its own named error value and with no draft beside it.
sources:
- intake/scope.md
objective: A draft request whose named link cannot be fetched, whose fetched document cannot be read as OpenAPI 3.x, or whose document declares no operation at the named path and method is refused with HTTP 422 reporting that condition's own error value, with no draft standing beside the refusal.
depends_on:
- task/capability-schema-draft-operation/draft-capability-schema-from-openapi-endpoint
criteria:
- a network failure reaching the named link is answered with HTTP 422 reporting an OpenApiDocumentNotFetchedError.
- a response outside the 2xx range from the named link is answered with HTTP 422 reporting an OpenApiDocumentNotFetchedError.
- the fetch is abandoned as a timeout where the named link has not answered within 60000 milliseconds of that fetch beginning, and that abandonment is answered with HTTP 422 reporting an OpenApiDocumentNotFetchedError.
- no parsing is attempted on a link that could not be fetched.
- a fetched document that does not parse in either of the two serializations OpenAPI 3.x defines is answered with HTTP 422 reporting an OpenApiDocumentNotReadableError.
- a fetched document whose declared version is not OpenAPI 3.x is answered with HTTP 422 reporting an OpenApiDocumentNotReadableError.
- a fetched document declaring no version at all is answered with HTTP 422 reporting an OpenApiDocumentNotReadableError.
- a fetched document that parses and declares OpenAPI 3.x but declares no operation at the path and method the request names is answered with HTTP 422 reporting an OpenApiOperationNotFoundError.
- that OpenApiOperationNotFoundError names the path and the method the request named.
- the fetch refusal and the readability refusal are answered under the same HTTP status.
- the fetch refusal and the readability refusal never report one and the same error value.
- neither the fetch refusal nor the readability refusal is ever reported as the other.
- neither the fetch refusal nor the readability refusal is ever answered as a refusal carrying no named condition.
- the OpenApiDocumentNotFetchedError refusal discloses, beside that error value, which of the three fetch failures occurred, and, where it named status-outside-2xx, the status the link answered, together with the link the request named, exactly as it named it.
- the OpenApiDocumentNotReadableError refusal discloses, beside that error value, the link the request named, exactly as it named it.
- no refusal answer carries an input_schema.
- no refusal answer carries an output_schema.
- no refusal answer carries an unresolved item.
- an error the status map does not name is answered with HTTP 500 whose error code is INTERNAL_ERROR and whose message is the fixed text "an unexpected error occurred", disclosing neither that error's own message nor any context it carries.
implements:
- contracts/integration/capability-schema-draft
- domain/integration/capability-schema-draft
- rules/integration/an-unfetchable-openapi-link-refuses-the-schema-draft
- rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-schema-draft
- rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-schema-draft
- rules/integration/a-schema-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
- constraints/a-domain-error-unmapped-by-status-is-refused-generically
- constraints/the-openapi-document-is-fetched-by-the-backend
---

## What it is

The three refusal conditions of draft-capability-schema-from-openapi, each answered under HTTP 422 with its own error value and its own disclosed detail, and the generic fallback for an error the status map does not name.
It reuses the error values the sibling operations already carry for these same three conditions.

## Notes

One vocabulary for one condition means no new error value is minted for a fact an existing one already names.
The three refusals are one task because they are one act -- the reading of the named document toward the named operation -- failing in three ways the answer must keep apart.
UNDERDETERMINED, from the specification -- The two disclosure criteria state only what each refusal must carry; no criterion states what it must not carry, though the governing rule closes both disclosures with "and nothing else of that fetch" / "and nothing else of the document".
UNDERDETERMINED, from the specification -- constraints/a-malformed-request-is-refused-with-a-validation-error is a candidate no criterion of this task reaches; the route's own request-shape refusal is the sibling endpoint task's own.
REMAINDER, from the specification -- constraints/the-openapi-document-is-fetched-by-the-backend's own "no frontend module issues that fetch directly" clause, and its own coverage of the connector configuration draft's and the operations-listing's fetches, reach no criterion of this backend task.
REMAINDER, from the specification -- a-generated-schema-draft-answers-under-http-200 and a-capability-schema-draft-registers-nothing are candidates conditioned on the operation answering with a generated draft; no criterion of this refusal-only task reaches either.
