---
title: Disclose the answered outcome of a concept removal
summary: What the concepts listing tells the operator once remove-concept has answered
  a removal it issued, and what it withholds while the answer is pending.
rationale: Cut apart from the control because what the operator is told changes with
  the disclosure rule and with the refusal codes the route can name, while the gate
  changes with the removal-control rule.
sources:
- work/delete-gaps-ui/intake/scope.md
objective: The concepts listing states to the operator the outcome remove-concept
  answered for a removal it issued.
criteria:
- A removal answered with HTTP 204 is stated as success naming the removed concept's
  name.
- A removal refused with ConceptInUseError states that nothing was removed.
- A removal refused with ConceptInUseError states that something still names the concept.
- The statement for a ConceptInUseError refusal differs from the statement for a refusal
  answered with HTTP 400 VALIDATION_ERROR.
- The statement for a ConceptInUseError refusal differs from the statement for a refusal
  answered with HTTP 500 INTERNAL_ERROR.
- A removal refused with HTTP 400 VALIDATION_ERROR states that nothing was removed.
- A removal refused with HTTP 500 INTERNAL_ERROR states that nothing was removed.
- A removal refused with an error code the surface does not recognise states that
  nothing was removed.
- The statement for a refusal with an error code the surface does not recognise differs
  from the statement for a ConceptInUseError refusal.
- While the removal has not been answered, the surface states neither success nor
  refusal.
depends_on:
- task/concept-removal/concept-row-removal-control
- task/concept-removal/concept-in-use-refusal-recognition
implements:
- rules/integration/a-submitted-removal-states-its-outcome-to-the-operator
- rules/glossary/a-registered-concept-is-never-removed
- domain/glossary/concept
- constraints/a-successful-concept-removal-answers-with-no-content
- constraints/a-malformed-request-is-refused-with-a-validation-error
- constraints/a-domain-error-unmapped-by-status-is-refused-generically
---


## What it is
Success and refusal disclosure for the concept removal, built on the state kind the error-code map answers for the refusal.

## Notes
UNDERDETERMINED, from the specification — rules/glossary/a-registered-concept-is-never-removed's ConceptInUseError now reports one of four references (capability-concept, evidence-concept, citation-concept, hypothesis-revision-collects), and the rule's Description says the refusal names which condition was found so the operator knows what to look at. The criterion for this refusal asks only that the surface state that something still names the concept, not which of the four conditions the answer reported. A reading that would still pass every criterion: A concepts listing that shows the same text, "nothing was removed; something still names this concept", for every ConceptInUseError whatever the reported reference is, never telling the operator whether a capability, an evidence item, a citation or a hypothesis-revision's collects is what names the concept.
UNDERDETERMINED, from the specification — rules/integration/a-submitted-removal-states-its-outcome-to-the-operator requires each condition the route can name to be stated apart from every other condition and from an unrecognised one. No criterion keeps HTTP 400 VALIDATION_ERROR apart from HTTP 500 INTERNAL_ERROR, or either apart from an unrecognised code; those two criteria ask only that nothing was removed. A reading that would still pass every criterion: A concepts listing that shows one identical generic text, "the removal failed; nothing was removed", for a VALIDATION_ERROR refusal, an INTERNAL_ERROR refusal and a refusal with an unrecognised error code, with a separate text only for ConceptInUseError.
REMAINDER, from the specification — The clauses of rules/integration/a-submitted-removal-states-its-outcome-to-the-operator about a removal of a capability or a connector configuration reach no criterion here; this task covers only remove-concept on the concepts listing. It belongs to: The tasks that disclose the outcome of remove-capability on the capability surface and of remove-connector on the connector configuration surface.
REMAINDER, from the specification — Most clauses of rules/glossary/a-registered-concept-is-never-removed reach no criterion here: registering never removes; the removal succeeds unless one of the four conditions holds; otherwise the HTTP 409 carries the reference for the condition found; a concept is never removed any other way; and a removal takes the concept's accepts declaration with it and removes no subject-type term. These are what the api decides and answers; this task only reads the answer. It belongs to: The register-concepts and remove-concept operations of the glossary's own publishing api.
REMAINDER, from the specification — No clause of rules/integration/a-removal-surface-offers-a-control-behind-a-further-explicit-act reaches a criterion here: the removal control offered for one identity, the asking that issues nothing on its own, issuing only after a further explicit act, and the concept standing unchanged when the operator does not confirm. It belongs to: The task that offers the concept removal control and gates remove-concept behind the operator's further explicit act.
REMAINDER, from the specification — The clause of rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing sending a successful removal to the listing and never to the removed identity's surface reaches no criterion here; this candidate does not govern disclosure of the outcome. It belongs to: The task that decides where the operator is taken after a successful remove-concept, and its capability and connector configuration counterparts.
ADVISORY, from the specification — There is a seam over which surface issues the removal: the objective and the Description of rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing agree the concepts listing issues it ("the concept's own listing is the surface remove-concept is issued from"), but the statement of rules/integration/a-removal-surface-offers-a-control-behind-a-further-explicit-act places the removal control on "a surface presenting exactly one registered concept ... addressed by its own identity". Confirm the concepts listing is where the concept removal is issued, so this disclosure lands on the same surface as the control.
