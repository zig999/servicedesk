---
statement: Where the case lifecycle's discard accepts a discard of a draft case version rather than refusing it, it answers with an HTTP 204 response carrying no body.
scope: knowledge
fitness: An automated test discards a draft case version and asserts the answer is HTTP 204 with an empty body.
---

## Description

The HTTP surface's own statuses are stated as constraints in this specification — a-malformed-request-is-refused-with-a-validation-error and a-domain-error-unmapped-by-status-is-refused-generically hold the two refusals stated once for the whole surface — and discard's own refusals are already stated where their rules stand: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle refuses it over a version not in draft with an HTTP 409 reporting a CaseVersionNotDraftError, and rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused refuses it over a slug and version no case version answers with an HTTP 404 reporting a CaseNotFoundError. So what an accepted discard answers is stated here rather than decided by the route.
An accepted discard leaves nothing at the slug and version the request carried: rules/knowledge/only-a-draft-case-version-may-be-discarded removes the version and its own manifest entries, and the number it held is spent. The curator asked for that removal and nothing further, so the answer carries the status alone and no body.
This is the same statement a-successful-concept-removal-answers-with-no-content, a-successful-connector-configuration-removal-answers-with-no-content and a-successful-capability-removal-answers-with-no-content hold for the removals the other published surfaces offer. It states what discard answers when it is accepted and nothing else. It holds the same way for every accepted discard, including one rules/knowledge/a-discard-is-offered-and-accepted-while-its-drafts-current-read-does-not-answer-a-case accepts over a version that fails some validator rule of validation-runs-at-every-read. Nothing here reaches any other operation contracts/knowledge/case-lifecycle publishes, and nothing here states where a curator who discarded a draft is then taken.
