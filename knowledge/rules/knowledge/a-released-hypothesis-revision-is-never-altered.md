---
type: policy
statement: A hypothesis-revision referenced by any case version in released state is never altered again.
constrains:
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/case-version
consistency: eventual
---

## Description

A revision's own content is what a released version's manifest promises to keep answering forever; whether any released version still references it is a fact about a different aggregate than the revision itself, so this holds across the two rather than inside one.
A hypothesis may still gain a new revision at any time — that revision simply is not the one any released version already adopted.
