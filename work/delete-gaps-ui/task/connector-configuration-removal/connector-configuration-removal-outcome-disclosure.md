---
title: Disclose the answered outcome of a connector configuration removal
summary: What the connector configuration's surface tells the operator once remove-connector
  has answered a removal it issued, and what it withholds while the answer is pending.
rationale: Cut apart from the control because what the operator is told changes with
  the disclosure rule, while the gate changes with the removal-control rule.
sources:
- work/delete-gaps-ui/intake/scope.md
objective: The connector configuration's surface states to the operator the outcome
  remove-connector answered for a removal it issued.
criteria:
- A removal answered with HTTP 204 is stated as success naming the removed connector's
  name.
- A removal refused with HTTP 400 VALIDATION_ERROR states that nothing was removed.
- A removal refused with HTTP 500 INTERNAL_ERROR states that nothing was removed.
- A removal refused with an error code the surface does not recognise states that
  nothing was removed.
- While the removal has not been answered, the surface states neither success nor
  refusal.
depends_on:
- task/connector-configuration-removal/connector-configuration-removal-control
implements:
- rules/integration/a-submitted-removal-states-its-outcome-to-the-operator
- domain/integration/connector-configuration
- constraints/a-successful-connector-configuration-removal-answers-with-no-content
- constraints/a-malformed-request-is-refused-with-a-validation-error
- constraints/a-domain-error-unmapped-by-status-is-refused-generically
---



## What it is
Success and refusal disclosure for the connector configuration removal.

## Notes
UNDERDETERMINED, from the specification — The three refusal criteria (HTTP 400, HTTP 500, unrecognised code) each ask only that the surface states that nothing was removed; none asks it to say which refusal answered, or to keep the three conditions apart from each other, as rules/integration/a-submitted-removal-states-its-outcome-to-the-operator requires. A reading that would still pass every criterion: A surface that shows the same message, "Nothing was removed", for a 400, a 500 and any unrecognised error code, and never says which condition refused the removal.
UNDERDETERMINED, from the specification — The success criterion asks only that a success statement name the connector; it does not ask the surface to say the connector name is no longer registered, as the rule requires. A reading that would still pass every criterion: A surface that shows "Request for connector 'x' completed successfully" on a 204 and never says that no configuration is now registered under 'x'.
REMAINDER, from the specification — The concept and capability clauses of rules/integration/a-submitted-removal-states-its-outcome-to-the-operator reach no criterion of this connector-only task. It belongs to: The tasks that state the answered outcome of a concept removal and of a capability removal to the operator.
REMAINDER, from the specification — The statement of rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing (landing on the matching listing, never the removed identity's surface) reaches no criterion here. It belongs to: The task that decides where the operator lands after a successful connector configuration removal, and its concept and capability counterparts.
REMAINDER, from the specification — The clauses of rules/integration/a-removal-surface-offers-a-control-behind-a-further-explicit-act (the removal control, the asking that issues nothing, issuing only on a further explicit act, the configuration standing unchanged otherwise) reach no criterion here. It belongs to: The task that offers the removal control and gates remove-connector behind the further explicit act, and its concept and capability counterparts.
REMAINDER, from the specification — The clauses of rules/integration/removing-a-connector-configuration-is-unconditional (success whether or not a capability names the connector, no refusal when nothing is registered under the name, every configuration left as it stood) reach no criterion here; the only part the surface sees, that a 204 means success on both branches, is already carried by constraints/a-successful-connector-configuration-removal-answers-with-no-content. It belongs to: The remove-connector api route (the backend removal act), not the operator surface.
REMAINDER, from the specification — The statement of rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused governs read-connector-configuration, not remove-connector, and reaches no criterion here. It belongs to: The read-connector-configuration route and the connector configuration surface's own handling of a refused read; after a successful removal, that refused read is what the landing rule avoids.
ADVISORY, from the specification — The success statement this task states has to remain readable through the navigation the landing task performs on the same success; this task and the landing task need to agree on where the statement is made.
ADVISORY, from the specification — No candidate says what the operator is told when a removal request fails in transport and no api answer ever arrives, or when a failure response carries no error code at all (distinct from an unrecognised code). Neither case is reached by any criterion, so neither blocks this task; both are silences next to its scope.
