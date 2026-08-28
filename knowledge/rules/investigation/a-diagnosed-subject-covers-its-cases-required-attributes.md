---
type: policy
statement: A diagnose whose subject holds no attribute-value, or an empty one, for an attribute a case-input-requirement of the pinned case version names required is refused before any collection, with an HTTP 422 response reporting a SubjectDoesNotCoverCaseInputsError naming every missing attribute together and, for each, the capabilities that require it.
constrains:
  - domain/investigation/subject
  - domain/knowledge/case-input-requirement
consistency: eventual
---

## Description

Everything an-unresolvable-observation-ends-unavailable already treats as a per-capability ending during collection is checked once, at the door, for whatever a case's own derived requirements demand: a subject missing what those requirements name required is refused before any capability is ever called, rather than discovered concept by concept mid-collection at the cost of the calls that already ran.
An attribute a case-input-requirement leaves optional never enters this refusal: absent, the observation asking for it degrades to unavailable on its own (an-unresolvable-observation-ends-unavailable), never blocking the rest of the diagnose.
The test of one connector configuration through a registered capability (a-connector-configuration-is-tested-through-a-registered-capability) is not held to this refusal: it exists to diagnose exactly this seam between a subject and a capability's own call, and the resolver's own unresolved-placeholder answer, surfaced raw, is its diagnosis.
