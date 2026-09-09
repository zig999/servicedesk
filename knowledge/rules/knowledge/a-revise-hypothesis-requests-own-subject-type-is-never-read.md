---
type: policy
statement: >-
  A revise-hypothesis request declares no subject type of its own — the concept-acceptance check
  a-hypothesis-is-revised-only-against-its-cases-draft states reads the subject type from the
  case's draft version and from nowhere else, and a subject type carried on such a request is
  accepted and left without effect, never read, never compared against the draft version's
  declared subject type, and never a ground for refusal.
constrains:
  - domain/knowledge/case
  - domain/knowledge/case-version
  - domain/knowledge/hypothesis
  - domain/knowledge/hypothesis-revision
consistency: eventual
---

## Description

The subject type is the case version's own declared attribute, corrected only through update-draft while that version is draft; a hypothesis-revision declares none. A revise request that carried an authoritative subject type would make the curator a second source of a fact the case version already owns, and would let the acceptance check run against a subject type no case version ever declared. Leaving a supplied value without effect rather than refusing it keeps the check's one source intact without making the request's acceptance depend on a value that changes nothing about what is written or what is checked.
