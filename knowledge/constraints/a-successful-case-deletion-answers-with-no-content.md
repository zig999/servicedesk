---
statement: Where the case lifecycle's delete accepts a delete of a case holding no case version rather than refusing it, it answers with an HTTP 204 response carrying no body.
scope: knowledge
fitness: An automated test deletes a case whose only draft version was discarded and asserts the answer is HTTP 204 with an empty body.
---

## Description

This specification states the HTTP surface's own statuses as constraints. a-malformed-request-is-refused-with-a-validation-error and a-domain-error-unmapped-by-status-is-refused-generically hold the two refusals stated once for the whole surface. Delete's own refusal is already stated where its rule stands: rules/knowledge/a-case-holding-no-version-may-be-deleted refuses a delete of a case holding any version, draft or released, with an HTTP 409 reporting a CaseHoldsVersionsError. So what an accepted delete answers is stated here rather than decided by the route.
An accepted delete leaves nothing at the slug the request carried: the case the request named no longer exists. The curator asked for that removal and nothing further, so the answer carries the status alone and no body.
This is the same statement a-successful-case-version-discard-answers-with-no-content, a-successful-concept-removal-answers-with-no-content, a-successful-connector-configuration-removal-answers-with-no-content and a-successful-capability-removal-answers-with-no-content hold for the other removals the published surfaces offer. It states what delete answers when it is accepted and nothing else. Nothing here reaches any other operation contracts/knowledge/case-lifecycle publishes, and nothing here states where a curator who deleted a case is then taken.
