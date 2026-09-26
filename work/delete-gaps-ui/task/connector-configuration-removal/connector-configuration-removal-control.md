---
title: Connector configuration removal control behind a further explicit act
summary: A removal control on the connector configuration detail screen that asks
  for confirmation and issues remove-connector only when the operator confirms.
rationale: Cut as its own task because the gate the removal-control rule states can
  be shown met without any outcome disclosed or any landing taken, and the disclosure
  and the landing build on the DELETE this task issues.
sources:
- work/delete-gaps-ui/intake/scope.md
objective: The connector configuration's surface offers a removal whose DELETE request
  is issued only on a further explicit act by the operator.
criteria:
- The connector configuration's surface at /connectors/:connector offers a removal
  control for the configuration it presents.
- Taking the removal control asks whether the configuration's removal is to be performed.
- Taking the removal control issues no DELETE request.
- Confirming the removal in the further act issues one DELETE request to /v1/connectors/:connector
  carrying the presented configuration's connector name.
- Declining the further act issues no DELETE request.
- After the further act is declined, the surface still presents the configuration
  unchanged under the same connector name.
- The further act does not ask the operator to type the connector's name.
- The removal control is not withheld where a capability names the connector as its
  own.
implements:
- domain/integration/connector-configuration
- rules/integration/a-removal-surface-offers-a-control-behind-a-further-explicit-act
- rules/integration/removing-a-connector-configuration-is-unconditional
---



## What it is
A removal control in the `ButtonFooter` of frontend/app/src/routes/connector-configuration-detail-screen.tsx, with its mutation in frontend/app/src/hooks/use-connector-configuration-detail.ts and its view state in frontend/app/src/hooks/use-connector-configuration-detail-view.ts.

## Notes
UNDERDETERMINED, from the specification — Two cases are not "declining" and no criterion addresses either: the operator dismisses the confirmation some other way (Escape, clicking outside it), or leaves the surface while the question is still open. rules/integration/a-removal-surface-offers-a-control-behind-a-further-explicit-act requires the removal to be issued only where the operator states in a further explicit act that it is to be performed, and requires the configuration to stand unchanged otherwise. A reading that would still pass every criterion: A surface that sends the DELETE when the operator confirms and sends none when the operator picks decline, but treats a dismissal without an explicit choice as confirmation and sends the DELETE then.
ADVISORY, from the specification — Neither route path (/connectors/:connector, /v1/connectors/:connector) is stated by any candidate; the specification names only the operation remove-connector, and the decision log records that only the operation name was decided from the source material's stated path. The caller should confirm the paths against the delivered source rather than treat them as specified.
ADVISORY, from the specification — The rule says nothing about whether the removal control appears while the read has not yet answered, has failed, or found nothing registered under the name; the first criterion is read as holding only while a configuration is presented, and showing or hiding the control in those other states is left open by the specification.
REMAINDER, from the specification — The clauses of rules/integration/a-removal-surface-offers-a-control-behind-a-further-explicit-act covering a concept and a capability reach no criterion here; this task covers only the connector configuration. It belongs to: The sibling tasks for the concept and capability removal controls.
REMAINDER, from the specification — The clause of rules/integration/removing-a-connector-configuration-is-unconditional stating that a removal naming a connector with nothing registered under it is never refused, leaves every registration as it was, and gets the same answer as a removal that removed one, reaches no criterion; this task backs only the capability-naming clause, through its last criterion. It belongs to: The remove-connector HTTP route (the backend removal act), which answers this clause together with constraints/a-successful-connector-configuration-removal-answers-with-no-content.
REMAINDER, from the specification — The statement of rules/integration/a-submitted-removal-states-its-outcome-to-the-operator (state the success, the named refusal, or an unrecognised refusal; state neither before the api answers) reaches no criterion here. It belongs to: The task that states a submitted connector configuration removal's outcome on the detail surface.
REMAINDER, from the specification — The statement of rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing (a successful removal lands on the listing, never on /connectors/:connector) reaches no criterion here. It belongs to: The task that lands a successful connector configuration removal on the connector configurations listing.
REMAINDER, from the specification — The statement of rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused (a read by an unregistered name refused with HTTP 404 ConnectorConfigurationNotFoundError) reaches no criterion here; it does not cover offering or gating the removal. It belongs to: The read-connector-configuration route and the task presenting a connector name nothing is registered under.
ADVISORY, from the specification — This task implements none of constraints/a-successful-connector-configuration-removal-answers-with-no-content, constraints/a-domain-error-unmapped-by-status-is-refused-generically and constraints/a-malformed-request-is-refused-with-a-validation-error; they fix what the api answers, and no criterion here tests the answer.
