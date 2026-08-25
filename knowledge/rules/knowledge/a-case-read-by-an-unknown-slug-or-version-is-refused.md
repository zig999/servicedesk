---
type: policy
statement: A read or a lifecycle operation naming a case slug, or a slug and version, that no case version currently answers is refused with an HTTP 404 response reporting a CaseNotFoundError.
constrains:
  - domain/knowledge/case
  - domain/knowledge/case-version
consistency: eventual
---

## Description

An unwritten version is not answered as something it is not, but refused by a name of its own — the same distinction the integration and glossary reads already draw for a miss.
A case that exists and currently holds no version is a different case, answered by a-case-holding-no-versions-is-told-explicitly rather than by this refusal.
