---
type: invariant
statement: A hypothesis-revision in released state is never altered again. An attempt to alter
  its criterion, resolution or state is refused at the point of the attempt with an HTTP 409
  response reporting a ReleasedHypothesisRevisionNotAlterableError, rather than being accepted
  and left with no effect. An attempt to remove one of its collects is not refused with an
  error; it is accepted and left with no effect, so every collect this revision held before the
  attempt still reads back unchanged after it.
constrains:
  - domain/knowledge/hypothesis-revision
---

## Description

A revision's own content is what its own release promises to keep answering forever, and what every case version's manifest that comes to reference it then relies on in turn.
A hypothesis may still gain a new revision at any time — that revision simply is not the one released.
The refusal is what an attempt meets on arrival rather than a silence it disappears into. `a-hypothesis-revision-is-overwritten-while-unreleased` routes revising away from a released revision before any write is aimed at one, so an attempt that reaches one at all arrives from a state read that no longer held by the time it wrote — and a curator answered with nothing would read an edit that never landed exactly as one that did, against content this rule exists to guarantee never moved.
