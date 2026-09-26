---
title: Leave the operator on the concepts listing after a successful removal
summary: 'Where the operator stands once a concept removal succeeds: the glossary''s
  concepts tab, with the removed concept no longer listed.'
rationale: Cut apart from the gate and the disclosure because the landing rule changes
  independently of both; a concept's removal is issued from its own listing, so the
  landing here is that listing without the removed row rather than a navigation.
sources:
- work/delete-gaps-ui/intake/scope.md
objective: After a successful concept removal, the operator is on the glossary's listing
  of registered concepts.
criteria:
- After a removal answered with HTTP 204, the glossary shows its concepts tab.
- After a removal answered with HTTP 204, the concepts listing shows no row for the
  removed concept's name.
depends_on:
- task/concept-removal/concept-row-removal-control
implements:
- rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing
- constraints/a-successful-concept-removal-answers-with-no-content
- domain/glossary/concept
---


## What it is
The glossary's concepts tab after a removal succeeds, with the listing reflecting the removal.

## Notes
UNDERDETERMINED, from the specification — The criteria do not cover the second half of the rule's statement, that the operator is taken "never to the surface addressed by the identity just removed"; both criteria only check what the glossary shows (the concepts tab, no row for the removed name), and neither says where the operator is. A reading that would still pass every criterion: After the HTTP 204, the operator is taken to the removed concept's own address; that view still renders the glossary with its concepts tab active and a listing with no row for the removed name, while the concept's own panel next to it shows the refused read of that now-unheld name.
REMAINDER, from the specification — The rule also lands a successful capability removal on the capabilities listing and a successful connector configuration removal on the connector configurations listing; no criterion here reaches those two clauses. It belongs to: The tasks that land a successful capability removal and a successful connector configuration removal on their own listings.
REMAINDER, from the specification — Every clause of rules/integration/a-removal-surface-offers-a-control-behind-a-further-explicit-act belongs elsewhere: the remove control on a single-entity surface, the asking step that issues nothing, the further explicit act that alone issues the removal, and the entity standing unchanged when the operator does not confirm. This task starts after a removal has already succeeded. It belongs to: The task(s) that offer the removal control and its confirmation step on the concept, capability and connector configuration surfaces.
REMAINDER, from the specification — No criterion here reaches rules/integration/a-submitted-removal-states-its-outcome-to-the-operator: telling the operator the identity is no longer registered on success, stating the refusal apart from every other condition and from an unrecognised one, and stating no outcome before the api answers. This task decides only where the operator lands, not what they are told. It belongs to: The task(s) that state a removal's outcome to the operator on the concept, capability and connector configuration removal surfaces.
REMAINDER, from the specification — No criterion here reaches rules/glossary/a-registered-concept-is-never-removed: registering never removes; removal is refused with HTTP 409 and a ConceptInUseError reporting its reference (capability-concept, evidence-concept, citation-concept, hypothesis-revision-collects); removal happens no other way; and removal takes the concept's accepted-subject-type declaration but no subject-type vocabulary term. This task only reacts to the HTTP 204 constraints/a-successful-concept-removal-answers-with-no-content states. It belongs to: The glossary's register-concepts and remove-concept acts on the api, and the task that states a refused concept removal's condition to the operator.
ADVISORY, from the specification — constraints/a-domain-error-unmapped-by-status-is-refused-generically and constraints/a-malformed-request-is-refused-with-a-validation-error describe refusals; this task is about a removal answered with HTTP 204, so they are neighbors here, not governing nodes.
ADVISORY, from the specification — Possible seam: the Description of rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing says the concept's own listing is the surface remove-concept is issued from, so no further route is owed there, but rules/integration/a-removal-surface-offers-a-control-behind-a-further-explicit-act puts the remove control on a surface presenting exactly one registered concept addressed by its own identity. If the removal is issued from a single-concept surface instead, that reasoning does not hold as written; this does not change what this task implements, since the destination is stated either way.
ADVISORY, from the specification — Which page of the concepts listing the operator lands on is left to the standing constraint over paged listings, which is not a candidate and sits outside the epic's claim.
