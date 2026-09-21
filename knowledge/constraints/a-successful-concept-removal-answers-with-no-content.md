---
statement: Where the glossary's remove-concept route removes the named concept rather than refusing the removal, it answers with an HTTP 204 response carrying no body.
scope: glossary
fitness: An automated test removes a concept nothing names and asserts the answer is HTTP 204 with an empty body.
---

## Description

The HTTP surface's own statuses are stated as constraints in this specification — the-concept-read-refuses-an-unanswered-concept holds the status of a glossary read's refusal, and a-malformed-request-is-refused-with-a-validation-error and a-domain-error-unmapped-by-status-is-refused-generically hold the two refusals stated once for the whole surface — so what a successful removal answers is stated here rather than decided by the route.
A removal that succeeded leaves nothing at the name the request carried: rules/glossary/a-registered-concept-is-never-removed lets the removal stand only where nothing that rule names references the concept, and the caller asked for that removal and nothing further, so the answer carries the status alone and no body.
This states what remove-concept answers when it removes, and nothing else — the refusals that rule names are answered where their own nodes state, and nothing here reaches any other removal operation the specification publishes.
