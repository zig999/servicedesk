---
title: Serve a draft's own declared attributes over HTTP
summary: An HTTP route, separate from read-case, that answers the draft's own-record
  read.
rationale: Cut apart from the read operation because the route's path, its
  request-shape refusals and its response DTO change for HTTP reasons, not for reasons
  of what the read answers; a separate route is decided on because read-case's own
  route must keep answering 409 over the same draft.
sources:
  - work/case-version-editable-when-invalid/intake/scope.md
objective: A curator's client obtains a draft's own declared attributes over HTTP on a
  reading where read-case refuses that draft.
criteria:
  - A request to the route over a draft whose manifest holds no entry is answered HTTP
    200.
  - The 200 body carries the declared attributes exactly as the draft's own-record read
    answered them.
  - Where the draft declares no consolidation_register, the 200 body carries no
    consolidation_register value.
  - The 200 body carries no manifest entry.
  - A request naming a slug and version that no case version answers is answered HTTP
    404 reporting a CaseNotFoundError whose details carry that slug and version.
  - A request whose version path segment is not an integer is answered HTTP 400 with
    code VALIDATION_ERROR and a message naming the path.
depends_on:
  - task/draft-correction-while-invalid/read-a-drafts-own-declared-attributes
implements:
  - contracts/knowledge/case-query
  - constraints/a-successful-case-version-own-record-read-answers-with-http-200
  - constraints/a-malformed-request-is-refused-with-a-validation-error
  - rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
  - rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case
  - domain/knowledge/case-version
---

## What it is

This is the HTTP route that exposes the draft's own-record read to the editing surface.

## Notes

The route path and the DTO field layout are left to implementation, as the scope allows.
read-case's own route over the same draft still answers HTTP 409 CaseVersionNotValidError, and nothing here changes it.
UNDERDETERMINED, from the specification — criterion 2 does not name the five attributes contracts/knowledge/case-query says read-case-version answers, pointing instead to whatever the own-record read returns. Passes despite: a route whose read returns only some of the five, with the 200 body matching exactly what that read answered.
UNDERDETERMINED, from the specification — no criterion covers a draft whose own declared attributes are themselves the failing validator rule, which rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case extends the 200 answer to. Passes despite: a route that refuses with 409 when the subject or fallback is the failing attribute, and answers 200 only when the manifest-emptiness rule is the one failing.
UNDERDETERMINED, from the specification — constraints/a-successful-case-version-own-record-read-answers-with-http-200's fitness also calls read-case-version over a version that reads back as a case, and nothing tests that or a released version. Passes despite: a route that answers a validating or released version with something other than 200, such as a 404 or read-case's own body.
UNDERDETERMINED, from the specification — constraints/a-malformed-request-is-refused-with-a-validation-error requires the 400's details to list the issues found, and criterion 6 does not test the details. Passes despite: a route that refuses a non-integer version segment with 400, code VALIDATION_ERROR and a message naming the path, but with an empty or missing details list.
REMAINDER, from the specification — the lifecycle-operation and slug-only-read clauses of rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused, and the query/body clauses of constraints/a-malformed-request-is-refused-with-a-validation-error, reach no criterion here, this route taking only path segments and being a read naming both a slug and a version. Belongs to: the routes for read-case and the listings keyed by slug alone, the case-lifecycle operation routes, and every other route that declares a query or body shape.
REMAINDER, from the specification — the editing-surface rule's presenting and update-draft-accepting clauses reach no criterion here; this task answers only the read that supplies the surface. Belongs to: the frontend task for the draft editing surface, and the update-draft act's task.
ADVISORY, from the specification — rules/knowledge/an-accepted-update-draft-answers-its-versions-own-stored-declared-attributes and scenarios/knowledge/a-case-with-no-hypothesis-is-still-open-for-editing are left out of implements as neighbors: the former governs a different call's answer, and the latter's then-clauses are about the editing surface and an accepted update-draft, which an HTTP read route cannot show alone.
