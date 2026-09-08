---
type: invariant
statement: A request to draft a connector configuration whose named OpenAPI document link cannot be fetched — a network failure, a timeout, or a response outside the 2xx range — is refused before any parsing is attempted, naming the fetch failure; the fetch is abandoned as a timeout where the named link has not answered within 60000 milliseconds of that fetch beginning; no draft is generated from a document that was never received.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

Fetching and parsing are two different acts that fail for two different reasons: a link nothing answered, or answered wrong, has no content yet to hold a parse failure against. Naming the fetch failure on its own account, rather than folding it into whatever a parser would say about an empty response, is what lets an operator tell a document that does not exist from one that is malformed.
The timeout is the same sixty seconds a-capability-declares-its-contract already gives an outward call whose own budget nobody declared: the far end publishing the document is outside the system in exactly that sense, and one figure for that wait is what keeps a slow document distinguishable from an absent one rather than from a second, unrelated bound.
