---
title: A stated draft is marked stale once the surface moves away from it
summary: The draft carries the link, the operation and the connector name it was generated for, and reads
  as stale from the moment any of the three differs, the act applying it still offered.
objective: A stated draft is marked as generated for its link, its operation and its connector name, and
  is stated as stale from the moment any of the three differs from what the surface holds.
criteria:
- A stated draft is marked with the link of the request that produced it.
- A stated draft is marked with the operation of the request that produced it.
- A stated draft is marked with the connector name of the request that produced it.
- From the moment the surface's link differs from the one the draft was generated for, the draft is stated
  as stale.
- From the moment the surface's chosen operation differs from the one the draft was generated for, the
  draft is stated as stale.
- From the moment the surface's connector name differs from the one the draft was generated for, the draft
  is stated as stale.
- A draft stated as stale is not discarded and nothing here withholds the act applying it.
sources:
- intake/scope.md
implements:
- domain/integration/connector-configuration-draft
- rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing
- rules/integration/a-stated-draft-is-marked-stale-once-what-it-was-generated-for-changes
---

## What it is
The marking that keeps an operator from applying text drafted from an operation they are no longer looking at.
The draft itself is unchanged by the marking -- what moved is the surface around it.

## Notes
The act stays offered because an operator who knows the draft is stale may still want it.
UNDERDETERMINED, from the specification -- Nothing in the criteria says where the mark is held, and the criteria as written are satisfied by a draft-generation answer widened to carry the request's link and chosen operation back beside the draft's own attributes, the surface then marking the stated draft from that answer. rules/integration/a-connector-configuration-draft-response-carries-no-capability refuses exactly that answer: its expression holds the successful answer of draft-connector-configuration-from-openapi to one field per attribute domain/integration/connector-configuration-draft declares and no other field, and that element declares connector but neither a link nor an operation. The mark has to be held by the surface that issued the request, from what it already holds.
Adding the request's link and chosen operation (path and method) as further fields of the draft-connector-configuration-from-openapi answer, and marking the stated draft from those fields, would satisfy every criterion here while breaking the answer's declared shape.
REMAINDER, from the specification -- Two clauses of rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing's statement reach no criterion of this task -- that the helper offers every operation the document declares as one path and one HTTP method pair, and that the operator names one by choosing a pair rather than typing a path or a method. Only its last clause, that the draft request names the chosen pair's own path and its own method, is what this task's staleness comparison rests on. Belongs to the task delivering the Configuration Helper's operations listing and the choosing of an operation from it.
ADVISORY, from the specification -- Seam with rules/integration/an-answered-draft-request-states-its-draft-to-the-operator, which governs the same stated draft on the same surface. Its Description states the link, the operation and the connector name the draft was generated for are already standing on the surface they were entered on, and its statement closes what the surface states of the answer with stating no name, no reason, no generated name, no security scheme name, no status, no field, no note and no method the answer did not carry. Neither forbids the mark this task adds, but an implementer reading that rule alone can take the mark for a statement it refuses; the two rules are stated apart and the surface must satisfy both at once.
