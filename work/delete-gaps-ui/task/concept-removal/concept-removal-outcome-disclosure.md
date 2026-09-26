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
- domain/glossary/concept
- rules/integration/a-submitted-removal-states-its-outcome-to-the-operator
- rules/glossary/a-registered-concept-is-never-removed
- constraints/a-successful-concept-removal-answers-with-no-content
- constraints/a-malformed-request-is-refused-with-a-validation-error
- constraints/a-domain-error-unmapped-by-status-is-refused-generically
---



## What it is
Success and refusal disclosure for the concept removal, built on the state kind the error-code map answers for the refusal.

## Notes
UNDERDETERMINED, from the specification — The criteria keep ConceptInUseError apart from HTTP 400 VALIDATION_ERROR, from HTTP 500 INTERNAL_ERROR and from an unrecognised error code, but never keep VALIDATION_ERROR and INTERNAL_ERROR apart from each other, or either apart from an unrecognised code; their own criteria ask only that "nothing was removed" is stated, not which refusal answered, as rules/integration/a-submitted-removal-states-its-outcome-to-the-operator requires. A reading that would still pass every criterion: A concepts listing that states one identical message, "nothing was removed", for a VALIDATION_ERROR refusal, an INTERNAL_ERROR refusal and an unrecognised-code refusal, and a separate message only for ConceptInUseError.
UNDERDETERMINED, from the specification — rules/glossary/a-registered-concept-is-never-removed states that ConceptInUseError reports a reference (capability, evidence, citation or hypothesis-revision-collects), and its Description says the refusal names which condition was found; the criterion asks only that something names the concept, never which of the four references was reported. A reading that would still pass every criterion: A concepts listing that states "nothing was removed; something still names this concept" in the same words whatever the reported reference is, never showing which kind of thing still names the concept.
REMAINDER, from the specification — The capability and connector-configuration clauses of rules/integration/a-submitted-removal-states-its-outcome-to-the-operator reach no criterion of this task. It belongs to: The tasks that disclose the answered outcome of remove-capability on the capability surface and of remove-connector on the connector configuration surface.
REMAINDER, from the specification — Most clauses of rules/glossary/a-registered-concept-is-never-removed reach no criterion here: the register-concepts clause, the four refusal conditions, the HTTP 409 status, the details carrying only the concept's own name and the reference, that the concept is never removed any other way, and the accepted-subject-types clause. This task only reads the ConceptInUseError error code and its reference as the api answered them. It belongs to: The already-delivered backend act for glossary-authoring's register-concepts and remove-concept operations.
REMAINDER, from the specification — Every clause of rules/integration/a-removal-surface-offers-a-control-behind-a-further-explicit-act reaches no criterion here; this task begins after a removal has been issued. It belongs to: The task that offers the concept-removal control and gates remove-concept behind the operator's further explicit act.
REMAINDER, from the specification — The statement of rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing reaches no criterion here; its own Description leaves the destination to that rule, not to this disclosure. It belongs to: The task that decides where the operator lands after a concept removal succeeds.
ADVISORY, from the specification — Two candidates name different surfaces as the one a concept removal is issued from: the objective assumes the concepts listing issues remove-concept, matching the Description of rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing, while rules/integration/a-removal-surface-offers-a-control-behind-a-further-explicit-act offers the control on "a surface presenting exactly one registered concept ... addressed by its own identity". Neither text forbids the other, but whoever cuts the control task should agree which surface issues the removal, since it decides where this outcome is stated.
