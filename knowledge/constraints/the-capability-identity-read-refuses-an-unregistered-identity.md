---
statement: The registry's read-capability-by-identity route refuses a name and version no capability is currently registered at with an HTTP 404 response, naming CapabilityIdentityNotFoundError as the specific condition and message of that refusal.
scope: integration
fitness: An automated test requests read-capability-by-identity for a name and version no capability is currently registered at and asserts that the response is HTTP 404, naming CapabilityIdentityNotFoundError as the refusal's own condition and message.
---

## Description

Mirrors the-capability-identity-read-is-rate-limited's own idiom for this same route — an HTTP-level shape stated for the solution rather than the domain — so a miss is never a silent or generic answer but a distinct, named refusal a caller can act on, the same discipline a-release-refusal-with-no-named-violation-says-so and a-case-holding-no-versions-is-told-explicitly already hold for other reads that find nothing.
