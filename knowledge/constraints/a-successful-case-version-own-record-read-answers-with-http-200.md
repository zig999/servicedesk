---
statement: Where contracts/knowledge/case-query's read-case-version answers the named case version's own stored record rather than refusing the call, it answers with an HTTP 200 response, whether or not every validator rule of validation-runs-at-every-read holds for that version at that reading.
scope: knowledge
fitness: An automated test calls read-case-version over a draft case version whose manifest holds no hypothesis, and over one that reads back as a case, and asserts each answer is HTTP 200.
---

## Description

contracts/knowledge/case-query publishes read-case-version, and the api contract class declares no responses. The refusals this call can meet are already stated where their rules stand. rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused refuses a slug and version that no case version answers with an HTTP 404 reporting a CaseNotFoundError. constraints/a-malformed-request-is-refused-with-a-validation-error refuses a malformed request with an HTTP 400. This constraint states what the call answers when it is not refused.
The call reads a version that already stands, and its answer carries that version's own stored attributes. Nothing is created, so 201 does not fit. The answer has a body, so 204 does not fit. Nothing is left pending, so 202 does not fit. The same reasoning led rules/knowledge/an-accepted-update-draft-answers-its-versions-own-stored-declared-attributes to answer with 200 carrying the same attributes.
read-case-version does not validate the version at this reading. So a version that fails some validator rule of validation-runs-at-every-read is still a successful read here and not a refusal, and the call answers it with the same status. The whole-case read of that version, read-case, is not affected by this constraint. This constraint also leaves the answer's body and the other operations case-query publishes alone.
