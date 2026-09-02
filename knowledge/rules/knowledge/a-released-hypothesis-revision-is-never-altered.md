---
type: policy
statement: A hypothesis-revision referenced by any case version in released state is never
  altered again; an attempt to alter its stored content is refused at the point of the attempt
  with an HTTP 409 response reporting a ReleasedHypothesisRevisionNotAlterableError, rather
  than being accepted and left with no effect.
constrains:
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/case-version
consistency: eventual
---

## Description

A revision's own content is what a released version's manifest promises to keep answering forever; whether any released version still references it is a fact about a different aggregate than the revision itself, so this holds across the two rather than inside one.
A hypothesis may still gain a new revision at any time — that revision simply is not the one any released version already adopted.
The refusal is what an attempt meets on arrival rather than a silence it disappears into. `a-hypothesis-revision-is-overwritten-while-unreleased` routes revising away from an adopted revision before any write is aimed at one, so an attempt that reaches one at all arrives from a reading of the released references that no longer held by the time it wrote — and a curator answered with nothing would read an edit that never landed exactly as one that did, against content this rule exists to guarantee never moved.
