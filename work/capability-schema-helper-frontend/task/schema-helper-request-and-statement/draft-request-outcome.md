---
title: The draft request and its classified outcome
summary: A request hook that dispatches the Schema Helper's draft request to draft-capability-schema-from-openapi through the one shared API client and resolves each possible answer into exactly one outcome.
rationale: I cut the transport and the classification apart from every surface that renders them because the outcome union is what four other tasks read, and because the error codes the operation answers with are the one thing that changes if the operation's refusal vocabulary ever changes -- a reason to change nothing else in this plan shares.
sources:
- /home/siegfriedneto/projects/servicedeskn1/work/capability-schema-helper-frontend/intake/scope.md
objective: The Schema Helper's draft request reaches the delivered draft-capability-schema-from-openapi operation and every answer it can give resolves into exactly one outcome distinguishable from every other.
criteria:
- The hook dispatches a POST to draft-capability-schema-from-openapi carrying a body of exactly link, path and method, taken from the link the operator named and the operation they chose.
- The request is issued through the existing apiFetch client in frontend/app/src/services/api-client.ts, and no module added by this task builds a fetch of its own or parses a response envelope of its own.
- No module added by this task issues a request to an OpenAPI document's own URL; the document is reached only through a backend operation.
- An HTTP 200 answer resolves to a drafted outcome carrying that answer's input_schema, its output_schema, and each unresolved item's name and reason, with no name and no reason the answer did not carry.
- An answer reporting OpenApiDocumentNotFetchedError resolves to an outcome distinct from the outcome either other refusal code resolves to.
- An answer reporting OpenApiDocumentNotReadableError resolves to an outcome distinct from the outcome either other refusal code resolves to.
- An answer reporting OpenApiOperationNotFoundError resolves to an outcome distinct from the outcome either other refusal code resolves to.
- An answer carrying any other error code resolves to an unrecognised-failure outcome that is neither a drafted outcome nor any of the three named refusal outcomes.
- While a dispatched request stands unanswered, the outcome is the pending one and is neither a drafted outcome nor any refusal outcome.
- Where no request has been dispatched, the outcome is the idle one and is neither a drafted outcome nor any refusal outcome.
- A drafted or refused outcome carries the link, the path and the method of the request it answers, exactly as that request named them.
- A dispatch attempted while a request is in flight issues no second request to the operation.
reference:
- frontend/app/src/hooks/use-draft-connector-configuration-from-openapi.ts
- frontend/app/src/services/api-client.ts
- delivery/capability-schema-helper-backend
implements:
- rules/integration/a-capability-authoring-surface-offers-a-schema-helper
- rules/integration/an-answered-schema-draft-request-states-its-draft-to-the-operator
- rules/integration/a-refused-schema-draft-states-its-refusal-to-the-operator
- rules/integration/no-schema-draft-refusal-is-stated-before-the-operation-answers
- rules/integration/a-pending-schema-draft-request-is-not-dispatched-again
- contracts/integration/capability-schema-draft
- constraints/the-openapi-document-is-fetched-by-the-backend
- domain/integration/capability-schema-draft
- domain/integration/capability-schema-draft-unresolved-item
- domain/integration/capability-schema-draft-unresolved-reason
---

## What it is

The frontend's one binding to the already-delivered draft operation, modelled the way the sibling draft hook already models its own: a single mutation read through a status switch into a discriminated outcome.
The outcome carries the request it answers, so a later reading can tell what the draft standing on the surface was generated for.

## Notes

Carrying the answered request on the outcome is my decision rather than the scope's: it belongs to the outcome's own identity, and holding it anywhere else would make the staleness reading depend on a second record of the same fact.
The in-flight guard is drawn from the convention the inventory records at the sibling hook, not from a specification node.
ADVISORY, from the specification -- Three criteria name the error codes OpenApiDocumentNotFetchedError, OpenApiDocumentNotReadableError and OpenApiOperationNotFoundError, but no candidate states which code draft-capability-schema-from-openapi reports for which condition; the mapping is held by rules/integration/an-unfetchable-openapi-link-refuses-the-schema-draft, rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-schema-draft and rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-schema-draft, none a candidate here.
Decision, beyond the covers — stand: rules/integration/an-unfetchable-openapi-link-refuses-the-schema-draft, rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-schema-draft and rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-schema-draft are the already-delivered backend increment's own claim (delivery/capability-schema-helper-backend); this task reads the codes that increment's HTTP surface already answers with rather than re-deriving the mapping.
ADVISORY, from the specification -- One criterion fixes the wire shape of the dispatch -- an HTTP POST carrying a body of exactly link, path and method -- which no candidate states; it is read off the already delivered backend surface rather than off any node in the candidate set.
ADVISORY, from the specification -- One criterion requires a drafted or refused outcome to carry the link, the path and the method of the request it answers; no candidate's statement fixes that a stated draft or refusal is tied to the request that produced it -- that is held by rules/integration/a-stated-capability-schema-draft-is-marked-stale-once-what-it-was-generated-for-changes and, for a refusal's link, by rules/integration/a-schema-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document, neither a candidate.
Decision, beyond the covers — stand: rules/integration/a-stated-capability-schema-draft-is-marked-stale-once-what-it-was-generated-for-changes is the sibling epic's own claim, implemented by this initiative's other epic's tasks; this task carries the request's own record forward so that epic's marking has something to compare against, rather than re-deriving the marking itself. rules/integration/a-schema-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document is the already-delivered backend increment's own claim; this task echoes the link the request itself named rather than re-deriving what the backend already discloses.
REMAINDER, from the specification -- rules/integration/a-capability-authoring-surface-offers-a-schema-helper states, beyond the draft request this task dispatches, that the helper sits beneath the two schema fields, that the operation is chosen from the fetched document's own listing and never typed, and that the request act is offered only once an operation stands chosen. No criterion of this task reaches those clauses.
REMAINDER, from the specification -- rules/integration/an-answered-schema-draft-request-states-its-draft-to-the-operator demands that the surface state the draft to the operator; this task's criteria reach only the outcome carrying that data, never its statement.
REMAINDER, from the specification -- rules/integration/a-refused-schema-draft-states-its-refusal-to-the-operator demands that the surface state to the operator which of the three conditions answered or that it failed unrecognisably; this task's criteria reach only the classification into distinct outcomes, never the stating.
UNDERDETERMINED, from the specification -- rules/integration/a-refused-schema-draft-states-its-refusal-to-the-operator's closing clause -- no input_schema, no output_schema and no unresolved item stands beside that refusal -- reaches no criterion; nothing forbids a refusal outcome from carrying schema or unresolved content.
UNDERDETERMINED, from the specification -- rules/integration/a-capability-authoring-surface-offers-a-schema-helper's clause that requesting a draft issues no register-capability call reaches no criterion of this task.
UNDERDETERMINED, from the specification -- rules/integration/a-pending-schema-draft-request-is-not-dispatched-again's clause that the helper requests again as soon as the outstanding request ends, whether it ended in a draft or in a refusal, reaches no criterion; criterion twelve forbids only a second request while one is in flight.
UNDERDETERMINED, from the specification -- the same rule's clause that a suppressed further request leaves the outstanding request untouched reaches no criterion; criterion twelve constrains only that no second request is issued.
