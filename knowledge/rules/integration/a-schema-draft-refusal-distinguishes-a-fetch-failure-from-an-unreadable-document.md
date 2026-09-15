---
type: invariant
statement: >-
  an-unfetchable-openapi-link-refuses-the-schema-draft and
  a-malformed-or-unsupported-openapi-document-refuses-the-schema-draft answer under the same
  HTTP status and never under the same error value, and neither is ever reported as the other
  or as a refusal carrying no named condition; the refusal reporting
  OpenApiDocumentNotFetchedError discloses to its caller, beside that error value, which of
  the three fetch failures occurred as one of network-failure, timeout or status-outside-2xx
  -- that last carrying with it the status code the link answered -- together with the link
  the request named, exactly as it named it, and nothing else of that fetch, while the refusal
  reporting OpenApiDocumentNotReadableError discloses, beside that error value, the link the
  request named, exactly as it named it, and nothing else of the document.
constrains:
- domain/integration/capability-schema-draft
---

## Description

The same distinction a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document already draws between the sibling connector configuration draft's own two refusals, read here over the capability schema draft's own: telling a document that was never received from one that cannot be read is the whole reason the two refusals are two rules rather than one.

What each refusal hands its caller beside the error value is the other half of that same distinction, and it belongs where the status and the error value already are: answered half in an-unfetchable-openapi-link-refuses-the-schema-draft and half in a-malformed-or-unsupported-openapi-document-refuses-the-schema-draft, the comparative half gets two answers.

The fetch refusal reports the failure and the link because it is otherwise unactionable: the operator's next act is either to name a different link or to go and fix the far end publishing the document, and which of the three failures occurred -- a link nothing answered, a link that did not answer inside the sixty seconds an-unfetchable-openapi-link-refuses-the-schema-draft allows it, a link that answered with a status -- is the whole of what tells those two apart. Held only server-side, that distinction would exist in a log the operator authoring the capability cannot read. The link is echoed because it is the request's own input handed straight back, disclosing nothing the caller did not itself send, and the answered status is the far end's own public answer to a request the operator named, so neither field says anything about this system.

The details stop there, on both refusals. constraints/a-domain-error-unmapped-by-status-is-refused-generically keeps an error's own message and carried context server-side because they may describe internal state; the underlying network or client error's own message, the body an unsuccessful status arrived with, and a parse failure's own message over text this operation could not read as an OpenAPI 3.x document are all that same kind of text, and none of them separates a cause the operator would correct differently. A document that answered but cannot be read is corrected at the document the link names, which is the whole of what that refusal's caller has to act on -- the restraint an-unreachable-connector-ends-unavailable already takes when its detail names the connector and no part of the call.
