---
statement: Where the published surface's remove-connector answers a removal of a connector configuration by name rather than refusing the request under one of the surface's own two refusals, it answers with an HTTP 204 response carrying no body — the same answer whether a configuration stood at that name or none did.
scope: integration
fitness: An automated test removes a registered connector configuration and then a connector name nothing is registered under, and asserts each answer is HTTP 204 with an empty body.
---

## Description

The HTTP surface's own statuses are stated as constraints in this specification — a-malformed-request-is-refused-with-a-validation-error and a-domain-error-unmapped-by-status-is-refused-generically hold the two refusals stated once for the whole surface, and the-capability-identity-read-refuses-an-unregistered-identity holds a read's own — so what a successful removal answers is stated here rather than decided by the route.
remove-connector raises no domain error of its own: rules/integration/removing-a-connector-configuration-is-unconditional lets every removal by name stand, and the caller asked for that removal and nothing further, so the answer carries the status alone and no body.
That rule also states that a removal naming a connector nothing is registered under is answered exactly as one that removed a configuration, so both branches carry this same status and this same absent body — nothing in the answer tells them apart, which is what that rule settled when it refused to let the absence be reported.
This states what remove-connector answers when it removes, the answer constraints/a-successful-concept-removal-answers-with-no-content already states for the glossary's own removal; the refusals the surface states elsewhere are answered where their own nodes state, and nothing here reaches any other removal operation the specification publishes.
