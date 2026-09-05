---
type: policy
statement: A hypothesis is revised only while its case holds a draft version, and the concept-acceptance check the new revision undergoes uses that draft version's declared subject type; a revision requested while the case holds no draft version is refused with an HTTP 409 response reporting a CaseHoldsNoDraftError. A revise-hypothesis request declares no subject type of its own — the check reads the subject type from the case's draft version and from nowhere else, and a subject type carried on such a request is accepted and left without effect, never read, never compared against the draft version's declared subject type, and never a ground for refusal.
constrains:
- domain/knowledge/case
- domain/knowledge/case-version
- domain/knowledge/hypothesis
- domain/knowledge/hypothesis-revision
consistency: eventual
---
## Description

A hypothesis-revision names no case version of its own — it belongs only to the hypothesis identity, which belongs only to the case — so a concept-acceptance check at the moment of revision has no subject type to read unless one is anchored: the case's own draft, the one version a-case-has-at-most-one-draft guarantees is unambiguous. Revising while no draft exists would leave the check with nothing to hold against; the same discipline that keeps a released version's manifest closed to editing (a-case-version-is-written-once) already routes every content change through a draft, and this extends that routing to name which draft and which subject type.
The subject type is the case version's own declared attribute, corrected only through update-draft while that version is draft; a hypothesis-revision declares none. A revise request that carried an authoritative subject type would make the curator a second source of a fact the case version already owns, and would let the acceptance check run against a subject type no case version ever declared. Leaving a supplied value without effect rather than refusing it keeps the check's one source intact without making the request's acceptance depend on a value that changes nothing about what is written or what is checked.
