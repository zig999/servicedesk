---
type: policy
statement: A hypothesis is revised only while its case holds a draft version, and the concept-acceptance check the new revision undergoes uses that draft version's declared subject type; a revision requested while the case holds no draft version is refused with an HTTP 409 response reporting a CaseHoldsNoDraftError.
constrains:
  - domain/knowledge/case
  - domain/knowledge/case-version
  - domain/knowledge/hypothesis
  - domain/knowledge/hypothesis-revision
consistency: eventual
---

## Description

A hypothesis-revision names no case version of its own — it belongs only to the hypothesis identity, which belongs only to the case — so a concept-acceptance check at the moment of revision has no subject type to read unless one is anchored: the case's own draft, the one version a-case-has-at-most-one-draft guarantees is unambiguous. Revising while no draft exists would leave the check with nothing to hold against; the same discipline that keeps a released version's manifest closed to editing (a-case-version-is-written-once) already routes every content change through a draft, and this extends that routing to name which draft and which subject type.
