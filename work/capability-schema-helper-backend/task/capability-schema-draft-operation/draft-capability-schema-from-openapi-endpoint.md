---
title: Publish draft-capability-schema-from-openapi and answer a generated draft under HTTP 200
summary: Register the route for contracts/integration/capability-schema-draft, fetch and read the operator-named document with the existing machinery, and answer the generated draft under HTTP 200, registering nothing.
sources:
- intake/scope.md
objective: A well-formed request naming an OpenAPI document link, a path and an HTTP method is answered with HTTP 200 carrying the capability schema draft generated from that operation, and nothing is registered by that answer.
depends_on:
- task/capability-schema-draft-generation/input-schema-from-parameters-and-request-body-fields
- task/capability-schema-draft-generation/output-schema-from-success-responses
- task/capability-schema-draft-generation/colliding-names-favor-declared-order
criteria:
- the route for draft-capability-schema-from-openapi is registered on the application beside the existing OpenAPI-reading routes.
- the request names the OpenAPI document link, the path, and the HTTP method the draft is generated from.
- the operator-named document is fetched inside this backend operation, with no fetch of that link issued from any frontend module.
- an answered request that carries a generated draft carries HTTP 200.
- an answered request that carries a generated draft never carries HTTP 201, HTTP 202 or HTTP 204.
- the answer body carries input_schema, output_schema and the unresolved list generated from the named operation's parameters, request-body fields and success responses, each item naming its own name and its own reason.
- every reason an unresolved item carries is one of schema-not-reducible-to-a-type and name-claimed-by-another-parameter, and no other value.
- a request whose path, query or body fails the route's declared shape is answered with HTTP 400 whose error code is VALIDATION_ERROR, whose message names which of the three failed, and whose details list the issues found.
- no register-capability call is issued while the request is answered.
- every capability registered before the request stands exactly as it stood after it.
- the answer stores no record of the draft.
- the document fetch, the document read and the operation lookup are the existing fetcher and readers rather than a second implementation.
implements:
- contracts/integration/capability-schema-draft
- rules/integration/a-generated-schema-draft-answers-under-http-200
- rules/integration/a-capability-schema-draft-registers-nothing
- constraints/a-malformed-request-is-refused-with-a-validation-error
- constraints/the-openapi-document-is-fetched-by-the-backend
- domain/integration/capability-schema-draft
- domain/integration/capability-schema-draft-unresolved-item
- domain/integration/capability-schema-draft-unresolved-reason
---

## What it is

The HTTP route, its request shape, its dependency wiring and its successful answer for draft-capability-schema-from-openapi.
It fetches the operator-named document with the existing fetcher, reads it with the existing document and operation readers, and hands the chosen operation to the derivation the sibling tasks of this initiative's other epic implement.

## Notes

The operation is a read: it issues no register-capability call and stores no record of a draft.
The criterion tying a well-formed request's answer to HTTP 200 is read together with the route-shape refusal's own HTTP 400, per the objective's own "A well-formed request"; the two are not in tension once the distinction is read that way.
REMAINDER, from the specification -- No criterion of this task reaches any clause of an-unfetchable-openapi-link-refuses-the-schema-draft, a-malformed-or-unsupported-openapi-document-refuses-the-schema-draft, an-openapi-document-declaring-no-such-operation-refuses-the-schema-draft or a-schema-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document.
UNDERDETERMINED, from the specification -- The objective's "the capability schema draft generated from that operation" has no backing in this task's own candidates for how input_schema and output_schema are derived; that derivation is stated in a-capability-schema-drafts-input-schema-is-read-from-the-chosen-operations-parameters-and-fields and a-capability-schema-drafts-output-schema-is-read-from-the-chosen-operations-success-responses, neither of which is a candidate of this task.
Decision, beyond the covers -- stand: those two rules are the sibling epic's own claim, implemented by this initiative's other epic's tasks; this task consumes the draft value they produce rather than re-deriving it.
UNDERDETERMINED, from the specification -- No criterion of this task holds the unresolved list to completeness against a-capability-schema-drafts-parameter-or-field-name-claimed-twice-favors-declared-order and a-part-both-unreducible-and-name-claimed-stands-in-unresolved-under-each-reason, neither of which is a candidate of this task.
Decision, beyond the covers -- stand: those two rules are likewise the sibling epic's own claim, implemented by the task settling colliding parameter and request-body field names.
ADVISORY, from the specification -- "the document fetch, the document read and the operation lookup are the existing fetcher and readers rather than a second implementation" names a structural, delivery-level fact no specification node states as such; it is checked against the trace and the delivered tree, not against a node.
