---
type: invariant
statement: >-
  A request to read an OpenAPI document's operations refused because its named document link
  could not be fetched is answered with an HTTP 422 response reporting an
  OpenApiDocumentNotFetchedError, and a request refused because the fetched document does not
  parse as a well-formed OpenAPI document or does not declare OpenAPI 3.x is answered with an
  HTTP 422 response reporting an OpenApiDocumentNotReadableError instead — the same two error
  values the draft operation's own refusals report, neither of the two ever answered as the
  other and neither ever answered as a refusal carrying no named condition.
constrains:
  - domain/integration/openapi-document-operations
---

## Description

The two refusals themselves are already stated: `an-unfetchable-openapi-link-refuses-the-operations-read` refuses a link nothing answered, or answered outside the 2xx range, before any parsing is attempted, and `a-malformed-or-unsupported-openapi-document-refuses-the-operations-read` refuses a fetched document that does not parse or declares a version other than OpenAPI 3.x. What the HTTP surface answers for each was stated by neither. Because `constraints/the-openapi-document-is-fetched-by-the-backend` puts this read's fetch inside the backend operation exactly as it puts the draft's, both refusals are `read-openapi-document-operations`' own answer to its caller and each has a status and an error value; this states them, once, for both.

HTTP 422 for both, for the reason `a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document` already gives the sibling draft refusals: 422 is this specification's established answer for a well-formed request whose named content the domain refuses — `ConnectorConfigurationNotWellFormedError`, `IncompleteConnectorConfigurationError`, `CapabilitySchemaNotWellFormedError`, `ConnectorPlaceholderOutsideInputSchemaError` and `OpenApiOperationNotFoundError` all answer it — and both refusals here are that case: the request is well formed, and what it names, a link or the document that link answered, cannot be read for its operations. HTTP 500 is reserved for a server-side condition the requester neither caused nor can correct by changing the request, and a link the request itself named is corrected by naming another. A gateway or unavailable status would additionally assert an upstream fault, or a transience worth retrying, that no node holds.

Two error values, and the same two the draft operation reports. The two conditions are the same two conditions, held against the same fetched document, by the two rules that mirror the draft's own: `an-unfetchable-openapi-link-refuses-the-operations-read` and `a-malformed-or-unsupported-openapi-document-refuses-the-operations-read` each state their refusal as the draft rule's refusal for the draft rule's reason, at the same fetch and parse stages, before any path or method is chosen. The error value names its subject and its condition — an OpenAPI document not fetched, an OpenAPI document not readable — and neither name mentions the draft, so the subject a value names is the same subject whichever operation met it. Minting a second pair of names for one pair of conditions would give one specification two vocabularies for one distinction, which is what `a-submitted-registration-states-its-outcome-to-the-operator` refuses by deciding one fact once rather than once per caller; and a single shared value across the two conditions would leave the operator where `constraints/a-domain-error-unmapped-by-status-is-refused-generically` leaves a caller, knowing only that something failed, which is the whole reason the two refusals are two rules.

The two are never answered as one another and never as a refusal carrying no named condition, the reading `a-draft-fetch-and-readability-refusals-never-read-alike` takes for the draft: telling a document that was never received from one that cannot be read is what the distinction is for, and an operator who receives either answer under the other is sent to correct an input that was never at fault.
