---
title: Disclose the answered outcome of a capability removal
summary: What the capability's surface tells the operator once remove-capability has
  answered a removal it issued, and what it withholds while the answer is pending.
rationale: Cut apart from the control because what the operator is told changes with
  the disclosure rule and with the refusal codes the route can name, while the gate
  changes with the removal-control rule.
sources:
- work/delete-gaps-ui/intake/scope.md
objective: The capability's surface states to the operator the outcome remove-capability
  answered for a removal it issued.
criteria:
- A removal answered with HTTP 204 is stated as success naming the removed capability's
  name and version.
- A removal refused with CapabilityCitedByEvidenceError states that nothing was removed.
- A removal refused with CapabilityCitedByEvidenceError states that collected evidence
  names the capability.
- The statement for a CapabilityCitedByEvidenceError refusal differs from the statement
  for a refusal answered with HTTP 400 VALIDATION_ERROR.
- The statement for a CapabilityCitedByEvidenceError refusal differs from the statement
  for a refusal answered with HTTP 500 INTERNAL_ERROR.
- A removal refused with HTTP 400 VALIDATION_ERROR states that nothing was removed.
- A removal refused with HTTP 500 INTERNAL_ERROR states that nothing was removed.
- A removal refused with an error code the surface does not recognise states that
  nothing was removed.
- The statement for a refusal with an error code the surface does not recognise differs
  from the statement for a CapabilityCitedByEvidenceError refusal.
- While the removal has not been answered, the surface states neither success nor
  refusal.
depends_on:
- task/capability-removal/capability-removal-control
- task/capability-removal/capability-cited-by-evidence-refusal-recognition
implements:
- rules/integration/a-submitted-removal-states-its-outcome-to-the-operator
- domain/integration/capability
- rules/integration/a-registered-capability-cited-by-evidence-is-never-removed
- constraints/a-successful-capability-removal-answers-with-no-content
- constraints/a-malformed-request-is-refused-with-a-validation-error
- constraints/a-domain-error-unmapped-by-status-is-refused-generically
---



## What it is
Success and refusal disclosure for the capability removal, built on the state kind the error-code map answers for the refusal.

## Notes
UNDERDETERMINED, from the specification — rules/integration/a-submitted-removal-states-its-outcome-to-the-operator requires a refusal to state which condition answered it, kept apart from every other condition and from the unrecognised case. No criterion here keeps HTTP 400 VALIDATION_ERROR apart from HTTP 500 INTERNAL_ERROR, or either apart from an unrecognised error code — criteria 6, 7 and 8 require only that nothing was removed. A reading that would still pass every criterion: The surface shows one identical statement, "The removal failed; nothing was removed", for HTTP 400, HTTP 500 and any unrecognised code, and a different statement only for CapabilityCitedByEvidenceError.
UNDERDETERMINED, from the specification — rules/integration/a-submitted-removal-states-its-outcome-to-the-operator requires a successful removal to state that the identity is no longer registered. Criterion 1 asks only that the removal be stated as success naming the name and version, not that it says the identity is no longer registered. A reading that would still pass every criterion: A success statement that names the name and version but does not say the identity is no longer registered, for example a generic "Done: billing-lookup 1.0".
REMAINDER, from the specification — The concept and connector-configuration clauses of rules/integration/a-submitted-removal-states-its-outcome-to-the-operator reach no criterion of this capability-only task. It belongs to: The sibling tasks that disclose the answered outcome of a concept removal and of a connector configuration removal.
REMAINDER, from the specification — The clauses of rules/integration/a-registered-capability-cited-by-evidence-is-never-removed that decide what the api does (the removal succeeding unless evidence names the capability, the HTTP 409 refusal, and the unregistered-identity branch) reach no criterion here; this task only reads the refusal the api answers. It belongs to: The remove-capability route's own implementation in the capability registry (backend), alongside constraints/a-successful-capability-removal-answers-with-no-content's own HTTP 204 no-body answer.
REMAINDER, from the specification — No criterion reaches rules/integration/a-removal-surface-offers-a-control-behind-a-further-explicit-act (the remove control, the asking that issues nothing, issuing only on a further explicit act, and the capability standing unchanged without that act). This task assumes a removal has already been issued. It belongs to: The task that offers the remove control on the single-capability surface and gates remove-capability behind a further explicit act.
REMAINDER, from the specification — No criterion reaches the clause of rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing that sends a successful capability removal to the capabilities listing and never to the removed identity's surface. It belongs to: The task that navigates the operator to the capabilities listing after a successful capability removal.
ADVISORY, from the specification — constraints/the-capability-identity-read-refuses-an-unregistered-identity is about read-capability-by-identity, not remove-capability; rules/integration/a-registered-capability-cited-by-evidence-is-never-removed states that a removal of an unregistered identity answers HTTP 204, never refused, so no outcome this task discloses comes from that constraint. It becomes relevant only to what the removed identity's surface answers afterwards, the landing task's concern.
