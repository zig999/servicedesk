---
title: The Schema Helper's draft request and what it states to the operator
summary: The Schema Helper offered beneath the capability authoring surface's two schema fields, the draft request it dispatches to the already-delivered draft-capability-schema-from-openapi operation, and the statement it makes of that operation's answer, whether a draft or a refusal.
rationale: I cut the initiative in two along the seam the inventory marks as the risky one -- the capability form's own fields and their dirty/save-gating behaviour -- so that the helper's own panel and its request, which touch no field content, can be delivered and shown correct without the form's write path being in question at the same time.
sources:
- /home/siegfriedneto/projects/servicedeskn1/work/capability-schema-helper-frontend/intake/scope.md
covers:
- rules/integration/a-capability-authoring-surface-offers-a-schema-helper
- rules/integration/an-answered-schema-draft-request-states-its-draft-to-the-operator
- rules/integration/a-refused-schema-draft-states-its-refusal-to-the-operator
- rules/integration/no-schema-draft-refusal-is-stated-before-the-operation-answers
- contracts/integration/capability-schema-draft
- constraints/the-openapi-document-is-fetched-by-the-backend
- domain/integration/capability-schema-draft
- domain/integration/capability-schema-draft-unresolved-item
- domain/integration/capability-schema-draft-unresolved-reason
- rules/integration/a-pending-schema-draft-request-is-not-dispatched-again
---

## What it is

The Schema Helper as an operator meets it: a link, a chosen operation from the fetched document's own listing, an act requesting a draft, and the statement of whatever the operation answers.
It holds the frontend's whole binding to draft-capability-schema-from-openapi, from the dispatched request to the disclosure of a draft or of one of its four refusal readings.

## Notes

The backend operation this epic's tasks call is delivered and committed at delivery/capability-schema-helper-backend; nothing here re-delivers it.
The inventory records that the sibling Configuration Helper is built as hook plus fields component plus disclosure service, and the tasks here keep that split rather than inventing a second shape for the same kind of surface.
Several specification nodes touch this feature but are reused rather than redelivered here, so this epic's `covers` does not claim them: constraints/every-screen-discloses-that-authentication-is-unenforced and constraints/no-route-enforces-authentication (this plan adds no screen and no route of its own — the helper stands inside the already-delivered capability screens); constraints/a-malformed-request-is-refused-with-a-validation-error and constraints/a-domain-error-unmapped-by-status-is-refused-generically (both are the backend operation's own concern, already delivered); rules/integration/a-generated-schema-draft-answers-under-http-200, rules/integration/an-unfetchable-openapi-link-refuses-the-schema-draft, rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-schema-draft, rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-schema-draft and rules/integration/a-schema-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document (the operation's own status/refusal-value contract, already delivered — this epic covers only how the surface states each of the four outcomes, via a-refused-schema-draft-states-its-refusal-to-the-operator); rules/integration/a-capability-schema-draft-registers-nothing (a server-side fact, already delivered — the surface's own half is carried by the offer and apply rules); and rules/integration/a-capability-schema-drafts-input-schema-is-read-from-the-chosen-operations-parameters-and-fields, rules/integration/a-capability-schema-drafts-output-schema-is-read-from-the-chosen-operations-success-responses, rules/integration/a-capability-schema-drafts-parameter-or-field-name-claimed-twice-favors-declared-order, rules/integration/a-name-whose-first-claimant-is-unreducible-drafts-no-input-schema-entry, rules/integration/a-part-both-unreducible-and-name-claimed-stands-in-unresolved-under-each-reason and rules/integration/a-drafted-capability-schema-requiring-no-name-declares-no-required-array (draft generation itself, delivered by the backend increment; the surface reads the answer and never recomputes it).
