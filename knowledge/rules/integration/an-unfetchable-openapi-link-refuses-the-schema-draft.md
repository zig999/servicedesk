---
type: invariant
statement: A request to draft a capability schema whose named OpenAPI document link cannot be fetched -- a network failure, a timeout, or a response outside the 2xx range -- is refused before any parsing is attempted, answered with an HTTP 422 response reporting an OpenApiDocumentNotFetchedError, naming the fetch failure exactly as an-unfetchable-openapi-link-refuses-the-draft already names it for the sibling operation; the fetch is abandoned as a timeout where the named link has not answered within 60000 milliseconds of that fetch beginning; no draft is generated from a document that was never received.
constrains:
- domain/integration/capability-schema-draft
---

## Description

Reuses the same error value, the same HTTP status and the same sixty-second bound an-unfetchable-openapi-link-refuses-the-draft already fixes for the sibling connector configuration draft, and the same reasoning: a link nothing answered, or answered wrong, has no content yet to hold a parse failure against, and OpenApiDocumentNotFetchedError already names exactly that condition without naming which operation met it.
One vocabulary for one condition, decided once, is the same discipline a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document and an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document already hold between the draft and the operations-read: minting a second name for the same fact would give this specification two vocabularies for one condition.
