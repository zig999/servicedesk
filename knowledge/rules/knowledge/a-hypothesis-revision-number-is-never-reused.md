---
type: policy
statement: A hypothesis's first-ever revision is numbered 1; each later revision is numbered exactly one past that hypothesis's own highest existing revision, and a revision number, once assigned, is never reused for that hypothesis.
constrains:
  - domain/knowledge/hypothesis
  - domain/knowledge/hypothesis-revision
consistency: eventual
---

## Description

A hypothesis-revision's own number is what a manifest entry, and a released version's pin through it, address that content by — the same role a case version's own number plays for a released version. Reusing a number for a later revision would let two different pieces of content, authored at different times, answer to the same reference, which is exactly what a-released-hypothesis-revision-is-never-altered depends on staying impossible.
Unlike a case version, a hypothesis-revision is never discarded, so the guarantee holds without needing a counter that survives past a deleted row: the highest revision a hypothesis has ever held is always still on hand to number the next one from.
Replacing an existing, not-yet-frozen revision's own content in place, as `a-hypothesis-revision-is-overwritten-while-unreleased` allows, is not a reuse of its number: the content changes, but the number named never stopped naming that one revision, so nothing has been assigned twice.
