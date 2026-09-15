---
title: The draft-capability-schema-from-openapi published operation
summary: The published api contracts/integration/capability-schema-draft — the HTTP route that fetches the operator-named document, answers a generated draft under HTTP 200, and refuses under HTTP 422 with the three conditions' own named error values.
rationale: The scope names the endpoint and the three refusals together; I cut them into their own epic, apart from the derivation, because they are the HTTP seam and its refusal vocabulary, and a change to a refusal's error value is not a change to how a schema is read from a document.
sources:
- intake/scope.md
covers:
- contracts/integration/capability-schema-draft
- rules/integration/a-generated-schema-draft-answers-under-http-200
- rules/integration/a-capability-schema-draft-registers-nothing
- rules/integration/an-unfetchable-openapi-link-refuses-the-schema-draft
- rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-schema-draft
- rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-schema-draft
- rules/integration/a-schema-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
- constraints/a-malformed-request-is-refused-with-a-validation-error
- constraints/a-domain-error-unmapped-by-status-is-refused-generically
- constraints/the-openapi-document-is-fetched-by-the-backend
- domain/integration/capability-schema-draft
- domain/integration/capability-schema-draft-unresolved-item
- domain/integration/capability-schema-draft-unresolved-reason
---

## What it is

The HTTP route, its request shape, its dependency wiring and its refusal behavior for draft-capability-schema-from-openapi.
It fetches the operator-named document with the existing fetcher, reads it with the existing document and operation readers, and hands the chosen operation to the derivation.
It answers a draft under HTTP 200 and each of the three refusal conditions under HTTP 422 with that condition's own error value.

## Notes

The operation is a read: it issues no register-capability call and stores no record of a draft.
The three refusal error values already exist and are already mapped to HTTP 422; this operation reuses them rather than minting a second vocabulary for the same conditions.
The surface-facing rules of the Schema Helper (offering the helper, choosing an operation from a listing, stating an answered draft or a refusal to the operator, the untouched schema fields, the two independent Apply acts, and the stale marking) are not claimed by this epic's `covers` at all — the scope states the Schema Helper screen is a separate, later frontend initiative, and this epic covers only what the backend operation itself answers.
The sibling published apis whose fetch/parse machinery and whose own three refusals this operation's own refusals reuse (contracts/integration/connector-configuration-draft, contracts/integration/openapi-document-operations, and their own unfetchable-link, unreadable-document and never-read-alike rules) are likewise not claimed: they already stand delivered, and this operation reuses their error values and their sixty-second fetch bound rather than redelivering the rules that already fix them.
