---
title: Land on the connectors listing after a successful removal
summary: 'Where the operator is taken once a connector configuration removal succeeds:
  the connectors listing, never the removed name''s surface.'
rationale: Cut apart from the gate and the disclosure because the landing rule changes
  independently of both.
sources:
- work/delete-gaps-ui/intake/scope.md
objective: After a successful connector configuration removal, the operator is on
  the connectors listing and never on the removed configuration's surface.
criteria:
- After a removal answered with HTTP 204, the operator is at /connectors.
- After a removal answered with HTTP 204, the operator is at /connectors even when
  navigation history holds an earlier entry.
- After a removal answered with HTTP 204, the connectors listing shows no row for
  the removed connector's name.
- After a removal answered with HTTP 204, the refusal of a read of the removed connector's
  name is never shown.
depends_on:
- task/connector-configuration-removal/connector-configuration-removal-control
implements:
- rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing
- domain/integration/connector-configuration
- constraints/a-successful-connector-configuration-removal-answers-with-no-content
---



## What it is
A navigation to /connectors on a successful removal from the connector configuration's surface.

## Notes
UNDERDETERMINED, from the specification — Every criterion starts from "a removal answered with HTTP 204"; none says what happens when the removal is refused or has not been answered yet, so an implementation that navigates whatever the answer, or before the answer, passes every criterion. A reading that would still pass every criterion: Navigating to /connectors as soon as the removal is issued, or on any answer including an HTTP 400 or HTTP 500 refusal, ending the operator on the listing with no read refusal shown even though the removal was refused or unanswered.
UNDERDETERMINED, from the specification — This task's criteria move the operator off the issuing surface on HTTP 204 but never require the success statement (that the name is no longer registered) to survive the move; the landing and the statement have to be coordinated with the outcome-disclosure task. A reading that would still pass every criterion: On HTTP 204, navigating straight to /connectors and dropping the issuing surface's state, so the operator never sees the success statement.
ADVISORY, from the specification — The path /connectors in criteria 1 and 2 is stated by no candidate; the rule names the destination only as the listing list-connector-configurations answers.
ADVISORY, from the specification — Which page of the paged listing the operator lands on is left to constraints/listings-are-paged, which is outside this epic's claim; this task sets no page.
REMAINDER, from the specification — The concept and capability clauses of rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing reach no criterion here. It belongs to: The tasks landing a successful concept removal and a successful capability removal on their own listings.
REMAINDER, from the specification — Every clause of rules/integration/a-removal-surface-offers-a-control-behind-a-further-explicit-act reaches no criterion here. It belongs to: The task offering the removal control and its further explicit act on the single connector configuration surface, plus the matching concept and capability tasks.
REMAINDER, from the specification — The refusal clauses of rules/integration/a-submitted-removal-states-its-outcome-to-the-operator reach no criterion here. It belongs to: The task stating a submitted connector configuration removal's outcome to the operator, plus the matching concept and capability tasks.
REMAINDER, from the specification — The clauses of rules/integration/removing-a-connector-configuration-is-unconditional reach no criterion here; the only part this task depends on, that both branches answer alike, is already carried by constraints/a-successful-connector-configuration-removal-answers-with-no-content as HTTP 204 with an empty body. It belongs to: The remove-connector operation of the publishing api (the backend removal act).
REMAINDER, from the specification — The statement of rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused is not implemented by this task; criterion 4 only keeps that refusal from being shown after a successful removal, which the landing rule carries by citing the read rule. It belongs to: The read-connector-configuration operation of the publishing api and the single connector configuration surface's own miss handling.
