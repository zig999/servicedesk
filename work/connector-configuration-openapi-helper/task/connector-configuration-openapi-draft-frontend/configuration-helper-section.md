---
title: Offer the Configuration Helper beneath the Configuration field
summary: The helper section rendered inline in ConnectorConfigurationFormFields beneath the Configuration field, holding the document-link control, the operation-naming controls and the control that requests the draft, on the create screen and the ready detail view alike.
rationale: I cut the offer away from the disclosure of what comes back because they are two outcomes with two reasons to change -- the offer changes with what the operation's request names, the disclosure with what the draft value object holds -- and the offer is demonstrable with no draft ever answered.
sources:
  - intake/frontend-scope.md
depends_on:
  - task/connector-configuration-openapi-draft-frontend/openapi-draft-request
objective: A surface authoring or editing a connector configuration offers, beneath its Configuration field, a Configuration Helper through which the operator names an OpenAPI document link and one operation of it and requests a draft generated from it.
criteria:
  - On the connector configuration create screen, the Configuration Helper section is rendered beneath the Configuration field.
  - On the ready detail view of a registered connector configuration, the Configuration Helper section is rendered beneath the Configuration field.
  - The section is rendered inline within the same form that holds the Configuration field, on no screen of its own and in no dialog of its own.
  - The section offers a control in which the operator states the OpenAPI document link.
  - The section offers controls in which the operator names one operation of that document by its path and its HTTP method.
  - The section offers a control whose act dispatches the draft request with the stated link and named operation.
  - Nothing the section offers submits the surface's form or invokes its save path, so requesting a draft leaves every registered connector configuration exactly as it stood.
  - The Connector field, the Configuration field and the form's existing action footer remain present and reachable by their existing labels on both screens.
implements:
  - rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper
  - contracts/integration/connector-configuration-draft
  - constraints/the-openapi-document-is-fetched-by-the-backend
  - domain/integration/connector-configuration
---

## What it is

The operator's way in to the helper, on the one surface they already author or edit a connector configuration from.
It offers the naming of a document and an operation, and the act that asks for a draft.

## Notes

constraints/the-openapi-document-is-fetched-by-the-backend forbids this section from fetching the document, and the impact set publishes no operation that lists a document's operations, so the operation is named by the operator rather than picked from a list read out of the document.
ConnectorConfigurationFormFields is shared by both screens and already covered by its own specs and both screens' specs, at frontend/app/src/routes/connector-configuration-form-fields-action-footer.spec.ts, frontend/app/src/routes/connector-configuration-create-screen.spec.ts and frontend/app/src/routes/connector-configuration-detail-screen.spec.ts.
REMAINDER, from the specification — rules/integration/a-refused-draft-request-states-its-refusal-to-the-operator reaches no criterion of this task, which offers the controls but does not present an answer; confirmed unchanged on re-bind after that rule was added to the epic's covers. Belongs to the disclosure task.
REMAINDER, from the specification — rules/integration/applying-a-drafted-configuration-changes-only-the-local-edit and rules/integration/an-unsaved-edit-is-not-overwritten-by-applying-a-draft-without-confirmation, together with their scenario, reach no criterion here. Belongs to the apply and confirmation tasks.
ADVISORY, from the specification — domain/integration/connector-configuration-draft and its four value objects are neighbours this task does not present; the seam is the dispatched request, and what the section does with the answer is another task's.
