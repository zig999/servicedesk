---
title: OpenAPI document operations read (backend)
summary: The backend operation that fetches an operator-named OpenAPI document and
  answers every operation it declares, built on the fetch and parse machinery the
  draft operation already holds.
covers:
- domain/integration/openapi-operation
- domain/integration/openapi-document-operations
- contracts/integration/openapi-document-operations
- rules/integration/an-openapi-operations-method-is-upper-cased
- rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read
- rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read
- scenarios/integration/a-swagger-2-document-refuses-the-operations-read
- constraints/the-openapi-document-is-fetched-by-the-backend
- constraints/a-malformed-request-is-refused-with-a-validation-error
- constraints/a-domain-error-unmapped-by-status-is-refused-generically
- rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
- rules/integration/an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
- rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft
- scenarios/integration/a-swagger-2-document-refuses-the-draft
- rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-draft
- rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing
- scenarios/integration/an-operation-is-chosen-from-the-fetched-documents-listing
- rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper
- domain/integration/connector-configuration
- domain/integration/connector-configuration-draft
- contracts/integration/connector-configuration-draft
- rules/integration/a-connector-configuration-draft-states-the-chosen-operations-method
- rules/integration/an-unfetchable-openapi-link-refuses-the-draft
- scenarios/integration/an-unreachable-openapi-link-refuses-the-draft
uncovered:
- node: rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing
  why: The backend half of this rule is the listing itself, which domain/integration/openapi-document-operations
    and contracts/integration/openapi-document-operations already carry here; the
    operator choosing an entry and the helper carrying that entry's path and method
    into the draft request are the authoring surface's, and the scope is backend-only.
- node: scenarios/integration/an-operation-is-chosen-from-the-fetched-documents-listing
  why: Its then-clauses are assertions about the draft request the Configuration Helper
    issues after a choice, which no backend module makes.
- node: rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper
  why: Offering the helper beneath the Configuration field is a fact about the authoring
    surface, and the scope is backend-only.
- node: domain/integration/connector-configuration
  why: Nothing in this plan changes what a connector configuration holds or how it
    is registered.
- node: domain/integration/connector-configuration-draft
  why: The draft's attributes stand as delivered; this plan adds a read beside the
    draft operation and changes nothing the draft answers.
- node: contracts/integration/connector-configuration-draft
  why: The draft operation's own published surface is untouched; the new read is a
    separate contract with a separate operation.
- node: rules/integration/a-connector-configuration-draft-states-the-chosen-operations-method
  why: Already delivered in the draft generation, and the listing's upper-casing is
    its own rule, an-openapi-operations-method-is-upper-cased.
- node: rules/integration/an-unfetchable-openapi-link-refuses-the-draft
  why: Already delivered behind IOpenApiDocumentFetcher, which this plan reuses without
    altering the fetcher or its refusal.
- node: scenarios/integration/an-unreachable-openapi-link-refuses-the-draft
  why: It exercises the draft operation's fetch stage, which no task here touches.
rationale: 'One epic rather than several: the scope names one published operation,
  and the parse extraction, the reading and the HTTP surface are three deliveries
  of that one operation rather than three separable bodies of work. The draft-side
  parse and operation-lookup nodes are claimed rather than left out because the extraction
  moves the code that carries them, so this epic owes an account of them; the draft-side
  fetch nodes are declared uncovered because the fetcher is reused untouched.'
sources:
- work/connector-configuration-helper-operation-listing-backend/intake/scope.md
---

## What it is
The backend work behind the Configuration Helper's operation listing.
It fetches an operator-named OpenAPI document server-side and answers every operation the document declares as a path and an upper-cased method.
It reuses the fetch, parse and version-refusal machinery the draft-connector-configuration-from-openapi operation already stands on rather than building a second one.

## Notes
The surveyor's inventory records the parse and version-refusal step as entangled with the single-operation lookup inside openapi-operation-reader.ts, which is why this epic opens with an extraction rather than a new reader.
The draft operation's own behaviour is claimed here only as behaviour that must survive the extraction, never as behaviour being built again.
