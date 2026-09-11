---
title: Accept GET for read-openapi-document-operations
summary: The HTTP route accepts a GET request naming the document link as a query parameter, matching
  what the frontend sends, instead of only POST.
objective: A GET request naming an OpenAPI document link as a query parameter reaches and answers the
  read-openapi-document-operations operation instead of a 404.
criteria:
- A GET request to /v1/read-openapi-document-operations naming a fetchable, well-formed OpenAPI 3.x document
  link as the link query parameter answers HTTP 200 with that document's operations.
- A GET request naming the same route no longer answers HTTP 404 for want of a registered handler.
- A GET request naming an unfetchable link as the link query parameter is refused exactly as an-unfetchable-openapi-link-refuses-the-operations-read
  already states.
- A GET request naming a malformed or unsupported document's link as the link query parameter is refused
  exactly as a-malformed-or-unsupported-openapi-document-refuses-the-operations-read already states.
- A GET request naming no link query parameter at all is refused as a malformed request.
sources:
- intake/get-vs-post-mismatch.md
implements:
- constraints/a-malformed-request-is-refused-with-a-validation-error
- contracts/integration/openapi-document-operations
- domain/integration/openapi-document-operations
---

## What it is

Fixes the transport mismatch alone: the route now accepts GET with the link as a query parameter, and its refusal behavior over an unfetchable link or an unreadable document is unchanged from the already-delivered handler.

## Notes

UNDERDETERMINED, from the specification — criterion 5 says only "refused as a malformed request", while constraints/a-malformed-request-is-refused-with-a-validation-error states the refusal's whole shape: HTTP 400, error code VALIDATION_ERROR, a message naming which of path, query or body failed, and a non-empty details list of the issues found. As written the criterion admits a refusal the constraint forbids. Implementation should answer the query-parameter absence with that whole shape, naming the query as what failed.
UNDERDETERMINED, from the specification — criterion 1 says the answer carries "that document's operations" without saying they are answered whole. domain/integration/openapi-document-operations states every operation the fetched document declares is answered whole rather than as a paged listing. Implementation should answer every operation the document declares, never a page of them.
ADVISORY, from the specification — criteria 3 and 4 require the GET request's refusals to behave exactly as rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read and rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read already state; neither rule is a candidate of this epic. This task changes only the transport (GET plus query parameter instead of POST plus body) and carries no new implementation of those two rules' own refusal logic, which the already-delivered handler this task edits already implements.
Decision, beyond the covers — stand: rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read and rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read are named only to say the transport change leaves their own refusal logic untouched, not to claim any part of them here; that logic is already-delivered work this task does not touch, and no task of this epic implements either rule.
REMAINDER, from the specification — constraints/a-malformed-request-is-refused-with-a-validation-error also states a refusal over a request whose path or body fails the route's declared shape; this route carries no path segment beyond its fixed name and no request body once the link moves to the query string, so only the query clause reaches a criterion here. Belongs to: the tasks implementing routes that do declare path segments or request bodies — the constraint is system-scoped and stated once for the whole surface.
