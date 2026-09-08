---
type: invariant
statement: A request to draft a connector configuration whose named OpenAPI document link cannot be fetched — a network failure, a timeout, or a response outside the 2xx range — is refused before any parsing is attempted, naming the fetch failure; no draft is generated from a document that was never received.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

Fetching and parsing are two different acts that fail for two different reasons: a link nothing answered, or answered wrong, has no content yet to hold a parse failure against. Naming the fetch failure on its own account, rather than folding it into whatever a parser would say about an empty response, is what lets an operator tell a document that does not exist from one that is malformed.
