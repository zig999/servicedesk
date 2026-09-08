---
title: Fetch the named OpenAPI document, or refuse before parsing
summary: A backend-issued, timeout-bounded fetch of the operator-named document link, refusing the draft on a network failure, a timeout or a non-2xx answer, naming the fetch failure and attempting no parse.
rationale: The scope names fetch refusal and parse refusal as two separate concerns and the rule itself separates them; I cut them as two tasks because the fetch is a seam with its own port and its own failure vocabulary, and a parser that also owns retrieval would change for either reason.
sources:
  - intake/scope.md
objective: A draft request whose named OpenAPI document link cannot be fetched is refused with an error naming the fetch failure, with no parse of any response attempted.
criteria:
  - A link answering HTTP 404 refuses the request with an error naming the fetch failure.
  - A link answering any status outside the 2xx range refuses the request with that same fetch-failure error.
  - A network failure reaching the link refuses the request with the fetch-failure error.
  - A link that has not answered within 60000 milliseconds of the fetch beginning refuses the request with the fetch-failure error, the fetch abandoned as a timeout.
  - No parse of a response body is attempted on any of those four refusals.
  - The fetch-failure error's details carry the link exactly as named and which of network-failure, timeout or status-outside-2xx occurred, the last carrying the status code answered, and nothing else of the fetch.
  - A link answering a 2xx response yields that response's body text to its caller unparsed.
  - The document fetch is issued only inside the backend, and no frontend module requests an OpenAPI document's own URL.
  - The refusal is answered as an HTTP 422 response reporting an OpenApiDocumentNotFetchedError.
implements:
  - rules/integration/an-unfetchable-openapi-link-refuses-the-draft
  - rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  - scenarios/integration/an-unreachable-openapi-link-refuses-the-draft
  - constraints/the-openapi-document-is-fetched-by-the-backend
---

## What it is

One dependency-injected retrieval of the document text, behind its own port, and the one refusal that belongs to retrieval alone.
It hands back text and never a parsed document, so the refusal it owns can never be confused with a parser's.

## Notes

The tree already issues every outbound call through native global fetch injected as an httpClient dependency; this fetch follows that and introduces no HTTP library.
The existing timeout-bounded issuer at src/src/http-connector/connector-http-issuer.ts serves a connector call with a capability's own budget, so this fetch carries its own deadline rather than borrowing that one.
REMAINDER, from the specification — the never-interchanged half of the two document-side error values only becomes observable once the unreadable-document refusal also exists; belongs to the task implementing rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft.
ADVISORY, from the specification — this task's status-and-error-value criterion is only observable once the published route (contracts/integration/connector-configuration-draft) exists; neither that contract nor domain/integration/connector-configuration-draft is named in this task's implements.
ADVISORY, from the specification — constraints/the-domain-depends-on-no-infrastructure is a candidate but bounds an enumerated domain layer; the fetch this task writes is infrastructure held to constraints/the-openapi-document-is-fetched-by-the-backend instead, so it is not named here.
