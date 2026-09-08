---
type: invariant
statement: >-
  A request to draft a connector configuration refused because its named OpenAPI document link
  could not be fetched is answered with an HTTP 422 response reporting an
  OpenApiDocumentNotFetchedError, whose details carry the link the request named, exactly as it
  named it, together with which of the three fetch failures occurred as one of network-failure,
  timeout or status-outside-2xx — that last carrying with it the status code the link answered —
  and carry nothing else of that fetch: no underlying network or client error's own message, and
  no part of whatever the link answered with. A request refused because the fetched document does
  not parse as a well-formed OpenAPI document or does not declare OpenAPI 3.x is answered with an
  HTTP 422 response reporting an OpenApiDocumentNotReadableError. Both answer under the same
  status and never under the same error value, and neither is ever reported as the other or as a
  refusal carrying no named condition.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

The two refusals themselves are already stated: `an-unfetchable-openapi-link-refuses-the-draft` refuses a link nothing answered, or answered outside the 2xx range, before any parsing is attempted, and `a-malformed-or-unsupported-openapi-document-refuses-the-draft` refuses a fetched document that does not parse or declares a version other than OpenAPI 3.x. What the HTTP surface answers for each was stated by neither. Because `constraints/the-openapi-document-is-fetched-by-the-backend` puts the fetch inside the backend operation, both refusals are that operation's own answer to its caller and each has a status and an error value; this states them, once, for both.

One fact, decided once and in one house. Which status and which error value each refusal answers under, and whether the two differ, is a single comparative question: answered half in each of the two rules, the comparative half gets two answers, which is exactly what `a-submitted-registration-states-its-outcome-to-the-operator` refuses by deciding one fact once for both registries rather than twice. The two rules keep stating what is refused and why; this states what the surface answers.

HTTP 422 for both, because it is this specification's established answer for a well-formed request whose named content the domain refuses — `ConnectorConfigurationNotWellFormedError`, `IncompleteConnectorConfigurationError`, `CapabilitySchemaNotWellFormedError` and `ConnectorPlaceholderOutsideInputSchemaError` all answer it. Both refusals are that case: the request is well formed, and what it names — a link, or the document that link answered — cannot be drafted from. HTTP 500 is reserved here for a server-side condition the requester neither caused nor can correct by changing the request, and a link the request itself named is corrected by naming another, so neither refusal is that. A gateway or unavailable status would additionally assert an upstream fault, or a transience worth retrying, that no node holds: the one place this specification tells a caller when to come back is the capability-identity read's own rate limit.

Two error values, because telling a document that was never received from one that cannot be read is the whole reason the two refusals are two rules. A single shared value would leave the operator where `constraints/a-domain-error-unmapped-by-status-is-refused-generically` leaves a caller — knowing only that something failed — and would make the surface distinction `a-submitted-registration-states-its-outcome-to-the-operator` requires for a refusal impossible to draw. The parse failure and the unsupported version share one value because one rule states them as one refusal for one reason: nothing partial is worth drafting from text the reader cannot take as OpenAPI 3.x. Both names follow this specification's subject-plus-condition convention (`ConnectorConfigurationNotFoundError`, `CapabilityNotReadOnlyError`): not fetched, and not readable — the second spanning both a document nobody can parse and a 2.0 document handed to a 3.x-only reader, where `NotWellFormed`, already this specification's word for a pure parse-shape refusal, would understate the version half.

The fetch refusal reports the link and the failure to its caller because the refusal is otherwise unactionable: the operator's next act is either to name a different link or to go and fix the far end publishing the document, and which of the three failures happened is the whole of what tells those two apart — a link nothing answered, a link too slow to keep waiting for (`an-unfetchable-openapi-link-refuses-the-draft`'s sixty seconds), and a link that answered with a status. Held only server-side, that distinction would exist in a log the operator authoring the configuration cannot read. The link is echoed because it is the request's own input handed straight back, disclosing nothing the caller did not itself send, and the answered status is the far end's own public answer to a request the operator named, so neither field says anything about this system.

The details stop there. `constraints/a-domain-error-unmapped-by-status-is-refused-generically` keeps an unanticipated error's own message and carried context server-side because they may describe internal state; this refusal is anticipated and named, but the underlying network or client error's own message is that same kind of text and is held to that same treatment, and the body an unsuccessful status arrived with is content this operation never read as a document and would be handing back unexamined. Three named failures and, for one of them, a status code, is the whole of what distinguishes the three causes, which is the whole job a detail has here — the reading `an-unreachable-connector-ends-unavailable` already takes when its detail names the connector and no part of the call.
