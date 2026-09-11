---
type: invariant
statement: A request to read an OpenAPI document's operations whose named document link cannot be fetched — a network failure, a timeout, or a response outside the 2xx range — is refused before any parsing is attempted, naming the fetch failure; the fetch is abandoned as a timeout where the named link has not answered within 60000 milliseconds of that fetch beginning; no operations are read from a document that was never received.
constrains:
  - domain/integration/openapi-document-operations
---

## Description

an-unfetchable-openapi-link-refuses-the-draft gives the draft operation this same refusal for the same reason: a link nothing answered, or answered wrong, has no content yet to hold a parse failure against, and the sixty-second timeout is the one figure that keeps a slow document distinguishable from an absent one. The Configuration Helper's read of a document's operations fetches the same link before any path or method is chosen, so it fails the same way at the same fetch stage.
