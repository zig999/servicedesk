---
type: policy
statement: A case has at most one version in draft state at a time; create-draft asked of a case that already holds a draft is refused with an HTTP 409 response reporting a CaseAlreadyHasDraftError.
constrains:
  - domain/knowledge/case
  - domain/knowledge/case-version
consistency: eventual
---

## Description

A case's next version number is assigned the moment its draft is created, not at release; two drafts open at once would have nothing to decide which claims that number.
Revising a case is therefore always one working copy at a time, resolved to released or discarded before another draft may begin.
