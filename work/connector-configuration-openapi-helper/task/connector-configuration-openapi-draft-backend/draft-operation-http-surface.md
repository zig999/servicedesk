---
title: Publish draft-connector-configuration-from-openapi
summary: The route, controller, validation envelope and factory wiring that expose the draft generation as the contract's one operation, answering the draft or the refusal that was raised.
rationale: The scope states the published contract without saying that the surface is separate work; it is its own task because the route and the generation are two sides of one seam, and a task changing an interface and its consumers in one breath is two tasks.
sources:
  - intake/scope.md
depends_on:
  - task/connector-configuration-openapi-draft-backend/draft-generation-service
objective: A request to the published operation naming a connector, an OpenAPI document link and one operation of it answers with the generated draft under HTTP 200, and each stated refusal answers as its own named refusal.
criteria:
  - The operation is registered in the built application and a request reaching it is dispatched through the composed dependencies rather than constructing its own.
  - A request whose body fails the route's declared shape is refused HTTP 400 with error code VALIDATION_ERROR, a message naming which of path, query or body failed, and a non-empty details list.
  - A request naming an unfetchable document link is answered HTTP 422 reporting OpenApiDocumentNotFetchedError, whose details name the link exactly as named and which of network-failure, timeout or status-outside-2xx occurred, carrying the answered status where it named status-outside-2xx, and nothing else of the fetch.
  - A request naming a document that does not parse or does not declare OpenAPI 3.x is answered HTTP 422 reporting OpenApiDocumentNotReadableError, naming what failed to parse or which version was declared.
  - A request naming a path and method the document declares no operation for is answered HTTP 422 reporting OpenApiOperationNotFoundError, naming that path and method.
  - None of the three draft refusals is ever answered as HTTP 500 with code INTERNAL_ERROR.
  - A successful request answers HTTP 200, never 201, 202 or 204, with the draft's connector, its configuration, its unresolved list (present as an empty list where nothing is unresolved) with each item's name and reason, its generated credentials (present as an empty list where none were generated) each paired with the security scheme's own name, and its method mismatch where one stands, and no other field.
  - The response never carries a credential value.
  - The response never carries any capability's name, version or count, whatever is registered naming the draft's connector.
implements:
  - contracts/integration/connector-configuration-draft
  - constraints/a-malformed-request-is-refused-with-a-validation-error
  - constraints/the-domain-depends-on-no-infrastructure
  - constraints/the-openapi-document-is-fetched-by-the-backend
  - domain/integration/connector-configuration-draft
  - domain/integration/connector-configuration-draft-unresolved-item
  - domain/integration/connector-configuration-draft-generated-credential
  - domain/integration/connector-configuration-draft-method-mismatch
  - rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  - rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-draft
  - rules/integration/a-drafted-connector-configuration-is-answered-as-a-read
  - rules/integration/a-connector-configuration-draft-response-carries-no-capability
---

## What it is

The published entrance to the draft, and the three refusals an operator meets there.
It answers a draft and stops: nothing it returns is registered, and no investigation reads it.

## Notes

The tree's own shape for an operation is a thin controller over an injected dependencies object plus a sibling .routes.ts plugin doing zod safeParse with the uniform VALIDATION_ERROR envelope, composed once in build-app.factory.ts.
Criteria 6 and 7's HTTP statuses (200 for success, never 201/202/204) are now decided facts (rules/integration/a-drafted-connector-configuration-is-answered-as-a-read), not a borrowed convention -- this is the one operation in this specification whose success status is a stated fact rather than left to REST convention, because the conventional 201 would assert a creation a-connector-configuration-draft-registers-nothing denies.
REMAINDER, from the specification — constraints/the-openapi-document-is-fetched-by-the-backend's no-frontend-fetch clause is decided by a dependency and network-call audit over the frontend module, which nothing here performs; this task answers only that the fetch runs inside the published operation.
REMAINDER, from the specification — every rule governing how a draft is generated rather than published (placement, method, subject/credential resolution, method comparison, registers-nothing, the two document-side refusal rules' own parse/version/timeout/no-such-operation conditions) reaches no criterion of this task. Belongs to the draft-generation, document-fetch and document-reading tasks of this same epic.
UNDERDETERMINED, from the specification — criterion 7 enumerates the five fields the successful answer carries but does not close the field set to exactly those five (a-connector-configuration-draft-response-carries-no-capability states "and no other field"); criteria 8 and 9 close only the credential-value and capability leaks specifically. Implementation: the response body must serialize exactly connector, configuration, unresolved, generated_credentials and method_mismatch (the last only where present) and no other key.
UNDERDETERMINED, from the specification — criterion 3 as composed asks for the fetch-failure details in full (link, one of the three named kinds, the status where applicable, nothing else of the fetch); an implementation carrying a free-text description, the underlying client error's own message, or the unsuccessful response's body would satisfy a narrower reading. Implementation: the OpenApiDocumentNotFetchedError's details object holds exactly `link`, `kind` (one of network-failure | timeout | status-outside-2xx) and `status` (present only when kind is status-outside-2xx) — no other key.
ADVISORY, from the specification — constraints/a-domain-error-unmapped-by-status-is-refused-generically (the HTTP 500/INTERNAL_ERROR fallback criterion 6 refuses) sits outside this epic's covers; criterion 6 is demonstrable from the candidates as they stand since both claimed refusal rules already state 422 for all three conditions.
Decision, beyond the covers — stand: constraints/a-domain-error-unmapped-by-status-is-refused-generically is named only descriptively, as the pre-existing generic-refusal constraint this criterion's negative is read against; no criterion claims to implement that constraint itself.
ADVISORY, from the specification — domain/integration/connector-configuration-draft-unresolved-reason (the closed four-value vocabulary criterion 7's "reason" passes through) and domain/integration/capability (whose name/version criterion 9 forbids) are read as owned by the draft-generation task, not this one.
