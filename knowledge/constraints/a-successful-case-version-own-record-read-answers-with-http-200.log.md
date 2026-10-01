---
entries:
- field: statement
  unstated: No node states the HTTP status of a successful read-case-version call. contracts/knowledge/case-query declares the operation, and its prose says what it returns. The api contract class declares no responses. Every HTTP status the specification states for this call is a refusal (HTTP 404 CaseNotFoundError in a-case-read-by-an-unknown-slug-or-version-is-refused, and HTTP 400 VALIDATION_ERROR in a-malformed-request-is-refused-with-a-validation-error). The intake for this work (work/case-version-editable-when-invalid/intake/scope.md) leaves the shape of the HTTP response to planning.
  decided: HTTP 200 for every read-case-version call that answers the named version's stored record rather than refusing it, including a call over a version that fails a validator rule of validation-runs-at-every-read. Never 201, 202 or 204. Stated as a knowledge-scoped constraint.
  why: The call reads a version that already exists and has that version's stored attributes to carry. It creates nothing, which rules out 201. It defers nothing, which rules out 202. It has a body, which rules out 204. The operation does not validate the version, so a version that fails validation is still a successful read under this call and gets no status of its own.
---
