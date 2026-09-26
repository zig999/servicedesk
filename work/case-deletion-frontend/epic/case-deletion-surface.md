---
title: Case deletion surface
summary: The frontend work that lets a curator delete a case holding no version, show what each delete
  answer means, and see the deleted case leave the cases listing.
rationale: The scope asks for one capability's surface and does not say how to cut it. It gets one epic
  because every task here answers the same delete operation on the same case-keyed surface. A second epic
  would have split one seam's consumers from its producer.
sources:
- intake/scope.md
covers:
- rules/knowledge/a-case-holding-no-version-may-be-deleted
- constraints/a-successful-case-deletion-answers-with-no-content
- scenarios/knowledge/a-case-holding-no-version-is-deleted
- contracts/knowledge/case-lifecycle
- contracts/knowledge/case-query
- domain/knowledge/case
- rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
- constraints/a-malformed-request-is-refused-with-a-validation-error
- constraints/a-domain-error-unmapped-by-status-is-refused-generically
- rules/knowledge/a-case-is-created-by-the-first-create-draft-naming-its-slug
- rules/knowledge/a-slug-identifies-one-case
- constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
- constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
- rules/knowledge/a-case-deletion-takes-a-further-explicit-act-reproducing-the-cases-own-slug
- rules/knowledge/a-successful-case-deletion-lands-on-the-listing-of-every-case
- rules/knowledge/a-case-deletion-surface-states-which-refusal-answered-its-delete
- rules/knowledge/a-case-deletion-refusal-the-surface-cannot-name-is-told-as-an-unrecognised-failure
uncovered:
- node: rules/knowledge/a-case-is-created-by-the-first-create-draft-naming-its-slug
  why: Re-creating a case under a deleted slug is decided by the backend's create-draft, which case-deletion-backend
    delivered. The frontend's existing authoring surface already issues create-draft, and this plan changes
    nothing about it.
- node: rules/knowledge/a-slug-identifies-one-case
  why: The store and the backend hold slug uniqueness. No frontend artifact in this plan can make it true
    or false.
- node: constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
  why: It binds the message text a domain refusal carries in the HTTP response. The backend delivered
    that text for CaseHoldsVersionsError and CaseNotFoundError, and this plan writes no refusal message.
- node: constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
  why: It binds the refusal's message in the response and states that how a screen words its own copy
    is the interface's choice. This plan writes no refusal message.
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  why: It binds the backend's own wire answer for a malformed request (HTTP 400 VALIDATION_ERROR,
    message and details), already delivered. Every task under this epic reaches VALIDATION_ERROR only
    as one of the "any other error code" cases rules/knowledge/a-case-deletion-refusal-the-surface-cannot-name-is-told-as-an-unrecognised-failure
    already covers by code alone, so this constraint's own shape governs nothing this plan writes.
- node: constraints/a-domain-error-unmapped-by-status-is-refused-generically
  why: It binds the backend's own wire fallback (HTTP 500 INTERNAL_ERROR, fixed message, no context),
    already delivered. The same reasoning applies as above — this plan's tasks reach an unmapped error
    only by its code, through rules/knowledge/a-case-deletion-refusal-the-surface-cannot-name-is-told-as-an-unrecognised-failure,
    never through this constraint's own wire shape.
---

## What it is
The curator-facing half of the delete operation that contracts/knowledge/case-lifecycle publishes and case-deletion-backend delivered.
It covers four things: the client call, the error-state entry for the one new refusal code, the control on the case detail surface, and how each refusal is presented.

## Notes
None.
