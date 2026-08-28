---
title: Refuse a diagnose whose subject misses a required case input
summary: The diagnose entry point refuses, before any collection, a subject that leaves
  any of the pinned case version's required attributes missing or empty.
sources:
- work/diagnose-input-schema-contract/intake/scope.md
objective: A diagnose is refused before any collection when its subject holds no attribute-value,
  or an empty one, for an attribute the pinned released case version's derived input
  requirements name required, with an HTTP 422 response reporting SubjectDoesNotCoverCaseInputsError
  naming every missing attribute together with the capabilities that require each.
criteria:
- A diagnose called with a subject missing an attribute-value for an attribute the
  case version's derived requirements name required is refused with an HTTP 422 response
  reporting SubjectDoesNotCoverCaseInputsError before any capability is called.
- The refusal names every missing required attribute together, each with the capabilities
  that require it.
- A subject missing only an attribute the derived requirements leave optional is not
  refused by this gate.
- A subject covering every required attribute reaches collection as before.
- test-connector's own diagnostic call is not held to this gate.
depends_on:
- task/case-input-requirements-and-diagnose-gate/derive-case-input-requirements
rationale: The gate is placed inside handleDiagnoseRequest, after the existing released-state
  check and before runDiagnose, per the inventory's identified seam; it depends on
  the derived-requirements read because the gate is exactly that read applied at the
  door, and demonstrating the gate presupposes the read it queries already answers
  correctly.
implements:
- domain/knowledge/case-version
- domain/knowledge/case-input-requirement
- rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
- rules/knowledge/a-case-versions-input-requirements-are-derived
- rules/knowledge/the-contract-check-reads-the-current-registration
- contracts/knowledge/case-input-requirements
- contracts/investigation/diagnosis
- scenarios/investigation/a-diagnose-refuses-a-subject-missing-a-required-attribute
---

## What it is
The diagnose entry point refuses, before any collection, a subject that leaves any of the pinned case version's required attributes missing or empty.

## Notes
REMAINDER, from the specification — rules/knowledge/a-case-versions-input-requirements-are-derived's statement carries two clauses this task's criteria never reach: that a concept the collection plan holds which no registered capability currently answers, or that more than one currently answers, contributes no attribute to the derived set; and that a capability whose own stored input schema does not currently hold a well-formed shape likewise contributes nothing and is named separately in the read rather than nested under an attribute. Neither clause is exercised by any of this task's criteria — they govern what the read itself returns, not whether a diagnose is refused — and scenarios/integration/a-legacy-capability-declares-no-input-attributes.md (excluded from this task's implements for the same reason) already exercises the malformed-schema clause. Belongs: the task implementing contracts/knowledge/case-input-requirements's read-case-input-requirements operation (derive-case-input-requirements).
