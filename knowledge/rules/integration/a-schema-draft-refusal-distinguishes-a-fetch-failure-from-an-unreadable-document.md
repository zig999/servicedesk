---
type: invariant
statement: an-unfetchable-openapi-link-refuses-the-schema-draft and a-malformed-or-unsupported-openapi-document-refuses-the-schema-draft answer under the same HTTP status and never under the same error value, and neither is ever reported as the other or as a refusal carrying no named condition.
constrains:
- domain/integration/capability-schema-draft
---

## Description

The same distinction a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document already draws between the sibling connector configuration draft's own two refusals, read here over the capability schema draft's own: telling a document that was never received from one that cannot be read is the whole reason the two refusals are two rules rather than one.
